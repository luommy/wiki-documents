---
description: NE503 视频与成像完整指南：Media 页的码流参数、RTSP 推流与 VLC 验证；Image 页三子标签——画质与变换（AI ISP / ISP 设置 / Transform）、叠加层与隐私遮罩（Text / DateTime / Image Overlay / Privacy Mask / AI Auto Mask）、镜头与红外控制。
keywords: [NE503 视频, 码流设置, RTSP, VLC 拉流, AI ISP, Privacy Mask, AI Auto Mask, 镜头控制, 红外补光, IR-CUT]
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
| **Resolution** | 分辨率 | 主码流建议 1920×1080；细节要求高的场景可上 4K |
| **Frame Rate** | 帧率（FPS） | 一般 25/30；运动场景可提高 |
| **Bitrate** | 码率（Kbps） | 越高越清晰、带宽占用越大 |
| **I-Frame Interval (GOP)** | I 帧间隔 | 越大压缩率越高，但拖动 Seek 延迟越大 |

> 三路码流的典型分工：主码流录像存储、子码流实时预览、三码流供 AI 分析或移动端。

### RTSP 推流

开启 **Enable RTSP Stream** 后，所选码流暴露标准 RTSP 地址，输入框中显示 URL，可一键复制：

| 码流 | 地址 |
|------|------|
| 主码流 | `rtsp://<设备IP>:8554/main` |
| 子码流 | `rtsp://<设备IP>:8554/sub` |
| 三码流 | `rtsp://<设备IP>:8554/third` |

默认端口 `8554`。

### 用 VLC 验证 RTSP

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

## 画面、叠加与镜头

**Image** 页面分 **Image / Overlay / Control** 三个子标签：Image 调画质与画面变换，Overlay 叠加信息与隐私遮罩，Control 控制镜头与红外。

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
| **Privacy Mask** | 多边形框出固定区域，画面该位置被永久遮蔽 | 固定不希望被拍摄的区域（邻居窗户、操作台） |
| **AI Auto Mask** | AI 实时识别目标（人脸、车牌等）并打码，目标移动时遮挡跟随移动 | GDPR 等隐私合规场景 |

两种遮罩相互独立：Privacy Mask 遮的是**固定位置**，不管画面内容变化；AI Auto Mask 遮的是**特定目标**，跟着目标走。AI Auto Mask 依赖 AI 模型推理。

### 镜头与红外（Control 标签）

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-control.png" />

**镜头控制（Lens Control）**

| 项 | 作用 |
|----|------|
| **Zoom** | 变焦滑块（显示倍率，如 1.0x） |
| **Focus** | 对焦滑块（显示位置百分比与区间，如 MID） |
| **One-shot AF** | 点一次，在当前焦距执行单次自动对焦 |
| **Reset to 1.0x** | 复位到最小倍率 |
| **IR-Cut Filter** | 红外滤光片开关——白天开启保证色彩，夜间关闭以提升红外感光（状态文字提示当前模式） |

**红外补光（IR Light Control）**

| 项 | 作用 |
|----|------|
| **Near IR** | 近距离红外补光开关 + 亮度滑块 |
| **Far IR** | 远距离红外补光开关 + 亮度滑块 |

夜间或低光场景按需开启，亮度根据距离与场景调整。注意补光灯会增加功耗与发热。

> 若要**通过应用远程控制**镜头或红外（如程序化变焦），需在应用安装时勾选 Device Control 权限。
