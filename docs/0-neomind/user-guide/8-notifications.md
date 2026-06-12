---
description: "NeoMind 通知系统使用指南：配置 7 个外部通知渠道（Webhook、邮件、Telegram、企业微信、钉钉、Slack、飞书）与应用内消息，含投递跟踪、重试与去重。"
keywords: [NeoMind, 通知, webhook, 邮件, telegram, 钉钉, 飞书, 企业微信, slack]
tags: [NeoMind, 用户指南]
---

# 通知与消息

NeoMind 通过通知系统把设备告警、规则触发、系统事件推送给你。支持 **7 个外部渠道 + 应用内消息**，可同时多渠道分发。

> **注意**：NeoMind 不支持短信（SMS）通知。以下 7 个渠道是当前完整能力清单。

## 支持的渠道

| 渠道 | 类型 | 用途 | 鉴权方式 |
|------|------|------|---------|
| **Webhook** | 通用 HTTP | 转发到任意 HTTP 端点（自建系统、IFTTT、n8n 等） | URL + 可选 Header / Bearer |
| **Email（邮件）** | SMTP | 标准邮件通知 | SMTP 用户名 / 密码 |
| **Telegram** | Bot API | 海外团队常用 | Bot Token |
| **企业微信（WeCom）** | 群机器人 | 国内企业协作 | 群机器人 Webhook URL |
| **钉钉（DingTalk）** | 自定义机器人 | 国内企业协作 | Webhook + 加签 HMAC-SHA256 |
| **Slack** | Incoming Webhook | 国际团队协作 | Webhook URL |
| **飞书（Feishu）** | 自定义机器人 | 国内企业协作 | Webhook + 加签 HMAC-SHA256 |
| **应用内（In-App）** | 站内消息 | Web UI 右上角铃铛、消息中心 | 无需配置 |

## 配置渠道

进入 **Settings（设置） → Message Channels（消息渠道）**，点击 **Add Channel（添加渠道）**。

<!-- 截图占位符：消息渠道列表 + 渠道编辑
     建议上传 resources.camthink.ai/wiki/img/ai-application/neomind/user-guide/
     channels-list.png / channel-editor.png
-->

### 各渠道所需字段

**Webhook**：
- URL（必填）
- HTTP Method（默认 POST）
- 自定义 Headers（可选，如 `Authorization: Bearer xxx`）
- 模板（默认发送 NeoMind 标准消息体；可自定义 JSON 模板）

**Email**：
- SMTP 主机、端口、用户名、密码、发件人
- 收件人列表（可填多个，逗号分隔）

**Telegram**：
- Bot Token（从 [@BotFather](https://t.me/BotFather) 获取）
- Chat ID（群组或私聊）

**企业微信 / 钉钉 / 飞书**：
- 群机器人 Webhook URL（在群设置中添加自定义机器人获取）
- 钉钉 / 飞书：加签密钥（机器人安全设置选「加签」，复制 Secret 填入）

**Slack**：
- Incoming Webhook URL（从 Slack App 配置获取）

### 测试渠道

保存渠道后，点击 **Test（测试）** 发送一条测试消息，确认配置生效。NeoMind 会显示投递结果（成功 / 失败 + 原因）。

## 触发通知的方式

通知不是孤立功能，它由其他模块**触发**：

### 1. 规则引擎触发（最常用）

在 [自动化规则](./7-automation-rules.md) 的动作里指定一个或多个渠道：

```
RULE AlertHighTemp
WHEN device("sensor-01").temperature > 30
DO
  notify(channels: ["email", "feishu"], title: "高温告警", message: "...")
END
```

### 2. AI Agent 触发

让 [Agent](./5-ai-chat.md) 在分析后决定是否发通知：

- 计划型 Agent 可在 prompt 里写「检测到异常时通过 Telegram 通知运维组」
- Agent 工具调用会自动路由到对应渠道

### 3. AI Chat 手动触发

直接在 Chat 里说「发一条飞书消息告诉组里 3 号机离线了」，LLM 会调用 message 工具。

### 4. 系统事件

部分系统级事件（如设备掉线、扩展崩溃）默认进应用内消息中心，可在 Settings 中开关邮件/Webhook 转发。

## 投递跟踪

NeoMind 记录每条通知的投递状态：

- **Pending（待发）**：进入队列
- **Sent（已发送）**：渠道已接收
- **Delivered（已投递）**：渠道返回成功
- **Failed（失败）**：渠道返回错误或超时

在 **Messages（消息）** 页签查看历史。失败的消息可手动重发。

### 重试与去重

- **指数退避重试**：失败自动重试（间隔 1s → 2s → 4s …），最多 5 次
- **去重窗口**：同一 (channel, title, content) 在短时间内（默认 60 秒）只发一次，防止规则高频触发引发通知风暴
- **批量合并**：多条同质告警可合并为摘要（高级配置，Phase 2 文档）

## 消息中心（应用内）

Web UI 右上角的 🔔 铃铛打开消息中心，显示：

- 未读消息计数
- 按时间倒序排列的消息流
- 严重度筛选（Info / Warning / Error / Critical）
- 标记已读 / 清除

应用内消息无需配置，开箱即用。

## 最佳实践

- **多渠道冗余**：关键告警同时发邮件 + 飞书/钉钉，避免单一渠道失败漏报
- **分级通知**：Critical 走所有渠道，Info 只进应用内
- **模板化**：用 Webhook 渠道对接统一告警平台（如 AlertManager、Home Assistant），由平台负责二次路由
- **避免噪声**：合理设置去重窗口；规则里加 `THROTTLE` 或冷却时间，防止传感器抖动刷屏

---

*最后更新: 2026-06-12 · NeoMind v0.8.11*
