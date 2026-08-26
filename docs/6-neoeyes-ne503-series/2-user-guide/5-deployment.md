---
description: NE503 现场部署与工程运维指南：首次部署检查清单、网络与时间配置、日志采集与磁盘空间规划、固件 OTA 升级与回滚恢复，覆盖设备从上架交付到长期运维的完整流程。
keywords: [NE503 部署, 部署检查清单, 静态IP, NTP, 时区, 磁盘规划, 日志采集, 固件升级, OTA, 回滚, 恢复出厂]
tags: [用户指南, NE503, 部署, 运维, 系统管理]
---

# Deployment & Operations

本指南覆盖 NE503 从首次上架交付到长期运维的完整流程：部署前检查、网络与时间配置、日志与磁盘管理、固件升级与恢复。全部操作通过 Web 控制台的 **Settings** 与 **Maintenance** 页面及 SSH 完成。首次开箱连通与基础体验见[快速入门](../1-quick-start.md)。

## 1. 部署前检查清单

设备交付前，按下列清单逐项验证。任一项未通过，处理完毕后再继续下一项。

| # | 检查项 | 通过标准 |
|:--|:-------|:---------|
| 1 | 供电与上架 | PoE（802.3at）或 DC 12V 供电正常（功耗约 5–6 W），设备上电自动启动 |
| 2 | 网络接入 | 网线连接可靠，`ping` 设备 IP 可通 |
| 3 | Web 控制台可达 | 浏览器访问 `https://<设备IP>` 出现登录页（首次访问需确认自签证书例外） |
| 4 | 默认密码已修改 | Web 控制台（`admin` / `password`）与 SSH（`root` / `root`）均已完成改密 |
| 5 | 时间与时区 | 时区与部署地一致，NTP 同步成功，画面 OSD 时间戳正确 |
| 6 | 码流输出正常 | RTSP 主/子码流可拉取且画面正常：`ffprobe -rtsp_transport tcp rtsp://<设备IP>:8554/main` |
| 7 | AI 服务就绪 | **Models** 页预置模型状态正常，体验应用可正常启动 |
| 8 | 外设联动 | 报警输入 / Wiegand / 音频按需接线，并在 **Peripherals** 页启用 |
| 9 | 安全基线 | 设备不暴露公网、仅放行必要端口；详见[安全加固](./7-security-hardening.md) |
| 10 | 交付记录 | 记录设备 IP / MAC、固件版本、安装位置与负责人 |

各检查项对应的配置方法见后续章节。

## 2. 网络与时间配置

部署阶段必须完成两项基础配置：固定设备 IP（避免 IP 变动导致 NVR / 业务平台对接失效）与时间同步（时区与时间错误会导致日志、事件时间戳错位，影响排查与对账）。

### 2.1 静态 IP 配置

进入 **Settings → Network** 的 **IPv4 Settings**（接口 eth0）界面：

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-network.png" />

各字段说明：

| 配置项 | 说明 |
|--------|------|
| **Mode** | **DHCP**（路由器自动分配）或 **Static Address**（手动固定） |
| **IP Address / Subnet Mask / Gateway** | 静态模式必填 |
| **DNS Server / Secondary DNS** | 域名解析服务器 |

操作步骤：

1. 将 **Mode** 切换为 **Static Address**。
2. 填写与现场网络规划一致的 IP 地址、子网掩码与网关，DNS 按现场环境填写。
3. 保存后设备以新 IP 对外提供服务，浏览器需改用新地址访问。

**完成标准**：设备重启后 IP 不变；以该 IP 可稳定访问 Web 控制台；下游对接系统（NVR / 业务平台）已同步更新设备地址。

> 若现场采用 DHCP 环境且无法改静态，应在路由器上按设备 MAC 地址做 IP 绑定，达到同样的固定效果。

### 2.2 时区与 NTP 配置

进入 **Settings → Time** 界面：

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-time-settings.png" />

各字段说明：

| 配置项 | 说明 |
|--------|------|
| **Timezone** | 部署地时区 |
| **Time Format** | 12 / 24 小时制 |
| **Sync Mode** | **NTP Sync**（网络授时）或 **Manual Setup**（手动） |
| **NTP Server** | NTP 服务器地址（如 `pool.ntp.org`） |
| **Sync Interval** | 同步间隔 |

操作步骤：

1. **Timezone** 选择部署地时区。
2. **Sync Mode** 选择 **NTP Sync**，填写现场可用的 NTP 服务器地址。
3. 点击 **Sync Now** 立即同步一次。

**完成标准**：点击 **Sync Now** 后无报错；画面 OSD 时间戳与部署地标准时间一致。

## 3. 日志、存储与运维工具

### 3.1 日志查看与采集

日常巡检在 **Maintenance → Logs** 完成，提供三种日志视图：

| 视图 | 内容 |
|------|------|
| **Operation Logs** | 用户登录、应用启停、配置变更等操作记录 |
| **System Logs** | 系统级事件 |
| **Developer Logs** | 开发者调试日志 |

支持按时间范围与关键字筛选；每条记录可点击 **Detail** 查看详情。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-logs.png" />

远程采集与深度排查使用以下途径：

