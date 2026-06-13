---
description: "NeoMind 自动化规则引擎使用指南：JSON 规则结构、条件（comparison/range/logical）、动作（notify/execute/trigger_agent）、触发方式（data_change/schedule/manual），含 UI、CLI、API 创建示例。"
keywords: [NeoMind, 规则引擎, 自动化, JSON, 条件, 动作, 定时, 告警, 联动]
tags: [NeoMind, 用户指南]
---

# 自动化规则

规则引擎让 NeoMind 在**无人值守**时自动响应：设备数据越过阈值 → 自动通知、下发指令、触发 AI Agent。规则以 JSON 格式定义，通过 Web UI、CLI、REST API 或 AI Chat 创建。

## 快速理解

一条规则由四部分组成——**名称**、**触发器**、**条件**、**动作**（可选持续时间与冷却）：

```json
{
  "name": "高温告警",
  "trigger": { "trigger_type": "data_change" },
  "condition": {
    "condition_type": "comparison",
    "source": "device:sensor-01:temperature",
    "operator": "greater_than",
    "threshold": 30
  },
  "actions": [
    { "type": "notify", "message": "温度过高：{value}°C", "severity": "critical" }
  ]
}
```

## JSON 结构详解

### 条件（condition）

条件决定规则何时触发。支持三种类型：

**比较条件（comparison）**：

```json
{
  "condition_type": "comparison",
  "source": "device:sensor-01:temperature",
  "operator": "greater_than",
  "threshold": 30
}
```

| 运算符 | 含义 |
|--------|------|
| `greater_than` | 大于 |
| `less_than` | 小于 |
| `greater_equal` | 大于等于 |
| `less_equal` | 小于等于 |
| `equal` | 等于 |
| `not_equal` | 不等于 |
| `contains` | 包含（字符串） |
| `starts_with` | 前缀匹配（字符串） |
| `ends_with` | 后缀匹配（字符串） |
| `regex` | 正则匹配（字符串） |

`source` 使用 DataSourceId 格式 `{type}:{id}:{field}`，如 `device:sensor-01:temperature` 或 `extension:weather:temp`。字符串比较运算符（`contains`/`starts_with`/`ends_with`/`regex`）使用 `threshold_value` 字段指定匹配文本，而非数字 `threshold`。

**范围条件（range）**——值在某区间内时触发：

```json
{
  "condition_type": "range",
  "source": "device:sensor-01:temperature",
  "min": 20,
  "max": 25
}
```

**逻辑组合（logical）**——AND / OR / NOT：

```json
{
  "condition_type": "logical",
  "operator": "and",
  "conditions": [
    { "condition_type": "comparison", "source": "device:sensor-01:temperature", "operator": "greater_than", "threshold": 30 },
    { "condition_type": "comparison", "source": "device:sensor-01:humidity", "operator": "less_than", "threshold": 20 }
  ]
}
```

### 触发器（trigger）

| 触发类型 | 说明 | JSON |
|---------|------|------|
| **数据变化（data_change）** | 条件引用的指标有新数据时自动评估 | `{"trigger_type": "data_change"}` |
| **定时（schedule）** | 按 cron 表达式触发 | `{"trigger_type": "schedule", "cron": "0 */5 * * * *"}` |
| **手动（manual）** | 仅 API / CLI 调用时执行 | `{"trigger_type": "manual"}` |

> Cron 表达式为 6 段：`秒 分 时 日 月 周`。`"0 */5 * * * *"` = 每 5 分钟。

`data_change` 触发器会自动从 `condition` 中提取引用的数据源，无需手动指定 `sources`。

### 动作（actions）

条件满足后执行的操作。一条规则可以有多个动作，按顺序执行。

| 动作 | type 值 | 说明 |
|------|---------|------|
| **发送通知** | `notify` | 消息模板支持 `{value}`、`{source_id}` 插值 |
| **执行指令** | `execute` | 下发控制指令到设备或扩展 |
| **触发 Agent** | `trigger_agent` | 调用 AI Agent 做深度分析 |

**notify 动作**：

```json
{ "type": "notify", "message": "温度过高：{value}°C", "severity": "critical" }
```

severity 取值：`info`、`warning`、`critical`、`emergency`。

**execute 动作**：

```json
{ "type": "execute", "target": "humidifier-01", "target_type": "device", "command": "power_on", "params": { "level": 3 } }
```

**trigger_agent 动作**：

```json
{ "type": "trigger_agent", "agent_id": "diagnostic", "input": "sensor-03 离线，请诊断原因" }
```

### 持续时间（for_duration）与冷却（cooldown）

```json
{
  "name": "持续高温",
  "trigger": { "trigger_type": "data_change" },
  "condition": { "condition_type": "comparison", "source": "device:sensor-01:temperature", "operator": "greater_than", "threshold": 30 },
  "actions": [{ "type": "notify", "message": "温度持续高于 30°C 已 5 分钟" }],
  "for_duration": 300,
  "cooldown": 60
}
```

- **`for_duration`**（秒）：条件必须**持续满足**该时长后才触发，避免传感器抖动误报
- **`cooldown`**（秒）：两次触发之间的最小间隔，默认 60 秒

## 完整示例

### 1. 温湿度联动告警

温度高且湿度低时，发通知并打开加湿器：

