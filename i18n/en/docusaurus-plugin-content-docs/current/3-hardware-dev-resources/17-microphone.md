---
sidebar_position: 17
description: This document introduces the LinkMems LMA3729T381-OY3S MEMS digital microphone, covering performance parameters and pin definitions for voice interaction and IoT voice device applications.
keywords: [LMA3729, MEMS microphone, LinkMems, digital microphone, omnidirectional, low power, voice interaction]
tags: [sensor, microphone, hardware development resources]
---
# MEMS Microphone

## Overview

The LinkMems LMA3729T381-OY3S is a high-performance MEMS digital microphone featuring omnidirectional polar pattern, high SNR (63dB(A)), and ultra-compact package (3.76 × 2.95 × 1.00mm). Its low power design and excellent acoustic performance make it an ideal choice for voice interaction, smart speakers, and IoT voice devices.

![LMA3729](https://resources.camthink.ai/wiki/img/hardware-dev-resources/microphone/microphone-lma3729.png)

## 1. Product Overview

### 1.1 Key Features

- **Omnidirectional polar pattern**: 360° uniform sound pickup, suitable for all-scenario voice acquisition
- **High signal-to-noise ratio**: 63dB(A) SNR, ensuring clear voice capture quality
- **Low power consumption**: Operating current of only 75µA, suitable for battery-powered devices
- **Digital output**: PDM digital interface with strong anti-interference capability and long transmission distance
- **Ultra-compact package**: 3.76 × 2.95 × 1.00mm, weight {'<'}0.03g, saving space
- **Environmental compliance**: RoHS compliant, halogen-free, meeting green manufacturing requirements

### 1.2 NE301 Application Scenarios

In the NE301 sensor expansion board, the MEMS microphone serves as a **sound event trigger sensor**, capable of detecting specific sound events such as glass breakage and abnormal noises to trigger NE301 snapshot capture. In security scenarios, sound triggering complements PIR/radar triggering to form a multi-detection mechanism, reducing missed reports.

| Application Scenario | Description |
|:---|:---|
| Security Alert | Detects abnormal sounds such as glass breakage, immediately triggering NE301 snapshot capture |
| Environmental Monitoring | Detects abnormal equipment operating noise, triggering event snapshots |
| Voice Interaction | Detects voice commands or keywords, linking NE301 snapshot capture |
| IoT Gateway | Sound events trigger snapshots, working with other sensors for multi-modal perception |

## 2. Specifications

### 2.1 Basic Parameters

| Parameter | Specification |
|:---|:---|
| Model | LMA3729T381-OY3S |
| Manufacturer | LinkMems Acoustic Technology |
| Type | MEMS digital microphone |
| Package | 3.76 × 2.95 × 1.00mm (4-pin) |
| Weight | {'<'}0.03g |
| Supply Voltage | 1.6V ~ 3.6V (typical 2.0V) |
| Output Interface | PDM digital output |
| Acoustic Port Diameter | Ø0.325mm |

### 2.2 Performance Parameters

| Parameter | Condition | Min | Typical | Max | Unit |
|:---|:---|:---:|:---:|:---:|:---|
| Polar Pattern | — | — | Omnidirectional | — | — |
| Sensitivity | 94dB SPL @1kHz | -39 | -38 | -37 | dB |
| Output Impedance | 94dB SPL @1kHz | — | 400 | — | Ω |
| Operating Current | 94dB SPL @1kHz | — | 75 | — | µA |
| Signal-to-Noise Ratio | A-Weighted | — | 63 | — | dB(A) |
| Total Harmonic Distortion | 94dB SPL @1kHz | — | 0.15 | — | % |
| Acoustic Overload Point | 10% THD @1kHz | — | 125 | — | dBSPL |
| Power Supply Rejection Ratio PSRR | 200mVpp @1kHz | — | 60 | — | dB |

### 2.3 Operating Conditions

#### Absolute Maximum Ratings

| Parameter | Range |
|:---|:---|
| VDD to GND | -0.3V ~ +3.9V |
| OUT to GND | -0.3V ~ +3.9V |
| Input Current (any pin) | ±5mA |
| Temperature Range | -40°C ~ +100°C |

#### Reliability Test Standards

Sensitivity variation after each reliability test should be controlled within ±3dB.

## 3. Pin Definition

The LMA3729T381-OY3S uses a 4-pin package with the following pin definitions:

| Pin # | Name | Type | Description |
|:---:|:---|:---|:---|
| 1 | VDD | Power | Power supply input (1.6V ~ 3.6V) |
| 2 | GND | Ground | Ground |
| 3 | GND | Ground | Ground |
| 4 | OUT | Signal | PDM digital output signal |

> **Note**: Pin 2 and Pin 3 are both GND pins. During PCB layout, it is recommended that both GND pins be reliably grounded to reduce ground impedance and improve signal integrity.
---

| Item | Information |
|:---|:---|
| Document Version | v1.0 |
| Last Updated | 2026-04-08 |
