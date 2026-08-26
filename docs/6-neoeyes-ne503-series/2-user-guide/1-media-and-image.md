---
description: NE503 视频与成像完整指南：Media 页的码流参数、RTSP 推流与外部系统对接（VLC / FFmpeg / NVR 接入示例）；Image 页三子标签——画质与变换（AI ISP / ISP 设置 / Transform）、叠加层与隐私遮罩（Text / DateTime / Image Overlay / Privacy Mask / AI Auto Mask）、镜头与红外控制。
keywords: [NE503 视频, 码流设置, RTSP, VLC 拉流, FFmpeg, NVR 对接, AI ISP, Privacy Mask, AI Auto Mask, 镜头控制, 红外补光, IR-CUT]
tags: [用户指南, NE503, 视频, 图像, RTSP]
---

# Video and Imaging

NE503 的视频能力由 **Media** 与 **Image** 两个页面共同配置：Media 负责"把画面编码推出去"，Image 负责"把画面弄对并叠加内容"。本章按操作顺序展开。

## 实时画面与码流

进入 **Media** 页面：主区域是实时画面，上方是工具栏，右侧 **Configuration** 面板配置码流与 RTSP。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-media.png" />

### 工具栏

| 按钮 | 作用 |
|------|------|
| **Volume** | 调节监听音量 |
| **Talk** | 按住对讲（需设备接扬声器） |
| **Stream Info** | 显示当前码流的编码 / 分辨率 / 帧率 / 码率 |
| **Snapshot** | 抓取当前画面为图片 |
| **Fullscreen** | 全屏查看 |

### 码流设置

设备提供 **Main / Sub / Third** 三路码流，可分别配置。在右侧面板上方切换：

| 参数 | 说明 | 选型建议 |
|------|------|---------|
| **Enable Stream** | 是否启用该路码流 | 不用的码流关闭以节省资源 |
| **Codec** | 编码格式（H.264 / H.265） | H.265 同画质码率更低，需确认对端支持 |
| **Resolution** | 分辨率 | 出厂主码流为 4K（3840×2160@30）；带宽受限或对端不支持时可降至 1080p |
| **Frame Rate** | 帧率（FPS） | 一般 25/30；运动场景可提高 |
| **Bitrate** | 码率（Kbps） | 越高越清晰、带宽占用越大 |
| **I-Frame Interval (GOP)** | I 帧间隔 | 越大压缩率越高，但拖动 Seek 延迟越大 |

> 三路码流的典型分工：主码流录像存储、子码流实时预览、三码流供 AI 分析或移动端。

### RTSP 推流

开启 **Enable RTSP Stream** 后，所选码流即开放标准 RTSP 地址，输入框中显示 URL，可一键复制：

| 码流 | 地址 |
|------|------|
| 主码流 | `rtsp://<设备IP>:8554/main` |
| 子码流 | `rtsp://<设备IP>:8554/sub` |
| 三码流 | `rtsp://<设备IP>:8554/third` |

默认端口 `8554`。

## RTSP 对接

外部系统（NVR / VMS / 业务服务器）通过 RTSP 拉取 NE503 码流。对接前先了解三条约束和出厂参数：

- **仅支持 RTSP over TCP**（RTP/AVP/TCP 交织传输），不支持 UDP，拉流命令需指定 TCP；
- **RTSP 端口无认证**——URL 不含用户名密码，任何能访问设备端口的主机都能拉流，公网部署务必置于网关/防火墙之后（见[安全加固](./7-security-hardening.md)）；
- 出厂参数如下，可通过 Platform API `PUT /media/encoder` 运行时热更新码率、帧率、GOP，无需重启：

