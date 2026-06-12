---
description: "NeoMind AI Chat guide: query and control devices in natural language, create dashboards and rules, upload images for visual analysis, and understand the difference between Chat (interactive) and Agent (autonomous)."
keywords: [NeoMind, AI Chat, natural language, multimodal, AI Agent]
tags: [NeoMind, User Guide]
---

# AI Chat

AI Chat is NeoMind's conversational interface — tell it what you want in natural language, the LLM understands intent, calls tools, and returns results. It can query device state, create rules, build dashboards, and trigger notifications.

## Prerequisites

- At least one [LLM backend](./2-configure-llm.md) configured (Ollama or cloud)
- At least one [device](./3-onboard-device.md) onboarded (otherwise Chat is just small talk)

## Entry Point

Click **AI Chat** in the left nav to open the conversation view. You can pick which LLM backend to talk to from the dropdown at the top.

<!-- Screenshot placeholder: AI Chat main view + multimodal upload
     Upload to resources.camthink.ai/wiki/img/ai-application/neomind/user-guide/
     ai-chat-main.png / ai-chat-vision.png
-->

## What You Can Ask

AI Chat has built-in tools covering nearly every NeoMind capability. Typical phrasings (Chinese or English both work):

### Query & Control Devices
- "What's the temperature in the living room?" → latest telemetry
- "Set the AC to 26 degrees, cooling mode" → send a device command
- "Show me the humidity curve over the last 24 hours" → pull history, render a chart

### Dashboards & Visualization
- "Build me a dashboard showing real-time values from all temp/humidity sensors" → create dashboard + auto-add widgets
- "Change this chart's time range to 7 days"

### Automation Rules
- "Email me when the temperature goes above 30°C" → create a [DSL rule](./7-automation-rules.md) and bind a notification channel
- "Report yesterday's energy use every morning at 8 AM"

### Notifications
- "Send a Telegram message to the ops team that machine #3 is offline"

### Extensions & Data
- "Call the weather extension — will it rain in Shanghai tomorrow?"
- "What was the last face recognition result?"

### System & Diagnostics
- "How many devices are online right now?"
- "Why isn't this device reporting data?" → triggers a diagnostic flow

The LLM decides which tools to call and in what order. Complex requests may chain multiple tool calls (NeoMind caps at 30 rounds per turn with a 5-minute timeout).

## Multimodal (Images)

If your LLM backend supports vision (see [Configure an LLM Backend — Multimodal](./2-configure-llm.md#multimodal-vision-capability)), you can **upload images** in Chat:

- Upload a photo: "What objects are in this image?" → vision model or YOLO extension
- Upload a camera snapshot: "Read the digits on this meter" → OCR extension
- Upload a surveillance frame: "Identify the faces in this frame" → face recognition extension

Click the **📎 (attachment)** button next to the input box. PNG / JPG / JPEG / WebP supported.

> **Ollama users**: You must pull a vision model (`qwen3.5:4b-vl` / `llava`) first — otherwise uploaded images are silently dropped. NeoMind auto-detects backend capability and warns you.

## Chat vs Agent: Two Modes

NeoMind's AI has two runtime shapes — easy to confuse at first:

| Dimension | **AI Chat (this doc)** | **AI Agent (autonomous)** |
|-----------|------------------------|---------------------------|
| Trigger | You send a message, real-time | Scheduled or event-driven |
| Context | Conversation history | Memory system (journal + knowledge) |
| Best for | Ad-hoc queries, exploration, debugging | Long-running monitoring, periodic checks, event response |
| Configured in | Just open Chat | Create from the Agents tab |

Examples:
- **Chat**: "What's the temperature of machine #3 right now?" ← one-shot query
- **Agent**: Create an agent that checks machine #3 every hour and notifies you if it crosses a threshold ← long-running automation

Advanced agent configuration is covered in [Automation Rules](./7-automation-rules.md) and the (Phase 2) manage-agents doc.

## Session Management

- **Multiple sessions**: each has independent context. Switch / rename / delete from the left sidebar.
- **Cross-session memory**: NeoMind extracts key facts from conversations (your preferences, device aliases) into user memory, applied across sessions.
- **History**: sessions persist in `sessions.redb`; restarting the server won't lose them.

## Tips

- **Be specific about device identity**: use the device name or ID ("the living-room temp/humidity sensor"). The LLM does fuzzy matching; if multiple devices share a name, use the ID.
- **Break complex tasks into steps**: "First check the humidity; if it's below 40%, turn on the humidifier" is more reliable than one giant instruction.
- **Correct mistakes**: if the LLM misreads your intent, just say "No, I meant machine #2" — no need to start a new session.
- **Tool feedback**: when an LLM tool call fails, it returns an error with a suggestion — follow the hint.

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
