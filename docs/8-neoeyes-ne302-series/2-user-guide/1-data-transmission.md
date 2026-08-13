---
id: ne302-data-transmission
title: Data Transmission
sidebar_position: 1
description: Configure MQTT, MQTTS, Webhook and video-stream delivery from the NE302 Web console.
keywords: [NE302, Application Management, MQTT, MQTTS, Webhook, RTSP, RTMP]
tags: [NE302, user-guide, integration, MQTT, Webhook]
---

# Data Transmission

在 **Application Management** 中把设备结果发送到 MQTT/MQTTS Broker 或 Webhook 服务；在 **Feature Debugging → Stream Settings** 中提供 RTSP 或推送 RTMP 视频。先在 [AI Model Validation](./2-ai-model-validation.md) 用固定图片确认本地结果正常，再配置外部通道。

## 1. MQTT/MQTTS

打开 **Application Management → MQTT/MQTTS**。填写连接信息后，先点击 **save**，再点击 **connect**；只有 **Connection Status** 显示 `connected` 时，设备才已连接到 Broker。

![MQTT/MQTTS configuration in Application Management](/img/neoeyes-ne302-series/user-guide/ne302-application-management-mqtt.png)

| 字段 | 怎么填 | 何时需要注意 |
| :--- | :--- | :--- |
| **Protocol** | 选择 MQTT 或 MQTTS。切换协议会断开当前 MQTT 连接。 | 切换到 MQTT 时端口自动改为 1883；切换到 MQTTS 时自动改为 8883，仍应以 Broker 实际监听端口为准。 |
| **Server Address / Port** | 填 Broker 可被设备访问的主机名或 IP，以及监听端口。 | 连接失败先核对这两项和设备网络连通性。 |
| **Data Receiving Topic / Data Reporting Topic** | 分别填设备接收和设备上报所用的 Topic。 | 接收端订阅 **Data Reporting Topic** 才能看到设备上报。Topic 最长 128 个字符。 |
| **Client ID** | 为每台设备填唯一 ID。 | 重复的 Client ID 可能使已有客户端被 Broker 断开；长度不超过 23 个字符。 |
| **QoS** | 按接收端的订阅策略选择。 | 若接收端不能处理重复消息，应先在测试 Topic 验证。 |
| **Username / Password** | 按 Broker 的认证要求填写。 | 用户名和密码最长 32 个字符；页面不会显示密码明文。 |

使用 MQTTS 时，展开页面出现的证书项，按 Broker 要求上传 CA Certificate；需要双向认证时再上传 Client Certificate 和 Private Key，并填写 SNI。保存并连接后，在 Broker 的 **Data Reporting Topic** 订阅一条由固定图片触发的结果。页面为 `connected` 但收不到消息时，优先检查订阅 Topic、Client ID 和 Broker ACL。

## 2. Webhook

打开 **Application Management → Webhook**，开启 **Enable Push**，填写接收服务的 **HTTP(S) Push URL**，然后点击 **save**。URL 必须以 `http://` 或 `https://` 开头，且不超过 256 个字符。

![Webhook configuration in Application Management](/img/neoeyes-ne302-series/user-guide/ne302-application-management-webhook.png)

| 设置 | 作用 | 操作要点 |
| :--- | :--- | :--- |
| **Enable Push** | 控制是否发送 Webhook。 | 保存后查看 **Push Status**；它显示 `Enabled` 才会推送。 |
| **Authentication** | 选择接收端要求的认证方式。 | 选择非 `None` 的方式后必须填写 **Auth Secret / Token**。 |
| **Custom CA Certificate** | 让设备验证私有 CA 签发的 HTTPS 服务端证书。 | 公共 CA 可保留内置 CA bundle；更换自定义证书时先点 **Clear** 再上传新文件。 |
| **Test Push** | 向当前 URL 发送测试请求。 | 先保存，再点击；成功提示只证明测试请求已发送，仍需用固定图片验证实际结果上报。 |

验证时，在接收服务查看 `Test Push` 的请求，再执行一次固定图片推理。接收服务同时收到测试请求和结果请求，且 **Push Status** 保持启用，即完成该通道的基本验证。

## 3. Video stream

打开 **Feature Debugging → Stream Settings**，选择所需协议后保存配置。

![RTSP configuration in Feature Debugging Stream Settings](/img/neoeyes-ne302-series/user-guide/ne302-stream-settings-rtsp.png)

| 协议 | 设备端操作 | 通过标准 |
| :--- | :--- | :--- |
| **RTSP** | 开启 **Enable RTSP Service**，设置端口；需要认证时选择 **Digest** 并填写用户名和密码。页面会生成 Stream URL。 | 用同一网络的播放器打开该 URL 并持续看到画面。 |
| **RTMP** | 填写服务端 URL 和 Stream Key，启用后启动推送。 | 流媒体服务端出现活动输入流并可播放画面。 |

RTSP 端口必须在 1–65535 之间。RTMP 的 Stream Key 最长 128 个字符。若页面状态正常而外部没有画面，先检查协议、地址/端口或 Stream Key，再检查播放器或流服务端日志。
