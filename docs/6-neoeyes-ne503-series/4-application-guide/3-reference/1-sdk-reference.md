---
description: NE503 Python SDK (hailo_ipc_sdk) 使用指南：一分钟跑通第一个推理，各模块解决什么问题，以及推理订阅用 sub/third、自训模型走 raw_output_only 等平台特有约束。
keywords: [NE503 SDK, Python SDK, hailo_ipc_sdk, InferenceClient, 推理订阅, sub流, raw_output_only, EventClient]
tags: [SDK参考, NE503, Python, 应用开发, 开发者]
---

# SDK Reference

`hailo_ipc_sdk` 是 NE503 容器应用的 Python SDK。它在容器内通过 gRPC / Unix Socket 直连平台的 AI Runtime、Event Bus、Device Control 等服务，让你不用碰底层协议就能做推理、收事件、控设备。典型作用是把一行

```python
for seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
```

变成「每一帧视频都实时返回检测结果」。

> **完整 API 签名以官方 Sphinx 文档站为权威**：[英文站](https://camthink-ai.github.io/neoruntime-sdks/python/en/index.html) / [中文站](https://camthink-ai.github.io/neoruntime-sdks/python/zh/index.html)，包含每个类和方法的全部参数、返回类型与代码示例。本文不复述签名，只讲两件 wiki 独有的事：**每个模块解决什么问题、怎么选**，以及 **NE503 平台特有的调用约束**。

安装方式：设备上随应用镜像携带，本地开发见[开发者指南 §2 Docker 开发环境](../../3-software-guide/1-developer-guide.md#2-docker-开发环境)。C++ 版 SDK 与 Python 模块一一镜像，C++ API 见 [Doxygen 文档站](https://camthink-ai.github.io/neoruntime-sdks/cpp/en/)。

## 1. 一分钟跑通

以最常见、也是多数 AI 应用的骨架——「订阅视频流做实时推理」为例：

```python
from hailo_ipc_sdk import InferenceClient

inf = InferenceClient()
for seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    print(f"Frame {seq}: {len(result.objects)} objects")
    for obj in result.objects:
        print(f"  {obj.label}: {obj.score:.2f} @ [{obj.bbox.x:.2f}, {obj.bbox.y:.2f}]")
```

三段就能跑：**订阅推理流 → 传模型真实名 → 遍历每帧结果**。上面的 `stream` 和 `model` 是示例值，部署前必须换成设备真实值（先 `list_streams()` / `list_models()` 查，不能写死——见[平台特有约束 §3.2](#32-流名与模型名不能写死)）。

订阅范式（阻塞迭代器、优雅退出）与完整可运行示例见 [SDK 工作流 §3 调用范式](../1-app-development/0-sdk-workflow.md#3-调用范式) 和 [SDK 示例](./2-sdk-examples.md)。

## 2. 每个模块解决什么问题

SDK 按平台能力拆成多个模块，每个 `XxxClient` 对应设备上的一个服务。**先看这张表选模块，再点进对应页面查完整 API**：

| 模块 | 解决什么问题 | 核心类 | 完整 API |
|:---|:---|:---|:---|
| `inference` | AI 推理：单帧 `infer`、流式 `subscribe`、模型管理 | `InferenceClient` | [官方站 inference](https://camthink-ai.github.io/neoruntime-sdks/python/zh/api/inference.html) |
| `media` | 零拷贝取视频帧（DMA-BUF）、H.264 编码流 | `FdMediaClient`、`EncodedStreamClient` | [官方站 media](https://camthink-ai.github.io/neoruntime-sdks/python/zh/api/media.html) |
| `events` | 事件总线：发布/订阅/批量、通配符主题 | `EventClient` | [官方站 events](https://camthink-ai.github.io/neoruntime-sdks/python/zh/api/events.html) |
| `device` | 外设控制：灯光、云台、镜头、GPIO、Wiegand、RS-485 | `DeviceClient` | [官方站 device](https://camthink-ai.github.io/neoruntime-sdks/python/zh/api/device.html) |
| `app` | 应用生命周期：安装/启停/卸载/日志（通常由 Web 控制台承担） | `AppClient` | [官方站 app](https://camthink-ai.github.io/neoruntime-sdks/python/zh/api/app.html) |
| `plugin` | gRPC 插件发现与托管（扩展平台能力的高级用法） | `PluginDiscovery`、`PluginServer` | [官方站 plugin](https://camthink-ai.github.io/neoruntime-sdks/python/zh/api/plugin.html) |
| `config` | 读环境变量拿连接端点，/ 容器内外路径转换 | `Config` | [官方站 config](https://camthink-ai.github.io/neoruntime-sdks/python/zh/api/config.html) |
| `camera` | 摄像头底层：ISP、编码器、RTSP、OSD、AI 叠加 | `CameraClient` | 官方站未收录，见[源码 camera.py](https://github.com/camthink-ai/neoruntime-sdks/blob/main/python/hailo_ipc_sdk/camera.py) |
| `overlay` | 把检测框叠加到画面（RTSP/Web） | `OverlayClient` | 官方站未收录，见[源码 overlay.py](https://github.com/camthink-ai/neoruntime-sdks/blob/main/python/hailo_ipc_sdk/overlay.py) |
| `audio` / `audio_stream` | 音频采集/播放、双向对讲 | `AudioClient`、`AudioStreamClient` | 官方站未收录，见[源码 audio.py](https://github.com/camthink-ai/neoruntime-sdks/blob/main/python/hailo_ipc_sdk/audio.py) |

**选模块的方法**：先问「我要做什么」，再对表找对应 Client。绝大多数容器应用只用到前三个——`inference`（推理）+ `events`（告警联动）+ `device`（必要时控硬件）。`app`/`plugin`/`camera`/`audio` 属高级用法，用到时再查。

## 3. 平台特有的约束

这几条是 NE503 实机上踩过的坑，官方文档站没有，**部署前必须理解**。

### 3.1 推理订阅用 `sub`/`third`，`main` 只发编码流

`main` 流只发编码后的 H.264，**没有原始帧、没有推理数据**。`inference.subscribe()` 和 `media` 的帧获取只能订阅发布 NV12 原始帧的流：`sub` 或 `third`（`third` 是平台默认推理流）。用 `main` 订阅推理会永久挂起或拿不到结果。

> 注意：SDK 的 `FdMediaClient().list_streams()` 当前**硬编码**返回 `['main', 'sub']`，未列出 `third`。要核对设备实际可用流，用 `aipc-cli stream list` 或 `CameraClient().get_stream_status()`。

三路码流的完整约束（分辨率/编码/原始帧/推理分发）见[视频与成像 · RTSP 对接](../../2-user-guide/1-media-and-image.md#rtsp-对接)。

### 3.2 流名与模型名不能写死

本页示例里的 `stream="sub"`、`model="hailo_yolov8n_384_640"` 是**示例值**。模型名随设备预置可改，推理流随配置可增删（`main`/`sub`/`third`）。部署前在设备上跑一遍：

```python
from hailo_ipc_sdk import InferenceClient, FdMediaClient
print(InferenceClient().list_models())   # 如 ['hailo_yolov8n_384_640']
print(FdMediaClient().list_streams())    # 硬编码返回 ['main', 'sub']，不含 third
```

把真实值填入 `app.py` 和 `app.yaml`，否则会 `NOT_FOUND` 或拿不到数据。

### 3.3 自训模型订阅要加 raw_output_only

设备内置后处理算子按 **预置模型** 的张量名查找输出，无法匹配自训 HEF 的张量名。自训模型走默认路径（`False`）结果为空，必须：

```python
for seq, result in inf.subscribe(stream="sub", model="<自训模型id>", raw_output_only=True):
    for tensor in result.raw_outputs:
        boxes = np.asarray(tensor).reshape(-1, 6)   # HailoRT NMS 输出
```

NMS 已在 HEF 编译时烤入，应用侧只做坐标换算与阈值过滤。完整说明见[模型训练与 HEF 部署 §7 部署到 NE503](../1-app-development/4-model-training-and-hef.md#7-部署到-ne503)。

### 3.4 订阅是阻塞迭代器，要做优雅退出

`subscribe()`（推理、事件、视频）都是阻塞生成器。Ctrl-C 无法直接打断，需捕获 `KeyboardInterrupt` 后 `close()` 释放连接，否则容器退出时可能残留连接。

```python
def main():
    inf = InferenceClient()
    try:
        for seq, result in inf.subscribe(stream="sub", model="..."):
            ...
    except KeyboardInterrupt:
        inf.close()
```

完整可运行示例见 [Person Detection 教程](../2-cookbook/1-person-detection.md)。

## 4. 环境变量与配置

`hailo_ipc_sdk` 通过环境变量拿到各服务连接端点（`AI_RUNTIME_ENDPOINT`、`EVENT_BUS_ENDPOINT` 等）和容器身份（`APP_ID`）。平台会在应用启动时自动注入，容器内**无需手动设置**。完整变量列表与意义见[应用参考 §7 环境变量参考](./0-app-reference.md#7-环境变量参考)。

## 相关文档

- [SDK 示例](./2-sdk-examples.md) — 从小到大 4 个完整应用
- [SDK 工作流](../1-app-development/0-sdk-workflow.md) — 从克隆到部署的开发流程与调用范式
- [应用参考](./0-app-reference.md) — 项目创建、app.yaml 配置、部署流程
- [Person Detection 教程](../2-cookbook/1-person-detection.md) — 完整真机案例
- [系统架构 · 平台服务层](../../3-software-guide/0-system-architecture.md) — AI Runtime、Event Bus 等服务职责与源码指针