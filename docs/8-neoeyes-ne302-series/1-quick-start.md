---
id: ne302-quick-start
title: Quick Guide
sidebar_position: 1
description: 帮助首次使用者完成 NE302 的组装、上电、登录、模型验证和一次触发记录。
keywords: [NE302, Quick Guide, Web 控制台, Feature Debugging, Model Validation]
tags: [NE302, quick-guide, neoeyes]
---

# Quick Guide

完成这条首次使用路径：组装并上电 → 登录 Web 控制台 → 确认画面 → 上传模型并验证图片 → 触发一次并确认 Records。字段说明和故障排查见 User Guide。

## 1. 准备硬件

准备 NE302 主板、接口板、摄像头组件、当前 SKU 对应的天线和 USB Type-C 电源。需要保存抓拍记录时，再准备 MicroSD 卡和一台可访问设备网络的电脑。

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', margin: '24px 0' }}>
  <img src="/img/neoeyes-ne302-series/quick-start/ne302-product-render-cropped.png" alt="NE302 白色外置天线成品图" style={{ width: '100%', height: '360px', objectFit: 'contain' }} />
  <img src="/img/neoeyes-ne302-series/quick-start/ne302-board-connection-tight.png" alt="NE302 主板和接口板组装图" style={{ width: '100%', height: '360px', objectFit: 'contain' }} />
</div>

左图为成品，右图为主板与接口板组装状态。供电、天线和板卡版本以交付硬件资料为准。

## 2. 组装并上电

1. 在断电状态下，按板间连接器的防呆方向连接 Main Board 和 Interface Board；不要强行插入或斜插。
2. 连接当前 SKU 对应的天线；需要本地保存时插入 MicroSD 卡。
3. 按交付资料连接 USB Type-C 电源，等待设备启动。

如果设备没有启动，先断电检查板间连接、摄像头连接和供电，再重新上电。

## 3. 登录 Web 控制台

1. 让电脑连接到交付资料指定的设备网络。
2. 在浏览器打开设备地址。部分测试设备使用 `http://192.168.10.10/`，实际地址以设备配置为准。
3. 使用随设备提供的凭据登录；如页面要求修改登录密码，按提示完成后用新密码重新登录。

![NE302 Web 控制台登录页面](/img/neoeyes-ne302-series/quick-start/ne302-login.png)

登录成功后，控制台可打开并显示功能导航。

## 4. 确认实时画面

1. 打开 **Feature Debugging**。
2. 等待预览区域和 Camera Settings 加载完成。
3. 确认预览持续显示图像，且画面方向与安装方向一致。

![NE302 Feature Debugging 实时画面与 Camera Settings](/img/neoeyes-ne302-series/quick-start/ne302-feature-debugging.png)

没有画面时，先检查摄像头连接和供电，再参阅 [Capture and Storage](./2-user-guide/0-capture-storage.md)。

## 5. 上传模型并验证图片

1. 从 [CamThink Developer Center → Models](https://www.camthink.ai/developer-center/models/) 下载与当前设备匹配的 `.bin` 模型包。
2. 在 **Feature Debugging → Camera Settings** 的 Current Model 区域选择 **upload**，等待模型加载完成。
3. 打开 **Model Validation**，上传一张固定测试图片。
4. 等待结果区域更新，确认页面已返回本次推理结果。

![NE302 Model Validation 模型验证页面](/img/neoeyes-ne302-series/user-guide/ne302-model-validation.png)

模型格式、参数和结果解读见 [AI Model Validation](./2-user-guide/2-ai-model-validation.md)。

## 6. 触发一次并确认 Records

1. 在 **Feature Debugging → Wakeup Source Configuration** 中只启用一种测试来源，并保存设置。
2. 用该来源触发一次设备。
3. 打开 **Capture Settings → Records**，按触发时间找到对应记录。

![NE302 Wakeup Source Configuration 触发配置](/img/neoeyes-ne302-series/user-guide/ne302-feature-debugging-stream-wakeup.png)

![NE302 Capture Settings → Records 记录页面](/img/neoeyes-ne302-series/user-guide/ne302-capture-records.png)

当 Records 出现对应时间的记录时，首次抓拍验证完成。

## 7. Next steps

- [Capture and Storage](./2-user-guide/0-capture-storage.md)：配置抓拍、存储和触发。
- [Data Transmission](./2-user-guide/1-data-transmission.md)：配置 MQTT/MQTTS、Webhook 和媒体流发送。
- [AI Model Validation](./2-user-guide/2-ai-model-validation.md)：管理模型和推理验证。
- [System Maintenance](./2-user-guide/3-system-maintenance.md)：管理网络、固件、存储和设备信息。
- [Hardware Guide](./3-hardware-guide/0-components-overview.md)：确认板卡、接口和硬件版本。
- [Software Guide](./4-software-guide/0-development-environment.md)：构建、烧录和维护源码工程。
