---
sidebar_position: 18
description: 本文档介绍三款显示屏模组（0.96" OLED GME12864、1.14" TFT LCD GMT114-02、1.54" TFT LCD TB154-07-08-B）的产品概述、规格参数及引脚定义，帮助开发者在各类嵌入式项目中正确选型。
keywords: [显示屏模组, OLED, TFT LCD, SSD1315, ST7789, I2C, SPI, 嵌入式显示]
tags: [显示屏, 硬件开发资源, 传感器扩展板]
---
# Display Screen

## 概览

本文档涵盖三款金逸晨（GME）显示屏模组，分别为 0.96" OLED、1.14" TFT LCD 和 1.54" TFT LCD。它们分别采用 SSD1315 和 ST7789 驱动 IC，支持 I2C 和 SPI 接口，可广泛应用于物联网设备、智能终端和嵌入式仪器的信息显示。

<div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
  <div style={{ width: '260px' }}>![0.96" OLED GME12864](https://resources.camthink.ai/wiki/img/hardware-dev-resources/display-screen/display-oled-gme12864.png)</div>
  <div style={{ width: '260px' }}>![1.14" TFT LCD GMT114-02](https://resources.camthink.ai/wiki/img/hardware-dev-resources/display-screen/display-tft-1.14.png)</div>
  <div style={{ width: '260px' }}>![1.54" TFT LCD TB154-07-08-B](https://resources.camthink.ai/wiki/img/hardware-dev-resources/display-screen/display-tft-1.54.png)</div>
</div>

## 1. 产品概述

### 1.1 产品对比

| 参数 | 0.96" OLED (GME12864) | 1.14" TFT LCD (GMT114-02) | 1.54" TFT LCD (TB154-07-08-B) |
|:---|:---|:---|:---|
| 显示类型 | Passive Matrix OLED | IPS TFT | IPS TFT |
| 驱动 IC | SSD1315 | ST7789V | ST7789 |
| 分辨率 | 128 × 64 | 135 × 240 (RGB) | 240 × 240 (RGB) |
| 接口 | I2C | 4-Wire SPI | 4-Wire SPI |
| 颜色 | 蓝光 | 65K | 262K |
| 模组尺寸 (mm) | 24.7 × 27 × 11.3 | 31.4 × 28 × 11.3 | 32 × 43.7 × 5.32 |
| 引脚数 | 4 | 8 | 8 |

### 1.2 产品特点

- **0.96" OLED**：自发光显示，对比度高，功耗低，适合静态文本和简单图形
- **1.14" TFT LCD**：IPS 广视角，SPI 高速刷新，65K 色彩，适合彩色 UI 界面
- **1.54" TFT LCD**：大尺寸方形屏幕，262K 色，正常黑模式显示，适合交互式应用

### 1.3 NE301 应用场景

在 NE301 传感器扩展板中，显示屏作为**本地状态指示和人机交互界面**，可直接在设备端展示检测结果、设备状态和配置信息，无需连接手机或电脑即可查看 NE301 的运行状态和 AI 检测结果。

| 应用场景 | 推荐模组 | 说明 |
|:---|:---|:---|
| 设备状态指示 | 0.96" OLED | 低功耗显示设备在线状态、IP 地址、模型加载状态 |
| 检测结果展示 | 1.14" TFT LCD | 彩色显示 AI 检测框和置信度 |
| 交互式终端 | 1.54" TFT LCD | 大屏显示完整抓拍画面和详细配置菜单 |

## 2. 规格参数

### 2.1 基本参数

#### 0.96" OLED (GME12864)

| 参数 | 规格 |
|:---|:---|
| 厂家 | 金逸晨 |
| 型号 | GME12864-49/50/51/52/53/54 |
| 显示类型 | 0.96" OLED Passive Matrix |
| 驱动方式 | 1/64 Duty |
| 视角方向 | 6 O'clock |
| 供电电压 | 3.0V ~ 12.0V |
| 可视区域 | 22.74(L) × 11.86(W) mm |
| 有效显示区域 | 21.74(L) × 10.86(W) mm |

#### 1.14" TFT LCD (GMT114-02)

| 参数 | 规格 |
|:---|:---|
| 厂家 | 金逸晨 |
| 型号 | GMT114-02 |
| 显示类型 | 1.14" IPS TFT |
| 背光 | 白色 LED |
| RoHS | YES |

#### 1.54" TFT LCD (TB154-07-08-B)

| 参数 | 规格 |
|:---|:---|
| 厂家 | 金逸晨 |
| 型号 | TB154-07-08-B |
| 显示类型 | 1.54" IPS TFT |
| 显示模式 | Normally Black |
| 视角 | ALL |
| 有效显示区域 | 27.72(W) × 27.72(H) mm |
| 像素间距 | 0.1155(H) × 0.1155(V) µm |
| 颜色排列 | RGB Vertical Stripe |

### 2.2 性能参数

#### 1.54" TFT LCD DC 特性

| 参数 | 最小 | 典型 | 最大 | 单位 |
|:---|:---:|:---:|:---:|:---|
| 模拟供电 VCC | 2.4 | 2.75 | 3.3 | V |
| 逻辑供电 IOVCC | 1.65 | 2.8 | 3.3 | V |

#### 1.54" TFT LCD 背光特性

| 参数 | 典型 | 单位 |
|:---|:---:|:---|
| 正向电压 VF | 3.2 | V |
| 正向电流 IF | 60 | mA |
| 功耗 Pd | 192 | mW |
| LED 寿命 (25°C) | 10000 | Hrs |

### 2.3 使用条件

| 参数 | 规格 |
|:---|:---|
| 工作温度 (1.54") | -20°C ~ 70°C |
| 存储温度 (1.54") | -30°C ~ 80°C |
| 供电电压 (0.96" OLED) | 3.0V ~ 12.0V |

## 3. 引脚定义

### 3.1 0.96" OLED (4-pin)

| Pin | 名称 | 功能描述 |
|:---|:---|:---|
| 1 | GND | 接地 |
| 2 | VCC | 电源输入 (3.0V ~ 12.0V) |
| 3 | SCL | I2C 时钟线 |
| 4 | SDA | I2C 数据线 |


### 3.2 1.14" TFT LCD (8-pin)

| Pin | 名称 | 功能描述 |
|:---|:---|:---|
| 1 | GND | 接地 |
| 2 | VCC | 电源输入 |
| 3 | SCL | SPI 时钟线 |
| 4 | SDA | SPI 数据输入/输出 |
| 5 | RES | 复位 (低有效) |
| 6 | DC | 数据/命令选择 |
| 7 | CS | 片选 (低有效) |
| 8 | BLK | 背光控制 |


### 3.3 1.54" TFT LCD (8-pin)

| Pin | 名称 | 功能描述 |
|:---|:---|:---|
| 1 | GND | 接地 |
| 2 | VCC | 模拟电源 |
| 3 | SCL | 串行时钟 |
| 4 | SDA | SPI 数据输入/输出 |
| 5 | RST | LCM 复位 |
| 6 | DC | 寄存器选择 |
| 7 | CS | 片选 (低有效) |
| 8 | BL | 背光 |

---

| 项目 | 信息 |
|:---|:---|
| 文档版本 | v1.0 |
| 最后更新 | 2026-04-08 |
