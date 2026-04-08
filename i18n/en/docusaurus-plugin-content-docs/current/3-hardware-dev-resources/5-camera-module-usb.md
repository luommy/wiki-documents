---
sidebar_position: 5
description: This document provides a detailed overview of the high-performance USB camera module featuring the SC200AI sensor, supporting 1080P HD video output with multiple field-of-view options (51°/88°/137°). Designed specifically for NeoEyes NE101, it features a glass lens, independent ISP, and adjustable focus, suitable for surveillance and AI vision applications.
keywords: [USB Camera, SC200AI, 1080P, Wide Dynamic Range, Wide Angle Lens, NE101, AI Vision, Independent ISP, Hardware Development, Surveillance Camera]
tags: [USB Camera, Vision Module, Hardware Resources, SC200AI, AI Vision]
---

import AccessoriesTable from '@site/src/components/AccessoriesTable';
import useBaseUrl from '@docusaurus/useBaseUrl';

# Camera Module-USB


## Hardware Specifications

![SC200AI](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/usb5.png)

#### **Product Features**
This product is a high-performance USB camera module equipped with a 1/2.7-inch 2-megapixel image sensor, supporting 1080P 30fps HD video output.

**Key Specifications**
| No. | Items                    | Description       |        Notes       |
| ---- | ------------------------ | ----------------- | ------------- |
| 1    | CMOS Sensor              | SC200AI, 1/2.8"   |               |
| 2    | Max.Resolution           | 1920*1080         |               |
| 3    | F.No                     |                   | Optional LENS |
| 4    | Focal Length             | 2.5mm/4mm/6mm     | Optional LENS |
| 5    | Focusing distance        | 2M/3M/5M          | Optional LENS |
| 6    | FOV(H)                   | 137/88/51         | Optional LENS |
| 8    | Communication Interfaces | USB               |               |
| 9    | Operation Temperature    | -20°-- 60°        |               |
| 10   | Storage Temperature      | -40°-- 85°        |               |
| 11   | Dimensions               | 25mm*23.86mm      |               |

---

#### **Module Pinout Description**
| **Pin No.** | **Signal Name** | **Function**       | **Notes**                     |
| ----------- | ------------ | --------------- | ---------------- |
| 1           | VCC          | 5V Power Input   | Max current 500mA              |
| 2           | DM           | USB D-           | Must comply with USB 2.0 spec  |
| 3           | DP           | USB D+           | Must comply with USB 2.0 spec  |
| 4           | GND          | Power Ground     | Shared with signal ground      |

---

#### **Usage Instructions**
1. **Hardware Connection**
   - Connect to the host via the 4-pin 1.0mm USB interface, ensuring stable power supply.
   - The lens is factory-focused; avoid rotating or disassembling the lens assembly.

2. **System Compatibility**
   - Supports Windows XP/7/8.1/10, macOS, and Linux 2.6.2 and above (UVC driver required).
   - Minimum system requirements: CPU 1.7GHz, 512MB RAM, 40GB HDD, Windows XP SP2.

3. **Precautions**
   - Operating temperature must be maintained within 0–60°C; avoid condensation environments.
   - When cleaning the lens, use a lint-free cloth and gently wipe. Do not use corrosive solvents.

---

#### **4. Dimensions**
<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
  <img src="https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/USB_Module_Size.png" alt="USB_Module_Size" style={{ height: '400px', objectFit: 'contain', margin: '0 auto' }} />
</div>


## Product Overview

This camera module is compatible with NeoEyes 101 cameras.
![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/usb6.png)

With the rapid development of AI vision applications, user demands for image quality, adaptability, and multi-scenario usage continue to grow.
The standard CPI module (OV5640) on the NeoEyes NE101 performs reliably in everyday use, but still has limitations in **image detail, wide-angle imaging, and flexibility**.

To address this, we have designed a dedicated USB expansion architecture that enables the NeoEyes NE101 to support a variety of high-performance camera modules.
Through low-level interface optimization, stable compatibility and rapid expansion are achieved even on the ESP-S3 platform, which **does not natively support multiple camera access**. This makes the NeoEyes NE101 a continuously evolving vision platform.

Below is a detailed comparison:

| Comparison Item | Standard OV5640 | USB Module                     |
| -------- | ----------- | --------------------------- |
| Lens Material | Plastic Lens | Glass Lens Included           |
| Pixel Size | 1.4×1.4μm | 2.9×2.9μm (Better Light Sensitivity) |
| ISP Type | Integrated | Independent ISP (Smarter Processing) |
| Focus Adjustment | Fixed | Adjustable Focus Supported   |
| Image Quality | Standard | HD, Richer Details            |
| Application Expansion | Integrated | Batch Customization Available |
| Secondary Development | Not Supported | Supported                     |
| HFOV | Standard, Wide Angle | Standard, Wide Angle, Ultra-Wide Angle |

Note: The OV5640 supports macro shooting, while the USB module does not currently offer this capability. If you have specific macro shooting requirements (e.g., 8 cm, 15 cm), please use the OV5640 version. For special needs, feel free to contact us for customization.

Additionally, the OV5640 is an integrated component. Beyond the hardware parameter differences, it offers limited secondary development space for developers. The OV5640 must be connected to the mainboard, with the mainboard processor reading and processing the raw data, which presents a high technical barrier and requires low-level driver implementation.

## Multiple USB Module Specifications
![SC200AI](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/usb2.png)
>From left to right: SC200AI-137-2M (Ultra-Wide Angle), SC200AI-88-3M (Wide Angle), SC200AI-51-4M (Standard).

