---
description: NeoEyes NE503 is an edge AI computing platform based on the Hailo-15H SoC, featuring a 20 TOPS NPU, 4K video encoding, containerized application management, a web console, and multi-model concurrent inference for smart security, industrial inspection, and AIoT applications.
keywords: [NeoEyes NE503, Hailo-15H, edge AI platform, 20 TOPS, AI camera, smart IPC, containerized applications, edge computing, AI-ISP, RTSP]
tags: [NE503, AI camera, edge computing, smart IPC, AIoT]
---

import ApplicationScenarios from '@site/src/components/ApplicationScenarios';
import SupportGrid from '@site/src/components/SupportGrid';

# Product Information

## Overview

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ne503-architecture.png" alt="NeoEyes NE503" width="100%" />
</div>

NeoEyes NE503 is an edge AI smart camera based on the **Hailo-15H SoC**, featuring a 20 TOPS NPU and a Sony IMX678 4K imaging system. NE503 completes the full closed loop from image capture and AI inference to event output and business linkage within a single device, significantly reducing the deployment complexity of edge intelligence solutions. It combines the professional imaging capabilities of an AI Camera with the open edge computing platform attributes—supporting containerized application deployment, multi-model concurrent inference, and RTSP / Event Bus protocol integration for visual application and edge AI secondary development scenarios.

### Core Capabilities

- **Edge AI Closed-Loop Decision Making**: The 20 TOPS NPU local computing power supports multi-model concurrent inference, completing image analysis, event judgment, and structured result output directly on the device. It achieves front-end intelligent closed-loop without cloud backhaul, suitable for scenarios with high requirements for real-time performance and data privacy.

- **Professional 4K Imaging**: The Sony IMX678 sensor paired with Gen2 AI-ISP and a motorized zoom lens supports 4K encoding and &lt;0.01 LUX full-color night vision, balancing HDR, low-light performance, and multi-model concurrent inference for both wide-angle monitoring and long-range recognition.

- **Containerized Application Platform**: Based on the containerd container runtime, third-party AI applications are deployed via OCI images with secure sandbox isolation ensuring no interference between applications. Models and business applications can be independently deployed and upgraded per platform specifications. Algorithm companies, solution providers, and OEM manufacturers can quickly customize industry solutions on a unified platform, breaking hardware vendor lock-in.

- **Deliverable Product Capability**: NE503 integrates imaging, inference, alarm linkage, protocol output, and operations management into one device, with complete capabilities from development verification to project delivery. IP66 protection with PoE single-cable power supply, combined with a web management console, enables direct commercial deployment.

- **Full-Stack Open Toolchain**: Provides Python / C++ / Go multi-language SDKs, the aipc-cli command-line tool, and RESTful APIs to meet different development integration approaches. The modular HAL architecture decouples platform services from underlying hardware, supporting smooth migration across SoC platforms and reducing long-term maintenance costs.

## Product Specifications

NE503 core specifications are as follows:

