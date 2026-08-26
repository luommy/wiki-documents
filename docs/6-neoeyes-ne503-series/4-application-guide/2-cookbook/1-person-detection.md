---
id: person-detection
title: Person Detection
description: 在 NE503 上运行 Person Detection 示例，完成原始视频流推理、人员事件发布和可选补光灯联动。
keywords: [NE503, Person Detection, 人员检测, AI 推理, Python SDK, 事件总线, Cookbook]
tags: [NE503, 应用开发, Cookbook, 人员检测, 事件集成]
---

# Person Detection

本文使用 `neoruntime-apps/examples/person-detection`，完成一个最小的容器化人员检测应用：订阅原始视频流，调用设备上的 `person-detection` 模型，发布检测事件，并在设备支持时触发白光。

完整代码、清单和 Dockerfile 见 [Person Detection 示例目录](https://github.com/camthink-ai/neoruntime-apps/tree/main/examples/person-detection)。本文只保留能让你跑通示例的步骤。

## 1. 应用链路

```text
third.raw 原始帧
      ↓
person-detection 模型推理
      ↓
app.py 过滤 label=person 且达到阈值的目标
      ├─ app/person-detection/detection
      ├─ alerts/detection（按冷却时间发送）
      └─ DeviceClient.set_white_light(50)（可选）
```

当前示例的关键值来自仓库中的 `app.yaml` 和 `app.py`：

| 项目 | 当前值 | 用途 |
|:---|:---|:---|
| SDK 模块 | `hailo_ipc_sdk` | 容器内导入的 Python SDK |
| 视频权限 | `third.raw` | 原始视频流权限 |
| 订阅流 | `third` | `InferenceClient.subscribe()` 使用的流名 |
| 模型 ID | `person-detection` | 设备上必须可用的模型 |
| 检测阈值 | `0.7` | 清单注入的人员置信度门槛 |
| 告警主题 | `alerts/detection` | 按 `ALERT_COOLDOWN_SECONDS` 限制发送频率 |

不要把 `third`、`person-detection` 或 `hailo_ipc_sdk` 擅自替换成旧示例中的名称。若设备固件提供的模型或流名不同，必须同时修改 `app.yaml` 和 `app.py`，并先按设备实际值验证。

## 2. 获取示例并检查清单

克隆应用仓库和 SDK 仓库：

```bash
git clone https://github.com/camthink-ai/neoruntime-sdks.git
git clone https://github.com/camthink-ai/neoruntime-apps.git
cd neoruntime-apps/examples/person-detection
```

示例清单至少要包含以下权限和参数：

```yaml
permissions:
  video:
    - third.raw
  inference:
    models:
      - person-detection
    max_qps: 30
    max_concurrent: 2
    allow_register_model: false
  events:
    publish:
      - app/person-detection/*
      - alerts/detection
  device:
    light: true
    ir_cut: true

env:
  - name: DETECTION_THRESHOLD
    value: "0.7"
  - name: ALERT_COOLDOWN_SECONDS
    value: "5"
  - name: LOG_LEVEL
    value: "INFO"
```

完整字段和容器权限见仓库中的 [`app.yaml`](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/person-detection/app.yaml)。`allow_register_model: false` 表示设备必须先提供 `person-detection` 模型；应用不会在启动时替你注册模型。

## 3. 构建、安装并启动

### 3.1 构建 ARM64 包

设备使用 ARM64 镜像。推荐从 `neoruntime-apps` 根目录运行统一构建脚本：

```bash
cd ../..
./scripts/build_app.sh examples/person-detection --arch arm64
```

脚本会从同级的 `neoruntime-sdks/python` 暂存 `hailo_ipc_sdk`，构建容器并生成：

```text
examples/person-detection/person-detection.aipc
```

需要了解 SDK wheel 的生成方式时，参阅 [neoruntime-sdks 的 Python SDK 说明](https://github.com/camthink-ai/neoruntime-sdks#python-sdk)。SDK 当前不通过 PyPI 发布；本示例的容器构建会把 SDK 一起打进镜像。

### 3.2 安装

在 Web Console 中进入 **App Management**，导入 `person-detection.aipc`，然后点击 **Install**。

如果使用设备终端，可先解压包，再按仓库脚本输出的方式安装 `app.yaml` 和 `image.tar`：

```bash
unzip -o examples/person-detection/person-detection.aipc \
  -d /tmp/person-detection
cd /tmp/person-detection
aipc-cli app install app.yaml image.tar
```

### 3.3 启动

在 **App Management** 中找到 `person-detection`，点击 **Start**，等待状态变为 **Running**。首次启动需要载入容器镜像，页面短暂显示启动中是正常现象。

## 4. 验证推理和事件

### 4.1 验证应用状态和权限

在应用详情页确认：

- 状态为 **Running**；
- 视频权限为 `third.raw`；
- 模型权限包含 `person-detection`；
- 事件发布权限包含 `app/person-detection/*` 和 `alerts/detection`。

![应用管理页（Person Detection 运行中）](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/pd-01-apps-running.png)

### 4.2 查看日志

在应用详情页打开 **Logs**，或通过设备 API 拉取应用日志。至少应依次看到以下类型的记录：

```text
Available models: [..., 'person-detection', ...]
Available video streams: [..., 'third', ...]
Subscribing to stream 'third' with model 'person-detection'
[OK] Received first inference result
Detected 1 person(s)
Statistics: frames=..., detections=..., avg_persons=...
```

如果没有第一帧结果，先检查设备是否存在 `third.raw`，以及 `person-detection` 模型是否已加载；不要只看容器是否处于 Running。

![Web Logs 实时检测输出](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/person-detection/pd-04-web-logs-live.png)

### 4.3 验证事件

在设备上订阅应用事件：

```bash
aipc-cli event subscribe 'app/person-detection/*'
```

收到 `app/person-detection/detection` 后，检查载荷中的：

- `person_count`：当前帧的人数；
- `objects[].confidence`：人员置信度；
- `objects[].bbox`：归一化检测框；
- `frame_sequence` 和 `timestamp_ns`：帧和时间信息。

检测到人时，应用还会按 `ALERT_COOLDOWN_SECONDS` 发布 `alerts/detection`。白光联动依赖设备具备对应硬件和权限；没有补光灯时，事件验证仍可独立完成。

## 5. 相关文档

- [SDK 工作流](../1-app-development/0-sdk-workflow.md) — SDK 嵌入、权限声明和应用构建
- [应用参考](../3-reference/0-app-reference.md) — `app.yaml` 权限、生命周期和容器约束
- [SDK 参考](../3-reference/1-sdk-reference.md) — Inference、Event 和 Device 客户端 API
- [事件集成](../3-reference/5-event-integration.md) — WebSocket、MQTT 和 HTTP 对接
- [停车场管理](./0-parking-lot.md) — 多模型和 Web UI 的完整 Showcase
