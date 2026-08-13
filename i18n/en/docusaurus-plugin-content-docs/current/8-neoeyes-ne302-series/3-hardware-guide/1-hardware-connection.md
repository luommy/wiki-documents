---
id: ne302-hardware-connection
title: Hardware Connection
sidebar_position: 1
description: Assemble, power and connect the NE302 hardware for storage and N6 or U0 firmware flashing.
keywords: [NE302, hardware connection, USB Type-C, MicroSD, ST-LINK, N6, U0]
tags: [NE302, hardware-guide, ST-LINK]
---

# Hardware Connection

Work with the device unpowered whenever connecting boards, MicroSD, ST-LINK, or changing a programming switch. The label on the delivered board is authoritative.

## Assembly and first power-on

1. Disconnect USB-C and every external power source.
2. Seat the Main Board and Interface Board vertically and evenly. Install the camera, matching antenna, and enclosure before use.
3. Insert MicroSD before power-on only when the task requires local image or record storage.
4. Leave all programming switches in the run position for normal operation.
5. Connect USB-C power and wait for startup. Open the Web console and confirm that Device Information loads and Feature Debugging shows a camera preview.

If the device does not start, disconnect power. Recheck the board-to-board seating, camera cable, antenna, and approved USB-C supply before changing any programming switch.

## External connections

| Connection | Use | Success check |
| :--- | :--- | :--- |
| USB Type-C | Continuous device power and the supported USB connection for the delivered configuration | Device starts and the Web console becomes reachable |
| MicroSD | Local storage for the configured capture or record workflow | Storage Management reports the card state after startup |
| Trigger / Reset | Physical input or recovery control provided by the delivered hardware and firmware | Use only the function exposed by the delivered device; do not infer signal levels from this guide |
| External SMA antenna | Wireless connection for an external-antenna configuration | Antenna is firmly fitted, has clearance from metal, and wireless connectivity can be tested |

The Interface Board provides **U6-UART** for the STM32N6 serial console. Use the matching adapter and serial procedure; the source README lists 921600 baud. Do not infer electrical levels or pin assignments from this guide.

## Identify programming interfaces

![NE302 Interface Board programming interface map](/img/neoeyes-ne302-series/hardware-guide/ne302-interface-board-programming-map.png)

| Board label | Physical target |
| :--- | :--- |
| `N6-STLINK` | STM32N6 SWD programming and debugging interface |
| `U0-STLINK` | STM32U0 SWD programming and debugging interface |
| `U6-UART` | STM32N6 serial-console interface |
| `N6-BOOT` | STM32N6 boot-mode switch |
| `U0-BOOT` | STM32U0 boot-mode switch |

This guide identifies the connectors and switches only. Target selection, switch sequence, ST-LINK-to-PC connection, and flashing commands are in [Build, Flash and Update](../4-software-guide/1-build-and-flash.md).

## Related pages

- Hardware assembly and configuration boundaries: [Components Overview](./0-components-overview.md)
- Select a target, connect ST-LINK, and run flashing: [Build, Flash and Update](../4-software-guide/1-build-and-flash.md)
- Capture, storage, and records: [Capture and Storage](../2-user-guide/0-capture-storage.md)
