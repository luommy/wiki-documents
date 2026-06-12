---
description: "NeoMind developer guide overview: start from one of four repo dimensions (device types / extensions / dashboard components / main project), with tech stack, crate layout, and entry points to deeper docs."
keywords: [NeoMind, developer guide, architecture, crate, repo, SDK]
tags: [NeoMind, Developer Guide]
---

# Developer Guide Overview

NeoMind is a modular ecosystem split into four independent repositories organized by **development goal**. This page helps you pick the right repo to start from and points to the deeper doc for each path.

## First Question: What Are You Building?

```
What do you want to do?
│
├─ Add a new device type / sensor metric to NeoMind
│   → Repo: camthink-ai/NeoMind-DeviceTypes (JS / JSON)
│   → See: § Device Type Development below
│
├─ Add a new capability (AI model / vision algo / 3rd-party integration)
│   → Repo: camthink-ai/NeoMind-Extensions (Rust, built on the Extension SDK)
│   → See: Extension Development (./7-extension-development.md) and Extension SDK (./3-extension-sdk.md)
│
├─ Build a dashboard widget (chart / gauge / custom visualization)
│   → Repo: camthink-ai/NeoMind-Dashboard-Components (JS / React)
│   → See: § Dashboard Component Development below
│
└─ Contribute to the main project / fix a bug / wire up a new backend API
    → Repo: camthink-ai/NeoMind (Rust + React)
    → See: Product Architecture (./2-architecture.md) and REST API (./4-rest-api.md)
```

## Repository Map

