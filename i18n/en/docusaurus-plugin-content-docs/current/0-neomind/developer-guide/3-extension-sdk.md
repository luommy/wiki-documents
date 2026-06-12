---
description: "neomind-extension-sdk reference: Extension trait, ExtensionMetadata, MetricDescriptor, neomind_export! FFI macro, capability declaration, ML model lifecycle (lazy-load + keep-loaded), cross-platform packaging (cdylib + panic=unwind)."
keywords: [NeoMind, Extension SDK, neomind_export, FFI, capability, ML model, packaging]
tags: [NeoMind, Developer Guide]
---

# Extension SDK

The `neomind-extension-sdk` crate (latest v0.6.1) is the core library for writing NeoMind extensions. It defines the `Extension` trait, metadata / metric / command types, and the `neomind_export!` macro that turns your impl into an FFI entry point the main process's `neomind-extension-runner` can load.

> This page covers the SDK itself. For the end-to-end build flow, see [Extension Development](./7-extension-development.md).

## How It Works

```
┌────────────────────────┐         ┌──────────────────────────┐
│  Your extension crate   │         │  neomind-extension-runner │
│  (cdylib)               │         │  (main-process submodule) │
│                         │  FFI    │                          │
│  impl Extension ──┐     │ ◀─────▶ │  ExtensionProxy          │
│  neomind_export! ─┤     │  C ABI  │   - spawn process         │
│   emits extern "C"│     │         │   - capability check      │
│   entry fns       │     │         │   - metric/command relay  │
└────────────────────┴────┘         └──────────────────────────┘
```

- You only write the trait impl + one line of `neomind_export!`
- The SDK macro emits the agreed C ABI entry points (`extern "C"` functions)
- The runner loads your `.so` / `.dylib` / `.dll`, invokes the entries, and wraps your extension in an `ExtensionProxy` registered with the main process
- Data crosses the FFI boundary as serde JSON (metric values, command args, config)

## Cargo.toml Template

```toml
[package]
name = "my-extension"
version = "1.0.0"
edition = "2021"

[lib]
name = "neomind_extension_my_extension"   # prefix MUST be neomind_extension_
crate-type = ["cdylib", "rlib"]

[dependencies]
neomind-extension-sdk = "0.6.1"   # or path = "../NeoMind/crates/neomind-extension-sdk"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
async-trait = "0.1"
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
semver = "1"

[profile.release]
panic = "unwind"    # REQUIRED — panics must unwind so the runner can catch them
opt-level = 3
lto = "thin"
```

**Critical settings**:

- `crate-type = ["cdylib"]` — produce a dynamic library
- lib name prefix `neomind_extension_` — the runner looks up extensions by this naming convention
- `panic = "unwind"` — so a panic is caught by the runner rather than killing the process

## The Extension Trait

Every extension implements the `Extension` trait. The full signature is re-exported in `neomind_extension_sdk::prelude`.

```rust
use async_trait::async_trait;
use neomind_extension_sdk::prelude::*;

#[async_trait]
impl Extension for MyExtension {
    // ===== Required =====
    fn metadata(&self) -> &ExtensionMetadata;
    async fn execute_command(&self, command: &str, args: &serde_json::Value)
        -> Result<serde_json::Value>;

    // ===== Optional (defaults provided) =====
    fn metrics(&self) -> &[MetricDescriptor] { &[] }
    fn commands(&self) -> &[ExtensionCommand] { &[] }
    fn produce_metrics(&self) -> Result<Vec<ExtensionMetricValue>> { Ok(vec![]) }
    async fn health_check(&self) -> Result<bool> { Ok(true) }
    async fn configure(&mut self, _config: &serde_json::Value) -> Result<()> { Ok(()) }
    fn handle_event(&self, _ty: &str, _payload: &serde_json::Value) -> Result<()> { Ok(()) }
    fn event_subscriptions(&self) -> &[&str] { &[] }
    // streaming / push-mode methods (optional)...
    fn as_any(&self) -> &dyn std::any::Any;
}
```

**Method semantics**:

| Method | When Called | Your Job |
|--------|-------------|----------|
| `metadata()` | on load | return static id / name / version |
| `metrics()` | on load + UI query | declare metrics this extension produces (so the dashboard can pick them) |
| `commands()` | on load + UI query | declare commands this extension supports (so the AI agent can call them) |
| `produce_metrics()` | periodic runner poll | return current metric values (poll mode) |
| `execute_command()` | user / agent triggers a command | execute and return JSON |
| `configure()` | user changes config | apply new config (hot reload) |
| `health_check()` | runner heartbeat | return false to be marked unhealthy |
| `handle_event()` | a subscribed event fires | custom event response |
| `event_subscriptions()` | on load | declare which event types you care about |

## Metadata / Metric / Command

**ExtensionMetadata** (returned by `metadata()`):

