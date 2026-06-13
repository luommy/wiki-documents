---
description: "NeoMind automation rules guide: DSL syntax (RULE/WHEN/DO/END), conditions, actions, schedule triggers, Agent integration, with UI and CLI creation examples."
keywords: [NeoMind, rules, automation, DSL, schedule, alert, trigger]
tags: [NeoMind, User Guide]
---

# Automation Rules

The rule engine lets NeoMind respond autonomously: device data crosses a threshold → automatically notify, send commands, or trigger an AI Agent. Rules are written in a human-readable DSL (Domain Specific Language).

## Quick Overview

A rule has three parts — **trigger condition**, **duration** (optional), and **actions**:

```
RULE "Rule Name"
WHEN <condition>
[FOR <duration>]
DO
  <action1>
  <action2>
END
```

Minimal example — notify when temperature exceeds 30°C:

```
RULE "Temperature Alert"
WHEN device("sensor-01").temperature > 30
DO
  NOTIFY "sensor-01 temperature too high: {temperature}C"
END
```

## DSL Syntax Reference

### Conditions (WHEN)

Conditions determine when a rule triggers. Supports device metrics, extension metrics, logical combinations, and range matching.

**Device metric condition**:

```
WHEN device("<device_id>").<metric> <operator> <value>
```

| Operator | Meaning |
|----------|---------|
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal |
| `<=` | Less than or equal |
| `==` | Equal |
| `!=` | Not equal |

**Extension metric condition** (e.g., weather extension temperature):

```
WHEN extension("<extension_id>").<metric> > <value>
```

**Range condition** (triggers when value falls within a range):

```
WHEN device("sensor-01").temperature BETWEEN 20 AND 25
```

**Logical combination** (AND / OR / NOT):

```
WHEN (device("sensor-01").temperature > 30) AND (extension("weather").humidity < 20)
```

### Duration (FOR)

Add `FOR` to require the condition to **hold for a period** before triggering, filtering out sensor jitter:

```
RULE "Sustained High Temperature"
WHEN device("sensor-01").temperature > 30
FOR 5 minutes
DO
  NOTIFY "Temperature above 30C for 5 minutes"
END
```

Supports `seconds`, `minutes`, `hours` time units.

### Actions (DO)

Actions execute when the condition is met. A rule can have multiple actions executed in order.

| Action | Syntax | Description |
|--------|--------|-------------|
| **Send notification** | `NOTIFY "<message>"` | Sends via default channels; supports `{metric}` interpolation |
| **Channel-specific notify** | `NOTIFY "<msg>" channels: ["email", "slack"]` | Sends to specified notification channels |
| **Execute device command** | `EXECUTE device("<id>").<command>(param=value)` | Sends control command to device |
| **Set device property** | `SET device("<id>").<property> = <value>` | Modifies device property |
| **Create alert** | `CREATE_ALERT title: "<title>", message: "<msg>", severity: "critical"` | Generates system alert |
| **Trigger AI Agent** | `TRIGGER_AGENT "<agent_id>" INPUT "<hint>"` | Calls AI Agent for deep analysis |
| **HTTP request** | `HTTP_REQUEST POST "https://example.com/webhook"` | Calls external HTTP endpoint |
| **Delay** | `DELAY 10 seconds` | Delays subsequent actions |
| **Log** | `LOG level: "warn", message: "<msg>"` | Writes to runtime log |

### Trigger Types

Beyond default device-state triggers, rules can trigger **on a schedule**:

**Scheduled trigger (Cron)** — check every 5 minutes:

```
RULE "Periodic Check"
TRIGGER SCHEDULE "0 */5 * * * *"
DO
  EXECUTE device("sensor-01").read_sensors()
END
```

> Cron expression is 6-field: `second minute hour day month weekday`. `"0 */5 * * * *"` = every 5 minutes.

**Manual trigger** — executes only on API call, no automatic evaluation.

## Complete Examples

### 1. Temperature & Humidity Alert

When temperature is high and humidity is low, notify via email and Slack, then turn on humidifier:

```
RULE "Temp Humidity Alert"
WHEN (device("sensor-01").temperature > 30) AND (device("sensor-01").humidity < 20)
DO
  NOTIFY "High temp low humidity: {temperature}C / {humidity}%" channels: ["email", "slack"]
  EXECUTE device("humidifier-01").power_on(level=3)
END
```

### 2. Daily Energy Report

Summarize yesterday's energy consumption at 8 AM daily:

