---
sidebar_position: 11
description: This document introduces the Nicera NP624M-F digital dual-element PIR sensor, covering product overview, specifications, and pin definitions for human motion detection and smart security applications.
keywords: [PIR sensor, NP624M, Nicera, human detection, digital dual-element, infrared sensing, smart security, low power]
tags: [sensor, PIR, hardware development resources]
---
# PIR Sensor

## Overview

The Nicera NP624M-F is a digital dual-element PIR (Passive Infrared) sensor with a built-in 14-bit ADC and 25-bit configuration registers, supporting both interrupt mode and serial output mode. With an ultra-low operating current (typically 3µA) and RF interference resistance design, it is ideal for battery-powered IoT devices for human motion detection.

![PIR-NP624M-F](https://resources.camthink.ai/wiki/img/hardware-dev-resources/pir-sensor/pir-np624m-f.png)

## 1. Product Overview

### 1.1 Key Features

- **Digital dual-element PIR sensor**: Built-in signal processing circuit with direct digital output
- **Ultra-low power**: Typical operating current of only 3µA, suitable for battery-powered applications
- **RF interference resistance**: Excellent RF immunity design for complex electromagnetic environments
- **High-precision ADC**: 14-bit analog-to-digital converter for accurate infrared signal capture
- **Flexible configuration**: 25-bit configuration registers supporting interrupt mode and serial output mode
- **Compact package**: 4-pin package with sensing element size of 2.3 × 1mm

### 1.2 NE301 Application Scenarios

In the NE301 sensor expansion board, the PIR sensor serves as an **event trigger source** for on-demand snapshot capture. When the PIR detects human motion, it sends an IO trigger signal to wake up the NE301 for snapshot capture, avoiding continuous recording of irrelevant footage and significantly saving storage, bandwidth, and battery power.

| Application Scenario | Description |
|:---|:---|
| Security Monitoring | Human motion triggers snapshot capture, retaining only event-related footage |
| Construction Site Protection | Detects personnel activity in construction areas, triggering on-demand snapshots |
| Wildlife Monitoring | PIR-triggered snapshots in battery-powered scenarios to conserve power |
| Intrusion Alert | Detects intrusion behavior, triggers snapshot capture and reports via MQTT |

> For detailed integration instructions, refer to the [PIR Sensor Integration Guide](/docs/neoeyes-ne301-series/application-guide/pir-sensor-integration).

## 2. Specifications

### 2.1 Basic Parameters

| Parameter | Specification |
|:---|:---|
| Model | NP624M-F |
| Manufacturer | Nicera (Japan) |
| Type | Digital dual-element PIR sensor |
| Sensing Element Size | 2.3 × 1 mm |
| Package | 4 pin |

### 2.2 Performance Parameters

| Parameter | Min | Typical | Max | Unit |
|:---|:---:|:---:|:---:|:---|
| Supply Voltage (VIN) | 1.6 | — | 3.6 | V |
| Operating Current | — | 3 | 5 | µA |
| System Clock | — | 32 | — | KHz |
| ADC Resolution | — | 14 | — | bit |
| Configuration Register | — | 25 | — | bit |
| Interrupt Cycle | — | 512clk | — | 16ms |

### 2.3 Operating Conditions

| Parameter | Specification | Description |
|:---|:---|:---|
| Operating Temperature | -20°C ~ 70°C | Standard operating range |
| Storage Temperature | -30°C ~ 80°C | Non-operating state |
| Recommended Lens | Excelitas Fresnel lens | Minimum transmittance of 77% |

## 3. Pin Definition

The NP624M-F uses a 4-pin package with the following pin definitions:

| Pin | Name | Description |
|:---|:---|:---|
| 1 | INT/Dout | Interrupt output / Serial data output |
| 2 | VDD | Power supply input (1.6V ~ 3.6V) |
| 3 | Serial_In | Serial data input / Clock input |
| 4 | GND | Ground |

---

| Item | Information |
|:---|:---|
| Document Version | v1.0 |
| Last Updated | 2026-04-08 |
