---
description: NE503 RTSP 视频流对接实战指南，涵盖 FFmpeg 拉流录制/转码与 VMS/NVR 对接方案。
keywords: [NE503, RTSP, FFmpeg, GStreamer, 视频流, VMS, 对接]
tags: [系统集成, NE503, 视频流, RTSP]
---

# Video Integration

NE503 通过 RTSP 协议输出 H.264 视频流，支持 TCP 交织传输，端到端延迟 < 100ms。本文面向需要将 NE503 视频流集成到自有系统的第三方开发者，提供从拉流录制、转码到 NVR/VMS 对接的完整方案。

## 1. 码流概览

### 1.1 三路码流参数

NE503 提供三路独立编码的 H.264 码流，参数如下：

| 参数 | 主码流 (main) | 子码流 (sub) | 三码流 (third) |
|------|-------------|-------------|---------------|
| 分辨率 | 3840x2160（4K） | 1280x720 | 640x384 |
| 帧率 | 30 fps | 30 fps | 15 fps |
| 码率 | 4 Mbps | 2 Mbps | 512 Kbps |
| GOP | 30 (1s) | 60 (2s) | 30 (2s) |
| Profile | High 4.1 | High | Main |
| 编码 | H.264 | H.264 | H.264 |

> 以上为出厂默认参数，可通过 Platform API 的 `PUT /media/encoder` 端点运行时热更新码率、帧率、GOP，无需重启设备。

### 1.2 RTSP URL 格式

```
rtsp://<DEVICE_IP>:8554/{main,sub,third}
```

| 码流 | URL | 典型用途 |
|------|-----|---------|
| 主码流 | `rtsp://192.168.1.100:8554/main` | 高清录像、大屏显示 |
| 子码流 | `rtsp://192.168.1.100:8554/sub` | 多路预览、中等质量录制 |
| 三码流 | `rtsp://192.168.1.100:8554/third` | 移动端、AI 分析、低带宽场景 |

> RTSP `:8554` **无认证**——URL 中不需要用户名密码，NVR 等播放器里凭据栏留空即可。这也意味着任何能访问设备端口的主机都能拉流，公网部署前务必置于网关/防火墙之后（见[安全加固](../../2-user-guide/7-security-hardening.md)）。

> NE503 强制使用 **RTSP over TCP**（RTP/AVP/TCP 交织传输），不支持 UDP 传输模式。所有拉流命令需指定 TCP 传输。

## 2. FFmpeg 集成

### 2.1 基本拉流验证

```bash
# 验证码流是否可用（播放 10 秒，不做实际输出）
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -t 10 -f null -
```

### 2.2 拉流录制

```bash
# 主码流直接录制（不转码，保持原始 H.264）
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -c copy -f mp4 recording_main.mp4

# 子码流录制为 MKV（支持断流续录，MKV 容器更容错）
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/sub" \
  -c copy -f matroska recording_sub.mkv
```

### 2.3 转码输出

```bash
# 转码为 720p H.264 用于 Web 分发
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -vf scale=1280:720 -c:v libx264 -preset fast -crf 23 \
  -f mp4 output_720p.mp4

# 转码为 H.265 节省存储空间
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -c:v libx265 -preset medium -crf 28 \
  -f mp4 output_h265.mp4
```

### 2.4 定时截帧

```bash
# 每 5 秒截取一帧，保存为 JPEG
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/sub" \
  -vf fps=1/5 -q:v 2 snapshot_%04d.jpg

# 单帧截图
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -frames:v 1 capture.jpg
```

### 2.5 多路同时拉取

```bash
# 同时拉取三路码流，分别保存
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
       -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/sub" \
       -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/third" \
  -map 0:v -c copy recording_main.mp4 \
  -map 1:v -c copy recording_sub.mp4 \
  -map 2:v -c copy recording_third.mp4
```

> **其他拉流工具**：除 FFmpeg 外，GStreamer（`rtspsrc protocols=tcp latency=0`）、VLC、OpenCV 等任何支持 RTSP over TCP 的工具均可拉取 NE503 码流，命令与上述等价，本文不再赘述。

## 3. VMS 集成

### 3.1 通用 NVR / ONVIF 接入

NE503 当前版本以 RTSP 对接为主，不提供 ONVIF 设备发现服务。通用 NVR 对接步骤：

1. 在 NVR 中选择"手动添加设备"或"自定义 RTSP"
2. 填写 RTSP 地址：`rtsp://<设备IP>:8554/main`
3. 传输协议选择 **TCP**
4. 按需选择码流：NVR 录像用 `main`，多画面预览用 `sub`

## 4. 并发与带宽规划

NE503 的 RTSP 服务支持多客户端同时拉取，并发上限取决于设备负载与码流组合，建议按实际部署实测确认。常见做法是主码流录像、子码流多画面预览、三码流做 AI 分析，分别独立拉取即可。

RTSP over TCP 交织传输的网络开销约 10–25%，带宽规划时按 §1.1 的码率预留余量。

## 5. 相关文档

- [快速入门](../../1-quick-start.md) — RTSP 码流验证与 VLC 播放
- [RESTful API](./3-restful-api.md) — 媒体流 API 端点（码流启停、参数调整）
- [平台服务总览](../../3-software-guide/4-platform-services.md) — Camera Daemon 等服务职责与源码指针
- [故障排查](../../5-troubleshooting.md) — RTSP 拉流常见问题与解决方案
