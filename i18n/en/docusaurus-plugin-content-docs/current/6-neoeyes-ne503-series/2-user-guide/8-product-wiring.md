---
description: NE503 product wiring and power guide — external interface overview, alarm input and Wiegand output usage and linkage direction, RS-485 transparent byte channel, PoE vs DC power selection, and debug-port entry points.
keywords: [NE503 wiring, Alarm IN, RS-485, Wiegand, PoE power, DC power, debug port]
tags: [User Guide, NE503, wiring, power]
---

# Product Wiring

This page covers how to wire the device: choosing power, what to connect to the alarm and expansion interfaces, and where the debug port lives. For the full interface specification list see [Product Overview](../0-overview.md); for the Web side of each interface see [Peripherals](./3-peripherals.md).

## 1. Power: PoE or DC

NE503 supports two power options — choose by site infrastructure:

| Option | Spec | Best for |
|:--------|:-----|:---------|
| **PoE** | 802.3at (RJ45 port) | Sites with a PoE switch — a single cable carries both power and data |
| **DC supply** | DC 12V (~5–6 W) | No PoE infrastructure, or centralized power / UPS scenarios |

**How to choose**:

- If the site already has a PoE switch and the port power class meets 802.3at → choose PoE: one less power cable, fastest install.
- If the site only has a plain switch, or you have centralized DC power / UPS backup → choose DC 12V. Size the adapter's rated current with the ~6 W power draw in mind.

**Notes**:

- **Do not connect both power sources at the same time.**
- Budget 6 W per device (full load, peripherals included).

> DC connector polarity and plug specifications follow the hardware documentation shipped with the device.

## 2. Alarm Input (Alarm IN)

The product exposes **one** alarm input (terminal labeled Alarm IN) for dry-contact signals such as door contacts, IR beams, or smoke detectors.

**Know two things before wiring**:

1. **In the current firmware, alarm-input signal reporting (event bus / API) is not yet available** — triggering the alarm input produces no event, and there is nothing to observe on the Web UI. If you need alarm linkage, read the sensor signal directly from an external system (e.g. an access controller).
2. **Linkage flows out, not in** — NE503's linkage capability is the **Wiegand ×2** outputs (relay + level) that **drive** access-control and other external devices; on the platform side, your app subscribes to AI events and drives the output (see [Peripherals · linkage](./3-peripherals.md)).

**Wiring steps** (scenario: door contact → Alarm IN):

1. Power off, open the terminal cover, and locate the **Alarm IN** terminal.
2. Wire the door contact's NO/NC output to the alarm-input terminal (exact pinout, common terminal, and input type: see the hardware documentation shipped with the device).
3. Power on and verify: since the current firmware has no event reporting, **not seeing a trigger state on the Web page is expected** — it is not a wiring error.

> Terminal pinout, input level type (dry contact / active level), and allowed input range follow the hardware documentation shipped with the device. Verify before wiring.

## 3. RS-485 Expansion Interface

The product provides an **RS-485** expansion interface for PTZ cameras or RS-485 sensors (temperature/humidity, radar, etc.).

**Understand what it is first: a transparent byte channel.** The device does not "speak" PTZ protocols for you — in software, RS-485 is just a channel for sending and receiving raw bytes:

- Your app calls `Rs485Init` via the SDK / gRPC to set the baud rate and serial parameters, then sends with `Rs485Tx` and subscribes to `EV_RS485_RX` to receive.
- PTZ protocols (Pelco-D/P, custom protocols, etc.) are implemented by your own application.
- Terminal A/B polarity and pinout: see the hardware documentation shipped with the device.

**Typical steps for a PTZ** (scenario: RS-485 PTZ):

1. Power off and wire: connect the PTZ's A/B wires to the device's RS-485 terminal (A→A, B→B — swapped polarity means no communication); power the PTZ per its own spec.
2. Check the PTZ protocol manual for baud rate, protocol type, and PTZ address (DIP switches).
3. Power on the device, call `Rs485Init` in your app with a baud rate matching the PTZ, send control frames in the protocol format, and confirm the PTZ moves.

**Typical steps for a sensor** (scenario: RS-485 temperature/humidity sensor):

1. Wire A/B and power per the sensor manual (most RS-485 sensors also need a common ground).
2. In your app, call `Rs485Init` with the sensor's baud rate, then poll registers per its protocol (usually Modbus RTU).
3. A valid response frame means the link works; if there is no response, follow [Troubleshooting §7.4](../5-troubleshooting.md#74-alarm-input--wiegand--rs-485-runtime-issues).

> RS-485 bus termination, biasing, multi-drop topology requirements, and whether the terminal exposes GND follow the hardware documentation shipped with the device.

## 4. Audio Interfaces

**Line-In / Line-Out**: connect a field microphone and an amplified speaker for monitoring and talkback; enable on the Web side under **Peripherals → Mic Input / Speaker Output**.

## 5. Debug Interfaces

The device has **three kinds of serial interfaces with different purposes** — wiring the wrong one means at best no communication, at worst a damaged port:

| Kind | Purpose | Who uses it |
|:-----|:--------|:------------|
| **SoC UART debug console** | Serial log, UART recovery mode (unbrick / system reflash) | Platform ops |
| **ST-LINK / SWD debug port** | Interface-board MCU firmware flashing | Firmware developers |
| **Internal MCU host-link** | Internal communication between core board and interface-board MCU (`/dev/ttyS0 @ 921600`) — **not an external interface; do not attach peripherals** | Platform internal |

Step-by-step operations and wiring photos for the first two are in [System Flashing](../3-software-guide/2-system-flashing.md):

| Purpose | Entry |
|:--------|:-------|
| UART recovery mode (unbrick / reflash) | DIP switch BOOT0 OFF, BOOT1 ON + Reset button ([§2.1](../3-software-guide/2-system-flashing.md#21-enter-uart-recovery-mode)) |
| Interface-board MCU firmware flashing | ST-LINK / SWD connection ([§4](../3-software-guide/2-system-flashing.md#4-interface-board-mcu-firmware)) |
| Serial console log | UART debug cable ([§1.4 hardware connection](../3-software-guide/2-system-flashing.md#14-hardware-connection)) |

> Don't confuse the two "BOOT0"s: the SoC **BOOT0/BOOT1 DIP switch** switches the whole system's boot mode; interface-board MCU pin **PA14** is also called BOOT0 (shared with SWDCLK), but that belongs to MCU-internal flashing and has nothing to do with the system DIP switch.
