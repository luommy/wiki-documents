---
description: "NE503 版本基线与兼容性参考：对应 OS 1.12.0（build 2026-07-29）的系统、平台服务、Web 控制台、SDK、MCU 和烧录工具版本，并说明 OS 升级校验项及可选出厂预置内容。"
keywords: [NE503 版本, 固件版本, 兼容性矩阵, 出厂预置, MCU 固件, hailo_ipc_sdk, OS 升级]
tags: [软件指南, NE503, 版本管理, 兼容性]
---

# Version Matrix

本页用于处理四类常见问题：确认设备当前版本、准备开发与烧录组件、排查 OS 升级被拒，以及确认出厂预置内容。

版本基线对应 `hailo15-ne503` 设备的 OS `1.12.0`（build `2026-07-29`）。这是一个发布快照，不代表所有设备都完全相同：接口板 MCU 版本为样机实测值，模型和应用则可能随订单或固件配置变化。

## 1. 版本基线

### 1.1 设备端组件

先核对设备端的版本，再判断 SDK、应用或升级包是否匹配。界面名称保留设备上的英文标签，便于直接定位。

| 组件 | 版本基线 | 核对位置 | 版本性质 |
|------|---------|---------|---------|
| 系统 OS | `1.12.0`；build `2026-07-29`；machine `hailo15-ne503` | `Settings → Device Info` 的 `System OS Version`；也可通过 SSH 执行 `cat /etc/os-release` 和 `cat /etc/build-info` | OS 发布版本 |
| 平台服务 | `v1.0.1` | `Settings → Device Info` 的 `Firmware Version`；设备文件 `/data/aipc/VERSION` | 与 OS 配套发布和升级的平台版本 |
| Web 控制台 | `0.2.4` | 前端源码 `web/package.json`；Web 控制台不一定显示独立的前端版本号 | Web UI 包版本，不等同于 OS 或平台服务版本 |
| 接口板 MCU 固件 | `0.1.7.0`（样机实测） | `Image → Device Overview` 的 `MCU Ver`；也可查询已认证的设备状态 API | 设备相关硬件固件，实际值应以设备为准 |

查询 MCU 版本时，`/api/v1` 接口需要 Bearer token：

```bash
curl -k https://<device-ip>/api/v1/device/status \
  -H "Authorization: Bearer <token>"
```

读取返回结果中的 `data.mcu_version` 字段。不要把未携带 token 时的 `401` 当作 MCU 版本验证失败。

### 1.2 开发与烧录组件

这些组件用于开发、打包或烧录，不应与设备端的 OS、平台服务版本混在同一列比较。

