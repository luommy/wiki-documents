---
description: NE503 硬件规格参数详表，涵盖 Hailo15H SoC、DDR4、eMMC、QSPI Flash、图像传感器、IMU、以太网 PHY 等核心芯片的型号与电气参数，附硬件设计框图。
keywords: [NE503, 硬件规格, Hailo15H, IMX678, DDR4, LSM6DSR, 芯片参数, 硬件框图]
tags: [NE503, 硬件规格, 芯片参数, 硬件参考]
---

# Hardware Specifications

## 产品型号

| 产品型号 | 型号描述 |
|:---|:---|
| NE5038-PX4 | Hailo15H + eMMC 64GB + LPDDR4 8GB，AF 4X 变焦 |

![NE503 硬件设计框图](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/specifications/hardware-block-diagram.png)

NE503 采用**核心处理板**（Hailo15H）与 **AI-PC 接口板**（STM32G0B0RET6）双板结构，通过板对板连接器互联。核心处理板承载 SoC、NPU、内存、存储及成像子系统；AI-PC 接口板集成独立 MCU 管理外部 IO、电源及外设控制。

## 芯片级规格参数

NE503 核心处理板与 AI-PC 接口板的主要器件参数如下：

| 类型 | 芯片型号 | 规格参数 |
|:---|:---|:---|
| CPU / SoC | Hailo-15H | 四核 Arm Cortex-A53，频率 1.3 GHz；AI 算力高达 20 TOPS；ISP 支持最高 12 MP 分辨率，600 Mpixel/s 像素率，支持 HDR 和降噪；VPU 支持 H.265/H.264 编码 |
| DDR4 | MT53E2G32D4DE-046 WT:C | 8 GB LPDDR4，266 Mb/s，8.5 GB/s 单通道带宽 |
| eMMC | SDINBDA6-64G-H | 64 GB eMMC |
| QSPI Flash | IS25WP064D-JKLE | 8 MB，四线 SPI 协议，待机电流 8 µA，擦写次数 > 100,000 次 |
| 温度传感器 | TMP1075DSGR | 12 bit 分辨率，0.0625°C，I2C 接口 |
| EEPROM | AT24C02D | 2 Kb（256 × 8），I2C 接口，待机电流 < 1 µA，1,000,000 次写周期 |
| 图像传感器 | IMX678-AAQR1-C | 1/1.8 英寸 4K CMOS 图像传感器，高达 60fps 的 4K 全像素输出 |
| PCIe 时钟发生器 | PI6CG18201 | 25 MHz，全输出工作电流（IDD）15 mA，低抖动 PCIe Gen4：0.3 ps |
| 以太网 PHY | LAN8720AI | 10/100M 以太网 PHY 芯片，IO 电压 1.6V ~ 3.6V |
| 惯性测量模块（IMU） | LSM6DSR | 集成 3 轴数字加速度计（可编程，最大 ±16 g）和 3 轴数字陀螺仪（高达 ±4000 dps） |
| 工作环境 | — | 室内：-30 ~ 60°C，0 ~ 95% 无冷凝 |

## 版本变更记录

| 版本 | 修订日期 | 修订内容 |
|:---|:---|:---|
| V1.0 | 2026-04-02 | 表单发布 |
