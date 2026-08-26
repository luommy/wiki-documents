---
description: "NE503 field wiring guide: connect PoE or DC power, Alarm IN, Wiegand, RS-485, and audio from the terminal diagram, then identify when a debug interface is needed."
keywords: [NE503 wiring, terminals, PoE, DC 12V, Alarm IN, Wiegand, RS-485, audio]
tags: [User Guide, NE503, wiring, field installation]
---

# Product Wiring

If you are connecting the NE503 to equipment on site, follow this order: **identify the terminals → choose one power method → connect the external equipment → power on and check**. This page does not cover developer API details. For interface configuration, see [Peripherals](./3-peripherals.md); for board-level pin definitions, see [Interface Board](../2-hardware-guide/2-aipc-board-connection.md).

Disconnect the device from power before wiring. Connect PoE or DC power only after all terminals are wired.

## 1. Identify the External Terminals

The figure shows the NE503 external terminals. The RJ45 port is used for networking and PoE. On the green terminal block, the DC power terminals are followed by the I/O terminals from left to right.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/hardware-guide/aipc-board-connection/terminal-block-annotation.png" alt="NE503 External Terminal Block Annotation" style={{ width: '100%', height: 'auto' }} />

| Figure label | Terminal label | Connect to |
|:---:|:---|:---|
| RJ45 | PoE | PoE switch or ordinary network switch; only a PoE switch supplies power over the cable |
| 1 | DC- | DC power negative |
| 2 | DC+ | DC 12V power positive |
| 3 | A / D0 | Wiegand D0 output |
| 4 | B / D1 | Wiegand D1 output |
| 5 | G | Wiegand / Alarm common ground |
| 6 | IN | Alarm IN input |
| 7 | G | Audio common ground |
| 8 | I | Line-In audio input |
| 9 | O | Line-Out audio output |

> In the figure, **A / B** are Wiegand **D0 / D1**, not RS-485 A / B. RS-485 uses a separate interface on the device; see [§4](#4-rs-485-and-audio).

## 2. Connect One Power Source

The NE503 supports two power methods. Choose one for the site:

| Power method | Connection | When to use it |
|:---|:---|:---|
| **PoE** | Connect the RJ45 port to an IEEE 802.3at PoE switch with an Ethernet cable | You want network and power over one cable |
| **DC 12V** | Connect the adapter positive to **DC+ (2)** and negative to **DC- (1)** | No PoE is available, or the site uses centralized power / UPS |

Typical device power is 5–6 W. **Do not connect PoE and DC 12V at the same time**. For DC power, size the adapter's rated current with the 6 W draw in mind.

After powering on, wait for the device to start and open its IP address in a browser. If the Web Console opens, the basic power and network connection is working.

## 3. Connect Alarm and Access-Control Equipment

### 3.1 Alarm Input

Alarm IN is a switch-state input that can connect to a door contact, IR beam, smoke detector, or similar device. Sensor output types can differ, so check the supplied hardware documentation for the input type, trigger level, and common terminal before wiring. The example below uses a passive door contact:

1. Connect one door-contact wire to **IN (6)**.
2. Connect the other door-contact wire to **G (5)**.
3. Power on the device.

The current firmware does not report Alarm IN triggers to the Web UI or event interface. Therefore, no status change on the Web page after triggering the contact is expected. Use the access controller or another external system to read and handle the input state.

> If the sensor provides an active voltage signal, do not copy the door-contact wiring directly. Confirm the permitted input voltage range and common terminal in the hardware documentation first.

### 3.2 Wiegand Output

Wiegand is an output interface. It sends linkage signals from the NE503 to an access controller or other external equipment; it is not a reader input. Wire it as follows:

1. Connect the access controller's **D0** to NE503 **A / D0 (3)**.
2. Connect the access controller's **D1** to NE503 **B / D1 (4)**.
3. Connect the access controller's **GND** to NE503 **G (5)**.

After wiring, configure the Wiegand channel in [Peripherals](./3-peripherals.md). The platform does not automatically turn an AI detection into a Wiegand output; an application or business system must receive the event and drive the output when linkage is needed.

## 4. RS-485 and Audio

### 4.1 RS-485

Use RS-485 to connect a PTZ or an RS-485 sensor. RS-485 only transports bytes; the protocol is determined by the external device and the application.

1. Power off and connect the external device's **A to A and B to B**.
2. Power the external device according to its own documentation.
3. Power on the NE503 and use the same baud rate and protocol parameters as the external device.

If a PTZ does not move or a sensor does not respond, first check three things: whether A/B are reversed, whether both sides share ground, and whether the baud rate and protocol match. For the RS-485 terminal definition, see [Interface Board · RS-485](../2-hardware-guide/2-aipc-board-connection.md#rs-485). For runtime issues, see [Troubleshooting FAQ §7.4](../5-troubleshooting.md#74-alarm-input--wiegand--rs-485-runtime-issues).

### 4.2 Audio

- **Line-In**: connect the microphone signal wire to **I (8)** and its ground wire to **G (7)**.
- **Line-Out**: connect the amplifier or powered speaker signal wire to **O (9)** and its ground wire to **G (7)**.

After wiring, enable the corresponding **Mic Input** or **Speaker Output** channel on the **Peripherals** page. Check the signal level against the external audio equipment's documentation; until it is confirmed, do not connect Line-Out directly to a passive speaker.

## 5. Debug Interfaces

**Normal installation and daily operation do not require a debug connection.** Use the interfaces below only for system recovery, serial logs, or interface-board MCU firmware flashing.

| What you need to do | Interface | Connection and operation |
|:---|:---|:---|
| View boot logs or enter UART recovery mode | **SoC UART** | Use a **1.8V-compatible** USB-to-serial adapter on the debug serial port. For system recovery, set `BOOT0 OFF / BOOT1 ON` and press Reset. |
| Factory-program interface-board MCU firmware | **ST-LINK / SWD** | Connect ST-LINK to `PA13/SWDIO`, `PA14/SWDCLK`, `NRST`, `GND`, and `3V3 VREF`. The device must still be powered by PoE; ST-LINK does not power the device. Use MCU OTA for field updates. |
| Internal communication between the core board and interface-board MCU | **Internal MCU host-link** | This is an internal connection, not an external interface. Do not connect field equipment to it. |

For system recovery, serial logs, or MCU firmware flashing, follow the corresponding steps in [System Flashing](../3-software-guide/2-system-flashing.md):

- [Host preparation and serial voltage](../3-software-guide/2-system-flashing.md#1-prepare-firmware-and-host)
- [UART recovery mode](../3-software-guide/2-system-flashing.md#2-recover-the-boot-chain)
- [Interface-board MCU OTA](../3-software-guide/2-system-flashing.md#5-flash-the-mcu-firmware)

## Related Docs

- [Peripherals](./3-peripherals.md) — Web configuration for alarm input, Wiegand, and audio
- [Interface Board](../2-hardware-guide/2-aipc-board-connection.md) — RS-485 and interface-board pin definitions
- [System Flashing](../3-software-guide/2-system-flashing.md) — UART recovery, serial logs, OS upgrades, and MCU OTA
- [Troubleshooting FAQ](../5-troubleshooting.md) — alarm input / Wiegand / RS-485 runtime issues
