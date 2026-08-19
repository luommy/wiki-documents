---
description: Complete API reference for the NE503 Python SDK (hailo_ipc_sdk), covering 8 core modules — AI inference, video streams, event bus, device control, app management, plugin discovery, AI overlay, and config — with all dataclass definitions and method signatures.
keywords: [NE503 SDK, Python SDK, hailo_ipc_sdk, InferenceClient, EventClient, DeviceClient, AI inference, video stream, event bus, plugin system]
tags: [SDK reference, NE503, Python, API docs, developer]
---

# SDK Reference

`hailo_ipc_sdk` is the Python SDK for NE503 container applications, providing 8 core modules. For installation, see [App Reference](./0-app-reference.md#3-dockerfile-patterns).

## Quick Start

```python
from hailo_ipc_sdk import InferenceClient

# Subscription inference: use sub for stream (publishes raw NV12 frames), and the device's real model name
inf = InferenceClient()
for seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    print(f"Detected {len(result.objects)} objects")
```

The three calling patterns (inference subscription / event publish-subscribe / device control) and the key points — "don't hardcode names, subscription is a blocking iterator, graceful shutdown" — are in [SDK Workflow §3 Calling Patterns](../1-app-development/0-sdk-workflow.md#3-calling-pattern); the full API of each module is in §1–§8 below.

---

## 1. inference — AI Inference

### Data Classes

#### BoundingBox

```python
@dataclass
class BoundingBox:
    x: float
    y: float
    width: float
    height: float
    def to_xyxy(self) -> Tuple[float, float, float, float]
    def to_xywh(self) -> Tuple[float, float, float, float]
```

#### DetectedObject

```python
@dataclass
class DetectedObject:
    label: str
    score: float
    bbox: BoundingBox
    class_id: int = 0
    track_id: Optional[int] = None
```

#### LandmarkPoint / LandmarkSet

```python
@dataclass
class LandmarkPoint:
    x: float
    y: float
    confidence: float = 1.0

@dataclass
class LandmarkSet:
    type: str
    points: List[LandmarkPoint]
```

#### Classification

```python
@dataclass
class Classification:
    type: str       # age, gender, clip, etc.
    class_id: int
    label: str
    confidence: float
```

#### SegmentationMask

```python
@dataclass
class SegmentationMask:
    class_id: int
    label: str
    confidence: float
    bbox: BoundingBox
    mask_rle: bytes
    mask_width: int
    mask_height: int
    def to_numpy_mask() -> np.ndarray
```

#### OcrLine / Embedding / DepthMap

```python
@dataclass
class OcrLine:
    text: str
    confidence: float
    bbox: BoundingBox

@dataclass
class Embedding:
    dim: int
    data: List[float]

@dataclass
class DepthMap:
    width: int
    height: int
    data: np.ndarray    # float32 (H, W)
```

#### InferenceResult

```python
@dataclass
class InferenceResult:
    frame_sequence: int
    timestamp_ns: int
    objects: List[DetectedObject]
    classifications: List[Classification]
    landmarks: List[LandmarkSet]
    masks: List[SegmentationMask]
    ocr_lines: List[OcrLine]
    embeddings: List[Embedding]
    depth_maps: List[DepthMap]
    raw_outputs: Optional[List[np.ndarray]]
    infer_time_us: int = 0
    queue_time_us: int = 0
    hw_infer_time_us: int = 0       # pure NPU hardware inference time (μs); 0 when unavailable
    status_message: str = ""        # diagnostic info; "simulation" means no real frame source (degraded mode)

    def has_person() -> bool
    def count_by_label(label: str) -> int
    def get_objects_by_label(label: str) -> List[DetectedObject]
```

#### ModelInfo

```python
@dataclass
class ModelInfo:
    model_id: str
    model_path: str
    version: str = ""
    inputs: List[Dict]
    outputs: List[Dict]
    estimated_tops: float = 0.0
    estimated_memory: int = 0
    load_timestamp: int = 0
```

### InferenceClient

```python
class InferenceClient:
    def __init__(self, endpoint: Optional[str] = None)
    def connect() -> None
    def close() -> None
```

**Inference operations:**

| Method | Signature | Description |
|:---|:---|:---|
| `infer` | `infer(image: np.ndarray, model_id: str, timeout_ms: int = 5000, priority: int = 4) -> InferenceResult` | single-frame inference |
| `infer_with_tensors` | `infer_with_tensors(model_id: str, inputs: List[np.ndarray], timeout_ms: int = 5000) -> List[np.ndarray]` | multi-input inference |
| `subscribe` | `subscribe(stream: str, model: str, fps: int = 10, raw_output_only: bool = False) -> Iterator[Tuple[int, InferenceResult]]` | streaming inference |

#### `raw_output_only` and custom-trained models

`raw_output_only=True` makes `subscribe` skip the platform's built-in post-processing and return the raw output tensors from HailoRT NMS, leaving the app to decode them into detection boxes. **Custom-trained models must take this path**: the device's built-in post-processing op looks up outputs by the preloaded model's tensor names and cannot match a custom HEF's tensor names, so the default path (`False`) yields empty results.

```python
from hailo_ipc_sdk import InferenceClient
import numpy as np

inf = InferenceClient()
# Custom model: raw_output_only=True to get raw tensors, decode NMS output yourself
for seq, result in inf.subscribe(stream="sub", model="<custom model id>", raw_output_only=True):
    for tensor in result.raw_outputs:
        # HailoRT NMS output: shape (1, N, 6), each row [y1, x1, y2, x2, score, class_id] (normalized coords)
        boxes = np.asarray(tensor).reshape(-1, 6)
        for y1, x1, y2, x2, score, cls in boxes:
            if score > 0.3:
                print(f"class={int(cls)} score={score:.2f} bbox=({x1:.2f},{y1:.2f},{x2:.2f},{y2:.2f})")
```

Key points: NMS is baked in at HEF compile time (see [Model Training](../1-app-development/4-model-training-and-hef.md#66-compile-artifact-verification)), so app-side decoding only does coordinate conversion and threshold filtering — no need to re-implement NMS; preloaded models (e.g. `hailo_yolov8n_384_640`) can use the default path (`False`) and get decoded `DetectedObject` directly.

**Model management:**

| Method | Signature | Description |
|:---|:---|:---|
| `register_model` | `register_model(model_path: str, model_id: Optional[str] = None, ...) -> str` | register a model |
| `unregister_model` | `unregister_model(model_id: str) -> None` | unregister a model |
| `list_models` | `list_models() -> List[ModelInfo]` | list models |
| `get_model_info` | `get_model_info(model_id: str) -> Optional[ModelInfo]` | model details |

**Session management:**

| Method | Signature | Description |
|:---|:---|:---|
| `create_session` | `create_session(session_id: str, max_qps: int = 0, max_concurrent: int = 0, priority: int = 4) -> str` | create a session |
| `destroy_session` | `destroy_session(session_id: str) -> None` | destroy a session |

**GenAI:**

| Method | Signature | Description |
|:---|:---|:---|
| `genai_create_session` | `genai_create_session(hef_path: str, kind: str = "llm") -> str` | create a GenAI session |
| `genai_destroy_session` | `genai_destroy_session(session_id: str) -> None` | destroy a GenAI session |
| `genai_generate` | `genai_generate(session_id: str, messages: List[str], max_tokens: int = 512, ...) -> Iterator[str]` | streaming generation |
| `genai_abort` | `genai_abort(session_id: str) -> None` | abort generation |

**Other:**

| Method | Description |
|:---|:---|
| `get_stats() -> Dict` | system stats |
| `encode_text(text: str) -> List[float]` | CLIP text encoding |
| `update_postprocess_config(model_id: str, config_json: str) -> bool` | update post-processing config |

---

## 2. media — Video Streams

### PixelFormat

```python
class PixelFormat(IntEnum):
    NV12 = 0; NV21 = 1; RGB = 2; BGR = 3
    RGBA = 4; BGRA = 5; GRAY8 = 6; YUYV = 7
```

### Frame

```python
@dataclass
class Frame:
    sequence: int
    timestamp_ns: int
    width: int
    height: int
    format: str
    image: np.ndarray
    def to_rgb() -> np.ndarray
    def save(path: str) -> None
```

### StreamInfo

```python
@dataclass
class StreamInfo:
    stream_id: str
    width: int; height: int
    format: str; fps: float
    buffer_count: int
```

### FdMediaClient

Zero-copy video frame access (Unix socket + DMA-BUF):

```python
class FdMediaClient:
    def __init__(self, socket_path: str | None = None)
    def get_frame(stream_id: str, timeout_ms: int = 5000) -> Frame | None
    def subscribe_raw(stream_id: str, skip_frames: bool = True) -> Iterator[Frame]
    def on_frame(stream_id: str, callback: Callable) -> threading.Thread
    def list_streams() -> List[str]          # e.g. ['main', 'sub']; use sub for inference
    def close() -> None
```

### EncodedStreamClient

Reads encoded video streams (H.264/H.265 NAL units), for scenarios like RTSP re-push or recording that don't need raw frames. Socket path looks like `/run/aipc/encoded/main.sock`.

```python
@dataclass
class EncodedFrame:
    codec: int            # 0=h264, 1=h265
    flags: int            # bit0 = keyframe
    pts_ns: int           # presentation timestamp (ns)
    width: int
    height: int
    dts_ns: int           # decode timestamp (ns)
    data: bytes           # encoded NAL payload
    @property
    def is_keyframe() -> bool
    @property
    def codec_name() -> str       # "h264" / "h265"

class EncodedStreamClient:
    def __init__(self, socket_path: str)
    def get_frame(timeout_ms: int = 5000) -> EncodedFrame | None
    def subscribe(reconnect: bool = True) -> Iterator[EncodedFrame]
    def on_frame(callback: Callable) -> threading.Thread
    def close() -> None
```

`FdMediaClient.get_encoded_stream(stream_id="main")` conveniently returns a connected `EncodedStreamClient`. For video stream integration (RTSP/WebSocket), see Video Integration (coming soon).

---

## 3. events — Event Bus

### Event / TopicInfo

```python
@dataclass
class Event:
    topic: str
    payload: Dict[str, Any]
    source: str = ""
    event_id: str = ""
    timestamp_ns: int = 0
    metadata: Dict[str, str]
    def to_json() -> str

@dataclass
class TopicInfo:
    topic: str
    subscriber_count: int
    total_messages: int
    last_message_ts: int
```

### EventClient

```python
class EventClient:
    def __init__(self, endpoint: Optional[str] = None)
```

| Method | Description |
|:---|:---|
| `publish(topic, payload, persistent=False, ttl_ms=None, metadata=None) -> str` | publish an event |
| `publish_batch(events, persistent=False) -> None` | batch publish |
| `subscribe(topic, filters=None, queue_size=100) -> Iterator[Event]` | subscribe (wildcards supported) |
| `on_event(topic, callback, filters=None) -> Thread` | callback subscription |
| `unsubscribe(topic) -> None` | unsubscribe |
| `list_topics() -> List[TopicInfo]` | list topics |
| `get_topic_info(topic) -> Optional[TopicInfo]` | topic details |
| `get_stats() -> Dict` | system stats |
| `get_topic_stats(topic) -> Dict` | topic stats |

---

## 4. device — Device Control

### IrCutMode / DeviceStatus / DeviceEvent

```python
class IrCutMode(Enum):
    AUTO = 0; DAY = 1; NIGHT = 2

@dataclass
class DeviceStatus:
    soc_temp_c: float; mcu_temp_c: float
    light_sensor: int; zoom_pos: int; focus_pos: int
    autofocus_enabled: bool; ircut_mode: IrCutMode
    white_light_level: int; ir_led_on: bool
    mcu_version: str

@dataclass
class DeviceEvent:
    type: EventType    # GPIO_CHANGE, TEMPERATURE_ALERT, ...
    timestamp_ns: int
```

### DeviceClient

```python
class DeviceClient:
    def __init__(self, endpoint: Optional[str] = None)
```

**Light**: `set_white_light(level: int)`, `set_ir_led(on: bool)`, `set_ircut(mode: IrCutMode)`

**PTZ**: `pan_left/right(speed)`, `tilt_up/down(speed)`, `ptz_stop()`, `save_preset(id)`, `call_preset(id)`

**Lens**: `zoom(speed)`, `set_zoom_level(level)`, `focus(speed)`, `focus_auto(enable)`, `set_focus_level(level)`, `get_lens_status()`, `lens_init()`, `lens_goto_ratio_distance(zoom_ratio, focus_distance_m)`, `control_iris(open)`, `set_iris_target(target)`, `lens_reset_zero(zoom, focus)`

**GPIO**: `gpio_set(pin, value)`, `gpio_get(pin) -> bool`

**Status**: `get_device_status() -> DeviceStatus`, `subscribe_events() -> Iterator[DeviceEvent]`

---

## 5. app — App Management

### AppInfo / AppStats / LogLine

```python
@dataclass
class AppInfo:
    id: str; name: str; version: str; state: str
    container_id: str; pid: int
    installed_at: int; started_at: int; restart_count: int

@dataclass
class AppStats:
    cpu_usage_percent: float; memory_usage_bytes: int
    memory_limit_bytes: int; thread_count: int

@dataclass
class LogLine:
    timestamp: int; level: str; message: str
```

### AppClient

```python
class AppClient:
    def __init__(self, endpoint: Optional[str] = None)
```

| Method | Description |
|:---|:---|
| `install_app(manifest_path, image_path) -> str` | install an app |
| `start_app(app_id)` | start |
| `stop_app(app_id, timeout_seconds=30)` | stop |
| `uninstall_app(app_id, keep_logs=True)` | uninstall |
| `list_apps() -> List[AppInfo]` | list apps |
| `get_app(app_id) -> AppInfo` | app details |
| `get_app_stats(app_id) -> AppStats` | resource stats |
| `get_logs(app_id, max_lines=100, follow=False) -> Iterator[LogLine]` | get logs |
| `get_logs_text(app_id, max_lines=100, follow=False) -> Iterator[str]` | text logs |

---

## 6. plugin — Plugin Discovery

### PluginEndpoint

```python
@dataclass
class PluginEndpoint:
    app_id: str; capability_id: str; version: str
    transport: str; socket_path: Optional[str]; state: str
    def connect(**kwargs) -> grpc.Channel
    @property
    def is_available() -> bool
```

### PluginDiscovery

| Method | Description |
|:---|:---|
| `get(capability_id: str) -> Optional[PluginEndpoint]` | find a plugin |
| `require(capability_id: str, timeout: float = 30.0) -> PluginEndpoint` | wait for a plugin to become available |
| `list_plugins() -> Dict[str, dict]` | list all plugins |
| `list_capabilities() -> List[str]` | list all capabilities |
| `reload() -> None` | reload |
| `watch(callback: Callable) -> None` | watch for changes |
| `close() -> None` | close and release resources |

### PluginServer

```python
class PluginServer:
    def __init__(self, plugin_id: str, socket_dir: str = DISCOVERY_DIR)
    def create_server(max_workers: int = 4) -> grpc.Server
    def start() -> None
    def stop(grace: float = 5.0) -> None
```

---

## 7. overlay — AI Result Overlay

```python
@dataclass
class OverlayConfig:
    enabled: bool = True
    show_label: bool = True
    show_confidence: bool = True
    line_thickness: int = 2
    box_color: int = 0
    label_color: int = 0
    font_size: int = 0

class OverlayClient:
    def enable(show_label=True, show_confidence=True, line_thickness=2)
    def disable()
    def configure(enabled=True, show_label=True, ...)
    def apply(config: OverlayConfig)
```

---

## 8. config — Config Management

```python
class Config:
    @staticmethod
    def get_app_id() -> str
    @staticmethod
    def get_inference_endpoint() -> str
    @staticmethod
    def get_event_bus_endpoint() -> str
    @staticmethod
    def get_device_control_endpoint() -> str
    @staticmethod
    def get_camera_control_endpoint() -> str
    @staticmethod
    def translate_path_to_host(container_path: str) -> str
    @staticmethod
    def is_debug() -> bool
```

### Environment Variables

The connection endpoints `Config` reads (`AI_RUNTIME_ENDPOINT`, `EVENT_BUS_ENDPOINT`, `DEVICE_CONTROL_ENDPOINT`, `CAMERA_CONTROL_ENDPOINT`) and the container env vars the platform auto-injects (`APP_ID`, `AIPC_HOST_PREFIX`, `SHM_BASE_PATH`, `LOG_LEVEL`, etc.) are fully listed in [App Reference §7 Environment Variable Reference](./0-app-reference.md#7-environment-variable-reference).

---

## Related Docs

- [SDK Examples](./2-sdk-examples.md) — full app examples and development guides
- [App Reference](./0-app-reference.md) — project setup, app.yaml config, deployment flow
- [Platform Services Overview](../../3-software-guide/4-platform-services.md) — AI Runtime, Event Bus, and other service responsibilities, with source pointers