| 组件 | 版本基线 | 使用时的版本关系 |
|------|---------|----------------|
| Python SDK | `0.4.0`；包名/模块名为 `hailo_ipc_sdk` | 使用 [neoruntime-sdks Releases](https://github.com/camthink-ai/neoruntime-sdks/releases) 中对应版本的 wheel |
| C++ SDK | `0.1.0`；命名空间为 `hailo_ipc_sdk` | C++ SDK 独立编号，同时镜像 Python SDK `0.4.0` 的接口能力；API 参考见 [Doxygen 文档站](https://camthink-ai.github.io/neoruntime-sdks/cpp/en/) |
| 示例应用（`neoruntime-apps`） | 无独立版本号 | 从 [neoruntime-apps Releases](https://github.com/camthink-ai/neoruntime-apps/releases) 获取构建包，例如 `showcase-bundles-latest`；应用包随主线发布 |
| 烧录工具 `hailo15_board_tools` | `1.10.1` | 使用 `meta-hailo-os` 的 `tools/` 目录中与固件发布线配套的工具；操作步骤见[系统烧录](./2-system-flashing.md) |

版本来源：系统 OS 和烧录工具见 [camthink-ai/meta-hailo-os](https://github.com/camthink-ai/meta-hailo-os)，平台服务和 Web 控制台见 [camthink-ai/neoruntime](https://github.com/camthink-ai/neoruntime)，SDK 见 [camthink-ai/neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks)。

## 2. OS 升级兼容关卡

安装 `.swu` 升级包前，平台会同时检查升级包、运行中的 OS、设备硬件和恢复镜像。当前 OS `1.12.0` 发布线中的基线值如下；`machine`、`product` 和 `hardware-compatibility` 来自设备身份，另外三项用于约束运行时、数据和恢复工具链的版本关系。

| 关卡 | 当前基线 | 平台检查什么 | 失败时先检查 |
|------|---------|-------------|-------------|
| `machine` | `hailo15-ne503` | 升级包目标 machine 必须与设备一致 | 是否拿错了其他机型的升级包 |
| `product` | `ne503` | 产品标识必须一致 | 是否使用了 NE503 对应的升级包 |
| `hardware-compatibility` | `1.0` | 设备硬件版本必须在升级包声明的兼容列表中 | 升级包是否支持当前硬件版本 |
| `aipc-compat-level` | `1` | 平台兼容等级必须严格相等 | OS、平台服务和应用是否来自同一配套发布线 |
| `data-schema` | `1` | 数据结构版本必须有效，并与设备数据兼容 | OS、应用和设备上的数据结构版本是否匹配；不要为绕过校验随意删除数据 |
| `min-recovery-version` | `1.0.1` | 当前 recovery 版本必须达到升级包要求的最低版本 | 是否需要先按支持的发布路径更新 recovery |

任一关卡不通过，升级包会在安装前被拒绝。校验逻辑见 [neoruntime 的 OS upgrade implementation](https://github.com/camthink-ai/neoruntime/blob/main/platform/osupgrade/validate.go)。

处理升级失败时，先按错误中指出的关卡处理：

- `machine`、`product` 或 `hardware-compatibility` 失败：更换为目标机型、产品和硬件版本匹配的升级包。
- `aipc-compat-level` 或 `data-schema` 失败：使用同一配套发布线的 OS、平台服务和应用，不要混用不同发布线的组件。
- `min-recovery-version` 失败：先确认 recovery 版本，并按照支持的升级路径更新 recovery。

如果错误没有明确指出关卡，先保留页面提示和设备日志，暂停升级并确认升级包来源；不要仅凭文件名猜测兼容关系。

## 3. 可选出厂预置

以下内容来自 `neoruntime` 的 `configs/preload.yaml`，表示平台默认可以打包的出厂预置选项。实际设备是否包含这些内容，以订单和固件配置为准。

### 默认预置模型（12 个）

| 类别 | 模型文件（`.hef`） | 用途 |
|------|-------------------|------|
| 检测 | `detection/hailo_yolov8n_384_640.hef` | 通用目标检测 |
| 检测 | `detection/yolov5m_vehicles.hef` | 车辆检测 |
| 检测 | `detection/tiny_yolov4_license_plates.hef` | 车牌检测 |
| 分类 | `classification/vit_large.hef` | 图像分类 |
| 分割 | `segmentation/linknet_mbv1_ss_dpm_256.hef` | 图像分割 |
| 关键点 | `keypoint/face_landmarks_lite.hef` | 人脸关键点 |
| CLIP | `clip/clip_vit_b_32_image_encoder_nv12.hef` | CLIP 图像编码 |
| CLIP | `clip/clip_vit_b_16_image_encoder.hef` | CLIP 图像编码 |
| 深度估计 | `depth/scdepthv3.hef` | 单目深度估计 |
| OCR | `ocr/paddle_ocr_v5_mobile_detection.hef` | 文本检测 |
| OCR | `ocr/paddle_ocr_v5_mobile_recognition_nv12.hef` | 文本识别 |
| OCR | `ocr/lprnet.hef` | 车牌识别 |

GenAI 模型 `genai/Qwen3-VL-2B-Instruct.hef` 在配置中是注释掉的可选项（约 3 GB），不计入上述 12 个默认模型。

### 可选预装应用

| 应用 | 自动启动 | 说明 |
|------|---------|------|
| AI Model Showcase（`model-showcase`） | 否 | 多模型能力演示应用；如果设备已预装，首次使用时从 Applications 页面手动启动 |

## 4. 相关文档

- [系统烧录](./2-system-flashing.md) — 固件包构成、烧录与升级步骤
- [AI 应用与模型](../2-user-guide/2-applications-and-models.md) — Web 控制台的模型管理操作
- 版本变更历史：[neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases) / [neoruntime-sdks Releases](https://github.com/camthink-ai/neoruntime-sdks/releases) / [neoruntime-apps Releases](https://github.com/camthink-ai/neoruntime-apps/releases)