```rust
ExtensionMetadata {
    id: "weather-forecast".into(),          // globally unique id
    name: "Weather Forecast".into(),        // display name
    version: Version::parse("1.0.0").unwrap(),
    description: Some("...".into()),
    author: Some("CamThink".into()),
    license: Some("MIT".into()),
    config_parameters: Some(vec![           // user-configurable params
        ParameterDefinition { /* name, type, default, ... */ },
    ]),
    // ...
}
```

**MetricDescriptor** (returned by `metrics()`): declares a data stream. The dashboard's "data source picker" lists every metric declared here; the DataSourceId format is `extension:{id}:{metric_name}`.

**ExtensionCommand** (returned by `commands()`): declares a callable command. The agent's tool system auto-exposes these to the LLM, so users can trigger them from AI Chat.

> Use the SDK's builders (`MetricBuilder`, `CommandBuilder`, `ParamBuilder`) for safer chain-style construction over hand-written literals.

## The neomind_export! Macro

After implementing the trait, **just one line**:

```rust
neomind_extension_sdk::neomind_export!(MyExtension);
```

The macro expands to the agreed `extern "C"` entry points (construct instance, call metadata / metrics / commands / execute_command, etc.). The runner loads these by symbol-name convention.

> Don't hand-write FFI functions — let the macro do it. If you need custom construction (e.g. read initial config from env), implement `Default` for your type so the macro can use `Default::default()`.

## Capability System

Extensions run in an isolated process and **must declare required capabilities** at startup. The runner authorizes exactly those; calls requiring undeclared capabilities are rejected.

| Capability | Meaning |
|------------|---------|
| `network` | outbound network (HTTP / MQTT clients, etc.) |
| `filesystem:read` / `filesystem:write` | file IO (path-scoped) |
| `ml-model` | load / run ML models |
| `camera` | camera access |
| `serial` | serial port access |

Declaration: list them in the metadata's `config_parameters` or a separate manifest field (exact format depends on the SDK version).

> Capabilities embody **least privilege** — declare only what you actually need. `network` + `ml-model` is typical for vision extensions; a read-only data extension might just need `network`.

## ML Model Lifecycle

Vision extensions usually need ML models. The SDK provides unified lifecycle management:

| Phase | Behavior |
|-------|----------|
| **Lazy load** | the model isn't loaded at extension startup — it's loaded on the first command call |
| **Keep loaded** | once loaded, it stays resident (until the extension process exits), avoiding reload per inference |
| **Explicit release** | rarely needed; for huge models you can manually reload after swapping the model path in `configure()` |

**Why lazy load**: don't block the runner at startup; multiple extensions starting together won't all load their models simultaneously (models are often GB-sized).

**Why keep loaded**: model loading is a seconds-to-tens-of-seconds operation; reloading per inference would make the extension feel "stuck".

Canonical pattern:

```rust
pub struct YoloExtension {
    model: OnceLock<YoloModel>,   // initialized once per process
}

async fn execute_command(&self, cmd: &str, args: &Value) -> Result<Value> {
    let model = self.model.get_or_try_init(|| {
        YoloModel::load("yolov8n.onnx")   // loads only on first call
    })?;
    let result = model.infer(/* ... */)?;
    Ok(json!({ "detections": result }))
}
```

## Cross-Platform Packaging

Extensions must support every NeoMind target platform — one binary per platform:

| Platform | Artifact |
|----------|----------|
| macOS (arm64) | `libneomind_extension_<name>.dylib` |
| macOS (x86_64) | `.dylib` |
| Linux (x86_64) | `libneomind_extension_<name>.so` |
| Linux (arm64) | `.so` |
| Windows (x86_64) | `neomind_extension_<name>.dll` |

**Cross-compile** with `cross` or a GitHub Actions matrix (the NeoMind-Extensions repo CI is the canonical template).

**Packaging a `.nmext`**: bundle the multi-platform binaries + metadata.json + (optional) model files into a single `.nmext` archive. Users install it from the NeoMind Extensions page in one click; the runner picks the binary matching the current platform.

## Verify & Debug

```bash
# 1. Build locally
cargo build --release

# 2. Copy the artifact into NeoMind's extension dir
cp target/release/libneomind_extension_my_extension.* ~/.neomind/extensions/my-extension/

# 3. Trigger discovery
curl -X POST http://localhost:9375/api/extensions/discover

# 4. Check whether the runner loaded it
# Web UI: Extensions page (Loaded / Crashed / Disabled)
# Logs: data/logs/ or journalctl
```

**Common load-failure causes**:

- Wrong lib name prefix (must be `neomind_extension_`)
- `panic = "abort"` (must be `unwind`)
- Platform mismatch (arm64 binary on x86_64)
- Missing capability declaration, runtime call rejected

## Next Steps

- End-to-end build → [Extension Development](./7-extension-development.md)
- Real extension code → [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) (weather / YOLO / OCR / face recognition / streaming)
- API surface (metric / command HTTP endpoints) → [REST API Reference](./4-rest-api.md)

---

*Last updated: 2026-06-12 · NeoMind v0.8.11 · SDK v0.6.1*
