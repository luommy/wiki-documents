---
description: Get started with NeoEyes NE301. Covers power-on, Web UI configuration, real-time inference preview, and MQTT data reporting setup.
keywords: [NeoEyes NE301, Quick Start, Edge AI Preview, STM32N6, Web UI Config, MQTT Setup, Low Power AI]
tags: [NeoEyes NE301, Quick Start, Edge Inference, STM32N6 AI, User Guide]
---

# Quick Start

## Overview

This guide walks through everything you need to get started with NeoEyes NE301—from unpacking and powering on the device to configuring features, deploying models, and managing daily operation.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', alignItems: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/ne301-2.png" alt="ne301" style={{ flex: '0 0 auto', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/ne301-1.png" alt="ne301" style={{ flex: '0 0 auto', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## What You Need

- NeoEyes NE301 camera (main board, battery tray, enclosure)
- Four AA batteries, or another DC / solar / wired power source
- Phillips screwdriver plus the mounting brackets and fasteners you plan to use
- Optional add-ons: Cat‑1 module, alternative lenses
- A Wi‑Fi capable phone or PC to access the device Web UI

> The whole-unit SKU ships with the core firmware and a factory model preinstalled. Insert batteries and you can start debugging right away. If you are using the developer-kit SKU, confirm that the expansion boards are firmly connected before assembling the enclosure.

## Using the Device

### Power-On

Remove the rear cover with a screwdriver, install the batteries according to the tray layout, and wait for the blue LED on the front panel to light up—this indicates the system has booted. Once confirmed, reinstall the rear cover. The basic startup is now complete and you can move on to configuration.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wakeup1.jpg" alt="Power-on example" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wakeup2.jpg" alt="Battery installation" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Connect and Sign In

NeoEyes NE301 exposes a built-in Wi‑Fi AP with a Web UI for AI inference preview, model and parameter management, and feature tuning. The SSID is `NE301{last 6 MAC digits}`. Make sure a phone or PC is available to join this AP; once connected, open `http://192.168.10.10` in a browser to configure the device. The detailed steps are listed below.

1. **Confirm the device is on**  
   Tap the capture button on the right side—if the fill light flashes, the device is active. During debugging, a short press triggers image capture and uploads it via the configured MQTT/MQTTS endpoint. Configuration steps are explained later in this guide.

2. **Join the NE301 Wi‑Fi AP**  
   After the system starts, scan for SSIDs that match `NE301{last 6 MAC digits}` and connect; no password is required. When the connection succeeds, open `192.168.10.10` in a browser to access the Web UI.

> Short press the capture button for a snapshot; press and hold for 2 seconds to wake the Wi‑Fi AP (the blue LED lights up). The AP automatically sleeps after 10 minutes of inactivity—press the capture button again or change the sleep timer if needed.

3. **Log in**  
   The default username is fixed by the system, and the default password is `hicamthink`. You can change it later via **Home → System Settings → Device Password**. Enter the credentials to reach the main dashboard.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/login-en.png" alt="Login screen" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/login-hicamthink.png" alt="Default password reminder" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

After signing in you can adjust configurations and run diagnostics. The following sections describe each module in detail.

## AI Features & Debugging

### Guided Onboarding

The first time you connect through a phone or PC, the interface shows a quick guided tour. Afterwards you land on the **Feature Debugging** page where you can switch models, upload new models, and preview edge inference in real time.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/guidance.png" alt="Guided onboarding" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/AI-off.png" alt="AI disabled" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/AI.png" alt="AI enabled" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Low-Latency Inference

NE301 supports millisecond-level real-time inference on video streams, enabling instant AI responses. Through the device Wi‑Fi AP, you can preview the stream locally on the Web UI and verify edge inference synchronously. Inference is enabled by default and can be turned off as needed.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/inference-setting.png" alt="Inference settings" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  </div>

### Flexible Model Deployment & Replacement

The Web UI provides one-click model deployment and replacement to make AI application management effortless.