<table>
  <colgroup>
    <col width="14%" />
    <col width="18%" />
    <col width="68%" />
  </colgroup>
  <thead>
    <tr>
      <th>Category</th>
      <th>Item</th>
      <th>Specification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowSpan="6">Core Platform</td>
      <td>SoC</td>
      <td>Hailo-15H</td>
    </tr>
    <tr>
      <td>CPU</td>
      <td>Cortex-A53 × 4 @ 1.3 GHz</td>
    </tr>
    <tr>
      <td>NPU</td>
      <td>Hailo NPU, 20 TOPS @ INT8, supports 4-bit quantization extension</td>
    </tr>
    <tr>
      <td>Memory / Storage</td>
      <td>8 GB LPDDR4 / 64 GB eMMC, supports TF Card and M.2 SSD expansion</td>
    </tr>
    <tr>
      <td>Video Encoding</td>
      <td>H.264 / H.265 hardware encoding, 4K@30fps</td>
    </tr>
    <tr>
      <td>System Power</td>
      <td>&lt; 8W (typical load)</td>
    </tr>
    <tr>
      <td rowSpan="3">Imaging System</td>
      <td>Image Sensor</td>
      <td>Sony IMX678, 1/1.8" CMOS, 4K UHD</td>
    </tr>
    <tr>
      <td>Lens Module</td>
      <td>Foctek AF0832D09, motorized zoom 10.2–29.5mm, F1.6–F1.7</td>
    </tr>
    <tr>
      <td>ISP</td>
      <td>Gen2 AI-ISP, &lt;0.01 LUX full-color night vision</td>
    </tr>
    <tr>
      <td rowSpan="3">Network &amp; Protocols</td>
      <td>Ethernet</td>
      <td>100M LAN, supports PoE 802.3AT</td>
    </tr>
    <tr>
      <td>Video Protocol</td>
      <td>RTSP / ONVIF (planned)</td>
    </tr>
    <tr>
      <td>Data Protocol</td>
      <td>MQTT / Event Bus / RTMP (planned)</td>
    </tr>
    <tr>
      <td rowSpan="3">Deployment Environment</td>
      <td>Power Supply</td>
      <td>DC 12V or PoE 802.3AT</td>
    </tr>
    <tr>
      <td>Protection Rating</td>
      <td>IP66</td>
    </tr>
    <tr>
      <td>Operating Temperature</td>
      <td>-30°C to +60°C</td>
    </tr>
    <tr>
      <td rowSpan="2">External Interfaces</td>
      <td>Alarm IO</td>
      <td>Alarm IN × 2 + Alarm OUT × 2 (relay + level)</td>
    </tr>
    <tr>
      <td>Expansion Interfaces</td>
      <td>RS-485 / Wiegand / Audio I/O / Radar / Fill Light</td>
    </tr>
    <tr>
      <td rowSpan="2">Software Platform</td>
      <td>Operating System</td>
      <td>Embedded Linux (Yocto build), containerd container runtime</td>
    </tr>
    <tr>
      <td>Management</td>
      <td>Web console + SSH + REST API + aipc-cli</td>
    </tr>
  </tbody>
</table>

## Performance &amp; Edge AI

### AI Inference Capability

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ai-pipeline.png" alt="AI Inference Pipeline" width="80%" />
</div>

NE503 is powered by the Hailo-15H SoC with an integrated Hailo NPU delivering 20 TOPS (INT8) compute, complemented by a 350 GOPS DSP for pre-processing and post-processing tasks. The Zero-copy Pipeline achieves zero-copy data transfer via DMA/SHM direct transmission, avoiding memory copy overhead. AI Runtime manages model loading, inference scheduling, and multi-model parallel execution. Inference results are output as structured events via Event Bus, supporting both local hardware linkage and cloud integration.

| Metric | Parameter |
|--------|-----------|
| Inference Latency Target | &lt; 50ms |
| Concurrent Inference | Supports multi-model simultaneous execution |
| Data Transfer | Zero-copy Pipeline (DMA/SHM direct) |
| Supported Tasks | Detection / OCR / Face Detection &amp; Recognition / ReID / Pose Estimation / Behavior Analysis / Attribute Recognition, etc. |
| Pre-installed Models | Person Detection (YOLOv8n), Face Landmarks, CLIP Image Encoder |
| Event Output | Structured inference results + event messages + device status data |

### Video Encoding

The hardware encoder supports dual-format H.264/H.265 encoding at 4K@30fps, paired with Gen2 AI-ISP for &lt;0.01 LUX ultra-low-light full-color night vision. The 12-bit AI denoising adapts to different scenes without retraining models.

| Metric | Parameter |
|--------|-----------|
| Encoding Format | H.264 / H.265 hardware encoding, supports CBR / VBR rate control |
| RTSP Streams | Main stream / Sub stream / Third stream |
| AI Denoising | 12-bit AI denoising, adapts to different scenes without model retraining |

### Low-Light Imaging

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/ai-isp-comparison.png" alt="AI-ISP Low-Light Comparison" width="80%" />
</div>

AI-ISP delivers clear color images even in extremely low-light environments, with 12-bit AI denoising that adapts to varying illumination conditions. Combined with automatic IR-CUT filter switching and fill light control, it achieves 24/7 all-weather imaging.

## Imaging System

