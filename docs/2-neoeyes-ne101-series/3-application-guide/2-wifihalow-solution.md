---
description: NE101 WiFi HaLow 版本通过 Morse Micro HaLowLink 网关实现远距离图像采集与上传的完整部署方案，涵盖网关配置、设备联网、MQTT 数据对接及平台验证。
keywords: [NE101, WiFi HaLow, Morse Micro, HaLowLink, MQTT, 图像采集, 远距离传输, Sub-1GHz, IEEE 802.11ah]
tags: [NE101 应用, WiFi HaLow, Morse Micro, 图像上传]
---

# WiFi HaLow Solution

> **验证状态**：本方案已通过实际部署验证 ✅
>
> **适用设备**：NE101 WiFi HaLow 版本 + Morse Micro HaLowLink 网关

---

## 1. 方案概述

### WiFi HaLow 协议简介

WiFi HaLow（IEEE 802.11ah）是一种运行在 Sub-1 GHz 频段（868 MHz / 915 MHz）的低功耗远距离无线通信协议。相比传统 2.4 GHz / 5 GHz WiFi，WiFi HaLow 在传输距离和穿墙能力上有显著优势，适用于户外监测、农业物联网、工业自动化等远距离数据采集场景。

| 特性 | WiFi HaLow | 传统 WiFi（2.4 GHz） |
|------|-----------|---------------------|
| 频段 | Sub-1 GHz（868/915 MHz） | 2.4 GHz / 5 GHz |
| 传输距离 | 可达 1 km+ | 通常 50-100 m |
| 穿墙能力 | 强 | 一般 |
| 功耗 | 低 | 较高 |
| 适用场景 | 远距离低功耗 IoT | 近距离高速传输 |

### Morse Micro × CamThink

[Morse Micro](https://www.morsemicro.com/) 是全球领先的 WiFi HaLow 芯片企业，总部位于澳大利亚悉尼，专注于 IEEE 802.11ah 协议芯片的研发与推广。其 [HaLowLink1 / HaLowLink2](https://www.morsemicro.com/halowlink) 系列网关产品为 WiFi HaLow 设备提供了即插即用的网络桥接方案，可将 HaLow 网络无缝接入标准以太网 / WiFi 网络。CamThink 与 Morse Micro 在 WiFi HaLow IoT 领域保持密切合作，[NE101](https://www.camthink.ai/product/neoeyes-ai-camera-ne101/) 智能相机搭载WiFi HaLow 模块，配合 Morse Micro HaLowLink 网关，可实现远距离低功耗图像采集与上传的完整端到端方案。

### 方案架构

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/halowlink-topology.png)

**数据流向**：

```
NE101（图像采集） → WiFi HaLow → HaLowLink 网关 → 以太网/WiFi → MQTT Broker → 后端平台
```

| 环节 | 说明 |
|------|------|
| 图像采集 | NE101 定时或触发抓拍，生成 JPEG 图像 |
| HaLow 传输 | 通过 Sub-1 GHz 无线链路发送至 HaLowLink 网关 |
| 网络桥接 | HaLowLink 将 HaLow 数据桥接至以太网/WiFi 网络 |
| MQTT 上报 | NE101 通过 MQTT 协议将图像 Base64 数据发布至 Broker |
| 平台接收 | 后端平台订阅 MQTT Topic，接收并展示图像 |

---

## 2. 物料清单（BOM）

### 必需设备

