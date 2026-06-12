---
description: "Configure LLM backends in NeoMind: local Ollama (recommended qwen3.5:4b) and cloud models (OpenAI/Anthropic/Qwen/DeepSeek/GLM etc.) — setup steps, model selection, and multimodal capability."
keywords: [NeoMind, LLM, Ollama, qwen3.5, model config, multimodal]
tags: [NeoMind, User Guide]
---

# Configure an LLM Backend

NeoMind's AI agents and AI Chat rely on an LLM backend to understand natural language and execute instructions. This guide covers configuring a local or cloud LLM.

## Backend Overview

NeoMind supports 10+ LLM backends in two deployment modes:

| Category | Backend | Default Model | Notes |
|----------|---------|---------------|-------|
| **Local** (recommended) | Ollama | `qwen3.5:4b` | Default backend, fully offline |
| Local | llama.cpp | loaded at server startup | Self-hosted llama-server |
| **Cloud** | OpenAI | `gpt-4o-mini` | API key required |
| Cloud | Anthropic | `claude-3-5-sonnet` | API key required |
| Cloud | Google | `gemini-1.5-flash` | API key required |
| Cloud | xAI | `grok-beta` | API key required |
| Cloud | Qwen (Alibaba) | `qwen-max-latest` | DashScope key required |
| Cloud | DeepSeek | `deepseek-v3` | API key required |
| Cloud | GLM (Zhipu) | `glm-4-plus` | API key required |
| Cloud | MiniMax | `m2-1-19b` | API key required |
| Cloud | Custom | any | OpenAI-compatible endpoint |

> **Recommendation**: Start with Ollama + `qwen3.5:4b` (4B params — balances speed and quality, runs smoothly on 8 GB RAM). Add a cloud backend when you need more power or multimodal.

## Configure Ollama (Local, Recommended)

### 1. Install Ollama

Install from [ollama.com](https://ollama.com). After install, Ollama listens on `http://localhost:11434` by default.

### 2. Pull a Model

```bash
# Recommended model (Chinese + tool calling + 128K context)
ollama pull qwen3.5:4b

# For vision (image understanding), also pull a vision model
ollama pull qwen3.5:4b-vl   # or llava / minicpm-v
```

> **Note**: Use `qwen3.5:4b`. Older docs mentioning `ministral-3:3b` / `deepseek-r1:7b` are outdated — the former has unstable tool calling, the latter is too heavy for edge hardware.

### 3. Add the Backend in NeoMind

Go to **Settings → LLM Backends** and click **Add Backend**:

| Field | Value |
|-------|-------|
| Type | Ollama |
| Endpoint | `http://localhost:11434` (default; use the host IP for a remote machine) |
| Model | `qwen3.5:4b` (must match the name used in `ollama pull`) |
| Stream | On (recommended for streaming output) |

On save, NeoMind probes the backend's capabilities (tool calling, multimodal, context window) and auto-tags them.

<!-- Screenshot placeholder: LLM backend add form + backend list
     Upload to resources.camthink.ai/wiki/img/ai-application/neomind/user-guide/
     llm-backend-add.png / llm-backend-list.png
-->

### 4. Ollama API Endpoint

NeoMind calls Ollama's **native `/api/chat` endpoint** (NOT `/v1/chat/completions`). This means:

- The `thinking` field is supported (chain-of-thought for reasoning models like qwen3.x / deepseek-r1)
- Native multimodal (image input) is supported
- Streaming and tool calling use the Ollama native protocol

If you test with `curl`, use the right endpoint:

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3.5:4b",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": false
}'
```

## Configure a Cloud Backend

The flow is the same for all providers — OpenAI shown here.

Go to **Settings → LLM Backends → Add Backend**:

| Field | Value |
|-------|-------|
| Type | OpenAI (or Anthropic / Google / Qwen / …) |
| API Key | Your key (e.g. `sk-...`) |
| Base URL | Leave blank for official; fill in for a custom gateway |
| Model | `gpt-4o-mini` (or `gpt-4o` / `gpt-4-turbo`) |

**Chinese providers**: Qwen / DeepSeek / GLM / MiniMax all speak the OpenAI-compatible protocol. NeoMind has their default endpoints built in — just supply the API key and model name.

### Custom OpenAI-Compatible Endpoint

For vLLM, Together AI, OpenRouter, or any self-built gateway, choose **Custom** and provide:

- `base_url`: gateway address (e.g. `https://api.openrouter.ai/v1`)
- `api_key`: gateway key
- `model`: model name exposed by the gateway

## Multimodal (Vision) Capability

NeoMind supports image input and visual analysis. Enabling vision depends on the model:

- **Ollama**: After pulling a vision model (`qwen3.5:4b-vl` / `llava` / `minicpm-v`), you can upload images directly in [AI Chat](./5-ai-chat.md).
- **Cloud**: `gpt-4o` / `gpt-4o-mini` / `claude-3-5-sonnet` / `gemini-1.5-flash` / `qwen-vl` / `glm-4v` natively support vision.

NeoMind auto-detects multimodal capability (via the LiteLLM registry + `/api/show` runtime probe + name heuristic). If auto-detection is off, you can manually override the **Multimodal** toggle on the backend detail page.

## Set the Default Backend

A NeoMind instance can have **multiple LLM backends**, but only one is marked **default**. The default backend is used for:

- Initial AI Chat conversations
- Scheduled agent execution
- LLM analysis inside the rule engine

Click **Set Default** in the backend list to switch.

## Verify the Configuration

Once configured, open **AI Chat** and send a simple greeting ("Hello") to verify the LLM responds. If it fails:

- Check Ollama is running: `ollama list` should show the pulled models
- Check network and firewall (cloud backends need outbound access)
- Verify the API key is valid
- See [Troubleshooting](./10-troubleshooting.md) for more

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
