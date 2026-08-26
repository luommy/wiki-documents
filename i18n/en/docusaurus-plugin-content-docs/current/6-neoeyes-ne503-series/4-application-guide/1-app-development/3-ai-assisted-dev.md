---
id: ai-assisted-dev
title: AI-Assisted Development
sidebar_position: 3
description: Use Claude Code and the ne503-dev skill to turn one natural-language requirement into a loitering-alert app that runs on NE503, then deploy and verify it.
keywords: [NE503, ne503-dev, Claude Code, AI-assisted development, app development, loitering alert, dwell, state machine]
tags: [App Development, NE503, AI-Assisted Development, skill]
---

# AI-Assisted Development

This page demonstrates how to use **Claude Code** and the `ne503-dev` skill to build an NE503 application.

The example requirement is simple: raise an alert when a person stays in frame for 10 continuous seconds, then reset the timer and alert state after the person leaves. You describe the requirement and confirm the key parameters; Claude handles the app code, manifest, build, deployment, and verification based on the device's actual state.

:::tip Try the finished app directly
If you only want to see the result, download the prebuilt package [lingering-detection.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/lingering-detection.tar). Extract `app.yaml` and `image.tar`, then import them using the [Hello World deployment steps](./1-hello-world.md#4-deploy-to-the-device).
:::

## 1. Prerequisites

| Requirement | Description |
|:---|:---|
| Claude Code | Installed and working. |
| `ne503-dev` skill | [Download the skill](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ne503-dev.zip) and extract it to `~/.claude/skills/ne503-dev/`. |
| Docker | Used to build the ARM64 app image. |
| NE503 device | Online with its IP and `admin` password available; HAL v2, `ai-runtime`, and the detection model are ready. |

## 2. From One Requirement to a Running App

### 2.1 Describe the requirement

In Claude Code, invoke `ne503-dev` and state the goal and device address:

> Build an app that raises an alert after a person lingers for 10 seconds. Deploy it to `<device-IP>`.

Claude confirms the necessary details before development starts. You do not need to specify the code structure up front, but you should confirm business parameters such as the dwell time and detection threshold.

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-start_new.mp4" type="video/mp4"></source>
  Your browser does not support video playback.
</video>

### 2.2 Claude develops the app

Starting from the SDK app template, Claude completes three important tasks:

1. **Confirm the device resources first**: query the actual model and video streams. This example uses model `hailo_yolov8n_384_640` and the raw `sub` stream; `main` is an encoded H264 stream and cannot be used directly for inference.
2. **Implement the dwell state machine**: start timing when a person appears, raise one alert after 10 continuous seconds, and reset after no person is detected for 3 seconds. `GRACE_SECONDS` tolerates brief detection gaps caused by turning or occlusion.
3. **Generate the app manifest**: declare the video stream, model, event topics, and tunable values in `app.yaml`, including `LOITER_SECONDS`, `DETECTION_THRESHOLD`, and `GRACE_SECONDS`.

The important point is not to guess values that work in a generic example, but to use the device's real model, stream, and permissions.

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assist-end_new.mp4" type="video/mp4"></source>
  Your browser does not support video playback.
</video>

### 2.3 Deploy and verify

Once the code and manifest are ready, `ne503-dev` runs the sequence below:

```text
Build ARM64 image → upload → install → start → check status and logs
```

Verify three things:

- The app is `Running`, and the logs show model loading and the first inference frame;
- The permissions injected by the platform match the declarations in `app.yaml`;
- A person entering the frame triggers a complete detection and alert cycle.

<video controls width="100%">
  <source src="https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/verify-on-web_new.mp4" type="video/mp4"></source>
  Your browser does not support video playback.
</video>

In this on-device demonstration, alerts consistently fired at 10.1 seconds, with three independent alert cycles verified.

Full process video: [ai-assisted-development_new.mp4](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/ai-assisted-dev/ai-assisted-development_new.mp4)
