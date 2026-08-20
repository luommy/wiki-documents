---
description: NE503 平台软件部署指南，涵盖发布包部署和部署验证。
keywords: [NE503, 部署, deploy.sh, systemd]
tags: [平台开发, NE503, 部署, 运维]
---

# Software Deployment

本文档说明如何将 NE503 平台软件发布包部署到设备上运行。平台软件包括平台服务、HAL 库、Web 控制台等，区别于系统镜像（hailo-os）的烧录 — 后者请参阅 [System Flashing](./2-system-flashing.md)。

> 前置条件：已完成 [Developer Guide](./1-developer-guide.md) 中的环境搭建和构建，产出 `build/release/aipc-hailo15-<version>.tar.gz` 发布包。

## 1. 发布包部署

### 1.1 传输发布包

```bash
scp build/release/aipc-hailo15-<version>.tar.gz root@<device-ip>:/data/
```

### 1.2 执行部署

```bash
ssh root@<device-ip>
# root 分区已满（3.3G、已用 99%），直接在 /data 分区解压
cd /data && tar xzf aipc-hailo15-<version>.tar.gz
cd aipc-hailo15-<version> && ./deploy.sh
```

预期输出（节选关键阶段，省略逐文件 `+ xxx -> ...` 日志）：

```plaintext
[deploy]   AIPC Hot-swap Deploy
[deploy]   Current version:  unknown（首次）或旧版本号
[deploy]   Package version:  1.0.0
[deploy]   Config deploy:    yes
[deploy]   Install prefix:   /data/aipc
Proceed with deployment? [y/N] y
[deploy] [1/8] Creating runtime directories...
[deploy] [2/8] Backing up current installation...
[deploy] [3/8] Stopping services for hot-swap...
[deploy] [4/8] Deploying binaries...
[deploy] [5/8] Deploying firstboot initialization script...
[deploy] [6/8] Deploying HAL libraries...
[deploy] [7/8] Deploying configs and systemd units...
[deploy] [8/8] Starting services...
[deploy] Running health checks (timeout 15s)...
[deploy] Service status:
[deploy]   aipc-healthmon: active
[deploy]   event-bus: active
[deploy]   camera-daemon: active
[deploy]   ai-runtime: active
[deploy]   platform-api: active
[deploy]   app-manager: active
[deploy]   device-control: active
[deploy]   device-discovery: active
[deploy]   Deploy successful!
[deploy]   Version: 1.0.0
```

### 1.3 deploy.sh 参数

| 参数 | 说明 |
|------|------|
| `--force` | 强制部署，跳过确认提示 |
| `--rollback` | 回滚到上一版本 |
| `--status` | 查看当前部署状态 |
| `--no-config` | 跳过配置文件覆盖（保留设备上的配置） |

> 安装路径固定为 `/data/aipc`，不支持自定义（root 分区 3.3G 已用 99%，装不下发布包）。

完整示例：

```bash
./deploy.sh --force              # 强制部署（跳过确认）
./deploy.sh --rollback           # 回滚到上一版本
./deploy.sh --status             # 查看部署状态
```

## 2. 发布包内容

`aipc-hailo15-<version>.tar.gz` 包含以下内容：

| 路径 | 内容 |
|------|------|
| `opt/aipc/bin/` | 平台服务二进制 + CLI + 工具 |
| `opt/aipc/scripts/` | 运维脚本（firstboot / healthmon / logrotate） |
| `opt/aipc/lib/hal/` | HAL 共享库 |
| `opt/aipc/etc/` | YAML 配置 |
| `opt/aipc/etc/security/` | seccomp 策略 |
| `opt/aipc/web/` | Web 控制台 |
| `opt/aipc/swagger-ui/` | API 文档 |
| `opt/aipc/models/` | 模型目录（空，需单独下载） |
| `systemd/` | systemd 服务单元 |
| `deploy.sh` | 热替换部署脚本 |
| `VERSION` | 版本元数据 |

## 3. 部署验证

部署完成后在设备上确认 AIPC 服务正常。先用平台健康端点快速探测 API 存活（`GET /system/health`，公开端点无需鉴权，见 [RESTful API](../4-application-guide/3-reference/3-restful-api.md#3-系统管理)），再确认关键服务 active：

```bash
systemctl status platform-api
```

全部服务列表与启动失败排查见[故障排查 · 服务启动失败](../5-troubleshooting.md#82-服务启动失败)。浏览器访问 `https://<device-ip>`，默认凭据 `admin` / `password`。

## 4. 相关文档

- [Developer Guide](./1-developer-guide.md) — 开发环境搭建和构建
- [System Architecture](./0-system-architecture.md) — 四层架构、数据链路与服务清单（服务启动依赖见其 §3.3）
- [System Flashing](./2-system-flashing.md) — 系统镜像烧录
