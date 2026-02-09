---
description: Universal Type-C/Type-A to UART (TTL) serial communication module based on CP2102. Compatible with NE101 and NE301 for serial data debugging and secondary development.
keywords: [Serial Communication Module, CP2102, UART, TTL, Type-C to UART, NE101 Debugging, NE301 Debugging, Serial Debugger]
tags: [Hardware, Serial Communication, Debugging Tools, CP2102, UART]
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Serial Communication Module

Camthink Type-C/Type-A to UART (TTL) universal serial communication module.
Based on the CP2101 chip, it supports 3.3V logic levels and is compatible with NE301 and NE101 development boards for serial data debugging.

> If you want to perform secondary development or deep program debugging on development boards like NE301 or NE101, you can use this tool.

## Product Features
- Supports Mac OS, Linux, Android, WinCE, Windows 7/8/10/11...
- Supports external power supply: 5V or 3.3V
- Includes USB protection device: ESD5V0L3
- Includes 3 LEDs: TXD LED, RXD LED, POWER LED
- TXD, RXD, RTS, CTS: Led out via right-angle pin headers
- Universal serial debugger, also suitable for debugging NE101/NE301 serial data.

## Adopting the CP2102 Solution

<div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
  <img src={useBaseUrl('/img/Hardware_Dev_Resources/Serial_Communication_Module/2102.png')} alt="2102" style={{ width: '100%', maxWidth: '500px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
</div>

- Single-chip Type C (A) to UART data converter
    - No external resistors or oscillators required; on-chip power-on reset circuit, on-chip voltage regulator
- Integrated 1024-byte EEPROM (can be used to store various information)
- Type C Functionality
    - Complies with USB 2.0 specification, full speed (12Mbps)
- UART Functionality
    - All handshaking and modem interface signals
    - Supported data formats:
        - Data bits: 5, 6, 7, 8
        - Stop bits: 1, 1.5, 2
        - Parity bits: Odd, Even, None
    - Baud rate from 300bps to 3Mbps
    - 576-byte receive buffer; 640-byte transmit buffer
    - Supports hardware or X-On / X-Off handshaking
    - Supports event status
- Virtual COM Port (VCP) Device Driver Support
    - Windows 8/7/Vista/Server 2003/XP/2000
    - Mac OS-X/OS-9
    - Linux 2.40 or higher
- USBXpress Driver Support
    - Windows 7/Vista/Server 2003/XP/2000
    - Windows CE
- Temperature range: -40 ~ +85°C

## Wiring Instructions

- VCC_OUT: Default output 3.3V (The module is powered by Type C; to output 5V, the Vout jumper must be shorted)
- GND: GND
- TXD: TXD
- RXD: RXD
- RTS: RTS
- CTS: CTS
- This module is for Type C (A) to TTL level conversion. Do not connect directly to RS232 levels to avoid damaging the module.

## Debugging NE301 Development Board

Connect to a computer via the USB port to debug the NE301 development board using UART. A connection example is shown below:

<div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
  <img src={useBaseUrl('/img/Hardware_Dev_Resources/Serial_Communication_Module/serial-communication-moudule.png')} alt="connection" style={{ width: '100%', maxWidth: '500px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
</div>

> Pay attention to the wiring sequence: GND to GND, TXD to RXD, and RXD to TXD.

<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', margin: '24px 0' }}>
  <img src={useBaseUrl('/img/Hardware_Dev_Resources/Serial_Communication_Module/pin.jpg')} alt="pin" style={{ flex: '1 1 300px', maxWidth: '45%', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
  <img src={useBaseUrl('/img/Hardware_Dev_Resources/Serial_Communication_Module/connection.jpg')} alt="connection" style={{ flex: '1 1 300px', maxWidth: '45%', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
</div>

After connecting to the computer, you may need to install drivers (skip if already installed). Driver download address: https://www.silabs.com/software-and-tools/usb-to-uart-bridge-vcp-drivers

Open the page above, select the VCP driver package for your system (Windows / macOS / Linux) in the download area.
On Windows, if the device manager shows an unknown device or exclamation mark after plugging in, installing the driver will usually make it appear as a Virtual COM Port (VCP).

Once connected, you can use serial debugging software (e.g., PuTTY, SecureCRT, Tera Term), which you can search and download on your own. Use the following connection parameters:
- Port: COMx (Check Device Manager for the COM port number)
- Baud Rate: 115200
- Data Bits: 8
- Stop Bits: 1
- Parity: None

After a successful connection, you can start debugging.

The serial command line is used for debugging, configuration, network connectivity, upgrades, etc. The default command prompt is `AICAM>` (see `Custom/Core/Log/debug.h`).

An example of NE301 board debugging is shown below: Press Enter to view available control commands.

<div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
  <img src={useBaseUrl('/img/Hardware_Dev_Resources/Serial_Communication_Module/data.png')} alt="data" style={{ width: '100%', maxWidth: '700px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
</div>

- Seeing `AICAM>` after powering on means the CLI is ready; enter `help` or `?` to view the commands actually registered in the current firmware.
- Supports Tab completion, ↑/↓ history, and inline editing; enter `help` or `?` if unsure.


## Common Serial Commands

- `help` / `?`: View command list and help.
- `sysinfo`: View version, uptime, and current mode.
- `loglevel`: Adjust serial/file log levels.
- `ifconfig` + `ping`: Configure network and verify connectivity.
- `mq` / `mqtt`: MQTT service/client testing.
- `ls` / `cat` / `fget` / `fset`: View files, view/modify NVS configuration.
- `standby` / `u0 ...`: Enter low power mode and debug WakeCore (U0) interaction.
- `cat1stat`: View Cat1 status.
- `cat1csq`: View Cat1 signal quality.
- `nn`: View neural network configurations.

<div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
  <img src={useBaseUrl('/img/Hardware_Dev_Resources/Serial_Communication_Module/nn.png')} alt="nn" style={{ width: '100%', maxWidth: '700px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
</div>

- CLI built-in: `Custom/Common/Utils/generic_cmdline.c`
- Default command registration: `Custom/Core/Log/debug.c` / `Custom/Core/Log/cli_cmd.c` / `Custom/Hal/driver_core.c`
The actual supported commands are subject to the device's serial `help` output.

— The above commands are for reference only. For more details on system debugging, file configuration, upgrades, and networking, please refer to the **[NE301 Source Code](https://github.com/camthink-ai/ne301)** for further verification.
