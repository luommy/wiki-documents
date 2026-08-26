---
description: NE503 Python SDK 参考，说明 hailo_ipc_sdk 的安装包名、模块选择、服务端点、推理订阅和资源清理约束。
keywords: [NE503 SDK, Python SDK, hailo_ipc_sdk, InferenceClient, EventClient, FdMediaClient, 推理订阅]
tags: [SDK参考, NE503, Python, 应用开发, 开发者]
---

# SDK Reference

NE503 应用使用的 Python SDK 实际包名是 **`hailo_ipc_sdk`**，发行包名是 **`hailo-ipc-sdk`**，当前工程版本为 `0.4.0`。旧示例中的过时包名不是当前 SDK 的导入路径。

本页提供模块选择和平台约束；完整类、参数和返回值以 [neoruntime-sdks Python API 文档](https://github.com/camthink-ai/neoruntime-sdks/tree/main/python/docs/api) 为准。

## 1. 先确认包名和版本

代码导入：

```python
from hailo_ipc_sdk import InferenceClient, EventClient
```

构建镜像时使用的项目目录是 `python/hailo_ipc_sdk`，`setup.py` 的发行包名是 `hailo-ipc-sdk`。请让镜像中的 SDK 版本与平台版本匹配，不要只根据文档中的旧导入名判断安装是否成功。

检查容器内实际安装结果：

```bash
python -c "import hailo_ipc_sdk; print(hailo_ipc_sdk.__version__)"
```

SDK 工作流、镜像构建和部署步骤见 [SDK 工作流 §4 第一次调用](../1-app-development/0-sdk-workflow.md#4-完成第一次-sdk-调用)。

## 2. 按任务选择模块

以下类由 `hailo_ipc_sdk` 顶层导出；完整签名不要在应用文档中重复维护，请直接打开 SDK API 文档。

| 任务 | 类 | 主要能力 |
|:---|:---|:---|
| AI 单帧和流式推理 | `InferenceClient` | `infer()`、`infer_batch()`、`subscribe()`、模型查询和注册 |
| 原始视频帧 | `FdMediaClient` | DMA-BUF/原始帧订阅、单帧读取、码流枚举 |
| 编码视频 | `EncodedStreamClient` | 编码帧读取和连续订阅 |
| Event Bus | `EventClient` | 发布、批量发布、订阅、主题查询和统计 |
| 设备控制 | `DeviceClient`、`IrCutMode` | 灯光、IR-CUT、PTZ、镜头和 GPIO |
| 摄像头管线 | `CameraClient` | ISP、编码器、RTSP、OSD、配置和流状态 |
| AI 叠加 | `OverlayClient` | 配置和应用 AI overlay |
| 应用管理 | `AppClient` | 应用列表、状态、统计和日志 |
| 音频控制 | `AudioClient`、`AudioStreamClient` | 音频设备、采集、播放和流 |
| 运行时配置 | `Config` | 读取应用 ID、IPC 端点和调试开关 |
| 插件 | `PluginDiscovery`、`PluginServer` | 发现能力、提供插件服务 |

一个应用可以组合多个客户端，但每个客户端都要在退出时关闭；长时间运行的订阅尤其不能依赖进程被强制结束来释放连接。

## 3. 平台约束

### 3.1 码流和模型名称必须来自目标设备

`InferenceClient.subscribe()` 的参数是 `stream`、`model`、`fps`、`session_id` 和 `raw_output_only`。名称是设备运行时资源，不是 SDK 常量：

```python
from hailo_ipc_sdk import FdMediaClient, InferenceClient

media = FdMediaClient()
inference = InferenceClient()

print("raw streams:", media.list_streams())
print("models:", [m.model_id for m in inference.list_models()])
```

确认实际资源后再把值传给 `subscribe()`。不同固件、摄像头配置和应用清单可能使用 `main`、`sub`、`third` 或其他码流名；不能把某个示例中的名称复制到所有设备。

### 3.2 `raw_output_only` 只用于原始输出

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

需要自己解析张量时才设置 `raw_output_only=True`，并从 `result.raw_outputs` 读取原始输出；需要使用 `objects`、`classifications`、`landmarks` 等 SDK 解析结果时保持默认值。

### 3.3 流式订阅是阻塞迭代器

`subscribe()` 会持续等待结果，调用线程会在 `for` 循环中阻塞。应用应处理退出信号，并在 `finally` 中关闭客户端：

```python
try:
    for frame_seq, result in inference.subscribe(
        stream="main", model="person_vehicle_v1", fps=10
    ):
        handle(result)
finally:
    inference.close()
```

停止生成器会取消底层流式 RPC；`close()` 仍然是应用退出时应保留的显式清理动作。`EventClient`、`FdMediaClient`、`DeviceClient` 等客户端同样适合使用上下文管理器或 `finally` 清理。

### 3.4 模型注册是受权限控制的操作

`register_model()` 只有在应用清单的 `inference.allow_register_model` 开启，并且模型路径、模型 ID 和设备运行时均满足要求时才应调用。普通推理应用只声明已注册模型，不要在启动阶段无条件注册。

## 4. 端点和容器环境

SDK 默认在容器内通过 Unix Socket 连接平台服务，也可以用环境变量覆盖：

| 环境变量 | 默认值 |
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

通常不需要在应用中手写这些端点；先确认 [应用参考](./0-app-reference.md) 的权限和容器配置，再使用 SDK 默认值。

## 5. 最小推理骨架

下面的 `main`、`person_vehicle_v1` 是工程示例中出现过的值，仅用于展示调用形态。部署前仍须按第 3.1 节查询并替换：

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

推理结果的字段和结果类型取决于模型；不要假设所有模型都会返回 `objects`。模型、码流和推理权限需要在 `app.yaml` 中一并声明。

## 6. 与开发流程的关系

- [SDK 工作流](../1-app-development/0-sdk-workflow.md) — 项目创建、镜像构建、部署和第一次调用
- [SDK 示例](./2-sdk-examples.md) — 订阅、事件发布、设备控制和退出清理
- [应用参考](./0-app-reference.md) — `app.yaml` 权限、环境变量和卷挂载
- [RESTful API 参考](./3-restful-api.md) — 外部 HTTP 管理接口，不重复 SDK 类签名
- [事件集成](./5-event-integration.md) — Event Bus 的主题、消息和跨系统接入
- [neoruntime-sdks Python API](https://github.com/camthink-ai/neoruntime-sdks/tree/main/python/docs/api) — SDK 的完整 API 参考