```json
{
  "name": "温湿度联动",
  "trigger": { "trigger_type": "data_change" },
  "condition": {
    "condition_type": "logical",
    "operator": "and",
    "conditions": [
      { "condition_type": "comparison", "source": "device:sensor-01:temperature", "operator": "greater_than", "threshold": 30 },
      { "condition_type": "comparison", "source": "device:sensor-01:humidity", "operator": "less_than", "threshold": 20 }
    ]
  },
  "actions": [
    { "type": "notify", "message": "高温低湿：{value}°C", "severity": "critical" },
    { "type": "execute", "target": "humidifier-01", "target_type": "device", "command": "power_on", "params": { "level": 3 } }
  ]
}
```

### 2. 定时能耗播报

每天早上 8 点触发 Agent 汇总能耗：

```json
{
  "name": "每日能耗播报",
  "trigger": { "trigger_type": "schedule", "cron": "0 8 * * *" },
  "actions": [
    { "type": "trigger_agent", "agent_id": "energy-reporter", "input": "汇总昨日能耗并发送日报" }
  ]
}
```

### 3. 扩展指标告警

天气扩展预测气温超 35°C：

```json
{
  "name": "高温预警",
  "trigger": { "trigger_type": "data_change" },
  "condition": { "condition_type": "comparison", "source": "extension:weather:tomorrow_temp", "operator": "greater_than", "threshold": 35 },
  "actions": [
    { "type": "notify", "message": "明日高温预警：预计 {value}°C，建议提前开启空调", "severity": "warning" }
  ]
}
```

### 4. 持续异常触发 Agent

设备离线超过 10 分钟，触发 Agent 诊断：

```json
{
  "name": "设备离线诊断",
  "trigger": { "trigger_type": "data_change" },
  "condition": { "condition_type": "comparison", "source": "device:sensor-03:online", "operator": "equal", "threshold": 0 },
  "for_duration": 600,
  "actions": [
    { "type": "notify", "message": "sensor-03 已离线 10 分钟", "severity": "critical" },
    { "type": "trigger_agent", "agent_id": "diagnostic", "input": "sensor-03 离线，请诊断原因" }
  ]
}
```

## 创建规则

### 方式一：Web UI

1. 进入 **Rules** 页签，点击 **Add Rule**
2. 在表单中填写名称、选择触发器类型、配置条件与动作
3. 点击 **Validate** 验证资源引用
4. 保存并启用

### 方式二：CLI

```bash
# 创建规则（JSON 格式）
neomind rule create --json '{"name":"高温告警","trigger":{"trigger_type":"data_change"},"condition":{"condition_type":"comparison","source":"device:sensor-01:temperature","operator":"greater_than","threshold":30},"actions":[{"type":"notify","message":"温度过高"}]}'

# 列出所有规则
neomind rule list

# 启用 / 禁用规则
neomind rule enable <rule_id>
neomind rule disable <rule_id>

# 删除规则
neomind rule delete <rule_id>
```

### 方式三：REST API

```bash
# 创建规则（JSON body）
curl -X POST http://localhost:9375/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "高温告警",
    "trigger": { "trigger_type": "data_change" },
    "condition": { "condition_type": "comparison", "source": "device:sensor-01:temperature", "operator": "greater_than", "threshold": 30 },
    "actions": [ { "type": "notify", "message": "温度过高" } ]
  }'

# 查看执行历史
curl http://localhost:9375/api/rules/<rule_id>/history
```

### 方式四：AI Chat

直接对 [AI Chat](./5-ai-chat.md) 说：

> 「温度超过 30 度时给我发邮件」

LLM 会自动生成规则并创建。

## 规则验证

创建规则时，NeoMind 会做**上下文感知验证**：

- 设备/扩展是否存在
- 指标名是否合法
- 指令参数是否匹配设备类型定义
- Agent ID 是否存在（trigger_agent 动作）

验证失败会返回详细的错误信息，列出具体哪个字段有问题。

## 执行历史

每条规则记录执行结果：

- 触发时间
- 条件是否满足
- 执行了几个动作
- 每个动作的结果（成功/失败/原因）
- 评估耗时

在 **Rules** 页签点击任意规则查看历史。失败的动作可排查原因后重试。

## 与其他模块联动

| 联动 | 说明 |
|------|------|
| [通知](./8-notifications.md) | `notify` 动作路由到已配置的通知渠道 |
| [AI Agent](./6-ai-agent.md) | `trigger_agent` 动作调用自主智能体做深度分析 |
| [设备](./3-onboard-device.md) | `execute` 动作下发设备指令 |
| [AI Chat](./5-ai-chat.md) | 自然语言创建规则，LLM 自动生成 JSON |

## 最佳实践

- **加 `for_duration` 防抖**：传感器数据有噪声，用 `"for_duration": 120` 过滤瞬时波动
- **设 `cooldown` 防刷屏**：高频数据源配合冷却时间，防止告警风暴
- **分级通知**：普通告警 `severity: "info"`，严重告警 `severity: "critical"`
- **优先用规则而非 Agent**：确定性逻辑用规则（毫秒级评估），模糊判断才用 Agent（秒级 LLM 分析）
- **动作幂等**：设备指令设计为幂等（如 `power_on` 多次调用安全），防止规则重试产生副作用

---

*最后更新: 2026-06-13 · NeoMind v0.8.11*
