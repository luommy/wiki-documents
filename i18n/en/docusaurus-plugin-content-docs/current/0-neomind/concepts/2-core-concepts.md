---
description: "NeoMind system architecture overview: process model (main + extension processes), data lifecycle (device → MQTT → telemetry storage → dashboard/AI), extension model, agent model. User-facing perspective, not deep developer docs."
keywords: [NeoMind, core concepts, architecture overview, data flow, process model]
tags: [NeoMind, Concepts]
---

# Core Concepts

This page explains the overall NeoMind system from a user's perspective. If you are going to write code, see the [Developer Architecture doc](../developer-guide/2-architecture.md).

> For term definitions see the [Glossary](./1-glossary.md).

---

## System Overview

```
┌──────────────────────────────────────────────────────────┐
│                    NeoMind Main Process                   │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ API       │  │ MQTT     │  │ Rule     │  │ Agent   │ │
│  │ Service   │  │ Broker   │  │ Engine   │  │ (LLM)   │ │
│  │ (Axum)    │  │ :1883    │  │          │  │         │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │              │              │             │      │
│       └──────────────┴──────┬───────┴─────────────┘      │
│                             │                            │
│                    ┌────────▼────────┐                    │
│                    │  Telemetry      │                    │
│                    │  (redb)         │                    │
│                    │  data/*.redb    │                    │
│                    └─────────────────┘                    │
│                                                          │
├──────────────┬───────────────┬───────────────────────────┤
│              │               │                           │
│  ┌──────────▼──┐ ┌──────────▼┐ ┌───────────┐ ┌────────┐ │
│  │ Extension 1 │ │ Extension 2│ │ Extension 3│ │  ...   │ │
│  │ (YOLO)      │ │ (Weather)  │ │ (OCR)      │ │        │ │
│  └─────────────┘ └────────────┘ └───────────┘ └────────┘ │
└──────────────────────────────────────────────────────────┘
      ▲                                      ▲
      │ Webhook / MQTT                       │ FFI
      │                                      │
  ┌───┴──────┐                        ┌──────┴───────┐
  │  IoT device│                        │  ML model    │
  │  cam/sensor│                        │  (ONNX/PyTorch)│
  └──────────┘                        └──────────────┘
```

**Four core subsystems**:

1. **API Service** (port 9375) — The entry point for the Web UI and REST API. All operations go in and out through here.
2. **MQTT Broker** (port 1883) — The device communication hub, built-in and requires no extra install.
3. **Rule Engine** — Event-driven automation. A DSL defines trigger conditions and actions.
4. **Agent** (LLM) — Natural-language understanding + tool calls. The "brain".

All subsystems share the **Telemetry** storage (redb); data files land in the `data/` directory.

---

## Data Lifecycle

The full path of a data point from device to dashboard:

```
Device                 NeoMind                      User
                       Main Process
┌──────────┐          ┌─────────────────────────────────────┐    ┌──────┐
│ Sensor    │──MQTT──▶│ MQTT Broker                         │    │      │
│          │          │   │                                 │    │Dashboard│
│ Temp 25°C│          │   ▼                                 │───▶│      │
│          │          │ Telemetry storage (redb)            │    │ AI   │
│          │          │   │                                 │───▶│ Chat │
│          │          │   ├──▶ Dashboard WebSocket push     │    │      │
│          │          │   ├──▶ Rule engine check (over threshold?) │  │
│          │          │   └──▶ Agent data source (for LLM query) │   │
└──────────┘          └─────────────────────────────────────┘    └──────┘
```

**Key points**:
- Data is written **once** (to Telemetry) and **consumed by many** (dashboard / rules / agent)
- The dashboard pushes over **WebSocket** in real time — no polling needed
- The rule engine evaluates **immediately** after data is written; when conditions are met the action fires
- The agent pulls the latest data **on demand** when it runs

---

## Extension Model

Extensions are NeoMind's capability-expansion mechanism — plugins written in Rust that run in a separate process.

```
┌────────────────────────────────┐
│      NeoMind Main Process      │
│                                │
│  ExtensionRunner               │
│    ├─ spawn process ───────────┼──▶ ┌─────────────────┐
│    │                           │    │  Extension       │
│    │ ←──── FFI (C ABI) ────────┼────│  impl Extension  │
│    │                           │    │  neomind_export! │
│    │  metric / command forward │    │                  │
│                                │    │  ┌─────────────┐ │
│                                │    │  │ ML model     │ │
│                                │    │  │ (lazy load)  │ │
│                                │    │  └─────────────┘ │
│                                │    └─────────────────┘
└────────────────────────────────┘
```

**Design principles**:
- **Process isolation** — An extension crash cannot bring down the main service
- **Least privilege** — Capabilities are declared at startup; anything undeclared is denied
- **Lazy loading** — ML models load on first call and then stay resident
- **FFI communication** — Cross-process data is serialized as serde JSON

> For the full extension development flow see [Extension Development](../developer-guide/7-extension-development.md).

---

## Agent Model

The agent is NeoMind's "brain" — it receives natural language, understands intent, and invokes tools to act.

```
User input                 Agent execution loop
┌──────────┐              ┌──────────────────────────────────┐
│ "Notify  │              │                                  │
│  me when │───LLM───▶   │  1. Understand intent (LLM)      │
│  temp    │              │  2. Pick tool (LLM tool choice)  │
│  > 30"   │              │  3. Execute tool (CLI/device/ext)│
│          │              │  4. Observe result               │
│          │              │  5. Continue or respond (loop 2-4)│
└──────────┘              └──────────────────────────────────┘
                                     │
                                     ▼
                           ┌──────────────────┐
                           │ Create rule +    │
                           │ notify channel   │
                           │ Execution result │
                           └──────────────────┘
```

**Two trigger modes**:
- **Conversational** — The user asks in AI Chat and the agent responds in real time
- **Scheduled** — The agent runs on a schedule (e.g. inspecting device status every 5 minutes)

**Tool system**: The agent operates through `neomind` CLI commands to manage everything (devices / rules / dashboards / extensions). Commands from installed extensions are automatically exposed to the LLM.

---

## Why Not Cloud?

NeoMind's core philosophy is **edge first**:

| Dimension | Cloud solution | NeoMind (edge) |
|-----------|----------------|----------------|
| **Latency** | 100–500 ms (network round trip) | `<10 ms` (local inference) |
| **Privacy** | Data leaves the device | Data never leaves the LAN |
| **Offline** | Unavailable without network | 100% offline capable (Ollama) |
| **Cost** | Continuous API billing | One-time hardware cost |

Of course, NeoMind also supports cloud LLMs (OpenAI / Anthropic / GLM) when you need more power and want to switch flexibly.

---

## Next Steps

- Want to get hands-on → [5-Minute Quick Start](../quick-start/1-five-minute-guide.md)
- Want the full API → [REST API Reference](../developer-guide/4-rest-api.md)
- Want to write an extension → [Extension Development](../developer-guide/7-extension-development.md)

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