| 物料 | 型号/规格 | 数量 | 用途 | 备注 |
|------|----------|------|------|------|
| **智能相机** | [NE101 WiFi HaLow 版](https://www.camthink.ai/product/neoeyes-ai-camera-ne101/) | 1 | 图像采集与传输 | 需安装 FGH100M 模块 |
| **HaLow 网关** | [Morse Micro HaLowLink1](https://www.morsemicro.com/halowlink) 或 [HaLowLink2](https://www.morsemicro.com/halowlink) | 1 | HaLow 网络桥接 | 供电并接入以太网 |
| **MQTT 服务器** | 后端服务器（如 [AI Tool Stack](https://github.com/camthink-ai/AIToolStack)、[NeoMind](https://github.com/camthink-ai/NeoMind)、[EMQX](https://www.emqx.io/)、[Mosquitto](https://mosquitto.org/)） | 1 | 接收图像数据 | 需与网关网络互通 |

---

## 3. HaLowLink 网关配置

### 3.1 网关联网

将 HaLowLink 网关通过以太网线接入局域网，网关上电启动后，在浏览器中访问网关管理页面，确认网络连接状态正常。具体登录方法请参照 [HaLowLink 说明书](https://www.mouser.com/pdfDocs/HaLowLink-1-User-Guide-2613-1.pdf)。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/gateway-login.png)

### 3.2 检查 WiFi HaLow 频率配置

进入网关管理页面，点击 **Network → Wireless**，检查 WiFi HaLow 的频率设置。根据所在地区选择对应的频段：

- **欧洲地区**：868 MHz
- **北美地区**：915 MHz

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/halowlink-check-wireless.png)

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/halowlink-check-frequency.png)

> 确保网关与 NE101 的频率设置一致，否则设备无法关联。

---

## 4. NE101 连接 WiFi HaLow

### 4.1 登录 NE101

NE101 上电后，通过 WiFi 连接到 NE101 的热点，在浏览器中输入 `192.168.1.1` 即可访问 NE101 配置界面。

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/ne101-login.png)

### 4.2 配置 WiFi HaLow 网络

进入 **Gateway Connection** 页面，选择 **Region** 与 HaLowLink 网关匹配（如 US 或 AU），点击 **Refresh** 扫描可用网络，扫描到 HaLowLink 网关 AP 后，点击 AP 并输入密码完成连接。

<div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/refresh-gateway.png" alt="扫描网络" style={{ height: '200px', objectFit: 'contain' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/input-password.png" alt="输入密码" style={{ height: '200px', objectFit: 'contain' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/gateway-connected.png" alt="连接成功" style={{ height: '200px', objectFit: 'contain' }} />
</div>

### 4.3 验证连接状态

连接成功后，在网关管理页面可以看到 NE101 已关联：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/ne101-connected-halowlink.png)

点击查看连接详情，确认信号强度、频率等参数正常：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/ne101-connected-halowlink-details.png)

---

## 5. MQTT 数据对接

### 5.1 搭建 MQTT Broker

以 [AI Tool Stack](https://github.com/camthink-ai/AIToolStack) 为例，在平台中创建 MQTT Broker 服务，获取 Broker 的 IP 地址、端口以及认证信息。也可使用 [NeoMind](https://github.com/camthink-ai/NeoMind)、[EMQX](https://www.emqx.io/)、[Mosquitto](https://mosquitto.org/) 等平台或自建 MQTT Broker。

### 5.2 配置 NE101 MQTT 连接

在 NE101 配置界面进入 **Data Report** 页面，填写 MQTT Broker 连接参数：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| Host | MQTT 服务器 IP 地址 | 需与网关网络互通 |
| MQTT Port | 1883（或服务器端口） | MQTT TCP 端口 |
| Topic | 自定义（如 `ne101/image`） | 图像数据发布主题 |
| Client ID | 自动生成或自定义 | 设备唯一标识 |
| QoS | QoS 0 | 图像传输建议使用 QoS 0 |
| Username / Password | 按服务器配置填写 | 如果 Broker 启用了认证 |

保存配置后，NE101 将通过 WiFi HaLow → HaLowLink 网关连接到 MQTT Broker：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/mqtt-connected.png)

### 5.3 数据格式

NE101 上报的 MQTT 消息 payload 为 JSON 格式，图像以 Base64 编码嵌入其中：

```json
{
  "ts": 1740640441620,
  "values": {
    "devName": "NE101 Sensing Camera",
    "devMac": "D8:3B:DA:4D:10:2C",
    "battery": 84,
    "snapType": "Button",
    "localtime": "2025-02-27 15:14:01",
    "imageSize": 74371,
    "image": "data:image/jpeg;base64,..."
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `ts` | number | 时间戳（毫秒） |
| `devName` | string | 设备名称 |
| `devMac` | string | 设备 MAC 地址 |
| `battery` | number | 电池电量（%） |
| `snapType` | string | 抓拍类型：`Button`（按钮）、`Scheduled`（定时）、`PIR`（传感器触发） |
| `localtime` | string | 本地时间 |
| `imageSize` | number | 图像大小（字节） |
| `image` | string | Base64 编码的 JPEG 图像，前缀 `data:image/jpeg;base64,` |

### 5.4 验证图像接收

使用 MQTT 客户端（如 [MQTTX](https://mqttx.app/)）订阅对应 Topic，或在后端平台中查看接收到的图像数据：

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/platform.png)

Base64 图像可直接用于网页展示：

```html
<img src="data:image/jpeg;base64,..." />
```

---

## 6. 附录

### 相关文档与资源

| 名称 | 说明 | 名称 | 说明 |
|------|------|------|------|
| [NE101 产品概述](https://www.camthink.ai/product/neoeyes-ai-camera-ne101/) | NE101 产品规格与功能介绍 | [NE101 快速入门](../1-quick-start.md) | 设备组装与首次使用指南 |
| [Morse Micro 官网](https://www.morsemicro.com/) | WiFi HaLow 芯片厂商 | [HaLowLink 网关产品](https://www.morsemicro.com/halowlink) | HaLowLink 网关产品介绍 |
| [AI Tool Stack](https://github.com/camthink-ai/AIToolStack) | MQTT Broker 平台服务 | [NeoMind](https://github.com/camthink-ai/NeoMind) | AI 视觉分析平台 |
| [EMQX](https://www.emqx.io/) | 开源 MQTT Broker | [Mosquitto](https://mosquitto.org/) | 轻量级 MQTT Broker |
| [MQTTX](https://mqttx.app/) | MQTT 客户端调试工具 | | |

---

*最后更新: 2026-04-22*
