---
description: NE503 Event Bus integration reference covering gRPC events, topic wildcards, inference and device producers, Python SDK, WebSocket, and MQTT bridges.
keywords: [NE503 Event Bus, event bus, topic, gRPC, WebSocket, MQTT, hailo_ipc_sdk]
tags: [System Integration, NE503, Event Bus, MQTT, WebSocket]
---

# Event Integration

The NE503 Event Bus is the device's internal publish/subscribe message hub. This page covers **event protocols and access methods**. For HTTP authentication and event-management requests, see [RESTful API Reference](./3-restful-api.md); for app permissions, see [App Reference](./0-app-reference.md).

## 1. Choose an access method

| Access method | Default endpoint | Use it for | Location |
|:---|:---|:---|:---|
| Python SDK | `unix:///run/aipc/event-bus.sock` | Publishing or subscribing inside a container | `hailo_ipc_sdk.events.EventClient` |
| gRPC | Same endpoint, as exposed by deployment | C++, Go, or custom services | `event.proto` |
| REST | `/api/v1/events/topics`, `/api/v1/events/publish` | External topic queries or publishing | API authentication required |
| WebSocket | `/api/v1/events/stream` | Browser or external real-time consumers | API authentication required |
| MQTT bridge | Bridge-specific | Existing MQTT platforms | Maintain the bridge process yourself |

If the device's internal gRPC TCP address is deployed on loopback, only the device itself can reach it. External hosts should use REST/WebSocket or an approved tunnel instead of assuming direct access.

## 2. Topic matching

Topics are hierarchical strings separated by `/`. The current matcher supports exact matches, single-level `*`, multi-level `**`, and the suffix form `**/suffix`.

| Subscription expression | Matches | Does not match |
|:---|:---|:---|
| `inference/model_a/main` | The exact topic | `inference/model_b/main` |
| `inference/*/main` | `inference/model_a/main` | `inference/model_a/sub/extra` |
| `inference/**` | `inference/model_a/main` and deeper topics | Topics outside `inference/` |
| `**/detections` | Any topic ending in `detections` | `.../detections/raw` |

Wildcards match topics; they do not parse payloads for the subscriber. Narrow subscriptions for high-throughput applications, and choose `queue_size`, `drop_old`, and consumer speed deliberately.

## 3. Event message structure

The protocol is defined in `platform/event-bus/proto/event.proto`:

```json
{
  "topic": "app/alert",
  "timestamp_ns": 1717545600000000000,
  "source": "people_counting",
  "event_id": "evt-1",
  "payload": "{\"type\":\"person_detected\"}",
  "payload_type": "json",
  "metadata": {
    "stream_id": "main"
  }
}
```

| Field | Type | Description |
|:---|:---|:---|
| `topic` | string | Topic name |
| `timestamp_ns` | uint64 | Timestamp in nanoseconds |
| `source` | string | Service name or application ID |
| `event_id` | string | Event ID; the publish response also returns an ID |
| `payload` | bytes | JSON or another encoded payload |
| `payload_type` | string | Commonly `json`; may also identify `protobuf` |
| `metadata` | map of string to string | Optional metadata |

The Python SDK converts JSON payloads into the `event.payload` dictionary. A raw gRPC client must parse the payload according to `payload_type`. Publish requests also support `persistent` and `ttl_ms`.

Subscribe requests support `topic`, `subscriber_id`, `filters`, `queue_size`, and `drop_old`. The service exposes `Publish`, `PublishBatch`, `Subscribe`, `Unsubscribe`, topic queries, and statistics RPCs.

## 4. Event producers and topic shapes

Prefixes help locate a producer, but they are not a complete fixed enumeration:

| Producer | Source-code topic shape | Meaning |
|:---|:---|:---|
| App Manager | `app/{eventType}` | App install, start, stop, and lifecycle events |
| Device Control | `device/{eventType}` | Device-control events |
| Normal AI Runtime results | `inference/{model_id}/{stream_id}` | Result path in `grpc_service.cpp` |
| AI Runtime auto-inference path | `inference/{stream_id}` | Another result path in `auto_infer.cpp` |
| App-defined events | App-defined | Keep names consistent with conventions such as `app/{app_id}/...` |

