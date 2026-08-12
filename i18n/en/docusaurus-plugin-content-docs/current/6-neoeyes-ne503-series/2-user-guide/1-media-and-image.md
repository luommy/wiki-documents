---
description: "Complete guide to NE503 video and imaging: the Media page (stream parameters, RTSP, VLC verification) and the three Image sub-tabs — quality and transform (AI ISP / ISP settings / Transform), overlays and privacy masking (Text / DateTime / Image Overlay / Privacy Mask / AI Auto Mask), and lens / IR control."
keywords: [NE503 video, stream settings, RTSP, VLC pull, AI ISP, Privacy Mask, AI Auto Mask, lens control, IR fill light, IR-CUT]
tags: [User Guide, NE503, Video, Image, RTSP]
---

# Video and Imaging

NE503 video capabilities are configured across two pages: **Media** handles "encode and stream the picture out," while **Image** handles "get the picture right and overlay content." This chapter follows the operational order.

## Media (Live View and Streams)

Go to the **Media** page: the main area shows the live feed, the toolbar sits above it, and the right-side **Configuration** panel configures streams and RTSP.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-media.png" />

### Toolbar

| Button | Action |
|--------|--------|
| **Volume** | Adjust monitoring volume |
| **Talk** | Press and hold to talk (requires a speaker on the device) |
| **Stream Info** | Show the current stream's codec / resolution / frame rate / bitrate |
| **Snapshot** | Capture the current frame as an image |
| **Fullscreen** | Full-screen view |

### Stream Settings

The device provides **Main / Sub / Third** streams, each independently configurable. Switch between them at the top of the right panel:

| Parameter | Description | Selection guidance |
|-----------|-------------|--------------------|
| **Enable Stream** | Whether this stream is active | Disable unused streams to save resources |
| **Codec** | Encoding format (H.264 / H.265) | H.265 gives lower bitrate at equal quality; confirm the receiver supports it |
| **Resolution** | Resolution | 1920×1080 recommended for the main stream; 4K for high-detail scenes |
| **Frame Rate** | Frames per second | Typically 25/30; raise for fast-motion scenes |
| **Bitrate** | Bitrate (Kbps) | Higher is clearer but uses more bandwidth |
| **I-Frame Interval (GOP)** | I-frame interval | Larger compresses better but increases seek latency |

> Typical division of labor: main stream for recording, sub stream for live preview, third stream for AI analysis or mobile.

### RTSP Streaming

Enable **Enable RTSP Stream** to expose the selected stream as a standard RTSP address. The URL appears in the input box with one-click copy:

| Stream | URL |
|--------|-----|
| Main | `rtsp://<device-ip>:8554/main` |
| Sub | `rtsp://<device-ip>:8554/sub` |
| Third | `rtsp://<device-ip>:8554/third` |

Default port: `8554`.

### Verify RTSP with VLC

RTSP is the primary protocol for integrating NE503 with NVR / VMS platforms. Verify the stream quickly with VLC:

1. Open VLC → Media → Open Network Stream, and enter the RTSP URL from the table above:

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-add-network.png" alt="VLC Open Network Stream" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-add-network-2.png" alt="VLC Enter RTSP URL" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

2. Click Play and confirm smooth playback without artifacts:

<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '8px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-play-1.png" alt="VLC Playback Verification" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/vlc-play-2.png" alt="VLC Playback Successful" style={{ flex: '1 1 300px', maxWidth: '48%', borderRadius: '6px' }} />
</div>

> If the stream won't pull, check stream status with `aipc-cli stream list`.

## Image (Picture, Overlays, and Lens)

The **Image** page has three sub-tabs: **Image / Overlay / Control** — Image adjusts quality and transforms, Overlay adds overlays and privacy masks, Control drives the lens and IR.

### Quality and Transform (Image Tab)

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-quality.png" />

**AI ISP** — Enable **Enable AI ISP** to enhance image quality with AI (low-light brightening, denoising, wide dynamic range, etc.); disable to use the traditional ISP. Recommended for low-light or high-dynamic-range scenes.

