---
description: NE503 快速入门：从开箱到看到 AI 出结果。涵盖套件准备、上电连接、登录改密、验证画面与码流、体验 AI、配置网络与时区，以及后续深入入口。
keywords: [NE503 快速入门, 首次部署, Web 控制台登录, AI Model Showcase, 默认 IP, PoE 供电, 边缘 AI 相机]
tags: [快速入门, NE503, 首次部署]
---

# Quick Start

本指南带您完成 NE503 首次部署：开箱 → 连接 → 登录改密 → 验证画面 → 体验 AI → 配置网络与时区。走完后设备即可正式上线，深入功能见[用户指南](./2-user-guide/0-dashboard.md)。

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ne503-main.png" alt="NeoEyes NE503" width="100%" />
</div>

## 1. 套件与准备

### 套件内容

| 组件 | 数量 | 说明 |
|------|------|------|
| NE503 主机 | 1 | 核心处理板与接口板，IP67 防护 |
| 壁挂螺丝包 | 1 | 固定螺丝与安装件 |

### 自备物品

- **PoE 交换机**（802.3AT，推荐）+ 网线：一根线同时完成供电和联网
- **或** DC 12V 电源适配器 + 普通交换机 + 网线
- **电脑**：带以太网口，Windows / macOS / Linux，现代浏览器（Chrome / Edge / Firefox / Safari）

### 安装位置

IP67 防护、-40 °C ~ +60 °C 工作温度，可户外安装。壁挂支架固定到墙面 / 立杆，对准卡口旋紧螺丝；立杆与吊装场景需另购支架配件。整机功耗 5–6 W。

## 2. 上电与连接

**上电**：PoE 方式将网线接入 PoE 交换机；DC 方式将 12V 适配器接 DC 口。指示灯闪烁表示启动中，常亮即就绪（约 30–60 秒）。

**连接**：出厂默认 IP `10.0.0.1`。将电脑以太网 IP 设为同一网段（如 `10.0.0.100`，子网掩码 `255.255.255.0`），然后 ping 验证：

```bash
ping 10.0.0.1
```

能通即进入下一步。

## 3. 登录并改密码

浏览器访问 `https://10.0.0.1`（首次访问会提示证书不受信任，按提示继续），用默认凭据登录——用户名 `admin`，密码 `password`：

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-login.png" />

登录后进入 Dashboard。左上角展开图标可显示导航栏文字（Dashboard / Media / Image / Applications / Models / Peripherals / Settings / Maintenance），后续操作在页面间跳转完成。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-dashboard.png" />

**⚠️ 第一件事：改掉默认密码。** 默认密码公开，不改进网即裸奔。进入 **Settings → Device Info**，页面底部 **Change Password** 设新密码并妥善保管。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-device-info.png" />

## 4. 验证画面与码流

进入 **Media** 页面，主区域显示摄像头实时画面——看到画面即说明摄像头与图像链路正常工作。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-media.png" />

顺便确认推流可用：右侧 **Configuration** 面板开启 **Enable RTSP Stream**，复制主码流地址 `rtsp://<设备IP>:8554/main`，用 VLC 打开网络串流粘贴地址播放——能播说明端到端链路畅通。

## 5. 体验 AI

NE503 的 AI 能力通过容器应用体现。官方应用仓库 [camthink-ai/neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) 提供多个示例应用，其中 **AI Model Showcase** 集中展示多模型推理——目标检测、语义分割、关键点、OCR、CLIP 零样本分类、单目深度估计等。

从仓库克隆源码、按仓库说明构建 `.aipc` 安装包，然后在 **Applications** 页面点 **Import** 上传该包，按向导勾选 Permissions（应用所需的模型与码流）完成安装：

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-app-management.png" />

安装启动后，点击应用卡片的 **Visit App** 打开 Showcase 界面，切换不同模型实时查看推理效果：

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-model-showcase.png" />

## 6. 配置网络与时区

前 5 步走完设备已能工作。最后在 **Settings** 里配好网络与时区，即可正式上线。

### 接入局域网

出厂 IP `10.0.0.1` 仅用于首次配置。要让局域网内其他设备（NVR、业务服务器、同事电脑）能访问 NE503，进入 **Settings → Network**，根据环境二选一：

| 模式 | 适用 | 操作 |
|------|------|------|
| **DHCP** | 有路由器自动分配 | 选 DHCP，保存 |
| **Static Address** | 需固定 IP | 填 IP / 子网掩码 / 网关 / DNS |

保存后设备切到新 IP。把电脑 IP 改回正常网段（或用同网段另一台电脑），用新 IP 重新访问 `https://<新IP>` 继续。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-network.png" />

> 生产环境建议静态 IP 或在路由器绑定 MAC，避免 IP 变动导致对接失效。

### 设时区

时区错则视频 OSD 时间戳和录像文件命名全错。进入 **Settings → Time Settings**：选部署地时区，配 NTP 服务器（如 `pool.ntp.org`），点 **Sync Now** 立即同步。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-time-settings.png" />

## 7. 接下来做什么

设备已上线，按目标继续：

| 你想做的事 | 去哪 |
|-----------|------|
| 调镜头 / 画质 / 叠加隐私遮罩 | [用户指南 · 视频与成像](./2-user-guide/1-media-and-image.md) |
| RTSP 拉流接入 NVR / VMS | [用户指南 · 视频与成像](./2-user-guide/1-media-and-image.md) |
| 安装自己的 AI 应用、管理模型 | [用户指南 · AI 应用与模型](./2-user-guide/2-applications-and-models.md) |
| 接报警器 / 门禁 / 音频外设 | [用户指南 · 外设 IO](./2-user-guide/3-peripherals.md) |
| 升级固件 / 看日志 / 运维 | [用户指南 · 系统管理](./2-user-guide/4-settings-and-maintenance.md) |
| REST API / Event Bus 对接业务系统 | [集成文档](./4-application-guide/2-3rd-party-integration/0-restful-api.md) |
| 开发自己的容器应用 | [应用开发文档](./4-application-guide/1-app-development/0-sdk-workflow.md) |

### 速查卡

| 项目 | 值 |
|------|-----|
| Web 控制台 | `https://<设备IP>` |
| 默认 IP | `10.0.0.1` |
| Web 登录 | `admin` / `password` |
| SSH 登录 | `root` / `root` |
| RTSP 主码流 | `rtsp://<设备IP>:8554/main` |
| 供电 | PoE 802.3AT 或 DC 12V，5–6 W |