- Out of the box: A YOLOv8 model is preloaded at the factory so you can quickly preview on‑device AI.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-list.png" alt="Model list" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-upload.png" alt="Model upload" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-uploading.png" alt="Model flashing" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

- Rapid deployment: If you don’t want the default model, you can upload and deploy a new AI model via the Web UI—zero setup and zero code. You can also build a dataset from device snapshots, retrain a scene‑specific model, and redeploy.
  - See also: [Train and deploy YOLOv8 on STM32N6](./3-application-guide/0-model-training-and-deployment/0-model-training-and-deployment.md)


### Hot-load Inference Parameters

The system supports hot-loading inference parameters. Adjust sliders on the Web UI to change thresholds (confidence and NMS) in real time and immediately preview inference results, enabling rapid model tuning.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/inference-setting.png" alt="Inference parameters" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Image-based Model Verification

Besides real-time streams, you can validate models directly with images. Upload local pictures from your phone or PC to the Web UI and run inference using the model currently deployed on the device. This lets you quickly test performance across scenarios without on‑site capture.

<!--
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-pic1.png" alt="Model verification" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-pic2.png" alt="Model verification" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-pic3.png" alt="Model verification" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>
-->

The specific effects are shown below:

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/model-validation.gif" alt="Verification preview" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### AI Preview

The AI preview page displays the latest inference results in real time. You can start or stop inference, trigger snapshots, export annotation coordinates, and download single images or zipped batches for dataset labeling.

- **Model selection**: Choose the factory model or upload your own.
- **Threshold tuning**: Adjust confidence, NMS, and other inference parameters on the fly.
- **Push notifications**: Combine with the MQTT settings described later to forward inference results upstream.

### Streaming Preview

The streaming preview page offers a low-latency RTSP/HTTP preview capture. This is useful for monitoring the installation angle, verifying focus, or checking lighting conditions.

### Trigger Management

> Configure how images are captured: via manual triggers, periodic jobs, motion/face detection, pull-based capture, and IO events.

- **Datagram type**: Select whether each upload contains only image data or image + JSON metadata.
- **Manual trigger**: Buttons for capture, refresh, and download.
  - *Capture*: Immediately grabs an image.
  - *Refresh*: Updates the preview list.
  - *Download*: Retrieves the selected picture.
- **Auto capture**: Used for scheduled sampling where periodic upload is required.
  - Interval: Time between captures (seconds). Defaults to “Off”.
  - Sampling duration: How long the schedule runs (minutes). Set to 0 to capture indefinitely.
  - Capture count: The number of images per schedule run (maximum 20, default 10). Set to 0 for bulk capture until you stop it manually.
  - Stop capture: Halts the current schedule; otherwise it stops automatically when the duration elapses.
  - Latest timestamp: Shows when the last capture occurred.
  - Capture records: Lists the most recent images. Click the thumbnail to enlarge, download locally, and examine metadata.
- **Resident detection**: Designed for lightweight presence monitoring. The device takes a reference frame, compares subsequent frames within a time window, and runs YOLO inference when significant differences are detected. Typical use cases include intrusion alerts, space utilization, and visitor counting.
- **Face detection**: Detects faces in the frame, counts them, and runs inference to determine the face region.
- **Pull capture**: Some HTTP endpoints support on-demand capture from external systems. Configure the HTTP push target and enable this feature to trigger uploads via API calls.
- **IO trigger**: Enables capture based on state changes on the expansion IO header. Choose between high-level or low-level triggers depending on the sensor you connect.

#### PIR Configuration

Adjust PIR (Passive Infrared) sensor parameters for your environment (e.g., corridor, outdoor) to avoid false alarms.

- **Menu**: Web UI -> **Feature Debugging** -> **Wake-up Source** -> **IO Trigger - PIR**

- **Parameters**:
  - **Sensitivity**: Range 0-255. Recommended: 20-50 for indoor; lower for outdoor to reduce false positives from wind or small animals.
  - **Blind Time**: Non-responsive window after a trigger event to prevent repetitive firing.
  - **Window Time**: Time window to valid trigger determination.
  - **Pulse Count**: Number of pulses required to register a valid trigger. Set to 2 or 3 to filter noise effectively.