**ISP Settings**

| Option | Description | When to use |
|--------|-------------|-------------|
| **Manual Mode** | When enabled, manually adjust exposure, gain, and white balance; when disabled, all three are automatic | Leave off for general use; enable when you need fixed exposure (e.g., license-plate recognition) |
| **Powerline Frequency** | 50Hz / 60Hz — must match the local lighting | Choose 50Hz for 220V regions (China, Europe); a mismatch causes flicker bands |
| **White Balance** | White balance mode (Auto / preset / manual color temperature) | Auto for most scenes; switch to manual when colors look off |

**Transform**

| Option | Effect | When to use |
|--------|--------|-------------|
| **Rotation** | Rotate the frame (0° / 90° / 180° / 270°) | Select the matching angle when mounted upside down or sideways |
| **Flip** | Horizontal / vertical flip | Special mirrored-mount scenarios |
| **Distortion** | Lens distortion correction toggle | Enable when wide-angle edge distortion is visible |
| **Grayscale** | Grayscale mode | Nighttime IR scenes — reduces false colors |
| **Digital Stabilization (DIS)** | Software stabilization, no gyroscope required, crops the frame edges to compensate for shake | Use when there is no IMU |
| **Electronic Stabilization (EIS)** | Gyro-based stabilization (requires IMU); outperforms DIS | Prefer when an IMU is present; an abnormal attitude degrades the effect (relies on Dashboard gyro data) |

### Overlays and Privacy Masking (Overlay Tab)

Overlays add information to the frame (text, time, images) or mask sensitive areas. Select the target **Stream** at the top — each stream is configured independently. All overlays can be **dragged directly on the live feed**: double-click text to edit, drag the corner handle to resize.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-overlay.png" />

**Information Overlays**

| Type | Description | Notes |
|------|-------------|-------|
| **Text Overlay** | Custom text (e.g., a location name "Front-Door-01") | Configurable font size, show/hide, multiple entries |
| **DateTime Overlay** | Date-time stamp | Configurable font size and corner position (Top-Left / Top-Right / Bottom-Left / Bottom-Right) |
| **Image Overlay** | Upload a custom image (e.g., a logo) onto the frame | Up to 3 per stream |

**Privacy Masking**

| Type | How it masks | Suited for |
|------|-------------|------------|
| **Privacy Mask** | Draw polygons over fixed areas to be permanently blocked from the frame | Fixed regions you never want captured (a neighbor's window, an operator console) |
| **AI Auto Mask** | AI detects specific targets (faces, license plates) and masks them in real time, following them as they move | GDPR and similar privacy-compliance scenarios |

The two are independent: Privacy Mask blocks a **fixed position**, regardless of what enters it; AI Auto Mask blocks **specific targets**, following them as they move. AI Auto Mask depends on AI inference.

### Lens and IR (Control Tab)

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/media-and-image/qs-image-control.png" />

**Lens Control**

| Item | Effect |
|------|--------|
| **Zoom** | Zoom slider (shows the multiplier, e.g., 1.0x) |
| **Focus** | Focus slider (shows the position percentage and zone, e.g., MID) |
| **One-shot AF** | Click once to run a single autofocus at the current zoom |
| **Reset to 1.0x** | Return to the minimum zoom |
| **IR-Cut Filter** | Infrared cut filter toggle — on during the day for accurate color, off at night to let in infrared light (the status text indicates the current mode) |

**IR Light Control**

| Item | Effect |
|------|--------|
| **Near IR** | Short-range IR fill light toggle + brightness slider |
| **Far IR** | Long-range IR fill light toggle + brightness slider |

Enable as needed for night or low-light scenes; adjust brightness based on distance and scene. Note that fill lights add to power draw and heat.

> To **control the lens or IR remotely from an app** (e.g., programmatic zoom), the app must be installed with the Device Control permission.
