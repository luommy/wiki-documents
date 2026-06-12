---
description: "用 neomind-extension-sdk 从零开发一个 NeoMind 扩展的实战指南：脚手架、Cargo.toml 配置、Extension trait 实现、neomind_export! 导出、跨平台编译、打包 .nmext、安装与调试。"
keywords: [NeoMind, 扩展开发, extension, 实战, FFI, 打包]
tags: [NeoMind, 开发指南]
---

# 扩展开发实战

本文是端到端的扩展开发教程——从空目录到一个能被 NeoMind 加载、能被 Agent 调用的扩展。读完你能写出自己的扩展。

> **前置**：先读 [Extension SDK](./3-extension-sdk.md) 理解 trait、宏、capability、ML 模型生命周期的概念。本文是 hands-on 流程。

## 目标

我们做一个 **Counter 扩展**：维护一个计数器，对外提供一个 `increment` 命令（让 AI Agent 能调用）和一个 `counter` 指标（让仪表板能展示）。麻雀虽小，覆盖完整的 metric / command / FFI 流程。

## Step 1：建项目

```bash
cargo new --lib counter-extension
cd counter-extension
```

## Step 2：配置 Cargo.toml

```toml
[package]
name = "counter-extension"
version = "1.0.0"
edition = "2021"

[lib]
name = "neomind_extension_counter"        # 前缀必须是 neomind_extension_
crate-type = ["cdylib", "rlib"]

[dependencies]
neomind-extension-sdk = "0.6.1"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
async-trait = "0.1"
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
semver = "1"

[profile.release]
panic = "unwind"     # 必须！runner 靠 unwind 捕获 panic
opt-level = 3
lto = "thin"
```

**两个关键点**：

- lib 名前缀 `neomind_extension_` —— runner 按此约定查找
- `panic = "unwind"` —— 让扩展崩溃可被捕获而非拖垮 runner

## Step 3：实现 Extension

`src/lib.rs`：

```rust
use async_trait::async_trait;
use neomind_extension_sdk::prelude::*;
use std::sync::atomic::{AtomicI64, Ordering};

pub struct CounterExtension {
    counter: AtomicI64,
}

impl CounterExtension {
    pub fn new() -> Self {
        Self { counter: AtomicI64::new(0) }
    }
}

#[async_trait]
impl Extension for CounterExtension {
    fn metadata(&self) -> &ExtensionMetadata {
        static META: std::sync::OnceLock<ExtensionMetadata> = std::sync::OnceLock::new();
        META.get_or_init(|| ExtensionMetadata {
            id: "counter".into(),
            name: "Counter".into(),
            version: semver::Version::parse("1.0.0").unwrap(),
            description: Some("A minimal counter extension".into()),
            author: Some("You".into()),
            license: Some("MIT".into()),
            ..Default::default()
        })
    }

    fn metrics(&self) -> &[MetricDescriptor] {
        static METRICS: std::sync::OnceLock<Vec<MetricDescriptor>> = std::sync::OnceLock::new();
        METRICS.get_or_init(|| vec![
            MetricDescriptor {
                name: "counter".into(),
                display_name: "Counter".into(),
                data_type: MetricDataType::Integer,
                unit: String::new(),
                min: None, max: None, required: false,
            },
        ])
    }

    fn commands(&self) -> &[ExtensionCommand] {
        static COMMANDS: std::sync::OnceLock<Vec<ExtensionCommand>> = std::sync::OnceLock::new();
        COMMANDS.get_or_init(|| vec![
            ExtensionCommand {
                name: "increment".into(),
                display_name: "Increment".into(),
                description: "Increment the counter".into(),
                parameters: vec![/* amount: Integer, default 1 */],
                llm_hints: "Increment the counter value".into(),
                ..Default::default()
            },
        ])
    }

    async fn execute_command(
        &self,
        command: &str,
        args: &serde_json::Value,
    ) -> Result<serde_json::Value> {
        match command {
            "increment" => {
                let amount = args.get("amount").and_then(|v| v.as_i64()).unwrap_or(1);
                let new_value = self.counter.fetch_add(amount, Ordering::SeqCst) + amount;
                Ok(serde_json::json!({ "counter": new_value }))
            }
            _ => Err(ExtensionError::CommandNotFound(command.into())),
        }
    }

    fn produce_metrics(&self) -> Result<Vec<ExtensionMetricValue>> {
        Ok(vec![ExtensionMetricValue::new(
            "counter",
            ParamMetricValue::Integer(self.counter.load(Ordering::SeqCst)),
        )])
    }

    fn as_any(&self) -> &dyn std::any::Any { self }
}

// 关键的一行 —— FFI 导出
neomind_extension_sdk::neomind_export!(CounterExtension);
```

**模式要点**：

- `OnceLock<T>` 让 metadata / metrics / commands 是进程级单例（避免每次调用分配）
- `execute_command` 是 Agent 触发的入口 —— LLM 会按 `commands()` 的 schema 拼参数
- `produce_metrics` 是轮询入口 —— runner 定期调用，把返回值写入 `telemetry.redb`
- **最后一行** `neomind_export!` 把整个 impl 暴露为 FFI 入口

