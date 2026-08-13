---
id: ne302-capture-storage
title: Capture and Storage
sidebar_position: 0
description: Configure NE302 capture, local storage, upload retry and record verification from Capture Settings.
keywords: [NE302, Capture Settings, capture, storage, retry, records]
tags: [NE302, user-guide, capture, storage, records]
---

# Capture and Storage

先在 **Hardware Management** 准备相机画面和补光，再在 **Capture Settings → Capture Config** 确定触发后的图像如何保存和发送；最后在 **Records** 中查看每次抓拍的结果。

## 1. 准备抓拍图像

### Image Management

打开 **Hardware Management → Image Management**。先确认 **Connection Status** 为 `connected`，并检查预览画面；未连接时，不应继续配置翻转、ISP 或灰度模式。

![Image Management in Hardware Management](/img/neoeyes-ne302-series/user-guide/ne302-hardware-management.png)

| 设置 | 何时调整 | 调整后确认 |
| :--- | :--- | :--- |
| **Flip Horizontal / Flip Vertical** | 预览画面左右镜像或上下颠倒时。 | 切换后在 **Feature Debugging** 查看同一场景，并检查下一条实际 Records 图像。 |
| **ISP mode** | 按安装现场选择室内/弱光或室外/强光调校。 | 切换后重启或等待下一次唤醒，再用固定场景比较画面和推理结果。 |
| **Grayscale mode** | 下游模型或检测流程明确需要灰度图时。 | 重启或等待下一次唤醒后，确认预览和实际保存图像均为预期效果。 |
| **Custom** ISP profile | 已有经验证的 ISP JSON 配置文件时。 | 仅导入已验证的配置；导入后按同一场景重新检查画面。 |

**ISP mode** 和 **Grayscale mode** 的变化在下一次唤醒或重启后生效。首次安装不要同时修改多个图像项，否则无法判断是哪项造成画面变化。

### Lighting Management

打开 **Hardware Management → Lighting Management**，确认相机仍为 `connected`，再查看 **Work Supplement Light**。页面只显示当前设备和补光模式可用的选项；下图中的 `Always Off` 是截图时的当前状态，不是通用推荐值。

![Lighting Management in Hardware Management](/img/neoeyes-ne302-series/user-guide/ne302-hardware-lighting.png)

低照度场景需要补光时，先按现场需要选择当前下拉框提供的模式，再执行一次真实触发并在 **Records** 查看保存图像。仅看预览不足以判断补光是否适合抓拍与推理。

## 2. 选择抓拍、存储和发送方式

打开 **Capture Settings → Capture Config**。先选择 **Capture Mode** 和 **Storage Location**，再配置上传和保留策略。

![Capture Config: mode, storage and upload settings](/img/neoeyes-ne302-series/user-guide/ne302-capture-settings.png)

| 设置 | 何时使用 | 配置要点 |
| :--- | :--- | :--- |
| **Capture Mode** | 选择触发后立即发送、累积后批量发送、定时发送或只本地保存。 | 首次联调选 **Snap & Upload**；只验证本地抓拍时选 **Store Only**。批量和定时模式须先确认接收端与设备时间。 |
| **Storage Location** | 选择记录落在 SD 卡、内部 Flash，或由设备自动优先使用 SD 卡。 | 需要长期保存时使用已识别的 SD 卡；`No Storage (Instant only)` 不会留下本地记录。 |
| **Storage Policy** | 存储写满时决定继续写入还是停止。 | **Wrap (oldest first)** 会覆盖最早记录；需要完整留存时选 **Stop When Full** 并及时导出。 |
| **Save AI-drawn result image to storage** | 保存带 AI 标注框的结果图。 | 需要人工复核时开启；仅需原图或存储有限时关闭。 |
| **Upload Protocol / Upload Network** | 选择结果发送的协议和网络路径。 | MQTT/MQTTS 或 Webhook 的地址、认证和证书在 [Data Transmission](./1-data-transmission.md) 中配置。 |

没有 SD 卡时，页面会提示 Flash 的当前记录上限；这表示当前设备配置下的限制，不是所有 NE302 的统一容量规格。

## 3. 设置重试和图像参数

继续在同一页完成重试、保留和相机参数，然后点击底部 **save**。

![Capture Config: retry, camera parameters and save](/img/neoeyes-ne302-series/user-guide/ne302-capture-settings-lower.png)

