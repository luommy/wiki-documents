---
id: ne302-hardware-connection
title: Hardware Connection
sidebar_position: 1
description: 说明 NE302 的板卡组装、上电、存储与外置天线连接，以及 N6、U0 烧录接口和开关的识别方法。
keywords: [NE302, 硬件连接, USB Type-C, MicroSD, ST-LINK, N6, U0]
tags: [NE302, 硬件指南, 硬件连接, ST-LINK]
---

# Hardware Connection

连接板卡、MicroSD、ST-LINK 或切换烧录开关前，必须先给设备断电。具体接口以交付板卡上的丝印为准。

## 装配与首次上电

1. 断开 USB-C 和所有外部电源。
2. 将主板和接口板垂直、均匀地压入连接器。使用前安装相机、匹配的天线和外壳。
3. 仅在需要本地保存图片或记录时，于上电前插入 MicroSD。
4. 正常运行时，所有烧录开关保持在运行位置。
5. 将 USB Type-C 接至持续电源或交付版本兼容的外部电池组并等待启动。打开 Web 控制台，确认**设备信息**可以加载、**功能调试**显示相机预览。

设备未启动时，先断电，再检查板间连接是否到位、相机排线、天线和认可的 USB-C 电源；在排除这些问题前，不要切换烧录开关。

## 外部连接

| 连接项 | 用途 | 确认方式 |
| :--- | :--- | :--- |
| USB Type-C | 设备 5 V 持续供电，或通过 USB Type-C 接交付版本兼容的外部电池组；也提供交付配置支持的 USB 连接 | 设备启动，Web 控制台可访问 |
| MicroSD | 已配置抓拍或记录流程的本地存储 | 启动后**存储管理**显示存储卡状态 |
| Trigger / Reset | 交付硬件和固件提供的物理触发或复位控制 | 仅使用交付设备实际提供的功能；本文不定义信号电平 |
| 外置 SMA 天线 | 外置天线配置的无线连接 | 天线已牢固安装、避开金属遮挡，且可测试无线连接 |

接口板的 **U6-UART** 是 STM32N6 串口控制台接口。仅使用匹配的转接器和串口流程；源码 README 标注为 921600 波特率。本文不定义其电平或引脚分配。

## 编程接口识别

![NE302 接口板烧录接口标注图](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/hardware-guide/hardware-connection/ne302-interface-board-programming-map.png)

| 板卡丝印 | 物理目标 |
| :--- | :--- |
| `N6-STLINK` | STM32N6 SWD 烧录与调试接口 |
| `U0-STLINK` | STM32U0 SWD 烧录与调试接口 |
| `U6-UART` | STM32N6 串口控制台接口 |
| `N6-BOOT` | STM32N6 启动模式开关 |
| `U0-BOOT` | STM32U0 启动模式开关 |

本页只说明连接器和开关的位置。烧录目标的选择、拨码顺序、ST-LINK 与电脑的连接和烧录命令见[构建、烧录与更新](../4-software-guide/1-build-and-flash.md)。

## 相关页面

- 硬件组成和配置边界：[硬件组成](./0-components-overview.md)
- 选择目标、连接 ST-LINK 和执行烧录：[构建、烧录与更新](../4-software-guide/1-build-and-flash.md)
- 抓拍、存储和记录：[抓拍与存储](../2-user-guide/0-capture-storage.md)