## Step 4：编译

```bash
cargo build --release
```

产物路径：

- macOS：`target/release/libneomind_extension_counter.dylib`
- Linux：`target/release/libneomind_extension_counter.so`
- Windows：`target/release/neomind_extension_counter.dll`

## Step 5：安装到 NeoMind

把产物放到 NeoMind 的扩展目录（默认 `~/.neomind/extensions/<id>/` 或服务器部署的 `/var/lib/neomind/extensions/<id>/`）：

```bash
mkdir -p ~/.neomind/extensions/counter
cp target/release/libneomind_extension_counter.* ~/.neomind/extensions/counter/

# 触发扫描
curl -X POST http://localhost:9375/api/extensions/discover
```

或者更简单 —— 在 Web UI 的 **Extensions** 页点 **Install from file**，上传 `.dylib` / `.so` / `.dll`。

## Step 6：验证

```bash
# 列出扩展，应能看到 counter
curl http://localhost:9375/api/extensions

# 调用命令
curl -X POST http://localhost:9375/api/extensions/counter/commands/increment \
  -H 'Content-Type: application/json' \
  -d '{"amount": 5}'
# → {"success": true, "data": {"counter": 5}}
```

或者在 **AI Chat** 里说「调用 counter 扩展的 increment 命令，加 3」—— LLM 会自动找到 `increment` 命令并调用（因为 `commands()` 已经声明给了 Agent 工具系统）。

在仪表板里加一个数值卡，数据源选 `extension:counter:counter`，即可看到实时数值。

## Step 7：跨平台打包 `.nmext`

单平台 `.dylib` 只能在 macOS 跑。要分发，需多平台编译并打包：

```bash
# 用 cross 或 GitHub Actions 矩阵编译全部目标
cross build --release --target x86_64-unknown-linux-gnu
cross build --release --target aarch64-unknown-linux-gnu
cross build --release --target x86_64-pc-windows-msvc
# Apple Silicon / Intel macOS 各一份

# 打包成 .nmext（一个 zip 归档）
mkdir -p nmext/{linux-x64,linux-arm64,windows-x64,darwin-arm64,darwin-x64}
cp target/x86_64-unknown-linux-gnu/release/libneomind_extension_counter.so nmext/linux-x64/
# ... 其他平台
cat > nmext/metadata.json <<EOF
{ "id": "counter", "version": "1.0.0", "platforms": { ... } }
EOF
cd nmext && zip -r ../counter-1.0.0.nmext .
```

`.nmext` 是约定俗成的归档格式（参考 NeoMind-Extensions 仓库的 CI 脚本）。用户在 Web UI 一键安装时，runner 会挑当前平台对应的二进制加载。

## 进阶：加 ML 模型 / 网络 / 事件订阅

- **ML 模型**：用 `OnceLock<Model>` 实现 lazy-load（首次命令时加载，之后常驻）—— 见 [SDK — ML 模型生命周期](./3-extension-sdk.md#ml-模型生命周期)
- **网络访问**：在 metadata 声明 `capabilities: ["network"]`，runner 才允许出站请求
- **事件订阅**：实现 `event_subscriptions()` 返回关心的事件类型列表，`handle_event()` 处理事件
- **流式输出**（视频 / 推送）：实现 `stream_capability()` + `process_chunk()` 或 push 模式方法（见 SDK trait 完整签名）

## 参考实现

[NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) 仓库的每个扩展都是完整范本：

- `weather-forecast-v2` —— 简单网络扩展（无 ML 模型）
- `image-analyzer-v2` —— ML 模型 lazy-load 范本（YOLOv11）
- `yolo-video-v2` —— 流式视频处理
- `yolo-device-inference` —— 与 NE301/NE101 相机集成
- `home-assistant-bridge` —— 第三方系统集成

读其中一个的源码，比任何文档都直观。

## 常见坑

| 现象 | 原因 |
|------|------|
| 加载报 "symbol not found" | lib 名前缀不是 `neomind_extension_` |
| 扩展 panic 后被永久禁用 | `panic = "abort"`（必须 `unwind`） |
| 命令调用报 "permission denied" | 缺少对应 capability 声明 |
| Agent 看不到我的命令 | `commands()` 没实现，或 `llm_hints` 字段为空（影响 LLM 发现） |
| 仪表板选不到我的 metric | `metrics()` 没实现，或 name 拼写与 DataSourceId 不一致 |
| 跨平台分发报错 | 漏了某个目标平台的二进制；`.nmext` 里 metadata.json 的 platforms 字段不全 |

## 下一步

- 把你的扩展提 PR 到 [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions)，让社区用上
- 涉及 HTTP API 的扩展命令调用细节 → [REST API 参考](./4-rest-api.md)
- Dashboard 组件开发（如果想让扩展带可视化）→ Phase 2 `8-dashboard-component-dev.md`

---

*最后更新: 2026-06-12 · NeoMind v0.8.11 · SDK v0.6.1*
