---
description: NE503 hardware specifications with chip-level parameters for Hailo15H SoC, LPDDR4, eMMC, QSPI Flash, image sensor, IMU, Ethernet PHY, and other core modules.
keywords: [NE503, hardware specifications, Hailo15H, IMX678, LPDDR4, LSM6DSR, chip parameters]
tags: [NE503, hardware specifications, chip parameters, hardware reference]
---

# Hardware Specifications

## Introduction

NE503 features a dual-board architecture with a core processing board (Hailo15H SoC) and an interface board (STM32G0B0RET6 MCU). For details, see [Core Board](./1-core-board-connection.md) and [Interface Board](./2-aipc-board-connection.md).

| Model | Description |
|:---|:---|
| NE503 | Hailo15H + eMMC 64GB + LPDDR4 4GB / 8GB; selectable `AF Lens (44.5° HFOV)` or `Motorized Zoom (110° HFOV)` |

## Module-Level Specifications

Key device parameters for each physical module in NE503:

### Core Processing Board

| Type | Chip Model | Specifications |
|:---|:---|:---|
| CPU / SoC | Hailo-15H | Quad-core Arm Cortex-A53, 1.3 GHz; AI performance up to 20 TOPS; ISP supports up to 12 MP resolution, 600 Mpixel/s pixel rate, HDR and noise reduction; VPU supports H.265/H.264 encoding |
| LPDDR4 | 8 GB configuration: MT53E2G32D4DE-046 WT:C | 4 GB or 8 GB; the documented 8 GB configuration is 4266 Mb/s with 8.5 GB/s single-channel bandwidth; the device model and bandwidth for the 4 GB configuration must follow its BOM |
| eMMC | SDINBDA6-64G-H | 64 GB eMMC |
| QSPI Flash | IS25WP064D-JKLE | 8 MB, Quad SPI protocol, standby current 8 µA, erase cycles > 100,000 |
| Temperature Sensor | TMP1075DSGR | 12-bit resolution, 0.0625°C, I2C interface |
| EEPROM | AT24C02D | 2 Kb (256 × 8), I2C interface, standby current < 1 µA, 1,000,000 write cycles |
| PCIe Clock Generator | PI6CG18201 | 25 MHz, full-output operating current (IDD) 15 mA, low-jitter PCIe Gen4: 0.3 ps |
| Ethernet PHY | LAN8720AI | 10/100M Ethernet PHY, IO voltage 1.6V ~ 3.6V |
| Inertial Measurement Unit (IMU) | LSM6DSR | Integrated 3-axis digital accelerometer (programmable, max ±16 g) and 3-axis digital gyroscope (up to ±4000 dps) |

### Interface Board

| Type | Chip Model | Specifications |
|:---|:---|:---|
| MCU | STM32G0B0RET6 | Arm Cortex-M0+, 64 MHz, 512 KB Flash, 144 KB RAM |
| Temperature Sensor | LMT87DCK | Analog output temperature sensor, -50°C ~ 150°C |
| Lens Driver | AN41908A-VBA (documented configuration) | Lens options are `AF Lens (44.5° HFOV)` or `Motorized Zoom (110° HFOV)`; the driver device and available controls depend on the specific SKU/BOM and firmware |
| Audio Codec | NAU88C10 | I2S interface audio codec (SoC-controlled, not MCU-managed) |

### External Modules

| Type | Chip Model | Specifications |
|:---|:---|:---|
| Image Sensor | IMX678-AAQR1-C | 1/1.8-inch 4K CMOS image sensor, up to 60fps 4K full-pixel output |

### Light Board (Independent Module)

| Type | Description |
|:---|:---|
| Dual-Light Board | White + Red LED, PWM dimming, connected to interface board via connector |
| IR Light Board | Near-IR + Far-IR LED, PWM dimming, connected to interface board via connector |

## Operating Environment

| Parameter | Specification |
|:---|:---|
| Operating Temperature | -40 ~ 60°C |
| Relative Humidity | 0 ~ 95% non-condensing |

## Version History

| Version | Date | Changes |
|:---|:---|:---|
| V1.0 | 2026-04-02 | Initial release |
