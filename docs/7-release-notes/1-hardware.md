---
id: hardware
slug: /7-release-notes/hardware
description: CamThink 产品硬件版本变更历史，涵盖 NeoEyes NE101、NE301、NeoEdge NG4500 主板修订记录。
keywords: [Hardware, 硬件变更, PCB, NE101, NE301, NG4500, CamThink]
tags: [Release Notes, 硬件]
sidebar_position: 2
---

# Hardware

本页面记录 CamThink 硬件产品的主板 PCB 修订历史。

## NeoEyes NE101

| 硬件版本 | 变更内容 | 修改日期 |
|:---------|:---------|:---------|
| V2.0 | <ul style={{margin:0}}><li>TF 卡电源控制脚合并到模块电源控制脚（Cat.1 和 HaLow），共用 IO48</li><li>Camera、补光灯、电池电量检测控制：从 IO3 改为 IO42</li><li>RTC 中断检测：单独使用 IO3</li><li>RTC 芯片共用 I2C 总线（IO4 和 IO5）</li><li>DCDC 输出稳定性优化，电感值从 2.2μH 修改为 4.7μH</li><li>屏蔽夹取消焊接</li></ul> | 2026-01-14 |
| V1.2 | <ul style={{margin:0}}><li>电源选择电路更换肖特基二极管 D6（PMEG60T30ELR，方向漏电流小）</li><li>补光灯 R73 取消 NC，阻值 100K</li><li>USB 插入显示灯从绿色 LED 更改为红色 LED</li><li>按键丝印改成 K 开头</li><li>DCDC 输入端增加电容，保证低电压下系统正常工作</li><li>Camera 电源和补光灯电源错峰缓启动（C31 0.1μF、C45 0.47μF，MOS 栅极对地电阻 100K）</li><li>增加 DCDC 动态响应度，电感值从 4.7μH 修改为 2.2μH</li><li>ISP 改为 1 个 22μF 电容；主要 IC 丝印加大，背面连接端子用丝印标注 IO 功能</li></ul> | 2025-07-01 |
| V1.1 | <ul style={{margin:0}}><li>补光灯改成母座加插件</li><li>HaLow 和 Cat.1 模组的连接母座调高，总高度保持不变</li><li>连接母座的 IO 排列有改变</li><li>PCBA 毛刺问题：拼板方式改为 V-CUT</li><li>新增 PIR 支持，增加一路 LDO 供电和 4-pin wafer 连接座</li><li>电源控制均修改为带有缓启动</li></ul> | 2025-04-12 |
| V1.0 | 初始设计 | 2024-12-10 |

## NeoEyes NE301

| 硬件版本 | 变更内容 | 修改日期 |
|:---------|:---------|:---------|
| V1.3 | <ul style={{margin:0}}><li>LDO 更换为 TPS7A2633DRVR</li><li>WiFi 预留的 1.8V LDO，下拉电阻改成直连</li><li>增加单独 PIR 接口，ISP 独立保留</li><li>UART 增加 VCC_IN 输出兼容</li><li>新增 IR-CUT 驱动电路</li></ul> | 2026-01-20 |
| V1.2 | <ul style={{margin:0}}><li>增加 U0 复位按键</li><li>U0 芯片预留 SPI 删除以及 WiFi 连接脚 STA 删除</li><li>MPS1462 模式选择使用 VCC 上拉，强制 PWM 控制</li><li>NC: R154、R156、R138、R145</li><li>SPI2 上拉时钟，SPI4 上拉时钟和 CS 脚</li><li>U0 控制 N6 复位</li></ul> | 2025-10-20 |
| V1.1 | <ul style={{margin:0}}><li>光敏电路修改为 LED 指示灯电路（兼容光敏）；触发按键和报警接口兼容 U0 和 N6 检测（standby 下可检测）；ISP 和 PIR 兼容 U0 和 N6 控制，支持 3.3V 和电池供电；WiFi 匹配电路参数增加</li><li>SPI2 和 SPI4 接口对调，修改为可兼容 SAI 音频接口</li><li>PoE 电源和 USB 电源增加切换优先级电路；各路电源缓启动控制电路增加下拉电阻</li><li>N6 IO 电源兼容 1.8V 供电；MCU 修改 boot 默认启动 USB/UART，BOOT0/BOOT1 上拉修改 10K</li><li>WiFi 芯片电源域遗漏增加，部分 IO 电源兼容 1.8V 供电</li><li>Flash 复位脚 RST 用二极管隔开 N6 的 RST</li><li>VCC IN 增加 4×100μF 电容储能</li><li>音频芯片电路去除</li><li>增加 U0 芯片控制电路——启动 N6 及默认给 WiFi 和 Cat.1 模块上电控制</li></ul> | 2025-07-28 |
| V1.0 | 初始设计 | 2025-04-12 |

## NeoEdge NG4500

| 硬件版本 | 变更内容 | 修改日期 |
|:---------|:---------|:---------|
| V1.1 | <ul style={{margin:0}}><li>VCM 电源芯片由 LM25148 更换为 MPQ4317</li><li>VCM 电源增加 SW2 控制的 5V/10V 切换电路</li><li>新增 EEPROM 芯片 AT24C02D-MAHM-E，挂载至 I2C2 总线，设备地址 0x57</li><li>RTL8111H-CG 网口 LED 控制逻辑修改：LED0 ACT→LINK，LED1 LINK→ACT</li><li>优化 VCC_3V3 电源电路：C235 1.8nF→4.7nF；R235 6.49K→5.6K；C236 47pF→120pF；R234 23.2K→56K；U52 NTMFS5C670NLT1G→NTMFS5C645NLT1G；L21 1μH→2.2μH；R222 0.005Ω→0.003Ω</li><li>VDD_5V 预留 R312（11.5K），设置 UVLO 欠压锁定阈值为 9.6V</li><li>U61/U63（TXS0108EPWR）芯片使能脚改为高电平常驻；新增 R251/R257（10K）、R310/R311（1M）</li><li>优化 2.9V 触发的 DI 电路：R258/R259/R265/R266 1K→2K；R255/R256/R263/R264 1K→10K</li><li>修复 DO 电路 BUG，对调 PMOS 管 D 极与 S 极</li><li>FORCE_RECOVERY 功能由触摸按键改为拨码开关控制</li><li>J9/J10/J37 FPC 连接器由 vertical 改为 horizontal</li></ul> | 2025-03-20 |
| V1.0 | 初始设计 | 2024-10-30 |
