---
id: ne302-components-overview
title: Components Overview
sidebar_position: 0
description: Identify the NE302 board-level processors, memory, imaging, wireless and interface components.
keywords: [NE302, STM32N657, STM32U073, PSRAM, OS04C10, SiWN917, SHT31]
tags: [NE302, hardware-guide, components, STM32N6]
---

# Components Overview

NE302 is a two-board vision platform. The Main Board contains the image, compute, memory, wireless, and control circuits; the Interface Board provides power, storage, programming, and service access. This page identifies those hardware blocks. For cable connection and firmware flashing, use [Hardware Connection](./1-hardware-connection.md).

## Main Board component map

![NE302 Main Board component map](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/hardware-guide/components-overview/ne302-main-board-chip-map.png)

| Component | Circuit role | Connected hardware path |
| :--- | :--- | :--- |
| **STM32N657L0H3** | Primary vision and AI MCU | Receives the camera stream and connects to PSRAM, Flash, Wi-Fi, and the Interface Board |
| **STM32U073K8U6** | Low-power control MCU | Handles power-control and wake/control signals, including Trigger and Reset-related control paths |
| **APS512XXN-OBR-BG PSRAM** | 32 MB runtime memory | Connected to STM32N657 through the XSPIM P1 interface |
| **OSPI Flash** | 64 MB non-volatile storage | Connected to STM32N657 through the XSPIM P2 interface; firmware packages and partition addresses must match this hardware |
| **SiWN917M100LGTBA** | 2.4 GHz Wi-Fi 6 and Bluetooth wireless module | Connected to STM32N657 through the Wi-Fi SPI/control path and the fitted antenna connection |
| **OS04C10-A43A** | 4 MP CMOS image sensor | Uses the MIPI camera data path and I2C control path to STM32N657 |
| **MP2410AGJ** | White-LED driver | Drives the onboard illumination through the `PWM_LED` control path |

The Main Board also carries the external-power input, Alarm I/O, Trigger button, external-antenna connector, and board-to-board sockets shown in the component map. These labels identify the physical areas; they do not publish a field-wiring pinout or electrical limit.

## Main Board rear and Reset

![NE302 Main Board rear component map](https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/hardware-guide/components-overview/ne302-main-board-rear-map.png)

The rear-side map identifies the **Reset Button**. Use Reset only when the operating procedure requires it. It restarts the device; it is not a substitute for selecting the N6 or U0 programming target.

## Imaging, compute, and control paths

```mermaid
flowchart LR
  CAM[OS04C10-A43A camera] -->|MIPI + I2C| N6[STM32N657L0H3]
  PSRAM[32 MB PSRAM] <-->|XSPIM P1| N6
  FLASH[64 MB OSPI Flash] <-->|XSPIM P2| N6
  WIFI[SiWN917M100LGTBA] <-->|SPI + control| N6
  N6 <-->|control link| U0[STM32U073K8U6]
  U0 --> CTRL[Trigger / Reset / power-control paths]
  N6 --> LED[MP2410AGJ white LED driver]
```

This separation matters during development: N6 firmware covers the FSBL, App, Web, and Model targets, while the U0 runs the separate WakeCore target. Do not use an N6 firmware image on the U0 programming path, or a WakeCore image on the N6 path.

## Interface Board component map

The Interface Board includes the USB-C and MicroSD connection circuits, programming headers, and an **SHT31-DIS** temperature/humidity sensor. It is the service-access board; it does not replace the Main Board's compute, image, or wireless circuits.

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', margin: '20px 0' }}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/hardware-guide/components-overview/ne302-interface-board-programming-map.png" alt="NE302 Interface Board programming interface map" style={{ width: '100%', borderRadius: '8px' }} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne302-series/hardware-guide/components-overview/ne302-interface-board-storage-map.png" alt="NE302 Interface Board storage and USB-C map" style={{ width: '100%', borderRadius: '8px' }} />
</div>

| Interface-board component or area | Function | Use boundary |
| :--- | :--- | :--- |
| USB-C circuit | Device power and USB connection | Use the approved USB-C supply and cable for the delivered unit |
| MicroSD circuit | Local card access | Follow the current device procedure; if hot-plug behavior is not explicitly supported, stop the device and disconnect power before handling the card |
| SHT31-DIS | Temperature/humidity sensor present in the schematic | The firmware read path and Web UI exposure were not verified here; do not treat the component as a confirmed user-visible feature |
| N6-STLINK / U0-STLINK | Separate SWD programming paths | Select the path that matches the firmware target |
| U6-UART | STM32N6 serial-console connector | Use only with the matching adapter and serial procedure; the source README lists 921600 baud |
| N6-BOOT / U0-BOOT | Programming-mode controls | Change the matching switch only while the device is unpowered |

## Related resources

- Board assembly, USB-C, MicroSD, U6-UART, and ST-LINK: [Hardware Connection](./1-hardware-connection.md)
- Build and flashing commands: [Build, Flash and Update](../4-software-guide/1-build-and-flash.md)
- Schematics, PCB files, and project sources: [NE302 source repository](https://github.com/camthink-ai/ne302)
