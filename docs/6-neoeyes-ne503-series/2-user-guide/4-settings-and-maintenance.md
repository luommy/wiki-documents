---
description: NE503 系统管理完整指南：Settings 四子页（设备信息与双层固件升级、时间与 NTP、网络、存储）与 Maintenance 四子页（操作/系统/开发者日志、文件管理、Web 终端、进程管理）的配置与运维操作。
keywords: [NE503 系统管理, 设备信息, 固件升级, System OS, 时间设置, 网络, 存储, 日志, 文件管理, 终端, 进程管理]
tags: [用户指南, NE503, 系统管理, 运维]
---

# System Management

设备持续正常运行所需的配置与运维工具集中在 **Settings** 与 **Maintenance** 两个页面。Settings 管"配置"，Maintenance 管"运维"。

## 系统设置

展开导航栏点击 **Settings**，进入 4 个子页面：Device Info / Time Settings / Network / Storage。

### 设备信息与固件升级

页面分三部分：

**Basic Information**：设备名（可编辑）、型号、序列号、MAC 地址、摄像头模组、IP 地址。

**Firmware & Hardware**：

| 项 | 说明 |
|----|------|
| **Firmware Version** | 平台固件版本（平台服务、HAL、Web 控制台），旁有 **Update** |
| **System OS Version** | 系统 OS 版本（Linux 内核、设备树、根文件系统），旁有 **Update** |
| **Hardware Version / CPU / Memory** | 硬件版本、CPU 核数与频率、内存占用 |
| **Runtime Status** | 连续运行时长（Uptime） |

**底部操作**：**Change Password**（改密码）、**System Reboot**（重启）。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-device-info.png" />

#### 双层固件升级

NE503 有两类可升级内容，各自独立：

| 升级项 | 覆盖范围 |
|--------|---------|
| **Firmware Update** | 平台服务、HAL、Web 控制台等应用层 |
| **System OS Update** | Linux 内核、设备树、根文件系统等 OS 层 |

点击对应版本旁的 **Update**，上传升级包，系统自动解析校验后写入，完成后自动重启。

> 升级全程约 2–5 分钟，期间切勿断电或操作。建议业务低峰期执行。

### 时间

| 项 | 说明 |
|----|------|
| **Timezone** | 部署地时区 |
| **Time Format** | 12 / 24 小时制 |
| **Sync Mode** | **NTP Sync**（网络授时）或 **Manual Setup**（手动） |
| **NTP Server** | NTP 服务器地址（如 `pool.ntp.org`），旁有 **Sync Now** 立即同步 |
| **Sync Interval** | 同步间隔 |

> 时区直接影响视频 OSD 时间戳和录像文件命名，务必与部署地一致。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-time-settings.png" />

### 网络

**IPv4 Settings**（接口 eth0）：

| 项 | 说明 |
|----|------|
| **Mode** | **DHCP**（路由器自动分配）或 **Static Address**（手动固定） |
| **IP Address / Subnet Mask / Gateway** | 静态模式必填 |
| **DNS Server / Secondary DNS** | 域名解析服务器 |

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-network.png" />

> 生产环境建议静态 IP 或在路由器绑定 MAC，避免 IP 变动导致对接失效。改 IP 后需以新 IP 重新访问。

### 存储

显示内置存储使用情况，分 **System**（系统分区，不可改）与 **Data**（数据分区）两部分。存储使用率超过 80% 时应清理日志 / 录像 / 模型，或插入 **microSD 卡**扩展。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-storage.png" />

## 运维工具

展开导航栏点击 **Maintenance**，进入 4 个运维子页面。

### 日志

三种日志视图切换：

| 视图 | 内容 |
|------|------|
| **Operation Logs** | 用户登录、应用启停、配置变更等操作记录 |
| **System Logs** | 系统级事件 |
| **Developer Logs** | 开发者调试日志 |

支持按时间范围、关键字搜索筛选；表格列含 Level / Time / Module / Content / User，每条可点 **Detail** 看详情。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-logs.png" />

### 文件管理

Web 端文件浏览器，查看设备 `/data/aipc` 文件系统。路径导航（Back / Forward / Up + 面包屑）、操作栏（Download / Delete / Upload File / New Folder / Refresh）、表格列含 Name / Size / Type / Permissions / Modified，每项可 Preview / Delete / More。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-file-manager.png" />

### 终端

内置 Web SSH 终端，无需额外工具即可在浏览器访问设备命令行。状态显示 **Connected** 即可用，右上角 **SSH Settings** 可调连接参数。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-terminal.png" />

### 进程管理

列出设备所有运行中的进程，表格列：PID / Name / User / CPU% / Memory% / RSS / Status / Command。支持按名称 / PID / 用户 / 命令搜索，每项可 **Detail** 查看详情或 **Kill** 终止异常进程。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-process-manager.png" />

> 终止平台关键进程（如 camera-daemon、ai-runtime、platform-api、event-bus）可能导致功能异常，需重启恢复。非必要不 Kill。
