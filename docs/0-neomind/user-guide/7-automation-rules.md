---
description: "NeoMind 自动化规则引擎使用指南：DSL 语法（RULE/WHEN/DO/END）、条件与动作、定时触发、Agent 联动，含 UI 与 CLI 创建示例。"
keywords: [NeoMind, 规则引擎, 自动化, DSL, 定时, 告警, 联动]
tags: [NeoMind, 用户指南]
---

# 自动化规则

规则引擎让 NeoMind 在**无人值守**时自动响应：设备数据越过阈值 → 自动通知、下发指令、触发 AI Agent。规则用人类可读的 DSL（Domain Specific Language）编写。

## 快速理解

一条规则由三部分组成——**触发条件**、**持续时间**（可选）、**执行动作**：

```
RULE "规则名"
WHEN <条件>
[FOR <持续时间>]
DO
  <动作1>
  <动作2>
END
```

最简示例——温度超过 30°C 发通知：

```
RULE "高温告警"
WHEN device("sensor-01").temperature > 30
DO
  NOTIFY "sensor-01 温度过高：{temperature}°C"
END
```

## DSL 语法详解

### 条件（WHEN）

条件决定规则何时触发。支持设备指标、扩展指标、逻辑组合和范围匹配。

**设备指标条件**：

```
WHEN device("<device_id>").<metric> <operator> <value>
```

| 运算符 | 含义 |
|--------|------|
| `>` | 大于 |
| `<` | 小于 |
| `>=` | 大于等于 |
| `<=` | 小于等于 |
| `==` | 等于 |
| `!=` | 不等于 |

**扩展指标条件**（如天气扩展的温度）：

```
WHEN extension("<extension_id>").<metric> > <value>
```

**范围条件**（值在某区间内时触发）：

```
WHEN device("sensor-01").temperature BETWEEN 20 AND 25
```

**逻辑组合**（AND / OR / NOT）：

```
WHEN (device("sensor-01").temperature > 30) AND (extension("weather").humidity < 20)
```

### 持续时间（FOR）

加 `FOR` 让条件**持续满足一段时间后**才触发，避免传感器抖动导致的误报：

```
RULE "持续高温"
WHEN device("sensor-01").temperature > 30
FOR 5 minutes
DO
  NOTIFY "温度持续高于 30°C 已 5 分钟"
END
```

支持 `seconds`、`minutes`、`hours` 时间单位。

### 动作（DO）

动作是条件满足后执行的操作。一条规则可以有多个动作，按顺序执行。

| 动作 | 语法 | 说明 |
|------|------|------|
| **发送通知** | `NOTIFY "<message>"` | 通过默认渠道发送；消息可用 `{metric}` 插值 |
| **指定渠道通知** | `NOTIFY "<msg>" channels: ["email", "feishu"]` | 发送到指定通知渠道 |
| **执行设备指令** | `EXECUTE device("<id>").<command>(param=value)` | 下发控制指令到设备 |
| **设置设备属性** | `SET device("<id>").<property> = <value>` | 修改设备属性 |
| **创建告警** | `CREATE_ALERT title: "<title>", message: "<msg>", severity: "critical"` | 生成系统告警 |
| **触发 AI Agent** | `TRIGGER_AGENT "<agent_id>" INPUT "<hint>"` | 调用 AI Agent 做深度分析 |
| **HTTP 请求** | `HTTP_REQUEST POST "https://example.com/webhook"` | 调用外部 HTTP 接口 |
| **延迟** | `DELAY 10 seconds` | 延迟后续动作执行 |
| **日志** | `LOG level: "warn", message: "<msg>"` | 写入运行日志 |

### 触发方式

除了默认的设备状态触发，规则还可以**按计划触发**：

**定时触发（Cron）**——每 5 分钟检查一次：

```
RULE "定时巡检"
TRIGGER SCHEDULE "0 */5 * * * *"
DO
  EXECUTE device("sensor-01").read_sensors()
END
```

> Cron 表达式为 6 段：`秒 分 时 日 月 周`。`"0 */5 * * * *"` = 每 5 分钟。

**手动触发**——仅在 API 调用时执行，不自动评估。

## 完整示例

### 1. 温湿度联动告警

温度高且湿度低时，发邮件和飞书通知，同时打开加湿器：

