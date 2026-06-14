---
description: 在 NeoMind 中配置 LLM 后端：本地 Ollama（推荐 qwen3.5:4b）与云端模型（OpenAI/Anthropic/Qwen/DeepSeek/GLM 等）的接入步骤、模型选择与多模态能力说明。
keywords: [NeoMind, LLM, Ollama, qwen3.5, 模型配置, 多模态]
tags: [NeoMind, 用户指南]
sidebar_label: "Configure LLM Backend"
---

# 配置 LLM 后端

NeoMind 的 AI Agent 与 AI Chat 依赖 LLM 后端理解自然语言并执行指令。本文介绍如何在 NeoMind 中配置本地或云端 LLM。

## 后端总览

NeoMind 支持 10+ 种 LLM 后端，按部署形态分两类：

| 类别 | 后端 | 默认模型 | 备注 |
|------|------|---------|------|
| **本地**（推荐入门） | Ollama | `qwen3.5:4b` | 默认后端，完全离线 |
| 本地 | llama.cpp | 启动时加载 | 自托管 llama-server |
| **云端** | OpenAI | `gpt-4o-mini` | 需 API Key |
| 云端 | Anthropic | `claude-3-5-sonnet` | 需 API Key |
| 云端 | Google | `gemini-1.5-flash` | 需 API Key |
| 云端 | xAI | `grok-beta` | 需 API Key |
| 云端 | Qwen（阿里） | `qwen-max-latest` | 需 DashScope Key |
| 云端 | DeepSeek | `deepseek-v3` | 需 API Key |
| 云端 | GLM（智谱） | `glm-4-plus` | 需 API Key |
| 云端 | MiniMax | `m2-1-19b` | 需 API Key |
| 云端 | Custom | 任意 | OpenAI 兼容端点 |

> **推荐**：本地用 Ollama + `qwen3.5:4b`（4B 参数，平衡速度与效果，8GB 内存可流畅运行）。需要更强能力或多模态时再接入云端。

## 配置 Ollama（本地，推荐）

### 1. 安装 Ollama

按 [ollama.com](https://ollama.com) 指引安装。安装后 Ollama 默认监听 `http://localhost:11434`。

### 2. 拉取模型

```bash
# 推荐模型（中文 + 工具调用 + 128K 上下文）
ollama pull qwen3.5:4b

# 如需视觉能力（可读图），额外拉取视觉模型
ollama pull qwen3.5:4b-vl   # 或 llava / minicpm-v 等
```

> **注意**：请使用 `qwen3.5:4b`。文档历史版本提到的 `ministral-3:3b` / `deepseek-r1:7b` 已不再推荐——前者工具调用不稳定，后者体积过大且在边缘硬件上速度欠佳。

### 3. 在 NeoMind 中添加后端

进入 **Settings（设置） → LLM Backends（LLM 后端）**，点击 **Add Backend（添加后端）**：

| 字段 | 值 |
|------|-----|
| 类型 | Ollama |
| Endpoint | `http://localhost:11434`（默认；远程主机替换为对应 IP） |
| 模型 | `qwen3.5:4b`（与 `ollama pull` 的名称一致） |
| Stream | 开启（推荐，流式输出体验更好） |

保存后 NeoMind 会探测后端能力（工具调用、多模态、上下文窗口），自动写入能力标签。

<!-- 截图占位符：LLM 后端添加表单 + 后端列表
     建议上传 resources.camthink.ai/wiki/img/ai-application/neomind/user-guide/
     llm-backend-add.png / llm-backend-list.png
-->

### 4. Ollama API 端点说明

NeoMind 调用 Ollama 的**原生 `/api/chat` 端点**（不是 `/v1/chat/completions`）。这意味着：

- 支持 `thinking` 字段（推理类模型如 qwen3.x / deepseek-r1 的思维链）
- 支持原生多模态（图像输入）
- 流式输出与工具调用走 Ollama 原生协议

如果你在自测时用 `curl`，请注意调用正确的端点：

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.5:4b",
  "messages": [{"role": "user", "content": "你好"}],
  "stream": false
}'
```

## 配置云端后端

以 OpenAI 为例，其他厂商流程相同。

进入 **Settings → LLM Backends → Add Backend**：

| 字段 | 值 |
|------|-----|
| 类型 | OpenAI（或 Anthropic / Google / Qwen / …） |
| API Key | 你的 API Key（如 `sk-...`） |
| Base URL | 留空用官方；自建网关时填自定义端点 |
| 模型 | `gpt-4o-mini`（或 `gpt-4o` / `gpt-4-turbo` 等） |

**国内厂商**：Qwen / DeepSeek / GLM / MiniMax 均使用 OpenAI 兼容协议，NeoMind 内置各厂商的默认 endpoint，只需填 API Key 与模型名即可。

### 自定义 OpenAI 兼容端点

如果你用的是 vLLM、Together AI、OpenRouter 等自建或第三方网关，选 **Custom**，填入：

- `base_url`：网关地址（如 `https://api.openrouter.ai/v1`）
- `api_key`：网关 Key
- `model`：网关暴露的模型名

## 多模态（视觉）能力

NeoMind 支持图像输入与视觉分析。视觉能力的启用取决于模型：

- **Ollama**：拉取视觉模型（如 `qwen3.5:4b-vl` / `llava` / `minicpm-v`）后，在 [AI Chat](./5-ai-chat.md) 中可直接上传图片提问。
- **云端**：`gpt-4o` / `gpt-4o-mini` / `claude-3-5-sonnet` / `gemini-1.5-flash` / `qwen-vl` / `glm-4v` 等天然支持视觉。

NeoMind 会自动探测模型的多模态能力（通过 LiteLLM 注册表 + `/api/show` 运行时探测 + 名称启发式匹配）。如果自动探测不准，可在后端详情页手动覆盖 **Multimodal** 开关。

## 设置默认后端

一个 NeoMind 实例可配置**多个 LLM 后端**，但只有一个被标记为**默认**。默认后端用于：

- AI Chat 的初始对话
- 计划型 Agent 的执行
- 规则引擎中的 LLM 分析

在后端列表中点击 **Set Default（设为默认）** 切换。

## 验证配置

配置完成后，进入 **AI Chat**，发送一句简单问候（如「你好」）验证 LLM 响应正常。如果失败：

- 检查 Ollama 是否在运行：`ollama list` 应能看到已拉取的模型
- 检查网络与防火墙（云端后端需要出站访问）
- 检查 API Key 是否有效
- 更多见 [故障排查](./10-troubleshooting.md)

## 下一步

- [接入设备](./3-onboard-device.md) — 让 NeoMind 开始接收遥测数据
- [使用仪表板](./4-use-dashboard.md) — 可视化你的设备数据
- [AI Chat](./5-ai-chat.md) — 用自然语言查询设备状态

*最后更新: 2026-06-12 · NeoMind v0.8.11*