### Remote Control

> Used to configure the remote control function of the NE301 device. Users can send remote control commands according to actual scenario requirements to achieve communication between the device and the server. Please note that keeping this function enabled for a long time will increase the network overhead of the device.

- **Enable Remote Control**: When enabled, it supports setting the device to receive control commands via network communication for remote control.
- **Configuration Method**: Implemented by configuring the data receiving topic in `Application Management - MQTT/MQTTS`. When the device receives a message on this topic, it executes the corresponding control command based on the message content.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/remote-control.png" alt="Remote Control" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

The currently supported remote control commands for the latest firmware version are as follows:

Capture Command:

```json
{
  "cmd": "capture",
  "request_id": "req-001",
  "params": {
    "enable_ai": true,
    "chunk_size": 0,
    "store_to_sd": false
  }
}
```

Sleep Command:

```json
{
  "cmd": "sleep",
  "request_id": "req-002",
  "params": {
    "duration_sec": 60
  }
}
```

### RTMP Streaming

RTMP streaming can be fully configured via the Web UI, while retaining CLI commands for developer debugging.

- **Menu**: Web UI -> **Feature Debugging** -> **Media Stream**

- **Operations**:
  1. **Enable RTMP**: Select to enable RTMP mode in the settings.
  2. **Configuration**:
      - **URL**: Enter RTMP Server URL (max 256 chars).
      - **Stream Key**: Enter streaming key (max 128 chars, supports show/hide).
  3. **Connect**: Click "Connect". The status LED turns green upon success.

- **CLI Command (Advanced)**:
  ```bash
  # Check help for details
  rtmp_url <url> [stream_key] # Configure stream address
  ```

### Scheduled Capture


Use scheduled capture when you need periodic uploads without manual intervention or external IO triggers.

- Enable scheduled capture: Turn on to configure periodic image capture.
- Time schedule mode: Define one or more times during the day or week to take a snapshot. Supported range is 00:00–23:59, and up to 8 daily/weekly time points.
- Interval mode: Set a capture interval by minutes, hours, or days. At most one interval rule is supported at a time.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/scheduled-capture.png" alt="Interval capture" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/scheduled-capture2.png" alt="Time schedule" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## Application Management

> Configure MQTT or MQTTS parameters so NE301 can push data to your backend.

Select the protocol (MQTT / MQTTS), fill in the fields below, then click **Save & Connect**.

