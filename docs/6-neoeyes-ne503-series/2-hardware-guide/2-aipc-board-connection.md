---
description: NE503 AI-PC 接口板（STM32G0B0RET6）硬件接口引脚定义，涵盖 Alarm、RS-485、IR-CUT、补光灯、LENS Driver、风扇、RTC 等 17 个接口的完整 IO 配置。
keywords: [NE503, STM32G0B0, AI-PC接口板, IO配置, 引脚定义, RS-485, IR-CUT, 补光灯, 硬件连接]
tags: [NE503, AI-PC接口板, IO配置, STM32G0B0]
---

# AI-PC Board Interfaces

AI-PC 接口板通过独立 MCU（STM32G0B0RET6）管理全部外设与通信接口，通过 UART0 与核心处理板通信。

## 功能总览

| # | 功能 | 说明 |
|:---|:---|:---|
| 1 | Alarm IN/OUT | — |
| 2 | RS-485 | — |
| 3 | 雷达驱动电源使能 | PB0 |
| 4 | Weigand 协议 | — |
| 5 | IR-CUT 驱动 | IR-cut 器件 |
| 6 | 光敏 ADC 检测 | 阈值 |
| 7 | 双光 LED 驱动 | — |
| 8 | 灯板驱动 | — |
| 9 | LENS Driver | SPI |
| 10 | 系统指示灯 | — |
| 11 | 温度传感器 | — |
| 12 | 风扇驱动 | — |
| 13 | ST-LINK | — |
| 14 | 调试串口 UART1 | — |
| 15 | Heat 加热 | — |
| 16 | 主板复位 | — |
| 17 | RTC | — |

## 报警与通信

### Alarm I/O

| 引脚 | 功能 | 备注 |
|:---|:---|:---|
| PB13 | Alarm_IN0 | 外部报警输入 0 |
| PB14 | Alarm_IN1 | 外部报警输入 1 |
| PA8 | Alarm_OUT0 | 报警输出 0（电平输出） |
| PA9 | Alarm_OUT1 | 报警输出 1（与 USART1_TX 复用） |

### RS-485

| 引脚 | 功能 |
|:---|:---|
| PC4 | RS485_TXD3（发送） |
| PC5 | RS485_RXD3（接收） |
| PB1 | RS485_EN（收发使能） |

### 韦根协议

| 引脚 | 功能 |
|:---|:---|
| PC7 | Wiegand_1（数据线 1） |
| PC6 | Wiegand_0（数据线 0） |

### 雷达供电使能

| 引脚 | 功能 |
|:---|:---|
| PB0 | Radar_EN（雷达电源使能） |

## 成像与光学

### IR-CUT

| 引脚 | 功能 | 备注 |
|:---|:---|:---|
| PB8 | IR_CUT_EN（IR-CUT 驱动使能） | 支持 auto / day / night 三模式切换 |

### 光敏检测

| 引脚 | 功能 | 备注 |
|:---|:---|:---|
| PA1 | PD_ADC（ADC1_IN1，光敏电阻采样） | 环境光阈值判断 |

### 双光灯板

| 引脚 | 功能 |
|:---|:---|
| PB4 | PWM_R（红光 PWM） |
| PB5 | PWM_W（白光 PWM） |
| PB6 | R_CTL（红光开关控制） |
| PB7 | W_CTL（白光开关控制） |

### 红外灯板驱动

| 引脚 | 功能 |
|:---|:---|
| PC9 | PWM_Far（远红外 PWM） |
| PC8 | PWM_Near（近红外 PWM） |

### LENS Driver

SPI 接口控制电动变焦与自动对焦镜头。MCU 侧 LENS Driver 与核心处理板侧协同工作，MCU 负责镜头归零与限位保护。

| 引脚 | 功能 |
|:---|:---|
| PA5 | SPI1_CLK（SPI 时钟） |
| PA6 | SPI1_MISO（SPI 主入从出） |
| PA7 | SPI1_MOSI（SPI 主出从入） |
| PA4 | SPI1_CS（SPI 片选） |
| PB3 | LENSPOWER_EN（镜头电源使能） |
| PD6 | F_RST（Focus 复位） |
| PD5 | Z_RST（Zoom 复位） |
| PD4 | RSTB（总复位） |
| PD3 | PLS2（步进控制 2） |
| PD2 | PLS1（步进控制 1） |
| PD1 | VD_FZ（垂直驱动 Focus/Zoom） |
| PD0 | LS_FZ（限位开关 Focus/Zoom） |

## 系统管理

### 系统指示灯

| 引脚 | 功能 | 备注 |
|:---|:---|:---|
| PD9 | SYS-LED（系统状态指示灯） | 蓝色，MCU 直接控制 |

### 温度传感器（LMT87DCK）

| 引脚 | 功能 |
|:---|:---|
| PB2 | Temp_ADC（温度 ADC 采样） |

### 风扇驱动

| 引脚 | 功能 | 备注 |
|:---|:---|:---|
| PB9 | FAN_EN（风扇使能） | 12V，与加热器共用引脚，温度阈值自动切换 |

### 加热器

| 引脚 | 功能 | 备注 |
|:---|:---|:---|
| PB9 | 加热器驱动（与风扇共用使能引脚） | 12V，与风扇共用 PB9 |

## 调试与控制

### ST-LINK

| 引脚 | 功能 |
|:---|:---|
| PA14 | SWDCLK / BOOT0 |
| PA13 | SWDIO |

### UART1（调试串口）

| 引脚 | 功能 |
|:---|:---|
| PA10 | USART1_RX（接收） |
| PA9 | USART1_TX（发送） |

### 主板复位

| 引脚 | 功能 |
|:---|:---|
| PD8 | POWER_RST（核心处理板复位控制） |

### RTC

MCU VBAT 外接法拉电容维持 RTC 运行，并同步至核心处理板系统时间。

| 功能 | 说明 |
|:---|:---|
| RTC 电源 | VBAT 外接法拉电容 |
| 时间同步 | MCU RTC 同步至核心处理板 |
| 断电保持 | 电容维持 RTC 运行 |
