---
description: NeoMind 是一款基于大语言模型（LLM）的边缘 AI 平台，支持本地部署、设备管理、自动化控制和 AI 对话。本指南将帮助您快速完成安装、配置和核心功能的使用。
keywords: [NeoMind, 快速入门, 边缘 AI, LLM 平台, 设备管理, MQTT, Ollama, 自动化, IoT]
tags: [NeoMind, 快速入门, 边缘 AI, 设备管理]
---

import SupportGrid from '@site/src/components/SupportGrid';

# NeoMind Quick Start Guide

## 概述

NeoMind 是一款创新性的边缘 AI 平台，将大语言模型（LLM）的强大能力带入Camthink AI相机和物联网设备管理和自动化控制。通过自然语言界面，您可以轻松查询设备状态、创建自动化规则，并与 AI 助手进行智能对话。

**核心特性**：

- **LLM 驱动**：支持 Ollama、OpenAI、Anthropic 等多种大模型后端
- **边缘部署**：完全离线运行，数据安全可控
- **设备管理**：支持 MQTT 协议，自动发现和注册设备
- **自动化引擎**：事件驱动的规则引擎，实现智能联动
- **AI 智能体**：自主执行复杂任务的智能代理
- **跨平台支持**：macOS、Windows、Linux 原生桌面应用

**系统要求**：

- **操作系统**：macOS 11+、Windows 10+、Ubuntu 20.04+
- **内存**：8GB RAM（推荐 16GB+）
- **存储**：5GB 可用空间
- **网络**：支持本地离线运行（推荐联网获取模型）

## 1. 安装与注册

### 1.1 下载与安装

