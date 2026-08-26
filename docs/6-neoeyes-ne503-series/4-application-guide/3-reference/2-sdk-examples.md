---
description: NE503 Python SDK 实战示例，使用当前 hailo_ipc_sdk 展示推理订阅、事件发布、设备控制和退出清理。
keywords: [NE503 SDK 示例, hailo_ipc_sdk, InferenceClient, EventClient, DeviceClient, 推理, 事件]
tags: [SDK示例, NE503, Python, 推理, 事件集成]
---

# SDK Examples

本页只保留四种最常见的业务骨架。代码使用工程仓库当前的导入路径和客户端方法；`stream`、`model` 和权限仍必须按目标设备确认。

完整项目、`app.yaml` 和构建文件见 [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps)。部署步骤见 [SDK 工作流](../1-app-development/0-sdk-workflow.md)。

## 1. 订阅推理并统计目标

`InferenceClient.subscribe()` 返回 `(frame_seq, result)`。检测结果可以直接使用 `count_by_label()` 或遍历 `result.objects`：

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
            count = result.count_by_label("person")
            if count:
                print(f"frame={frame_seq}: {count} person(s)")
    finally:
        inference.close()


if __name__ == "__main__":
    main()
```

这段骨架对应仓库中的 [object-detection 示例](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/object-detection/app.py) 和 [people-counting 示例](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/people-counting/app.py)。不要默认所有模型都有 `objects`；分类、姿态、OCR 等模型要按实际结果字段处理。

## 2. 推理结果发布为业务事件

应用可以把检测结果转换成自己的业务事件。事件主题需要同时出现在清单的 `events.publish` 白名单中：

```python
from hailo_ipc_sdk import EventClient, InferenceClient


def main():
    inference = InferenceClient()
    events = EventClient()
    try:
        for frame_seq, result in inference.subscribe(
            stream="main",
            model="person_vehicle_v1",
            fps=10,
        ):
            count = result.count_by_label("person")
            if count > 0:
                events.publish(
                    "app/alert",
                    {
                        "type": "person_detected",
                        "count": count,
                        "frame_sequence": frame_seq,
                    },
                )
    finally:
        inference.close()
        events.close()


if __name__ == "__main__":
    main()
```

`EventClient.publish()` 还支持 `persistent=True`、`ttl_ms` 和 `metadata`。持久化、通配符订阅以及消息字段见 [事件集成](./5-event-integration.md)。

## 3. 推理结果驱动设备控制

使用 `DeviceClient` 前，先在 `app.yaml` 中声明对应的设备权限。下面只展示工程仓库已使用的白光灯控制：

```python
from hailo_ipc_sdk import DeviceClient, InferenceClient


def main():
    inference = InferenceClient()
    device = DeviceClient()
    light_on = False
    try:
        for _, result in inference.subscribe(
            stream="main",
            model="person_vehicle_v1",
            fps=10,
        ):
            detected = result.has_person()
            if detected and not light_on:
                device.set_white_light(100)
                light_on = True
            elif not detected and light_on:
                device.set_white_light(0)
                light_on = False
    finally:
        if light_on:
            device.set_white_light(0)
        inference.close()
        device.close()


if __name__ == "__main__":
    main()
```

完整的阈值、告警去重、统计窗口和信号处理可参考 [people-counting 示例](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/people-counting/app.py)。PTZ、镜头、IR-CUT 和 GPIO 的方法与权限不要在没有硬件能力确认时直接启用。

## 4. 长时间运行与优雅退出

流式订阅是阻塞迭代器。生产应用至少要做到三件事：接收 `SIGINT`/`SIGTERM`，停止主循环，关闭所有 SDK 客户端：

```python
import signal

from hailo_ipc_sdk import EventClient, InferenceClient


running = True


def stop(_signum, _frame):
    global running
    running = False


signal.signal(signal.SIGINT, stop)
signal.signal(signal.SIGTERM, stop)

inference = InferenceClient()
events = EventClient()
try:
    for frame_seq, result in inference.subscribe(
        stream="main", model="person_vehicle_v1", fps=10
    ):
        if not running:
            break
        # 处理 result
finally:
    inference.close()
    events.close()
```

仓库的 people-counting 和 object-detection 示例都在退出路径关闭客户端。`face-cascade` 目录当前的 `main.py` 实际仍是“人员检测后发布告警”的简单示例，不是完整的裁剪后二次推理实现；不要把其 README 中的级联描述当作已验证的级联代码。

## 5. 从示例到可部署应用

1. 复制一个与业务最接近的 `neoruntime-apps/examples` 项目。
2. 把导入路径统一为 `hailo_ipc_sdk`。
3. 用目标设备的真实码流、模型 ID 和事件主题替换示例值。
4. 在 `app.yaml` 中只声明代码实际用到的权限，并按 [应用参考](./0-app-reference.md) 配置资源、卷和健康检查。
5. 构建镜像、安装应用、启动应用，再查看应用日志和设备侧结果。

## 6. 相关文档

- [SDK 参考](./1-sdk-reference.md) — 包名、模块、端点和平台约束
- [SDK 工作流](../1-app-development/0-sdk-workflow.md) — 构建、部署和第一次调用
- [应用参考](./0-app-reference.md) — `app.yaml` 和权限
- [事件集成](./5-event-integration.md) — Event Bus 接入
- [RESTful API 参考](./3-restful-api.md) — 外部系统管理接口
