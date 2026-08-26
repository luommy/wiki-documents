---
description: NE503 设备管理工具：CT-Disc 设备发现（协议报文、ct-disc 命令行与 GUI 工具）与 aipc-cli 命令行工具的用法。
keywords: [NE503, CT-Disc, ct-disc, aipc-cli, 设备发现, 命令行, UDP 组播, MQTT]
tags: [用户指南, NE503, 设备管理, 命令行]
---

# Device Management Tools

NE503 的设备管理分两端：**设备端**持续在局域网广播自身信息（CT-Disc 协议，由 device-discovery 服务实现），**你的电脑上**用官方 ct-disc 工具发现和管理这些设备；管理单台设备的细节则用设备自带的 aipc-cli。按你要做的事选择：

| 你要做什么 | 用什么 |
|-----------|--------|
| 批量部署时找到网段里所有设备的 IP 和 SN | ct-disc 扫描工具或 GUI（运行在你的电脑上） |
| 监视设备上下线、远程下发命令 | ct-disc |
| 远程给设备改网络配置 | ct-disc GUI |
| 在**一台**设备上管理应用、码流、模型、镜头 | aipc-cli（设备自带，在设备上运行） |

## CT-Disc 设备发现

### 典型场景：批量部署不再逐台查 IP

部署 10 台 NE503 时，与其在路由器里逐台核对 MAC 对 IP，不如在同网段的电脑上跑一次扫描——所有设备的 IP、SN、固件版本一张表全出来：

```bash
$ ct-disc scan
MAC               SN            PRODUCT   IP              PORT   FW       CAPS              LAST_SEEN
aa:bb:cc:00:11:22 CT503A001234  NE503     192.168.1.101   443    1.12.0   ai,camera,http   2026-08-20 10:32:01
aa:bb:cc:00:11:23 CT503A001235  NE503     192.168.1.102   443    1.12.0   ai,camera,http   2026-08-20 10:32:01

2 device(s) found.
```

它能工作的前提是协议在背后跑着，下面先讲清楚机制，再给全部命令。

### 协议如何工作

设备持续在局域网里"自报家门"：device-discovery 服务每 5 秒向 UDP 组播 `239.255.255.250:19850` 发一个 `ct-announce` JSON 报文。报文里有这些字段：

| 字段 | 你能用它做什么 |
|------|--------------|
| `sn` / `mac` | 唯一标识一台设备，批量登记资产 |
| `product` | 区分产品型号（如 `NE503`） |
| `ip` / `port` | 直接拿去访问 Web 控制台 |
| `fw` | 核对固件版本，找出需要升级的设备 |
| `caps` | 能力列表（如 `ai,camera,http,mqtt`） |
| `hw` | 硬件平台 |

管理端两种方式获知设备：**被动监听**组播地址等广播；**主动扫描**发 `ct-probe` 探测包让设备立即应答。除此之外还有两种报文：

- `ct-set-network`——远程给指定设备下发网络配置（DHCP/静态 IP、网关、DNS），单播 + 组播 + 广播三路发送确保送达；
- CAT1 蜂窝设备不走 UDP，通过 MQTT 注册，命令 topic `ct/cmd/{sn}`、应答 `ct/resp/{sn}`。

### ct-disc 命令行工具

跨平台 CLI（Windows / Linux / macOS），源码在 neoruntime 仓库 `tools/ct-disc/`：

```bash
cd tools/ct-disc && make build        # 本机构建；make build-all 产出全平台二进制
```

五个子命令，各自解决一件事：

| 命令 | 干什么 | 什么时候用 |
|------|--------|-----------|
| `ct-disc scan` | 发探测包，立即收集应答 | 想马上拿到设备清单 |
| `ct-disc list` | 静默监听数秒后列出设备 | 设备已在广播，不想发探测包 |
| `ct-disc watch` | 持续监视上下线 | 部署后观察设备稳定性 |
| `ct-disc send` | 经 MQTT 向指定 SN 下发命令 | 管理 CAT1 蜂窝设备 |
| `ct-disc announce` | 模拟设备广播 | 调试自己的管理端程序 |

```bash
ct-disc scan --timeout 3                        # 扫 3 秒；--count 探测包数（默认 3）
ct-disc list --product NE503 --timeout 5        # 只列 NE503；还可按 --sn / --mac 过滤
ct-disc watch                                   # 30 秒无广播判离线，Ctrl+C 停止
ct-disc send <sn> reboot --broker tcp://broker:1883   # CAT1 设备下发命令
ct-disc announce --product NE503 --interval 5   # 测试机上模拟设备
```

所有命令支持 `-o json` / `-o yaml`（默认 table）供脚本解析，`--iface` 指定网卡，`--timeout` 控制等待时长。

> NE503 的 Web 控制台本身不提供 CT-Disc 扫描界面，扫描由上述工具或集成该协议的上位机完成。报文定义见源码 `tools/ct-disc/pkg/discover/announce.go`。

### CT-Disc GUI

不习惯命令行的话，仓库还提供图形界面（`tools/ct-disc/gui/ct-disc-gui/`，Wails 桌面应用，`make gui` 构建）。功能覆盖 CLI 的扫描、监视、下发命令，并多一项实用能力：**远程读取/修改设备网络配置**——选中设备后直接在 GUI 里改它的 IP 模式、网关、DNS，无需先登录设备 Web 页（底层走设备 API `GET/POST /api/v1/network/config`）。

## aipc-cli 命令行工具

aipc-cli 管理的是**单台设备**：应用启停、码流状态、模型注册、镜头控制等。入口有两个：

- **Web 终端**：控制台 **Maintenance → Terminal**，浏览器里直接用；
- **SSH**：`ssh root@<设备IP>` 登录后使用。

按任务分组的最常用命令：

```bash
# 看设备整体状态
aipc-cli system info              # 设备信息
aipc-cli system health            # 健康检查

# 管理应用
aipc-cli app list                 # 列出应用
aipc-cli app start <id>           # 启动 / aipc-cli app stop <id> 停止
aipc-cli app logs <id> -f         # 实时查看应用日志（排障首选）

# 查码流
aipc-cli stream list              # 各码流状态（拉流失败先看这里）
aipc-cli stream url <id>          # 取码流 RTSP 地址

# 控制镜头
aipc-cli device zoom in 5         # 变焦（in / out / stop，速度 1-10）
aipc-cli device focus auto        # 自动对焦

# 管理模型
aipc-cli model list               # 列出 / aipc-cli model register <path> 注册新模型
```

输出同样支持 `-o table`（默认）/ `-o json` / `-o yaml`。完整命令树以 `aipc-cli --help` 和各子命令的 `<command> --help` 为准。

## 相关文档

- [System Architecture](../3-software-guide/0-system-architecture.md) — device-discovery 服务职责与源码指针
- [Applications and Models](./2-applications-and-models.md) — 应用与模型的 Web 控制台管理
- [Troubleshooting](../5-troubleshooting.md) — 设备问题排查
