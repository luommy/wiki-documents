---
description: 本指南帮助您快速上手 NeoEyes NE503 边缘 AI 计算平台，涵盖网络连接、Web 控制台登录、媒体与 RTSP 配置、SSH 终端访问、容器化应用安装及 aipc-cli 命令行工具使用。
keywords: [NE503快速入门, NeoEyes NE503, Web控制台, SSH登录, RTSP配置, aipc-cli, 容器化应用, 边缘AI平台, 应用安装]
tags: [快速入门, NE503, Web控制台, SSH, CLI]
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Quick Start

## 概述

本指南将帮助您快速上手 **NeoEyes NE503** 边缘 AI 计算平台，从网络连接到 Web 控制台配置，再到 SSH 终端和命令行工具使用，全程指导您完成设备的初次部署。

<!-- TODO: 替换为产品实景图 -->
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', alignItems: 'center', margin: '12px 0' }}>
  <img src={useBaseUrl("/img/neoeyes-ne503-series/quick-start/ne503-front.png")} alt="NE503 正面" style={{ flex: '0 0 auto', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src={useBaseUrl("/img/neoeyes-ne503-series/quick-start/ne503-back.png")} alt="NE503 背面" style={{ flex: '0 0 auto', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## 产品准备

### 套件内容

| 组件 | 数量 | 说明 |
|------|------|------|
| NE503 主机 | 1 | 含主板、接口板 |
| 网线 | 1 | Cat5e 或以上 |
| 电源适配器 | 1 | DC 12V（不可超过 12V） |
| 镜头模组 | 1 | 已预装 |

### 系统要求

- **网络**：以太网交换机或路由器（支持 PoE 802.3AT 可省去电源适配器）
- **电脑**：可访问同一局域网的 PC 或 Mac
- **浏览器**：Chrome / Firefox / Edge 最新版本

> 提示：NE503 支持通过 PoE 供电，若您的交换机支持 PoE 802.3AT，仅需一根网线即可同时完成供电和网络连接。

---

## 网络连接

### 步骤 1：连接设备

1. 使用网线将 NE503 的 LAN 口连接到您的交换机或路由器。
2. 如果不使用 PoE 供电，请连接 12V 电源适配器。
3. 等待设备启动（约 30 秒），系统指示灯亮起表示启动完成。

<!-- TODO: 替换为实际连接图片 -->
<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src={useBaseUrl("/img/neoeyes-ne503-series/quick-start/network-connection.png")} alt="网络连接" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 步骤 2：配置电脑 IP

NE503 出厂默认 IP 地址为 **10.0.0.1**。需要将您的电脑设置为同一网段：

**macOS：**
1. 打开 **系统设置 > 网络**
2. 选择当前连接的网络接口，点击 **详细信息**
3. 选择 **TCP/IP**，配置 IPv4 为 **手动**
4. 设置 IP 地址为 `10.0.0.100`，子网掩码为 `255.255.255.0`

**Windows：**
1. 打开 **控制面板 > 网络和共享中心 > 更改适配器设置**
2. 右键当前网络连接，选择 **属性**
3. 双击 **Internet 协议版本 4（TCP/IPv4）**
4. 选择 **使用下面的 IP 地址**
5. 设置 IP 地址为 `10.0.0.100`，子网掩码为 `255.255.255.0`

**Linux：**
```bash
sudo ip addr add 10.0.0.100/24 dev eth0
```

### 步骤 3：验证连通性

```bash
ping 10.0.0.1
```

```
64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=0.543 ms
64 bytes from 10.0.0.1: icmp_seq=2 ttl=64 time=0.312 ms
```

> 提示：如果 ping 不通，请检查网线连接和 IP 地址配置。如果设备已通过 DHCP 获取了其他 IP，请使用路由器管理界面查看设备 IP，或使用 nmap 扫描局域网。

---

## Web 控制台

### 登录

1. 在浏览器中输入 `http://10.0.0.1:8080`
2. 输入默认凭据：
   - **用户名**：`admin`
   - **密码**：`password`

<!-- TODO: 替换为实际登录页面截图 -->
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src={useBaseUrl("/img/neoeyes-ne503-series/quick-start/login.png")} alt="登录页面" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src={useBaseUrl("/img/neoeyes-ne503-series/quick-start/dashboard.png")} alt="仪表盘" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> **注意**：首次登录后请立即修改默认密码。进入 **设置 > 密码管理** 修改登录凭据。

### 仪表盘概览

登录后，仪表盘实时显示以下设备状态：

- CPU 和 NPU 利用率趋势图
- 内存使用情况
- 网络吞吐量（收发速率）
- 系统运行时间和固件版本
- 设备温度监控

### 媒体设置

通过 **设置 > 媒体** 访问媒体配置页面。

#### 视频配置

可调整的参数包括：

| 参数 | 说明 |
|------|------|
| 码率 | 视频编码码率 |
| 帧率 | 视频帧率 |
| 分辨率 | 视频分辨率 |
| 编码格式 | H.264 或 H.265 |

#### 图像调节

| 参数 | 说明 |
|------|------|
| 亮度 | 画面亮度调节 |
| 对比度 | 画面对比度调节 |
| 饱和度 | 色彩饱和度调节 |
| 锐度 | 画面锐度调节 |
| WDR | 宽动态范围 |

#### RTSP 流地址

配置完成后，可通过以下地址拉取 RTSP 视频流：

| 码流 | 地址 |
|------|------|
| 主码流 | `rtsp://10.0.0.1:8554/main` |
| 子码流 | `rtsp://10.0.0.1:8554/sub` |
| 三码流 | `rtsp://10.0.0.1:8554/third` |

使用 VLC 或 FFplay 验证视频流：

```bash
# 使用 FFplay 播放主码流
ffplay rtsp://10.0.0.1:8554/main

# 使用 VLC 打开网络流
vlc rtsp://10.0.0.1:8554/main
```

### PTZ 与镜头控制

通过 **设置 > 媒体 > PTZ 控制** 访问。

| 功能 | 说明 |
|------|------|
| 光学变焦 | 滑块控制，1x – 2.88x |
| 手动对焦 | 滑块控制对焦距离 |
| 自动对焦 | 一键自动对焦 |
| 光圈控制 | IR-CUT 滤光片切换、光圈调节 |
| 镜头归零 | 变焦 / 对焦轴独立归零 |

---

## SSH 终端访问

### 连接 SSH

```bash
ssh root@10.0.0.1
# 密码: root
```

```
root@hailo15:~#
```

> **注意**：首次登录 SSH 后也请修改默认密码。使用 `passwd` 命令修改。

### 常用命令

#### 查看系统信息

```bash
# 查看系统版本
cat /etc/os-release
```

```
NAME="Hailo15"
VERSION="1.11.0"
```

```bash
# 查看内核版本
uname -r
```

```
5.15.325.15.32-yocto-standard-g6213d7bcf771
```

#### 查看服务状态

```bash
# 查看所有 AIPC 服务状态
systemctl status platform-api
systemctl status camera-daemon
systemctl status app-manager
systemctl status ai-runtime
systemctl status device-control
systemctl status event-bus
```

#### 查看日志

```bash
# 查看最近 50 条日志
journalctl -u platform-api -n 50

# 实时跟踪日志
journalctl -u camera-daemon -f
```

#### 网络配置

```bash
# 查看网络状态
ip addr show

# 测试网络连接
ping -c 4 8.8.8.8
```

---

## 应用管理

NE503 支持容器化第三方应用的安全沙箱运行。通过 Web 控制台即可完成应用安装。

### 安装应用

1. 在主导航栏进入 **应用** 页面。
2. 点击 **导入应用**。
3. 在安装向导中依次填写：
   - **第 1 步 — 来源**：选择"仓库"并输入容器镜像地址，或选择"本地文件"上传 `.tar` 镜像
   - **第 2 步 — 基本信息**：填写应用 ID、名称和版本
   - **第 3 步 — 资源**：设置 CPU 和内存限制
   - **第 4 步 — 权限**：授予所需能力（视频访问、AI 推理等）
   - **第 5 步 — 确认**：核对信息后点击 **安装**
4. 等待镜像下载完成及容器启动。

<!-- TODO: 替换为实际应用安装截图 -->
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src={useBaseUrl("/img/neoeyes-ne503-series/quick-start/app-import.png")} alt="导入应用" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src={useBaseUrl("/img/neoeyes-ne503-series/quick-start/app-running.png")} alt="应用运行" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### 示例：安装 NX Witness

**前置条件**：
- 设备可访问外网（首次拉取镜像约 500MB）
- 可用内存 >= 1GB

| 字段 | 值 |
|------|-----|
| 应用 ID | `nx` |
| 应用名称 | `NX Witness` |
| 版本 | `1.0.0` |
| 镜像 | `ptr727/nxwitness:6.1.1.42624` |
| CPU 限制 | `100%` |
| 内存限制 | `1Gi` |
| 网络模式 | `host` |

安装完成后，通过 `https://10.0.0.1:7001` 访问 NX Witness 管理界面。

---

## CLI 工具入门

`aipc-cli` 是 NE503 平台的命令行管理工具，通过 gRPC 与平台服务通信，可在设备终端或远程主机上使用。

> **注意**：`aipc-cli` 有两种通信模式：**gRPC 直连**（通过 Unix Socket，免认证，如 `system status`、`device status`、`model list`）和 **REST API**（通过 HTTP 端口 8080，需 Bearer Token 认证，如 `monitor`、`media`、`stream`）。以下示例中，gRPC 命令可直接在设备终端运行。

### 配置

`aipc-cli` 在设备本地终端可直接使用，默认通过 Unix Socket 与平台服务通信，无需额外配置。

如需在远程主机上使用，可通过全局参数指定连接方式：

```bash
# 远程使用时指定 gRPC 地址
aipc-cli --app-manager unix:///var/run/aipc/app-manager.sock system status

# 或通过 REST API（需要认证）
aipc-cli --api http://10.0.0.1:8080 system stats
```

### 系统管理

```bash
# 查看系统信息
aipc-cli system info

# 系统健康检查
aipc-cli system health

# 查看服务状态
aipc-cli system status
```

```
SERVICE         ACTIVE    PID   UPTIME
-------         ------    ---   ------
event-bus       active    306   8467 min
app-manager     active    381   8467 min
ai-runtime      active    380   8467 min
camera-daemon   active    303   8467 min
device-control  active    305   8467 min
platform-api    active    383   8467 min
```

### 应用管理

```bash
# 列出已安装应用
aipc-cli app list

# 查看应用详情
aipc-cli app info <app-id>

# 启动 / 停止应用
aipc-cli app start <app-id>
aipc-cli app stop <app-id>

# 查看应用日志
aipc-cli app logs <app-id>
aipc-cli app logs <app-id> -f --tail 50
```

### 设备控制

```bash
# 查看设备状态
aipc-cli device status

# 光学变焦控制（速度 1-100）
aipc-cli device zoom in 50
aipc-cli device zoom stop

# 对焦控制（速度 1-100）
aipc-cli device focus auto
aipc-cli device focus near 30
aipc-cli device focus stop

# 补光灯控制
aipc-cli device light 80

# IR-CUT 模式
aipc-cli device ircut auto
```

### 媒体配置

> 以下命令通过 REST API 通信。在设备本地使用时，平台服务会自动处理认证。如遇 `401 Unauthorized` 错误，请通过 Web 控制台（`http://<设备IP>:8080`）登录后获取 Bearer Token，或直接在 Web 控制台中调整媒体参数。

```bash
# 查看媒体配置
aipc-cli media config

# 更新编码参数
aipc-cli media encoder --bitrate 4000000 --fps 30

# 更新图像参数
aipc-cli media image --brightness 50 --contrast 50
```

### AI 模型管理

```bash
# 列出已注册模型
aipc-cli model list
```

```
ID                  PATH                                                VERSION
--                  ----                                                -------
person-detection    /opt/aipc/models/detection/hailo_yolov8n_384_640.hef   hailort
person_vehicle_v1   /opt/aipc/models/detection/hailo_yolov8n_384_640.hef   hailort
face_landmarks_v1   /opt/aipc/models/landmarks/face_landmarks_lite.hef     hailort
clip_image_encoder  /opt/aipc/models/zeroshot/clip_vit_b_16_image_encoder.hef  hailort
```

```bash
# 查看模型详情
aipc-cli model info <model-id>

# 注册新模型
aipc-cli model register /path/to/model.hef

# AI 运行时统计
aipc-cli model stats
```

> 更多 CLI 命令请使用 `aipc-cli --help` 查看。

---

## 系统管理

通过 Web 控制台 **设置** 页面可完成以下管理操作：

| 功能 | 说明 |
|------|------|
| 设备信息 | 查看硬件型号、固件版本、运行时间 |
| 密码管理 | 修改设备登录凭据 |
| 时间设置 | NTP 同步或手动时间设置 |
| 固件升级（OTA） | 上传固件包，自动解析、写入、重启并健康检查 |
| 存储管理 | TF 卡格式化、挂载/卸载 |
| 网络配置 | 静态 IP 或 DHCP |

---

## 下一步

恭喜！您已成功完成 NE503 的快速入门。接下来，您可以：

- **部署 AI 应用**：通过容器化方式部署行人检测、车牌识别等 AI 模型
- **集成视频管理**：安装 NX Witness 等 VMS 系统
- **开发自定义应用**：使用 Python/C++/Go SDK 开发定制化 AI 应用
- **配置事件联动**：通过 event-bus 和 Alarm IO 实现传感器触发与硬件联动

## 常见问题

### Q: 无法 ping 通设备？

**A**: 请检查：
1. 网线是否正确连接，设备指示灯是否亮起
2. 电脑 IP 是否与设备在同一网段（10.0.0.x）
3. 如果设备通过 DHCP 获取 IP，请在路由器管理界面查看设备实际 IP

### Q: Web 控制台无法访问？

**A**: 请检查：
1. 确认设备 IP 和端口（8080）正确
2. 尝试使用 `curl http://10.0.0.1:8080` 测试连接
3. 检查防火墙是否阻止了 8080 端口

### Q: RTSP 流无法播放？

**A**: 请检查：
1. 确认 RTSP 服务已启用（通过 Web 控制台 **设置 > 媒体** 检查，或使用 `aipc-cli media config` 查看）
2. 使用 VLC 或 FFplay 测试流地址：`ffplay rtsp://<设备IP>:8554/main`
3. 检查网络带宽是否满足视频流要求

### Q: SSH 连接被拒绝？

**A**: 请检查：
1. 确认 SSH 服务正在运行：`systemctl status sshd`
2. 确认使用正确的 IP 和端口（默认 22）
3. 检查设备防火墙设置

---

**需要帮助？**

- 技术支持：support@camthink.ai
- GitHub：https://github.com/camthink-ai
- 完整文档：[产品概述](./0-overview.md)

---

*最后更新: 2026-05-06*
