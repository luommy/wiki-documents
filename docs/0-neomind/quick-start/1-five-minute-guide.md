---
description: "5 分钟快速上手 NeoMind：安装 → 配置 LLM → 连接第一个设备 → 在仪表板看数据 → 用 AI Chat 提问。每步都有成功检查点。"
keywords: [NeoMind, 快速开始, 5 分钟, 快速上手, 初体验]
tags: [NeoMind, 快速开始]
---

# 5 分钟快速上手

目标是让你在最短时间内体验 NeoMind 的核心闭环：**设备接入 → 数据可视化 → AI 对话**。每一步都有 ✓ 检查点，完成即代表成功。

> 完整安装选项与排障见 [安装与配置](../user-guide/1-install-setup.md)。

---

## Step 1：安装（1 分钟）

**桌面应用**（推荐入门）：

从 [GitHub Releases](https://github.com/camthink-ai/NeoMind/releases/latest) 下载对应平台的安装包，双击安装后启动。

**服务器部署**：

```bash
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/install.sh | bash
```

启动后浏览器访问 `http://localhost:9375`。

> ✓ **检查点**：看到登录 / 注册页面 = 服务已运行。

<!-- 截图占位符：登录页面 -->

---

## Step 2：配置 LLM 后端（1 分钟）

首次启动进入配置向导。选择 **Ollama**（本地运行，推荐）：

```bash
# 如果还没装 Ollama，先安装：https://ollama.com
ollama pull qwen3.5:4b
```

在向导中：
1. 选择后端类型 → **Ollama**
2. 地址填 `http://localhost:11434`（默认）
3. 模型选 `qwen3.5:4b`

也可跳过本地部署，直接选 OpenAI / Anthropic / GLM 等云端后端。

> ✓ **检查点**：向导显示"LLM 后端已连接" = 大脑已就位。

> 详见 [配置 LLM 后端](../user-guide/2-configure-llm.md)。

<!-- 截图占位符：LLM 配置成功界面 -->

---

## Step 3：连接第一个设备（1 分钟）

最快的接入方式是 **HTTP Webhook**（无需 MQTT 客户端）。

在 Web UI 的 **设备** 页面，点 **添加设备**，选择 **Webhook**，命名 `demo-sensor`。创建后会得到一个 webhook URL。

用 `curl` 模拟设备推送一条温度数据：

```bash
curl -X POST http://localhost:9375/api/devices/<DEVICE_ID>/webhook \
  -H 'Content-Type: application/json' \
  -d '{"temperature": 25.6, "humidity": 60}'
```

> ✓ **检查点**：设备详情页显示最新遥测值 = 数据已入库。

> 也可以通过 MQTT（内置 Broker `localhost:1883`）连接真实设备。详见 [接入设备](../user-guide/3-onboard-device.md)。

<!-- 截图占位符：设备详情页显示遥测数据 -->

---

## Step 4：在仪表板看数据（30 秒）

进入 **仪表板** 页面，默认仪表板已自动创建。点 **编辑**，添加一个 **数值卡** 组件：

1. 数据源选 `device:demo-sensor:temperature`
2. 保存

温度值实时显示在卡片上。再推一条 webhook 数据，数值会刷新。

> ✓ **检查点**：仪表板上看到实时温度数值 = 可视化闭环打通。

> 详见 [使用仪表板](../user-guide/4-use-dashboard.md)。

<!-- 截图占位符：仪表板数值卡 -->

---

## Step 5：用 AI Chat 提问（30 秒）

打开 **AI Chat**，输入：

> 我有哪些设备？demo-sensor 的温度是多少？

AI Agent 会自动查询设备列表和最新遥测值，用自然语言回答。试试更有挑战性的：

> 温度超过 30 度时通知我

AI 会帮你创建一条自动化规则。

> ✓ **检查点**：AI 回答了你的问题 = 智能闭环完成。

> 详见 [AI Chat](../user-guide/5-ai-chat.md)。

<!-- 截图占位符：AI Chat 对话界面 -->

---

## 下一步

恭喜！你已完成 NeoMind 核心闭环。接下来可以：

- [深入了解核心概念](../concepts/1-glossary.md) — Device / Extension / Agent / Rule 等术语详解
- [接入真实设备](../user-guide/3-onboard-device.md) — MQTT / BLE / Webhook 全连接方式
- [安装扩展](../developer-guide/1-overview.md) — 物体检测、OCR、人脸识别等 AI 能力
- [浏览应用案例](../use-cases/1-object-detection.md) — 从场景出发的完整实战

---

*最后更新: 2026-06-12 · NeoMind v0.8.11*