| 设置 | 它影响什么 | 选择建议 |
| :--- | :--- | :--- |
| **Retry on failure** | 上传失败时是否保留并再次尝试。 | 接收端短暂不可用时开启；接收端必须能处理重复结果。 |
| **Max Retry Attempts (0=unlimited)** | 单条失败记录的最大重试次数。 | 支持 0–20；`0` 表示不限次数，仅在存储与接收端策略允许时使用。 |
| **Keep Uploaded Files (hours)** | 已上传文件继续保存在本地的时间。 | 支持 0–720 小时；取证时间越长，存储占用越大。 |
| **Skip frames** | 触发后跳过若干帧再保存图像。 | 运动目标模糊时用固定场景和同一触发动作逐步比较。 |
| **Resolution / JPEG quality** | 图像细节、文件大小与上传耗时。 | 一次只改一项，并检查实际保存文件和推理结果，不要只看下拉框。 |

保存后，重新打开该页确认值仍保留。上传设置立即生效；Camera Parameters 变更会在下一次唤醒或重启后生效。

## 4. 用 Records 验证一次抓拍

执行一次实际触发后，打开 **Capture Settings → Records**，按触发时间查找记录。

![Records in Capture Settings](/img/neoeyes-ne302-series/user-guide/ne302-capture-records.png)

| 看到的状态 | 表示什么 | 下一步 |
| :--- | :--- | :--- |
| **Pending** | 记录仍在等待处理或发送。 | 检查网络、上传策略和重试设置。 |
| **Sent** | 设备已按当前上传配置发送记录。 | 在接收端按同一时间确认数据。 |
| **Failed** | 记录发送失败。 | 先检查 Upload Protocol、网络和接收端日志。 |
| **Local** | 记录仍保存在设备本地。 | 检查 Storage Location、剩余空间和文件保留策略。 |

使用 **From / To** 缩小触发时间范围，并用 **Pending / Sent / Failed / Local** 过滤结果。一次抓拍验证完成的标准是：Records 出现对应时间的条目；本地存储与所选策略一致；若开启发送，接收端也有对应结果。没有 Records 时，先检查触发源、Capture Mode、Storage Location 和可用空间。

## 5. Wakeup Source Configuration

打开 **Feature Debugging → Wakeup Source Configuration**。首次验证时只启用一种来源，保存后在 **Capture Settings → Records** 查找对应时间的记录。

![NE302 Wakeup Source Configuration](/img/neoeyes-ne302-series/user-guide/ne302-feature-debugging-stream-wakeup.png)

### IO Trigger-PIR

打开 **IO Trigger-PIR** 后，设置以下字段并点击 **save**：

| 设置 | 用途与选择 |
| :--- | :--- |
| **Trigger Signal** | 选择 **Rising Edge** 或 **Falling Edge**，必须与现场 PIR 输出信号一致。 |
| **Sensitivity** | 可输入 1–255。数值越小，对红外变化越敏感，也越容易触发。 |
| **Ignore Time** | 触发后忽略新的触发。页面值 `N` 对应 `N × 0.5 + 0.5` 秒。 |
| **Pulse Count** | 需要的脉冲数，可选 1–4；增加该值可提高抗干扰，但会降低响应速度。 |
| **Window Time** | 统计脉冲的时间窗口，可选 0–3；页面值 `M` 对应 `M × 2 + 2` 秒。 |
| **Disable during preview** | 选 **Yes** 时，Web/RTSP 预览期间不执行 PIR 抓拍；关闭预览后恢复，休眠唤醒不受影响。 |

### Remote Control

**Remote Control** 只有启用开关。开启后，设备可通过 MQTT 接收远程唤醒和抓拍；先在 [Data Transmission](./1-data-transmission.md) 完成 MQTT/MQTTS 连接，再使用已配置的远程控制路径验证 Records。

### Scheduled Capture

打开 **Scheduled Capture** 后，先选 **Capture Mode**：

- **Interval**：设置 **Interval Type**。**Normal** 按设置的间隔执行；**Scheduled** 从 **Start Time** 开始按该间隔执行。间隔可设为 1–999 分钟或小时，点击 **confirm** 后页面会显示 **Next Capture**。
- **Fixed Point**：添加要执行的时间点和星期；最多可添加 10 个时间点，完成后点击 **confirm**。

如果触发后没有 Records，先确认触发设置已保存，再检查 Capture Mode、存储空间和 PIR 的 **Disable during preview**。
