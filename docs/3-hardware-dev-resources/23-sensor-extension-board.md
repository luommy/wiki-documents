---
sidebar_position: 23
description: ACS-04 传感器扩展板适用于 NE101 与 NE301 两个平台，预集成温湿度、环境光、6 轴 IMU、ToF、激光测距、红外热成像、PIR、毫米波雷达和 MEMS 麦克风共 9 种传感器，提供原理图下载与开源驱动，帮助用户快速搭建传感器 demo 并了解平台开放扩展能力。
keywords: [传感器扩展板, ACS-04, NE101, NE301, SHT3x, MLX90642, VL53L1X, I2C, 传感器demo, 红外热成像]
tags: [传感器, 扩展板, 硬件开发资源, NE101, NE301]
---

# Sensor Extension Board

ACS-04 传感器扩展板是一款适用于 **NE101** 与 **NE301** 两个平台的标准化传感器扩展模块。板卡预集成 9 种传感器，通过统一的 I2C 总线接入，由开源驱动层管理，支持即插即用与自定义传感器接入，为客户的定制化方案提供灵活的硬件扩展基础。

---

## 1. 概览

### 适用平台

| 平台 | 固件 / 驱动 | 硬件支持 | 使用方式 |
|------|------------|---------|---------|
| NE301 | ✅ 已开发，开箱即用 | ✅ 完整支持 | `sexp` 命令直接体验，详见[第 4 节](#4-ne301-平台快速体验) |
| NE101 | ⏳ 开发中 | ✅ 接口已兼容 | 待官方固件发布，或参考开源驱动自行适配，详见[第 5 节](#5-ne101-平台使用说明) |

### 扩展能力

| 扩展方式 | 说明 |
|----------|------|
| 即插即用 | 传感器扩展板预集成 9 种传感器，连接即可使用 |
| 自定义传感器 | 通过 I2C 总线接入任意兼容传感器，参考开源驱动编写适配 |
| 显示输出 | 内置 TFT/OLED 驱动，支持传感器数据实时文字叠加和热成像伪彩色渲染 |
| API 集成 | 开源 C 语言 API（`sht3x_init()`、`vl53l1x_get_result()` 等），可集成到用户应用中 |

---

## 2. 硬件资源

### 2.1 板卡外观

ACS-04 传感器扩展板（版本 V1.0，2026-02-02）采用紧凑布局，正面集中布置全部传感器与功能电路，反面为焊接面。

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/hardware-dev-resources/sensor-extension-board/sensor-extension-front.png" alt="传感器扩展板正面（元件面）" />
  <img src="https://resources.camthink.ai/wiki/img/hardware-dev-resources/sensor-extension-board/sensor-extension-back.png" alt="传感器扩展板反面（焊接面）" />
</div>

### 2.2 原理图

传感器扩展板原理图[「下载」](https://resources.camthink.ai/wiki/doc/sensor-extension-board-acs12-04-v1_0_sch.pdf)

### 2.3 集成传感器

传感器扩展板集成 9 种传感器，覆盖温湿度、光照、运动、距离、热成像、人体感应、毫米波雷达和音频采集能力。

| 传感器 | 型号 | 接口 / 地址 | 功能 | 典型应用 |
|--------|------|------------|------|----------|
| 温湿度 | SHT3x | I2C 0x44 | 温度 ±0.3°C，湿度 ±2%RH | 环境监测、仓储管理、设备过热保护 |
| 环境光 | LTR-31x | I2C 0x22 | 可见光 + 红外光 16 位检测 | 灯光控制、日间/夜间切换、侵入检测 |
| 6 轴 IMU | LSM6DSR | I2C 0x6a | 加速度计 + 陀螺仪，±2g~±16g / ±125~±2000dps | 姿态检测、振动监测、跌倒检测 |
| 短距 ToF | VL53L1X | I2C 0x29 | 激光测距 1.3m（短距）/ 4m（长距） | 人员接近检测、手势识别、防撞预警 |
| 远距激光 | DTS6012M | I2C 0x51 | d-ToF，18m 量程（12m@160Klux），905nm，FOV\<2° | 远距目标检测、距离监测、安防周界 |
| 红外热成像 | MLX90642 | I2C 0x66 | 32×24 像素温度矩阵，±1°C，FOV 110°×75° / 45°×35° | 非接触测温、设备热分布检测、人体检测 |
| PIR 人体感应 | NP624M-F | 数字 IO | 数字双元，抗射频干扰，功耗 5μA，VIN:1.6~3.6V | 人体移动检测、安防入侵、自动照明 |
| 毫米波雷达 | RKB1161LX1 | UART | 24GHz，功耗 68μA，20×20×1.0mm | 人员检测、存在感知、微动检测 |
| MEMS 麦克风 | LMA3729T381-OY3S | I2S | MEMS MTC，灵敏度 -38dB，SNR=63dB | 语音采集、声音检测、环境音频监测 |

所有 I2C 传感器共用同一条 I2C 总线，单个传感器缺失不影响其他传感器工作。

### 2.4 支持的显示屏

扩展板同时支持以下规格显示屏，用于传感器数据可视化（与扩展板配套，可选）：

| 类型 | 尺寸 | 接口 | 分辨率 | 色彩 | 外形尺寸 (mm) |
|------|------|------|--------|------|---------------|
| OLED | 0.96" | I2C，4PIN | 128×64 | 蓝光 | 24.7(L)×27(W)×11.3(T) |
| TFT | 1.14" | SPI，IPS | 135×240 | 65K 色 | 31.4×28×11.3 |
| TFT | 1.54" | SPI，IPS | 240×240 | 262K 色 | 32(W)×43.7(H)×5.32(T) |

---

## 3. 硬件组装

### 所需硬件

| 组件 | 说明 |
|------|------|
| 开发板（NE301 / NE101） | NE301 预装系统固件；NE101 需适配固件 |
| 传感器扩展板 | 预集成 9 种传感器 |
| 显示屏 | 0.96" OLED / 1.14" TFT / 1.54" TFT（可选） |
| USB-C 数据线 | 用于串口调试和供电 |
| 调试工具 | 串口终端（如 minicom、PuTTY） |

### 安装步骤

**步骤 1**：将传感器扩展板对准主板扩展接口，轻压扣合。

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/1-IMG_0405.JPG" alt="开发板与传感器扩展板" />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/2-IMG_0407.JPG" alt="传感器扩展板特写" />
</div>

**步骤 2**：将 TFT 显示屏连接到扩展板的 SPI 显示接口。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/3-IMG_0408.JPG)

**步骤 3**：通过 USB-C 连接开发板，打开串口终端。

组装完成后，整机将呈现如下形态：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/4-IMG_0410.JPG)

---

## 4. NE301 平台快速体验

:::tip NE301 平台
本节命令与现象基于 **NE301** 平台固件。NE301 的传感器驱动已全部开源并集成在系统固件中，开箱即用。NE101 平台请参考[第 5 节](#5-ne101-平台使用说明)。
:::

### 4.1 扫描 I2C 总线

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
60: -- -- -- -- -- -- -- -- -- -- 66 -- -- -- -- -- 
70: -- -- -- -- -- -- -- --   
```

完整的传感器地址列表：

| 地址 | 传感器 | 地址 | 传感器 |
|------|--------|------|--------|
| 0x1a | NAU881x 音频 codec | 0x44 | SHT3x 温湿度 |
| 0x22 | LTR-31x 环境光 | 0x51 | DTS6012M 激光测距 |
| 0x29 | VL53L1X ToF 测距 | 0x66 | MLX90642 红外热成像 |
| | | 0x6a | LSM6DSR 6 轴 IMU |

### 4.2 启动传感器数据采集

执行以下命令启动传感器数据采集和 TFT 显示：

```bash
AICAM> sexp start
```

该命令将初始化所有传感器（I2C 总线 1），启动 200ms 周期的传感器读取线程，并在 TFT 显示屏上实时显示传感器数据：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/5-IMG_0413.JPG)

### 4.3 查看传感器数据

TFT 屏幕上方文字区显示各传感器实时读数：

```
SHT3x: 33.4 C 45.0%       ← 温湿度
ALS: 2255 IR: 63           ← 环境光（可见光 + 红外）
VL53:159 mm                ← 短距 ToF 测距
DTS:N/A mm                 ← 远距激光测距
A: 16 -14 -991 mg          ← 加速度计（三轴）
G: 140 -1050 140 mdps      ← 陀螺仪（三轴）
```

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/6-IMG_0414.JPG)

### 4.4 体验红外热成像

执行以下命令启动红外热成像模式：

```bash
AICAM> sexp start ir
```

该命令将启动 MLX90642 红外热成像阵列（32×24 像素），在 TFT 屏幕下半部分显示热成像画面（伪彩色渲染，蓝→绿→黄→红色谱），屏幕上方同步显示所有传感器文字数据。

TFT 屏幕顶部显示热成像统计信息：

```
MLX: min 16.4 C max 28.8 C avg 21.6 C
```

![](https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/NE300-MB01-development-board/hardware-guide/sensor-extension-board/7-IMG_0416.JPG)

将手靠近传感器区域，可以观察到热成像画面中温度的实时变化。

### 4.5 停止数据采集

```bash
AICAM> sexp stop
```

---

## 5. NE101 平台使用说明

传感器扩展板在硬件层面已适配 NE101 平台（NE100-MB01 开发板），接口定义与电气特性与 NE301 完全一致，可直接物理连接。

当前限制：NE101 的传感器固件（含驱动）尚在开发中，系统暂未集成 `sexp`、`i2c_tool` 等传感器命令，因此**暂时无法在 NE101 上直接运行本节描述的快速体验流程**。

适配路径：

- **等待官方固件**：NE101 传感器驱动将随后续固件版本发布，届时可直接使用。
- **自行适配**：NE301 的全部传感器驱动已开源，开发者可参考其 I2C 总线抽象与驱动框架，将传感器适配到 NE101 平台，源码结构与 CLI 调试命令详见[第 6 节](#6-开发者资源)。

---

## 6. 开发者资源

### 驱动源码结构

NE301 的传感器驱动以 C 语言完整开源，位于 [NE301 GitHub 仓库](https://github.com/camthink-ai/ne301) 的 `Custom/Hal/SensorExt/` 目录，包含 I2C 总线抽象、各传感器驱动、TFT 显示输出和集成示例。该源码同样可作为 NE101 适配的参考蓝本。

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

### 传感器调试命令参考

各传感器在 NE301 平台提供的 CLI 调试命令（NE101 适配后同样可用）：

| 传感器 | CLI 调试命令 |
|--------|-------------|
| SHT3x 温湿度 | `sht3x init` → `sht3x read` → `sht3x deinit` |
| LTR-31x 环境光 | `als init` → `als read` → `als deinit` |
| LSM6DSR 6 轴 IMU | `lsm6dsr init` → `lsm6dsr read` → `lsm6dsr deinit` |
| VL53L1X ToF | `vl53l1x init` → `vl53l1x start` → `vl53l1x read` |
| DTS6012M 激光测距 | `dts6012m init` → `dts6012m read` → `dts6012m deinit` |
| MLX90642 红外热成像 | `mlx90642 init` → `mlx90642 measure` → `mlx90642 deinit` |
| RKB1161LX1 毫米波雷达 | 驱动开发中 |
| LMA3729T381-OY3S MEMS 麦克风 | 音频管道集成 |

---

## 7. 定制化支持

传感器扩展板展示了 CamThink 平台在环境感知方面的基础扩展能力。当前传感器板支持根据实际需求灵活选择安装的传感器，并可定制上盖以适配不同高度和屏幕显示需求。驱动源码已全部开源，开发者可自行开发业务逻辑，也可联系 CamThink 进行定制开发。如需了解更多信息，请联系我们的 [Sales 团队](mailto:sales@camthink.ai)。

---

*最后更新: 2026-07-13*
