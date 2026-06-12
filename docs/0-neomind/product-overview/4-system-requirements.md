---
description: NeoMind 桌面端与服务端部署的硬件、操作系统、网络端口与运行时依赖要求，含本地 LLM（Ollama）推荐配置。
keywords: [NeoMind, 系统要求, 部署, 硬件需求, Ollama]
tags: [NeoMind, 产品介绍]
---

# 系统要求

NeoMind 可在桌面（macOS / Windows / Linux）或服务器上运行。以下是各部署方式的具体要求。

## 桌面应用（推荐入门）

通过 [GitHub Releases](https://github.com/camthink-ai/NeoMind/releases/latest) 下载安装包。

| 操作系统 | 架构 | 安装包格式 |
|----------|------|-----------|
| macOS（Apple Silicon + Intel） | arm64 / x86_64 | `.dmg` |
| Windows | x86_64 | `.msi` / `.exe` |
| Linux | x86_64 | `.AppImage` / `.deb` |

**最低硬件**：

- CPU：2 核以上（建议 4 核）
- 内存：**4 GB** 起步；若运行本地 LLM 推荐 **8 GB 及以上**
- 磁盘：1 GB 安装空间 + 数据存储（见下文）

## 服务器部署

### 支持的操作系统

- **Linux**：Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / 其他主流发行版（x86_64 / arm64）
- **macOS**：12 Monterey 及以上（开发或小规模部署）
- **Windows**：Windows 10/Server 2019 及以上（通过 WSL2 或原生）

### 硬件建议

| 场景 | CPU | 内存 | 磁盘 | 说明 |
|------|-----|------|------|------|
| 轻量（仅规则 / 云端 LLM） | 2 核 | 2 GB | 10 GB | 不跑本地模型 |
| **推荐（本地 LLM）** | 4 核 | **8 GB** | 20 GB+ SSD | 跑 `qwen3.5:4b` 等小型模型 |
| 多设备 / 视觉管线 | 8 核 | 16 GB | 50 GB+ SSD | 多路视频流 + YOLO/OCR 扩展 |

> **GPU**：非必需。本地 LLM 与视觉推理通过 Ollama（CPU 模式）即可运行；有 GPU 时 Ollama 会自动加速。

### 网络端口

| 端口 | 协议 | 用途 | 可配置 |
|------|------|------|--------|
| **9375** | HTTP | 后端 API + Web UI（开发模式 `neomind-cli serve` 默认端口） | `--port` / `PORT` 环境变量 |
| **1883** | MQTT | 内置 MQTT Broker（设备接入） | 配置文件 |
| 80 / 443 | HTTP(S) | 反向代理（可选，nginx） | nginx 配置 |

> 生产部署建议用 nginx 反向代理，对外只暴露 80/443，将 9375 / 1883 限制在内网。

### 运行时依赖

服务器部署**无需手动安装额外依赖**——安装脚本会下载静态编译的二进制。可选组件：

- **Ollama**（推荐）：用于本地 LLM 推理。安装见 [ollama.com](https://ollama.com)。首次配置 LLM 后端时需拉取模型，例如 `ollama pull qwen3.5:4b`
- **Docker**（可选）：`docker compose up -d` 一键部署
- **nginx**（可选）：生产环境反向代理 + 静态前端托管

## 数据存储

NeoMind 使用嵌入式存储，**无需外部数据库**。数据目录默认在 `data/`，包含：

| 文件 / 目录 | 用途 |
|------------|------|
| `telemetry.redb` | 时序遥测数据（所有设备指标） |
| `sessions.redb` | 用户会话 |
| `devices.redb` / `dashboards.redb` / `rules.redb` / `agents.redb` | 各业务域主数据 |
| `messages.redb` | 通知消息投递记录 |
| `memory/` | Agent 记忆文件（Markdown） |
| `skills/` | 技能定义（YAML + Markdown） |
| `extensions/` | 扩展二进制与配置 |
| `logs/` | 运行日志 |

可通过环境变量或安装脚本参数自定义数据目录（见 [安装与配置](../user-guide/1-install-setup.md)）。

## 开发环境

从源码构建需要：

| 工具 | 版本 | 用途 |
|------|------|------|
| **Rust** | 1.85+（工具链锁定 1.92.0） | 后端编译 |
| **Node.js** | 20+ | 前端构建 |
| **Ollama** | 任意 | 本地 LLM（或接入云端模型） |

```bash
# 后端
cargo build && cargo test && cargo run -p neomind-cli -- serve

# 桌面 / 前端
cd web && npm install && npm run tauri:dev
```

详见 [开发指南](../developer-guide/1-overview.md)。

## LLM 后端要求

NeoMind 支持多种 LLM 后端，按部署形态分两类：

- **本地**：Ollama（推荐，`qwen3.5:4b` 模型）。需要宿主机有足够内存加载模型。
- **云端**：OpenAI / Anthropic / Google / xAI / Qwen / DeepSeek / GLM / MiniMax 等 OpenAI 兼容端点。仅需 API Key 与出站网络。

配置方法见 [配置 LLM 后端](../user-guide/2-configure-llm.md)。

---

*最后更新: 2026-06-12 · NeoMind v0.8.11*
