---
id: firmware
slug: /7-release-notes/firmware
description: Firmware release history, download resources, and user development case studies for CamThink products including NeoEyes NE301, NE101, and NeoEdge NG4500.
keywords: [Release Notes, firmware update, firmware download, dev cases, NE301, NE101, NG4500, CamThink]
tags: [Release Notes, firmware, download, dev cases]
sidebar_position: 1
---

# Firmware

This page summarizes firmware release history, download resources, and community development cases across CamThink product lines.

<!-- Download rule: all download links point to the corresponding GitHub Release page. Format: [⬇️](GitHub Release URL) -->

## NeoEyes NE101

| Firmware | Release Date | Changes | Download |
|:---------|:-------------|:--------|:-------:|
| v1.8 | 2026-05-07 | <ul style={{margin:0}}><li>Add Webhook push notification</li><li>Add device configuration export/import</li><li>Add Interval Anchor Time for anchor-based interval scheduling</li><li>Add Ping API, Debug module (with web debug logs and console commands) and ISP selection</li><li>Add Verizon carrier Context 3 support</li><li>Upgrade esp_modem to v2.0.1, fix Verizon PPP connection</li><li>Optimize scheduled capture to rolling 24h window (no more midnight reset, avoids cross-midnight scheduling jumps)</li><li>Extend MQTT/platform credential field length (64→128), sync Web UI input limits</li><li>Extend Australia S1G WiFi band support</li><li>Fix camera JPEG queue memory and flash/warmup timing</li><li>Fix HaLow WiFi CE module weak signal issue</li><li>Fix battery ADC sampling and reporting rate issues</li><li>Fix button snapshot instability (add 1s delay to avoid unstable button state)</li></ul> | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.8(hw-v1.2)) |
| v1.7 | 2026-01-27 | <ul style={{margin:0}}><li>Add UVC camera HDR setting</li><li>Merge PIR and Alarm into a single firmware (switchable via Web UI)</li><li>Fix high resolution switching issue</li><li>Fix PIR/Alarm repeated false wake-ups</li><li>Fix HaLow WiFi region configuration selection issue</li><li>Web UI improvements</li></ul> | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.7) |
| v1.6 | 2025-11-25 | <ul style={{margin:0}}><li>Add camera resolution configuration to Web UI</li><li>Fix OTA upgrade failure</li></ul> | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.6) |
| v1.5 | 2025-11-18 | <ul style={{margin:0}}><li>Initial release with PIR / ALARMIN modes</li><li>FCC (915MHz) and CE (868MHz) variants available</li></ul> | [⬇️](https://github.com/camthink-ai/lowpower_camera/releases/tag/v1.5) |

## NeoEyes NE301

| Firmware | Release Date | Changes | Download |
|:---------|:-------------|:--------|:-------:|
| v20260213 | 2026-02-13 | <ul style={{margin:0}}><li>Add AWS HTTP upload support with SigV4 signature</li><li>Add EG912U GL Cat.1 modem network interface</li><li>Upgrade ST EdgeAI runtime to v2.2</li><li>Add YuNet face detection and YOLO D object detection models</li><li>OTA module improvements</li></ul> | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/v20260213_main) |
| v20260213<br />（EdgeAI branch） | 2026-02-13 | <ul style={{margin:0}}><li>Add YOLO11n model support</li><li>Support PSRAM 64Mb</li></ul> | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/v20260213_stedgeai-v2.2) |
| V20260120 | 2026-01-20 | <ul style={{margin:0}}><li>Initial release</li><li>Object detection (YOLOv2/v5/v8, SSD, YOLOX), face detection (BlazeFace), pose estimation (MoveNet), semantic segmentation (DeepLab v3) models</li><li>WiFi / Cat.1 / PoE connectivity</li><li>RTMP / MQTT streaming</li><li>Web UI device management</li></ul> | [⬇️](https://github.com/camthink-ai/ne301/releases/tag/V20260120) |

## NeoMind

| Version | Release Date | Changes | Download |
|:--------|:-------------|:--------|:-------:|
| v0.6.9 | 2026-04-16 | <ul style={{margin:0}}><li>Add transform aggregated tool for LLM-driven data transform</li><li>Fix Agent cache invalidation, context compaction, and tool result formatting</li><li>Fix anti-hallucination handling for tool results</li></ul> | [⬇️](https://github.com/camthink-ai/NeoMind/releases/tag/v0.6.9) |
| v0.6.8 | 2026-04-15 | <ul style={{margin:0}}><li>Simplify LLM thinking control, unify thinking display in multi-round conversations</li><li>Expose virtual metrics to LLM and add write_metric action</li><li>Harden OTA update flow (fix done state, dual dialog, version sync)</li><li>Fix rule builder extension support</li><li>Reuse session-level tool result cache</li></ul> | [⬇️](https://github.com/camthink-ai/NeoMind/releases/tag/v0.6.8) |
| v0.6.7 | 2026-04-14 | <ul style={{margin:0}}><li>Performance optimizations: paginated storage queries, concurrent query limits, batched frontend state updates</li><li>Fix updater download progress stuck and Windows URL error</li><li>Improve LLM vision detection and Agent thinking panel UX</li></ul> | [⬇️](https://github.com/camthink-ai/NeoMind/releases/tag/v0.6.7) |

## User Cases

| Case | Product | Description | Source Code |
|:-----|:--------|:-----------|:------:|
| AWS S3 Image Upload | NeoEyes NE301 | <ul style={{margin:0}}><li>HTTPS connection via HTTP Client</li><li>AWS SigV4 signature authentication with pre-signed URL generation</li><li>Shell commands to initialize (region/bucket/AK/SK) and upload captured images to S3</li><li>Timestamped file naming (capture_YYYYMMDD_HHMMSS.jpg)</li><li>Built-in CA certificates (ISRG X1 / GlobalSign R3 / DigiCert G2)</li></ul> | [⬇️](https://resources.camthink.ai/wiki/dev-demo/aws_capture.zip) |
| Arduino Camera Web Server | NeoEyes NE101 | <ul style={{margin:0}}><li>Based on ESP32 Arduino framework with esp_camera and esp_http_server libraries</li><li>OV5640 camera pin configuration tailored for NE101 hardware</li><li>Built-in WiFi HTTP server for remote photo capture and MJPEG video streaming</li><li>Browser-based Web UI for camera preview and parameter adjustment</li><li>Auto-detect PSRAM for optimized image quality and frame buffering</li><li>Support ESP32 / ESP32-S2 / ESP32-S3 platforms</li></ul> | [⬇️](https://resources.camthink.ai/wiki/dev-demo/CameraWebServer.zip) |
