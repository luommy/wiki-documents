---
description: "NE503 version baseline and compatibility reference: system, platform-service, Web Console, SDK, MCU, and flashing-tool versions for OS 1.12.0 (build 2026-07-29), plus OS-upgrade validation gates and optional factory-preload content."
keywords: [NE503 version, firmware version, compatibility matrix, factory preload, MCU firmware, hailo_ipc_sdk, OS upgrade]
tags: [Software Guide, NE503, versioning, compatibility]
---

# Version Matrix

Use this page to handle four common tasks: confirm the device version, prepare development and flashing components, diagnose a rejected OS upgrade, and confirm factory-preload content.

The baseline corresponds to a `hailo15-ne503` device running OS `1.12.0` (build `2026-07-29`). It is a release snapshot, not a guarantee that every device is identical: the interface-board MCU version is measured on a sample device, and model/app contents can vary by order or firmware configuration.

## 1. Version Baseline

### 1.1 Device Components

Check device-side versions first, then decide whether an SDK, app, or upgrade package matches. UI labels are kept in their device-side English form so they can be located directly.

| Component | Version baseline | Where to check | Version meaning |
|-----------|------------------|----------------|-----------------|
| System OS | `1.12.0`; build `2026-07-29`; machine `hailo15-ne503` | `System OS Version` under `Settings → Device Info`; or via SSH with `cat /etc/os-release` and `cat /etc/build-info` | OS release version |
| Platform services | `v1.0.1` | `Firmware Version` under `Settings → Device Info`; device file `/data/aipc/VERSION` | Platform version released and upgraded with the OS |
| Web Console | `0.2.4` | Frontend source `web/package.json`; the Web Console may not display an independent frontend version | Web UI package version; not the OS or platform-service version |
| Interface-board MCU firmware | `0.1.7.0` (measured on a sample device) | `MCU Ver` under `Image → Device Overview`; or the authenticated device-status API | Hardware-related firmware; the device value is authoritative |

When querying the MCU version, `/api/v1` requires a Bearer token:

```bash
curl -k https://<device-ip>/api/v1/device/status \
  -H "Authorization: Bearer <token>"
```

Read the `data.mcu_version` field in the response. Do not treat a `401` caused by a missing token as an MCU-version validation failure.

### 1.2 Development and Flashing Components

These components are used for development, packaging, or flashing. They should not be compared in the same category as the device OS or platform-service version.

