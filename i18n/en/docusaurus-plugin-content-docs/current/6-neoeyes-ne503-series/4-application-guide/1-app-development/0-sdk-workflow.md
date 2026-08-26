---
description: "A single-page NE503 Python SDK (neoruntime_ipc_sdk) workflow: prepare the source, embed the SDK in an app image, declare permissions, make the first call, and deploy it."
keywords: [NE503, Python SDK, neoruntime_ipc_sdk, SDK embedding, container application, build_app.sh, permissions]
tags: [application development, NE503, SDK, getting started]
---

# SDK Workflow

This page follows one path: **prepare the source → embed the SDK → declare permissions → call the SDK → build and deploy → verify**. When it works, you can start from a sample app and replace its business logic.

## 1. Know these two prerequisites

`neoruntime_ipc_sdk` runs **inside the NE503 application container** and uses platform-injected Unix Sockets to call AI Runtime, Event Bus, and Device Control. The app does not access hardware or the inference engine directly.

The SDK **is not on PyPI**. The device container normally cannot reach the network to run `pip install`, so the SDK must be bundled into the app image at build time. The SDK already includes generated protobuf files; no manual generation is needed.

Common clients:

| What you need to do | Client | Common calls |
|:---|:---|:---|
| Subscribe to inference results or run single-frame inference | `InferenceClient` | `subscribe()`, `infer()` |
| Publish or subscribe to app events | `EventClient` | `publish()`, `subscribe()` |
| Control lights, lens, PTZ, and other peripherals | `DeviceClient` | `set_white_light()`, `set_ircut()`, and more |

## 2. Prepare the project and embed the SDK

Clone the SDK and app repositories under the same parent directory:

```bash
git clone https://github.com/camthink-ai/neoruntime-sdks.git
git clone https://github.com/camthink-ai/neoruntime-apps.git
```

### Recommended: use the unified build script

Sample apps use `neoruntime-apps/scripts/build_app.sh`. It copies the SDK from the sibling `neoruntime-sdks`, builds an ARM64 image with Docker buildx, and packages an `.aipc` bundle:

```bash
cd neoruntime-apps
./scripts/build_app.sh examples/person-detection
```

### Standalone project: install from the Dockerfile

When the app is outside the sample-repository layout, copy the SDK into the image and install it locally:

```dockerfile
COPY neoruntime_ipc_sdk /app/neoruntime_ipc_sdk
RUN pip install --no-cache-dir /app/neoruntime_ipc_sdk
```

For distribution, build a universal wheel first:

```bash
cd neoruntime-sdks/python
pip wheel . --no-deps -w dist/
```

Install the resulting `neoruntime_ipc_sdk-<version>-py3-none-any.whl` in the Dockerfile. Whichever method you use, the final image must contain `neoruntime_ipc_sdk`.

## 3. Declare the permissions in `app.yaml`

The platform does not open access just because the code calls an SDK method. The `permissions` section must cover the streams, models, event topics, and peripherals used by the app; missing permissions are rejected at call time.

Minimal example for an app that only subscribes to inference:

```yaml
spec:
  image: aipc/my-app:1.0.0
  permissions:
    video:
      - sub.raw
    inference:
      models: [<real-model-id>]
      max_qps: 30
```

Add `events` or `device` only when the app uses them. The model, stream, and topic values in the permissions must match the real device values and the code.

## 4. Make the first SDK call

First query the models and streams available on the device. Do not use the example values as if they were real values:

```python
from neoruntime_ipc_sdk import FdMediaClient, InferenceClient

inf = InferenceClient()
media = FdMediaClient()
print("models:", inf.list_models())
print("streams:", media.list_streams())
```

Then put the real model name into the subscription loop:

```python
try:
    for seq, result in inf.subscribe(
        stream="sub",
        model="<real-model-id>",
    ):
        print(f"frame={seq}, objects={len(result.objects)}")
        for obj in result.objects:
            print(obj.label, obj.score, obj.bbox.to_xyxy())
except KeyboardInterrupt:
    inf.close()
```

Remember these platform constraints:

- Inference subscriptions use `sub` or `third`, which publish raw frames. `main` carries H.264 only and cannot be used for inference subscriptions.
- `stream` and `model` must use the real device values; otherwise the call returns `NOT_FOUND` or produces no results.
- For a custom HEF, add `raw_output_only=True` and decode the raw NMS output in the app. Preloaded models do not need this option.

Other common SDK calls:

```python
from neoruntime_ipc_sdk import DeviceClient, EventClient

events = EventClient()
events.publish("app/<app-id>/person_detected", {"count": 1})

device = DeviceClient()
device.set_white_light(80)
```

`subscribe()` is a blocking iterator. Close the client when handling `KeyboardInterrupt` or `SIGTERM`, so the container does not leave a connection behind.

## 5. Build, deploy, and verify

### 5.1 Build

Start from a sample app:

```bash
cd neoruntime-apps
./scripts/build_app.sh examples/person-detection
```

The script creates an `.aipc` package containing `app.yaml` and the ARM64 image.

### 5.2 Deploy

1. Log in to the NE503 Web Console and open **App Management**;
2. Click **Import** and choose **Upload Package**;
3. Upload the `.aipc` file and wait for installation to finish;
4. Click **Start** on the application card.

### 5.3 Verify

After the app becomes **Running**, check its logs and confirm:

- the app startup log appears;
- `list_models()` returns a device model;
- the subscription loop keeps receiving frames or events;
- peripheral actions match the app logic when device control is used.

If there is no output, check the model and stream names first, then check `app.yaml` permissions, and finally confirm that the app is not using `main` for inference.

## 6. Continue from here

- [SDK Reference](../3-reference/1-sdk-reference.md) — full clients and NE503 platform constraints;
- [SDK Examples](../3-reference/2-sdk-examples.md) — counting, event alerts, device control, and cascaded inference;
- [Person Detection](../2-cookbook/1-person-detection.md) — a complete application with on-device verification.
