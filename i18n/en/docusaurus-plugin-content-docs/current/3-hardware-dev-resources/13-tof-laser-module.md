---
sidebar_position: 13
description: This document introduces the Polaris IC DTS6012M fully integrated single-channel dToF laser ranging module, covering product overview, specifications, and pin definitions for smart access control, drone altitude holding, and robot obstacle avoidance.
keywords: [dToF, laser ranging, DTS6012M, Polaris IC, UART, I2C, 905nm, laser sensor]
tags: [sensor, ranging, hardware development resources]
---
# dToF Laser Module

## Overview

The Polaris IC DTS6012M is a fully integrated single-channel direct Time-of-Flight (dToF) laser ranging mini-module with a built-in VCSEL laser and single-photon detector (SPAD), supporting both I2C and UART communication interfaces. With a wide measurement range of 0.2m to 20m, a maximum frame rate of 250fps, and Class 1 laser safety certification, it is suitable for smart access control, drone altitude holding, robot obstacle avoidance, and other applications.

![dToF-DTS6012M](https://resources.camthink.ai/wiki/img/hardware-dev-resources/tof-laser-module/dtof-dts6012m.png)

## 1. Product Overview

### 1.1 Key Features

- **Fully integrated design**: Built-in VCSEL laser + SPAD detector + signal processing circuit, no external optical components required
- **High frame rate**: Up to 250fps, meeting the needs of high-speed dynamic scenarios
- **Wide measurement range**: 0.2m ~ 20m, covering both near and far distance measurements
- **Sunlight resistance**: Capable of 12m ranging under 100Klux sunlight
- **Dual target detection**: Can simultaneously identify the distances of two targets (front and rear)
- **Temperature compensation**: Built-in temperature sensor for automatic temperature drift correction
- **Reflectance calibration**: Supports accuracy calibration for targets with different reflectance
- **Dual interface**: Supports UART and I2C communication, switchable via GPIO pin

### 1.2 NE301 Application Scenarios

In the NE301 sensor expansion board, the dToF module serves as a **distance perception sensor**, providing distance information for target snapshot capture. When a target enters the preset distance range, it triggers the NE301 to perform snapshot capture; the distance data can also be used as snapshot metadata to assist AI models in estimating target size.

| Application Scenario | Description |
|:---|:---|
| Smart Access Control | Detects personnel approach distance, triggering snapshot at close range |
| Robot Obstacle Avoidance | Provides obstacle distance data, assisting NE301 scene understanding |
| Vehicle Detection | Triggers NE301 snapshot within distance range, recording vehicle entry/exit |
| Industrial Inspection | Works with NE301 snapshots to quantify displacement or liquid level changes |

## 2. Specifications

### 2.1 Basic Parameters

| Parameter | Specification |
|:---|:---|
| Manufacturer | Polaris IC |
| Model | DTS6012M |
| Type | Fully integrated single-channel dToF ranging mini-module |
| Package Dimensions | 21 × 15 × 7.87 mm |
| Connector Pins | 6-pin |
| Weight | 1.35g |
| Supply Voltage | 3.0V ~ 3.6V (typical 3.3V) |
| Interface | I2C / UART (GPIO selectable) |
| Laser Wavelength | 905nm |
| Field of View (FoV) | {'<'} 2° |
| Laser Safety | Class 1 (IEC 60825-1:2014) |
| RoHS | Compliant |

### 2.2 Performance Parameters

| Parameter | Min | Typical | Max | Unit |
|:---|:---:|:---:|:---:|:---|
| Measurement Range | 0.2 | — | 20 | m |
| Frame Rate | 50 | 100 | 250 | fps |
| Accuracy | — | ±6cm@0.2~6m; ±1%@{'>'}6m | — | — |
| Sunlight Resistance (@100Klux) | — | 12 | — | m |
| Multi-target Detection | — | Dual target | — | — |
| Temperature Compensation | — | Yes | — | — |
| Reflectance Calibration | — | Yes | — | — |

### 2.3 Power Consumption

| Parameter | Value | Unit |
|:---|:---:|:---|
| Standby Power Consumption | 160 | mW |
| Operating Power Consumption | 329 | mW |

### 2.4 Operating Conditions

| Parameter | Value | Unit |
|:---|:---:|:---|
| Operating Temperature | -20 ~ 50 | °C |
| Storage Temperature | -40 ~ 85 | °C |
| ESD HBM | 2000 | V |
| ESD MM | 200 | V |
| ESD CDM | 500 | V |

## 3. Pin Definition

The DTS6012M uses a 6-pin connector with the following pin definitions:

| Pin | Name | Description |
|:---|:---|:---|
| 1 | 3V3_LASER | Laser boost circuit power supply (3.3V) |
| 2 | 3V3 | Low-voltage circuit power supply (3.3V) |
| 3 | UART_TX / I2C_SDA | UART transmit / I2C data |
| 4 | UART_RX / I2C_SCL | UART receive / I2C clock |
| 5 | GPIO | Mode selection (pull-down=UART, pull-up/floating=I2C) |
| 6 | GND | Ground |

---

| Item | Information |
|:---|:---|
| Document Version | v1.0 |
| Last Updated | 2026-04-08 |