| 参数 | 主码流 (main) | 子码流 (sub) | 三码流 (third) |
|------|-------------|-------------|---------------|
| 分辨率 | 3840×2160（4K） | 1280×720 | 640×384 |
| 帧率 | 30 fps | 30 fps | 15 fps |
| 码率 | 4 Mbps | 2 Mbps | 512 Kbps |
| GOP | 30（1s） | 60（2s） | 30（2s） |
| Profile | High 4.1 | High | Main |
| 原始帧（NV12） | ✗ 仅编码 H.264 | ✓ | ✓（平台默认推理流） |

三路码流的典型分工：主码流高清录像与大屏显示，子码流多路预览与中等质量录制，三码流移动端、AI 分析与低带宽场景。RTSP over TCP 的网络开销约 10–25%，带宽规划按上表码率预留余量；多客户端可同时拉流，并发上限取决于设备负载，建议实测确认。

> 「原始帧」列决定该流能否送 NPU 推理：只有 `sub` 和 `third` 发布未经编码的 NV12 帧。应用订阅推理时 `stream` 必须填这两者之一；填 `main`（仅编码 H.264）会永远等不到结果。三路均由 ISP 硬件缩放输出，无软件缩放开销。

### 示例：用 VLC 验证拉流

RTSP 是 NE503 对接 NVR / VMS 的主要协议。用 VLC 快速验证能否正常拉流：

1. 打开 VLC → 媒体 → 打开网络串流，输入上表中的 RTSP 地址：

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-add-network.png" alt="VLC 打开网络串流" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-add-network-2.png" alt="VLC 输入 RTSP 地址" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

2. 点击播放，确认画面流畅、无花屏：

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-play-1.png" alt="VLC 播放验证" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-play-2.png" alt="VLC 播放成功" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

> 无法拉流时，用 `aipc-cli stream list` 确认码流状态。

### 示例：FFmpeg 拉流与录制

FFmpeg 拉流必须加 `-rtsp_transport tcp`：

```bash
# 验证码流可用（播放 10 秒，不做实际输出）
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" -t 10 -f null -

# 直接录制（不转码，保持原始 H.264）
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -c copy -f mp4 recording_main.mp4

# 转码为 720p H.264 用于 Web 分发
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/main" \
  -vf scale=1280:720 -c:v libx264 -preset fast -crf 23 -f mp4 output_720p.mp4

# 每 5 秒截一帧存 JPEG
ffmpeg -rtsp_transport tcp -i "rtsp://192.168.1.100:8554/sub" \
  -vf fps=1/5 -q:v 2 snapshot_%04d.jpg
```

GStreamer（`rtspsrc protocols=tcp latency=0`）、OpenCV 等支持 RTSP over TCP 的工具同样可用。

### 示例：接入 NVR / VMS

NE503 以 RTSP 对接为主，不提供 ONVIF 设备发现。在 NVR 中手动添加设备：

1. 选择「手动添加设备」或「自定义 RTSP」
2. 填写 RTSP 地址：`rtsp://<设备IP>:8554/main`
3. 传输协议选择 **TCP**
4. 按需选码流：NVR 录像用 `main`，多画面预览用 `sub`

## 画面、叠加与镜头

**Image** 页面分 **Image / Overlay / Control** 三个子标签：Image 调画质与画面变换，Overlay 叠加信息与隐私遮罩，Control 控制镜头与红外。镜头控制项随设备所选镜头配置而定，并非所有 SKU 都显示相同控件。

### 画质与变换（Image 标签）

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-quality.png" />

**AI ISP** — 开启 **Enable AI ISP** 后，设备用 AI 算法增强画质（弱光增亮、降噪、宽动态等），关闭则走传统 ISP。弱光或高动态范围场景建议开启。

**ISP 设置**

| 选项 | 说明 | 使用建议 |
|------|------|---------|
| **Manual Mode** | 开启后可手动调整曝光（Exposure）、增益（Gain）、白平衡（White Balance）；关闭则三项全部自动 | 一般场景关闭即可；需固定曝光的场景（如车牌识别）开启 |
| **Powerline Frequency** | 电源频率（50Hz / 60Hz），须与现场照明一致 | 国内及多数 220V 地区选 50Hz；不匹配会出现频闪条纹 |
| **White Balance** | 白平衡模式（Auto / 预设 / 手动色温） | 多数场景选 Auto；偏色时选手动色温微调 |

