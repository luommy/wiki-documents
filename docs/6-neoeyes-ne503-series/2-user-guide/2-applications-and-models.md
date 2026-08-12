---
description: NE503 AI 能力完整指南：Applications 页的应用管理、6 步安装向导（Source / Basic Info / Resources / Permissions / Advanced / Review）含权限模型深度（AI Models / Max QPS / Video Streams / Event Bus / Network Mode / Device Control）；Models 页的模型生命周期、扫描导入、加载卸载与阈值调优。
keywords: [NE503 应用管理, 安装向导, 容器应用, Permissions, 模型管理, HEF, Threshold, aipc-cli, AI 推理]
tags: [用户指南, NE503, 应用, 模型, AI]
---

# AI Apps and Models

NE503 通过容器运行 AI 应用，平台内置模型管理。**AI 类应用必须声明依赖的模型**——应用勾选模型后，启动时自动加载；模型卡也会反向显示引用它的应用。非 AI 应用（如纯视频录像）无需配置模型权限。本章先讲应用、再讲模型。

## 应用管理

进入 **Applications** 页面：顶部是搜索与状态筛选，下方是应用卡片，卡片右上角 **Import** 用于安装新应用。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-app-management.png" />

### 应用列表与筛选

- **搜索框**：按容器名或镜像名搜索。
- **状态筛选**：All / Installed / Running / Stopped / Failed，快速定位某类应用。
- 每张应用卡片显示：运行状态、名称、版本、实时 CPU / 内存占用。

### 应用操作

每张应用卡片底部提供：

| 按钮 | 作用 |
|------|------|
| **Stop / Restart** | 停止 / 重启应用 |
| **Logs** | 查看运行日志 |
| **Console** | 进入容器终端（调试用） |
| **Visit App** | 打开应用自带的 Web 界面（如 AI Model Showcase） |
| **Uninstall** | 卸载应用 |

### 安装新应用（6 步向导）

点击 **Import** 卡片启动 **Application Setup Wizard**，共 6 步。下图依次为 Step 1 镜像来源与最终 Review 确认页：

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-step1-source.png" alt="向导 Step 1 Source" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/wizard-step6-review.png" alt="向导 Review 确认" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

#### Step 1 · 镜像来源

| 来源 | 说明 |
|------|------|
| **Registry Image** | 从 Docker Hub 或私有仓库拉取，填 Image Address |
| **Upload Archive** | 上传本地 `.tar` / `.tar.gz` 镜像文件 |
| **Upload Package** | 上传 `app.yaml` 清单 + 镜像的完整配置包 |

#### Step 2 · 基本信息

- **Application ID**：唯一标识，**创建后不可修改**
- **Application Name** / **Version** / **Description**：显示与说明

#### Step 3 · 资源

- **CPU Limit**：CPU 上限（%）
- **Memory Limit**：内存上限
- **Auto-start on boot**：开机自启
- **Restart Policy**：失败重启策略

#### Step 4 · 权限

这是最关键的一步，决定应用能调用哪些平台能力。

| 权限组 | 作用 |
|--------|------|
| **AI Models Access** | 勾选应用可调用的推理模型（见下方模型管理） |
| **Max Inference QPS** | 限制应用每秒最大推理次数，防止抢占 NPU |
| **Max Concurrent Inference** | 限制最大并发推理数 |
| **Allow Dynamic Model Registration** | 允许应用运行时动态发现并注册模型 |
| **Video Stream Permissions** | 勾选应用可使用的码流（main / sub / third，各带分辨率与帧率标注） |
| **Event Publish / Subscribe Topics** | Event Bus 发布 / 订阅主题（逗号分隔，如 `app/output`、`camera/*`） |
| **Network Mode** | Isolated（隔离，无网络）/ Host（共享主机网络） |
| **Device Control** | 硬件控制授权：**Light Control**（红外补光）、**IR Cut Filter**（红外滤光片）、**PTZ Control**、**Lens Control**（镜头） |

> Device Control 授权后，应用可通过 SDK 调用镜头与红外接口。

#### Step 5 · 高级

- **Environment Variables**：环境变量（键值对）
- **Volumes**：存储卷挂载

均可选，按应用需要添加。

#### Step 6 · 确认

汇总前 5 步配置，确认无误后点 **Install**。安装完成后应用出现在列表中（初始为 Stopped），点卡片上的启动按钮运行。

## 模型管理

进入 **Models** 页面查看与管理推理模型。设备内置多类模型（目标检测、OCR、语义分割、关键点、深度估计、CLIP 零样本、图像分类等），具体清单以设备实际为准。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/applications-and-models/qs-models.png" />

### 模型列表

每张模型卡显示：加载状态（**Loaded** / **Not Loaded**）、有多少应用在引用（**X Apps**）、ID、类型、输入尺寸、文件大小、路径，以及 **Load / Unload / Detail / Delete** 操作。

### 扫描与导入

- **Scan Models**：扫描 `/data/aipc/models/` 目录，自动注册新增的 `.hef` 模型。
- **Import**：分两步导入——Step 1 上传 `.hef` 文件，Step 2 填写 Model ID / Model Type / Threshold 等配置。

### 加载与卸载

模型必须 **Load** 加载到 NPU 后才能用于推理：

- 应用若在 Permissions 中声明了某模型，应用启动时会**自动加载**该模型。
- 也可在此页手动 Load / Unload。
- 卸载（Delete）会删除模型文件；仅 Unload 是从 NPU 释放但不删文件。

### 模型详情与阈值调优

点击 **Detail** 打开模型详情弹窗，关键项：

| 项 | 说明 |
|----|------|
| **Model ID / Type** | 标识与类型（detection / ocr / segmentation…） |
| **Input Size** | 模型要求的输入分辨率。注意：平台前处理固定输出 **384×640 NV12**，模型输入尺寸不匹配会导致推理无结果 |
| **File Size / Path** | `.hef` 文件大小与路径 |
| **Threshold** | **推理阈值（可调）**——调高减少误检但可能漏检，调低相反 |
| **Estimated TOPS / Memory** | 预估推理算力与显存占用 |
| **Load Time** | 上次加载时间 |
| **Used By Apps** | 反向查引用——哪些应用依赖此模型 |