| 途径 | 方法 | 适用场景 |
|:-----|:-----|:---------|
| REST API | `GET /api/v1/apps/<id>/logs`（NDJSON 流） | 远程采集应用日志 |
| SSH | `journalctl -u <服务名>`；平台日志文件位于 `/data/aipc/logs/` | 深度排查平台服务 |

`journalctl` 常用的服务名：app-manager（应用管理）、ai-runtime（AI 推理）、camera-daemon（摄像头）、event-bus（事件总线）。

### 3.2 存储与磁盘空间规划

**Settings → Storage** 页面显示内置存储使用情况，分为 **System**（系统分区，不可修改）与 **Data**（数据分区）两部分。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-storage.png" />

**空间占用参考**（2026-08 固件样机实测）：

| 分区 / 目录 | 容量 | 用途 | 规划建议 |
|:------------|:-----|:-----|:---------|
| 根分区 `/` | 3.3 G（系统占用约 1.8 G） | 系统与只读内容 | 不可写，无需规划 |
| `/data` | 54 G | 数据分区 | 按以下各项合计预留 |
| `/data/aipc/models` | 单个 20 M–3 G | 模型库 | 检测类模型约 20 M，VLM 类约 3 G，按计划导入数量估算 |
| `/data/aipc/images` 与 `apps` | 每应用约 100–450 M | 应用镜像与实例 | 按应用数量估算 |
| `/data/aipc/logs` | 可积累至 >1 G | 平台日志 | 定期清理 |

存储管理要点：

- **告警阈值**：Data 使用率超过 80% 时应清理日志、卸载闲置应用或删除不再使用的模型，也可插入 microSD 卡扩展容量。
- **日志清理**：通过 SSH 执行 `truncate -s 0 /data/aipc/logs/*.log`。
- **录像存储**：当前固件不提供本机录像存储，录像由外部 NVR / VMS 拉流完成（见[视频与成像](../2-user-guide/1-media-and-image.md)）。
- **命令行管理**：使用 `aipc-cli`，常用命令见[设备管理工具](./4-device-management-tools.md)。

### 3.3 运维工具

**Maintenance** 页面另提供三个运维工具：

**文件管理**：浏览与操作设备 `/data/aipc` 文件系统。支持路径导航、Download / Delete / Upload File / New Folder 等操作，每个文件可 Preview / Delete / More。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-file-manager.png" />

**终端**：内置 Web SSH 终端，无需安装客户端即可在浏览器中访问设备命令行。状态显示 **Connected** 即可用。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-maint-terminal.png" />

**进程管理**：列出设备全部运行进程（PID / CPU / 内存 / 状态等），支持按条件搜索，可对异常进程执行 **Kill**。

> 终止平台关键进程（camera-daemon、ai-runtime、platform-api、event-bus）会导致功能异常，需重启恢复，非必要不执行。

## 4. 固件升级与恢复

### 4.1 双层升级机制

NE503 的可升级内容分为两层，相互独立、分别升级：

| 升级项 | 覆盖范围 |
|--------|---------|
| **Firmware Update** | 平台服务、HAL、Web 控制台（应用层） |
| **System OS Update** | Linux 内核、设备树、根文件系统（OS 层） |

进入 **Settings → Device Info**，当前两层版本显示于 **Firmware & Hardware** 区域，各版本旁有 **Update** 按钮。设备基本信息（型号、序列号、MAC、IP）与 Uptime 也在本页查看。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/settings-and-maintenance/qs-settings-device-info.png" />

升级操作：点击对应版本旁的 **Update** → 上传升级包 → 系统自动解析校验并写入 → 完成后自动重启。

**注意**：升级全程约 2–5 分钟，期间严禁断电或操作设备，建议在业务低峰期执行。

### 4.2 升级兼容性校验

升级包安装前需通过平台六道兼容性校验（机型、产品标识、硬件兼容、兼容等级、数据结构、最低恢复版本），任一关卡不匹配，升级包将被自动拒绝，不会写入设备。关卡明细见[版本兼容性矩阵](../3-software-guide/5-version-matrix.md)。

### 4.3 回滚与恢复

| 场景 | 方法 |
|:-----|:-----|
| 平台服务需要回退 | SSH 执行发布包自带 `deploy.sh --rollback` 回滚至上一版本；`--status` 查看当前状态 |
| 系统升级失败 | 设备采用 A/B 双拷贝 + 恢复模式，可从恢复分区引导；机制见开源仓 [os-upgrade.md](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/os-upgrade.md) |
| 需要彻底重置 | 当前固件无一键恢复出厂功能，按[系统烧录](../3-software-guide/2-system-flashing.md)重刷整机；烧录会清除 `/data` 全部数据（模型、应用、日志），执行前必须备份 |
| 接口板 MCU 升级 | MCU 固件单独 OTA（`ne503_ota_package_v<X.Y.Z>.bin`），见开源仓 [baseboard-mcu-rtc-ota.md](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/baseboard-mcu-rtc-ota.md) |

## 5. 生产环境安全基线

交付前必须完成两项安全动作：

- **修改默认凭据**：Web 控制台与 SSH 的默认密码（`admin` / `password`、`root` / `root`）必须在交付前修改，修改流程见[安全加固](./7-security-hardening.md)。
- **最小暴露面**：设备不直接暴露公网，仅放行必要端口与来源 IP，非运维时段可关闭 SSH。

完整端口收口、凭据加固与最小权限配置见[安全加固](./7-security-hardening.md)。
