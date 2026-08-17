---
description: "Guide to NE503 peripheral IO: configuring microphone input, speaker output, alarm input and its trigger level, and Wiegand access-control channels on the Peripherals page."
keywords: [NE503 peripherals, Alarm Input, Wiegand, access control, microphone, speaker, IO control]
tags: [User Guide, NE503, Peripherals, IO]
---

# Peripherals

The **Peripherals** page manages NE503's external hardware interfaces: audio, alarm, and access control. Each item is configured as a toggle or option.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/peripherals/qs-peripherals.png" />

## I/O Control

### Mic Input / Speaker Output (Audio)

- **Mic Input**: enable the device microphone for monitoring, talk-back, or app audio capture on the Media page.
- **Speaker Output**: enable the device speaker for talk-back or app-generated audio.

### Alarm Input

- **Alarm Input**: enable alarm input detection.
- **Alarm Input Level**: choose the trigger level — **High** or **Low** — the external signal level considered "triggered."

> NE503 exposes 1 alarm input channel.

### Wiegand (Access Control)

- **Wiegand CH0 / CH1**: two Wiegand channels for connecting Wiegand-protocol access-control readers.

Once enabled, card-swipe data from the reader can be emitted to the Event Bus for apps or external systems, enabling access-control linkage.

## Linkage with Other Features

Peripherals are not isolated. Common linkage patterns:

| Scenario | Path |
|----------|------|
| AI detects a target → trigger alarm output / access control | App receives AI events via Event Bus → controls IO |
| Alarm input triggers → push event to a business system | Alarm IN signal → Event Bus → MQTT / HTTP |
| Two-way talk | Media page Talk button + Mic/Speaker enabled |
