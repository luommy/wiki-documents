---
description: "Get NeoMind running in 5 minutes: install → configure LLM → connect first device → see data on dashboard → ask AI Chat. Every step has a success checkpoint."
keywords: [NeoMind, quick start, 5 minutes, getting started]
tags: [NeoMind, Quick Start]
---

# 5-Minute Quick Start

The goal: experience NeoMind's core loop — **device ingress → data visualization → AI conversation** — as fast as possible. Each step has a ✓ checkpoint.

> For full installation options and troubleshooting see [Install & Setup](../user-guide/1-install-setup.md).

---

## Step 1: Install (1 min)

**Desktop app** (recommended for first use):

Download the installer for your platform from [GitHub Releases](https://github.com/camthink-ai/NeoMind/releases/latest), double-click to install, then launch.

**Server deploy**:

```bash
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/install.sh | bash
```

After startup, open `http://localhost:9375` in your browser.

> ✓ **Checkpoint**: you see the login / register page = the server is running.

<!-- screenshot placeholder: login page -->

---

## Step 2: Configure LLM Backend (1 min)

On first launch you'll enter the setup wizard. Choose **Ollama** (local, recommended):

```bash
# If you don't have Ollama yet: https://ollama.com
ollama pull qwen3.5:4b
```

In the wizard:
1. Backend type → **Ollama**
2. URL → `http://localhost:11434` (default)
3. Model → `qwen3.5:4b`

You can also skip local deployment and pick a cloud backend (OpenAI / Anthropic / GLM).

> ✓ **Checkpoint**: wizard shows "LLM backend connected" = the brain is ready.

> See [Configure LLM Backend](../user-guide/2-configure-llm.md).

<!-- screenshot placeholder: LLM config success -->

---

## Step 3: Connect Your First Device (1 min)

The fastest ingress method is **HTTP Webhook** (no MQTT client needed).

In the Web UI **Devices** page, click **Add Device**, select **Webhook**, name it `demo-sensor`. After creation you'll get a webhook URL.

Simulate a device pushing a temperature reading with `curl`:

```bash
curl -X POST http://localhost:9375/api/devices/<DEVICE_ID>/webhook \
  -H 'Content-Type: application/json' \
  -d '{"temperature": 25.6, "humidity": 60}'
```

> ✓ **Checkpoint**: the device detail page shows the latest telemetry values = data is in the database.

> You can also connect real devices via MQTT (built-in broker at `localhost:1883`). See [Onboard Devices](../user-guide/3-onboard-device.md).

<!-- screenshot placeholder: device detail with telemetry -->

---

## Step 4: See Data on the Dashboard (30 sec)

Go to the **Dashboard** page — a default dashboard is auto-created. Click **Edit**, add a **Value Card** widget:

1. Data source → `device:demo-sensor:temperature`
2. Save

The temperature value appears live on the card. Push another webhook payload and watch it update.

> ✓ **Checkpoint**: you see a live temperature reading on the dashboard = visualization loop is working.

> See [Use Dashboard](../user-guide/4-use-dashboard.md).

<!-- screenshot placeholder: dashboard value card -->

---

## Step 5: Ask AI Chat (30 sec)

Open **AI Chat** and type:

> What devices do I have? What's the temperature of demo-sensor?

The AI Agent will query the device list and latest telemetry, then answer in natural language. Try something more ambitious:

> Notify me when temperature exceeds 30

The AI will help you create an automation rule.

> ✓ **Checkpoint**: the AI answered your question = the intelligence loop is complete.

> See [AI Chat](../user-guide/5-ai-chat.md).

<!-- screenshot placeholder: AI Chat conversation -->

---

## Next Steps

Congratulations! You've completed the NeoMind core loop. From here you can:

- [Dive into core concepts](../concepts/1-glossary.md) — Device / Extension / Agent / Rule terminology explained
- [Connect real devices](../user-guide/3-onboard-device.md) — MQTT / BLE / Webhook connection methods
- [Install extensions](../developer-guide/1-overview.md) — Object detection, OCR, face recognition AI capabilities
- [Browse use cases](../use-cases/1-object-detection.md) — Scenario-driven end-to-end tutorials

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
