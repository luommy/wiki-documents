---
id: hardware
slug: /7-release-notes/hardware
description: Hardware revision history for CamThink products including NeoEyes NE101, NE301, and NeoEdge NG4500 main board changes.
keywords: [Hardware, PCB revision, NE101, NE301, NG4500, CamThink]
tags: [Release Notes, hardware]
sidebar_position: 2
---

# Hardware

This page records the main board PCB revision history for CamThink hardware products.

## NeoEyes NE101

| Hardware | Changes | Date |
|:---------|:--------|:-----|
| V2.0 | <ul style={{margin:0}}><li>Merge TF card power control pin with module power control (Cat.1/HaLow), shared IO48</li><li>Camera, fill light, and battery level detection control moved from IO3 to IO42</li><li>Dedicated IO3 for RTC interrupt detection</li><li>RTC chip shares I2C bus (IO4 and IO5)</li><li>Improve DCDC output stability, change inductor from 2.2μH to 4.7μH</li><li>Remove shield clip soldering</li></ul> | 2026-01-14 |
| V1.2 | <ul style={{margin:0}}><li>Replace Schottky diode D6 in power selection circuit (PMEG60T30ELR, low reverse leakage)</li><li>Change fill light R73 from NC to 100K</li><li>Change USB insertion indicator from green LED to red LED</li><li>Change button silkscreen labels to start with K</li><li>Add capacitor at DCDC input for sufficient energy storage under low voltage</li><li>Staggered soft-start for camera and fill light power supplies (C31 0.1μF, C45 0.47μF, MOS gate-to-ground 100K)</li><li>Improve DCDC dynamic response, change inductor from 4.7μH to 2.2μH</li><li>Change ISP to single 22μF capacitor; enlarge silkscreen for main ICs; add IO function labels on rear connector terminals</li></ul> | 2025-07-01 |
| V1.1 | <ul style={{margin:0}}><li>Change fill light to female connector with plug-in module</li><li>Raise HaLow and Cat.1 module female connectors, total height unchanged</li><li>Change IO pin arrangement on female connectors</li><li>Fix PCBA burr issue: change panelization to V-CUT</li><li>Add PIR support with additional LDO power supply and 4-pin wafer connector</li><li>Modify all power control circuits with soft-start</li></ul> | 2025-04-12 |
| V1.0 | Initial design | 2024-12-10 |

## NeoEyes NE301

| Hardware | Changes | Date |
|:---------|:--------|:-----|
| V1.3 | <ul style={{margin:0}}><li>Replace LDO with TPS7A2633DRVR</li><li>Change WiFi 1.8V LDO pull-down resistor to direct connection</li><li>Add dedicated PIR interface; keep ISP independent</li><li>Add VCC_IN output compatibility for UART</li><li>Add IR-CUT driver circuit</li></ul> | 2026-01-20 |
| V1.2 | <ul style={{margin:0}}><li>Add U0 reset button</li><li>Remove U0 reserved SPI and WiFi STA connection pins</li><li>Force PWM mode on MPS1462 with VCC pull-up</li><li>Mark R154, R156, R138, R145 as NC</li><li>Add pull-up to SPI2 clock, SPI4 clock and CS pins</li><li>U0 controls N6 reset</li></ul> | 2025-10-20 |
| V1.1 | <ul style={{margin:0}}><li>Change light sensor circuit to LED indicator (light sensor compatible); trigger button and alarm interface compatible with U0/N6 IO detection (standby-capable); ISP and PIR compatible with U0/N6 control, supporting both 3.3V and battery power; add WiFi matching circuit parameters</li><li>Swap SPI2 and SPI4 interfaces; modify to be compatible with SAI audio</li><li>Add PoE/USB power source priority switching circuit; add pull-down resistors to soft-start control circuits</li><li>N6 IO power compatible with 1.8V; modify MCU boot defaults for USB/UART, change BOOT0/BOOT1 pull-up to 10K</li><li>Add missing WiFi chip power domain; some IO power compatible with 1.8V</li><li>Isolate Flash Rst from N6 Rst with diode</li><li>Add 4×100μF capacitors at VCC IN for energy storage</li><li>Remove audio chip circuit</li><li>Add U0 chip control circuit for N6 startup and default WiFi/Cat.1 module power-on control</li></ul> | 2025-07-28 |
| V1.0 | Initial design | 2025-04-12 |

## NeoEdge NG4500

| Hardware | Changes | Date |
|:---------|:--------|:-----|
| V1.1 | <ul style={{margin:0}}><li>Replace VCM power IC from LM25148 to MPQ4317</li><li>Add SW2-controlled 5V/10V switching circuit for VCM power</li><li>Add EEPROM AT24C02D-MAHM-E on I2C2 bus, address 0x57</li><li>Swap RTL8111H-CG Ethernet LED logic: LED0 ACT→LINK, LED1 LINK→ACT</li><li>Optimize VCC_3V3 power circuit: C235 1.8nF→4.7nF; R235 6.49K→5.6K; C236 47pF→120pF; R234 23.2K→56K; U52 NTMFS5C670NLT1G→NTMFS5C645NLT1G; L21 1μH→2.2μH; R222 0.005Ω→0.003Ω</li><li>Add R312 (11.5K) to VDD_5V, set UVLO threshold to 9.6V</li><li>Change U61/U63 (TXS0108EPWR) enable pin to always-on high; add R251/R257 (10K), R310/R311 (1M)</li><li>Optimize 2.9V-triggered DI circuit: R258/R259/R265/R266 1K→2K; R255/R256/R263/R264 1K→10K</li><li>Fix DO circuit bug: swap PMOS D and S pins</li><li>Change FORCE_RECOVERY from touch button to DIP switch</li><li>Change J9/J10/J37 FPC connectors from vertical to horizontal</li></ul> | 2025-03-20 |
| V1.0 | Initial design | 2024-10-30 |
