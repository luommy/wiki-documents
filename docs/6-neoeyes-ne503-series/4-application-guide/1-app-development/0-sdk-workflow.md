---
id: sdk-workflow
title: SDK Workflow
sidebar_position: 0
description: "NE503 Python SDK（neoruntime_ipc_sdk）单页上手流程：准备源码、把 SDK 放进应用镜像、声明权限、完成第一次调用并部署验证。"
keywords: [NE503, Python SDK, neoruntime_ipc_sdk, SDK 嵌入, 容器应用, build_app.sh, 权限]
tags: [应用开发, NE503, SDK, 入门]
---

# SDK Workflow

本页只走一条线：**准备源码 → 把 SDK 放进镜像 → 声明权限 → 调用 SDK → 构建部署 → 验收**。完成后，你可以直接从示例应用开始改业务逻辑。

## 1. 先了解两个前提

`neoruntime_ipc_sdk` 运行在 **NE503 应用容器内**，通过平台注入的 Unix Socket 调用 AI Runtime、Event Bus 和 Device Control。应用代码不直接访问硬件或推理引擎。

SDK **不在 PyPI 上**。设备容器默认不能联网执行 `pip install`，所以 SDK 必须在构建镜像时随应用一起带入。SDK 已包含生成好的 protobuf 文件，不需要手动生成。

常用客户端如下：

| 你要做什么 | 客户端 | 常用调用 |
|:---|:---|:---|
| 订阅推理结果或执行单帧推理 | `InferenceClient` | `subscribe()`、`infer()` |
| 发布或订阅应用事件 | `EventClient` | `publish()`、`subscribe()` |
| 控制灯光、镜头、云台等外设 | `DeviceClient` | `set_white_light()`、`set_ircut()` 等 |

## 2. 准备项目并嵌入 SDK

把 SDK 仓库和应用仓库 clone 到同一个父目录：

```bash
git clone https://github.com/camthink-ai/neoruntime-sdks.git
git clone https://github.com/camthink-ai/neoruntime-apps.git
```

### 推荐：使用统一构建脚本

示例应用使用 `neoruntime-apps/scripts/build_app.sh`。脚本会从旁边的 `neoruntime-sdks` 复制 SDK，使用 Docker buildx 构建 ARM64 镜像，并打包成 `.aipc`：

```bash
cd neoruntime-apps
./scripts/build_app.sh examples/person-detection
```

### 自建项目：在 Dockerfile 中安装

如果项目不在示例仓库结构中，直接把 SDK 复制进镜像：

```dockerfile
COPY neoruntime_ipc_sdk /app/neoruntime_ipc_sdk
RUN pip install --no-cache-dir /app/neoruntime_ipc_sdk
```

需要分发独立 SDK 产物时，可先构建通用 wheel：

```bash
cd neoruntime-sdks/python
pip wheel . --no-deps -w dist/
```

再在 Dockerfile 中安装生成的 `neoruntime_ipc_sdk-<version>-py3-none-any.whl`。无论采用哪种方式，最终镜像中必须存在 `neoruntime_ipc_sdk`。

## 3. 让 `app.yaml` 声明你要用的权限

平台不会因为代码调用了某个 SDK 方法就自动开放权限。`app.yaml` 中的 `permissions` 必须覆盖应用实际访问的流、模型、事件主题和外设；缺少声明时，调用会被平台拒绝。

下面是一个只订阅推理流的最小示例。只添加应用真正需要的权限：

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

如果应用还要发事件或控制设备，再增加对应的 `events`、`device` 字段。权限中的模型名、流名和主题必须与设备及代码中的真实值一致。

## 4. 完成第一次 SDK 调用

先在设备上查询可用模型和视频流，不要把示例值直接当成真实值：

```python
from neoruntime_ipc_sdk import FdMediaClient, InferenceClient

inf = InferenceClient()
media = FdMediaClient()
print("models:", inf.list_models())
print("streams:", media.list_streams())
```

再把真实模型名填入订阅代码：

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

记住三条平台约束：

- 推理订阅使用发布原始帧的 `sub` 或 `third`；`main` 只有 H.264 编码流，不能用于推理订阅。
- `stream` 和 `model` 必须使用设备真实值，否则会出现 `NOT_FOUND` 或一直拿不到结果。
- 自训 HEF 订阅时增加 `raw_output_only=True`，由应用自行解码 NMS 原始输出；预置模型不需要这个参数。

除了订阅推理，SDK 的常见调用方式还有：

```python
from neoruntime_ipc_sdk import DeviceClient, EventClient

events = EventClient()
events.publish("app/<app-id>/person_detected", {"count": 1})

device = DeviceClient()
device.set_white_light(80)
```

`subscribe()` 是阻塞迭代器。应用收到 `KeyboardInterrupt` 或 `SIGTERM` 时要关闭客户端，避免容器退出后留下连接。

## 5. 构建、部署和验收

### 5.1 构建

以示例应用为起点：

```bash
cd neoruntime-apps
./scripts/build_app.sh examples/person-detection
```

构建脚本会生成包含 `app.yaml` 和 ARM64 镜像的 `.aipc` 包。

### 5.2 部署

1. 登录 NE503 Web Console，进入 **App Management**；
2. 点击 **Import**，选择 **Upload Package**；
3. 上传 `.aipc` 文件，等待安装完成；
4. 在应用卡片上点击 **Start**。

### 5.3 验收

应用状态变为 **Running** 后，检查应用日志：

- 能看到应用启动日志；
- `list_models()` 能返回设备模型；
- 订阅循环持续收到帧或事件；
- 使用设备控制时，外设动作与代码逻辑一致。

如果应用没有输出，先检查模型和流名称，再检查 `app.yaml` 权限，最后确认没有误用 `main` 流。

## 6. 继续阅读

- [SDK 参考](../3-reference/1-sdk-reference.md) —— 完整客户端和 NE503 平台约束；
- [SDK 示例](../3-reference/2-sdk-examples.md) —— 计数、事件告警、设备控制和级联推理示例；
- [人员检测](../2-cookbook/1-person-detection.md) —— 一个包含完整业务逻辑和真机验证的应用案例。
