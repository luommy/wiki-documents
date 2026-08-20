---
description: NE503 Python SDK (hailo_ipc_sdk) getting-started workflow — what the SDK is, where the source lives, three ways to embed it into your app image, calling patterns, and the permission contract. Read this before the hands-on tutorials.
keywords: [NE503, Python SDK, hailo_ipc_sdk, SDK embedding, container application, build_app.sh, calling pattern]
tags: [application development, NE503, SDK, getting started]
---

# SDK Workflow

This page walks through the full "get the NE503 Python SDK (`hailo_ipc_sdk`) up and running" flow: **what it is → where the source lives → how to embed it into your app image → how to make your first call → what permissions require**. Once you've been through it, [Hello World](./1-hello-world.md) (the deployment loop) and [Person Detection](../2-cookbook/1-person-detection.md) (a real AI app) are only about their own business logic — no need to revisit how the SDK plugs in.

:::info Reading order
**SDK Workflow (this page) → [Hello World](./1-hello-world.md) (deployment loop, no SDK) → [Person Detection](../2-cookbook/1-person-detection.md) (real AI app, uses the SDK)**
:::

## 1. What the SDK Is

`hailo_ipc_sdk` runs **inside your application container** and talks to the platform's AI Runtime, Event Bus, and Device Control services over Unix Sockets — your app never touches hardware or the inference engine directly; it calls SDK clients, which forward to the corresponding services.

**Key constraint: the SDK is not on PyPI and cannot be `pip install`ed from the network.** The source lives in the `neoruntime-sdks` repo under `python/hailo_ipc_sdk/` and must be bundled into your app image — the device's container runtime has no outbound network for pip.

For what each client solves and how to choose one, see [SDK Reference §2 Module Overview](../3-reference/1-sdk-reference.md#2-what-each-module-solves).

## 2. Get the SDK and Embed It into the Image

The SDK lives in the **neoruntime-sdks** repo; sample apps live in the **neoruntime-apps** repo. Clone both into the **same parent directory** — the unified build script takes the SDK from the sibling `neoruntime-sdks` by default:

```bash
git clone https://github.com/camthink-ai/neoruntime-sdks.git
git clone https://github.com/camthink-ai/neoruntime-apps.git
```

There are three ways to get the SDK into your image, depending on your project layout.

**Option A: Unified build script (recommended; used by all repo sample apps)**

`neoruntime-apps`'s `scripts/build_app.sh` automatically copies the sibling `neoruntime-sdks/python/hailo_ipc_sdk/` into the app directory, bakes it into the image with `docker buildx`, and packages an `.aipc` bundle. No manual `pip install`, no network needed:

```bash
cd neoruntime-apps
./scripts/build_app.sh examples/person-detection
# auto: copy SDK → buildx → save → package .aipc
```

**Option B: Manual `COPY` for standalone projects**

When your app lives outside the repo's sample structure, copy the SDK into the image and install it locally in the Dockerfile:

```dockerfile
COPY hailo_ipc_sdk /app/hailo_ipc_sdk
RUN pip install --no-cache-dir /app/hailo_ipc_sdk
```

**Option C: Pre-build a wheel and `pip install` it (best for distribution and reuse)**

Build a universal wheel first (the SDK is pure Python, so it's `py3-none-any`, independent of the device's ARM64 architecture) — the image carries only the artifact, not the whole source tree:

```bash
cd neoruntime-sdks/python
pip wheel . --no-deps -w dist/     # produces dist/hailo_ipc_sdk-<version>-py3-none-any.whl (version follows setup.py)
```

```dockerfile
COPY hailo_ipc_sdk-<version>-py3-none-any.whl /tmp/
RUN pip install --no-cache-dir /tmp/hailo_ipc_sdk-<version>-py3-none-any.whl && rm /tmp/hailo_ipc_sdk-<version>-py3-none-any.whl
```

> Whatever the method, the point is that **the SDK must be carried into the image**. The SDK ships with pre-generated protobuf stubs (`python/hailo_ipc_sdk/proto/*_pb2.py`), so `import hailo_ipc_sdk` works out of the box — no manual generation needed.

## 3. Calling Pattern

All SDK clients share the same shape: **instantiation takes no arguments** (the SDK reads the socket path from environment variables injected by the platform), then you call in one of three modes:

1. **Subscription iterator** — `for ... in xxx.subscribe(...)` yields results continuously (per-frame inference, events, encoded streams); build your app's main loop on top of it;
2. **Publish** — `EventClient.publish(topic, payload)` broadcasts an event; other apps subscribe to the same topic and react;
3. **Control** — `DeviceClient.set_white_light(n)` etc. drive the hardware directly.

Minimal skeleton code for each client: [SDK Examples §1 Pattern Selection](../3-reference/2-sdk-examples.md#1-the-four-patterns-choose-first). Two pitfalls to remember when writing calls:

- **Don't hardcode names** — use the device's real `stream`/`model` values, query them with `list_streams()` / `list_models()` first (see [SDK Reference §3.2](../3-reference/1-sdk-reference.md#32-dont-hardcode-stream-and-model-names));
- **Subscription is a blocking iterator** — Ctrl-C can't interrupt it; shut down gracefully (see [SDK Reference §3.4](../3-reference/1-sdk-reference.md#34-blocking-iterators-need-graceful-exit)).

## 4. Permissions Are a Contract

What the SDK can call is **dictated by the `permissions` section of `app.yaml`**, not by what you write in code. The platform enforces sandboxing against this list: any video stream, model, event topic, or device control not declared here is rejected at call time. So the calls in `app.py` must correspond one-to-one with what `app.yaml` declares.

For the meaning of each permission field, see [App Reference §4 Permission Model](../3-reference/0-app-reference.md#4-permission-model).

## 5. Next Steps

- [Hello World](./1-hello-world.md) — no SDK; run the full "build → deploy → start → verify" closed loop first;
- [Person Detection](../2-cookbook/1-person-detection.md) — a real AI app using the SDK, with complete code and on-device testing;
- Four app patterns and complete repo source: [SDK Examples](../3-reference/2-sdk-examples.md);
- Per-client API details: [SDK Reference](../3-reference/1-sdk-reference.md);
- Build/deploy errors: [Troubleshooting FAQ](../../5-troubleshooting.md).