```
RULE "温湿度联动"
WHEN (device("sensor-01").temperature > 30) AND (device("sensor-01").humidity < 20)
DO
  NOTIFY "高温低湿：{temperature}°C / {humidity}%" channels: ["email", "feishu"]
  EXECUTE device("humidifier-01").power_on(level=3)
END
```

### 2. 定时能耗播报

每天早上 8 点汇总昨日能耗：

```
RULE "每日能耗播报"
TRIGGER SCHEDULE "0 8 * * *"
DO
  TRIGGER_AGENT "energy-reporter" INPUT "汇总昨日能耗并发送日报"
END
```

### 3. 扩展指标告警

天气扩展预测气温超 35°C：

```
RULE "高温预警"
WHEN extension("weather").tomorrow_temp > 35
DO
  NOTIFY "明日高温预警：预计 {tomorrow_temp}°C，建议提前开启空调"
  HTTP_REQUEST POST "https://api.example.com/pre-cool" body: '{"action":"pre_cool"}'
END
```

### 4. 持续异常触发 Agent

设备离线超过 10 分钟，触发 Agent 诊断：

```
RULE "设备离线诊断"
WHEN device("sensor-03").online == 0
FOR 10 minutes
DO
  NOTIFY "sensor-03 已离线 10 分钟" channels: ["telegram"]
  TRIGGER_AGENT "diagnostic" INPUT "sensor-03 离线，请诊断原因"
END
```

## 创建规则

### 方式一：Web UI

1. 进入 **Rules** 页签，点击 **Add Rule**
2. 在编辑器中编写 DSL（带语法高亮）
3. 点击 **Validate** 验证语法与资源引用
4. 保存并启用

### 方式二：CLI

```bash
# 创建规则（DSL 通过 --dsl 参数传入）
neomind rule create --dsl 'RULE "高温告警" WHEN device("sensor-01").temperature > 30 DO NOTIFY "温度过高" END'

# 列出所有规则
neomind rule list

# 启用/暂停规则
neomind rule status <rule_id> --status enabled
neomind rule status <rule_id> --status disabled

# 删除规则
neomind rule delete <rule_id>
```

### 方式三：REST API

```bash
# 创建规则
curl -X POST http://localhost:9375/api/rules \
  -H "Content-Type: application/json" \
  -d '{"dsl": "RULE \"高温告警\" WHEN device(\"sensor-01\").temperature > 30 DO NOTIFY \"温度过高\" END"}'

# 验证 DSL（不创建）
curl -X POST http://localhost:9375/api/rules/validate \
  -H "Content-Type: application/json" \
  -d '{"dsl": "RULE \"Test\" WHEN device(\"sensor-01\").temperature > 30 DO NOTIFY \"High\" END"}'

# 查看执行历史
curl http://localhost:9375/api/rules/<rule_id>/history
```

### 方式四：AI Chat

直接对 [AI Chat](./5-ai-chat.md) 说：

> 「温度超过 30 度时给我发邮件」

LLM 会自动生成 DSL 并创建规则。

## 规则验证

创建规则时，NeoMind 会做**上下文感知验证**：

- 设备/扩展是否存在
- 指标名是否合法
- 指令参数是否匹配设备类型定义
- 通知渠道是否已配置

验证结果分三级：**Error**（无法创建）、**Warning**（可创建但可能有隐患）、**Info**（建议）。

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
| [通知](./8-notifications.md) | `NOTIFY` 动作路由到已配置的通知渠道 |
| [AI Agent](./6-ai-agent.md) | `TRIGGER_AGENT` 动作调用自主智能体做深度分析 |
| [设备](./3-onboard-device.md) | `EXECUTE` / `SET` 动作下发设备指令 |
| [AI Chat](./5-ai-chat.md) | 自然语言创建规则，LLM 自动生成 DSL |

## 最佳实践

- **加 `FOR` 防抖**：传感器数据有噪声，用 `FOR 2 minutes` 过滤瞬时波动
- **分级通知**：普通告警只进应用内，严重告警走多渠道（邮件 + 飞书 + Telegram）
- **优先用规则而非 Agent**：确定性逻辑用 DSL 规则（毫秒级评估），模糊判断才用 Agent（秒级 LLM 分析）
- **动作幂等**：设备指令设计为幂等（如 `power_on()` 多次调用安全），防止规则重试产生副作用
- **避免循环**：规则 A 触发设备变更 → 规则 B 又改回来。用 `FOR` 或动作间 `DELAY` 打破循环

---

*最后更新: 2026-06-13 · NeoMind v0.8.11*
