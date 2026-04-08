---
sidebar_position: 15
description: This document introduces the Sensirion SHT3x-DIS (SHT30) temperature and humidity sensor, covering product overview, specifications, and pin definitions for the calibrated digital output sensor in environmental monitoring and smart home applications.
keywords: [SHT30, Sensirion, temperature humidity sensor, I2C, digital output, DFN package, environmental monitoring, low power]
tags: [sensor, temperature humidity, hardware development resources]
---
# Temperature & Humidity Sensor

## Overview

The Sensirion SHT3x-DIS (SHT30) is a fully calibrated, linearized, and temperature-compensated digital output temperature and humidity sensor with standard I2C interface communication. Its high accuracy, low power consumption, and compact DFN package make it an ideal choice for environmental monitoring, smart home, and industrial control applications.

![SHT30-DIS](https://resources.camthink.ai/wiki/img/hardware-dev-resources/temperature-humidity-sensor/temp-humidity-sht30.png)

## 1. Product Overview

### 1.1 Key Features

- **Fully calibrated digital output**: Humidity accuracy ±2%RH, temperature accuracy ±0.2°C, no additional calibration required
- **Linearization and temperature compensation**: Sensor output has been linearized and temperature-compensated
- **Low power design**: Standby current of only 0.2µA, suitable for battery-powered scenarios
- **Standard I2C interface**: Supports up to 1MHz communication rate with two selectable slave addresses
- **Wide supply range**: 2.15V ~ 5.5V, compatible with various power supply systems
- **Compact package**: 8-Pin DFN package (2.5 × 2.5 × 0.9mm), saving PCB space

### 1.2 NE301 Application Scenarios

In the NE301 sensor expansion board, the temperature and humidity sensor serves as an **environmental context sensor**, providing environmental temperature and humidity metadata for each snapshot capture. This data is reported together with the captured images, helping backend analysis of environmental factors' impact on detection results (such as sensor accuracy changes under high-temperature and high-humidity conditions), and can also be used to determine whether the device's working environment is abnormal.

| Application Scenario | Description |
|:---|:---|
| Environmental Monitoring | Attaches temperature and humidity data to snapshots for environmental trend analysis |
| Smart Home | Records environmental temperature and humidity changes, linking NE301 snapshot capture and air conditioning control |
| Industrial Control | Monitors production line environmental conditions, triggering alarm snapshots for abnormal temperature or humidity |
| Warehouse Management | Tracks warehouse environment changes to ensure storage environment compliance |

## 2. Specifications

### 2.1 Basic Parameters

| Parameter | Specification |
|:---|:---|
| Model | SHT3x-DIS (SHT30) |
| Manufacturer | Sensirion (Switzerland) |
| Type | Digital temperature and humidity sensor |
| Package | 8-Pin DFN (2.5 × 2.5 × 0.9mm) |
| Supply Voltage | 2.15V ~ 5.5V |
| Communication Interface | I2C (up to 1MHz) |

### 2.2 Performance Parameters

#### Humidity Sensor

| Parameter | Condition | Typical | Max | Unit |
|:---|:---|:---:|:---:|:---|
| Accuracy (SHT30) | — | ±2 | — | %RH |
| Repeatability | Low | 0.21 | — | %RH |
| Resolution | — | 0.01 | — | %RH |
| Hysteresis | — | ±0.8 | — | %RH |
| Measurement Range | — | 0~100 | — | %RH |
| Response Time (τ63%) | — | 86 | — | s |
| Long-term Drift | — | {'<'}0.25 | — | %RH/yr |

#### Temperature Sensor

| Parameter | Condition | Typical | Max | Unit |
|:---|:---|:---:|:---:|:---|
| Accuracy (SHT30) | 0~90°C | ±0.2 | — | °C |
| Repeatability | — | 0.15 | — | °C |
| Resolution | — | 0.01 | — | °C |
| Measurement Range | — | -40~125 | — | °C |
| Response Time (τ63%) | — | {'>'}2 | — | s |
| Long-term Drift | — | {'<'}0.03 | — | °C/yr |

#### Electrical Specifications

| Parameter | Typical | Max | Unit |
|:---|:---:|:---:|:---|
| Supply Current (idle) | 0.2 | 2.0 | µA |
| Supply Current (measurement) | 600 | 1500 | µA |
| POR Rising Threshold | 1.8 | — | V |
| POR Falling Threshold | 2.1 | — | V |

### 2.3 Operating Conditions

| Parameter | Specification | Description |
|:---|:---|:---|
| Recommended Operating Temperature | 5°C ~ 60°C | Optimal accuracy range |
| Recommended Operating Humidity | 20~80%RH | Non-condensing |
| Storage Temperature | -40°C ~ 125°C | Non-operating state |

## 3. Pin Definition

The SHT30 uses an 8-Pin DFN package with the following pin definitions:

| Pin | Name | Description |
|:---|:---|:---|
| 1 | SDA | I2C serial data |
| 2 | ADDR | I2C address selection |
| 3 | ALERT | Temperature and humidity alarm output (open-drain) |
| 4 | SCL | I2C serial clock |
| 5 | VDD | Power supply input (2.15V ~ 5.5V) |
| 6 | nRESET | Reset pin (active low) |
| 7 | R | No electrical function (connect to VSS) |
| 8 | VSS | Ground |

> **I2C slave address selection**: When the ADDR pin is connected to logic low, the slave address is 0x44; when connected to logic high, the slave address is 0x45.
---

| Item | Information |
|:---|:---|
| Document Version | v1.0 |
| Last Updated | 2026-04-08 |
