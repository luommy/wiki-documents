---
description: "NeoMind notification system guide: configure 7 external channels (Webhook, Email, Telegram, WeCom, DingTalk, Slack, Feishu) plus in-app messages, with delivery tracking, retry, and deduplication."
keywords: [NeoMind, notification, webhook, email, telegram, dingtalk, feishu, wecom, slack]
tags: [NeoMind, User Guide]
---

# Notifications & Messages

NeoMind's notification system pushes device alerts, rule triggers, and system events to you. It supports **7 external channels + in-app messages**, with multi-channel fan-out.

> **Note**: NeoMind does not support SMS notifications. The 7 channels below are the complete current capability set.

## Supported Channels

| Channel | Type | Use Case | Auth |
|---------|------|----------|------|
| **Webhook** | Generic HTTP | Forward to any HTTP endpoint (self-built systems, IFTTT, n8n, etc.) | URL + optional Header / Bearer |
| **Email** | SMTP | Standard email notifications | SMTP username / password |
| **Telegram** | Bot API | Common outside China | Bot Token |
| **WeCom (企业微信)** | Group robot | Chinese enterprise collaboration | Group robot webhook URL |
| **DingTalk (钉钉)** | Custom robot | Chinese enterprise collaboration | Webhook + HMAC-SHA256 signing |
| **Slack** | Incoming Webhook | International teams | Webhook URL |
| **Feishu (飞书)** | Custom robot | Chinese enterprise collaboration | Webhook + HMAC-SHA256 signing |
| **In-App** | Site message | Bell icon top-right + message center in Web UI | None — built in |

## Configure a Channel

Go to **Settings → Message Channels** and click **Add Channel**.

<!-- Screenshot placeholder: channel list + channel editor
     Upload to resources.camthink.ai/wiki/img/ai-application/neomind/user-guide/
     channels-list.png / channel-editor.png
-->

### Required Fields per Channel

**Webhook**:
- URL (required)
- HTTP Method (default POST)
- Custom Headers (optional, e.g. `Authorization: Bearer xxx`)
- Template (defaults to NeoMind's standard message body; customizable JSON template)

**Email**:
- SMTP host, port, username, password, sender
- Recipient list (multiple, comma-separated)

**Telegram**:
- Bot Token (from [@BotFather](https://t.me/BotFather))
- Chat ID (group or private)

**WeCom / DingTalk / Feishu**:
- Group robot webhook URL (add a custom robot in the group settings to get this)
- DingTalk / Feishu: signing secret (in robot security settings, choose "signing" and paste the Secret)

**Slack**:
- Incoming Webhook URL (from Slack App config)

### Test a Channel

After saving, click **Test** to send a test message and confirm the config works. NeoMind shows the delivery result (success / failure + reason).

## How Notifications Are Triggered

Notifications don't fire on their own — they're triggered by other modules:

### 1. Rule Engine (Most Common)

Specify one or more channels in the action of an [automation rule](./7-automation-rules.md):

```
RULE AlertHighTemp
WHEN device("sensor-01").temperature > 30
DO
  notify(channels: ["email", "feishu"], title: "High Temp Alert", message: "...")
END
```

### 2. AI Agent Trigger

Let an [AI Agent](./6-ai-agent.md) decide whether to notify after analysis:

- Scheduled agents: write "Notify the ops team via Telegram when an anomaly is detected" in the prompt
- Agent tool calls auto-route to the right channel

### 3. AI Chat Manual Trigger

Just say in Chat: "Send a Feishu message to the group that machine #3 is offline" — the LLM calls the message tool.

### 4. System Events

Some system events (device offline, extension crash) go to the in-app message center by default; you can enable email / webhook forwarding in Settings.

## Delivery Tracking

NeoMind records the delivery status of every notification:

- **Pending**: queued
- **Sent**: accepted by the channel
- **Delivered**: channel returned success
- **Failed**: channel returned an error or timed out

View history under the **Messages** tab. Failed messages can be manually retried.

### Retry & Deduplication

- **Exponential backoff retry**: failed sends auto-retry (1s → 2s → 4s …), up to 5 attempts
- **Dedup window**: identical (channel, title, content) within a short window (default 60 seconds) is sent only once — prevents notification storms from high-frequency rule triggers
- **Batch digest**: multiple similar alerts can be merged into a digest (advanced config, Phase 2 docs)

## In-App Message Center

The 🔔 bell icon top-right opens the message center:

- Unread count
- Reverse-chronological message feed
- Severity filter (Info / Warning / Error / Critical)
- Mark read / clear

In-app messages require no configuration — they work out of the box.

## Best Practices

- **Multi-channel redundancy**: send critical alerts over both email and Feishu/DingTalk so a single channel failure doesn't drop the alert
- **Tiered notifications**: Critical → all channels; Info → in-app only
- **Template via Webhook**: point a Webhook channel at a unified alerting platform (AlertManager, Home Assistant) and let it handle secondary routing
- **Avoid noise**: tune the dedup window; add `THROTTLE` or cooldown in rules to prevent sensor jitter from flooding channels

## Next Steps

- [Automation Rules](./7-automation-rules.md) — Rules trigger `NOTIFY` actions routed to notification channels
- [AI Agent](./6-ai-agent.md) — Agents decide whether to send notifications after analysis
- [Extensions](./9-extensions.md) — Use Webhook channels to integrate with external systems

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
