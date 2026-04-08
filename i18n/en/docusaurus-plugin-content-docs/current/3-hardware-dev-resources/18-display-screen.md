---
sidebar_position: 18
description: This document introduces three display modules (0.96" OLED GME12864, 1.14" TFT LCD GMT114-02, 1.54" TFT LCD TB154-07-08-B), covering product overview, specifications, and pin definitions for embedded project display selection.
keywords: [display module, OLED, TFT LCD, SSD1315, ST7789, I2C, SPI, embedded display]
tags: [display, hardware development resources, sensor expansion board]
---
# Display Screen

## Overview

This document covers three GME display modules: a 0.96" OLED, a 1.14" TFT LCD, and a 1.54" TFT LCD. They use SSD1315 and ST7789 driver ICs respectively, supporting I2C and SPI interfaces, and can be widely used in IoT devices, smart terminals, and embedded instruments for information display.

<div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
  <div style={{ width: '260px' }}>![0.96" OLED GME12864](https://resources.camthink.ai/wiki/img/hardware-dev-resources/display-screen/display-oled-gme12864.png)</div>
  <div style={{ width: '260px' }}>![1.14" TFT LCD GMT114-02](https://resources.camthink.ai/wiki/img/hardware-dev-resources/display-screen/display-tft-1.14.png)</div>
  <div style={{ width: '260px' }}>![1.54" TFT LCD TB154-07-08-B](https://resources.camthink.ai/wiki/img/hardware-dev-resources/display-screen/display-tft-1.54.png)</div>
</div>

## 1. Product Overview

### 1.1 Product Comparison

| Parameter | 0.96" OLED (GME12864) | 1.14" TFT LCD (GMT114-02) | 1.54" TFT LCD (TB154-07-08-B) |
|:---|:---|:---|:---|
| Display Type | Passive Matrix OLED | IPS TFT | IPS TFT |
| Driver IC | SSD1315 | ST7789V | ST7789 |
| Resolution | 128 × 64 | 135 × 240 (RGB) | 240 × 240 (RGB) |
| Interface | I2C | 4-Wire SPI | 4-Wire SPI |
| Colors | Blue | 65K | 262K |
| Module Size (mm) | 24.7 × 27 × 11.3 | 31.4 × 28 × 11.3 | 32 × 43.7 × 5.32 |
| Pin Count | 4 | 8 | 8 |

### 1.2 Key Features

- **0.96" OLED**: Self-illuminating display with high contrast and low power consumption, suitable for static text and simple graphics
- **1.14" TFT LCD**: IPS wide viewing angle with SPI high-speed refresh and 65K colors, suitable for colorful UI interfaces
- **1.54" TFT LCD**: Large square screen with 262K colors and normally black mode display, suitable for interactive applications

### 1.3 NE301 Application Scenarios

In the NE301 sensor expansion board, the display serves as a **local status indicator and human-machine interface**, capable of displaying detection results, device status, and configuration information directly on the device without connecting to a phone or computer to view NE301's running status and AI detection results.

| Application Scenario | Recommended Module | Description |
|:---|:---|:---|
| Device Status Indicator | 0.96" OLED | Low-power display of device online status, IP address, model loading status |
| Detection Result Display | 1.14" TFT LCD | Colorful display of AI detection bounding boxes and confidence levels |
| Interactive Terminal | 1.54" TFT LCD | Large screen display of complete captured images and detailed configuration menus |

## 2. Specifications

### 2.1 Basic Parameters

#### 0.96" OLED (GME12864)

| Parameter | Specification |
|:---|:---|
| Manufacturer | GME |
| Model | GME12864-49/50/51/52/53/54 |
| Display Type | 0.96" OLED Passive Matrix |
| Drive Method | 1/64 Duty |
| Viewing Direction | 6 O'clock |
| Supply Voltage | 3.0V ~ 12.0V |
| Active Area | 22.74(L) × 11.86(W) mm |
| Effective Display Area | 21.74(L) × 10.86(W) mm |

#### 1.14" TFT LCD (GMT114-02)

| Parameter | Specification |
|:---|:---|
| Manufacturer | GME |
| Model | GMT114-02 |
| Display Type | 1.14" IPS TFT |
| Backlight | White LED |
| RoHS | YES |

#### 1.54" TFT LCD (TB154-07-08-B)

| Parameter | Specification |
|:---|:---|
| Manufacturer | GME |
| Model | TB154-07-08-B |
| Display Type | 1.54" IPS TFT |
| Display Mode | Normally Black |
| Viewing Angle | ALL |
| Effective Display Area | 27.72(W) × 27.72(H) mm |
| Pixel Pitch | 0.1155(H) × 0.1155(V) µm |
| Color Arrangement | RGB Vertical Stripe |

### 2.2 Performance Parameters

#### 1.54" TFT LCD DC Characteristics

| Parameter | Min | Typical | Max | Unit |
|:---|:---:|:---:|:---:|:---|
| Analog Supply VCC | 2.4 | 2.75 | 3.3 | V |
| Logic Supply IOVCC | 1.65 | 2.8 | 3.3 | V |

#### 1.54" TFT LCD Backlight Characteristics

| Parameter | Typical | Unit |
|:---|:---:|:---|
| Forward Voltage VF | 3.2 | V |
| Forward Current IF | 60 | mA |
| Power Consumption Pd | 192 | mW |
| LED Lifetime (25°C) | 10000 | Hrs |

### 2.3 Operating Conditions

| Parameter | Specification |
|:---|:---|
| Operating Temperature (1.54") | -20°C ~ 70°C |
| Storage Temperature (1.54") | -30°C ~ 80°C |
| Supply Voltage (0.96" OLED) | 3.0V ~ 12.0V |

## 3. Pin Definition

### 3.1 0.96" OLED (4-pin)

| Pin | Name | Description |
|:---|:---|:---|
| 1 | GND | Ground |
| 2 | VCC | Power supply input (3.0V ~ 12.0V) |
| 3 | SCL | I2C clock line |
| 4 | SDA | I2C data line |

### 3.2 1.14" TFT LCD (8-pin)

| Pin | Name | Description |
|:---|:---|:---|
| 1 | GND | Ground |
| 2 | VCC | Power supply input |
| 3 | SCL | SPI clock line |
| 4 | SDA | SPI data input/output |
| 5 | RES | Reset (active low) |
| 6 | DC | Data/command select |
| 7 | CS | Chip select (active low) |
| 8 | BLK | Backlight control |

### 3.3 1.54" TFT LCD (8-pin)

| Pin | Name | Description |
|:---|:---|:---|
| 1 | GND | Ground |
| 2 | VCC | Analog power supply |
| 3 | SCL | Serial clock |
| 4 | SDA | SPI data input/output |
| 5 | RST | LCM reset |
| 6 | DC | Register select |
| 7 | CS | Chip select (active low) |
| 8 | BL | Backlight |

---

| Item | Information |
|:---|:---|
| Document Version | v1.0 |
| Last Updated | 2026-04-08 |
