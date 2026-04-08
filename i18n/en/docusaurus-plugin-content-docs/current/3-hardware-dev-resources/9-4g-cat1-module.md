---
sidebar_position: 9
description: Detailed introduction to LTE Cat.1 modules based on EG912U-GL and EG915Q-NA, designed for M2M and IoT applications. Supports global multi-band network coverage, 10 Mbps downlink rates, and rich interfaces (UART/USB), suitable for IoT communication and hardware development.
keywords: [Cat.1 Module, LTE Cat 1, EG912U, EG915Q, IoT, M2M, Wireless Communication, Hardware Development, 4G Communication, Quectel]
tags: [Cat.1, 4G Module, IoT, Hardware Resources, Communication Module]
---

import AccessoriesTable from '@site/src/components/AccessoriesTable';
import useBaseUrl from '@docusaurus/useBaseUrl';

# 4G Module (Cat.1)

## 1. Product Features
This module is developed based on the EG912U-GL (for regions outside North America) and EG915Q-NA (for North America).

The EG912U/EG915Q are LTE Cat.1 modules designed for M2M and IoT applications, supporting seamless network switching and rich interfaces. Core features include:

### EG912U Series Module Specifications

| **Module**  | **EG912U-GL** |
|:---:|:---:|
| **Network Coverage** | Global bands (B1/2/3/4/5/7/8/12/13/17/18/19/20/25/26/28/66 LTE-FDD + B34/38/39/40/41 LTE-TDD) |
| **Data Rate** | LTE-FDD: 10Mbps (DL) / 5Mbps (UL) LTE-TDD: 8.96Mbps (DL) / 3.1Mbps (UL) |
| **Optional Features** | GNSS (GPS/GLONASS/BDS/Galileo/QZSS) Bluetooth 4.2 Wi-Fi Scan |
| **Interfaces** | 3x UART, USB 2.0, PCM/I2S audio, 2x ADC, SPI/I2C/LCM/Camera/SD card (QuecOpen®) |
| **Antenna** | Main antenna + GNSS/Wi-Fi antenna (optional) |

## Cat-1 (EG912U) Module Specifications
| 1    | Module                   | Quectel EG912UGL                                             |
|:----:|:------------------------:|:------------------------------------------------------------:|
| 2    | LTE-FDD                  | B1/ 2/ 3/ 4/ 5/ 7/ 8/ 12/ 13/ 17/ 18/ 19/ 20/ 25/ 26/ 28/ 66 |
| 3    | LTE-TDD                  | B34/ 38/ 39/ 40/ 41                                          |
| 4    | GSM                      | B2/ 3/ 5/ 8                                                  |
| 5    | Antenna                  | PCB Antenna                                                  |
| 6    | Communication Interfaces | UART                                                         |
| 7    | Power Supply             | DC 4-6V                                                      |
| 8    | Operation Temperature    | -20℃ ~ +60℃                                                  |
| 9    | Storage Temperature      | -40℃ ~ +85℃                                                  |
| 10   | Dimensions               | 60 x 60 mm                                                   |
| 11   | Certifications           | CE                                                           |

### EG915Q Module Specifications
|  **Module**  | **EG915Q-NA** |
|:---:|:---:|
| **Network Coverage** | B2/B4/B5/B12/B13/B14/B66/B71 |
| **Data Rate** | LTE-FDD: 10Mbps (DL) / 5Mbps (UL) |
| **Interfaces** | UART, USB 2.0, PCM, SPI/I2C/LCM/Camera |
| **Antenna** | Main antenna + GNSS/Wi-Fi antenna (optional) |
---
## Cat-1 (EG915Q) Module Specifications
| 1    | Module                   | Quectel EG915Q-NA                                             |
|:----:|:------------------------:|:------------------------------------------------------------:|
| 2    | LTE-FDD                  | B2/B4/B5/B12/B13/B14/B66/B71 |
| 3    | Antenna                  | PCB Antenna                                                  |
| 4    | Communication Interfaces | UART                                                         |
| 5    | Power Supply             | DC 4-6V                                                      |
| 6    | Operation Temperature    | -20℃ ~ +60℃                                                  |
| 7    | Storage Temperature      | -40℃ ~ +85℃                                                  |
| 8   | Dimensions               | 60 x 60 mm                                                   |
| 9   | Certifications           | FCC                                                           |

## Interface Description (J1)

The module communicates with the motherboard via the J1 interface through UART. The pin definitions are as follows:

| PIN# | Pin Name | Functions          | Pin Type | Pull Up/Down |
| :---:| :------: | :----------------: | :------: | :-----------:|
| 1    | UART_TXD | UART Transmit      | OUT      | N/A          |
| 2    | NC       |                    |          |              |
| 3    | CAT1_PWR | High=ON;Low=OFF    | IN       | N/A          |
| 4    | NC       |                    |          |              |
| 5    | NC       |                    |          |              |
| 6    | NC       |                    |          |              |
| 7    | UART_RXD | UART Receive       | IN       | N/A          |
| 8    | NC       |                    |          |              |
| 9    | GND      | GND                | POWER    |              |
| 10   | GND      | GND                | POWER    |              |
| 11   | NC       |                    |          |              |
| 12   | NC       |                    |          |              |
| 13   | VCC_IN   | Power Supply       |          |              |
| 14   | 3V3      | 3.3 V power supply | POWER    |              |
| 15   | VCC_IN   | Power Supply       | POWER    |              |
| 16   | 3V3      | 3.3 V power supply | POWER    |              |
## Dimensions

60*60mm
<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/hardware-dev-resources/cat1-module/cat1PCBA.jpg" alt="cat1PCBA" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
</div>
