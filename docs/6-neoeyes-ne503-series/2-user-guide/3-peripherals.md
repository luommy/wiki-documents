---
description: NE503 外设 IO 指南：Peripherals 页的麦克风输入、扬声器输出、报警输入及触发电平、Wiegand 门禁通道的配置与用途。
keywords: [NE503 外设, Peripherals, 报警输入, Alarm Input, Wiegand, 门禁, 麦克风, 扬声器, IO 控制]
tags: [用户指南, NE503, 外设, IO]
---

# Peripherals

**Peripherals** 页面集中管理 NE503 对外的硬件接口：音频、报警、门禁。所有项以开关或选项形式配置。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/peripherals/qs-peripherals.png" />

## I/O 控制

### 音频

- **Mic Input**：开启设备麦克风采集，供 Media 页监听、对讲、或应用采集音频。
- **Speaker Output**：开启设备扬声器输出，用于对讲回话或应用发声。

### 报警输入

- **Alarm Input**：开启报警输入检测。
- **Alarm Input Level**：选择触发电平 **High** 或 **Low**，决定外部信号处于何种电平时算作"触发"。

> NE503 对外引出 1 路报警输入。

### Wiegand（门禁）

- **Wiegand CH0 / CH1**：两路 Wiegand 通道，用于接入 Wiegand 协议的门禁读卡器。

开启后，读卡器的刷卡数据可通过 Event Bus 输出给应用或外部系统，实现门禁联动。

## 与其他功能的联动

外设不是孤立的，常见联动方式：

| 场景 | 联动路径 |
|------|---------|
| AI 检测到目标 → 触发报警输出 / 联动门禁 | 应用通过 Event Bus 收 AI 事件 → 控制 IO |
| 报警输入触发 → 推送事件到业务系统 | Alarm IN 信号 → Event Bus → MQTT / HTTP |
| 对讲 | Media 页 Talk 按钮 + Mic/Speaker 开启 |
