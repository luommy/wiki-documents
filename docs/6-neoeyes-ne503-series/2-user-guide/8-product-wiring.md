---
description: NE503 现场接线指南：按端子图完成 PoE 或 DC 供电、Alarm IN、Wiegand、RS-485 和音频接线，并判断调试接口是否需要连接。
keywords: [NE503 接线, 端子, PoE, DC 12V, Alarm IN, Wiegand, RS-485, 音频]
tags: [用户指南, NE503, 接线, 现场安装]
---

# Product Wiring

如果你要把 NE503 接到现场设备，按本文顺序操作：**先认端子 → 选择一种供电方式 → 接入外部设备 → 上电检查**。开发者不需要阅读本页的 API 细节；接口配置见[外设 IO](./3-peripherals.md)，板级引脚资料见[接口板接线](../2-hardware-guide/2-aipc-board-connection.md)。

接线前先断开设备电源。所有端子接好后，再接入 PoE 或 DC 电源。

## 1. 先认外部端子

下图是 NE503 外部端子标注。RJ45 网口用于网络和 PoE；绿色端子从左到右依次是 DC 电源端子和 I/O 端子。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/aipc-board-connection/terminal-block-annotation.png" alt="NE503 外部端子标注" style={{ width: '100%', height: 'auto' }} />

| 图中标号 | 端子标识 | 接什么 |
|:---:|:---|:---|
| RJ45 | PoE | PoE 交换机或普通网络交换机；只有 PoE 交换机才能通过网线供电 |
| 1 | DC- | DC 电源负极 |
| 2 | DC+ | DC 12V 电源正极 |
| 3 | A / D0 | Wiegand 的 D0 输出 |
| 4 | B / D1 | Wiegand 的 D1 输出 |
| 5 | G | Wiegand / Alarm 公共地 |
| 6 | IN | Alarm IN 报警输入 |
| 7 | G | 音频公共地 |
| 8 | I | Line-In 音频输入 |
| 9 | O | Line-Out 音频输出 |

> 图中的 **A / B** 是 Wiegand 的 **D0 / D1**，不是 RS-485 的 A / B。RS-485 使用设备上的独立接口，见[第 4 节](#4-rs-485-与音频)。

## 2. 选择并接入电源

NE503 有两种供电方式，现场选一种即可：

| 供电方式 | 怎么接 | 适用条件 |
|:---|:---|:---|
| **PoE** | 用网线把 RJ45 接到支持 IEEE 802.3at 的 PoE 交换机 | 需要同时获得网络和电源，布线最简单 |
| **DC 12V** | 12V 电源正极接 **DC+（2）**，负极接 **DC-（1）** | 现场没有 PoE，或使用集中供电 / UPS |

设备典型功耗为 5–6 W。**PoE 和 DC 12V 不要同时接入**；使用 DC 供电时，适配器额定电流按 6 W 留出余量。

上电后，等待设备启动，再用浏览器访问设备 IP。能打开 Web 控制台，说明网络和基本供电已建立。

## 3. 接入报警与门禁设备

### 3.1 报警输入

Alarm IN 是开关量输入，可接门磁、红外对射、烟感等设备。不同传感器的输出类型可能不同，接线前先对照随设备提供的硬件资料确认输入类型、触发电平和公共端。以下以无源门磁触点为例：

1. 门磁的一端接 **IN（6）**；
2. 门磁的另一端接 **G（5）**；
3. 接好后上电。

当前固件不会把 Alarm IN 的触发状态上报到 Web 或事件接口，因此触发门磁后 Web 页面没有状态变化是正常现象。需要查看或处理报警状态时，应由门禁控制器或其他外部系统读取输入信号。

> 如果传感器输出的是有源电平，不要直接照搬上面的门磁接法；先确认输入允许的电平范围和公共端，再按硬件资料接线。

### 3.2 Wiegand 输出

Wiegand 是输出接口，用来把 NE503 的联动信号送给门禁控制器等外部设备，不是用来接读卡器的。接线如下：

1. 门禁控制器 **D0** 接 NE503 **A / D0（3）**；
2. 门禁控制器 **D1** 接 NE503 **B / D1（4）**；
3. 门禁控制器 **GND** 接 NE503 **G（5）**。

接线后，在[外设 IO](./3-peripherals.md)中完成 Wiegand 通道配置。平台不会自动把 AI 检测变成 Wiegand 输出；需要联动时，由应用或业务系统收到事件后驱动输出。

## 4. RS-485 与音频

### 4.1 RS-485

RS-485 用于连接外部云台或 RS-485 传感器。它只负责传输字节，云台或传感器使用的协议由对端设备和应用决定。

1. 断电，把外部设备的 **A 接 A、B 接 B**；
2. 按外部设备说明书接好它自己的电源；
3. 上电，在应用中使用与外部设备一致的波特率和协议参数。

云台无动作或传感器无响应时，先检查三项：A/B 是否接反、两端是否共地、波特率和协议是否一致。RS-485 端子定义见[接口板接线 · RS-485](../2-hardware-guide/2-aipc-board-connection.md#rs-485)，运行时问题见[故障排查 FAQ §7.4](../5-troubleshooting.md#74-报警输入--wiegand--rs-485-运行时问题)。

### 4.2 音频

- **Line-In**：拾音器信号线接 **I（8）**，地线接 **G（7）**；
- **Line-Out**：功放或有源扬声器信号线接 **O（9）**，地线接 **G（7）**。

接好后，在“外设”页面启用对应的“麦克风输入”或“扬声器输出”。根据外部音频设备说明书核对信号电平；未确认前，不要把 Line-Out 直接接到无源扬声器。

## 5. 调试接口

**正常安装和日常运行不需要连接调试接口。** 只有系统恢复、查看串口日志或烧录接口板 MCU 固件时才使用下面的接口。

| 你要做的事 | 使用哪个接口 | 接线与操作 |
|:---|:---|:---|
| 查看启动日志、进入 UART 恢复模式 | **SoC UART** | 使用 **1.8V** 兼容的 USB 转串口线连接调试串口；系统恢复时再按 `BOOT0 OFF / BOOT1 ON` 设置拨码并按 Reset |
| 工厂编程接口板 MCU 固件 | **ST-LINK / SWD** | ST-LINK 接 `PA13/SWDIO`、`PA14/SWDCLK`、`NRST`、`GND`、`3V3 VREF`；设备仍需通过 PoE 上电，ST-LINK 不负责给设备供电。现场更新请使用 MCU OTA |
| 核心板与接口板 MCU 的内部通信 | **内部 MCU host-link** | 这是设备内部连接，不是外部接口，不接任何现场设备 |

需要进行系统恢复、串口日志或 MCU 固件烧录时，按[系统烧录](../3-software-guide/2-system-flashing.md)中的对应步骤操作：

- [主机准备与串口电平](../3-software-guide/2-system-flashing.md#1-准备固件和主机)
- [UART 恢复模式](../3-software-guide/2-system-flashing.md#2-恢复引导链)
- [接口板 MCU OTA](../3-software-guide/2-system-flashing.md#5-烧录-mcu-固件)

## 相关文档

- [外设 IO](./3-peripherals.md) —— 报警输入、Wiegand 和音频的 Web 配置
- [接口板接线](../2-hardware-guide/2-aipc-board-connection.md) —— RS-485 和接口板的引脚定义
- [系统烧录](../3-software-guide/2-system-flashing.md) —— UART 恢复、串口日志、OS 升级和 MCU OTA
- [故障排查 FAQ](../5-troubleshooting.md) —— 报警输入 / Wiegand / RS-485 运行时问题