<div align="center" style={{ marginBottom: "1.5rem" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/imaging-module.png" alt="Imaging Module" width="60%" />
</div>

The NE503 imaging system consists of a Sony IMX678 image sensor and a Foctek AF0832D09 motorized zoom lens. The 1/1.8" sensor matches the 1/1.8" lens target surface, balancing edge image quality with optical coverage for smart security, campus management, and long-range recognition scenarios.

<div align="center" style={{ marginBottom: "1.5rem" }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/fov-comparison.png" alt="Wide/Telephoto FOV Comparison" width="80%" />
</div>

### Sensor

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Specification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Sensor Model</td>
      <td>Sony IMX678-AAQR1-C</td>
    </tr>
    <tr>
      <td>Target Surface</td>
      <td>1/1.8 inch, diagonal 8.86mm</td>
    </tr>
    <tr>
      <td>Effective Pixels</td>
      <td>3856(H) × 2180(V), recommended recording pixels 3840 × 2160 (4K UHD)</td>
    </tr>
    <tr>
      <td>Pixel Size</td>
      <td>2.0μm × 2.0μm</td>
    </tr>
    <tr>
      <td>Output Interface</td>
      <td>MIPI CSI-2, RAW10 / RAW12</td>
    </tr>
    <tr>
      <td>HDR</td>
      <td>Digital Overlap HDR / Dual Gain HDR</td>
    </tr>
  </tbody>
</table>

### Lens

<table>
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Specification</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Lens Model</td>
      <td>Foctek AF0832D09.ICR1(4K)</td>
    </tr>
    <tr>
      <td>Focal Length</td>
      <td>10.2mm (wide) – 29.5mm (telephoto)</td>
    </tr>
    <tr>
      <td>Relative Aperture</td>
      <td>F1.6 (W) – F1.7 (T)</td>
    </tr>
    <tr>
      <td>Field of View</td>
      <td>Horizontal 44.5° (W) / 14.5° (T); Diagonal 52° (W) / 16.6° (T)</td>
    </tr>
    <tr>
      <td>Electromechanical</td>
      <td>Zoom / Focus stepper motors, DC-Iris auto aperture, IR-Cut electromagnetic switching</td>
    </tr>
  </tbody>
</table>

- F1.6 large aperture combined with HDR and low-light capability improves imaging stability in dark and backlit scenes.
- Motorized zoom supports dual-mode deployment: "panoramic observation + remote target lock."
- Lens TV distortion: approximately -9.1% at wide end, 1.8% at telephoto end.

### Lens Drive &amp; Image Stabilization

NE503 uses the AN41908A driver IC, supporting MFZ (Manual Focus Zoom) / AF (Auto Focus) compatible lenses with an optical zoom range of 1x – 2.88x. Control modes support SoC SPI (default) or MCU SPI dual-version options. Independent MCU control ensures reliable lens homing and limit protection.

The onboard gyroscope LSM6DSR (I2C2) supports EIS electronic image stabilization. Combined with motorized zoom and auto focus, it maintains image stability even at the telephoto end.

## Hardware Architecture

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/hardware-architecture.png" alt="Hardware Architecture Overview" width="80%" />
</div>

NE503 features a dual-board structure with a **Processor Board** and an **AI-PC Interface Board**, interconnected via board-to-board connectors. The Processor Board carries the SoC, NPU, memory, and imaging subsystem, handling all computing and AI inference tasks. The AI-PC Interface Board integrates an independent MCU, external IO, and power management circuitry. Even if the Processor Board fails, underlying functions such as lens homing, fill light control, and IO protection continue to operate normally.

### Processor Board

The Processor Board integrates the SoC, NPU, memory, storage, video encoding, and camera interface, handling all computing and AI inference tasks:

| Item | Specification |
|------|---------------|
| SoC | Hailo-15H, Cortex-A53 × 4 @ 1.3 GHz |
| NPU | Hailo NPU, 20 TOPS @ INT8, supports 4-bit quantization extension |
| DSP | 256 MACs @ 700 MHz, 350 GOPS |
| Memory | 8 GB LPDDR4 |
| Storage | 64 GB eMMC |
| Video Encoding | H.264 / H.265 hardware encoding, 4K@30fps |
| SPI Flash | 8 MB (QSPI 4-bit) |
| TF Card | SDIO0, supports High Speed / UHS-I (J11 TF card slot + J12 FPC connector) |
| SSD Expansion | M.2 KEY M (PCIe 3.0, 2 Lanes) |
| Camera Interface | J3 FPC connector, MIPI CSI-2 (4 Lanes), I2C0 + GPIO |
| Onboard Devices | Gyroscope (LSM6DSR, I2C2) |
| Debug | SoC Debug UART1 (1.8V) |

### AI-PC Interface Board

The interface board manages all peripherals and communication interfaces through an independent MCU (Cortex-M4 × 2 @ 200 MHz), communicating with the Processor Board via UART0, and integrates the system power input and distribution circuitry.

#### External Interfaces

| Item | Specification |
|------|---------------|
| Alarm IN × 2 | J1/J2, MCU PB13/PB14, High/Open = 0, Low/Short = 1 |
| Alarm OUT × 2 | J2, Relay output (MCU PB15) + Level output (MCU PA8) |
| RS-485 | J2 (ITS version), MCU UART3 (PC4/PC5), Enable PB1 |
| Wiegand | J1 (ITS version), Data0/Data1, MCU PC6/PC7 |
| Audio | Line-In / Line-Out, J1, NAU88C10 codec |
| Ethernet | 100M LAN, supports PoE 802.3AT power supply |
| Fill Light | Standard: IR dual-channel PWM (J5); Enhanced: White + IR PWM (J6) |
| IR-CUT | J7, H-EN / L-OFF, MCU PB8, supports auto / day / night three modes |
| Light Sensor | J8, Photoresistor ADC sampling, MCU PA1 |
| Radar Interface | J4 (ITS radar version), 5V/12V selectable power + UART direct to Processor Board (SoC GPIO4/GPIO6) |

#### MCU Management

| Item | Specification |
|------|---------------|
| MCU | Cortex-M4 × 2 @ 200 MHz, communicates with Processor Board via UART0 |
| Management Scope | Motorized lens, fill light, IR-CUT, heater, fan, Alarm IO, Wiegand, RS-485, light sensor |
| EEPROM | AT24C02D (I2C1), stores configuration data |
| Temperature Sensors | TMP1075DSGR (I2C1, Processor Board) + LMT87DCK (Interface Board, MCU PB2 ADC) |
| Thermal Control | 12V fan driver (MCU PB9, reserved) + 12V heater driver (MCU PA15, reserved) |
| RTC | MCU VBAT with external supercapacitor, MCU maintains RTC and syncs to Processor Board |
| Status LEDs | System status LED (blue, GPIO24) + Network status LED (green, PHY) + SYS-LED (MCU PD9) |
| Debug | MCU ST-LINK (J13) / UART (J14) |

#### Power Supply

| Item | Specification |
|------|---------------|
| Power Supply | DC 12V adapter or PoE 802.3AT (single-cable) |
| System Power | &lt; 8W (typical load) |

## Software Architecture

<div align="center">
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/software-stack.png" alt="Software Stack Architecture" width="80%" />
</div>

NeoEyes NE503 adopts a four-layer architecture with clear separation from underlying hardware to the web management interface:

<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Components</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Web Management Console</td>
      <td>React 19 + TypeScript + Vite</td>
      <td>Dashboard, media settings, application management, system management</td>
    </tr>
    <tr>
      <td>Platform Services (Go)</td>
      <td>platform-api · app-manager · device-control · ai-runtime · event-bus</td>
      <td>REST API gateway, container lifecycle, hardware control, AI inference, event bus</td>
    </tr>
    <tr>
      <td>HAL &amp; C++ Services</td>
      <td>camera-daemon · libaipc_hal.so</td>
      <td>Video capture and encoding, hardware abstraction layer</td>
    </tr>
    <tr>
      <td>Hardware Layer</td>
      <td>Hailo-15H SoC · Hailo NPU · MCU</td>
      <td>AI acceleration, video processing, peripheral control</td>
    </tr>
  </tbody>
</table>

## Applications

With 20 TOPS local computing power, containerized microservice architecture, and rich peripheral interfaces, NeoEyes NE503 transforms traditional IPCs into all-in-one edge computing devices for high-end smart security and AIoT scenarios that demand high image quality, computing power, and customization.

### Smart Security

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503 supports 24/7 all-weather complex security tasks. AI-ISP delivers clear color images in extremely low-light conditions, while multi-model concurrent inference enables person detection, license plate recognition, and perimeter intrusion detection. The event bus links hardware alarms (fill light, focus, Alarm output) and supports GenAI natural language retrieval of non-predefined targets.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Application Examples",
      items: [
        {
          title: "Smart Perimeter Protection",
          description: "Multi-model concurrent execution of person detection and CLIP visual encoder, supporting natural language target retrieval (e.g., 'person wearing a red jacket'), with automatic fill light, focus, and alarm linkage upon match.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-perimeter.png",
          imageAlt: "Smart Perimeter Protection"
        },
        {
          title: "License Plate Recognition",
          description: "Containerized deployment of license plate recognition models for real-time video stream analysis. Recognition results are pushed to business systems via the event bus, suitable for parking lots, campus entrances, and similar scenarios.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-lpr.png",
          imageAlt: "License Plate Recognition"
        },
        {
          title: "Privacy-Compliant Monitoring",
          description: "Dynamic Privacy Mask automatically pixelates irrelevant pedestrian faces for desensitization, meeting GDPR and other privacy compliance requirements before forwarding to the monitoring center.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-privacy.png",
          imageAlt: "Privacy-Compliant Monitoring"
        }
      ]
    }
  ]}
