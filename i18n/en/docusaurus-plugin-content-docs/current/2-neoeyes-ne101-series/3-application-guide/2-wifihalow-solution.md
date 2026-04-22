---
description: A complete deployment guide for the NE101 WiFi HaLow version to achieve long-range image capture and upload via the Morse Micro HaLowLink gateway, covering gateway configuration, device networking, MQTT data integration, and platform verification.
keywords: [NE101, WiFi HaLow, Morse Micro, HaLowLink, MQTT, image capture, long-range transmission, Sub-1GHz, IEEE 802.11ah]
tags: [NE101 Application, WiFi HaLow, Morse Micro, Image Upload]
---

# WiFi HaLow Solution

> **Verification Status**: This solution has been verified through actual deployment ✅
>
> **Applicable Devices**: NE101 WiFi HaLow version + Morse Micro HaLowLink gateway

---

## 1. Solution Overview

### WiFi HaLow Protocol Introduction

WiFi HaLow (IEEE 802.11ah) is a low-power, long-range wireless communication protocol operating in the Sub-1 GHz band (868 MHz / 915 MHz). Compared to traditional 2.4 GHz / 5 GHz WiFi, WiFi HaLow offers significant advantages in transmission range and wall-penetration capability, making it ideal for outdoor monitoring, agricultural IoT, industrial automation, and other long-range data collection scenarios.

| Feature | WiFi HaLow | Traditional WiFi (2.4 GHz) |
|---------|-----------|---------------------------|
| Frequency Band | Sub-1 GHz (868/915 MHz) | 2.4 GHz / 5 GHz |
| Transmission Range | Up to 1 km+ | Typically 50-100 m |
| Wall Penetration | Strong | Average |
| Power Consumption | Low | Relatively High |
| Use Cases | Long-range, low-power IoT | Short-range, high-speed |

### Morse Micro × CamThink

[Morse Micro](https://www.morsemicro.com/) is a global leader in WiFi HaLow chip technology, headquartered in Sydney, Australia, specializing in the development and promotion of IEEE 802.11ah protocol chips. Its [HaLowLink1 / HaLowLink2](https://www.morsemicro.com/halowlink) series gateway products provide a plug-and-play network bridging solution for WiFi HaLow devices, seamlessly integrating HaLow networks into standard Ethernet / WiFi networks. CamThink and Morse Micro maintain close collaboration in the WiFi HaLow IoT space. The [NE101](https://www.camthink.ai/product/neoeyes-ai-camera-ne101/) smart camera, equipped with a WiFi HaLow module, combined with the Morse Micro HaLowLink gateway, delivers a complete end-to-end solution for long-range, low-power image capture and upload.

### Solution Architecture

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/halowlink-topology.png)

**Data Flow**:

```
NE101 (Image Capture) → WiFi HaLow → HaLowLink Gateway → Ethernet/WiFi → MQTT Broker → Backend Platform
```

| Stage | Description |
|-------|-------------|
| Image Capture | NE101 captures images on schedule or trigger, generating JPEG files |
| HaLow Transmission | Sends data to HaLowLink gateway via Sub-1 GHz wireless link |
| Network Bridging | HaLowLink bridges HaLow data to Ethernet/WiFi network |
| MQTT Upload | NE101 publishes Base64-encoded image data to MQTT Broker |
| Platform Reception | Backend platform subscribes to MQTT Topic, receives and displays images |

---

## 2. Bill of Materials (BOM)

### Required Devices

