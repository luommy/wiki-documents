---
title: Sensor Extension Board
description: 本指南介绍 NE301 传感器扩展板的使用方法，涵盖温湿度、环境光、6轴IMU、ToF测距、激光测距和红外热成像 6 种传感器的快速验证与 TFT 显示屏数据查看，帮助用户快速搭建传感器 demo 并了解 NE301 的开放扩展能力。
keywords: [NE301, 传感器扩展板, SHT3x, MLX90642, VL53L1X, ToF, 热成像, I2C, TFT, 传感器demo]
tags: [NE301, 传感器, 扩展板, 硬件指南, demo]
---

import AccessoriesTable from '@site/src/components/AccessoriesTable';

# Sensor Extension Board

本指南介绍如何使用 NE301 传感器扩展板快速搭建传感器 demo，满足更多不同的场景下的应用需求。

---

## 1. 概览

NE301 平台提供标准化的传感器扩展能力。传感器扩展板通过统一的 I2C 总线接入，由开源驱动层管理，支持即插即用和自定义传感器接入，为客户的定制化需求方案提供灵活的硬件基础。

### 开放架构

NE301 的传感器扩展基于标准硬件接口和开源驱动，开发者可以自由适配和扩展：

- **标准 I2C 接口**：I2C 总线 1，7 位地址寻址（0x03–0x77），兼容主流 I2C 传感器
- **标准 SPI 显示**：SPI6 接口驱动 ST7789VW TFT 显示屏（240×240 RGB565），用于传感器数据实时可视化
- **开源驱动层**：完整的 C 语言驱动代码开源在 [GitHub](https://github.com/camthink-ai/ne301)，路径 `Custom/Hal/SensorExt/`，包含 I2C 总线抽象、传感器驱动、CLI 调试命令和 TFT 显示输出
- **统一 CLI 命令**：`sexp` 命令一行启动所有传感器数据采集和显示，降低使用门槛

### 扩展能力

| 扩展方式 | 说明 |
|----------|------|
| 即插即用 | 传感器扩展板预集成 6 种传感器，连接即可使用 |
| 自定义传感器 | 通过 I2C 总线接入任意兼容传感器，参考开源驱动编写适配 |
| 显示输出 | 内置 TFT 驱动，支持传感器数据实时文字叠加和热成像伪彩色渲染 |
| API 集成 | 开源 C 语言 API（`sht3x_init()`、`vl53l1x_get_result()` 等），可集成到用户应用中 |

### 支持的传感器

| 传感器 | 型号 | 功能 | 典型应用 |
|--------|------|------|----------|
| 温湿度 | SHT3x | 温度 ±0.3°C，湿度 ±2%RH | 环境监测、仓储管理、设备过热保护 |
| 环境光 | LTR-31x | 可见光 + 红外光 16 位检测 | 灯光控制、日间/夜间切换、侵入检测 |
| 6 轴 IMU | LSM6DSR | 加速度计 + 陀螺仪 + 温度 | 姿态检测、振动监测、跌倒检测 |
| 短距 ToF | VL53L1X | 激光测距 1.3m（短距）/ 4m（长距） | 人员接近检测、手势识别、防撞预警 |
| 远距激光 | DTS6012M | 远距离 ToF 激光测距 | 远距目标检测、距离监测、安防周界 |
| 红外热成像 | MLX90642 | 32×24 像素温度矩阵，±1°C | 非接触测温、设备热分布检测、人体检测 |



---

## 2. 硬件准备与组装

### 所需硬件

| 组件 | 说明 |
|------|------|
| NE301 开发板 | 预装系统固件 |
| 传感器扩展板 | 预集成 6 种 I2C 传感器 |
| TFT 显示屏 | ST7789VW 240×240（与扩展板配套） |
| USB-C 数据线 | 用于串口调试和供电 |
| 调试工具 | 串口终端（如 minicom、PuTTY） |

### 安装步骤

**步骤 1**：将传感器扩展板对准 NE301 主板的扩展接口，轻压扣合

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/1-IMG_0405.JPG" alt="NE301 与传感器扩展板" />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/2-IMG_0407.JPG" alt="传感器扩展板特写" />
</div>

**步骤 2**：将 TFT 显示屏连接到扩展板的 SPI6 接口

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/3-IMG_0408.JPG)

**步骤 3**：通过 USB-C 连接 NE301，打开串口终端

**注意**：TFT 显示屏与 NAU881x 音频 codec 共用 SPI6 接口，硬件上通过电阻焊接二选一，不可同时使用。如需使用音频功能，请更换为音频配置的扩展板。

组装完成后，NE301 将呈现如下形态：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/4-IMG_0410.JPG)

---

## 3. 快速体验

### 3.1 扫描 I2C 总线

连接串口终端后，执行 I2C 扫描命令确认所有传感器在线：

```bash
AICAM> i2c_tool detect
```

```
Scanning I2C bus 1, address range 0x03-0x77
      00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f
00:          -- -- -- -- -- -- -- -- -- -- -- -- -- 
10: -- -- -- -- -- -- -- -- -- -- 1a -- -- -- -- -- 
20: -- -- 22 -- -- -- -- -- -- 29 -- -- -- -- -- -- 
30: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
40: -- -- -- -- 44 -- -- -- -- -- -- -- -- -- -- -- 
50: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- 
60: -- -- -- -- -- -- 66 -- -- -- 6a -- -- -- -- -- 
70: -- -- -- -- -- -- -- --   
```
完整的传感器列表

