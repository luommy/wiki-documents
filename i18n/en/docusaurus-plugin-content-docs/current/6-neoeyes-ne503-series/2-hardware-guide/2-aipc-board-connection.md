---
description: NE503 AI-PC interface board (STM32G0B0RET6) hardware interface pin definitions, covering complete IO configurations for 17 interfaces including Alarm, RS-485, IR-CUT, fill lights, LENS Driver, fan, and RTC.
keywords: [NE503, STM32G0B0, AI-PC interface board, IO configuration, pin definition, RS-485, IR-CUT, fill light, hardware connection]
tags: [NE503, AI-PC interface board, IO configuration, STM32G0B0]
---

# AI-PC Board Interfaces

The AI-PC interface board manages all peripherals and communication interfaces through an independent MCU (STM32G0B0RET6), and communicates with the core processing board via UART0.

## Interface Overview

| # | Function | Description |
|:---|:---|:---|
| 1 | Alarm IN/OUT | — |
| 2 | RS-485 | — |
| 3 | Radar Power Enable | PB0 |
| 4 | Wiegand Protocol | — |
| 5 | IR-CUT Driver | IR-cut device |
| 6 | Light Sensor ADC | Threshold |
| 7 | Dual-Light LED Driver | — |
| 8 | IR Board Driver | — |
| 9 | LENS Driver | SPI |
| 10 | System Indicator LED | — |
| 11 | Temperature Sensor | — |
| 12 | Fan Driver | — |
| 13 | ST-LINK | — |
| 14 | Debug UART1 | — |
| 15 | Heater | — |
| 16 | Board Reset | — |
| 17 | RTC | — |

## Alarm & Communication

### Alarm I/O

| Pin | Function | Note |
|:---|:---|:---|
| PB13 | Alarm_IN0 | External alarm input 0 |
| PB14 | Alarm_IN1 | External alarm input 1 |
| PA8 | Alarm_OUT0 | Alarm output 0 (level output) |
| PA9 | Alarm_OUT1 | Alarm output 1 (shared with USART1_TX) |

### RS-485

| Pin | Function |
|:---|:---|
| PC4 | RS485_TXD3 (Transmit) |
| PC5 | RS485_RXD3 (Receive) |
| PB1 | RS485_EN (Transceiver enable) |

### Wiegand Protocol

| Pin | Function |
|:---|:---|
| PC7 | Wiegand_1 (Data line 1) |
| PC6 | Wiegand_0 (Data line 0) |

### Radar Power Enable

| Pin | Function |
|:---|:---|
| PB0 | Radar_EN (Radar power enable) |

## Imaging & Optics

### IR-CUT

| Pin | Function | Note |
|:---|:---|:---|
| PB8 | IR_CUT_EN (IR-CUT driver enable) | Supports auto / day / night mode switching |

### Light Sensor

| Pin | Function | Note |
|:---|:---|:---|
| PA1 | PD_ADC (ADC1_IN1, photoresistor sampling) | Ambient light threshold detection |

### Dual-Light LED Board

| Pin | Function |
|:---|:---|
| PB4 | PWM_R (Red light PWM) |
| PB5 | PWM_W (White light PWM) |
| PB6 | R_CTL (Red light switch control) |
| PB7 | W_CTL (White light switch control) |

### IR Board Driver

| Pin | Function |
|:---|:---|
| PC9 | PWM_Far (Far IR PWM) |
| PC8 | PWM_Near (Near IR PWM) |

### LENS Driver

SPI interface for motorized zoom and autofocus lens control. The MCU-side LENS Driver works in conjunction with the core processing board side, with the MCU responsible for lens homing and limit protection.

| Pin | Function |
|:---|:---|
| PA5 | SPI1_CLK (SPI clock) |
| PA6 | SPI1_MISO (SPI master in slave out) |
| PA7 | SPI1_MOSI (SPI master out slave in) |
| PA4 | SPI1_CS (SPI chip select) |
| PB3 | LENSPOWER_EN (Lens power enable) |
| PD6 | F_RST (Focus reset) |
| PD5 | Z_RST (Zoom reset) |
| PD4 | RSTB (Global reset) |
| PD3 | PLS2 (Step control 2) |
| PD2 | PLS1 (Step control 1) |
| PD1 | VD_FZ (Vertical drive Focus/Zoom) |
| PD0 | LS_FZ (Limit switch Focus/Zoom) |

## System Management

### System Indicator LED

| Pin | Function | Note |
|:---|:---|:---|
| PD9 | SYS-LED (System status indicator) | Blue, MCU direct control |

### Temperature Sensor (LMT87DCK)

| Pin | Function |
|:---|:---|
| PB2 | Temp_ADC (Temperature ADC sampling) |

### Fan Driver

| Pin | Function | Note |
|:---|:---|:---|
| PB9 | FAN_EN (Fan enable) | 12V, shared with heater, auto-switching by temperature threshold |

### Heater

| Pin | Function | Note |
|:---|:---|:---|
| PB9 | Heater drive (shared enable pin with fan) | 12V, shared PB9 with fan |

## Debug & Control

### ST-LINK

| Pin | Function |
|:---|:---|
| PA14 | SWDCLK / BOOT0 |
| PA13 | SWDIO |

### UART1 (Debug Serial Port)

| Pin | Function |
|:---|:---|
| PA10 | USART1_RX (Receive) |
| PA9 | USART1_TX (Transmit) |

### Board Reset

| Pin | Function |
|:---|:---|
| PD8 | POWER_RST (Core processing board reset control) |

### RTC

MCU VBAT is connected to a supercapacitor to maintain RTC operation and synchronizes system time to the core processing board.

| Function | Description |
|:---|:---|
| RTC Power | VBAT with external supercapacitor |
| Time Sync | MCU RTC synchronized to core processing board |
| Power-off Retention | Supercapacitor maintains RTC operation |
