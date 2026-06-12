---
description: "NeoMind AI Agent 使用指南：自主智能体的概念、执行模式（Focused/Free）、调度方式（定时/事件/间隔）、资源绑定、记忆系统与状态管理。"
keywords: [NeoMind, AI Agent, 自主智能体, 定时执行, 事件触发, 记忆系统]
tags: [NeoMind, 用户指南]
---

# AI Agent 自主智能体

AI Agent 是 NeoMind 的**自主执行模式**——你设定目标和触发条件，Agent 按计划或事件自动运行，收集数据、调用 LLM 分析、执行动作。与 [AI Chat](./5-ai-chat.md) 的区别：

| 维度 | AI Chat（交互对话） | AI Agent（自主智能体） |
|------|---------------------|----------------------|
| 触发方式 | 你发消息，实时交互 | 按计划 / 事件自动触发 |
| 上下文 | 会话历史 | 记忆系统（journal + knowledge） |
| 适用场景 | 临时查询、探索、调试 | 长期监控、定时巡检、事件响应 |
| 配置入口 | 直接进 Chat 页 | Agents 页签新建 |

## 前置条件

- 已配置 [LLM 后端](./2-configure-llm.md)（Agent 需要调用 LLM）
- 已接入[设备](./3-onboard-device.md)（Agent 需要数据源）

## 创建 Agent

进入 **Agents** 页签，点击 **Create Agent**，填写以下核心字段：

### 1. 名称与 Prompt

- **名称**：1–100 字符，便于识别（如「能耗巡检」「设备健康监测」）
- **User Prompt（用户提示词）**：告诉 Agent 要做什么。1–10000 字符。

示例 prompt：

> 检查所有温湿度传感器的最新数据。如果任何传感器温度超过 35°C，通过飞书通知运维组，并在仪表板上记录告警。如果所有设备正常，简短汇报即可。

### 2. 执行模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **Focused（聚焦模式）** | 绑定指定资源，Agent 在定义范围内工作，单次分析，token 高效 | 监控、告警、数据分析 |
| **Free（自由模式）** | 不绑定资源，LLM 自由探索，可调用全部工具，多轮推理 | 复杂自动化、设备控制、探索性任务 |

**Focused 模式**需要绑定资源（设备指标 / 扩展指标 / 设备 / 扩展工具），Agent 只收集和分析绑定范围内的数据。Scope 校验会拒绝超出绑定范围的指令。

**Free 模式**无需绑定资源，LLM 拥有全部工具（device / rule / message / extension / shell 等），可做多轮工具调用（默认上限 30 轮，5 分钟超时）。

### 3. 调度方式

Agent 按调度方式自动触发执行：

| 调度类型 | 说明 | 配置 |
|---------|------|------|
| **Cron（定时表达式）** | 按 cron 表达式触发 | `schedule_type: "cron"`, `cron_expression: "0 */5 * * * *"` |
| **Interval（固定间隔）** | 每隔 N 秒执行 | `schedule_type: "interval"`, `interval_seconds: 300` |
| **Event（事件触发）** | 设备数据变化 / 告警时触发 | `schedule_type: "event"` |

**Cron 示例**：
- 每小时：`0 0 * * * *`
- 每天早上 8 点：`0 8 * * *`
- 每 5 分钟：`0 */5 * * * *`

**事件触发**：当设备推送新数据或系统产生告警时自动执行。适合实时响应场景（如异常检测后立即分析）。事件触发有 60 秒去重窗口，防止事件风暴。

### 4. LLM 后端

每个 Agent 可绑定独立的 LLM 后端。与 Chat 模型解耦——切换 Chat 模型不会影响 Agent 配置。建议：
- **简单监控**：本地小模型（`qwen3.5:4b`），降低延迟和成本
- **复杂分析**：大模型（`qwen3.5:32b` / 云端模型），提高推理质量

## Agent 记忆系统

Agent 有独立的记忆系统，跨执行周期积累经验：

### Journal（执行日志）

每次执行写入一条 journal 条目，记录：
- 执行时间与触发方式
- 收集的数据摘要
- LLM 分析结论
- 执行的动作（`action_taken`）
- 成功 / 失败状态

Agent 下次执行时读取最近 N 条 journal，学习历史模式（避免重复失败动作、调整阈值、跳过已发送的告警）。

