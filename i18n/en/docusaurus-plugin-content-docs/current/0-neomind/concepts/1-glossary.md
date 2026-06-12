---
description: "NeoMind core glossary: definitions and relationships for Device, Device Type, Extension, Capability, Metric, DataSourceId, Agent, Rule, Dashboard, Widget, LLM Backend, MQTT Broker, Telemetry, and more."
keywords: [NeoMind, glossary, concepts, terminology, Device, Extension, Agent, Rule]
tags: [NeoMind, Concepts]
---

# Glossary

NeoMind introduces many concepts. This page is the central definition for all core terminology. When you encounter a new term for the first time, check here first.

> If you want the overall system architecture and data flow (rather than individual terms), jump straight to [Core Concepts](./2-core-concepts.md).

---

## Device Related

### Device

A physical or virtual device that has been connected to NeoMind. Each device has a unique ID, a device type, a set of metrics (telemetry points), and commands (control actions).

**Example**: A temperature/humidity sensor whose metrics are `temperature` / `humidity` and whose command is `reboot`.

### Device Type

The "template" for a device, defining which metrics, commands, and connection parameters that kind of device exposes. Device types are defined in JSON and stored in the [NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes) repository.

When you create a device you pick a type and NeoMind generates the default metric / command schema from it.

### Draft

When NeoMind auto-discovers an unknown device via MQTT or Webhook, it does not immediately create a device. Instead it produces a "draft". Only after an admin approves the draft does it become an official device. This is a safety mechanism that prevents unauthorized devices from joining automatically.

### Metric

A time-series data point produced by a device or extension. Each metric has a name, a data type (Integer / Float / String / Boolean), and an optional unit.

**Example**: `temperature: Float, unit: °C`.

### Command

A control instruction you can send to a device, or an operation you can invoke on an extension. Each command has a name and a parameter schema.

**Example**: `set_temperature(target: Integer)`.

### DataSourceId

The unified format NeoMind uses to reference any data point: `{type}:{id}:{field}`

| type | Meaning | Example |
|------|---------|---------|
| `device` | Device telemetry | `device:sensor-01:temperature` |
| `extension` | Extension metric | `extension:weather:temp` |
| `agent` | Agent status | `agent:guard:status` |

Dashboard widgets, rule conditions, and data pushes all reference data via DataSourceId.

---

## AI Related

### LLM Backend

The large language model instance NeoMind connects to. Multiple backends are supported: **Ollama** (local), **OpenAI**, **Anthropic**, **GLM**, **llama.cpp**, etc. You can configure several backends and switch between them per scenario.

> See [Configure LLM Backend](../user-guide/2-configure-llm.md).

### Agent

NeoMind's core intelligent unit. An agent receives natural-language input from a user (or runs on a schedule), uses an LLM to understand intent, invokes tools (CLI commands, device controls, extension commands) to take action, and learns from the results.

**Two execution modes**:
- **Free mode** — Free-form conversation, no fixed resource binding
- **Focused mode** — Bound to specific devices and data sources, runs periodic analysis

> See [AI Chat](../user-guide/5-ai-chat.md).

### Tool

An action an agent can call. NeoMind's agent operates primarily through `neomind` CLI commands to manage devices, rules, dashboards, and so on. The tool system automatically exposes commands from installed extensions to the LLM as well.

---

## Automation Related

### Rule

Event-driven automation logic. When a condition is met, the action executes automatically.

NeoMind rules are defined with a **DSL (domain-specific language)** rather than structured JSON:

```
RULE HighTemp
WHEN device("sensor-01").temperature > 30
DO notify("email", "High temperature alert")
END
```

### Rule DSL

The text syntax used to define rules. It uses a four-segment structure of `RULE` / `WHEN` / `DO` / `END`. See the [Rule Engine doc](../user-guide/7-automation-rules.md).

### Message Channel

The delivery channel used when a rule triggers a notification. Supports 7 external channels (Webhook / Email / Telegram / WeCom / DingTalk / Slack / Feishu) plus in-app messages.

> See [Notifications](../user-guide/8-notifications.md).

### Data Push

Actively pushing telemetry data to an external system (Webhook or MQTT), as opposed to passive querying. You can configure push frequency, data format, and target address.

---

## Extension Related

### Extension

A plugin module loaded into NeoMind via FFI (foreign function interface). Extensions are written in Rust, compiled to a dynamic library (`.dylib` / `.so` / `.dll`), and run in a **separate process**.

Extensions can:
- Provide metrics (data streams)
- Provide commands (callable operations)
- Load ML models (e.g. YOLO object detection)
- Process streaming data (e.g. video frames)

> See the [Extension SDK](../developer-guide/3-extension-sdk.md).

### Capability

A permission an extension must declare at startup. Any capability not declared is denied. This enforces the **principle of least privilege**.

| Capability | Meaning |
|------------|---------|
| `network` | Outbound network access |
| `filesystem:read` / `filesystem:write` | File read / write |
| `ml-model` | Load / run ML models |
| `camera` | Access cameras |
| `serial` | Serial port access |

### .nmext

The distribution package format for NeoMind extensions. A `.nmext` file is a zip archive containing multi-platform binaries + `metadata.json` + optional model files. When a user clicks install in the Web UI, the runner automatically selects the binary matching the current platform.

### neomind_export!

A macro provided by the SDK that exports a Rust `impl Extension` as FFI entry points automatically. Extension developers only need to add one line at the end of their code: `neomind_extension_sdk::neomind_export!(MyExtension);`.

### Process Isolation

Extensions run in a separate process rather than inside the main process. Benefits: an extension crash (panic) cannot bring down the main service; extensions cannot interfere with each other; the capability-based permission boundary is clearer.

### Lazy Load

ML models are not loaded at extension startup. Instead they are loaded into memory on the first command call. Once loaded they stay resident (until the extension process exits), avoiding repeated reloads per inference.

---

## Infrastructure Related

### MQTT Broker

The message broker built into NeoMind (port `1883`). Devices connect, report telemetry, and receive commands over MQTT. No external broker (such as Mosquitto) needs to be installed.

### Telemetry

NeoMind's time-series database, built on redb and stored in `data/telemetry.redb`. All metric values are written here, and the dashboard and rule engine read from it.

### redb

The embedded key-value storage engine NeoMind uses (written in Rust). There is no external database dependency; data files land directly on disk in the `data/` directory.

### Webhook

An HTTP callback mechanism. Devices can report data by sending POST requests to NeoMind's webhook URL without needing MQTT. It is also used to receive event pushes from external systems.

---

## Dashboard Related

### Dashboard

A visualization page composed of a set of widgets. You can create multiple dashboards, share them (via public links with expiry times), and they auto-adapt to mobile screens.

### Widget

A single visualization element on a dashboard. Built-in types: value card / line chart / gauge / data table / VLM vision / stream player. Custom widgets provided by extensions are also supported.

> See [Use Dashboard](../user-guide/4-use-dashboard.md).

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