| Item | Model/Specification | Qty | Purpose | Notes |
|------|---------------------|-----|---------|-------|
| **Smart Camera** | [NE101 WiFi HaLow Version](https://www.camthink.ai/product/neoeyes-ai-camera-ne101/) | 1 | Image capture and transmission | Requires FGH100M module |
| **HaLow Gateway** | [Morse Micro HaLowLink1](https://www.morsemicro.com/halowlink) or [HaLowLink2](https://www.morsemicro.com/halowlink) | 1 | HaLow network bridging | Power and connect to Ethernet |
| **MQTT Server** | Backend server (e.g., [AI Tool Stack](https://github.com/camthink-ai/AIToolStack), [NeoMind](https://github.com/camthink-ai/NeoMind), [EMQX](https://www.emqx.io/), [Mosquitto](https://mosquitto.org/)) | 1 | Receive image data | Must be network-accessible from gateway |

---

## 3. HaLowLink Gateway Configuration

### 3.1 Gateway Network Setup

Connect the HaLowLink gateway to your LAN via Ethernet cable. After powering on, access the gateway management page in a browser and verify the network connection status. For login details, refer to the [HaLowLink User Guide](https://www.mouser.com/pdfDocs/HaLowLink-1-User-Guide-2613-1.pdf).

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/gateway-login.png)

### 3.2 Check WiFi HaLow Frequency Configuration

Navigate to **Network → Wireless** in the gateway management page and check the WiFi HaLow frequency settings. Select the appropriate band based on your region:

- **Europe**: 868 MHz
- **North America**: 915 MHz

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/halowlink-check-wireless.png)

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/halowlink-check-frequency.png)

> Ensure the gateway and NE101 frequency settings match, otherwise the devices cannot associate.

---

## 4. NE101 WiFi HaLow Connection

### 4.1 Login to NE101

After powering on NE101, connect to its WiFi hotspot, then enter `192.168.1.1` in a browser to access the NE101 configuration interface.

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/ne101-login.png)

### 4.2 Configure WiFi HaLow Network

Navigate to the **Gateway Connection** page, select a **Region** matching the HaLowLink gateway (e.g., US or AU), click **Refresh** to scan available networks, select the HaLowLink gateway AP, and enter the password to connect.

<div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/refresh-gateway.png" alt="Scan Networks" style={{ height: '200px', objectFit: 'contain' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/input-password.png" alt="Enter Password" style={{ height: '200px', objectFit: 'contain' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/gateway-connected.png" alt="Connected" style={{ height: '200px', objectFit: 'contain' }} />
</div>

### 4.3 Verify Connection Status

After a successful connection, you can see NE101 listed as associated on the gateway management page:

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/ne101-connected-halowlink.png)

Click to view connection details and confirm signal strength, frequency, and other parameters are normal:

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/ne101-connected-halowlink-details.png)

---

## 5. MQTT Data Integration

### 5.1 Set Up MQTT Broker

Using [AI Tool Stack](https://github.com/camthink-ai/AIToolStack) as an example, create an MQTT Broker service on the platform and obtain the Broker IP address, port, and authentication credentials. You can also use [NeoMind](https://github.com/camthink-ai/NeoMind), [EMQX](https://www.emqx.io/), [Mosquitto](https://mosquitto.org/), or other platforms to set up your own MQTT Broker.

### 5.2 Configure NE101 MQTT Connection

Navigate to the **Data Report** page in the NE101 configuration interface and fill in the MQTT Broker connection parameters:

| Parameter | Value | Description |
|-----------|-------|-------------|
| Host | MQTT server IP address | Must be network-accessible from gateway |
| MQTT Port | 1883 (or server port) | MQTT TCP port |
| Topic | Custom (e.g., `ne101/image`) | Image data publish topic |
| Client ID | Auto-generated or custom | Device unique identifier |
| QoS | QoS 0 | QoS 0 recommended for image transmission |
| Username / Password | Per server configuration | If Broker requires authentication |

After saving, NE101 will connect to the MQTT Broker via WiFi HaLow → HaLowLink gateway:

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/mqtt-connected.png)

### 5.3 Data Format

The MQTT message payload uploaded by NE101 is in JSON format, with the image embedded as Base64 encoding:

```json
{
  "ts": 1740640441620,
  "values": {
    "devName": "NE101 Sensing Camera",
    "devMac": "D8:3B:DA:4D:10:2C",
    "battery": 84,
    "snapType": "Button",
    "localtime": "2025-02-27 15:14:01",
    "imageSize": 74371,
    "image": "data:image/jpeg;base64,..."
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `ts` | number | Timestamp (milliseconds) |
| `devName` | string | Device name |
| `devMac` | string | Device MAC address |
| `battery` | number | Battery level (%) |
| `snapType` | string | Capture type: `Button`, `Scheduled`, or `PIR` (sensor trigger) |
| `localtime` | string | Local time |
| `imageSize` | number | Image size (bytes) |
| `image` | string | Base64-encoded JPEG image with prefix `data:image/jpeg;base64,` |

### 5.4 Verify Image Reception

Use an MQTT client (e.g., [MQTTX](https://mqttx.app/)) to subscribe to the corresponding Topic, or view received image data on the backend platform:

![](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/application-guide/wifihalow-solution/platform.png)

Base64 images can be displayed directly in web pages:

```html
<img src="data:image/jpeg;base64,..." />
```

---

## 6. Appendix

### Related Documents & Resources

| Name | Description | Name | Description |
|------|-------------|------|-------------|
| [NE101 Product Overview](https://www.camthink.ai/product/neoeyes-ai-camera-ne101/) | NE101 specifications and features | [NE101 Quick Start](../1-quick-start.md) | Device assembly and first-use guide |
| [Morse Micro Official](https://www.morsemicro.com/) | WiFi HaLow chip manufacturer | [HaLowLink Gateway](https://www.morsemicro.com/halowlink) | HaLowLink gateway product page |
| [AI Tool Stack](https://github.com/camthink-ai/AIToolStack) | MQTT Broker platform service | [NeoMind](https://github.com/camthink-ai/NeoMind) | AI visual analytics platform |
| [EMQX](https://www.emqx.io/) | Open-source MQTT Broker | [Mosquitto](https://mosquitto.org/) | Lightweight MQTT Broker |
| [MQTTX](https://mqttx.app/) | MQTT client debugging tool | | |

---

*Last updated: 2026-04-22*
