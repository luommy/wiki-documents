---
description: NE503 Python SDK reference covering the hailo_ipc_sdk package, module selection, service endpoints, inference subscriptions, and resource cleanup.
keywords: [NE503 SDK, Python SDK, hailo_ipc_sdk, InferenceClient, EventClient, FdMediaClient, inference subscription]
tags: [SDK Reference, NE503, Python, Application Development, Developer]
---

# SDK Reference

NE503 applications use the Python package **`hailo_ipc_sdk`**. The distribution package is **`hailo-ipc-sdk`**, and the current source version is `0.4.0`. The obsolete package name in older examples is not the current import path.

This page covers module selection and platform constraints. See the [neoruntime-sdks Python API documentation](https://github.com/camthink-ai/neoruntime-sdks/tree/main/python/docs/api) for complete classes, parameters, and return values.

## 1. Confirm the package and version

Import it as follows:

```python
from hailo_ipc_sdk import InferenceClient, EventClient
```

The source directory used in image builds is `python/hailo_ipc_sdk`, and `setup.py` names the distribution `hailo-ipc-sdk`. Match the SDK version to the platform version; do not diagnose an installation from an old import name.

Check the installed package inside the container:

```bash
python -c "import hailo_ipc_sdk; print(hailo_ipc_sdk.__version__)"
```

See [SDK Workflow §4 First SDK Call](../1-app-development/0-sdk-workflow.md#4-make-the-first-sdk-call) for image and deployment steps.

## 2. Choose a module by task

These classes are exported from the `hailo_ipc_sdk` top level. Keep complete signatures in the SDK API documentation rather than duplicating them in application guides.

| Task | Class | Main capability |
|:---|:---|:---|
| Single-frame and streaming AI inference | `InferenceClient` | `infer()`, `infer_batch()`, `subscribe()`, model queries and registration |
| Raw video frames | `FdMediaClient` | DMA-BUF/raw-frame reads, subscriptions, and stream enumeration |
| Encoded video | `EncodedStreamClient` | Encoded-frame reads and subscriptions |
| Event Bus | `EventClient` | Publish, batch publish, subscribe, topic queries, and statistics |
| Device control | `DeviceClient`, `IrCutMode` | Lights, IR-CUT, PTZ, lens, and GPIO |
| Camera pipeline | `CameraClient` | ISP, encoder, RTSP, OSD, configuration, and stream status |
| AI overlay | `OverlayClient` | Configure and apply AI overlays |
| Application management | `AppClient` | App list, state, statistics, and logs |
| Audio control | `AudioClient`, `AudioStreamClient` | Audio devices, capture, playback, and streams |
| Runtime configuration | `Config` | App ID, IPC endpoints, and debug settings |
| Plugins | `PluginDiscovery`, `PluginServer` | Discover capabilities and provide plugin services |

An app may combine several clients, but each client should be closed on exit. Do not rely on a forced process kill to release a long-running subscription.

## 3. Platform constraints

### 3.1 Stream and model names come from the target device

`InferenceClient.subscribe()` accepts `stream`, `model`, `fps`, `session_id`, and `raw_output_only`. Names are runtime resources, not SDK constants:

```python
from hailo_ipc_sdk import FdMediaClient, InferenceClient

media = FdMediaClient()
inference = InferenceClient()

print("raw streams:", media.list_streams())
print("models:", [m.model_id for m in inference.list_models()])
```

Confirm the resources first, then pass them to `subscribe()`. Depending on firmware, camera configuration, and app manifest, stream names may be `main`, `sub`, `third`, or another configured value.

### 3.2 Use `raw_output_only` only for raw outputs

```python
for frame_seq, result in inference.subscribe(
    stream="main",
    model="person_vehicle_v1",
    fps=10,
    raw_output_only=False,
):
    for obj in result.objects:
        print(obj.label, obj.score)
```

Set `raw_output_only=True` only when your code will parse tensors itself, then read `result.raw_outputs`. Keep the default when you need SDK-parsed fields such as `objects`, `classifications`, or `landmarks`.

### 3.3 Streaming subscriptions are blocking iterators

`subscribe()` waits for results and blocks in the `for` loop. Handle shutdown and close the client in `finally`:

```python
try:
    for frame_seq, result in inference.subscribe(
        stream="main", model="person_vehicle_v1", fps=10
    ):
        handle(result)
finally:
    inference.close()
```

Stopping the generator cancels the underlying streaming RPC; `close()` is still the explicit cleanup action an application should keep. The same rule applies to `EventClient`, `FdMediaClient`, and `DeviceClient`; context managers are also supported.

### 3.4 Model registration is permission-controlled

Call `register_model()` only when `inference.allow_register_model` is enabled in the manifest and the path, model ID, and runtime all satisfy their requirements. A normal inference app should declare registered models instead of registering one unconditionally at startup.

## 4. Endpoints and container environment

By default the SDK connects to platform services through Unix Sockets inside the container. Environment variables can override them:

| Environment variable | Default |
|:---|:---|
| `AI_RUNTIME_ENDPOINT` | `unix:///run/aipc/ai-runtime.sock` |
| `EVENT_BUS_ENDPOINT` | `unix:///run/aipc/event-bus.sock` |
| `DEVICE_CONTROL_ENDPOINT` | `unix:///run/aipc/device-control.sock` |
| `CAMERA_CONTROL_ENDPOINT` | `unix:///run/aipc/camera-control.sock` |
| `APP_MANAGER_ENDPOINT` | `unix:///run/aipc/app-manager.sock` |
| `SHM_BASE_PATH` | `/run/aipc/shm` |
| `ENCODED_SOCKET_DIR` | `/run/aipc/encoded` |
| `APP_ID` | `unknown` |
| `DEBUG` | `0` |
| `LOG_LEVEL` | `INFO` |

Usually you do not need to write these endpoints in application code. Confirm permissions and container configuration in [App Reference](./0-app-reference.md), then use the SDK defaults.

## 5. Minimal inference skeleton

The `main` and `person_vehicle_v1` values below appear in repository examples only to show the call shape. Replace them after checking the target device as described in Section 3.1:

```python
from hailo_ipc_sdk import InferenceClient


def main():
    inference = InferenceClient()
    try:
        for frame_seq, result in inference.subscribe(
            stream="main",
            model="person_vehicle_v1",
            fps=10,
        ):
            people = result.count_by_label("person")
            if people:
                print(f"frame={frame_seq}, people={people}")
    finally:
        inference.close()


if __name__ == "__main__":
    main()
```

Result fields depend on the model. Do not assume every model returns `objects`; declare the models, streams, and inference permissions together in `app.yaml`.

## 6. How this fits the development flow

- [SDK Workflow](../1-app-development/0-sdk-workflow.md) — project creation, image build, deployment, and first SDK call
- [SDK Examples](./2-sdk-examples.md) — subscriptions, event publishing, device control, and cleanup
- [App Reference](./0-app-reference.md) — `app.yaml` permissions, environment variables, and mounts
- [RESTful API Reference](./3-restful-api.md) — external HTTP management interfaces, without duplicating SDK signatures
- [Event Integration](./5-event-integration.md) — Event Bus topics, messages, and external integration
- [neoruntime-sdks Python API](https://github.com/camthink-ai/neoruntime-sdks/tree/main/python/docs/api) — complete SDK API reference