| 地址 | 传感器 | 地址 | 传感器 |
|------|--------|------|--------|
| 0x1a | NAU881x 音频 codec | 0x44 | SHT3x 温湿度 |
| 0x22 | LTR-31x 环境光 | 0x51 | DTS6012M 激光测距 |
| 0x29 | VL53L1X ToF 测距 | 0x66 | MLX90642 红外热成像 |
| | | 0x6a | LSM6DSR 6 轴 IMU |

所有传感器共用 I2C 总线 1，单个传感器缺失不影响其他传感器工作。

### 3.2 启动传感器数据采集

执行以下命令启动传感器数据采集和 TFT 显示：

```bash
AICAM> sexp start
```

该命令将：
- 初始化所有传感器（I2C 总线 1）
- 启动 200ms 周期的传感器读取线程
- 在 TFT 显示屏上实时显示传感器数据
- `ir` 参数表示红外热成像模式（无需摄像头即可使用）

启动后，TFT 显示屏将实时显示所有传感器数据：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/5-IMG_0413.JPG)

### 3.3 查看传感器数据

TFT 屏幕上方文字区显示各传感器实时读数：

```
SHT3x: 33.4 C 45.0%       ← 温湿度
ALS: 2255 IR: 63           ← 环境光（可见光 + 红外）
VL53:159 mm                ← 短距 ToF 测距
DTS:N/A mm                ← 远距激光测距
A: 16 -14 -991 mg           ← 加速度计（三轴）
G: 140 -1050 140 mdps            ← 陀螺仪（三轴）
```

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/6-IMG_0414.JPG)

### 3.4 体验红外热成像

执行以下命令启动红外热成像模式：

```bash
AICAM> sexp start ir
```

该命令将：
- 初始化所有传感器（I2C 总线 1）
- 启动 MLX90642 红外热成像阵列（32×24 像素）
- 在 TFT 屏幕下半部分显示热成像画面（伪彩色渲染，蓝→绿→黄→红色谱）
- 屏幕上方同步显示所有传感器文字数据

TFT 屏幕顶部显示热成像统计信息：

```
MLX: min 16.4 C max 28.8 C avg 21.6 C
```

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/7-IMG_0416.JPG)

将手靠近传感器区域，可以观察到热成像画面中温度的实时变化。

**提示**：也可使用 `sexp start`（不带 `ir` 参数），在摄像头预览画面上叠加传感器数据文字，需先启动摄像头 pipe2。

### 3.5 停止数据采集

```bash
AICAM> sexp stop
```

---

## 4. 支持的传感器

传感器扩展板集成了 6 种传感器，覆盖温湿度、光照、运动、距离和热成像检测能力。各传感器的驱动代码和 CLI 调试命令已开源，开发者可在 [GitHub 仓库](https://github.com/camthink-ai/ne301) 的 `Custom/Hal/SensorExt/` 目录下查看完整源码和 API 文档。

| 传感器 | I2C 地址 | 精度 / 量程 | CLI 调试命令 |
|--------|----------|-------------|-------------|
| SHT3x 温湿度 | 0x44 | 温度 ±0.3°C，湿度 ±2%RH | `sexp start ir` 查看数据 |
| LTR-31x 环境光 | 0x22 | 16 位 ALS + IR 计数值 | `als init` → `als read` → `als deinit` |
| LSM6DSR 6 轴 IMU | 0x6a | ±2g~±16g / ±125~±2000dps | 通过 `sexp start ir` 集成查看 |
| VL53L1X ToF | 0x29 | 短距 1.3m / 长距 4m | `vl53l1x init` → `vl53l1x start` → `vl53l1x status` |
| DTS6012M 激光测距 | 0x51 | 远距 ToF 测距 | `dts6012m init` → `dts6012m read` → `dts6012m deinit` |
| MLX90642 红外热成像 | 0x66 | 32×24 像素，0.02°C/LSB | `mlx90642 init` → `mlx90642 measure` → `mlx90642 dump` |

**开发者资源**

源码路径：`Custom/Hal/SensorExt/`

```
SensorExt/
├── i2c_driver/           # I2C 总线抽象层
├── sht3x/                # SHT3x 温湿度驱动
├── ltr_31x/              # LTR-31x 环境光驱动
├── lsm6dsr/              # LSM6DSR 6 轴 IMU 驱动
├── vl53l1x/              # VL53L1X ToF 驱动
├── dts6012m/             # DTS6012M 激光测距驱动
├── mlx90642/             # MLX90642 红外热成像驱动
├── tft_st7789v/          # TFT 显示屏驱动
└── sensor_exemple/       # 集成示例（sexp 命令）
```

---

## 5. 定制化支持

传感器扩展板展示了 NE301 在环境感知方面的基础能力。当前传感器板支持根据实际需求灵活选择安装的传感器，并可定制上盖以适配不同高度和屏幕显示需求。驱动源码已全部开源，开发者可自行开发业务逻辑，也可联系 CamThink 进行定制开发。如需了解更多信息，请联系我们的 [Sales 团队](mailto:sales@camthink.ai)。

<AccessoriesTable accessories={[
  {
    image: 'https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/1-IMG_0405.JPG',
    name: '传感器扩展板',
    quantity: '1',
    description: ['预集成 SHT3x、LTR-31x、LSM6DSR、VL53L1X、DTS6012M、MLX90642 六种传感器', '通过 I2C 总线 1 与 NE301 主板通信']
  },
  {
    image: 'https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/4-IMG_0410.JPG',
    name: 'TFT 显示屏',
    quantity: '1',
    description: ['ST7789VW 240×240 RGB565', '通过 SPI6 接口连接，与音频 codec 二选一']
  }
]} />

---

*最后更新: 2026-03-31*
