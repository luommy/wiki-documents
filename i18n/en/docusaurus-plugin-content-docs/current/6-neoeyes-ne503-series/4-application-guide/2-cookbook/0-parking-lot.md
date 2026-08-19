---
id: parking-lot
title: Parking Lot
description: A multi-model edge AI app on NE503 using a parking-lot scenario — vehicle detection, depth anti-spoofing, and license-plate recognition configured, deployed, verified, and publishing events.
keywords: [NE503, Parking Lot, vehicle detection, license plate recognition, anti-spoofing, Event Bus, Cookbook]
tags: [NE503, application development, Cookbook, vehicle detection, event integration]
---

# Parking Lot

This recipe uses the Parking Lot Showcase from `camthink-ai/neoruntime-apps` to walk through a multi-model edge AI app end to end: from `app.yaml` permission and model declarations, deploying the container, opening the app's web UI, to verifying vehicle detection events from the Event Bus.

> **Verification record**: The results in this recipe come from NE503 test device `192.168.93.50`, last re-tested on the 2026-08-18 firmware (the ai-runtime deployed on 08-07 had an inference regression — single-shot success rate only ~6%; on 08-17 verification, vehicle detections were intermittent at 0–2; after the 08-18 firmware fix, re-test showed zero inference failures and vehicles consistently detected at 6–8). The app pulls frames via `sub.raw`. No test frame ever recognized a license plate or triggered an anti-spoof alert, so this recipe does not present license-plate recognition as a passed result.

## 1. Goal

After completing this recipe, you can:

- Deploy the Parking Lot Showcase and open its web UI in a browser;
- Understand how vehicle detection, depth anti-spoofing, and license-plate recognition interact within a single app;
- Receive app events via the `parking/vehicles`, `parking/plates`, and `parking/alerts` topics;
- Use the live preview, model status, and WebSocket events on the device to confirm the app is actually running — not just that the container started.

This is a reproducible project recipe, not a general API reference for the four models. For REST, WebSocket, MQTT bridging, and auth formats, see [Event Integration](../3-reference/5-event-integration.md).

## 2. Model & Data Flow

### 2.1 Models Used

The manifest declares and registers these four models at startup:

| Model ID | Purpose | Input format & size | Verification status |
|:---|:---|:---|:---|
| `yolov5m_vehicles` | Vehicle detection | RGB, 1920 × 1080 | Successfully detected vehicles |
| `scdepthv3` | Depth-based anti-spoof assist | RGB, 320 × 256 | Registered and in the pipeline |
| `license_plate_det` | License-plate region detection | RGB, 416 × 416 | Registered; no plate results in test frames |
| `plate_recognition` | License-plate character recognition | NV12, 320 × 48 | Registered; no plate results in test frames |

Model files are read by the app from the device model directory:

```text
/data/aipc/models/detection/yolov5m_vehicles.hef
/data/aipc/models/depth/scdepthv3.hef
/data/aipc/models/detection/tiny_yolov4_license_plates.hef
/data/aipc/models/ocr/paddle_ocr_v5_mobile_recognition_nv12.hef
```

The `allow_register_model: true` in the manifest lets the app dynamically register the models it needs with AI Runtime at startup. If `license_plate_det` or `plate_recognition` are temporarily absent from the device's model list, don't jump to a code error: first check that the app has started, then look at the model registration results and model file paths in the app logs.

### 2.2 From Video to Event

The data flow simplifies to:

```text
NE503 camera
    ↓
sub.raw raw frames
    ↓
Parking Lot app capture thread
    ├─ yolov5m_vehicles → vehicle bbox & confidence
    ├─ scdepthv3         → depth anti-spoof score
    └─ plate detection → plate recognition → plate text
    ↓
App Web UI (MJPEG + SSE)
    ↓
Event Bus
    ├─ parking/vehicles
    ├─ parking/plates
    └─ parking/alerts
```

