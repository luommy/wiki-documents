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

- **Alarm Input**: alarm input switch. In the current firmware, alarm-input signal reporting (event bus / API) is not yet available — wire alarm linkage through the external system directly.
- **Alarm Input Level**: trigger level selection (**High** / **Low**). Not yet effective in the current firmware; follow the firmware release notes.

> NE503 exposes 1 alarm input channel (dry-contact signals such as door contacts, IR beams, or smoke detectors).

### Wiegand Output

- **Wiegand CH0 / CH1**: two output channels (relay + level) for driving access-control controllers and other external devices.

Enabling a channel drives its output to the active level. Wiegand is an output interface — it does not accept card readers.

## Linkage Notes

- **Two-way talk**: **Talk** button on the Media page, with Mic Input / Speaker Output enabled.
- **AI events driving external devices**: there is no built-in "AI detection → alarm output" auto-linkage; an app or business system subscribes to AI events and acts on them (e.g. drives an external relay).
- **Alarm input reporting**: not yet wired into the event bus in the current firmware — see the Alarm Input section above.

> For physical wiring and power selection of each interface, see [Product Wiring](./8-product-wiring.md).