/>

### Smart Industry

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503's independent MCU peripheral control ensures industrial-grade reliability—even if containers crash, underlying hardware power-off and limit protection remain active. Rich IO interfaces support connecting various industrial sensors and actuators.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Application Examples",
      items: [
        {
          title: "Safety Equipment Detection",
          description: "Real-time detection of whether workers are wearing hard hats, protective clothing, reflective vests, etc. Violations immediately trigger Alarm output warning signals.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-safety.png",
          imageAlt: "Safety Equipment Detection"
        },
        {
          title: "Production Line Quality Inspection",
          description: "Containerized deployment of custom inspection models for real-time analysis of product appearance on production lines, supporting multi-angle zoom and focus for inspection, with automatic defect marking.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-quality.png",
          imageAlt: "Production Line Quality Inspection"
        }
      ]
    }
  ]}
/>

### AIoT &amp; Custom Applications

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    NE503's containerized microservice architecture and modular HAL design significantly lower the hardware deployment barrier for third-party algorithm companies. Based on the containerd runtime, custom AI applications can be deployed via standard OCI images, breaking hardware vendor lock-in.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Application Examples",
      items: [
        {
          title: "VMS Integration",
          description: "Run professional video management systems like NX Witness in containers. NE503 simultaneously serves as both a smart IPC and NVR, reducing system complexity and cost.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-vms.png",
          imageAlt: "VMS Integration"
        },
        {
          title: "Natural Language Video Search",
          description: "Deploy CLIP / VLM and other vision-language models to support free-text video content search, enabling 'non-predefined target retrieval' such as identifying persons carrying specific items.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-nl-search.png",
          imageAlt: "Natural Language Video Search"
        },
        {
          title: "Multi-Sensor Fusion",
          description: "Connect external sensors via RS-485, Alarm IO, radar interfaces, and other channels. Combined with edge AI inference, achieve multi-dimensional environmental perception and linkage control.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-sensor.png",
          imageAlt: "Multi-Sensor Fusion"
        }
      ]
    }
  ]}
/>

### Edge AI Box

<div className="scenario-overview" style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
  <p style={{ flex: "1", margin: 0, lineHeight: 1.6 }}>
    In projects with existing standard IPC deployments, NE503 can pull RTSP streams from surrounding non-AI IPCs for centralized proxy inference, acting as an 'AI Box inside a camera' to upgrade legacy projects with minimal retrofit cost.
  </p>
</div>

<ApplicationScenarios
  imagePosition="left"
  maxDescriptionLines={8}
  categories={[
    {
      title: "Application Examples",
      items: [
        {
          title: "Legacy IPC AI Upgrade",
          description: "NE503 simultaneously pulls multiple RTSP streams, centrally runs person detection, zone intrusion, and other AI models, pushing inference results to business systems—upgrading to smart surveillance without replacing existing cameras.",
          image: "https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/overview/app-ai-box.png",
          imageAlt: "Legacy IPC AI Upgrade"
        }
      ]
    }
  ]}
/>

## Resources

### Developer Resources

- Python / C++ / Go SDK (MediaClient, InferenceClient, DeviceClient)
- aipc-cli command-line management tool
- RESTful API (Bearer Token authentication)
- Hailo Dataflow Compiler model compilation tool

## Support

<SupportGrid />
