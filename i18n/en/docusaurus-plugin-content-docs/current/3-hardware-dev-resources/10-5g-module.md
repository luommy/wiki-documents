---
sidebar_position: 10
description: This document details the core features and technical specifications of the 5G module, including support for 5G NR Sub-6GHz (SA/NSA), LTE-FDD/TDD, WCDMA/HSPA+, and other network modes. It uses an M.2 Key B interface, integrates L1+L5 dual-frequency GNSS, supports HPUE enhancement, and features an industrial-grade design. Content covers product features, specifications, interface configuration, power stability, and thermal management guidelines.
keywords: [5G module, 5G NR, Sub-6GHz, M.2 Key B, PCIe, USB 3.1, GNSS, HPUE, hardware development, wireless communication]
tags: [5G, wireless module, M.2 interface, hardware resources, communication module]
---
import AccessoriesTable from '@site/src/components/AccessoriesTable';
import useBaseUrl from '@docusaurus/useBaseUrl';

# 5G Module
## Product Features
### **Core Features**
- **Network Modes**: Supports **5G NR Sub-6GHz (SA/NSA)**, **LTE-FDD/TDD**, **WCDMA/HSPA+**.
- **Interface Type**: **M.2 Key B**, supporting **PCIe 3.0 x4** and **USB 3.1 Gen2**.
- **GNSS**: Integrated multi-mode positioning (GPS/GLONASS/BeiDou/Galileo/QZSS), supporting **L1+L5 dual-frequency** (requires AT commands or hardware control).
- **HPUE Enhancement**: Supports **Class 2 power level (26 dBm)**, improving cell-edge coverage.
- **Industrial-Grade Design**: Operating temperature **-40°C to +85°C**, dimensions **30×52×2.3mm**.

### **Model Comparison**
| **Model**      | **Supported Bands**                                                 | **HPUE Bands**       | **GNSS**      |
| ------------- | ------------------------------------------------------------ | ------------------- | ------------- |
| **RM520N-GL** | 5G: n1/n3/n5/n7/n28/n38/n40/n41/n77/n78/n79; LTE: B1/B3/B5/B7/B8/B20/B28/B38/B40/B41 | n38/n41/n77/n78/n79 | L1+L5 (reserved) |
| **RM520N-EU** | 5G: n1/n3/n7/n28/n41/n77/n78; LTE: B1/B3/B7/B8/B20/B28/B41   | n41/n77/n78         | L1+L5         |
| **RM520N-CN** | 5G: n41/n78/n79; LTE: B1/B3/B5/B8/B41                        | n41/n78/n79         | L1+L5         |

---
## Specifications
### **Electrical Characteristics**
| **Parameter**         | **Specification**                      |
| ---------------- | ----------------------------- |
| **Supply Voltage**     | 3.135V–4.4V (typical 3.7V)      |
| **5G Peak Power**  | 3.5A @ 3.7V (256QAM modulation)    |
| **LTE Peak Power** | 2.0A @ 3.7V (256QAM modulation)    |
| **Operating Temperature**     | -40°C to +85°C (industrial-grade)      |
| **Storage Temperature**     | -40°C to +90°C                |
| **ESD Protection**     | Contact discharge ±5kV, air discharge ±10kV |

### **RF Performance**
| **Network Type** | **Band**              | **Downlink Rate** | **Uplink Rate** | **MIMO Configuration** |
| ------------ | --------------------- | ------------ | ------------ | ------------- |
| **5G NR**    | n41/n78 (dual carrier aggregation) | 2.5 Gbps     | 900 Mbps     | 4×4 MIMO      |
| **LTE**      | B41 (5CA)            | 2 Gbps       | 200 Mbps     | 4×4 MIMO      |

### **Interface Specifications**
| **M.2 Key B**    | **Specification**                                                     |
| ---------------- | ------------------------------------------------------------ |
| **PCIe 3.0**     | 4 lanes (x4 Lane), theoretical bandwidth **32 Gbps**, supports NVMe protocol.    |
| **USB 3.1 Gen2** | 10 Gbps data rate, backward compatible with USB 2.0, supports UVC protocol extension.              |
| **(U)SIM**       | Dual SIM single standby, 1.8V/3.0V compatible, supports hot-swap (requires AT+QSIMDET enable). |

## Usage Instructions
1. **Interface Configuration**

   - **PCIe Mode Switch**:
     ```plaintext
     AT+QCFG="pcie/mode",1    // Switch to RC mode
     AT+QCFG="pcie/bandwidth",1 // Configure x4 lanes
     ```
   - **GNSS Control**:
     ```plaintext
     AT+QGPS=2          // Enable L1+L5 dual-frequency positioning
     AT+QGPSEND        // Disable GNSS
     ```

---
## Precautions
### **Key Design Considerations**
1. **Power Stability**
   - Transient voltage must be ≤50mV (use low ESR capacitors to suppress ripple).
   - Do not cut power directly; use `AT+QPOWD` for soft shutdown or pull `FULL_CARD_POWER_OFF#` low for at least 900ms.

2. **ESD Protection**
   - All interfaces must include TVS arrays (junction capacitance ≤10pF).
   - SIM card trace length ≤200mm, with 22Ω series resistors for EMI suppression.

3. **Thermal Management**
   - Under high load, attach thermal pads (thermal conductivity ≥5W/mK) or heat sinks (covering the module shield can).
   - Avoid proximity to heat sources; PCB exposed copper area ≥50%.

---
### **Safety and Maintenance**
- **Prohibited Operations**
  - Avoid ultrasonic cleaning (may damage crystal); power off before cleaning with alcohol.
  - In high-temperature environments (>85°C), derating is required; disable HPUE mode.

- **Firmware Upgrade**
  - Upgrade via USB 3.1 or PCIe interface; ensure stable power supply (voltage ≥3.3V).

---
**Appendix**
- **Mechanical Dimensions**: 30.0mm × 52.0mm × 2.3mm (M.2 Key B); reserve ≥2.5mm clearance for the thermal area.

- **Key AT Commands**:
  ```plaintext
  AT+CFUN=4        // Enter flight mode
  AT+QSCLK=1       // Enable sleep mode
  AT+QCFG="data_interface",0,0 // Switch back to USB mode
  ```

---

![5G_Module](https://resources.camthink.ai/wiki/img/hardware-dev-resources/5g-module/5G_Module.jpg)
