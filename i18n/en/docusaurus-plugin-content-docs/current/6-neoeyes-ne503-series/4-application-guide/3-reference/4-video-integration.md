---
description: Practical NE503 RTSP video stream integration guide, covering FFmpeg stream pulling/recording/transcoding and VMS/NVR integration solutions.
keywords: [NE503, RTSP, FFmpeg, GStreamer, video stream, VMS, integration]
tags: [System Integration, NE503, Video Streaming, RTSP]
---

# Video Integration

NE503 outputs an H.264 video stream via the RTSP protocol, supporting TCP interleaved transport with end-to-end latency under 100 ms. This document targets third-party developers who need to integrate the NE503 video stream into their own systems, providing a complete solution from stream pulling, recording, and transcoding to NVR/VMS integration.

## 1. Stream Overview

### 1.1 Three-Stream Parameters

NE503 provides three independently encoded H.264 streams with the following parameters:

| Parameter | Main Stream (main) | Sub Stream (sub) | Third Stream (third) |
|------|-------------|-------------|---------------|
| Resolution | 1920x1080 | 1280x720 | 640x384 |
| Frame rate | 30 fps | 30 fps | 15 fps |
| Bitrate | 4 Mbps | 2 Mbps | 512 Kbps |
| GOP | 30 (1s) | 60 (2s) | 30 (2s) |
| Profile | High 4.1 | High | Main |
| Codec | H.264 | H.264 | H.264 |

> The values above are factory defaults. You can hot-update the bitrate, frame rate, and GOP at runtime via the Platform API `PUT /media/encoder` endpoint, with no device reboot required.

### 1.2 RTSP URL Format

```
rtsp://<DEVICE_IP>:8554/{main,sub,third}
```

| Stream | URL | Typical Use |
|------|-----|---------|
| Main stream | `rtsp://192.168.1.100:8554/main` | HD recording, large-screen display |
| Sub stream | `rtsp://192.168.1.100:8554/sub` | Multi-channel preview, medium-quality recording |
| Third stream | `rtsp://192.168.1.100:8554/third` | Mobile devices, AI analysis, low-bandwidth scenarios |

> NE503 mandates **RTSP over TCP** (RTP/AVP/TCP interleaved transport) and does not support UDP transport mode. All stream-pulling commands must specify TCP transport.

## 2. FFmpeg Integration

### 2.1 Basic Stream-Pulling Verification

```bash
# Verify that the stream is available (play for 10 seconds, no actual output)
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -t 10 -f null -
```

### 2.2 Stream Pulling and Recording

```bash
# Record the main stream directly (no transcoding, keep raw H.264)
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -c copy -f mp4 recording_main.mp4

# Record the sub stream as MKV (supports resuming after stream interruption; MKV container is more fault-tolerant)
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/sub" \
  -c copy -f matroska recording_sub.mkv
```

### 2.3 Transcoded Output

```bash
# Transcode to 720p H.264 for web distribution
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -vf scale=1280:720 -c:v libx264 -preset fast -crf 23 \
  -f mp4 output_720p.mp4

# Transcode to H.265 to save storage space
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -c:v libx265 -preset medium -crf 28 \
  -f mp4 output_h265.mp4
```

### 2.4 Scheduled Frame Capture

```bash
# Capture one frame every 5 seconds and save as JPEG
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/sub" \
  -vf fps=1/5 -q:v 2 snapshot_%04d.jpg

# Single-frame snapshot
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -frames:v 1 capture.jpg
```

### 2.5 Concurrent Multi-Stream Pulling

```bash
# Pull three streams concurrently and save them separately
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
       -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/sub" \
       -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/third" \
  -map 0:v -c copy recording_main.mp4 \
  -map 1:v -c copy recording_sub.mp4 \
  -map 2:v -c copy recording_third.mp4
```

> **Other stream-pulling tools**: Besides FFmpeg, GStreamer (`rtspsrc protocols=tcp latency=0`), VLC, OpenCV, or any other tool that supports RTSP over TCP can pull NE503 streams. The commands are equivalent to those above and will not be elaborated further in this document.

## 3. VMS Integration

### 3.1 Generic NVR / ONVIF Integration

The current NE503 release focuses on RTSP integration and does not provide ONVIF device discovery. Steps for generic NVR integration:

1. In the NVR, choose "Add device manually" or "Custom RTSP"
2. Fill in the RTSP address: `rtsp://<DEVICE_IP>:8554/main`
3. Select **TCP** as the transport protocol
4. Choose the stream as needed: use `main` for NVR recording and `sub` for multi-view preview

## 4. Concurrency and Bandwidth Planning

The NE503 RTSP service supports multiple concurrent clients pulling simultaneously. The concurrency limit depends on device load and the stream combination; we recommend testing under your actual deployment to confirm. A common approach is to use the main stream for recording, the sub stream for multi-view preview, and the third stream for AI analysis, each pulled independently.

RTSP over TCP interleaved transport incurs approximately 10–25% network overhead; factor in margin beyond the bitrates listed in §1.1 when planning bandwidth.

## 5. Related Documentation

- [Quick Start](../../1-quick-start.md) — RTSP stream verification and VLC playback
- [RESTful API](./3-restful-api.md) — Media stream API endpoints (stream start/stop, parameter adjustment)
- [Platform Services Overview](../../3-software-guide/4-platform-services.md) — Responsibilities and source pointers for services such as Camera Daemon
- [Troubleshooting](../../5-troubleshooting.md) — Common RTSP stream-pulling issues and solutions
