---
id: ne302-ai-model-validation
title: AI Model Validation
sidebar_position: 2
description: Upload an NE302 model package and validate its inference result with a fixed image.
keywords: [NE302, Feature Debugging, Model Validation, AI model, inference]
tags: [NE302, user-guide, AI, model-validation]
---

# AI Model Validation

本页用于把一个模型包上传到 NE302，并用固定图片确认它能产生结果。

## 1. 下载或准备模型包

在 [CamThink Model Zoo](https://www.camthink.ai/developer-center/models/?product=ne302) 选择 **ne302**，再按场景、任务或模型架构筛选。

![NE302 Model Zoo 筛选](/img/neoeyes-ne302-series/user-guide/ne302-model-zoo.png)

上传到设备的是 NE302 模型包，例如 `ne302_Model_xxx_pkg.bin`。如果下载的是原始 `.tflite` 或 `.onnx`，不能直接上传；按 [NE302 Model README](https://github.com/camthink-ai/ne302/blob/main/Model/README.md) 准备 JSON 配置并生成模型包。

## 2. Camera Settings

打开 **Feature Debugging → Camera Settings**。这里管理当前模型、推理阈值、运行模式和工作频率。

![NE302 模型上传入口](/img/neoeyes-ne302-series/user-guide/ne302-model-upload.png)

| 设置 | 用途与操作 |
| :--- | :--- |
| **Current Model** | 显示当前已加载的模型。点击 **upload** 选择一个 NE302 模型包；一次只能选择一个文件，文件上限为 10 MB。上传、校验和模型重载完成后，重新读取此处确认模型已切换。 |
| **NMS Threshold** | 控制重叠检测框的处理。需要减少或保留重叠框时，用同一张固定图片一次只调整这一个值再比较。 |
| **Confidence Threshold** | 过滤低于阈值的结果。结果为空时，先用同一张已知目标图片降低该值复测。 |
| **Power Mode** | 在 **Full Speed Mode** 和 **Low Power Mode** 之间选择。切换后用固定图片重新检查结果。 |
| **Operating Mode** | 选择当前运行方式；本设备当前页面显示 **Image Mode**，以实际页面提供的选项为准。 |
| **Work frequency** | 选择系统时钟配置。选择后在下一次重启或唤醒时生效，因此更改后必须重新验证模型结果。 |

不要在上传时刷新或断电。如果 Current Model 没有更新，先确认选择的是模型包而不是原始模型或 JSON 文件。

## 3. 用固定图片验证

打开 **Model Validation**。选择一张 `jpg`、`jpeg`、`png` 或 `webp` 图片（不超过 10 MB），等待 JSON 结果区域更新。

![NE302 Model Validation 页面](/img/neoeyes-ne302-series/user-guide/ne302-model-validation.png)

固定图片验证通过的判断是：页面显示当前模型，图片被接受，JSON 结果更新。`detections` 为空表示该图片没有得到检测结果，不代表模型上传失败；先换一张已知包含目标的图片，或调整 **Confidence Threshold** 后用同一图片复测。
