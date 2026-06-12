---
description: "neomind-extension-sdk 参考：Extension trait、ExtensionMetadata、MetricDescriptor、neomind_export! FFI 宏、capability 声明、ML 模型生命周期（lazy-load + keep-loaded）、跨平台打包（cdylib + panic=unwind）。"
keywords: [NeoMind, Extension SDK, neomind_export, FFI, capability, ML 模型, 打包]
tags: [NeoMind, 开发指南]
---

# Extension SDK

`neomind-extension-sdk`（最新 v0.6.1）是写 NeoMind 扩展的核心 crate。它定义了 `Extension` trait、metadata / metric / command 类型，并提供 `neomind_export!` 宏把你的实现自动导出为 FFI 入口，让主进程的 `neomind-extension-runner` 能加载。

> 本文聚焦 SDK 本身。端到端的实战流程见 [扩展开发实战](./7-extension-development.md)。

## 工作原理

```
┌────────────────────────┐         ┌──────────────────────────┐
│  你的扩展 crate          │         │  neomind-extension-runner │
│  (cdylib)               │         │  (主进程的子模块)         │
│                         │  FFI    │                          │
│  impl Extension ──┐     │ ◀─────▶ │  ExtensionProxy          │
│  neomind_export! ─┤     │  C ABI  │   - spawn 进程            │
│   生成 extern "C" │     │         │   - capability 校验       │
│   入口函数        │     │         │   - metric/command 转发   │
└────────────────────┴────┘         └──────────────────────────┘
```

- 你只写 Rust trait impl + 一行 `neomind_export!`
- SDK 宏生成约定的 C ABI 入口（`extern "C"` 函数）
- runner 加载你的 `.so` / `.dylib` / `.dll`，调用入口，包装为 `ExtensionProxy` 注册到主进程
- 跨 FFI 边界的数据用 serde JSON 序列化（metric 值、命令参数、配置）

## Cargo.toml 模板

```toml
[package]
name = "my-extension"
version = "1.0.0"
edition = "2021"

[lib]
name = "neomind_extension_my_extension"   # 前缀必须是 neomind_extension_
crate-type = ["cdylib", "rlib"]

[dependencies]
neomind-extension-sdk = "0.6.1"   # 或 path 指向本地 SDK
serde = { version = "1", features = ["derive"] }
serde_json = "1"
async-trait = "0.1"
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
semver = "1"

[profile.release]
panic = "unwind"    # 必须！扩展进程 panic 必须能 unwind 才能被 runner 捕获
opt-level = 3
lto = "thin"
```

**关键点**：

- `crate-type = ["cdylib"]` —— 产出动态库
- lib 名前缀 `neomind_extension_` —— runner 按命名约定查找
- `panic = "unwind"` —— 让 panic 被 runner 接住而非终止进程

## Extension Trait

所有扩展必须实现 `Extension` trait。完整签名在 `neomind-extension-sdk::prelude` 中导出。

```rust
use async_trait::async_trait;
use neomind_extension_sdk::prelude::*;

#[async_trait]
impl Extension for MyExtension {
    // ===== 必填 =====
    fn metadata(&self) -> &ExtensionMetadata;
    async fn execute_command(&self, command: &str, args: &serde_json::Value)
        -> Result<serde_json::Value>;

    // ===== 选填（默认实现已给出）=====
    fn metrics(&self) -> &[MetricDescriptor] { &[] }
    fn commands(&self) -> &[ExtensionCommand] { &[] }
    fn produce_metrics(&self) -> Result<Vec<ExtensionMetricValue>> { Ok(vec![]) }
    async fn health_check(&self) -> Result<bool> { Ok(true) }
    async fn configure(&mut self, _config: &serde_json::Value) -> Result<()> { Ok(()) }
    fn handle_event(&self, _ty: &str, _payload: &serde_json::Value) -> Result<()> { Ok(()) }
    fn event_subscriptions(&self) -> &[&str] { &[] }
    // 流式 / 推送模式相关方法（选填）...
    fn as_any(&self) -> &dyn std::any::Any;
}
```

**核心方法的语义**：

| 方法 | 何时被调用 | 你的职责 |
|------|-----------|---------|
| `metadata()` | 加载时 | 返回静态 ID / 名称 / 版本 |
| `metrics()` | 加载时 + UI 查询 | 声明本扩展产出的指标（让仪表板能选） |
| `commands()` | 加载时 + UI 查询 | 声明本扩展支持的命令（让 AI Agent 能调用） |
| `produce_metrics()` | runner 定期轮询 | 返回当前指标值（轮询模式） |
| `execute_command()` | 用户 / Agent 触发命令 | 执行并返回 JSON 结果 |
| `configure()` | 用户改配置 | 应用新配置（热更新） |
| `health_check()` | runner 心跳 | 返回 false 会被标记 unhealthy |
| `handle_event()` | 订阅的事件发生 | 自定义事件响应 |
| `event_subscriptions()` | 加载时 | 声明关心哪些事件类型 |

## Metadata / Metric / Command

**ExtensionMetadata**（在 `metadata()` 返回）：

```rust
ExtensionMetadata {
    id: "weather-forecast".into(),          // 全局唯一 ID
    name: "Weather Forecast".into(),        // 显示名
    version: Version::parse("1.0.0").unwrap(),
    description: Some("...".into()),
    author: Some("CamThink".into()),
    license: Some("MIT".into()),
    config_parameters: Some(vec![           // 用户可配置的参数
        ParameterDefinition { /* name, type, default, ... */ },
    ]),
    // ...
}
```

