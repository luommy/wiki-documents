---
description: NE503 Event Bus integration guide covering MQTT bridging, inference result subscriptions, REST API remote management, and business system integration patterns.
keywords: [NE503, Event Bus, MQTT, REST API, event integration, system integration]
tags: [System Integration, NE503, Event Bus, MQTT]
---

# Event Integration

The NE503 Event Bus is a platform-level Pub/Sub message hub through which AI inference results, device alarms, application lifecycle, and other events are distributed. This document is intended for developers who need to integrate NE503 events into external systems, and introduces the Topic protocol, MQTT bridging, REST API calls, and common integration patterns.

## 1. Event Bus Protocol Overview

### 1.1 Access Methods

| Access Method | Endpoint | Applicable Scenarios |
|:---|:---|:---|
| gRPC (Unix Socket) | `unix:///run/aipc/event-bus.sock` | On-device services, in-container applications |
| gRPC (TCP) | `127.0.0.1:50053` | C++ clients |
| REST API | `http://<device_ip>:8080/api/v1/events/*` | External system integration |
| WebSocket | `ws://<device_ip>:8080/api/v1/events/stream` | Web frontend real-time subscription |

### 1.2 Topic Naming and Wildcards

The Event Bus uses `/`-separated hierarchical Topics and supports three wildcards: `*` (single level), `**` (multi-level), and `**/suffix` (suffix). Matching rules are defined in the source file `platform/event-bus/proto/event.proto`.

| Pattern | Description | Example |
|:---|:---|:---|
| Exact match | Exact topic name match | `inference/yolov8n/third` |
| `*` Single-level wildcard | Matches one level | `inference/*/third` |
| `**` Multi-level wildcard | Matches multiple levels | `inference/**` |
| `**/suffix` Suffix match | Matches a given suffix under any prefix | `**/detections` |

| Topic Prefix | Source | Example |
|:---|:---|:---|
| `inference/` | AI Runtime | `inference/person_v1/cam0_main` |
| `device/` | Device control service | `device/temperature_alert` |
| `app/` | Application Manager | `app/started`, `app/installed` |
| `system/` | System-level events | `system/ota_progress` |
| `alert/` | Alarm events | `alert/threshold_exceeded` |
| `model/` | Model lifecycle | `model/loaded` |

> The table above lists common prefix examples and is not exhaustive. The inference topic uses the three-segment format `inference/{model_id}/{stream_id}`; other prefixes are mostly two-segment.

### 1.3 Event Message Structure

```json
{
  "topic": "inference/person_v1/cam0_main",
  "timestamp_ns": 1717545600000000000,
  "source": "ai-runtime",
  "event_id": "evt-1717545600000-1",
  "payload": "{\"model_id\":\"person_v1\",\"stream_id\":\"cam0_main\",\"objects\":[...]}",
  "payload_type": "json",
  "metadata": { "stream": "cam0_main", "model_id": "person_v1" }
}
```

| Field | Type | Description |
|:---|:---|:---|
| `topic` | string | Event topic |
| `timestamp_ns` | uint64 | Nanosecond timestamp |
| `source` | string | Source (service name or app_id) |
| `event_id` | string | Auto-generated unique ID |
| `payload` | bytes / dict | On the wire this is JSON-encoded bytes; the Python SDK (`hailo_ipc_sdk`) already deserializes it into a dict, so the examples can call `event.payload.get(...)` directly |
| `metadata` | map | Optional key-value metadata (not carried by most events) |

## 2. MQTT Bridge Configuration

The NE503 Event Bus uses the gRPC protocol; external MQTT systems must connect via a bridge program. The bridge program acts as an Event Bus subscriber and forwards events to an external MQTT Broker.

```
NE503 Event Bus (gRPC) --> [Bridge] --> MQTT Broker --> Business System
```

Example bridge client (**runs on the device itself**, connects to the Event Bus via Unix Socket). The device's gRPC TCP endpoint `127.0.0.1:50053` only listens on the loopback interface and cannot be reached directly by external hosts; if you need to integrate from an external server, use the REST/WebSocket endpoints below instead, or forward the loopback port through an SSH tunnel:

```python
import json
import paho.mqtt.client as mqtt
from hailo_ipc_sdk.events import EventClient

MQTT_BROKER = "mqtt.example.com"
MQTT_PORT = 1883
MQTT_PREFIX = "ne503"

mqtt_client = mqtt.Client(client_id="ne503-bridge")
mqtt_client.username_pw_set("username", "password")  # Optional authentication
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
mqtt_client.loop_start()

event_client = EventClient(endpoint="unix:///run/aipc/event-bus.sock")

try:
    for event in event_client.subscribe("**"):
        mqtt_topic = f"{MQTT_PREFIX}/{event.topic}"
        payload = json.dumps({
            "timestamp_ns": event.timestamp_ns,
            "source": event.source,
            "event_id": event.event_id,
            "payload": event.payload,
            "metadata": event.metadata,
        })
        mqtt_client.publish(mqtt_topic, payload, qos=1)
finally:
    event_client.close()
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
```

The MQTT Broker authentication supports username/password (`username_pw_set`), TLS certificates (`tls_set`), and token-based methods.

## 3. Subscribing to AI Inference Results

After AI Runtime completes inference, it automatically publishes to the `inference/{model_id}/{stream_id}` topic (three-segment: prefix + model ID + stream ID); `auto_publish_results` is enabled by default.