The two AI Runtime paths in source do not have the same number of segments. When consuming inference events, inspect topics produced by the target build and use `event.metadata` or the payload to identify the model and stream. Do not hardcode a three-segment topic for every firmware version.

## 5. Python SDK: publish and subscribe

```python
from hailo_ipc_sdk.events import EventClient


def main():
    with EventClient() as events:
        events.publish(
            "app/people_counting/stats",
            {"current_count": 2, "threshold": 10},
            metadata={"stream_id": "main"},
        )

        for event in events.subscribe(
            "app/**",
            queue_size=100,
            drop_old=True,
        ):
            print(event.topic, event.payload, event.source)


if __name__ == "__main__":
    main()
```

`EventClient` also provides `publish_batch()`, `on_event()`, `unsubscribe()`, `list_topics()`, `get_topic_info()`, `get_stats()`, and `get_topic_stats()`. Subscription is a blocking iterator; long-running apps should handle shutdown and call `close()`.

### 5.1 Manifest permissions

Declare the topic range in `app.yaml` before an app uses Event Bus:

```yaml
permissions:
  events:
    publish:
      - app/people_counting/*
    subscribe:
      - inference/**
```

Publish and subscribe permissions are checked separately. Do not use a broad `**` just for convenience unless the application genuinely needs every topic.

## 6. WebSocket: external real-time subscription

The event WebSocket path is:

```text
wss://<device-ip>/api/v1/events/stream
```

Log in through REST first, then follow the authentication conventions in [RESTful API Reference](./3-restful-api.md). Source starts the server-side event stream with a wildcard Event Bus subscription and forwards events to WebSocket clients; a topic filter appended to the URL is therefore not a substitute for client-side filtering. Filter by `topic`, `source`, or payload, and handle reconnects and duplicate events.

For device-internal app-to-app communication, prefer the SDK/gRPC Unix Socket. WebSocket is better suited to browsers, gateways, and external monitoring systems.

## 7. MQTT bridge

MQTT is not a native Event Bus protocol. A bridge subscribes to Event Bus and converts each event into an MQTT message:

```python
import json
import os

import paho.mqtt.client as mqtt
from hailo_ipc_sdk.events import EventClient


mqtt_client = mqtt.Client(client_id=os.environ["MQTT_CLIENT_ID"])
mqtt_client.username_pw_set(
    os.environ["MQTT_USERNAME"], os.environ["MQTT_PASSWORD"]
)
mqtt_client.connect(os.environ["MQTT_HOST"], int(os.environ.get("MQTT_PORT", "1883")))
mqtt_client.loop_start()

events = EventClient()
try:
    for event in events.subscribe("**"):
        payload = json.dumps({
            "timestamp_ns": event.timestamp_ns,
            "source": event.source,
            "event_id": event.event_id,
            "payload": event.payload,
            "metadata": event.metadata,
        })
        mqtt_client.publish(f"ne503/{event.topic}", payload, qos=1)
finally:
    events.close()
    mqtt_client.loop_stop()
    mqtt_client.disconnect()
```

Production bridges also need TLS, secret management, reconnects, QoS, and duplicate-event handling. Never place credentials in documentation examples or image source.

## 8. Three integration decisions

1. **Topic scope:** subscribe to the smallest useful set to avoid filling queues with unrelated events.
2. **Message semantics:** retain business objects, timestamps, and idempotency keys in the payload; do not rely only on receive time.
3. **Failure behavior:** define reconnect, stale-message, duplicate-consumption, and downstream-outage behavior for SDK, WebSocket, and MQTT consumers.

## 9. Related documentation

- [App Reference](./0-app-reference.md) — Event Bus permissions and app manifests
- [SDK Reference](./1-sdk-reference.md) — SDK package, clients, and endpoints
- [SDK Examples](./2-sdk-examples.md) — inference-to-event application skeleton
- [RESTful API Reference](./3-restful-api.md) — REST events, authentication, and WebSocket paths
- [event.proto](https://github.com/camthink-ai/neoruntime/blob/main/platform/event-bus/proto/event.proto) — Event Bus protocol source
