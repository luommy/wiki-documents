---
description: "NeoMind 扩展管理指南：安装与卸载扩展（.nmext）、官方扩展市场、扩展能力（指标/命令/视觉）、进程隔离与崩溃保护、配置参数。"
keywords: [NeoMind, 扩展, extension, 安装, 市场, 进程隔离]
tags: [NeoMind, 用户指南]
---

# 扩展管理

扩展（Extension）是 NeoMind 的**可插拔能力模块**——视觉 AI、OCR、天气预报、自定义数据源等，都以扩展形式接入。扩展运行在**独立进程**中，通过 FFI 通信，崩溃不影响主服务。

## 什么是扩展？

扩展为 NeoMind 提供三类能力：

| 能力 | 说明 | 示例 |
|------|------|------|
| **指标（Metric）** | 扩展产出的时序数据，写入 `telemetry.redb`，可在仪表板展示 | 天气扩展的 `temperature` 指标 |
| **命令（Command）** | 可被 AI Agent / API / 规则调用的操作 | YOLO 扩展的 `detect` 命令 |
| **组件（Component）** | 仪表板自定义可视化组件 | 视觉扩展的实时画面组件 |

## 官方扩展

[NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) 仓库提供官方扩展：

| 扩展 | 类型 | 说明 |
|------|------|------|
| **Weather Forecast** | 数据源 | 天气预报与实时气象数据 |
| **YOLO Detection** | 视觉 AI | 目标检测（YOLO 模型），支持图片和视频流 |
| **OCR** | 视觉 AI | 图片文字提取（PaddleOCR） |
| **Face Recognition** | 视觉 AI | 人脸检测与识别 |
| **Video Stream** | 流处理 | RTSP/RTMP 视频流接入与推理 |
| **Device Inference** | 设备推理 | 边缘 AI 相机（NE101/NE301）推理结果接入 |

详见 [应用案例](../use-cases/1-object-detection.md) 中的端到端示例。

## 安装扩展

### 方式一：Web UI（推荐）

1. 进入 **Extensions** 页签
2. 点击 **Install Extension** 或 **Upload**
3. 上传 `.nmext` 包（从 [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions/releases) 下载）
4. NeoMind 自动解包、验证 ABI 版本、加载

安装后扩展自动启动。如果扩展声明了 `config_parameters`（如 API Key），需先配置参数才能正常运行。

### 方式二：CLI

```bash
# 安装扩展
neomind extension install /path/to/weather-forecast.nmext

# 从 URL 安装
neomind extension install https://github.com/camthink-ai/NeoMind-Extensions/releases/download/v0.6.1/weather-forecast-v0.6.1.nmext

# 列出已安装扩展
neomind extension list

# 查看扩展详情（指标、命令、配置参数）
neomind extension get <extension_id>

# 卸载
neomind extension uninstall <extension_id>
```

### 方式三：AI Chat

直接对 [AI Chat](./5-ai-chat.md) 说：

> 「帮我安装天气扩展」

LLM 会引导你上传 `.nmext` 包或提供下载链接。

## 配置扩展

部分扩展需要配置参数才能运行（如天气扩展需要 API Key）。安装后：

1. 在 **Extensions** 页签点击扩展进入详情
2. 在 **Configuration** 面板填写参数
3. 保存后扩展自动重启

配置参数有类型校验（字符串 / 整数 / 布尔 / 枚举），错误的值会在保存时报错。

## 扩展状态

| 状态 | 图标 | 说明 |
|------|------|------|
| **Running** | 绿色 | 扩展正常运行中 |
| **Stopped** | 灰色 | 扩展已停止（手动停止或未配置） |
| **Error** | 红色 | 扩展崩溃或加载失败 |
| **Warning** | 黄色 | 扩展运行中但有异常（如 API 限流） |

### 启停扩展

```bash
# 停止扩展
neomind extension stop <extension_id>

# 启动扩展
neomind extension start <extension_id>

# 重启扩展
neomind extension restart <extension_id>
```

## 崩溃保护

扩展运行在独立进程中。如果扩展崩溃：

1. **主服务不受影响** — API、MQTT、仪表板、其他扩展继续运行
2. **自动重启** — 扩展崩溃后自动重启（熔断器机制）
3. **崩溃循环检测** — 如果短时间内连续崩溃（如 5 分钟内 5 次），扩展进入 **Crash Loop** 状态，停止自动重启，防止资源耗尽
4. **应用内通知** — 崩溃事件写入消息中心

崩溃循环需要手动排查（查看日志 `data/logs/`）后重启扩展。

## 使用扩展数据

### 在仪表板中

扩展指标和设备指标一样使用。在仪表板编辑器中添加组件时，数据源选择扩展指标：

- DataSourceId 格式：`extension:<extension_id>:<metric_name>`
- 示例：`extension:weather:temperature`

### 在 AI Chat 中

> 「调用天气扩展，查一下上海明天会下雨吗？」

LLM 自动调用扩展的命令工具。

### 在 AI Agent 中

[Agent](./6-ai-agent.md) Focused 模式可绑定扩展指标作为数据源，或绑定扩展工具作为分析能力。

### 在规则中

[自动化规则](./7-automation-rules.md) 可用扩展指标做条件：

```
RULE "高温预警"
WHEN extension("weather").tomorrow_temp > 35
DO
  NOTIFY "明日高温预警"
END
```

## 扩展包格式（.nmext）

`.nmext` 是 NeoMind 扩展的标准打包格式，本质是一个 ZIP 包：

```
weather-forecast.nmext
├── manifest.json      # 扩展元数据（ID、名称、版本、ABI 版本、能力声明）
├── extension.so       # 编译后的动态库（Linux）
├── extension.dylib    # macOS
├── extension.dll      # Windows
└── assets/            # 模型文件、配置模板等（可选）
```

扩展需匹配主服务的 **ABI 版本**（当前 v3），不匹配会被拒绝加载。

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 安装后扩展 Error | ABI 版本不匹配 | 升级扩展或主服务到匹配版本 |
| 扩展指标不显示 | 扩展未配置 / API Key 错误 | 检查 Configuration 面板 |
| 扩展 Crash Loop | 初始化失败 / 模型缺失 | 查看日志 `data/logs/`，修复后重启 |
| AI 无法调用扩展命令 | 扩展已停止 | 在 Extensions 页签启动扩展 |
| 扩展安装后无组件 | 扩展未提供 Dashboard 组件 | 该扩展只提供指标/命令，无可视化组件 |

更多见 [故障排查](./10-troubleshooting.md)。

## 自己开发扩展？

扩展开发见 [开发指南](../developer-guide/7-extension-development.md)，包含从零创建扩展的完整教程。

---

*最后更新: 2026-06-13 · NeoMind v0.8.11*
