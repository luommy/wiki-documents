---
description: NE503 Event Bus 集成参考，说明 gRPC 事件协议、主题通配符、推理与设备事件来源、Python SDK、WebSocket 和 MQTT 桥接。
keywords: [NE503 Event Bus, 事件总线, Topic, gRPC, WebSocket, MQTT, hailo_ipc_sdk]
tags: [系统集成, NE503, 事件总线, MQTT, WebSocket]
---

# Event Integration

NE503 的 Event Bus 是设备内部的发布/订阅消息中枢。本页只讲**事件协议和接入方式**；HTTP 认证、请求体和事件管理接口请看 [RESTful API 参考](./3-restful-api.md)，应用权限请看 [应用参考](./0-app-reference.md)。

## 1. 先选择接入方式

| 接入方式 | 默认端点 | 适用场景 | 位置 |
|:---|:---|:---|:---|
| Python SDK | `unix:///run/aipc/event-bus.sock` | 容器内应用发布或订阅 | 使用 `hailo_ipc_sdk.events.EventClient` |
| gRPC | 同上；由部署环境提供可达端点 | C++、Go 或自定义服务 | 使用 `event.proto` |
| REST | `/api/v1/events/topics`、`/api/v1/events/publish` | 外部系统查询主题或发布事件 | 需要 API 认证 |
| WebSocket | `/api/v1/events/stream` | 浏览器或外部系统实时接收 | 需要 API 认证 |
| MQTT 桥接 | 由桥接程序连接上述接口 | 对接已有 MQTT 平台 | 需要自己维护桥接进程 |

设备内部的 gRPC TCP 地址如果被部署为 loopback，只能由设备本机访问；外部主机不要假设可以直接连接，应使用 REST/WebSocket 或经批准的隧道方案。

## 2. 主题匹配

主题使用 `/` 分隔的层级字符串。当前匹配器支持精确匹配、`*` 单级匹配、`**` 多级匹配，以及 `**/suffix` 形式的后缀匹配。

| 订阅表达式 | 匹配示例 | 不匹配示例 |
|:---|:---|:---|
| `inference/model_a/main` | 完全相同的主题 | `inference/model_b/main` |
| `inference/*/main` | `inference/model_a/main` | `inference/model_a/sub/extra` |
| `inference/**` | `inference/model_a/main`、更深层级主题 | 不属于 `inference/` 的主题 |
| `**/detections` | 任意前缀下以 `detections` 结尾的主题 | `.../detections/raw` |

通配符只解决主题匹配，不会替订阅者解析 payload。高吞吐场景应缩小订阅范围，并根据 `queue_size`、`drop_old` 和消费者处理速度做取舍。

## 3. Event 消息结构

协议定义在工程源码 `platform/event-bus/proto/event.proto`：

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

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `topic` | string | 主题名称 |
| `timestamp_ns` | uint64 | 纳秒时间戳 |
| `source` | string | 服务名或应用 ID |
| `event_id` | string | 事件 ID；发布响应也会返回 ID |
| `payload` | bytes | JSON 或其他编码的内容 |
| `payload_type` | string | 当前常用 `json`，也可标记 `protobuf` |
| `metadata` | map of string to string | 可选元数据 |

Python SDK 的 `EventClient` 会把 JSON payload 转为 `event.payload` 字典；原始 gRPC 客户端需要根据 `payload_type` 自己解析。发布请求还支持 `persistent` 和 `ttl_ms`。

订阅请求支持 `topic`、`subscriber_id`、`filters`、`queue_size` 和 `drop_old`；服务端提供 `Publish`、`PublishBatch`、`Subscribe`、`Unsubscribe`、主题查询和统计 RPC。

## 4. 事件来源与主题形态

主题前缀用于快速定位来源，但不是固定的全量枚举：

| 来源 | 源码中的主题形态 | 说明 |
|:---|:---|:---|
| App Manager | `app/{eventType}` | 应用安装、启动、停止等生命周期事件 |
| Device Control | `device/{eventType}` | 设备控制服务发布的设备事件 |
| AI Runtime 常规结果 | `inference/{model_id}/{stream_id}` | `grpc_service.cpp` 的结果发布路径 |
| AI Runtime 自动推理路径 | `inference/{stream_id}` | `auto_infer.cpp` 中的另一条发布路径 |
| 应用自定义事件 | 由应用自行定义 | 应与 `app/{app_id}/...` 等命名约定保持一致 |

AI Runtime 的两条源码路径并不具有相同的段数。订阅第三方推理结果时优先使用设备当前实际出现的主题，并结合 `event.metadata` 或 payload 判断模型和码流；不要对所有固件版本都硬编码三段式主题。

## 5. Python SDK：发布与订阅

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

`EventClient` 还提供 `publish_batch()`、`on_event()`、`unsubscribe()`、`list_topics()`、`get_topic_info()`、`get_stats()` 和 `get_topic_stats()`。订阅是阻塞迭代器；长时间运行的应用应处理退出信号并调用 `close()`。

### 5.1 权限清单

应用使用 Event Bus 前，在 `app.yaml` 中声明主题范围：

```yaml
permissions:
  events:
    publish:
      - app/people_counting/*
    subscribe:
      - inference/**
```

发布和订阅权限分别校验。不要为了省事使用过大的 `**`，除非应用确实需要接收所有主题。

## 6. WebSocket：外部实时订阅

事件 WebSocket 路径为：

```text
wss://<设备IP>/api/v1/events/stream
```

先通过 REST 登录，再按 [RESTful API 参考](./3-restful-api.md) 的认证约定建立连接。服务端在源码中以通配符订阅 Event Bus，再把事件转发给 WebSocket 客户端；因此 URL 上附加的主题过滤不能替代客户端过滤。客户端应根据 `topic`、`source` 或 payload 做二次筛选，并处理断线重连和重复事件。

如果业务只需要设备内的应用间通信，优先使用 Unix Socket 上的 SDK/gRPC；WebSocket 更适合浏览器、网关或外部监控系统。

## 7. MQTT 桥接

MQTT 不是 Event Bus 的原生协议。桥接程序作为 Event Bus 订阅者，再把事件转换成 MQTT 消息：

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

生产桥接需要补充 TLS、认证密钥管理、重连、QoS 和重复事件处理。不要把账号密码写入文档示例或镜像源码。

## 8. 集成落地时的三个决定

1. **主题范围**：按业务订阅最小主题集合，避免无关事件挤占队列。
2. **消息语义**：payload 中保留业务对象、时间戳和必要的幂等键；不要只依赖接收时间。
3. **失败处理**：为 SDK、WebSocket 和 MQTT 消费者定义重连、丢弃旧消息、重复消费和下游不可用时的策略。

## 9. 相关文档

- [应用参考](./0-app-reference.md) — Event Bus 权限和应用清单
- [SDK 参考](./1-sdk-reference.md) — SDK 包名、客户端和端点
- [SDK 示例](./2-sdk-examples.md) — 推理到事件的完整调用骨架
- [RESTful API 参考](./3-restful-api.md) — 事件 REST、认证和 WebSocket 路径
- [event.proto](https://github.com/camthink-ai/neoruntime/blob/main/platform/event-bus/proto/event.proto) — Event Bus 协议源码
