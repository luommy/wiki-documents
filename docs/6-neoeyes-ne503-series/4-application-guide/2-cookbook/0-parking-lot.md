---
id: parking-lot
title: Parking Lot
description: 在 NE503 上部署 Parking Lot Showcase，完成车辆检测、车牌识别和深度防伪的配置、启动与事件验证。
keywords: [NE503, Parking Lot, 停车场, 车辆检测, 车牌识别, 深度防伪, Event Bus, Cookbook]
tags: [NE503, 应用开发, Cookbook, 车辆检测, 事件集成]
---

# Parking Lot

本文在 NE503 上部署 `neoruntime-apps` 的 Parking Lot Showcase，并通过 Event Bus 验证车辆事件。

应用源码和完整配置见 [neoruntime-apps/showcases/parking-lot](https://github.com/camthink-ai/neoruntime-apps/tree/main/showcases/parking-lot)。本文只保留部署和验证所需的信息，源码细节以仓库为准。

## 1. 目标与前提

完成后，你应能看到 Parking Lot Monitor 页面，并收到以下主题的事件：

- `parking/vehicles`：车辆框和置信度；
- `parking/plates`：车牌区域和识别文本；
- `parking/alerts`：深度防伪告警。

开始前确认：

- NE503 已完成系统烧录并能打开 Web Console；
- 设备上的 `/data/aipc/models` 已提供 Showcase 需要的四个 HEF；
- 使用 ARM64 Release bundle，或准备好 Docker 和源码构建环境。

## 2. 应用结构

### 2.1 模型与事件

| 模型 ID | 用途 | 输入 |
|:---|:---|:---|
| `yolov5m_vehicles` | 车辆检测 | RGB，1920 × 1080 |
| `scdepthv3` | 深度防伪分析 | RGB，320 × 256 |
| `license_plate_det` | 车牌区域检测 | RGB，416 × 416 |
| `plate_recognition` | 车牌字符识别 | NV12，320 × 48 |

模型文件由应用从设备的 `/data/aipc/models` 只读目录读取。启动时，应用根据 `MODEL_DEFS` 注册模型；完整路径、后处理配置和流水线代码见源码仓库。

### 2.2 数据链路

```text
摄像头
  ↓
sub.raw 原始帧
  ↓
车辆检测 → 深度防伪 → 车牌检测 → 车牌识别
  ↓                         ↓
Parking Lot Web UI       Event Bus
                           ├─ parking/vehicles
                           ├─ parking/plates
                           └─ parking/alerts
```

默认清单使用 `sub.raw` 和 `STREAM_ID=sub`。应用会根据模型输入尺寸探测可用流；不要在 `app.py` 和 `app.yaml` 中随意把流名改成另一个值，设备没有对应原始流时就无法推理。

## 3. 获取并配置应用

### 3.1 直接下载 Release bundle

推荐使用 [Parking Lot ARM64 bundle](https://github.com/camthink-ai/neoruntime-apps/releases/download/showcase-bundles-latest/parking-lot-latest-arm64.tar.gz)。解压后应包含 `app.yaml`、`parking-lot-image.tar` 和 `SHA256SUMS`：

```bash
tar -xzf parking-lot-latest-arm64.tar.gz
cd parking-lot-*-arm64
sha256sum -c SHA256SUMS
```

### 3.2 从源码构建

需要 Docker、`neoruntime-apps` 和同级的 `neoruntime-sdks`：

```bash
cd ../neoruntime-sdks/python
python -m pip install --upgrade build
python -m build --wheel

cd ../../neoruntime-apps
scripts/build_showcase_artifacts.sh \
  --wheel ../neoruntime-sdks/python/dist/hailo_ipc_sdk-*.whl \
  parking-lot --arch arm64 --output dist/showcases
```

构建结果位于 `dist/showcases/`。源码构建规则和依赖以 [neoruntime-apps README](https://github.com/camthink-ai/neoruntime-apps#showcase-bundles) 为准。

### 3.3 核对关键清单字段

在安装前打开 `app.yaml`，确认关键项没有被旧 bundle 覆盖：

```yaml
permissions:
  video:
    - sub.raw
  inference:
    models:
      - yolov5m_vehicles
      - scdepthv3
      - license_plate_det
      - plate_recognition
    allow_register_model: true
  events:
    publish:
      - parking/vehicles
      - parking/plates
      - parking/alerts
  network:
    mode: host

env:
  - name: STREAM_ID
    value: "sub"
  - name: HD_PREVIEW_ENABLED
    value: "0"
```

`HD_PREVIEW_ENABLED=0` 时，页面使用应用自己的 MJPEG `/stream` 预览。当前出货固件上的平台 H.264 地址可能只监听设备内部回环地址，旧清单如果设为 `1`，外部浏览器可能只看到黑屏。

## 4. 安装、启动并打开页面

### 4.1 安装

在 Web Console 中进入 **App Management**，导入解压后的 `app.yaml` 和 `parking-lot-image.tar`，然后点击 **Install**。

也可以在已登录设备的终端执行仓库 README 中的安装命令：

```bash
aipc-cli app install app.yaml parking-lot-image.tar
```

### 4.2 启动

安装完成后，在 **App Management → Installed Apps** 找到 `parking_lot`，点击 **Start**。状态变为 **Running** 后再做验证；仅显示安装成功不能证明推理流水线已运行。

### 4.3 打开 Web UI

在能访问设备的浏览器中打开：

```text
http://<设备IP>:8090
```

页面成功打开后，应看到 `Parking Lot Monitor`、实时画面和模型统计卡片。如果页面能打开但预览为黑屏，先确认清单中的 `HD_PREVIEW_ENABLED` 为 `0`，再访问 `http://<设备IP>:8090/stream` 确认 MJPEG 流可返回数据。

## 5. 验证结果

### 5.1 验证页面和车辆检测

1. 刷新 `http://<设备IP>:8090`，等待页面加载完成。
2. 确认预览区显示真实摄像头画面。
3. 确认 `Active Models` 列出四个模型。
4. 将镜头对准车辆，观察车辆框、`VEHICLES` 数值和统计信息。

`FPS`、推理耗时和检测数量会随场景、固件和设备负载变化，不能直接当作固定性能指标。

![Parking Lot Monitor 实时检测界面](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/cookbook/parking-lot/webui-dashboard.png)

### 5.2 验证 Event Bus

在设备上订阅停车场主题：

```bash
aipc-cli event subscribe 'parking/*'
```

将镜头对准车辆后，优先确认收到 `parking/vehicles`，载荷应包含车辆框和置信度。只有画面中有满足模型条件的清晰车牌时，才会产生 `parking/plates`；只有深度分析触发防伪条件时，才会产生 `parking/alerts`。这两个主题暂时没有消息，不等于模型没有启动。

### 5.3 查看状态和日志

在 Web Console 的应用详情页确认状态为 **Running**，并查看应用日志。重点检查：

- 四个模型是否完成注册；
- 是否持续出现媒体取帧失败、模型超时或 `Pipeline error`；
- 应用是否发生重启；
- 页面有画面但没有事件时，当前画面是否确实满足车牌或防伪触发条件。

## 6. 相关文档

- [应用开发工作流](../1-app-development/0-sdk-workflow.md) — 应用目录、权限和构建流程
- [应用参考](../3-reference/0-app-reference.md) — `app.yaml` 权限、生命周期和容器约束
- [事件集成](../3-reference/5-event-integration.md) — WebSocket、MQTT 和 HTTP 对接
- [版本兼容性矩阵](../../3-software-guide/5-version-matrix.md) — 核对 OS、平台、SDK 和模型环境
- [人员检测](./1-person-detection.md) — 单模型推理和事件发布示例