### Knowledge Files（知识文件）

Agent 的持久知识，Markdown 格式：
- **identity.md** — Agent 身份与职责
- **mission.md** — 任务目标与约束
- **resources.md** — 绑定资源说明
- **schedule.md** — 执行计划

首次执行时自动初始化。你可以手动编辑这些文件来微调 Agent 行为（在 Agent 设置 → Knowledge 面板）。

### User Messages（用户反馈）

你可以给 Agent 留言（在 Agent 详情页 → User Messages），Agent 下次执行时会读取。用于纠正 Agent 行为或提供额外上下文。自动保留最近 50 条。

## 执行流程

```mermaid
flowchart LR
    A[调度触发] --> B[收集绑定资源数据]
    B --> C[读取 Journal + Knowledge]
    C --> D[构建 Prompt]
    D --> E[LLM 分析]
    E --> F{需要工具调用?}
    F -- 是 --> G[执行工具]
    G --> E
    F -- 否 --> H[输出分析结果]
    H --> I[执行决策动作]
    I --> J[写入 Journal]
    J --> K[更新 Knowledge]
```

## 状态管理

| 状态 | 说明 |
|------|------|
| **Active** | Agent 激活中，按计划自动执行 |
| **Paused** | Agent 已暂停，不会自动触发（可手动执行） |

暂停 / 激活会同步到调度器——暂停即取消调度，激活即恢复调度。

### 手动执行

不想等定时触发？点击 Agent 详情页的 **Run Now** 立即执行一次。

## 典型场景

### 场景 1：每小时温度巡检（Focused + Cron）

- **模式**：Focused
- **资源**：绑定 3 个温度传感器指标
- **调度**：Cron `0 0 * * * *`（每小时）
- **Prompt**：检查所有温度传感器最新读数。超过 35°C 发飞书通知，超过 45°C 发 Telegram + 邮件。

### 场景 2：事件驱动的异常诊断（Free + Event）

- **模式**：Free
- **资源**：无需绑定（自由探索）
- **调度**：Event（设备数据变化触发）
- **Prompt**：分析刚到的数据是否异常。如果异常，查询相关设备历史数据，判断是否需要告警或自动修复。可调用 shell 工具检查系统状态。

### 场景 3：每日能耗报告（Focused + Cron）

- **模式**：Focused
- **资源**：绑定能耗指标
- **调度**：Cron `0 8 * * *`（每天 8 点）
- **Prompt**：汇总昨日 24 小时的能耗数据，计算峰值和平均值，与上周同期对比，生成日报并发送到运维邮箱。

## CLI 管理

```bash
# 列出所有 Agent
neomind agent list

# 查看 Agent 详情
neomind agent get <agent_id>

# 激活 / 暂停
neomind agent status <agent_id> --status active
neomind agent status <agent_id> --status paused

# 手动触发执行
neomind agent run <agent_id>
```

## 并发与超时

- **全局并发**：最多 10 个 Agent 同时执行
- **单 LLM 后端并发**：每个后端最多 2 个并发请求
- **全局超时**：每次执行最多 5 分钟（300 秒）
- **工具超时**：Shell 30 秒（最长 600 秒），Web 请求 15 秒，扩展 300 秒

如果并发已满，调度器会跳过本次执行（下次 tick 重试）。

## 提示词技巧

- **明确输出期望**：「生成一段 200 字以内的摘要」比「分析数据」更可控
- **给条件分支**：「如果温度 > 35 发飞书；如果 > 45 同时发 Telegram 和邮件」
- **引用设备名**：「检查 sensor-01 到 sensor-03」比「检查所有传感器」更精确
- **利用记忆**：Agent 会读 journal，所以可以写「如果上次已发过相同告警，不要重复发送」

## 与其他模块联动

| 模块 | 说明 |
|------|------|
| [自动化规则](./7-automation-rules.md) | 规则的 `TRIGGER_AGENT` 动作可触发 Agent |
| [通知](./8-notifications.md) | Agent 分析后决定是否发通知 |
| [设备](./3-onboard-device.md) | Focused 模式绑定设备指标 |
| [AI Chat](./5-ai-chat.md) | 两种 AI 运行形态，互为补充 |

---

*最后更新: 2026-06-13 · NeoMind v0.8.11*