```
RULE "Daily Energy Report"
TRIGGER SCHEDULE "0 8 * * *"
DO
  TRIGGER_AGENT "energy-reporter" INPUT "Summarize yesterday's energy and send daily report"
END
```

### 3. Extension Metric Alert

Weather extension forecasts temperature above 35°C:

```
RULE "Heat Wave Warning"
WHEN extension("weather").tomorrow_temp > 35
DO
  NOTIFY "Heat wave tomorrow: expected {tomorrow_temp}C, recommend pre-cooling"
  HTTP_REQUEST POST "https://api.example.com/pre-cool" body: '{"action":"pre_cool"}'
END
```

### 4. Sustained Anomaly Triggers Agent

Device offline for over 10 minutes triggers diagnostic Agent:

```
RULE "Device Offline Diagnosis"
WHEN device("sensor-03").online == 0
FOR 10 minutes
DO
  NOTIFY "sensor-03 offline for 10 minutes" channels: ["telegram"]
  TRIGGER_AGENT "diagnostic" INPUT "sensor-03 offline, diagnose the cause"
END
```

## Creating Rules

### Option 1: Web UI

1. Go to **Rules** tab, click **Add Rule**
2. Write DSL in the editor (with syntax highlighting)
3. Click **Validate** to check syntax and resource references
4. Save and enable

### Option 2: CLI

```bash
# Create rule (JSON format)
neomind rule create --json '{"name":"Temp Alert","condition":{"condition_type":"comparison","source":"device:sensor-01:temperature","operator":"greater_than","threshold":30},"actions":[{"type":"notify","message":"Too hot"}]}'

# List all rules
neomind rule list

# Enable / disable rule
neomind rule enable <rule_id>
neomind rule disable <rule_id>

# Delete rule
neomind rule delete <rule_id>
```

### Option 3: REST API

```bash
# Create rule
curl -X POST http://localhost:9375/api/rules \
  -H "Content-Type: application/json" \
  -d '{"dsl": "RULE \"Temp Alert\" WHEN device(\"sensor-01\").temperature > 30 DO NOTIFY \"Too hot\" END"}'

# Validate DSL (without creating)
curl -X POST http://localhost:9375/api/rules/validate \
  -H "Content-Type: application/json" \
  -d '{"dsl": "RULE \"Test\" WHEN device(\"sensor-01\").temperature > 30 DO NOTIFY \"High\" END"}'

# View execution history
curl http://localhost:9375/api/rules/<rule_id>/history
```

### Option 4: AI Chat

Just tell [AI Chat](./5-ai-chat.md):

> "Send me an email when temperature exceeds 30 degrees"

The LLM auto-generates DSL and creates the rule.

## Rule Validation

When creating a rule, NeoMind performs **context-aware validation**:

- Device/extension existence
- Metric name validity
- Command parameter matching against device type definitions
- Notification channel availability

Validation results have three levels: **Error** (cannot create), **Warning** (creatable but may have issues), **Info** (suggestions).

## Execution History

Each rule records execution results:

- Trigger time
- Whether condition was met
- Number of actions executed
- Each action's result (success/failure/reason)
- Evaluation duration

Click any rule in **Rules** tab to view history. Failed actions can be retried after investigating the cause.

## Integration with Other Modules

| Module | Integration |
|--------|-------------|
| [Notifications](./8-notifications.md) | `NOTIFY` action routes to configured channels |
| [AI Agent](./6-ai-agent.md) | `TRIGGER_AGENT` action calls autonomous agent for analysis |
| [Devices](./3-onboard-device.md) | `EXECUTE` / `SET` actions send device commands |
| [AI Chat](./5-ai-chat.md) | Natural language rule creation, LLM generates DSL |

## Best Practices

- **Add `FOR` to debounce**: Sensor data is noisy; use `FOR 2 minutes` to filter transient spikes
- **Tiered notifications**: Routine alerts to in-app only, critical alerts to multiple channels (email + Slack + Telegram)
- **Prefer rules over Agents**: Use DSL rules for deterministic logic (millisecond evaluation); use Agents only for fuzzy judgment (second-level LLM analysis)
- **Idempotent actions**: Design device commands to be idempotent (e.g., `power_on()` safe to call multiple times), preventing side effects from rule retries
- **Avoid loops**: Rule A changes device → Rule B reverts it. Use `FOR` or inter-action `DELAY` to break cycles

---

*Last updated: 2026-06-13 · NeoMind v0.8.11*
