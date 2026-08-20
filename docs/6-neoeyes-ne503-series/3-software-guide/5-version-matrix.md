---
description: NE503 版本兼容性矩阵：系统固件、平台服务、SDK、MCU、烧录工具的当前版本对照，OS 升级的六道兼容关卡，以及出厂预置模型与应用清单，帮助排查版本不匹配导致的隐性问题。
keywords: [NE503 版本, 固件版本, 兼容性矩阵, 出厂预置, MCU 固件, board_tools, 平台服务版本]
tags: [软件指南, NE503, 版本管理, 兼容性]
---

# Version Matrix

各组件版本不匹配是不少「隐性问题」的根源——升级包拒装、模型加载失败、SDK 调用行为异常，往往都指向版本没对上。本页给出当前固件线上各组件的权威版本、升级时平台强制的兼容关卡，以及出厂预置的模型与应用清单。

## 1. 组件版本对照

以当前固件线（2026-07 构建）为准：

| 组件 | 当前版本 | 来源 | 在设备上怎么看 |
|------|---------|------|---------------|
| 系统固件（OS） | 1.12.0（build 2026-07-29，机型 `hailo15-ne503`） | [camthink-ai/meta-hailo-os](https://github.com/camthink-ai/meta-hailo-os) | SSH 执行 `cat /etc/os-release`、`cat /etc/build-info` |
| 平台服务 | v1.0.1（开源版本线从此起算，不延续旧内部版本号；以 [neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases) 为准） | [camthink-ai/neoruntime](https://github.com/camthink-ai/neoruntime) | 与 OS 一同发布、一同升级 |
| Web 控制台 | 0.2.4（随平台服务一同发布） | 同上 | Web 控制台 **Settings → 设备信息** |
| 接口板 MCU 固件 | 0.1.7.0（实测样机） | 固件包内 `ne503_ota_package_v<X.Y.Z>.bin` | API `GET /api/v1/device/status` 的 `mcu_version` 字段 |
| Python SDK（`hailo_ipc_sdk`） | 0.4.0 | [camthink-ai/neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks) | SDK 随应用镜像携带；接口演进时的兼容性以 [neoruntime-sdks Releases](https://github.com/camthink-ai/neoruntime-sdks/releases) 说明为准 |
| C++ SDK（`hailo_ipc_sdk`） | 0.1.0（与 Python SDK 模块镜像，`cv::Mat` 对应 numpy） | 同上（`cpp/` 目录） | API 参考见 [Doxygen 文档站](https://camthink-ai.github.io/neoruntime-sdks/cpp/en/) |
| 示例应用（neoruntime-apps） | 无独立版本号，跟随 main 更新 | [camthink-ai/neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) | 构建包从 [Releases](https://github.com/camthink-ai/neoruntime-apps/releases) 取最新（`showcase-bundles-latest`） |
| 烧录工具 `hailo15_board_tools` | 1.10.1 | meta-hailo-os 仓库 `tools/` 目录 | 详见[系统烧录](./2-system-flashing.md) |

> 升级固件前，先在设备的 Settings → 设备信息页核对当前各层版本，再选择对应的升级包；跨线升级（旧内部版本 → 开源线）以升级包自带的说明为准。

## 2. OS 升级兼容关卡

平台在安装 OS 升级包前强制校验以下关卡（定义于升级包的 `sw-description` 与设备侧，校验逻辑见 neoruntime 仓库 `platform/osupgrade/validate.go`）。**任一关卡不通过，升级包都会被拒绝安装**，从而避免刷入不匹配固件导致设备变砖：

| 关卡 | 校验内容 |
|------|---------|
| `machine` | 升级包目标机型必须与设备一致（如 `hailo15-ne503`） |
| `product` | 产品标识必须一致 |
| `hardware-compatibility` | 设备硬件版本必须落在升级包声明的兼容列表内 |
| `aipc-compat-level` | 平台兼容等级，须与设备侧一致（严格相等校验） |
| `data-schema` | 数据结构版本，须有效且一致 |
| `min-recovery-version` | 恢复镜像的最低版本要求 |

升级被拒时的报错会指明具体关卡（如 `machine mismatch: package=... device=...`），按报错换用对应机型的升级包即可。

## 3. 出厂预置清单

以下是平台**可以作为出厂预设提供的**模型与应用选项（权威来源：neoruntime 仓库 `configs/preload.yaml`，按项目需求选择）。实际设备上的预置内容以订单/固件配置为准：

### 预置模型（14 个）

| 类别 | 模型文件（`.hef`） |
|------|-------------------|
| 检测 | `detection/hailo_yolov8n_384_640`（默认检测模型）、`detection/yolov5m_vehicles`（车辆）、`detection/tiny_yolov4_license_plates`（车牌） |
| 分类 | `classification/vit_large` |
| 分割 | `segmentation/linknet_mbv1_ss_dpm_256` |
| 关键点 | `keypoint/face_landmarks_lite` |
| CLIP 零样本分类 | `clip/clip_vit_b_32_image_encoder_nv12`、`clip/clip_vit_b_16_image_encoder` |
| 深度估计 | `depth/scdepthv3` |
| OCR | `ocr/paddle_ocr_v5_mobile_detection`、`ocr/paddle_ocr_v5_mobile_recognition_nv12`、`ocr/lprnet`（车牌识别） |

### 预装应用

- **AI Model Showcase**（`model-showcase`）：多模型能力演示应用，可作为出厂预装选项（预装**不自启动**，首次在 Applications 页手动启动）。

## 4. 相关文档

- [系统烧录](./2-system-flashing.md) — 固件包构成、烧录与升级步骤
- [模型训练与 HEF 部署](../4-application-guide/1-app-development/4-model-training-and-hef.md) — 自定义模型的完整生命周期
- [AI 应用与模型](../2-user-guide/2-applications-and-models.md) — Web 控制台的模型管理操作
- 版本变更历史：[neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases) / [neoruntime-sdks Releases](https://github.com/camthink-ai/neoruntime-sdks/releases) / [neoruntime-apps Releases](https://github.com/camthink-ai/neoruntime-apps/releases)
