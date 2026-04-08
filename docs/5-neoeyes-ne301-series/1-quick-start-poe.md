---
description: 本教程介绍 NeoEyes NE301 PoE 版本的快速上手流程，包括 PoE 模块硬件介绍与连接、Web UI 登录配置、PoE 网络状态查看与 IP 设置，适用于户外防水、持续抓拍和 RTMP 视频推流等场景。
keywords: [NE301 PoE, PoE供电, 以太网供电, NE301快速开始, RTMP推流, 持续抓拍, 户外防水, 网络配置]
tags: [NE301, PoE, 快速入门, 网络配置, 视频推流]
sidebar_position: 1.5
---

# Quick Start(PoE)

## 概述

本教程将帮助您快速上手 [NeoEyes NE301 PoE 版本](https://www.camthink.ai/store/ne301-poe/)。PoE（Power over Ethernet，以太网供电）版本通过标准以太网线缆同时实现数据传输和设备供电，无需电池，适合户外长期部署场景。

### PoE 版本核心优势

- **户外防水**：PoE 供电方案省去了电池仓，配合设备本身的 IP67 防护等级，更适合户外长期部署
- **持续抓拍工作**：PoE 供电提供稳定持续的电力，设备可持续运行不间断，无需担心电池续航
- **RTMP 视频推流**：通过有线以太网连接，支持稳定低延迟的 RTMP 视频推流

> 操作视频参考：[NE301 PoE 版本使用教程](https://youtu.be/mkmSQY8P8ks)

---

## 硬件介绍

### PoE 版本外观

NE301 PoE 版本在标准版基础上增加了 PoE 供电模块，下图为完整设备外观。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/1-poe-full.png" alt="NE301 PoE 版本完整外观" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### PoE 模块介绍

PoE 扩展板是 NE301 PoE 版本的核心组件，负责将以太网线缆传输的电力转换为设备所需的工作电压，同时提供有线网络连接能力。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/2-POE-board-1.png" alt="PoE 模块正面" style={{ flex: '1 1 280px', maxWidth: '400px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/3-POE-board-2.png" alt="PoE 模块背面" style={{ flex: '1 1 280px', maxWidth: '400px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### PoE 板核心接口

除 PoE 供电外，PoE 板还提供以下接口，扩展设备的连接能力：

| 接口 | 说明 |
|------|------|
| **PoE** | 以太网供电 + 有线网络，IEEE 802.3af 标准 |
| **Type-C** | 有线供电接口，如需防护外壳则通过 PoE 板引出，否则可直连主板 |
| **Alarm** | 4PIN 报警输入输出接口，支持 5V 供电，可适配 2PIN 非智能型 PIR 传感器 |
| **RS485** | 工业标准串行通信接口，支持 RS485 总线设备连接 |

### PoE 供电要求

NE301 设备端工作电流约 170-180mA，PoE 实测电压 4.9~5.1V，设备功率低于 10W（数据来源：[产品信息](./0-overview.md)）。具体供电要求如下：

| 项目 | 要求 |
|------|------|
| **PoE 标准** | IEEE 802.3af（15.4W）及以上 |
| **供电设备** | PoE 供电交换机 或 PoE 供电器（Midspan） |
| **以太网线缆** | Cat5e 及以上，建议使用室外防水网线 |

> 提示：如果部署环境中已有 PoE 交换机（如监控网络），NE301 PoE 版本可直接接入现有网络。

---

## PoE 硬件连接

### 组装步骤

1. 将 PoE 模块与 NE301 主板对应接口对齐
2. 轻轻按压确保连接牢固
3. 使用以太网线缆将 PoE 模块与 PoE 供电交换机（或 PoE 供电器）连接

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/4-ne301-poe-connection.png" alt="NE301 PoE 连接示意" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 通电确认

连接 PoE 线缆后，观察设备前部蓝色指示灯是否亮起。蓝色指示灯亮起表示设备已成功通过 PoE 供电并启动。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/5-ne301-poe-power-on.png" alt="PoE 通电确认" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> 提示：如果指示灯未亮起，请检查以太网线缆是否连接正常，以及 PoE 供电设备是否正常工作。

---

## 连接与登录

### 连接 NE301 WiFi AP

NE301 PoE 版本同样内置 WiFi AP，用于通过 Web UI 对设备进行配置和管理。NE301 WiFi AP 的 SSID 名称规则为 `NE301{Mac后六位字母}`。

1. 确保设备已通过 PoE 供电并正常启动（蓝色指示灯亮起）
2. 在手机或电脑的 WiFi 列表中找到 `NE301{Mac后六位字母}` 的 WiFi AP 并连接
3. 连接成功后，在浏览器中输入 `192.168.10.10` 访问 Web 管理页面

> 短按拍照键触发抓拍；长按按键 2 秒唤醒 WiFi AP，同时设备前部的蓝色系统指示灯亮起。
> WiFi AP 默认空闲 10 分钟后进入休眠。若页面断开，可再次短按拍照键唤醒或调整休眠时间。

### 登录 Web UI

在浏览器中打开 `192.168.10.10` 后，进入登录界面。默认密码为 `hicamthink`，可在 `主页菜单栏 - 系统设置 - 设备密码` 中修改。

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/6-ne301-login.png" alt="Web UI 登录页" style={{ flex: '1 1 280px', maxWidth: '400px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/7-ne301-login-success.png" alt="登录成功" style={{ flex: '1 1 280px', maxWidth: '400px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

---

## PoE 网络管理

### 查看 PoE 连接状态

登录 Web UI 后，进入网络设置页面，可以查看当前 PoE 的连接状态信息，包括网络连接是否正常、当前 IP 地址等。

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/8-poe-status.png" alt="PoE 状态查看" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 配置 PoE IP 设置

根据您的网络环境，可以配置 PoE 的 IP 获取方式：

- **DHCP（默认）**：自动从路由器获取 IP 地址，适合大多数场景
- **静态 IP**：手动指定 IP 地址、子网掩码和网关，适合需要固定 IP 进行设备管理的场景

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/10-poe-configuration.png" alt="PoE 完整配置" style={{ flex: '1 1 280px', maxWidth: '400px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start-poe/9-poe-static-ip.png" alt="静态 IP 配置" style={{ flex: '1 1 280px', maxWidth: '400px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> 提示：当设备配置了静态 IP 后，同一局域网内的设备可以直接通过该 IP 地址访问 NE301 的 Web UI，无需再连接 WiFi AP。

---

## 典型应用场景

### 持续抓拍工作模式

PoE 供电使设备可 7×24 小时运行，结合定时抓拍、传感器触发（PIR/雷达等）与 MQTT 数据上报，实现全天候无人值守监控。

### RTMP 视频推流

PoE 版本通过有线以太网可将设备实时画面推送至流媒体服务器，适用于需要远程实时查看的场景。详细配置方法请参考 [RTMP 视频推流指南](./3-application-guide/8-rtmp-video-streaming.md)。

---

## 故障排查

| 问题 | 可能原因 | 解决办法 |
|------|----------|----------|
| 指示灯不亮 | PoE 供电异常 | 检查以太网线缆和 PoE 供电设备是否正常 |
| 无法连接 WiFi AP | 设备未启动或 WiFi AP 休眠 | 确认 PoE 供电正常，长按按键 2 秒唤醒 WiFi AP |
| PoE 网页无法访问 | IP 地址冲突或未获取 IP | 检查网络设置，尝试使用 DHCP 或更换静态 IP |

---

## 相关文档

- [NE301 产品信息](./0-overview.md)
- [NE301 快速入门（标准版）](./1-quick-start.md)
- [RTMP 视频推流指南](./3-application-guide/8-rtmp-video-streaming.md)
- [PIR 传感器集成](./3-application-guide/9-pir-sensor-integration.md)

---

*最后更新: 2026-04-08*