We offer three types of USB module versions to meet the needs of different scenarios:

| Model                                 | Field of View (HFOV) | Focus Distance | Features                                           | Use Cases                             |
| ------------------------------------ | ------------- | -------- | ---------------------------------------------- | ------------------------------------ |
| **SC200AI-51-4M (Standard)**    | 51°          | 4m       | Suitable for longer distances, natural imaging, clear details, high color fidelity | General surveillance, recognition tasks                 |
| **SC200AI-88-3M (Wide Angle)**    | 88°          | 3m       | Medium distance, wider shooting range, nearly 50% increase in field coverage | Indoor surveillance, people detection, spatial detection         |
| **SC200AI-137-2M (Ultra-Wide Angle)** | 137°         | 2m       | Close range, panoramic shooting, widest field of view | Indoor/outdoor surveillance, robot navigation, edge detection |

Note: We have adapted two firmware versions (indoor and outdoor) for the USB camera module. Users can select the appropriate version based on their scenario requirements. See the comparison below for indoor and outdoor imaging results.

## OV5640 vs. USB Camera Module Image Comparison

Below is a side-by-side comparison of the CPI OV5640 version and the USB camera module version under similar specifications in both indoor and outdoor scenes:

| CPI Camera                                         | USB Camera (Indoor Firmware)                             |
| ----------------------------------------------- | ----------------------------------------------- |
| HFOV=92° Focus Distance=3m                     | HFOV=137° Focus Distance=2m                    |
| ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image-20251020085837-uhstdxb.png) | ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image-20251020085831-0lepsr2.png) |
| HFOV=92° Focus Distance=3m                     | HFOV=88° Focus Distance=3m                     |
| ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image-20251020085823-1lpi3d3.png) | ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image-20251020085812-1qlfobj.png) |
| HFOV=47° Focus Distance=4m                     | HFOV=51° Focus Distance=4m                     |
| ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image-20251020085803-wfggdqp.png) | ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image-20251020085755-zlr6jbj.png) |

| CPI Camera                                         | USB Camera (Outdoor Firmware)                             |
| ----------------------------------------------- | ----------------------------------------------- |
| HFOV=92° Focus Distance=3m                     | HFOV=137° Focus Distance=2m                    |
| ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image.png) | ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image1.png) |
| HFOV=92° Focus Distance=3m                     | HFOV=88° Focus Distance=3m                     |
| ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image2.png) | ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image3.png) |
| HFOV=47° Focus Distance=4m                     | HFOV=51° Focus Distance=4m                     |
| ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image4.png) | ![image](https://resources.camthink.ai/wiki/img/hardware-dev-resources/usb-camera-module/image5.png) |

> As shown in the comparison, the USB camera module delivers better imaging quality than the OV5640 in both indoor and outdoor scenarios. The two lens modules also differ in image tuning, so you can choose based on your preference.

### USB Camera Module Selection Guide

- **Normal shooting, longer distances** → Choose the *Standard version*
- **Wider field of view needed** → Choose the *Wide Angle version*
- **Complex, large-area monitoring, close range** → Choose the *Ultra-Wide Angle version*

---

## Three Core Advantages of the USB Module

### Image Quality Improvement: Glass Lens + Independent ISP

- The USB module uses a **glass lens** instead of a plastic lens, offering higher light transmittance and durability, effectively reducing chromatic aberration and distortion;
- Larger sensor pixels (2.9×2.9μm) deliver better image detail and low-light performance, with lower noise;
- Independent ISP image signal processor provides more precise image optimization and wider dynamic range.

### Flexible Adaptation: Adjustable Focus + Standardized Interface

- Supports adjustable focus design, allowing users to freely adjust for actual scenarios (close-range recognition, long-range monitoring);
- Standardized module interface with standard UVC protocol — developers can quickly swap modules without modifying low-level drivers, achieving plug-and-play;
- Customization services: hardware/firmware customization available.

### Open Ecosystem: Secondary Development Friendly

- The USB module is more developer-friendly; users with requirements for image tuning or parameter adjustments will find secondary development more convenient;
- Stronger long-term maintainability, with customizable solutions to adapt to more algorithms and application scenarios;
- Provides dedicated indoor and outdoor versions to suit various fields such as smart access control, vehicle surveillance, and industrial recognition.

---

## Comprehensive Upgrade from Hardware to Experience

The USB module is more than just "a better camera" — it represents the NeoEyes NE101's commitment to an open, extensible, and modular design philosophy.
From image quality and flexibility to future compatibility, we aim to give developers more choices to meet the needs of different user groups, while enabling end products to perform better across various application scenarios.

---

## Who Should Choose This?

- Users with higher requirements for image quality and clarity;
- AI vision applications requiring wider-angle or panoramic recognition;
- Technical developer teams or enthusiasts who want to engage in secondary development and flexible feature expansion.

---

## Summary

| Comparison Item | Standard OV5640 | USB Module       |
| ---------- | ----------- | -------------- |
| Lens Material | Plastic Lens | Glass Lens Included |
| Pixel Size | 1.4×1.4μm | 2.9×2.9μm    |
| ISP Type | Integrated | Independent     |
| Focus Adjustment | Fixed Focus | Adjustable Focus Supported |
| Adaptability | Limited | Extensible, Flexible |
| Image Quality | Standard | Clearer |

In summary, upgrading from the standard version to the USB module makes your NeoEyes NE101 not just "see," but "see more clearly and adapt more flexibly."