| Repo | Language | Purpose | Artifact |
|------|----------|---------|----------|
| **[NeoMind](https://github.com/camthink-ai/NeoMind)** | Rust + TypeScript | Core platform (backend + frontend + Tauri desktop) | `neomind` server, `neomind-extension-runner`, web frontend |
| **[NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)** | Rust | Official extension marketplace (weather / YOLO / OCR / face / streaming / bridges) | `.nmext` extension packages |
| **[NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes)** | JSON (+ metadata) | Device type definitions (metrics / commands / defaults) | JSON type files |
| **[NeoMind-Dashboard-Components](https://github.com/camthink-ai/NeoMind-Dashboard-Components)** | TypeScript / React | Dashboard widget marketplace | JS component packages |

## Tech Stack at a Glance

**Main project (NeoMind)**:

- Backend: Rust (edition 2021, toolchain 1.92.0), Tokio async runtime, Axum web framework, redb embedded storage, serde
- Frontend: React 18 + TypeScript + Vite + Zustand + Radix UI + Tailwind CSS
- Desktop: Tauri 2.x
- Protocols: REST + WebSocket + SSE + MQTT 3.1.1

**Extensions**: Rust, depend on the `neomind-extension-sdk` crate (latest v0.6.1), export via the `neomind_export!` FFI macro, run in an isolated process provided by `neomind-extension-runner`.

**Device types**: declarative JSON, no runtime code — just describes the metrics, commands, and defaults. Loaded by NeoMind on the fly.

**Dashboard components**: React components implementing the Dashboard Component Registry protocol; dynamically injected into the dashboard canvas.

## Device Type Development

**Repo**: `camthink-ai/NeoMind-DeviceTypes`

A device type is a JSON file declaring:

- `metrics`: what the device produces (name, display name, data type, unit)
- `commands`: what can be sent down (name, parameter schema)
- `defaults`: default config (icon, polling interval, etc.)

**Typical scenario**: you integrated a new sensor and want every user to use it out of the box — open a PR adding the type definition; once merged, everyone's `neomind device types list` shows it.

**Example** (simplified):

```json
{
  "name": "temp_humidity_sensor",
  "display_name": "Temp/Humidity Sensor",
  "metrics": [
    {"name": "temperature", "display_name": "Temperature", "data_type": "Float", "unit": "°C"},
    {"name": "humidity", "display_name": "Humidity", "data_type": "Float", "unit": "%"}
  ],
  "commands": []
}
```

See the repo README for the full schema and submission conventions.

## Extension Development

**Repo**: `camthink-ai/NeoMind-Extensions` (community extensions PR here too)

**Prerequisite**: read [Extension SDK](./3-extension-sdk.md) to understand the `neomind_export!` macro, the capability system, ML model lifecycle, and cross-platform packaging.

**Flow summary** (details in [Extension Development](./7-extension-development.md)):

1. Scaffold a crate from the SDK template
2. Implement the `ExtensionHandler` trait and export with `neomind_export!`
3. Declare capabilities (`network`, `filesystem`, `ml-model`, …)
4. (Optional) bundle ML models with lazy-load lifecycle
5. `cargo build --release` and pack into a `.nmext`
6. Upload via the Extensions page in NeoMind, or submit to the Extensions repo

## Dashboard Component Development

**Repo**: `camthink-ai/NeoMind-Dashboard-Components`

A dashboard component is a React component implementing the Dashboard Component Registry protocol:

- Declare `componentType` (unique id), config schema (what the user fills in the UI)
- On render you receive `dataSource` (DataSourceId), `config` (user config), `data` (live data)
- Use ECharts / Recharts / hand-rolled SVG — your choice

**Typical scenario**: the built-in library doesn't have the visualization you need (heatmap, map, 3D gauge).

**Flow**: scaffold from the repo template → develop locally with Vite → publish to the marketplace → install from NeoMind.

## Main Project Development

**Repo**: `camthink-ai/NeoMind`

**Prerequisite**: read [Product Architecture](./2-architecture.md) for crate dependencies, process model, event bus, extension ABI, and storage.

**Typical work**:

- Bug fix / logic change → find the crate (devices in `neomind-devices`, rules in `neomind-rules`, etc.)
- Add an HTTP API → add a handler in `neomind-api`; see [REST API Reference](./4-rest-api.md)
- Add an LLM backend → add an impl under `neomind-agent/src/llm_backends/`
- Frontend change → work under `web/src/` (always read `web/DESIGN_SPEC.md` first)

**Build & Run**:

```bash
# Backend (port 9375)
cargo run -p neomind-cli -- serve

# Frontend dev server (port 5173)
cd web && npm install && npm run dev

# Desktop app
cd web && npm run tauri:dev
```

## Doc Navigation

Live / planned docs in this guide:

| Doc | Content | Status |
|-----|---------|--------|
| **1-overview (this page)** | Decision tree, repo navigation, tech stack | ✅ |
| [2-architecture](./2-architecture.md) | Crate layout, process model, event bus, extension ABI, storage, threading | ✅ |
| [3-extension-sdk](./3-extension-sdk.md) | `neomind_export!` macro, capabilities, ML model lifecycle, cross-platform packaging | ✅ |
| [4-rest-api](./4-rest-api.md) | HTTP API reference (devices / dashboards / rules / agents / messages / extensions / data-push / LLM) | ✅ |
| [7-extension-development](./7-extension-development.md) | Hands-on guide to building an extension on the SDK | ✅ |
| 5-websocket-realtime | Realtime API (WebSocket / SSE) | Phase 2 |
| 6-device-type-development | Detailed device type spec | Phase 2 |
| 8-dashboard-component-dev | Detailed dashboard component spec | Phase 2 |
| 9-contribute-to-main | Main project contribution guide (CI, PR flow) | Phase 2 |
| 10-llm-backend-integration | LLM backend integration guide | Phase 2 |

## Need Deeper Reference?

Code-level detail currently lives under the product repo's `docs/guides/` (organized by module, ~19 docs). These are a **migration source** — this guide will progressively absorb the externally valuable content into the relevant sections; once migrated, the source file is removed from the product repo, leaving the wiki as the single source of truth. During the transition, the deepest code references can still be found in the product repo's `docs/guides/`.

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
