---
description: NE503 Python SDK — pick and build four typical application patterns (real-time counting, event alerts, device control, cascade inference) with minimal skeletons; complete runnable source lives under examples/ in the neoruntime-apps repo.
keywords: [NE503, SDK examples, app patterns, InferenceClient, EventClient, DeviceClient, cascade inference]
tags: [app development, NE503, SDK, examples]
---

# SDK Examples

This page shows how to assemble `neoruntime_ipc_sdk` for the 4 most common scenarios. Pick a pattern from the [selection table](#1-the-four-patterns-choose-first), then follow the skeleton. **Complete, runnable source for every pattern lives under `examples/` in the `neoruntime-apps` repo** — copy and adapt it instead of re-typing full code here.

The `stream` and `model` in the skeletons are sample values — query the device's real ones before deploying (see [SDK Reference §3.2](./1-sdk-reference.md#32-dont-hardcode-stream-and-model-names)).

## 1. The Four Patterns (Choose First)

| # | Pattern | Typical use | Core API | Complete example in repo |
|:--|:--------|:------------|:---------|:-------------------------|
| 1 | Real-time inference counting | Count how often each target appears in the scene | `subscribe()` + `count_by_label()` | [examples/people-counting](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/people-counting/app.py) |
| 2 | Inference → event alerts | Publish an event when a target is detected, interlock with other apps | `subscribe()` + `EventClient.publish()` | [examples/object-detection](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/object-detection/app.py) |
| 3 | Inference → device control | Turn on the light / flip day-night based on detections | `subscribe()` + `DeviceClient` | [examples/person-detection](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/person-detection/app.py) |
| 4 | Cascade inference (advanced) | Crop the first model's output, feed it to a second model | `subscribe()` + `infer()` | [examples/face-cascade](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/face-cascade/README.md) |

> The first three cover the vast majority of apps. "Subscribe to the inference stream" is the common skeleton; the difference is what you do with the result — count it, publish an event, or drive hardware. Cascade inference is the deepest family; read the first three before tackling it.

## 2. Pattern 1: Real-Time Inference Counting

Every frame returns detections; use `count_by_label()` to tally per label and print a periodic summary:

```python
import time
from neoruntime_ipc_sdk import InferenceClient

inf = InferenceClient()
report_at = time.monotonic() + 5.0        # print a summary every 5 seconds

for frame_seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    if time.monotonic() < report_at:
        continue

    report_at = time.monotonic() + 5.0
    print(f"seq={frame_seq}: {len(result.objects)} objects")
    for obj in result.objects:
        print(f"  {obj.label} {obj.score:.2f} {obj.bbox.to_xyxy()}")
```

The full version (threshold filtering, alert events, graceful exit) is in [examples/people-counting](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/people-counting/app.py) and the [Person Detection tutorial](../2-cookbook/1-person-detection.md).

## 3. Pattern 2: Inference → Event Alerts

When the alert condition is met, broadcast on the event bus; other apps (dashboards, interlock scripts) subscribe to the same topic and act:

```python
from neoruntime_ipc_sdk import InferenceClient, EventClient

inf = InferenceClient()
events = EventClient()

for frame_seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    hits = [o for o in result.get_objects_by_label("person") if o.score >= 0.6]
    if hits:
        events.publish(
            f"app/{APP_ID}/person_detected",     # topic convention: app/<app ID>/<event name>
            {"frame": frame_seq, "count": len(hits)},
            persistent=True,                     # subscribers coming online later still receive it
        )
```

Event subscription, wildcards, and permission declarations: [SDK Reference §3 Platform Constraints](./1-sdk-reference.md#3-platform-specific-constraints) and [Event Integration](./5-event-integration.md). A complete interlock example: [examples/object-detection](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/object-detection/app.py).

## 4. Pattern 3: Inference → Device Control

`DeviceClient` drives the hardware directly; detection results switch the light and day/night mode:

```python
from neoruntime_ipc_sdk import InferenceClient, DeviceClient, IrCutMode

inf = InferenceClient()
device = DeviceClient()

for frame_seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    if result.has_person():              # person detected: light on, day mode
        device.set_white_light(80)
        device.set_ircut(IrCutMode.DAY)
    else:                                # nobody: light off, IR on, night mode
        device.set_white_light(0)
        device.set_ir_led(True)
        device.set_ircut(IrCutMode.NIGHT)
```

All peripheral interfaces (lights, PTZ, lens, GPIO) are in [SDK Reference §2 What Each Module Solves](./1-sdk-reference.md#2-what-each-module-solves). A complete on-device case (initial state read, timeout switch) is in [examples/person-detection](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/person-detection/app.py).

## 5. Pattern 4: Cascade Inference (Advanced)

The first subscription tells you *where* targets are; often you then want a second inference on each target region — face detection then landmarks, vehicle detection then license plates. Crop the region using the first result's `bbox`, then feed the crop to a second model with `infer()`:

```python
for frame_seq, result in inf.subscribe(stream="sub", model="<detection model>"):
    for obj in result.objects:
        crop = frame_crop(obj.bbox)       # crop by bbox; see the repo example for the implementation
        second = inf.infer(crop, model_id="<second model>")
        # process second.classifications / second.landmarks / ...
```

The full implementation (cropping, result merging, event-bus output) is in [examples/face-cascade](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/face-cascade/README.md). Both models must be imported on the device and their real names queried first — never hardcode them.

## 6. Turning a Skeleton into a Running App

A skeleton is just the core logic; running on the real device needs image build, permission declarations, and upload:

1. **Clone the repo** (in the same parent directory as the SDK):
   ```bash
   git clone https://github.com/camthink-ai/neoruntime-apps.git
   ```
2. **Copy the closest example as a start**: `cp -r examples/<pattern> my-app/`, then edit `app.py`'s business logic and `app.yaml`'s `metadata.id` / model names / permissions (permission reference: [App Reference §4 Permission Model](./0-app-reference.md#4-permission-model)).
3. **Build → upload → start**: identical to Hello World — see [Hello World §3 Build the Image](../1-app-development/1-hello-world.md#3-build-the-image) and [§4 Deploy to the Device](../1-app-development/1-hello-world.md#4-deploy-to-the-device). Errors: [Troubleshooting FAQ](../../5-troubleshooting.md).

## 7. Related Docs

- [SDK Reference](./1-sdk-reference.md) — module overview, installation, platform-specific constraints
- [SDK Workflow](../1-app-development/0-sdk-workflow.md) — from cloning to deployment, calling patterns
- [App Reference](./0-app-reference.md) — app.yaml config, permission model, deployment flow
- [Person Detection tutorial](../2-cookbook/1-person-detection.md) — a complete on-device case
- [Event Integration](./5-event-integration.md) — event bus protocol and topics