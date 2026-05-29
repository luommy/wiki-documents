---
description: NE503 hardware specifications including Hailo15H SoC, LPDDR4, eMMC, QSPI Flash, image sensor, IMU, Ethernet PHY, and other core chip parameters, with hardware block diagram.
keywords: [NE503, hardware specifications, Hailo15H, IMX678, LPDDR4, LSM6DSR, chip parameters, hardware block diagram]
tags: [NE503, hardware specifications, chip parameters, hardware reference]
---

# Hardware Specifications

## Product Model

| Product Model | Description |
|:---|:---|
| NE5038-PX4 | Hailo15H + eMMC 64GB + LPDDR4 8GB, AF 4X Zoom |

![NE503 Hardware Block Diagram](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/specifications/hardware-block-diagram.png)

NE503 adopts a **core processing board** (Hailo15H) and **AI-PC interface board** (STM32G0B0RET6) dual-board architecture, interconnected via board-to-board connectors. The core processing board hosts the SoC, NPU, memory, storage, and imaging subsystems; the AI-PC interface board integrates an independent MCU to manage external IO, power, and peripheral control.

## Chip-Level Specifications

The main component parameters of the NE503 core processing board and AI-PC interface board are as follows:

| Type | Chip Model | Specifications |
|:---|:---|:---|
| CPU / SoC | Hailo-15H | Quad-core Arm Cortex-A53, 1.3 GHz; AI performance up to 20 TOPS; ISP supports up to 12 MP resolution, 600 Mpixel/s pixel rate, HDR and noise reduction; VPU supports H.265/H.264 encoding |
| LPDDR4 | MT53E2G32D4DE-046 WT:C | 8 GB LPDDR4, 4266 Mb/s, 8.5 GB/s single-channel bandwidth |
| eMMC | SDINBDA6-64G-H | 64 GB eMMC |
| QSPI Flash | IS25WP064D-JKLE | 8 MB, Quad SPI protocol, standby current 8 µA, erase cycles > 100,000 |
| Temperature Sensor | TMP1075DSGR | 12-bit resolution, 0.0625°C, I2C interface |
| EEPROM | AT24C02D | 2 Kb (256 × 8), I2C interface, standby current < 1 µA, 1,000,000 write cycles |
| Image Sensor | IMX678-AAQR1-C | 1/1.8-inch 4K CMOS image sensor, up to 60fps 4K full-pixel output |
| PCIe Clock Generator | PI6CG18201 | 25 MHz, full-output operating current (IDD) 15 mA, low jitter PCIe Gen4: 0.3 ps |
| Ethernet PHY | LAN8720AI | 10/100M Ethernet PHY, IO voltage 1.6V ~ 3.6V |
| Inertial Measurement Unit (IMU) | LSM6DSR | Integrated 3-axis digital accelerometer (programmable, max ±16 g) and 3-axis digital gyroscope (up to ±4000 dps) |
| Operating Environment | — | -40 ~ 60°C, 0 ~ 95% non-condensing |

## Version History

| Version | Date | Changes |
|:---|:---|:---|
| V1.0 | 2026-04-02 | Initial release |