`app.yaml` grants the app only the `sub.raw` video permission and defaults `STREAM_ID` to `sub`. The source uses separate preview and inference media clients; the inference thread probes available streams based on model input size — `main`, `sub`, or `third` are not fixed values the user must change. As long as the manifest permissions, device streams, and model input sizes match, the app can capture and infer.

## 3. Configuration

### 3.1 Application Manifest

The relevant excerpt from `showcases/parking-lot/app.yaml`:

```yaml
spec:
  image: parking-lot:1.0.0

  permissions:
    video:
      - sub.raw

    inference:
      models:
        - yolov5m_vehicles
        - scdepthv3
        - license_plate_det
        - plate_recognition
      max_qps: 25
      max_concurrent: 4
      allow_register_model: true

    events:
      publish:
        - parking/vehicles
        - parking/plates
        - parking/alerts
      subscribe:
        - system/*

    network:
      mode: host

  env:
    - name: STREAM_ID
      value: "sub"
    - name: TARGET_FPS
      value: "20"
    - name: VEHICLE_MODEL
      value: "yolov5m_vehicles"
    - name: DEPTH_MODEL
      value: "scdepthv3"
    - name: PLATE_DET_MODEL
      value: "license_plate_det"
    - name: PLATE_REC_MODEL
      value: "plate_recognition"
    - name: HD_PREVIEW_ENABLED
      value: "0"
```

Key fields:

| Field | Purpose | Symptom if misconfigured |
|:---|:---|:---|
| `video: sub.raw` | grants the app access to sub-stream raw frames | app cannot get inference frames; logs show media or permission errors |
| `inference.models` | declares the models the app needs | undeclared or missing path → model registration fails |
| `allow_register_model` | lets the app register models dynamically at startup | set to `false`, the app cannot supplement registration per its config |
| `max_qps` / `max_concurrent` | limits the inference resources the app can use | quota too low → throughput drops or requests queue |
| `events.publish` | declares topics the app may publish | undeclared topic → insufficient publish permission |
| `network.mode: host` | lets the app web UI use the device network namespace | external access port and mapping change |

### 3.2 Preview Mode

The `platform-api` in the current shipping firmware only listens on the device-internal `127.0.0.1:8080`. The app's HD MSE preview directs the browser to `ws://<deviceIP>:8080/api/v1/h264/main`; an external browser cannot reach this loopback address, so the page shows a black preview area, and the current implementation does not fall back to MJPEG automatically.

So this recipe fixes:

```yaml
- name: PLATFORM_API_PORT
  value: "8080"
- name: HD_PREVIEW_ENABLED
  value: "0"
```

The web UI then uses the app's own MJPEG endpoint `http://<deviceIP>:8090/stream`. Re-enable HD preview once the HD address is exposed via nginx `:443` as `wss://`, or after the app adds a reliable failure fallback. `PLATFORM_API_TOKEN` can only be injected via the runtime environment at deploy time — never write a real token into the manifest or source.

## 4. Core Code

### 4.1 Registering Models

At startup the app iterates `MODEL_DEFS` and registers the four HEFs with AI Runtime. `yolov5m_vehicles` also carries its post-processing config to select the correct YOLO post-processing function; copying the model file to the device without registering the correct post-processing config can cause tensor-name mismatches or missing detection boxes.

The core logic:

```python
for model_id, model_def in MODEL_DEFS.items():
    infer_client.register_model(
        model_path=model_def["path"],
        model_id=model_id,
        owner_id=Config.get_app_id(),
        model_type=model_def.get("register_type", model_def["type"]),
        model_variant=model_def.get("variant"),
    )
```

The real source queries already-registered models first, skips redundant registration, and retries on failure. The snippet above illustrates the call relationship and should not replace the full implementation in the repo.

### 4.2 Publishing Business Events

After the pipeline finishes a frame, the app publishes results to three business topics:

