---
description: "NE503 Python SDK (neoruntime_ipc_sdk) usage guide: run your first inference in one minute, what each module solves, and platform-specific constraints such as subscribing with sub/third and raw_output_only for custom models."
keywords: [NE503 SDK, Python SDK, neoruntime_ipc_sdk, InferenceClient, inference subscription, sub stream, raw_output_only, EventClient]
tags: [SDK reference, NE503, Python, app development, developer]
---

# SDK Reference

`neoruntime_ipc_sdk` is the Python SDK for NE503 container applications. Inside the container it talks to the platform's AI Runtime, Event Bus, Device Control, and other services directly over gRPC / Unix sockets, so you can do inference, receive events, and control devices without touching the low-level protocols. Its typical job is to turn this one line:

```python
for seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
```

into "a live detection result for every frame of the video stream".

> **The authoritative API reference is the official Sphinx docs site**: [English](https://camthink-ai.github.io/neoruntime-sdks/python/en/index.html) / [中文](https://camthink-ai.github.io/neoruntime-sdks/python/zh/index.html), covering every class and method's full parameters, return types, and code examples. This page does not restate signatures — it covers two things unique to this wiki: **what each module solves and how to choose one**, plus **the NE503 platform-specific calling constraints**.

For installation: the SDK ships inside each app image on the device; for local development see [Developer Guide §2 Docker Development Environment](../../3-software-guide/1-developer-guide.md#2-docker-development-environment). A C++ version of the SDK mirrors the Python modules one-to-one; C++ API details are on the [Doxygen docs site](https://camthink-ai.github.io/neoruntime-sdks/cpp/en/).

## 1. Run It in One Minute

The most common shape — and the skeleton of most AI apps — is "subscribe to the inference stream and process each frame":

```python
from neoruntime_ipc_sdk import InferenceClient

inf = InferenceClient()
for seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    print(f"Frame {seq}: {len(result.objects)} objects")
    for obj in result.objects:
        print(f"  {obj.label}: {obj.score:.2f} @ [{obj.bbox.x:.2f}, {obj.bbox.y:.2f}]")
```

Three steps and it runs: **subscribe to an inference stream → pass the real model name → iterate the per-frame results**. The `stream` and `model` above are example values — replace them with the device's real values before deploying (query them with `list_streams()` / `list_models()`; never hardcode them — see [§3.2](#32-dont-hardcode-stream-and-model-names)).

The subscription pattern (blocking iterator, graceful exit) and runnable examples are in [SDK Workflow §3 Calling Pattern](../1-app-development/0-sdk-workflow.md#3-calling-pattern) and [SDK Examples](./2-sdk-examples.md).

## 2. What Each Module Solves

The SDK is split into modules, one per platform capability — each `XxxClient` maps to a service on the device. **Pick a module from this table first, then click through for the full API**:

| Module | What it solves | Core classes | Full API |
|:---|:---|:---|:---|
| `inference` | AI inference: single-shot `infer`, streaming `subscribe`, model management | `InferenceClient` | [docs site — inference](https://camthink-ai.github.io/neoruntime-sdks/python/en/api/inference.html) |
| `media` | Zero-copy video frames (DMA-BUF), H.264 encoded streams | `FdMediaClient`, `EncodedStreamClient` | [docs site — media](https://camthink-ai.github.io/neoruntime-sdks/python/en/api/media.html) |
| `events` | Event bus: publish/subscribe, batching, wildcard topics | `EventClient` | [docs site — events](https://camthink-ai.github.io/neoruntime-sdks/python/en/api/events.html) |
| `device` | Peripheral control: lights, PTZ, lens, GPIO, Wiegand, RS-485 | `DeviceClient` | [docs site — device](https://camthink-ai.github.io/neoruntime-sdks/python/en/api/device.html) |
| `app` | App lifecycle: install/start/stop/uninstall/logs (usually handled by the Web Console) | `AppClient` | [docs site — app](https://camthink-ai.github.io/neoruntime-sdks/python/en/api/app.html) |
| `plugin` | gRPC plugin discovery and hosting (advanced platform extension) | `PluginDiscovery`, `PluginServer` | [docs site — plugin](https://camthink-ai.github.io/neoruntime-sdks/python/en/api/plugin.html) |
| `config` | Read connection endpoints from env vars, container/host path conversion | `Config` | [docs site — config](https://camthink-ai.github.io/neoruntime-sdks/python/en/api/config.html) |
| `camera` | Camera internals: ISP, encoder, RTSP, OSD, AI overlay | `CameraClient` | Not on the docs site yet; see [source camera.py](https://github.com/camthink-ai/neoruntime-sdks/blob/main/python/neoruntime_ipc_sdk/camera.py) |
| `overlay` | Draw detection boxes onto the video (RTSP/Web) | `OverlayClient` | Not on the docs site yet; see [source overlay.py](https://github.com/camthink-ai/neoruntime-sdks/blob/main/python/neoruntime_ipc_sdk/overlay.py) |
| `audio` / `audio_stream` | Audio capture/playback, two-way intercom | `AudioClient`, `AudioStreamClient` | Not on the docs site yet; see [source audio.py](https://github.com/camthink-ai/neoruntime-sdks/blob/main/python/neoruntime_ipc_sdk/audio.py) |

**How to choose**: ask "what am I doing", then find the matching Client in the table. The vast majority of container apps only need the first three — `inference` (reasoning) + `events` (alert interlock) + `device` (hardware control when needed). `app`/`plugin`/`camera`/`audio` are advanced; consult them when you get there.

## 3. Platform-Specific Constraints

These are pitfalls found on real NE503 devices — they are not on the official docs site, and **you must understand them before deploying**.

### 3.1 Use `sub`/`third` for inference, `main` is encode-only

The `main` stream only carries encoded H.264 — **no raw frames, no inference data**. `inference.subscribe()` and the `media` frame accessors can only subscribe to the streams that publish raw NV12 frames: `sub` or `third` (`third` is the platform's default inference stream). Subscribing to `main` for inference will hang forever or never return results.

> Note: the SDK's `FdMediaClient().list_streams()` currently **hardcodes** `['main', 'sub']` and does not list `third`. To check the device's actual streams, use `aipc-cli stream list` or `CameraClient().get_stream_status()`.

Full constraints of the three streams (resolution/encoding/raw frames/inference routing) are in [Video and Imaging · RTSP Integration](../../2-user-guide/1-media-and-image.md#rtsp-integration).

### 3.2 Don't hardcode stream and model names

The `stream="sub"` and `model="hailo_yolov8n_384_640"` in the examples on this page are **sample values**. Model names change with what's preloaded on the device, and inference streams can be added or removed (`main`/`sub`/`third`). Run this on the device before deploying:

```python
from neoruntime_ipc_sdk import InferenceClient, FdMediaClient
print(InferenceClient().list_models())   # e.g. ['hailo_yolov8n_384_640']
print(FdMediaClient().list_streams())    # hardcoded ['main', 'sub'], no third
```

Fill the real values into `app.py` and `app.yaml`, or you'll get `NOT_FOUND` or no data.

### 3.3 Custom models need raw_output_only

The device's built-in post-processing looks up outputs by the **preloaded** models' tensor names and can't match a custom HEF's tensor names. With the default path (`False`), a custom model yields empty results — you must:

```python
for seq, result in inf.subscribe(stream="sub", model="<custom model id>", raw_output_only=True):
    for tensor in result.raw_outputs:
        boxes = np.asarray(tensor).reshape(-1, 6)   # HailoRT NMS output
```

NMS is baked in at HEF compile time, so the app only does coordinate conversion and threshold filtering. Full walkthrough: [Model Training & HEF Deployment §7 Deploy to NE503](../1-app-development/4-model-training-and-hef.md#7-deploy-to-ne503).

### 3.4 Blocking iterators need graceful exit

`subscribe()` (inference, events, video) is a blocking generator. Ctrl-C can't interrupt it directly — catch `KeyboardInterrupt` and `close()` to release the connection, otherwise a stale connection may linger after the container exits.

```python
def main():
    inf = InferenceClient()
    try:
        for seq, result in inf.subscribe(stream="sub", model="..."):
            ...
    except KeyboardInterrupt:
        inf.close()
```

A complete runnable example: [Person Detection tutorial](../2-cookbook/1-person-detection.md).

## 4. Environment Variables and Config

`neoruntime_ipc_sdk` reads service endpoints (`AI_RUNTIME_ENDPOINT`, `EVENT_BUS_ENDPOINT`, etc.) and the container identity (`APP_ID`) from environment variables. The platform injects them automatically at app startup — **no manual setup inside the container**. The full list and meaning: [App Reference §7 Environment Variable Reference](./0-app-reference.md#7-environment-variable-reference).

## Related Docs

- [SDK Examples](./2-sdk-examples.md) — 4 patterns from simple to advanced
- [SDK Workflow](../1-app-development/0-sdk-workflow.md) — from cloning to deployment, and the calling patterns
- [App Reference](./0-app-reference.md) — project setup, app.yaml config, deployment flow
- [Person Detection tutorial](../2-cookbook/1-person-detection.md) — a complete on-device case
- [System Architecture · Platform Services Layer](../../3-software-guide/0-system-architecture.md) — AI Runtime, Event Bus, and other service responsibilities, with source pointers