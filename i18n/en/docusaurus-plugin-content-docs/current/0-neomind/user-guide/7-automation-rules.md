---
description: "NeoMind automation rules guide: JSON rule structure, conditions (comparison/range/logical), actions (notify/execute/trigger_agent), triggers (data_change/schedule/manual), with UI, CLI, API creation examples."
keywords: [NeoMind, rules engine, automation, JSON, condition, action, schedule, alert, integration]
tags: [NeoMind, User Guide]
---

# Automation Rules

The rules engine lets NeoMind respond **unattended**: device data crosses a threshold → auto-notify, execute commands, trigger AI Agents. Rules are defined as JSON and created via Web UI, CLI, REST API, or AI Chat.

## Quick Overview

A rule has four parts — **name**, **trigger**, **condition**, **actions** (plus optional duration and cooldown):

```json
{
  "name": "High Temp Alert",
  "trigger": { "trigger_type": "data_change" },
  "condition": {
    "condition_type": "comparison",
    "source": "device:sensor-01:temperature",
    "operator": "greater_than",
    "threshold": 30
  },
  "actions": [
    { "type": "notify", "message": "Too hot: {value}°C", "severity": "critical" }
  ]
}
```

## JSON Structure

### Condition

Conditions determine when a rule triggers. Three types are supported:

**Comparison**:

```json
{
  "condition_type": "comparison",
  "source": "device:sensor-01:temperature",
  "operator": "greater_than",
  "threshold": 30
}
```

| Operator | Meaning |
|----------|---------|
| `greater_than` | Greater than |
| `less_than` | Less than |
| `greater_equal` | Greater than or equal |
| `less_equal` | Less than or equal |
| `equal` | Equal |
| `not_equal` | Not equal |
| `contains` | Contains (string) |
| `starts_with` | Starts with (string) |
| `ends_with` | Ends with (string) |
| `regex` | Regex match (string) |

`source` uses the DataSourceId format `{type}:{id}:{field}`, e.g. `device:sensor-01:temperature` or `extension:weather:temp`. String comparison operators (`contains`/`starts_with`/`ends_with`/`regex`) use the `threshold_value` field for the match text, not the numeric `threshold`.

**Range** — triggers when value is within [min, max]:

```json
{
  "condition_type": "range",
  "source": "device:sensor-01:temperature",
  "min": 20,
  "max": 25
}
```

**Logical** — AND / OR / NOT:

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

### Trigger

| Trigger type | Description | JSON |
|-------------|-------------|------|
| **Data change** | Evaluates condition when referenced metrics receive new data | `{"trigger_type": "data_change"}` |
| **Schedule** | Triggers on cron expression | `{"trigger_type": "schedule", "cron": "0 */5 * * * *"}` |
| **Manual** | Only runs when invoked via API / CLI | `{"trigger_type": "manual"}` |

> Cron expressions are 6-segment: `sec min hour day month weekday`. `"0 */5 * * * *"` = every 5 minutes.

`data_change` triggers automatically extract data sources from the `condition` — no need to specify `sources` manually.

### Actions

Executed when the condition is met. A rule can have multiple actions, executed in order.

| Action | type value | Description |
|--------|------------|-------------|
| **Send notification** | `notify` | Message template supports `{value}`, `{source_id}` placeholders |
| **Execute command** | `execute` | Sends a control command to a device or extension |
| **Trigger Agent** | `trigger_agent` | Calls an AI Agent for deeper analysis |

**notify action**:

```json
{ "type": "notify", "message": "Too hot: {value}°C", "severity": "critical" }
```

severity values: `info`, `warning`, `critical`, `emergency`.

**execute action**:

```json
{ "type": "execute", "target": "humidifier-01", "target_type": "device", "command": "power_on", "params": { "level": 3 } }
```

**trigger_agent action**:

```json
{ "type": "trigger_agent", "agent_id": "diagnostic", "input": "sensor-03 is offline, diagnose the cause" }
```

### Duration (for_duration) and Cooldown (cooldown)

```json
{
  "name": "Sustained High Temp",
  "trigger": { "trigger_type": "data_change" },
  "condition": { "condition_type": "comparison", "source": "device:sensor-01:temperature", "operator": "greater_than", "threshold": 30 },
  "actions": [{ "type": "notify", "message": "Temperature above 30°C for 5 minutes" }],
  "for_duration": 300,
  "cooldown": 60
}
```

- **`for_duration`** (seconds): condition must hold **continuously** for this long before triggering — prevents sensor jitter false positives
- **`cooldown`** (seconds): minimum interval between triggers, default 60 seconds

## Complete Examples

### 1. Combined Temperature + Humidity Alert

High temp and low humidity → notify and turn on humidifier:

```json
{
  "name": "Temp Humidity Linkage",
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
    { "type": "notify", "message": "High temp low humidity: {value}°C", "severity": "critical" },
    { "type": "execute", "target": "humidifier-01", "target_type": "device", "command": "power_on", "params": { "level": 3 } }
  ]
}
```

### 2. Scheduled Energy Report

Trigger an Agent daily at 8 AM to summarize energy:

```json
{
  "name": "Daily Energy Report",
  "trigger": { "trigger_type": "schedule", "cron": "0 8 * * *" },
  "actions": [
    { "type": "trigger_agent", "agent_id": "energy-reporter", "input": "Summarize yesterday's energy and send the report" }
  ]
}
```

### 3. Extension Metric Alert

Weather extension predicts temperature above 35°C:

```json
{
  "name": "Heat Wave Warning",
  "trigger": { "trigger_type": "data_change" },
  "condition": { "condition_type": "comparison", "source": "extension:weather:tomorrow_temp", "operator": "greater_than", "threshold": 35 },
  "actions": [
    { "type": "notify", "message": "Heat wave tomorrow: {value}°C, consider pre-cooling", "severity": "warning" }
  ]
}
```

### 4. Sustained Anomaly Triggers Agent

Device offline for over 10 minutes → trigger diagnostic Agent:

```json
{
  "name": "Device Offline Diagnosis",
  "trigger": { "trigger_type": "data_change" },
  "condition": { "condition_type": "comparison", "source": "device:sensor-03:online", "operator": "equal", "threshold": 0 },
  "for_duration": 600,
  "actions": [
    { "type": "notify", "message": "sensor-03 offline for 10 minutes", "severity": "critical" },
    { "type": "trigger_agent", "agent_id": "diagnostic", "input": "sensor-03 is offline, diagnose the cause" }
  ]
}
```

## Creating Rules

### Option 1: Web UI

1. Go to **Rules** tab, click **Add Rule**
2. Fill in the name, select trigger type, configure condition and actions
3. Click **Validate** to verify resource references
4. Save and enable

### Option 2: CLI

```bash
# Create rule (JSON format)
neomind rule create --json '{"name":"High Temp Alert","trigger":{"trigger_type":"data_change"},"condition":{"condition_type":"comparison","source":"device:sensor-01:temperature","operator":"greater_than","threshold":30},"actions":[{"type":"notify","message":"Too hot"}]}'

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
# Create rule (JSON body)
curl -X POST http://localhost:9375/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High Temp Alert",
    "trigger": { "trigger_type": "data_change" },
    "condition": { "condition_type": "comparison", "source": "device:sensor-01:temperature", "operator": "greater_than", "threshold": 30 },
    "actions": [ { "type": "notify", "message": "Too hot" } ]
  }'

# View execution history
curl http://localhost:9375/api/rules/<rule_id>/history
```

### Option 4: AI Chat

Just tell [AI Chat](./5-ai-chat.md):

> "Notify me when temperature exceeds 30"

The LLM will generate and create the rule automatically.

## Rule Validation

When creating a rule, NeoMind performs **context-aware validation**:

- Whether the device/extension exists
- Whether the metric name is valid
- Whether command parameters match the device type definition
- Whether the Agent ID exists (for trigger_agent actions)

Validation failures return detailed error messages listing the specific field with the issue.

## Execution History

Each rule records execution results:

- Trigger time
- Whether the condition was met
- How many actions were executed
- Result of each action (success / failure / reason)
- Evaluation duration

Click any rule in the **Rules** tab to view history. Failed actions can be investigated and retried.

## Integration with Other Modules

| Module | Integration |
|--------|-------------|
| [Notifications](./8-notifications.md) | `notify` action routes to configured notification channels |
| [AI Agent](./6-ai-agent.md) | `trigger_agent` action calls autonomous agents for deep analysis |
| [Devices](./3-onboard-device.md) | `execute` action sends device commands |
| [AI Chat](./5-ai-chat.md) | Create rules in natural language, LLM generates JSON |

## Best Practices

- **Add `for_duration` for debounce**: sensor data is noisy, use `"for_duration": 120` to filter transient spikes
- **Set `cooldown` to prevent flooding**: high-frequency data sources paired with cooldown prevent alert storms
- **Tiered notifications**: normal alerts `severity: "info"`, critical alerts `severity: "critical"`
- **Prefer rules over Agents**: deterministic logic belongs in rules (millisecond evaluation), fuzzy judgment in Agents (second-level LLM analysis)
- **Idempotent actions**: design device commands to be idempotent (e.g. `power_on` called multiple times is safe), preventing side effects from rule retries

---

*Last updated: 2026-06-13 · NeoMind v0.8.11*
