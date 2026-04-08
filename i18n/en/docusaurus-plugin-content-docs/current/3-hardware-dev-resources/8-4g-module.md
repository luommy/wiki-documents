---
sidebar_position: 8
description: This document details the Quectel EM05-G 4G module, an LTE Cat 4 module designed for IoT/M2M applications. It supports multiple global network standards, provides high-speed transmission (150 Mbps downlink, 50 Mbps uplink), is compatible with multiple operating systems, and offers industrial-grade reliability. Content covers product features, specifications, M.2 Key B interface description, and hardware design guidelines.
keywords: [4G module, LTE Cat 4, Quectel EM05-G, IoT/M2M, M.2 module, wireless communication, hardware development, industrial grade, global bands, high-speed transmission]
tags: [4G, wireless module, LTE, hardware resources, Quectel]
---
import AccessoriesTable from '@site/src/components/AccessoriesTable';
import useBaseUrl from '@docusaurus/useBaseUrl';

# 4G Module
## Product Features
The Quectel EM05-G is an LTE Cat 4 module designed for IoT/M2M applications. It supports multi-mode networks (LTE-FDD/TDD, WCDMA, CDMA, etc.) and uses an M.2 form factor, making it suitable for industrial routers, vehicle-mounted devices, digital signage, and other scenarios. Its core features include:
- **Global Band Coverage**: Supports multiple bands including LTE-FDD/TDD and WCDMA, compatible with major global operators.
- **High-Speed Transmission**: Downlink rate up to 150 Mbps, uplink rate up to 50 Mbps.
- **Multi-OS Compatibility**: Supports Windows/Linux/Android drivers, with integrated DFOTA and optional GNSS.
- **Industrial-Grade Reliability**: Operating temperature range -30°C to +70°C, extended temperature -40°C to +85°C.

### Model Comparison

|Model       |Region/Carrier      | Supported Network Standards             | Dimensions (mm)       | Temperature Range        |
|:---------:|:---------------:|:-----------------------:|:---------------:|:---------------:|
| EM05-CN   | China, Thailand, India| LTE-FDD/TDD, WCDMA, CDMA | 30.0×42.0×2.3   | -30°C~+70°C      |
| EM05-E    | Europe, Australia, New Zealand| LTE-FDD/TDD, WCDMA | 30.0×42.0×2.3   | -30°C~+70°C      |
| EM05-G    |&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Global | LTE-FDD (B1/B2/B3/B4/B5/B7/B8/B12/B13/B14/B18/B19/B20/B25/B26/B28/B66/B71) | 30.0×42.0×2.3| -40°C~+85°C (Extended) |

---
## Specifications

| Parameter                | Specification                                                              |
|:-------------------:|:-----------------------------------------------------------------:|
| Supply Voltage            | 3.135 V ~ 4.4 V (Typical 3.3 V)                                    |
| Operating Current (LTE-FDD) | Max 1005 mA (B71 Band)                                           |
| Operating Temperature            | -30°C ~ +70°C (Standard); -40°C ~ +85°C (Extended)                        |
| Storage Temperature            | -40°C ~ +90°C                                                      |
| Antenna Interface Impedance        | 50 Ω                                                               |
| USB Interface            | USB 2.0 High-Speed (480 Mbps)                                           |

### RF Performance
| Network Standard    | Downlink Rate   | Uplink Rate    | Supported Band Examples                          |
|:----------:|:----------:|:----------: |:------------------------------------:|
| LTE Cat 4  | 150 Mbps   | 50 Mbps    | B1/B2/B3/B4/B5/B7/B8/B12/B13/B14, etc.   |
| DC-HSDPA   | 42 Mbps    | 5.76 Mbps  | WCDMA B1/B2/B4/B5/B6/B8/B19          |

---
## Interface Description (M.2 Key B)

### Pin Definition Table
| Pin Type       | Pin Name          | Function Description                              |
|:-------------:|:-----------------:|:-------------------------------------:|
| **Power**       | VCC               | Main power input (3.3 V)                   |
| **Ground**         | GND               | Ground                                  |
| **USB Interface**   | USB_DP/USB_DM     | USB 2.0 differential data lines (90 Ω impedance matching)    |
| **SIM Interface**   | USIM1_DATA/CLK    | 1.8 V/3.0 V SIM card data and clock signals      |
| **Control Signal**   | RESET#            | Module reset (active low)                |
| **RF Interface**   | ANT_MAIN          | Main antenna interface (LTE/WCDMA)               |
| **GNSS Interface**  | ANT_DRX/ANT_GNSS  | Diversity Receive/GNSS antenna interface (optional)        |

---
## Usage Instructions

### Key Hardware Design Points
1. **Power Supply Design**
   - Requires a regulated 3.3 V power supply; transient voltage must be ≤4.7 V.
   - Reference circuit must include filter capacitors (e.g., 220 μF tantalum capacitor + 100 nF ceramic capacitor).

2. **Antenna Connection**
   - Main antenna (ANT_MAIN) and diversity antenna (ANT_DRX) must use 50 Ω RF cables.
   - GNSS antenna must support L1 band (1559~1609 MHz).

3. **SIM Card Interface**
   - Supports 1.8 V/3.0 V SIM cards; place close to the module to minimize signal interference.
   - Hot-swap detection pin (USIM_DET) requires resistor voltage divider protection.

4. **Firmware Upgrade**
   - Update firmware via USB using DFOTA or QFlash tools.

## Physical Dimensions

### Dimensional Description
- **Dimensions**: 42.0 mm (L) × 30.0 mm (W) × 2.3 mm (H)
- **Mounting Holes**: 4 × M2 threaded holes; thermal pad recommended for heat dissipation
<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/hardware-dev-resources/4g-module/4G_Module.jpg" alt="4G_Module" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
</div>