**画面变换（Transform）**

| 选项 | 作用 | 使用场景 |
|------|------|---------|
| **Rotation** | 画面旋转（0° / 90° / 180° / 270°） | 倒装或侧装时选对应角度 |
| **Flip** | 水平 / 垂直翻转 | 特殊镜像安装场景 |
| **Distortion** | 镜头畸变校正开关 | 广角边缘畸变明显时开启 |
| **Grayscale** | 灰度模式 | 夜间红外场景可减少伪色 |
| **Digital Stabilization (DIS)** | 数字防抖，纯软件，无需陀螺仪，裁切边缘画面补偿抖动 | 无 IMU 时使用 |
| **Electronic Stabilization (EIS)** | 电子防抖，基于陀螺仪（需 IMU），效果优于 DIS | 有 IMU 时优先；姿态异常会影响效果（依赖 Dashboard 陀螺仪数据） |

### 叠加层与隐私遮罩（Overlay 标签）

Overlay 用于在画面上叠加信息（文字、时间、图片）或遮挡敏感区域。在顶部 **Stream** 选择要配置的码流——每路码流的叠加独立设置。所有叠加支持在实时画面上**直接拖拽定位**：文字双击编辑，边角拖拽缩放。

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-overlay.png" />

**信息叠加**

| 类型 | 说明 | 备注 |
|------|------|------|
| **Text Overlay** | 自定义文字（如点位名"前门-01"） | 可设字号、显示/隐藏，支持多条 |
| **DateTime Overlay** | 日期时间戳 | 可设字号与四角位置（Top-Left / Top-Right / Bottom-Left / Bottom-Right） |
| **Image Overlay** | 上传自定义图片（如 Logo）叠在画面上 | 每路码流最多 3 个 |

**隐私遮罩**

| 类型 | 遮挡方式 | 适合场景 |
|------|---------|---------|
| **Privacy Mask** | 多边形框出固定区域，画面该位置永久遮蔽 | 固定不想拍到的区域（邻居窗户、操作台） |
| **AI Auto Mask** | AI 实时识别目标（人脸、车牌等）并打码，目标移动时遮挡跟随移动 | GDPR 等隐私合规场景 |

两种遮罩相互独立：Privacy Mask 遮的是**固定位置**，不管画面内容变化；AI Auto Mask 遮的是**特定目标**，跟着目标走。AI Auto Mask 依赖 AI 模型推理。

### 镜头与红外（Control 标签）

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-control.png" />

**镜头控制（Lens Control）**

| 项 | 作用 |
|----|------|
| **Zoom** | 电动变焦配置提供的变焦滑块（显示倍率，如 1.0x） |
| **Focus** | 支持对焦控制的配置提供的对焦滑块（显示位置百分比与区间，如 MID） |
| **One-shot AF** | 支持自动对焦的配置可点击此项，在当前焦距触发一次自动对焦 |
| **Reset to 1.0x** | 电动变焦配置复位到最小倍率 |
| **IR-Cut Filter** | 红外滤光片开关——白天开启保证色彩，夜间关闭以提升红外感光（状态文字提示当前模式） |

**红外补光（IR Light Control）**

| 项 | 作用 |
|----|------|
| **Near IR** | 近距离红外补光开关 + 亮度滑块 |
| **Far IR** | 远距离红外补光开关 + 亮度滑块 |

夜间或低光场景按需开启，亮度根据距离与场景调整。注意补光灯会增加功耗与发热。

> 若要**通过应用远程控制**镜头或红外（如代码控制变焦），设备镜头配置必须支持对应能力，并且应用安装时需勾选 Device Control 权限。