| Component | Version baseline | Version relationship |
|-----------|------------------|----------------------|
| Python SDK | `0.4.0`; package/module name `hailo_ipc_sdk` | Use the matching wheel from [neoruntime-sdks Releases](https://github.com/camthink-ai/neoruntime-sdks/releases) |
| C++ SDK | `0.1.0`; namespace `hailo_ipc_sdk` | Independently versioned and mirrors the Python SDK `0.4.0` interface capability; see the [Doxygen documentation](https://camthink-ai.github.io/neoruntime-sdks/cpp/en/) |
| Example apps (`neoruntime-apps`) | No standalone version number | Get build bundles such as `showcase-bundles-latest` from [neoruntime-apps Releases](https://github.com/camthink-ai/neoruntime-apps/releases); app bundles follow the main line |
| Flashing tool `hailo15_board_tools` | `1.10.1` | Use the tool in the `tools/` directory of `meta-hailo-os` that belongs to the firmware release line; see [System Flashing](./2-system-flashing.md) |

Version sources: system OS and flashing tools are in [camthink-ai/meta-hailo-os](https://github.com/camthink-ai/meta-hailo-os), platform services and the Web Console are in [camthink-ai/neoruntime](https://github.com/camthink-ai/neoruntime), and the SDKs are in [camthink-ai/neoruntime-sdks](https://github.com/camthink-ai/neoruntime-sdks).

## 2. OS Upgrade Compatibility Gates

Before installing an `.swu` upgrade package, the platform checks the package, the running OS, the device hardware, and the recovery image together. The baseline values for the current OS `1.12.0` line are below. `machine`, `product`, and `hardware-compatibility` describe device identity; the other three constrain runtime, data, and recovery-toolchain version relationships.

| Gate | Current baseline | What the platform checks | First thing to check on failure |
|------|------------------|--------------------------|----------------------------------|
| `machine` | `hailo15-ne503` | Package target machine must match the device | Whether the package is for another machine |
| `product` | `ne503` | Product identifier must match | Whether the package is for NE503 |
| `hardware-compatibility` | `1.0` | Device hardware version must be in the package compatibility list | Whether the package supports the current hardware version |
| `aipc-compat-level` | `1` | Platform compatibility level must match exactly | Whether the OS, platform services, and app are from the same coordinated release line |
| `data-schema` | `1` | Data schema must be valid and compatible with the device data | Whether the OS, app, and on-device schema versions match; do not delete data casually to bypass the check |
| `min-recovery-version` | `1.0.1` | Current recovery version must meet the package minimum | Whether recovery must first be updated through a supported release path |

If any gate fails, the package is rejected before installation. See the [neoruntime OS upgrade implementation](https://github.com/camthink-ai/neoruntime/blob/main/platform/osupgrade/validate.go) for the validation logic.

When an upgrade fails, start with the gate named in the error:

- `machine`, `product`, or `hardware-compatibility`: use a package matching the target machine, product, and hardware version.
- `aipc-compat-level` or `data-schema`: use OS, platform-service, and app components from the same coordinated release line; do not mix release lines.
- `min-recovery-version`: confirm the recovery version and update recovery through the supported upgrade path.

If the error does not identify a gate, preserve the page message and device logs, pause the upgrade, and confirm the package source. Do not infer compatibility from the filename alone.

## 3. Optional Factory Preload

The content below comes from `configs/preload.yaml` in `neoruntime`. It describes the factory-preload options the platform can package by default. What a specific device actually contains is determined by its order and firmware configuration.

### Default Preloaded Models (12)

| Category | Model file (`.hef`) | Purpose |
|----------|---------------------|---------|
| Detection | `detection/hailo_yolov8n_384_640.hef` | General object detection |
| Detection | `detection/yolov5m_vehicles.hef` | Vehicle detection |
| Detection | `detection/tiny_yolov4_license_plates.hef` | License-plate detection |
| Classification | `classification/vit_large.hef` | Image classification |
| Segmentation | `segmentation/linknet_mbv1_ss_dpm_256.hef` | Image segmentation |
| Keypoint | `keypoint/face_landmarks_lite.hef` | Facial keypoints |
| CLIP | `clip/clip_vit_b_32_image_encoder_nv12.hef` | CLIP image encoding |
| CLIP | `clip/clip_vit_b_16_image_encoder.hef` | CLIP image encoding |
| Depth estimation | `depth/scdepthv3.hef` | Monocular depth estimation |
| OCR | `ocr/paddle_ocr_v5_mobile_detection.hef` | Text detection |
| OCR | `ocr/paddle_ocr_v5_mobile_recognition_nv12.hef` | Text recognition |
| OCR | `ocr/lprnet.hef` | License-plate recognition |

The GenAI model `genai/Qwen3-VL-2B-Instruct.hef` is commented out as an optional item in the configuration (about 3 GB), so it is not counted among the 12 default models.

### Optional Preloaded App

| App | Auto-start | Description |
|-----|------------|-------------|
| AI Model Showcase (`model-showcase`) | No | A multi-model capability demo; if preloaded, start it manually from the Applications page the first time |

## 4. Related Documentation

- [System Flashing](./2-system-flashing.md) — firmware package layout, flashing, and upgrade steps
- [AI Apps and Models](../2-user-guide/2-applications-and-models.md) — model management in the Web Console
- Version history: [neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases) / [neoruntime-sdks Releases](https://github.com/camthink-ai/neoruntime-sdks/releases) / [neoruntime-apps Releases](https://github.com/camthink-ai/neoruntime-apps/releases)
