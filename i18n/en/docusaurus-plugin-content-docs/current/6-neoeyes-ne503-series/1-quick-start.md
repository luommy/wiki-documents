---
description: Get your NE503 up and running — from unboxing to seeing AI inference results. Covers kit preparation, power and connection, login and password change, camera and stream verification, experiencing AI, network and time zone configuration, and where to go next.
keywords: [NE503 quick start, first deployment, web console login, AI Model Showcase, default IP, PoE power, edge AI camera]
tags: [Quick Start, NE503, First Deployment]
---

# Quick Start

This guide walks you through the first deployment of the NE503: unbox → connect → log in & change password → verify the camera → experience AI → configure network and time zone. Once done, the device is ready to go live. For in-depth features, see the [User Guide](./2-user-guide/0-dashboard.md).

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ne503-main.png" alt="NeoEyes NE503" width="100%" />
</div>

## 1. Kit and Preparation

### Kit Contents

| Component | Qty | Description |
|-----------|-----|-------------|
| NE503 main unit | 1 | Core processing board and interface board, IP67 rated |
| Wall-mount screw pack | 1 | Mounting screws and hardware |

### What You Need to Provide

- **PoE switch** (802.3AT, recommended) + Ethernet cable: a single cable provides both power and network
- **Or** DC 12V adapter + standard switch + Ethernet cable
- **Computer**: with an Ethernet port, running Windows / macOS / Linux, and a modern browser (Chrome / Edge / Firefox / Safari)

### Installation Location

IP67 rated, -40 °C to +60 °C operating temperature, suitable for outdoor installation. Secure the wall-mount bracket to the wall / pole, align the NE503 with the bracket and tighten the screws. Pole and ceiling mounts require additional brackets (sold separately). Power consumption: 5–6 W.

## 2. Power and Connection

**Power on**: For PoE, connect the Ethernet cable to a PoE switch; for DC, connect a 12V adapter to the DC port. The indicator blinks during startup and turns solid when ready (about 30–60 seconds).

**Connect**: The default factory IP is `10.0.0.1`. Set your computer's Ethernet IP to the same subnet (e.g., `10.0.0.100`, mask `255.255.255.0`), then verify with ping:

```bash
ping 10.0.0.1
```

If it replies, proceed to the next step.

## 3. Log In and Change the Password

Open a browser and navigate to `https://10.0.0.1` (the browser will warn that the certificate is not trusted on first access — proceed as prompted). Sign in with the default credentials — username `admin`, password `password`:

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-login.png" />

After logging in, you land on the Dashboard. Click the expand icon in the top-left corner to show the navigation labels (Dashboard / Media / Image / Applications / Models / Peripherals / Settings / Maintenance) — you'll jump between these pages throughout this guide.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-dashboard.png" />

**⚠️ First thing: change the default password.** The default password is public knowledge; leaving it unchanged exposes the device. Go to **Settings → Device Info**, scroll to **Change Password** at the bottom, and set a new password.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-device-info.png" />

## 4. Verify the Camera and Stream

Go to the **Media** page. The main area shows the live camera feed — seeing the image confirms that the camera sensor and image pipeline are working.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-media.png" />

While you're here, confirm the stream works end to end: in the right-side **Configuration** panel, enable **Enable RTSP Stream**, copy the main stream URL `rtsp://<device-ip>:8554/main`, and pull it in VLC (Media → Open Network Stream → paste the URL → Play). Smooth playback means the full pipeline is healthy.

## 5. Experience the AI

NE503's AI capabilities are delivered through container apps. The official app repository [camthink-ai/neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) provides sample apps, including **AI Model Showcase**, which demonstrates multi-model inference — object detection, semantic segmentation, keypoints, OCR, CLIP zero-shot classification, monocular depth estimation, and more.

Clone the repository, build the `.aipc` package by following the repo's instructions, then on the **Applications** page click **Import**, upload the package, and follow the wizard to grant the Permissions (models and streams) the app needs:

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-app-management.png" />

Once installed and running, click **Visit App** on the app card to open the Showcase UI and switch between models to see inference results in real time:

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-model-showcase.png" />

## 6. Configure Network and Time Zone

After step 5 the device already works. The last step is to configure the network and time zone on the **Settings** page, and the device is ready to go live.

### Connect to Your LAN

The factory IP `10.0.0.1` is for initial setup only. For other devices on your LAN (NVRs, servers, colleagues' computers) to reach the NE503, go to **Settings → Network** and choose:

| Mode | When | What to do |
|------|------|------------|
| **DHCP** | A router assigns IPs automatically | Select DHCP and save |
| **Static Address** | You need a fixed IP | Enter IP / subnet mask / gateway / DNS |

After saving, the device switches to the new IP. Change your computer's IP back to its normal subnet (or use another machine on the same subnet) and re-access the device at `https://<new-ip>`.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-network.png" />

> For production, prefer a static IP or bind the MAC in the router to avoid IP changes breaking integrations.

### Set the Time Zone

A wrong time zone breaks video OSD timestamps and recording file names. Go to **Settings → Time Settings**: pick your deployment time zone, configure an NTP server (e.g., `pool.ntp.org`), and click **Sync Now**.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/quick-start/qs-settings-time-settings.png" />

## 7. What's Next

The device is live. Continue based on your goal:

| Your goal | Where to go |
|-----------|-------------|
| Tune the lens / image quality / overlays and privacy masks | [User Guide · Video and Imaging](./2-user-guide/1-media-and-image.md) |
| Pull an RTSP stream into an NVR / VMS | [User Guide · Video and Imaging](./2-user-guide/1-media-and-image.md) |
| Install your own AI app, manage models | [User Guide · AI Apps and Models](./2-user-guide/2-applications-and-models.md) |
| Wire up alarm / access control / audio | [User Guide · Peripherals](./2-user-guide/3-peripherals.md) |
| Upgrade firmware / view logs / operate | [User Guide · System Management](./2-user-guide/4-settings-and-maintenance.md) |
| Integrate via REST API / Event Bus | [Integration Guide](./4-application-guide/2-3rd-party-integration/0-restful-api.md) |
| Develop your own container app | [App Development Guide](./4-application-guide/1-app-development/0-sdk-workflow.md) |

### Quick Reference

| Item | Value |
|------|-------|
| Web Console | `https://<device-ip>` |
| Default IP | `10.0.0.1` |
| Web login | `admin` / `password` |
| SSH login | `root` / `root` |
| RTSP main stream | `rtsp://<device-ip>:8554/main` |
| Power | PoE 802.3AT or DC 12V, 5–6 W |
