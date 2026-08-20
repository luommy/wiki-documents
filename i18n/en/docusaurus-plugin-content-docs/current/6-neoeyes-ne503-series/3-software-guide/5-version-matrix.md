---
description: NE503 version compatibility matrix — current versions of the system firmware, platform services, SDK, MCU, and flashing tools, the six OS-upgrade compatibility gates, and the factory-preloaded models and apps, to help diagnose hidden issues caused by version mismatches.
keywords: [NE503 version, firmware version, compatibility matrix, factory preload, MCU firmware, board_tools, platform service version]
tags: [Software Guide, NE503, versioning, compatibility]
---

# Version Matrix

Version mismatches are the root of many "invisible" issues — a rejected upgrade package, a model that fails to load, or SDK calls behaving oddly usually trace back to versions that don't line up. This page lists the authoritative versions of each component on the current firmware line, the compatibility gates the platform enforces during upgrades, and the factory-preloaded models and apps.

## 1. Component Versions

Current firmware line (2026-07 build):

| Component | Current version | Source | How to check on the device |
|-----------|----------------|--------|----------------------------|
| System firmware (OS) | 1.12.0 (build 2026-07-29, machine `hailo15-ne503`) | [camthink-ai/meta-hailo-os](https://github.com/camthink-ai/meta-hailo-os) | Via SSH: `cat /etc/os-release`, `cat /etc/build-info` |
| Platform services | v1.0.1 (the open-source version line starts here; old internal version numbers do not carry over — see [neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases)) | [camthink-ai/neoruntime](https://github.com/camthink-ai/neoruntime) | Released and upgraded together with the OS |
| Web Console | 0.2.4 (shipped with the platform services) | Same as above | Web Console **Settings → Device Info** |
| Interface-board MCU firmware | 0.1.7.0 (measured on a sample device) | `ne503_ota_package_v<X.Y.Z>.bin` inside the firmware package | `mcu_version` field of `GET /api/v1/device/status` |
| Python SDK (`hailo_ipc_sdk`) | 0.4.0 | [camthink-ai/neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks) | Carried inside each app image; for interface-evolution compatibility see the [neoruntime-sdks Releases](https://github.com/camthink-ai/neoruntime-sdks/releases) notes |
| C++ SDK (`hailo_ipc_sdk`) | 0.1.0 (mirrors the Python SDK's modules; `cv::Mat` where Python uses numpy) | Same repo (`cpp/` directory) | API reference on the [Doxygen docs site](https://camthink-ai.github.io/neoruntime-sdks/cpp/en/) |
| Example apps (neoruntime-apps) | No standalone version number; tracks main | [camthink-ai/neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) | Get the latest build bundles from [Releases](https://github.com/camthink-ai/neoruntime-apps/releases) (`showcase-bundles-latest`) |
| Flashing tool `hailo15_board_tools` | 1.10.1 | `tools/` directory of the meta-hailo-os repo | See [System Flashing](./2-system-flashing.md) |

> Before upgrading firmware, check the current versions on the device's Settings → Device Info page, then pick the matching upgrade package. For cross-line upgrades (old internal builds → the open-source line), follow the instructions bundled with the upgrade package.

## 2. OS Upgrade Compatibility Gates

Before installing an OS upgrade package, the platform enforces the following gates (declared in the package's `sw-description` and on the device side; validation logic lives in `platform/osupgrade/validate.go` in the neoruntime repo). **If any gate fails, the package is rejected**, which prevents bricking the device with mismatched firmware:

| Gate | What it checks |
|------|----------------|
| `machine` | Target machine of the package must match the device (e.g. `hailo15-ne503`) |
| `product` | Product identifier must match |
| `hardware-compatibility` | Device hardware revision must be in the package's compatibility list |
| `aipc-compat-level` | Platform compatibility level; must match the device side (strict equality) |
| `data-schema` | Data schema version; must be valid and match |
| `min-recovery-version` | Minimum version required for the recovery image |

When an upgrade is rejected, the error names the failing gate (e.g. `machine mismatch: package=... device=...`) — switch to the package built for your machine accordingly.

## 3. Factory Preload

The models and apps below are **options the platform can provide as factory presets** (authoritative source: `configs/preload.yaml` in the neoruntime repo; selected per project). What a given device actually ships with is determined by its order/firmware configuration:

### Preloaded Models (14)

| Category | Model files (`.hef`) |
|----------|---------------------|
| Detection | `detection/hailo_yolov8n_384_640` (default detection model), `detection/yolov5m_vehicles` (vehicles), `detection/tiny_yolov4_license_plates` (license plates) |
| Classification | `classification/vit_large` |
| Segmentation | `segmentation/linknet_mbv1_ss_dpm_256` |
| Keypoint | `keypoint/face_landmarks_lite` |
| CLIP zero-shot | `clip/clip_vit_b_32_image_encoder_nv12`, `clip/clip_vit_b_16_image_encoder` |
| Depth estimation | `depth/scdepthv3` |
| OCR | `ocr/paddle_ocr_v5_mobile_detection`, `ocr/paddle_ocr_v5_mobile_recognition_nv12`, `ocr/lprnet` (license-plate recognition) |

### Preloaded Apps

- **AI Model Showcase** (`model-showcase`): a multi-model capability demo, available as a factory-preload option (preloaded but **not auto-started**; start it manually from the Applications page on first use).

## 4. Related Documentation

- [System Flashing](./2-system-flashing.md) — firmware package layout, flashing, and upgrade steps
- [Model Training & HEF Deployment](../4-application-guide/1-app-development/4-model-training-and-hef.md) — the full lifecycle of custom models
- [AI Apps and Models](../2-user-guide/2-applications-and-models.md) — model management in the Web Console
- Version history: [neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases) / [neoruntime-sdks Releases](https://github.com/camthink-ai/neoruntime-sdks/releases) / [neoruntime-apps Releases](https://github.com/camthink-ai/neoruntime-apps/releases)
