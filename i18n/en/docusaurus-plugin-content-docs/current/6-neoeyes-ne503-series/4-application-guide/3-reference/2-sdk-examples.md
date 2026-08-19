---
description: NE503 Python SDK practical examples — complete mini-apps for AI inference, event handling, device control, and multi-scenario orchestration.
keywords: [NE503, SDK examples, Python, AI inference, event handling, container app]
tags: [application development, NE503, SDK, examples]
---

# SDK Examples

This page walks through 4 progressively deeper mini-apps demonstrating typical usage of `hailo_ipc_sdk`. For SDK API details, see [SDK Reference](./1-sdk-reference.md); for project structure and the build/deploy flow, see [App Reference](./0-app-reference.md).

:::warning Replace with your device's real stream and model names
The `STREAM` and `MODEL` in the examples below are placeholder constants. Before deploying, you **must** look up the real values on the device and fill them into `app.py` and `app.yaml`, otherwise inference subscription will hang forever or fail with `NOT_FOUND` due to stream/model mismatch:

```python
from hailo_ipc_sdk import InferenceClient, FdMediaClient
print(InferenceClient().list_models())   # e.g. ['hailo_yolov8n_384_640']
print(FdMediaClient().list_streams())    # e.g. ['main', 'sub']
```

Key conventions (inference must use the `sub` stream; model names and permissions must match the device and mirror each other across `app.py`/`app.yaml`) are in [Person Detection §2.3](../2-cookbook/1-person-detection.md#23-query-real-values-on-the-device).
:::

## 1. Real-Time Object Detection Counter

:::note Full on-device version
This is the minimal inference subscription pattern. For the full on-device version (model/stream discovery, health check, graceful shutdown, web verification), see the [Person Detection recipe](../2-cookbook/1-person-detection.md).
:::

**Scenario**: subscribe to the AI inference stream, count detections per label in each frame, and print a summary at a fixed interval.

**Core API**: `InferenceClient.subscribe()` iterator, `InferenceResult.count_by_label()`

**Code** (`app.py`):

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("object-counter")

# ── Config ─────────────────────────────────────────────────────────────
STREAM = "sub"                  # video stream ID (inference must use sub; confirm with list_streams())
MODEL = "hailo_yolov8n_384_640"  # inference model (look up the real name with list_models())
FPS = 10                        # subscription framerate
REPORT_INTERVAL = 5.0           # summary print interval (seconds)

# ── Main logic ──────────────────────────────────────────────────────────
def main():
    inference = InferenceClient()
    last_report = time.monotonic()
    frame_count = 0

    logger.info("Connecting to inference service...")
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        frame_count += 1

        # Print a summary every REPORT_INTERVAL seconds
        now = time.monotonic()
        if now - last_report >= REPORT_INTERVAL:
            labels = {obj.label for obj in result.objects}
            counts = {label: result.count_by_label(label) for label in labels}
            infer_ms = result.infer_time_us / 1000
            logger.info(
                "seq=%d | frames=%d | objects=%d | counts=%s | infer=%.1fms",
                frame_seq, frame_count, len(result.objects), counts, infer_ms,
            )
            last_report = now

if __name__ == "__main__":
    main()
```

**app.yaml**:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: object_counter
  name: Object Counter
  version: 1.0.0
  description: Subscribe to the inference stream and count objects

spec:
  image: aipc/object_counter:1.0.0
  resources:
    cpu: "30%"
    memory: "128Mi"

  permissions:
    video:
      - sub.raw                 # inference subscription requires the raw stream (sub publishes NV12 frames)
    inference:
      models: [hailo_yolov8n_384_640]
```

**Run**:

```bash
aipc-cli app install app.yaml object_counter.tar
aipc-cli app start object_counter
aipc-cli app logs object_counter --follow
```

**Result**:

After connecting to the inference service, the app prints a summary every `REPORT_INTERVAL` seconds, like:

```
[object-counter] seq=50 | frames=50 | objects=3 | counts={'person': 2, 'car': 1} | infer=4.2ms
```

`counts` is the per-label detection count for the current frame, and `infer` is the single-frame inference latency; when no one is in frame, `objects=0`.

---

## 2. Smart Event Linkage — Person Detected Triggers Alert

**Scenario**: when a person is detected in the inference result, publish an alert via the event bus; also subscribe to acknowledgement events from other apps to enable cross-app linkage.

**Core API**: `InferenceClient.subscribe()` + `EventClient.publish()` / `EventClient.on_event()`

**Code** (`app.py`):

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient, EventClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("person-alert")

APP_ID = "person_alert"

# ── Config ─────────────────────────────────────────────────────────────
STREAM = "sub"                    # inference must use sub
MODEL = "hailo_yolov8n_384_640"   # look up the real name with list_models()
FPS = 15
SCORE_THRESHOLD = 0.8        # confidence threshold
COOLDOWN_SECONDS = 5.0       # alert cooldown

# ── Callback: listen for ack events ─────────────────────────────────────
def on_ack(event):
    ack_source = event.payload.get("source", "unknown")
    logger.info("Received ACK from %s for alert %s", ack_source, event.payload.get("alert_id"))

# ── Main logic ──────────────────────────────────────────────────────────
def main():
    inference = InferenceClient()
    events = EventClient()

    # Background listener for acknowledgement events
    events.on_event(f"app/{APP_ID}/alert_ack", on_ack)

    last_alert_time = 0.0
    alert_count = 0

    logger.info("Starting person alert app...")
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        persons = result.get_objects_by_label("person")
        high_conf = [p for p in persons if p.score >= SCORE_THRESHOLD]

        if not high_conf:
            continue

        now = time.time()
        if now - last_alert_time < COOLDOWN_SECONDS:
            continue

        alert_count += 1
        alert_id = f"alert-{alert_count:04d}"

        events.publish(f"app/{APP_ID}/person_detected", {
            "alert_id": alert_id,
            "frame_sequence": frame_seq,
            "person_count": len(high_conf),
            "scores": [round(p.score, 3) for p in high_conf],
            "bboxes": [p.bbox.to_xywh() for p in high_conf],
        }, persistent=True)

        logger.info(
            "Alert %s: %d person(s) at frame %d",
            alert_id, len(high_conf), frame_seq,
        )
        last_alert_time = now

if __name__ == "__main__":
    main()
```

**app.yaml**:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: person_alert
  name: Person Alert
  version: 1.0.0
  description: Publish a persistent alert event when a person is detected

spec:
  image: aipc/person_alert:1.0.0
  resources:
    cpu: "30%"
    memory: "128Mi"

  permissions:
    video:
      - sub.raw                   # inference subscription requires the raw stream
    inference:
      models: [hailo_yolov8n_384_640]
    events:
      publish: [app/person_alert/*]
      subscribe: [app/person_alert/*]
```

**Run**:

```bash
aipc-cli app install app.yaml person_alert.tar
aipc-cli app start person_alert
aipc-cli app logs person_alert --follow
```

**Result**:

The app subscribes to the inference stream on startup; when a person with confidence ≥ `SCORE_THRESHOLD` is detected, it publishes a persistent alert event and does not re-alert within the `COOLDOWN_SECONDS` cooldown window. Logs look like:

```
[person-alert] Alert alert-0001: 2 person(s) at frame 105
[person-alert] Received ACK from dashboard for alert alert-0001
```

The second line shows that another app (e.g. dashboard) subscribed to `app/person_alert/alert_ack` and replied with an acknowledgement — cross-app linkage is working.

---

## 3. Day/Night Adaptive Control — Switch Device Based on Detection

**Scenario**: when a person is detected, automatically turn on the fill light and switch to day mode (IR-CUT); when no one is present, turn off the fill light and switch to night mode (IR LED). Hardware linkage via `DeviceClient`.

**Core API**: `InferenceClient.subscribe()` + `DeviceClient` light/IR-CUT control + `DeviceClient.get_device_status()`

**Code** (`app.py`):

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient, DeviceClient, DeviceStatus, IrCutMode

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("daynight-control")

# ── Config ─────────────────────────────────────────────────────────────
STREAM = "sub"                    # inference must use sub
MODEL = "hailo_yolov8n_384_640"   # look up the real name with list_models()
FPS = 5
LIGHT_LEVEL_DAY = 80          # day fill-light brightness (0-255)
NO_PERSON_TIMEOUT = 30.0      # no-person timeout to switch to night (seconds)

# ── Main logic ──────────────────────────────────────────────────────────
def main():
    inference = InferenceClient()
    device = DeviceClient()

    is_day_mode = False
    last_person_time = 0.0

    # Read initial status
    status = device.get_device_status()
    logger.info(
        "Device init: soc_temp=%.1fC, ircut=%s, light=%d",
        status.soc_temp_c, status.ircut_mode.name, status.white_light_level,
    )

    logger.info("Starting day/night adaptive control...")
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        now = time.time()
        has_person = result.has_person()

        # Update the last time a person was detected
        if has_person:
            last_person_time = now

        # ── Switch to day mode ──
        if has_person and not is_day_mode:
            device.set_ircut(IrCutMode.DAY)
            device.set_white_light(LIGHT_LEVEL_DAY)
            device.set_ir_led(False)
            is_day_mode = True
            logger.info("Switched to DAY mode (person detected at frame %d)", frame_seq)

        # ── Switch to night mode after timeout ──
        elif not has_person and is_day_mode and (now - last_person_time) >= NO_PERSON_TIMEOUT:
            device.set_ircut(IrCutMode.NIGHT)
            device.set_white_light(0)
            device.set_ir_led(True)
            is_day_mode = False
            logger.info("Switched to NIGHT mode (no person for %.0fs)", NO_PERSON_TIMEOUT)

if __name__ == "__main__":
    main()
```

**app.yaml**:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: daynight_control
  name: Day/Night Adaptive Control
  version: 1.0.0
  description: Auto-switch day/night mode based on person detection

spec:
  image: aipc/daynight_control:1.0.0
  resources:
    cpu: "20%"
    memory: "128Mi"

  permissions:
    video:
      - sub.raw                   # inference subscription requires the raw stream
    inference:
      models: [hailo_yolov8n_384_640]
    device:
      light: true
      ir_cut: true
```

**Run**:

```bash
aipc-cli app install app.yaml daynight_control.tar
aipc-cli app start daynight_control
aipc-cli app logs daynight_control --follow
```

**Result**:

On startup the app reads and prints the device's initial status (SoC temperature, IR-CUT mode, fill-light brightness). When a person is detected it switches to day mode (IR-CUT DAY + fill light); after `NO_PERSON_TIMEOUT` consecutive seconds with no person it switches back to night mode (IR-CUT NIGHT + IR LED). Logs look like:

```
[daynight-control] Device init: soc_temp=42.3C, ircut=NIGHT, light=0
[daynight-control] Switched to DAY mode (person detected at frame 50)
[daynight-control] Switched to NIGHT mode (no person for 30s)
```

---

## 4. Multi-Stream Frame Capture — Save the Frame for a Detection

**Scenario**: when the inference result contains a specific label, use `FdMediaClient` to grab the corresponding raw frame image and save it to a file. Demonstrates the inference stream and video stream working together.

**Core API**: `InferenceClient.subscribe()` + `FdMediaClient.get_frame()` + `Frame.save()`

**Code** (`app.py`):

```python
import time
import logging
from hailo_ipc_sdk import InferenceClient, FdMediaClient

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("frame-capture")

# ── Config ─────────────────────────────────────────────────────────────
STREAM = "sub"                    # both inference and get_frame() use this raw stream
MODEL = "hailo_yolov8n_384_640"   # look up the real name with list_models()
FPS = 10
TARGET_LABELS = {"person", "car"}    # target labels that trigger a save
CAPTURE_DIR = "/app/data/captures"   # save directory (must be a mounted volume in app.yaml)
CAPTURE_COOLDOWN = 10.0              # min save interval per label (seconds)

# ── Main logic ──────────────────────────────────────────────────────────
def main():
    inference = InferenceClient()
    media = FdMediaClient()

    last_capture = {}     # label -> timestamp
    capture_count = 0

    logger.info("Starting frame capture for labels: %s", TARGET_LABELS)
    for frame_seq, result in inference.subscribe(stream=STREAM, model=MODEL, fps=FPS):
        now = time.time()
        matched_labels = {obj.label for obj in result.objects if obj.label in TARGET_LABELS}

        for label in matched_labels:
            # Cooldown check
            if now - last_capture.get(label, 0) < CAPTURE_COOLDOWN:
                continue

            # Get the current frame
            frame = media.get_frame(STREAM, timeout_ms=2000)
            if frame is None:
                logger.warning("Failed to get frame for seq=%d", frame_seq)
                continue

            # Save to file
            capture_count += 1
            filename = f"{CAPTURE_DIR}/{label}_{frame_seq}_{int(now)}.png"
            frame.save(filename)

            logger.info(
                "Captured %s: seq=%d, %dx%d %s -> %s",
                label, frame_seq, frame.width, frame.height, frame.format, filename,
            )
            last_capture[label] = now

if __name__ == "__main__":
    main()
```

**app.yaml**:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: frame_capture
  name: Frame Capture
  version: 1.0.0
  description: Save the corresponding frame image when a specific target is detected

spec:
  image: aipc/frame_capture:1.0.0
  resources:
    cpu: "50%"
    memory: "256Mi"

  permissions:
    video:
      - sub.raw                       # FdMediaClient.get_frame() accesses the raw stream
    inference:
      models: [hailo_yolov8n_384_640]

  volumes:
    - host: /data/aipc/data/frame_capture
      container: /app/data/captures
      readonly: false
```

**Run**:

```bash
aipc-cli app install app.yaml frame_capture.tar
aipc-cli app start frame_capture
aipc-cli app logs frame_capture --follow
```

**Result**:

The app subscribes to the inference stream; when a result contains a label in `TARGET_LABELS`, it uses `FdMediaClient.get_frame()` to grab the corresponding raw frame and saves it as a PNG to `CAPTURE_DIR` (must be a mounted volume in `app.yaml`). The same label is saved at most once per `CAPTURE_COOLDOWN` seconds. Logs look like:

```
[frame-capture] Captured person: seq=70, 1920x1080 RGB -> /app/data/captures/person_70_<ts>.png
```

The filename contains the label, frame sequence, and timestamp, for later inspection.

---

## 5. Run & Debug

### 5.1 General Deployment Flow

All mini-apps share the same build and deploy workflow as the tutorials: use the repo's bundled `build.sh` to do it in one step (copy SDK → ARM64 buildx → save → package into `.aipc`), then deploy to the device via the web console, aipc-cli, or HTTP. For the full steps, see [Hello World §3 Build the Image](../1-app-development/1-hello-world.md#3-build-the-image) and [§4 Deploy to the Device](../1-app-development/1-hello-world.md#4-deploy-to-the-device); for build/deploy errors, see the [Troubleshooting FAQ](../../5-troubleshooting.md).

### 5.2 Logs, Common Issues & Debugging

- **Log viewing & startup verification**: see [Hello World §5 Start & Verify](../1-app-development/1-hello-world.md#5-start-and-verify);
- **Common error troubleshooting** (inference failure, permission denied, OOM, etc.): see the [Troubleshooting FAQ](../../5-troubleshooting.md);
- **Debug env vars** (`DEBUG`, `LOG_LEVEL`): see [App Reference §7 Environment Variable Reference](./0-app-reference.md#7-environment-variable-reference).

---

## 6. Related Docs

- [App Reference](./0-app-reference.md) — project setup, app.yaml config, full build/deploy flow
- [SDK Reference](./1-sdk-reference.md) — detailed API for all SDK modules
- [Platform Architecture](../../3-software-guide/0-system-architecture.md) — overall NE503 software platform architecture and service topology