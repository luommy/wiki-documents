---
sidebar_position: 6
description: This document details the technical specifications of the Fn-Link FG6222MPUC-02 Wi-Fi module, which supports Wi-Fi 5 (802.11a/b/g/n/ac) and Bluetooth 5.0, features an M.2 Key E interface, operates on 2.4GHz and 5GHz dual bands, and delivers up to 866.7Mbps with 2T2R MIMO technology. Coverage includes key features, RF performance, Bluetooth specifications, and hardware installation instructions.
keywords: [Wi-Fi module, 802.11ac, Bluetooth 5.0, M.2 Key E, dual band, MIMO, wireless communication, hardware development, IoT, FG6222MPUC-02]
tags: [Wi-Fi, Bluetooth, wireless module, hardware resources, M.2 interface]
---

import AccessoriesTable from '@site/src/components/AccessoriesTable';
import useBaseUrl from '@docusaurus/useBaseUrl';

# WiFi Module

**Fn-Link FG6222MPUC-02 Technical Document**

---

### 1. Key Features
| Feature           | Description                                            |
| ----------------- | ------------------------------------------------------ |
| **Wireless Standard** | Wi-Fi 5 (802.11a/b/g/n/ac) + Bluetooth 5.0         |
| **Interface Type**    | M.2 Key E (PCIe x1 + USB 2.0)                     |
| **Frequency Bands**   | 2.4GHz (20/40MHz) + 5GHz (20/40/80MHz)             |
| **MIMO Technology**   | 2T2R (2-transmit 2-receive), MU-MIMO supported      |
| **Data Rate**         | Wi-Fi: up to 866.7Mbps (5GHz 80MHz), Bluetooth: 3Mbps (EDR) |
| **Operating Temp**    | 0°C to 70°C                                        |
| **Dimensions**        | 22mm × 30mm × 2.2mm (M.2 2230 form factor)         |
| **OS Compatibility**  | Android/Linux/Win CE/iOS/XP/WIN7/WIN10               |

---

### 2. Specifications
#### **RF Performance (Typical Values)**
| Frequency Band | Modulation     | Output Power (dBm) | Receiver Sensitivity (dBm) |
| -------------- | -------------- | ------------------ | -------------------------- |
| **2.4GHz**     | 802.11b        | 20                 | -92 (1Mbps)                |
|                | 802.11g/n      | 17                 | -70 (MCS7)                 |
| **5GHz**       | 802.11a/n/ac   | 15                 | -56 (MCS9)                 |

#### **Bluetooth Specifications**
| Parameter           | Specification                    |
| ------------------- | -------------------------------- |
| **Version**         | Bluetooth 5.0                    |
| **Modulation**      | GFSK/π/4-DQPSK/8DPSK             |
| **Output Power**    | Class 1/2/3 (up to 5dBm)         |
| **Receiver Sensitivity** | -70dBm (1Mbps)                |

---

### 3. Model Comparison
| Model             | Interface Type | Dimensions (mm) | Antenna Configuration | Typical Applications        |
| ----------------- | -------------- | --------------- | --------------------- | --------------------------- |
| **FG6222MPUC-02** | M.2 Key E      | 22×30×2.2       | Dual antenna (IPEX)   | Laptop/Tablet/Industrial PC |

---

### 4. Usage Instructions
#### **Hardware Installation**
1. **Interface Compatibility**:
   - Only supports **M.2 Key E slots** (commonly found in ultrabooks and industrial devices).
   - Verify that the motherboard supports both PCIe x1 (Wi-Fi) and USB 2.0 (Bluetooth) signals.
2. **Antenna Installation**:
   - Use dual-band antennas (2.4GHz/5GHz) and connect them securely via IPEX connectors.
   - Avoid contact between antennas and metal components to prevent signal degradation.

<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/hardware-dev-resources/wifi-module/WiFi_Module.jpg" alt="WiFi_Module" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
</div>
