---
description: NE503 Web 控制台 Dashboard 总览：登录入口，以及 Dashboard 各面板（设备状态、资源监控、画面预览、应用、陀螺仪、趋势图、设备信息）的读法与关注点。
keywords: [NE503 控制台, Dashboard, 设备状态, 资源监控, 陀螺仪, Web 管理]
tags: [用户指南, NE503, 控制台, Dashboard]
---

# Dashboard

本页是《用户指南》的入口。NE503 的所有功能都在 Web 控制台里完成——先认识 Dashboard 的布局，再按需进入后续章节。

## Dashboard 面板

Dashboard 是登录后的首页，一眼掌握设备的运行状态。整页自上而下分三行排列：

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/dashboard/qs-dashboard-overview.png" />

- **第一行** — 左侧 **Device Status**（时间 / 运行时长 / 温度），右侧四块资源仪表盘（CPU / NPU / Memory / Storage）
- **第二行** — **Stream Preview**（画面预览）、**Applications**（运行中的应用）、**Gyroscope Calibration**（陀螺仪姿态）
- **第三行** — **Monitor**（资源趋势图）、**Device Info**（设备摘要）

下面逐块说明读法与关注点。

### 设备状态

设备当前时间、**Uptime**（本次开机的连续运行时长）、**Temperature**（SoC 与板载两路温度）。温度是判断散热与负载是否正常的关键指标——SoC 持续超过 80°C 时需检查安装环境通风，或削减运行中的模型 / 应用。

### 资源监控

四块实时仪表盘，是判断设备是否"跑得动"的第一参考：

| 指标 | 含义 | 关注点 |
|------|------|--------|
| **CPU Usage** | 处理器使用率（4 核） | 长期 > 80% 说明应用负载过重，考虑关停非必要应用 |
| **NPU Usage** | AI 推理单元使用率 | 与运行中的模型数量正相关；推理变慢时先看这里 |
| **Memory Usage** | 内存占用 / 总量 | 接近上限时容器可能被 OOM 终止，留意异常重启的应用 |
| **Storage Usage** | 存储占用 / 总量 | 超过 80% 应清理录像 / 日志或扩容 |

### 画面预览

摄像头实时画面缩略图——看到画面即确认传感器与图像通路正常。点击 **Go to Media** 跳转 Media 页查看全画面与码流参数。

### 应用摘要

列出当前运行中的容器应用及其状态与资源占用，底部附资源汇总。点击 **View all** 跳转 Applications 页进行安装 / 启停 / 卸载。

### 陀螺仪姿态

实时显示设备 **Pitch**（俯仰角）与 **Roll**（横滚角），以及水平状态（Leveled / Tilted）。两个用途：

- **安装角度校验**：装好后看一眼角度是否符合预期
- **电子防抖（EIS）**：Image 页的 Electronic Stabilization 依赖陀螺仪数据，姿态异常会影响防抖效果

### 资源趋势

资源使用率随时间的趋势折线图，顶部下拉切换 CPU / NPU / 内存等指标。用于发现周期性负载规律，或定位某次卡顿、掉帧发生的时间点。

### 设备摘要

设备名、IP、MAC、固件版本、构建日期的摘要——排查问题时报给支持人员的基本信息。
