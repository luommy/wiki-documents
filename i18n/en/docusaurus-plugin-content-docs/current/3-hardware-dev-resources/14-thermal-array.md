---
sidebar_position: 14
description: This document introduces the MELEXIS MLX90642ESF 32×24 pixel infrared thermal array sensor, covering product overview, specifications, and pin definitions for both wide-angle and narrow-angle variants in non-contact temperature measurement applications.
keywords: [thermopile array, MLX90642, MELEXIS, infrared thermal imaging, non-contact temperature measurement, I2C, human detection, thermal imaging]
tags: [sensor, thermal imaging, hardware development resources]
---
# Thermal Array

## Overview

The MLX90642ESF is a 32×24 pixel infrared thermopile array sensor from MELEXIS (Belgium), providing non-contact temperature measurement capability across 768 pixels. The sensor uses a TO39 metal package, communicates via I2C interface, and supports programmable refresh rates, making it suitable for high-precision temperature monitoring, human detection, and industrial temperature measurement applications.

![MLX90642](https://resources.camthink.ai/wiki/img/hardware-dev-resources/thermal-array/thermal-array-mlx90642.png)

## 1. Product Overview

### 1.1 Key Features

- **High resolution**: 32×24 pixels (768 pixels), providing rich temperature distribution information
- **High precision**: NETD as low as 0.065K, temperature resolution of 0.02°C
- **Wide temperature range**: Target temperature measurement range of -40°C ~ 260°C
- **Low-power sleep**: Sleep current of only 2µA, suitable for intermittent operation scenarios
- **High-speed I2C**: Supports FM+ mode with clock frequency up to 1MHz
- **Programmable refresh rate**: 2 ~ 16Hz adjustable, balancing accuracy and power consumption
- **Industrial-grade package**: TO39 metal package for high reliability

### 1.2 NE301 Application Scenarios

In the NE301 sensor expansion board, the thermopile array serves as a **temperature perception sensor**, providing thermal distribution information for snapshot captures. When an abnormal temperature is detected within the field of view (such as human presence or equipment overheating), it triggers the NE301 to capture a snapshot; thermal imaging data can be fused with visible-light images to enhance AI model detection accuracy.

| Application Scenario | Description |
|:---|:---|
| Intrusion Detection | Identifies personnel entry through thermal signatures, triggering NE301 snapshot and recording temperature data |
| Equipment Inspection | Detects abnormal temperature rise in electrical equipment, triggering alarm snapshots |
| Industrial Temperature Measurement | Works with NE301 snapshots to record temperature distribution of key equipment |
| HVAC Control | Detects personnel position and count, linking snapshot capture and air conditioning adjustment |

## 2. Specifications

### 2.1 Basic Parameters

| Parameter | Specification |
|:---|:---|
| Model | MLX90642ESF-BCx-000-TU |
| Manufacturer | MELEXIS (Belgium) |
| Pixel Array | 32 × 24 (768 pixels) |
| Package | TO39 (SF) |
| Communication Interface | I2C (FM+ mode) |

### 2.2 Variant Comparison

| Parameter | MLX90642ESF-BCA-000-TU | MLX90642ESF-BCB-000-TU |
|:---|:---|:---|
| Field of View (FOV) | 110° × 75° (wide-angle) | 45° × 35° (narrow-angle) |
| Typical Application | Short-range wide-area coverage | Long-range precision measurement |
| Package | TO39 (SF) | TO39 (SF) |

### 2.3 Performance Parameters

| Parameter | Min | Typical | Max | Unit |
|:---|:---:|:---:|:---:|:---|
| Supply Voltage | 3.0 | 3.3 | 3.6 | V |
| Operating Current | 20 | 28 | 35 | mA |
| Sleep Current | — | 2 | 5 | µA |
| NETD | — | 0.065 (BCA) / 0.08 (BCB) | — | K |
| Temperature Resolution | — | 0.02 | — | °C |
| Target Temperature Range | -40 | — | 260 | °C |
| Refresh Rate | 2 | — | 16 | Hz |
| I2C Clock Frequency | — | — | 1 | MHz |
| EEPROM Write/Erase Cycles | — | 100K | — | cycles |
| Defective Pixels | — | — | 4 | pixels |

### 2.4 Operating Conditions

| Parameter | Specification | Description |
|:---|:---|:---|
| Operating Temperature | -40°C ~ 85°C | Standard operating range |
| Storage Temperature | -40°C ~ 85°C | Non-operating state |
| Defective Pixel Limit | Maximum 4 pixels | No adjacent defective pixels allowed |

## 3. Pin Definition

The MLX90642ESF uses a TO39 metal package with 4 pins defined as follows:

| Pin | Name | I/O | Description |
|:---|:---|:---:|:---|
| 1 | SDA | I/O | I2C serial data |
| 2 | VDD | S | Positive power supply (3.3V) |
| 3 | GND | S | Ground |
| 4 | SCL | I | I2C serial clock |

---

| Item | Information |
|:---|:---|
| Document Version | v1.0 |
| Last Updated | 2026-04-08 |
