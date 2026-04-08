---
sidebar_position: 12
description: This document introduces the Ingenic RKB1161LX1 24GHz mmWave radar module, covering product overview, specifications, and pin definitions for human presence detection and smart security applications.
keywords: [mmWave radar, 24GHz, RKB1161L, presence detection, FMCW, Ingenic, UART, human detection, smart security]
tags: [sensor, mmWave radar, hardware development resources]
---
# mmWave Radar Sensor

## Overview

The RKB1161LX1 is a 24GHz mmWave radar module developed by Ingenic (Xiamen) Co., Ltd., utilizing FMCW modulation to support both motion detection and presence detection. The module can penetrate non-metallic enclosures and detect subtle movements such as human breathing, making it suitable for smart security, smart home, and other applications.

![24GHz-mmWave-RKB1161L](https://resources.camthink.ai/wiki/img/hardware-dev-resources/mmwave-radar-sensor/mmwave-rkb1161l.png)

## 1. Product Overview

### 1.1 Key Features

- **Motion and presence detection**: Detects not only human movement but also subtle motions such as breathing
- **Non-metal penetration**: Can penetrate plastic, glass, wood, ceramic, and other non-metallic enclosures
- **Rich data output**: Outputs target distance, velocity, azimuth angle, signal strength, and other information
- **Low power consumption**: Average current of only 100µA, suitable for battery-powered applications
- **Ultra-compact size**: Module dimensions of only 20 × 20 × 1.0mm for easy integration
- **OTA upgrade**: Supports online parameter configuration and firmware over-the-air updates

### 1.2 NE301 Application Scenarios

In the NE301 sensor expansion board, the mmWave radar serves as a **high-precision presence detection sensor**, capable of detecting subtle human movements such as breathing through non-metallic enclosures, enabling more accurate trigger snapshots than PIR. When the radar detects human presence or activity, it sends an IO signal to wake up the NE301 for snapshot capture.

| Application Scenario | Description |
|:---|:---|
| Smart Security | Detects human presence in the area, triggering precise snapshot capture |
| Smart Home | Triggers NE301 to capture and record personnel entry/exit events |
| Health Monitoring | Detects subtle movements such as breathing, triggering anomaly status snapshots |
| IoT Gateway | Low-power presence detection, waking NE301 on demand for snapshot capture |

## 2. Specifications

### 2.1 Basic Parameters

| Parameter | Specification |
|:---|:---|
| Model | RKB1161LX1 |
| Manufacturer | Ingenic (Xiamen) Co., Ltd. |
| Operating Frequency | 24 ~ 24.25 GHz |
| Modulation | FMCW |
| Module Dimensions | 20 × 20 × 1.0 mm |
| Pin Header Pitch | 2.0 mm |
| Software Version | RKB1161LX1_V1.1_20241023 |

### 2.2 Performance Parameters

| Parameter | Specification | Description |
|:---|:---|:---|
| Motion Detection Range (horizontal) | 7 m | Maximum straight-line detection distance |
| Presence Detection Range (horizontal) | 4 m | Can detect subtle movements such as breathing |
| Detection Cycle | 2 times per second | Detection once every 0.5 seconds |
| Data Format | UART | Baud rate 115200 |
| Output Level | TTL-3V | Compatible with 3.3V logic level |

### 2.3 Electrical Parameters

| Parameter | Min | Typical | Max | Unit |
|:---|:---:|:---:|:---:|:---|
| Supply Voltage | 3.3 | — | 5.0 | V |
| Average Current | — | 100 | — | µA |
| Peak Current (transient) | — | — | ~80 | mA |
| Output High Level | — | 3.0 | — | V |

### 2.4 Operating Conditions

| Parameter | Specification | Description |
|:---|:---|:---|
| Operating Temperature | -10°C ~ 50°C | Indoor applications |
| Storage Temperature | -20°C ~ 70°C | Non-operating state |

## 3. Pin Definition

The RKB1161LX1 uses a 5-pin, 2.0mm pitch pin header package (pin headers not included), with the following pin definitions:

| Pin | Name | Description |
|:---|:---|:---|
| 1 | OUT | Outputs 3V when target detected, 0V when no target |
| 2 | UART_TX | TTL level data transmit (connect to host RX) |
| 3 | UART_RX | TTL level data receive (connect to host TX) |
| 4 | GND | Ground |
| 5 | VCC | Power supply input (3.3V ~ 5V) |

---

| Item | Information |
|:---|:---|
| Document Version | v1.0 |
| Last Updated | 2026-04-08 |