**MetricDescriptor**（在 `metrics()` 返回）：声明一个数据流。仪表板的「数据源选择器」会列出这里声明的所有 metric，DataSourceId 格式为 `extension:{id}:{metric_name}`。

**ExtensionCommand**（在 `commands()` 返回）：声明一个可调用命令。Agent 的 tool 系统会自动把这些命令暴露给 LLM，用户在 AI Chat 里就能触发。

> 用 SDK 提供的 builder（`MetricBuilder`、`CommandBuilder`、`ParamBuilder`）链式构造，比手写字面量更安全。

## neomind_export! 宏

trait 实现完之后，**只需一行**：

```rust
neomind_extension_sdk::neomind_export!(MyExtension);
```

宏会展开为约定的 `extern "C"` 入口函数（构造实例、调用 metadata / metrics / commands / execute_command 等）。runner 按符号名约定加载这些入口。

> 不要手写 FFI 函数 —— 让宏处理。如果需要自定义构造逻辑（例如从环境变量读初始配置），可以实现 `Extension::default()` 让宏用 `Default::default()` 构造。

## Capability 系统

扩展运行在隔离进程里，启动时**必须声明所需能力**。runner 按声明授权，未声明的能力调用会被拒。

| Capability | 含义 |
|------------|------|
| `network` | 出站网络访问（HTTP / MQTT 客户端等） |
| `filesystem:read` / `filesystem:write` | 文件读写（限定路径范围） |
| `ml-model` | 加载 / 运行 ML 模型 |
| `camera` | 访问相机 |
| `serial` | 串口访问 |

声明方式：在 metadata 的 `config_parameters` 或单独的 manifest 字段中列出（具体格式见 SDK 版本对应文档）。

> Capability 是**最小权限原则**的体现：只声明你真正需要的。`network` + `ml-model` 是视觉类扩展的典型组合；只读数据扩展可能只需 `network`。

## ML 模型生命周期

视觉类扩展通常需要 ML 模型。SDK 提供统一的生命周期管理：

| 阶段 | 行为 |
|------|------|
| **Lazy load** | 模型不在扩展启动时加载，而是在第一次命令调用时才载入内存 |
| **Keep loaded** | 一旦加载就常驻（直到扩展进程退出），避免每次推理重新加载 |
| **显式释放** | 极少需要；若模型超大可在 `configure()` 里换 model path 后手动重载 |

**为什么 lazy load**：扩展启动时不阻塞 runner，多个扩展同时启动不会同时把所有模型载入内存（很多模型 GB 级）。

**为什么 keep loaded**：模型加载是秒级到十秒级操作，每次推理都重载会让用户觉得扩展"卡"。

实现范式：

```rust
pub struct YoloExtension {
    model: OnceLock<YoloModel>,   // 进程内只初始化一次
}

async fn execute_command(&self, cmd: &str, args: &Value) -> Result<Value> {
    let model = self.model.get_or_try_init(|| {
        YoloModel::load("yolov8n.onnx")   // 首次调用才加载
    })?;
    let result = model.infer(/* ... */)?;
    Ok(json!({ "detections": result }))
}
```

## 跨平台打包

扩展要支持 NeoMind 全部目标平台。每个平台一份编译产物：

| 平台 | 产物 |
|------|------|
| macOS (arm64) | `libneomind_extension_<name>.dylib` |
| macOS (x86_64) | `.dylib` |
| Linux (x86_64) | `libneomind_extension_<name>.so` |
| Linux (arm64) | `.so` |
| Windows (x86_64) | `neomind_extension_<name>.dll` |

**交叉编译**建议用 `cross` 或 GitHub Actions 矩阵（NeoMind-Extensions 仓库的 CI 是参考样板）。

**打包成 `.nmext`**：把多平台二进制 + metadata.json + （可选）模型文件打成单个 `.nmext` 归档，用户在 NeoMind Extensions 页一键安装，runner 会自动挑匹配当前平台的二进制。

## 验证与调试

```bash
# 1. 本地编译
cargo build --release

# 2. 把产物复制到 NeoMind 扩展目录
cp target/release/libneomind_extension_my_extension.* ~/.neomind/extensions/my-extension/

# 3. 触发扫描
curl -X POST http://localhost:9375/api/extensions/discover

# 4. 看 runner 是否成功加载
# Web UI: Extensions 页看状态（Loaded / Crashed / Disabled）
# 日志: data/logs/ 或 journalctl
```

**常见加载失败原因**：

- lib 名前缀不对（必须 `neomind_extension_`）
- `panic = "abort"`（必须 `unwind`）
- 平台不匹配（arm64 跑了 x86_64 二进制）
- 缺少 capability 声明，运行时调用被拒

## 下一步

- 端到端写一个扩展 → [扩展开发实战](./7-extension-development.md)
- 看真实扩展代码 → [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) 仓库（weather / YOLO / OCR / 人脸识别 / 流媒体）
- API 层（metric / command 的 HTTP 端点）→ [REST API 参考](./4-rest-api.md)

---

*最后更新: 2026-06-12 · NeoMind v0.8.11 · SDK v0.6.1*
