---
id: firmware
slug: /7-release-notes/firmware
description: CamThink 产品固件版本发布历史、下载资源及用户开发案例源码下载。涵盖 NeoEyes NE301、NE101、NeoEdge NG4500 等产品线。
keywords: [Release Notes, 固件更新, 固件下载, 开发案例, NE301, NE101, NG4500, CamThink]
tags: [Release Notes, 固件, 下载, 开发案例]
sidebar_position: 1
---

# Firmware

本页面汇总 CamThink 各产品线的版本发布历史、下载资源及社区开发案例。

<!-- 下载规则：所有下载链接统一指向对应版本的 GitHub Release 页面，不区分子变体（CE/FCC 等）。格式：[⬇️](GitHub Release URL) -->

## NeoEyes NE101

| 固件版本 | 发布日期 | 更新内容 | 下载 |
|:-----|:---------|:---------|:----:|
| v1.7 | 2026-01-27 | <ul style={{margin:0}}><li>新增 UVC 相机 HDR 设置</li><li>合并 PIR 与 Alarm 为同一固件（通过 Web 配置切换）</li><li>修复高分辨率切换异常</li><li>修复 PIR/Alarm 多次误唤醒</li><li>修复 HaLow WiFi 区域配置选择问题</li><li>Web UI 优化</li></ul> | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.7) |
| v1.6 | 2025-11-25 | <ul style={{margin:0}}><li>Web UI 新增相机分辨率配置</li><li>修复 OTA 升级失败问题</li></ul> | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.6) |
| v1.5 | 2025-11-18 | <ul style={{margin:0}}><li>初始发布版本，支持 PIR / ALARMIN 模式</li><li>提供 FCC（915MHz）和 CE（868MHz）版本</li></ul> | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.5) |

## NeoEyes NE301

| 固件版本 | 发布日期 | 更新内容 | 下载 |
|:-----|:---------|:---------|:----:|
| v20260213 | 2026-02-13 | <ul style={{margin:0}}><li>新增 AWS HTTP 上传支持（含 SigV4 签名认证）</li><li>新增 EG912U GL Cat.1 模组网络接口</li><li>升级 ST EdgeAI 运行时至 v2.2</li><li>新增 YuNet 人脸检测和 YOLO D 目标检测模型支持</li><li>OTA 升级模块优化</li></ul> | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/v20260213_main) |
| v20260213<br />（EdgeAI 分支） | 2026-02-13 | <ul style={{margin:0}}><li>新增 YOLO11n 模型支持</li><li>支持 PSRAM 64Mb</li></ul> | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/v20260213_stedgeai-v2.2) |
| V20260120 | 2026-01-20 | <ul style={{margin:0}}><li>初始发布版本</li><li>支持目标检测（YOLOv2/v5/v8、SSD、YOLOX）、人脸检测（BlazeFace）、人体骨骼关键点（MoveNet）、语义分割（DeepLab v3）等 AI 模型</li><li>支持 WiFi / Cat.1 / PoE 通信</li><li>支持 RTMP / MQTT 推流</li><li>Web UI 设备管理</li></ul> | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/V20260120) |

## NeoMind

| 版本 | 发布日期 | 更新内容 | 下载 |
|:-----|:---------|:---------|:----:|
| v0.6.9 | 2026-04-16 | <ul style={{margin:0}}><li>新增数据转换聚合工具（Transform Aggregated Tool）</li><li>修复 Agent 缓存失效、上下文压缩及工具结果格式问题</li><li>修复工具结果反幻觉处理</li></ul> | [⬇️](https://github.com/camthink-ai/NeoMind/releases/tag/v0.6.9) |
| v0.6.8 | 2026-04-15 | <ul style={{margin:0}}><li>简化 LLM 思维控制，统一多轮对话中的思考内容展示</li><li>新增虚拟指标暴露及 write_metric 动作</li><li>加固 OTA 更新流程（修复完成状态、双重对话框、版本同步）</li><li>修复规则构建器的扩展支持</li><li>优化会话级工具结果缓存复用</li></ul> | [⬇️](https://github.com/camthink-ai/NeoMind/releases/tag/v0.6.8) |
| v0.6.7 | 2026-04-14 | <ul style={{margin:0}}><li>大幅性能优化：存储层分页查询、并发查询限制、前端批量状态更新</li><li>修复更新器下载进度卡住及 Windows URL 错误</li><li>改进 LLM 视觉检测和 Agent 思考面板体验</li></ul> | [⬇️](https://github.com/camthink-ai/NeoMind/releases/tag/v0.6.7) |

## 用户案例

| 案例名称 | 适用产品 | 说明 | 源码下载 |
|:---------|:---------|:-----|:-------:|
| AWS S3 图片上传 | NeoEyes NE301 | <ul style={{margin:0}}><li>基于 HTTP Client 实现 HTTPS 连接</li><li>集成 AWS SigV4 签名认证，生成预签名 URL</li><li>通过 shell 命令初始化（region/bucket/AK/SK）并上传拍摄图片到 S3</li><li>自动生成带时间戳的文件名（capture_YYYYMMDD_HHMMSS.jpg）</li><li>内置 ISRG X1 / GlobalSign R3 / DigiCert G2 CA 证书</li></ul> | [⬇️](https://resources.camthink.ai/wiki/dev-demo/aws_capture.zip) |
| Arduino Camera Web Server | NeoEyes NE101 | <ul style={{margin:0}}><li>基于 ESP32 Arduino 框架，使用 esp_camera 与 esp_http_server 库</li><li>适配 NE101 的 OV5640 摄像头引脚配置</li><li>内置 WiFi HTTP 服务器，支持远程拍照与 MJPEG 视频流</li><li>浏览器端 Web UI，支持摄像头预览与参数调节</li><li>自动检测 PSRAM 以优化图像质量与帧缓冲</li><li>支持 ESP32 / ESP32-S2 / ESP32-S3 平台</li></ul> | [⬇️](https://resources.camthink.ai/wiki/dev-demo/CameraWebServer.zip) |