访问 [NeoMind 官方发布页面](https://github.com/camthink-ai/NeoMind/releases/latest)，选择适合您操作系统的安装包：

- **macOS**：下载 `.dmg` 文件（支持 Apple Silicon 和 Intel 芯片）
- **Windows**：下载 `.msi` 或 `.exe` 安装程序
- **Linux**：下载 `.AppImage` 或 `.deb` 包

**macOS 安装步骤**：

1. 双击下载的 `.dmg` 文件，将 NeoMind 拖入 Applications 文件夹

![NeoMind macOS 安装](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-install-macOS.png)

1. **重要**：首次启动前需执行以下命令（macOS 安全设置）：

```bash
sudo xattr -rd com.apple.quarantine /Applications/NeoMind.app
```

**Windows 安装步骤**：

双击 `.msi` 或 `.exe` 文件，按照安装向导完成安装。

**Linux 安装步骤**：

```bash
# AppImage 方式（推荐）
chmod +x neomind_0.5.11_amd64.AppImage
./neomind_0.5.11_amd64.AppImage

# deb 包方式
sudo dpkg -i neomind_0.5.11_amd64.deb
sudo apt-get install -f  # 安装依赖
```

### 1.2 首次启动与注册

首次启动 NeoMind 时，系统将引导您完成初始设置。

**步骤 1**：启动应用程序，进入欢迎界面

![NeoMind 注册界面](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-register.png)

**步骤 2**：创建管理员账户

![创建管理员账户](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-register-1.png)

填写以下信息：

- **用户名**：管理员账户名称（3-20 个字符）
- **密码**：强密码（至少 8 个字符，包含字母和数字）
- **确认密码**：再次输入密码

**步骤 3**：配置时区 完成注册

![注册成功](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-register-2.png)

注册成功后，系统将自动跳转到登录界面。

### 1.3 登录系统

使用刚才创建的管理员账户登录 NeoMind。

![首次登录](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-first-login.png)

**注意**：

- NeoMind 支持本地离线登录，数据存储在本地数据库
- 首次登录后，系统会自动创建默认配置文件

## 2. 系统设置

### 2.1 配置大模型（LLM）后端

NeoMind 的核心能力来自大语言模型。推荐使用 **Ollama** 进行本地部署，实现完全离线运行。

**前置要求**：

- 本地大模型（推荐 Ollama）或其他 LLM 后端（OpenAI、Anthropic、DeepSeek 等）

**推荐配置**：Ollama 本地部署

```bash
# Linux/macOS 安装 Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 拉取推荐模型
ollama pull ministral-3:3b  # 轻量级模型（3B 参数）
ollama pull deepseek-r1:7b  # 高性能模型（7B 参数）
```

**验证 Ollama 安装**：

在配置 NeoMind 之前，先验证 Ollama 是否正常运行：

```bash
# 测试 Ollama API
curl http://localhost:11434/api/version

# 测试模型推理
ollama run ministral-3:3b "你好"
```

![Ollama 预测试](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/ollama-pre-test.png)

**配置步骤**：

**步骤 1**：进入设置页面，选择"LLM 配置"

![LLM 配置页面 1](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-llm-1.png)

**步骤 2**：添加 LLM 后端

![LLM 配置页面 2](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-llm-2.png)

点击"添加后端"，根据您的需求选择后端类型：

**配置 Ollama（本地部署，推荐）**：

- **后端类型**：选择 Ollama
- **名称**：例如 "Local Ollama"
- **端点地址**：`http://localhost:11434`（默认端口）
- **模型**：选择已拉取的模型（如 `ministral-3:3b`）

**配置 OpenAI（云端服务）**：

- **后端类型**：选择 OpenAI
- **名称**：例如 "OpenAI GPT-4"
- **端点地址**：`https://api.openai.com/v1`（默认）
- **API Key**：输入您的 OpenAI API Key
- **模型**：选择模型（如 `gpt-4`、`gpt-3.5-turbo`）

**支持的 LLM 后端对比**：


| 后端     | 默认端点                                                   | 特点        | 适用场景       |
| ------ | ------------------------------------------------------ | --------- | ---------- |
| Ollama | [http://localhost:11434](http://localhost:11434)       | 本地部署，完全离线 | 边缘设备、隐私要求高 |
| OpenAI | [https://api.openai.com/v1](https://api.openai.com/v1) | 云端服务，性能强大 | 需要最强模型能力   |


**验证配置**：

配置完成后，点击"测试连接"按钮，确保 NeoMind 能够成功连接到 LLM 后端。

![LLM 配置测试](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-llm-2.png)

### 2.2 配置设备连接

NeoMind 支持多种设备连接协议，方便与不同类型的物联网设备和 CamThink 硬件产品对接：

**支持的连接方式**：

- **MQTT 协议**：最常见的物联网通信协议（推荐）
- **HTTP/Webhook**：支持 RESTful API 和 Webhook 回调

**配置步骤**：

**步骤 1**：进入"设备连接"设置页面

![设备连接配置 1](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-device-connection-1.png)

**步骤 2**：添加 MQTT 代理

![设备连接配置 2](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-device-connection-2.png)

填写以下信息：

- **名称**：例如 "EMQX Public Broker"
- **地址**：`broker.emqx.io`（公共测试服务器）
- **端口**：`1883`（默认端口）
- **用户名/密码**：公共服务器通常不需要（留空即可）

**其他常用公共 MQTT 代理**：

- **Mosquitto 测试服务器**：`test.mosquitto.org:1883`
- **HiveMQ 公共服务器**：`broker.hivemq.com:1883`

**步骤 3**：保存配置

![设备连接配置 3](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-device-connection-3.png)

保存后，NeoMind 会自动尝试连接 MQTT 代理，连接状态会显示在页面顶部。

## 3. 设备管理

### 3.1 理解设备类型（Device Types）

在添加设备之前，需要先定义设备类型。设备类型描述了设备的：

- **上行数据（Uplink）**：设备**上报**到 NeoMind 的数据（如温度、湿度、视频分析结果）
- **下行控制（Downlink）**：NeoMind **下发**给设备的操作指令（如重启、配置更新）

**注意**：Uplink 表示"上行"（设备→NeoMind），Downlink 表示"下行"（NeoMind→设备）

**步骤 1**：进入"设备类型"管理页面

![设备类型管理 1](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-1.png)

**步骤 2**：导入或创建设备类型

NeoMind 支持三种方式添加设备类型：

**方式 1：快速导入 CamThink 设备类型（推荐）**

如果您使用 CamThink 硬件产品，可以快速导入预设的设备类型：

1. 点击"导入设备类型"
2. 选择 CamThink 设备型号：
  - **NE101 智能相机**：基于事件触发的超低功耗智能相机，支持PIR/雷达等触发方式，超长续航
  - **NE301 智能相机**：具备 0.6TOPS 算力的边缘 AI 相机，支持实时 AI 推理
3. 点击"确认导入"

![导入 CamThink 设备类型](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-2.png)

**方式 2：导入第三方设备类型**

对于第三方设备，您可以：

1. 从 JSON 文件导入设备类型定义
2. 从 NeoMind 社区模板库导入
3. 使用 AI 辅助生成设备类型（基于数据样本）

**方式 3：手动创建设备类型**

如果您需要自定义设备类型，可以点击"创建设备类型"按钮，按照界面提示填写设备类型的基本信息、定义上行指标和下行命令，最后保存即可。

![手动创建设备类型界面](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-11.png)

创建完成后，您可以在设备类型列表中查看所有已定义的类型：

![设备类型列表](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-3.png)

### 3.2 添加设备

有两种方式添加设备：

**方式 1：手动添加设备**

**步骤 1**：进入"设备管理"页面

![设备管理页面](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-4.png)

**步骤 2**：点击"添加设备"

![添加设备](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-5.png)

填写以下信息：

- **设备名称**：例如 "前门监控相机"
- **设备类型**：选择 CamThink NE301 智能相机
- **设备 ID**：唯一标识符（自动生成或手动输入）,这个 ID 与NE101/NE301上的保持一致。
- **MQTT 上行主题**：设备发布数据的主题（如 `/device/76b2fc32/uplink`）
- **MQTT 下行主题**：下行控制设备的主题（如 `/device/76b2fc32/ downlink`）

![待注册设备](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-8.png)

**参考NE301上的Application Management -> MQTT 设置**

![保存设备](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-7.png)

**方式 2：自动发现设备**

如果您的设备支持连接到MQTT 服务器后，NeoMind 会自动检测并列出待注册设备。

![配置设备参数](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-6.png)

点击"Scan"标签页，查看发现的设备列表，选择需要添加的设备并确认注册。

### 3.3 查看设备状态

在设备列表中，点击设备名称查看详情

![设备详情](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-9.png)

可手动触发抓拍或者定时抓拍，设备将快速上线

![设备实时数据](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-10.png)

## 4. 仪表板配置

### 4.1 仪表板概述

仪表板（Dashboard）提供可视化的数据展示界面，用于集中管理设备状态，数据和历史记录，用户可自定义组件和数据源。

**步骤 1**：进入仪表板管理页面，

![仪表板管理页面](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-1.png)

### 4.2 创建仪表板

**步骤 1**：点击"创建仪表板"

![创建仪表板](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-2.png)



**步骤 2**：添加数据面板

![查看仪表板](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-5.png)

点击"添加面板"后，您可以自定义数据展示面板：

- **面板类型**：选择数据展示方式（折线图、仪表盘、数值卡片等）
- **设备选择**：选择要监控的设备
- **数据集**：选择设备的数据字段，包括：
  - 设备名称和状态
  - 传感器数据（温度、湿度等）
  - AI 识别结果（检测到的对象、数量等）
  - 其他自定义指标

![调整布局](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-4.png)



### 4.3 使用仪表板

仪表板可以直观地展示设备数据和 AI 分析结果。例如，在饮料库存监测场景中，您可以查看：

- **设备信息**：设备名称和在线状态
- **实时数据**：当前检测到的饮料数量
- **数据趋势**：饮料数量的历史变化曲线
- **采样图片**：设备采集的历史图像记录

![仪表板示例](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-6.png)

您可以根据不同场景创建多个仪表板，满足不同的业务需求。

## 5. AI 聊天助手

### 5.1 开始对话

NeoMind 内置 AI 聊天助手，您可以使用自然语言查询设备状态、控制设备或创建自动化规则。

**步骤 1**：点击左侧导航栏的"聊天"图标

![AI 聊天界面](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-chat-0.png)

**步骤 2**：输入自然语言指令

![AI 对话示例](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-ai-agent-3.png)

**示例对话**：

```
用户：饮料柜现在有多少瓶饮料？
AI：当前饮料柜共有 47 瓶饮料。
    其中可乐 18 瓶，矿泉水 15 瓶，果汁 14 瓶。
    相比昨天减少了 8 瓶。

用户：最近饮料消耗情况怎么样？
AI：过去 7 天共消耗饮料 52 瓶。
    平均每天消耗 7.4 瓶，周五消耗最多（12 瓶）。
    按照当前消耗速度，库存可维持约 6 天。

用户：当饮料少于 20 瓶时提醒我补货
AI：好的，我创建了一条规则：
    "当饮料柜总数量 < 20 瓶时，
    发送补货提醒到您的手机"
    确认创建吗？
```

### 5.2 AI 能力范围

NeoMind AI 助手可以通过自然语言完成以下任务：

- **设备查询**：查询设备状态、历史数据、故障诊断
- **设备控制**：开关设备、调整参数、批量控制
- **自动化管理**：创建/修改规则、查询执行历史
- **智能推荐**：优化配置、异常预警、节能建议

## 6. 高级功能

### 6.1 AI 智能体（AI Agents）

AI 智能体是具有自主执行能力的智能程序，可以完成复杂的自动化任务。

**步骤 1**：进入"AI 智能体"管理页面

![AI 智能体管理](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-ai-agent-1.png)

**步骤 2**：创建 AI 智能体

![创建 AI 智能体](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-ai-agent-2.png)

填写以下信息：

- **名称**：例如 "温度监控智能体"
- **描述**：智能体的任务描述
- **触发条件**：何时执行（定时、事件触发等）
- **执行逻辑**：智能体的工作流程

**示例：饮料库存监控智能体**

```yaml
名称: 饮料库存监控智能体
触发条件: 每 30 分钟
执行逻辑:
  1. 读取饮料柜当前数量
  2. 如果数量 < 20 瓶：
     - 发送补货提醒到手机
     - 记录库存预警日志
  3. 如果数量 < 10 瓶：
     - 发送紧急补货通知
     - 自动发送补货请求给供应商
```

**步骤 3**：启用智能体

创建完成后，启用智能体，它将按照设定的逻辑自动运行。

### 6.2 自动化规则

自动化规则基于事件驱动，当条件满足时自动执行预设动作。

**步骤 1**：进入"自动化规则"管理页面

![自动化规则管理](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-automation-1.png)

**步骤 2**：创建规则

![创建自动化规则](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-automation-2.png)

**示例规则**：

```
规则名称：饮料库存预警
触发条件：饮料柜总数量 < 20 猶 持续 5 分钟
执行动作：
  1. 发送补货提醒到手机
  2. 记录库存日志
  3. 发送邮件通知管理员
```

**规则类型**：

- **阈值规则**：基于数值比较（温度、湿度等）
- **时间规则**：基于时间触发（定时任务）
- **状态规则**：基于设备状态变化（开关、在线/离线）
- **组合规则**：多个条件的逻辑组合

### 6.3 插件系统

NeoMind 支持插件扩展，您可以安装官方或第三方插件来增强系统功能。

**步骤 1**：进入"插件"管理页面

![插件管理](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-extension-1.png)

**步骤 2**：浏览可用插件

![插件列表](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-extension-2.png)

**官方插件**：

- **天气服务**：获取实时天气数据，- **数据备份**：自动备份配置和数据 等。

**步骤 3**：安装插件

点击插件的"安装"按钮，NeoMind 会自动下载并安装插件。安装完成后，插件会出现在已安装列表中。

### 6.4 消息通知

NeoMind 提供灵活的消息通知系统，支持多种通知渠道和触发规则。

**通知渠道**：

- **应用内通知**：在 NeoMind 界面显示
- **邮件通知**：发送到指定邮箱
- **Webhook**：推送到企业微信/钉钉等第三方服务
- **短信通知**：发送到手机（需配置短信服务）

![消息通知设置](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-message-1.png)

![消息规则配置](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-message-2.png)

## 7. 故障排查


**无法连接到 Ollama**：
- 确认 Ollama 服务已启动： `curl http://localhost:11434/api/version`
- 确认模型已拉取: `ollama list`
- 重启服务: `ollama serve`

**设备无法连接到 MQTT 代理**：
- 检查 MQTT 代理是否运行
- 验证设备 MQTT 配置（主题、用户名、密码）
- 查看 NeoMind 日志（`~/Library/Logs/NeoMind/`）

**macOS 安全提示**：
```bash
sudo xattr -rd com.apple.quarantine /Applications/NeoMind.app
```

**AI 响应缓慢**：
- 使用轻量级模型（推荐 `ministral-3:3b` 或 `deepseek-r1:7b`）
- 增加系统内存（推荐 16GB+）
- 使用 GPU 加速（如果支持）


## 8. 附录

### 8.1 数据存储位置

| 平台 | 数据目录 |
|------|----------|
| macOS | `~/Library/Application Support/NeoMind/data/` |
| Windows | `%APPDATA%/NeoMind/data/` |
| Linux | `~/.config/NeoMind/data/` |

**主要数据库文件**：
- `telemetry.redb` - 设备时序数据
- `sessions.redb` - 聊天历史和会话
- `devices.redb` - 设备注册表
- `automations.redb` - 自动化规则

### 8.2 相关资源

- **官方网站**：[https://www.camthink.ai](https://www.camthink.ai)
- **GitHub 仓库**：[https://github.com/camthink-ai/NeoMind](https://github.com/camthink-ai/NeoMind)
- **文档中心**：[https://github.com/camthink-ai/NeoMind/tree/main/docs](https://github.com/camthink-ai/NeoMind/tree/main/docs)
- **问题反馈**：[https://github.com/camthink-ai/NeoMind/issues](https://github.com/camthink-ai/NeoMind/issues)