### 3.1 Inference Result Payload

```json
{
  "model_id": "person_v1",
  "stream_id": "cam0_main",
  "frame_sequence": 42,
  "objects": [
    { "label": "person", "confidence": 0.92,
      "bbox": { "x": 0.15, "y": 0.20, "width": 0.30, "height": 0.55 } }
  ],
  "infer_time_us": 8500
}
```

The result type in the payload depends on the model: detection models populate `objects`, classification models populate `classifications`, and pose models populate `landmarks`.

### 3.2 Consumer Example

The following code runs on a host that can reach the device's Event Bus TCP endpoint (`127.0.0.1:50053`):

```python
from hailo_ipc_sdk.events import EventClient

event_client = EventClient()  # Connects via the TCP endpoint

# Subscribe to a specific model
for event in event_client.subscribe("inference/person_v1/**"):
    persons = [o for o in event.payload.get("objects", [])
               if o["label"] == "person"]
    print(f"[{event.event_id}] Detected {len(persons)} persons")

# Wildcard subscribe to all models
for event in event_client.subscribe("inference/**"):
    model = event.topic.split("/")[-2]  # Three-segment topic; second-to-last segment is the model_id
    stream = event.payload.get("stream_id", "?")
    count = len(event.payload.get("objects", []))
    print(f"[{model}] stream={stream}, objects={count}")

# Filter by stream via metadata
for event in event_client.subscribe(
    "inference/**", filters={"stream": "cam0_sub"}
):
    print(f"Sub-stream: {event.event_id}")
```

## 4. Device Alarm Subscription

The device control service automatically publishes the following events:

| Event Topic | Trigger Condition | Key Fields |
|:---|:---|:---|
| `device/temperature_alert` | Temperature exceeds threshold (75°C warning / 85°C critical) | `temperature`, `level` |
| `device/gpio_change` | GPIO state change | `pin`, `value` |
| `device/ircut_night` | IR-Cut switched to night mode | `mode` |
| `device/light_sensor_change` | Light sensor reading change | `value` |
| `device/ptz_move_complete` | PTZ action completed | `preset_id` |

> The above event types are derived from the firmware `DeviceEvent` enumeration; actual availability and fields depend on the hardware configuration and firmware version.

The Application Manager publishes lifecycle events: `app/started`, `app/stopped`, `app/installed`, `app/uninstalled`.

```python
from hailo_ipc_sdk.events import EventClient

event_client = EventClient()  # Connects via the TCP endpoint

for event in event_client.subscribe("device/**"):
    level = event.payload.get("level", "info")
    if level == "critical":
        temp = event.payload.get("temperature")
        print(f"[Critical] Device temperature {temp}°C")
```

## 5. REST API Remote Management

External systems manage events and applications via HTTP endpoints without requiring a gRPC connection. Authentication is enabled by default; all requests must first log in to obtain a Token and carry it.

### 5.1 Token Authentication

```bash
# Log in to obtain a Token
curl -X POST http://192.168.1.100:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Carry the Token in requests (choose one of three)
curl -H "Authorization: Bearer <token>" ...
curl -H "X-API-Key: <token>" ...
curl "ws://...?token=<token>"  # WebSocket
```

### 5.2 Events API

```bash
# List current subscription patterns (returns subscriber patterns, not published topics)
curl http://192.168.1.100:8080/api/v1/events/topics

# Publish an event
curl -X POST http://192.168.1.100:8080/api/v1/events/publish \
  -H "Content-Type: application/json" \
  -d '{"topic": "app/custom_alert", "payload": {"type": "intrusion"}}'
```

WebSocket real-time subscription (browser side):

```javascript
const ws = new WebSocket("ws://192.168.1.100:8080/api/v1/events/stream?token=<token>");
ws.onmessage = (e) => {
  const d = JSON.parse(e.data);
  console.log(`[${d.topic}]`, d.payload);
};
```

## 6. Business System Integration Patterns

### 6.1 Single-Device Direct Connection

Obtain events from a single device directly via WebSocket or REST API; suitable for scenarios with few devices and high real-time requirements.

```
NE503 ──HTTP/WebSocket──> Business Server
```

### 6.2 Multi-Device MQTT Aggregation

Each device runs a bridge program; events are aggregated to a central MQTT Broker, with the device identifier carried in the Topic to distinguish sources:

```
NE503 #1 ─┐
NE503 #2 ─┤──MQTT Bridge──> Broker ──> Business Service
NE503 #3 ─┘
```

When bridging, use `f"ne503/{DEVICE_ID}/{event.topic}"` as the MQTT Topic.

### 6.3 Webhook Forwarding

Same pattern as MQTT bridging (§2) -- subscribe to events and forward them to an external business endpoint via HTTP POST:

```python
import requests
for event in event_client.subscribe("inference/**"):
    requests.post(WEBHOOK_URL, json={"topic": event.topic, "payload": event.payload}, timeout=5)
```

The bridge program must likewise run on the device itself (50053 is loopback-only).

## 7. Related Documentation

- [RESTful API Reference](./3-restful-api.md) — Complete reference for all HTTP endpoints
- [System Architecture · Platform Services Layer](../../3-software-guide/0-system-architecture.md) — Responsibilities and source pointers for services such as the Event Bus
- [Application Development Reference](./0-app-reference.md) — Building custom applications based on the SDK