- **Host**: MQTT broker hostname or IP.
- **MQTT Port**: Default 1883 (or 8883 when SSL is enabled).
- **Topic**: The topic the device publishes to.
- **Client ID**: Unique identifier for this device.
- **QoS**: Choose QoS 0, 1, or 2.
- **Username** / **Password**: Credentials for the broker.
- **SSL**: Turn on to use MQTTS. Additional certificate fields appear:
  - **CA Certificate**: Upload the broker’s CA certificate.
  - **Client Certificate**: Upload the device client certificate.
  - **Client Key**: Upload the device private key.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/MQTT.png" alt="MQTT" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/MQTTS.png" alt="MQTTS" style={{ flex: '1 1 280px', maxWidth: '360px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

> For more information about MQTT configuration and application, please refer to [MQTT Data Interaction](./3-application-guide/2-mqtt-data-interaction/2-mqtt-data-interaction.md).

### Hardware Management

Hardware Management consists of two modules — **Image Management** and **Lighting Management** — for adjusting camera parameters and fill light settings.

#### Image Management

Configure camera orientation and capture parameters. The top of the page shows the camera module connection status.

- **Camera configuration**
  - **Flip Horizontal**: Mirror the image horizontally; useful when the physical mounting requires a horizontal correction.
  - **Flip Vertical**: Mirror the image vertically; useful when the physical mounting requires a vertical correction.

- **Capture configuration**
  - **Skip frames**: Number of frames to skip before capturing, default 30. Helps obtain a stable image.
  - **Resolution**: Capture resolution. Supported values: 1280×720, 1920×1080, 2688×1520.
  - **JPEG quality**: JPEG image quality, default 80. Higher quality produces larger files; images exceeding 1 MB are automatically uploaded in chunks, which increases transfer time.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/image-management.png" alt="Image Management" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

#### Lighting Management

**Work Supplement Light** — choose a fill light mode based on your deployment:

- **Always On**: The fill light stays on continuously.
- **Custom**: Define a time range (for example 20:00–06:00); the fill light stays on during that range.
- **Always Off**: The fill light is always off.

> Tip: The fill light is most effective at short range. Choose **Always Off** in power-sensitive deployments.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/lighting-management.png" alt="Lighting Management" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### System Settings: Connectivity, Device, Import/Export

> The menus adapt to the communication modules present. In addition to Wi‑Fi and Cat‑1, you’ll find Bluetooth (BLE), device security, and import/export utilities.

#### Connectivity Management

NeoEyes NE301 supports Wi‑Fi, Cat‑1, and PoE. Configuration options vary by connectivity type.

- **Wi‑Fi**: The standard SKU scans nearby networks. Select your SSID, enter credentials, and save. NE301 remembers the most recent network.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/communications.png" alt="Network configuration" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wifipwd.png" alt="Wi-Fi password" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/wificonnected.png" alt="Wi-Fi connected" style={{ flex: '1 1 220px', maxWidth: '300px', width: '100%', height: 'auto', borderRadius: '6px', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

- **Cat‑1**: NeoEyes NE301 Cat‑1 units support licensed networks outside North America. Install a SIM card and configure the cellular settings:
  1. Remove the front cover with a screwdriver.
  2. Insert the SIM card into the slot on the front of the board.
  3. Reassemble the cover.
  4. Browse to `192.168.10.10`.
  5. In **Cellular**, fill in APN, username, password, PIN, authentication type, and any required AT commands.
  6. Click **Send** to test. If the connection succeeds, *Cellular Status* shows `connect`. Click **Save** to persist.
  7. **Details** displays signal strength and other network information for diagnostics.

- **PoE Network Settings**: Supports power and communication via Ethernet (PoE).
  - **Menu**: Web UI -> **System Settings** -> **Connectivity** -> **PoE Network**
  - **Connection Status**: Displays "Cable Connected" and current power status (e.g., `POE_ONLINE`) when plugged in.
  - **IP Mode**:
    - **DHCP (Recommended)**: Default. Automatically obtains IP from router.
    - **Static**: For fixed IP scenarios. Requires manual entry of IP, Subnet Mask, Gateway, and Main/Backup DNS.
  - **Monitoring**: Displays specific error codes (e.g., `POE_STATUS_DHCP_FAILED`, `POE_STATUS_IP_CONFLICT`) to assist troubleshooting.

<!-- BLE management section intentionally omitted for now -->

#### Device Password

- **Device AP**
  - **Wi‑Fi Name**: Defaults to `NE301{last 6 MAC digits}` (MAC is printed on the enclosure label).
  - **Wi‑Fi Password**: Default `hicamthink`. Change it after the first login. The AP restarts after modification—reconnect from your phone or PC.
  - **Sleep time**: Idle timeout for the AP. Default 10 minutes. Interaction with the Web UI resets the timer. To conserve power, avoid extremely long durations.

- **Login password**
  - Username: System-defined and cannot be changed.
  - Enter the current password plus the new password twice, and click **Save** to apply.
  - We recommend 8–20 characters with letters, numbers, and symbols. Avoid weak passwords derived from device info.

- **Forgot password / Reset**
  - If the password is lost, run the hardware reset sequence to restore defaults (including the password `hicamthink`).
  - Resetting erases all custom configuration (models, network settings, parameters). Export a backup beforehand.

- **Other tips**
  - Toggle show/hide to avoid typos while entering passwords.
  - Always click **Save** after making changes.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/device-pwd.png" alt="Password management" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

### Import & Export

Firmware, models, and configuration files can all be imported or exported—useful for upgrades, migration, and batch deployment.

- **Firmware (local OTA)**
  - Firmware is packaged into three files: APP, Web, and FSBL. You may update them individually (APP and Web can be upgraded via the device web page; FSBL upgrade requires console access).
    - APP file example: [ne301_App_signed_v2.0.1.30_pkg.bin](https://github.com/camthink-ai/ne301/releases/download/v20260213_main/ne301_App_signed_v2.0.1.30_pkg.bin)
    - Web file example: [ne301_Web_v1.3.4.4_pkg.bin](https://github.com/camthink-ai/ne301/releases/download/v20260213_main/ne301_Web_v1.3.4.4_pkg.bin)
    - FSBL file example: [ne301_FSBL_signed_v1.0.0.2_pkg.bin](https://github.com/camthink-ai/ne301/releases/download/v20260213_main/ne301_FSBL_signed_v1.0.0.2_pkg.bin)
  - Upload or drag the files into the target area. The system validates and flashes them automatically, then reboots. Do not interrupt power.
  - Optionally enable “Keep current configuration” to preserve existing settings.
  - If the upgrade fails, the previous firmware remains to ensure the device is still usable.

- **Model import (Optional)**
  - Upload a model package that contains the weights and parameter definitions.
    - Model package example: [ne301_Model_v2.0.0.0_pkg.bin](https://github.com/camthink-ai/ne301/releases/download/v20260213_main/ne301_Model_v2.0.0.0_pkg.bin)
  - After deployment, activate it under “Feature Debugging”.
  - Combine with “Hot-load inference parameters” to fine-tune confidence/NMS thresholds per scenario.
  - You can revert to the factory model via a device reset.

- **Configuration import (Optional)**
  - Upload a `.json` configuration file. The system shows the modules to be overwritten before applying.
  - Some changes take effect immediately; low-level network changes may require a reboot.

- **Configuration export**
  - Exports the current setup as a `.json` file for backup or batch provisioning.
  - Always export before firmware upgrades or factory resets to avoid losing parameters.

- **Precautions**
  - Keep the device powered during import/export—do not close the page or cut power.
  - Configurations may not be compatible across firmware versions. If an import fails, refer to the release notes or upgrade to a compatible build first.

> Always keep the device powered and the browser window open until the import/export process finishes.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}> 
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/import-firmware.png" alt="Firmware Import" style={{ flex: '1 1 220px', maxWidth: '300px' }} /> 
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/import-firmware2.png" alt="Firmware Upload" style={{ flex: '1 1 220px', maxWidth: '300px' }} /> 
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/import-firmware3.png" alt="Firmware Writing" style={{ flex: '1 1 220px', maxWidth: '300px' }} /> 
</div> 

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '8px 0 16px' }}> 
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/export-firmware.png" alt="Export" style={{ flex: '1 1 280px', maxWidth: '360px' }} /> 
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/export-firmware2.png" alt="Export Loading" style={{ flex: '1 1 280px', maxWidth: '360px' }} />
 </div>


## Device Information

This page summarizes the hardware and software status:

- **Device name**: Defaults to `NE301{last 6 MAC digits}`. The name is embedded in JSON payloads (field `devName`).
- **MAC address**, **SN**, **Hardware version**, **Firmware version**
- **Camera module**: Model information for the image sensor.
- **Expansion modules**: Displayed when optional boards are connected.
- **Storage card**: Capacity and model of the TF card.
- **Power**: Battery or external. Batteries show three levels (green/amber/red). When powered externally (solar, USB, PoE), the interface shows “Always powered”.
- **Communication**: Wi‑Fi / Cat‑1 / PoE mode currently in use.

<div style={{ textAlign: 'center', margin: '12px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/quick-start/device-information1.png" alt="Device dashboard" style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }} />
</div>

## Device Reset

Quickly double-press the capture button and hold for ~10 seconds to restore factory settings.
This will erase models, networks, and parameters — please export configuration beforehand.

> Tip: Always back up configurations before firmware upgrades or batch deployments to enable rapid recovery.