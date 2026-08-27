---
description: NE503 硬件规格参数详表，涵盖 Hailo15H SoC、LPDDR4、eMMC、QSPI Flash、图像传感器、IMU、以太网 PHY 等核心芯片的型号与电气参数。
keywords: [NE503, 硬件规格, Hailo15H, IMX678, LPDDR4, LSM6DSR, 芯片参数]
tags: [NE503, 硬件规格, 芯片参数, 硬件参考]
---

# Hardware Specifications

## 简介

NE503 采用核心处理板（Hailo15H SoC）与接口板（STM32G0B0RET6 MCU）双板架构。

| 型号 | 型号描述 |
|:---|:---|
| NE503 | Hailo15H + eMMC 64GB + LPDDR4 4GB / 8GB；可选 `AF Lens (44.5° HFOV)` 或 `Motorized Zoom (110° HFOV)` |

## 模组级规格参数

NE503 各物理模组的主要器件参数如下：

### 核心处理板

| 类型 | 芯片型号 | 规格参数 |
|:---|:---|:---|
| CPU / SoC | Hailo-15H | 四核 Arm Cortex-A53，频率 1.3 GHz；AI 算力高达 20 TOPS；ISP 支持最高 12 MP 分辨率，600 Mpixel/s 像素率，支持 HDR 和降噪；VPU 支持 H.265/H.264 编码 |
| LPDDR4 | 8 GB 配置：MT53E2G32D4DE-046 WT:C | 4 GB 或 8 GB；当前记录的 8 GB 配置为 4266 Mb/s、8.5 GB/s 单通道带宽，4 GB 配置的器件型号与带宽以对应 BOM 为准 |
| eMMC | SDINBDA6-64G-H | 64 GB eMMC |
| QSPI Flash | IS25WP064D-JKLE | 8 MB，四线 SPI 协议，待机电流 8 µA，擦写次数 > 100,000 次 |
| 温度传感器 | TMP1075DSGR | 12 bit 分辨率，0.0625°C，I2C 接口 |
| EEPROM | AT24C02D | 2 Kb（256 × 8），I2C 接口，待机电流 < 1 µA，1,000,000 次写周期 |
| PCIe 时钟发生器 | PI6CG18201 | 25 MHz，全输出工作电流（IDD）15 mA，低抖动 PCIe Gen4：0.3 ps |
| 以太网 PHY | LAN8720AI | 10/100M 以太网 PHY 芯片，IO 电压 1.6V ~ 3.6V |
| 惯性测量模块（IMU） | LSM6DSR | 集成 3 轴数字加速度计（可编程，最大 ±16 g）和 3 轴数字陀螺仪（高达 ±4000 dps） |

### 接口板

| 类型 | 芯片型号 | 规格参数 |
|:---|:---|:---|
| MCU | STM32G0B0RET6 | Arm Cortex-M0+，64 MHz，512 KB Flash，144 KB RAM |
| 温度传感器 | LMT87DCK | 模拟输出温度传感器，-50°C ~ 150°C |
| 镜头驱动 | AN41908A-VBA（已记录配置） | 镜头配置可选 `AF Lens (44.5° HFOV)` 或 `Motorized Zoom (110° HFOV)`；驱动器件与可用控制能力以具体 SKU/BOM 和固件为准 |
| 音频编解码器 | NAU88C10 | I2S 接口音频编解码器（SoC 控制，非 MCU 管理） |

### 外部模组

| 类型 | 芯片型号 | 规格参数 |
|:---|:---|:---|
| 图像传感器 | IMX678-AAQR1-C | 1/1.8 英寸 4K CMOS 图像传感器，高达 60fps 的 4K 全像素输出 |

### 灯板（独立模组）

| 类型 | 说明 |
|:---|:---|
| 双光灯板 | 白光 + 红光 LED，PWM 调光，通过连接器接入接口板 |
| 红外灯板 | 近红外 + 远红外 LED，PWM 调光，通过连接器接入接口板 |

## 工作环境

| 参数 | 规格值 |
|:---|:---|
| 工作温度 | -40 ~ 60°C |
| 相对湿度 | 0 ~ 95% 无冷凝 |

## 版本变更记录

| 版本 | 修订日期 | 修订内容 |
|:---|:---|:---|
| V1.0 | 2026-04-02 | 首发版本 |

## 相关文档

- [核心处理板](./1-core-board-connection.md)
- [接口板](./2-aipc-board-connection.md)