```python
if result.vehicles:
    event_client.publish("parking/vehicles", [
        {
            "bbox": [float(c) for c in vehicle.bbox],
            "class": vehicle.class_name,
            "confidence": round(float(vehicle.confidence), 3),
        }
        for vehicle in result.vehicles
    ])

if result.plates:
    event_client.publish("parking/plates", [
        {
            "bbox": [float(c) for c in plate.bbox],
            "plate": plate.text,
            "confidence": round(float(plate.confidence), 3),
        }
        for plate in result.plates
    ])
```

The anti-spoof alert is published only when depth analysis produces an alert:

```json
{
  "type": "spoof_detected",
  "bbox": [120.0, 80.0, 420.0, 360.0],
  "vehicle_class": "vehicle",
  "reason": "depth score below threshold",
  "score": 0.018
}
```

The vehicle event payload is an array; example:

```json
[
  {
    "bbox": [120.0, 80.0, 420.0, 360.0],
    "class": "vehicle",
    "confidence": 0.82
  }
]
```

### 4.3 App Web UI

The app starts a web UI on port `8090` by default; main endpoints:

| Endpoint | Purpose |
|:---|:---|
| `/` | Parking Lot Monitor page |
| `/stream` | MJPEG live preview |
| `/api/stats` | FPS, inference latency, and resource stats |
| `/api/events` | SSE event stream used by the page |
| `/api/alerts` | current anti-spoof alert history |
| `/api/plates` | plate screenshots and recognition results |

The page SSE (`/api/events`) only serves the current web UI; to integrate with external business systems, subscribe to the device Event Bus WebSocket or use an in-device SDK bridge — do not treat the page SSE as a platform-level event interface.

## 5. Deployment

### 5.1 Get the App

Two options:

- **Use the Release bundle**: download `parking-lot-latest-arm64.tar.gz` from `neoruntime-apps` Releases; unzip to get `app.yaml` and `parking-lot-image.tar`;
- **Build from source**: clone `neoruntime-apps` and the sibling `neoruntime-sdks`, prepare the SDK wheel per the repo README, then build the showcase bundle.

Build from source with the repo's script:

```bash
cd neoruntime-apps/showcases/parking-lot
./build.sh arm64
```

Before building, confirm the manifest already uses `HD_PREVIEW_ENABLED: "0"`. Do not reuse an old bundle that still sets HD preview to `"1"`.

### 5.2 Install & Start

Upload `app.yaml` and `parking-lot-image.tar` to a temp directory on the device, then install on the device:

```bash
cd /tmp/parking-lot
sha256sum -c SHA256SUMS

aipc-cli app install app.yaml parking-lot-image.tar
```

Start the app via the device API:

```bash
curl -k -X POST \
  "https://<deviceIP>/api/v1/apps/parking_lot/start" \
  -H "Authorization: Bearer <session token>"
```

You can also start it from the web console under **App Management → Installed Apps**. A successful install does not mean the pipeline is working — proceed to the three checks in the next section.

### 5.3 Open the App Page

In a browser that can reach the device network, open:

```text
http://<deviceIP>:8090
```

On success you should see the `Parking Lot Monitor` page, live preview, and model stats cards. If the page loads but the preview is black, first confirm `HD_PREVIEW_ENABLED` is actually `0`, then confirm `/stream` keeps returning MJPEG frames.

## 6. Verification

### 6.1 Verify the Page & Live Preview

1. Refresh `http://<deviceIP>:8090` and wait for the page to fully load.
2. Confirm the preview area shows the real camera feed, not a solid black region.
3. Confirm the page shows `Active Models` and lists all four models.
4. Point the camera at vehicles and watch the `VEHICLES` count and on-frame detection boxes.
5. Record `FPS`, inference latency, and CPU/NPU status; these vary with scene, firmware, and device load — they are not fixed performance promises.

Actual page results on `192.168.93.50` during the 2026-08-18 firmware re-test:

- Preview is a real MJPEG feed, ~`22 FPS` in the page header (stable at this level across tests; this preview framerate is independent of inference throughput);
- current frame detected `6–8 vehicles` (on the 08-17 old firmware the same frame showed only 0–2 intermittently, due to the ai-runtime inference regression at the time, fixed in the 08-18 firmware);
- `Active Models` lists 4 models;
- `PLATES` is `0`, `ALERTS` is `0`;
- vehicle detection events are receivable from the Event Bus WebSocket (08-18 firmware re-test: zero inference failures, events produced continuously);
- no license plate was recognized in this frame, so plate OCR cannot be claimed as business-verified.

![Parking Lot Monitor live detection UI](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/cookbook/parking-lot/webui-dashboard.png)

### 6.2 Verify Event Output

Log in to the device for a one-time session token, then subscribe to events via the device event WebSocket:

```bash
curl -k -X POST https://<deviceIP>/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password"}'

npx -y wscat --no-check \
  -c 'wss://<deviceIP>/api/v1/events/stream?token=<session token>'
```

Point the camera at vehicles and you should see `parking/vehicles` with a payload containing `bbox`, `class`, and `confidence`. You will only see `parking/plates` when the frame actually contains a clear plate meeting model conditions; only see `parking/alerts` when the depth anti-spoof score is below threshold.

The current app event server subscribes to all topics and does not read the `topics` query parameter from the URL. During verification, do not mistake "no `parking/*` filter parameter" for a missed subscription; after receiving events, filter by the `topic` field in each message.

### 6.3 Verify App Status & Logs

```bash
curl -k https://<deviceIP>/api/v1/apps/parking_lot \
  -H "Authorization: Bearer <session token>"

curl -k "https://<deviceIP>/api/v1/apps/parking_lot/logs?tail=200" \
  -H "Authorization: Bearer <session token>"
```

Focus on:

- whether all four models completed registration;
- whether `Pipeline error`, media frame-capture failures, or model timeouts recur;
- whether the app restarted;
- when the web UI shows a feed but events are empty, whether the current frame simply does not meet plate or anti-spoof trigger conditions.

## 7. Common Errors

| Symptom | Check first | Fix |
|:---|:---|:---|
| Web UI opens but preview is solid black | is `HD_PREVIEW_ENABLED` `1`? is the browser trying to reach external `:8080`? | set the manifest to `HD_PREVIEW_ENABLED: "0"`, uninstall and reinstall with the new manifest; confirm `/stream` returns MJPEG |
| Page shows 0 models or model registration fails | model file paths, model IDs, `allow_register_model` | check the four HEFs under `/data/aipc/models` and the app logs; confirm the manifest declares four models |
| Vehicle frames but no `parking/plates` | the current plate is too small, occluded, or at an angle/lighting that fails detection | switch to a frame with a clear plate; do not treat an empty result as the OCR model not started |
| WebSocket receives no events | is the token valid? using `wss://`? connecting to external 443? | log in again for a fresh session token; use `/api/v1/events/stream`; for external access do not use the internal `127.0.0.1:50053` |
| Using `topics=parking/*` still no expected filtered results | the current app event server does not read that query parameter | subscribe to the full stream first, then filter by the `topic` field in messages |
| Container installed but page access fails | is the app started? is port 8090 reachable? is `network.mode` `host`? | check app status and logs; start the app; confirm you are hitting app port `8090`, not the platform-internal `8080` |
| Logs show token 401 | the session token expired due to password change or platform-api restart | call `/api/login` again for a new session token; do not hardcode old tokens in scripts |

## 8. Related Docs

- [SDK Workflow](../1-app-development/0-sdk-workflow.md) — Gen3 B-path app structure and build flow
- [App Reference](../3-reference/0-app-reference.md) — `app.yaml` permissions, lifecycle, and container constraints
- [Event Integration](../3-reference/5-event-integration.md) — WebSocket, MQTT, and HTTP integration
- [Version Compatibility Matrix](../../3-software-guide/5-version-matrix.md) — OS, platform, SDK, and model environment
- [Troubleshooting FAQ](../../5-troubleshooting.md) — SDK, container, and app runtime issues

---

**Doc version**: v1.0 · **Last updated**: 2026-08-18