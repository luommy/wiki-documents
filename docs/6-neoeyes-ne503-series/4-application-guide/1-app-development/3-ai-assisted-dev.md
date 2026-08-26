---
id: ai-assisted-dev
title: AI-Assisted Development
sidebar_position: 3
description: 用 Claude Code 和 ne503-dev skill，将一句自然语言需求实现为可在 NE503 上运行的停留告警应用，并完成部署与验收。
keywords: [NE503, ne503-dev, Claude Code, AI 辅助开发, 应用开发, 停留告警, loitering, 状态机]
tags: [应用开发, NE503, AI 辅助开发, skill]
---

# AI-Assisted Development

本篇演示如何用 **Claude Code** 和 `ne503-dev` skill 开发一个 NE503 应用。

示例需求很简单：检测到人员连续停留 10 秒后发送告警；人员离开后，计时和告警状态重置。你只需要描述需求并确认关键参数，Claude 会根据设备实际情况完成代码、清单、构建、部署和验收。

:::tip 直接体验成品
如果只想查看运行结果，可以下载预编译包 [lingering-detection.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/lingering-detection.tar)。解压后得到 `app.yaml` 和 `image.tar`，再按 [Hello World 的部署步骤](./1-hello-world.md#4-部署到设备)导入设备。
:::

## 1. 前置准备

| 条件 | 说明 |
|:---|:---|
| Claude Code | 已安装并可以正常运行。 |
| `ne503-dev` skill | [下载 skill](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ne503-dev.zip)，解压到 `~/.claude/skills/ne503-dev/`。 |
| Docker | 用于构建 ARM64 应用镜像。 |
| NE503 设备 | 设备已联网，准备好 IP 和 `admin` 密码；HAL v2、`ai-runtime` 和检测模型已就绪。 |

## 2. 从一句需求到可运行应用

### 2.1 描述需求

在 Claude Code 中调用 `ne503-dev`，直接说明目标和设备地址：

> 做一个应用：检测到人停留 10 秒就发告警。部署到 `<设备 IP>`。

Claude 会先确认必要信息，再开始开发。你不需要一开始就指定代码结构，但需要确认最终的停留时长、检测阈值等业务参数。

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-start_new.mp4" type="video/mp4"></source>
  您的浏览器不支持视频播放。
</video>

### 2.2 Claude 完成应用开发

Claude 会以 SDK 应用模板为基础，完成三件关键工作：

1. **先确认设备资源**：查询设备上实际可用的模型和视频流。示例使用模型 `hailo_yolov8n_384_640` 和原始视频流 `sub`；`main` 是编码 H264 流，不能直接用于推理。
2. **实现停留状态机**：人员出现时开始计时，连续停留满 10 秒触发一次告警；连续 3 秒未检测到人员则判定离开并重置。`GRACE_SECONDS` 用于容忍转身或遮挡造成的短暂漏检。
3. **生成应用清单**：在 `app.yaml` 中声明视频流、模型、事件主题和可调参数，包括 `LOITER_SECONDS`、`DETECTION_THRESHOLD`、`GRACE_SECONDS` 等。

这一步的重点不是让 AI 猜一个示例值，而是让应用使用设备当前真实的模型、视频流和权限。

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-end_new.mp4" type="video/mp4"></source>
  您的浏览器不支持视频播放。
</video>

### 2.3 自动部署并验收

代码和清单准备好后，`ne503-dev` 会依次完成：

```text
构建 ARM64 镜像 → 上传 → 安装 → 启动 → 查看状态和日志
```

验收时重点确认三件事：

- 应用状态为 `Running`，日志中出现模型加载和首帧推理信息；
- 平台注入的权限与 `app.yaml` 中的声明一致；
- 人进入画面后，能触发一次完整的检测和告警流程。

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/verify-on-web_new.mp4" type="video/mp4"></source>
  您的浏览器不支持视频播放。
</video>

在本次真机演示中，告警时间稳定在 10.1 秒，共完成 3 次独立告警验证。

完整过程视频：[ai-assisted-development_new.mp4](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assisted-development_new.mp4)
