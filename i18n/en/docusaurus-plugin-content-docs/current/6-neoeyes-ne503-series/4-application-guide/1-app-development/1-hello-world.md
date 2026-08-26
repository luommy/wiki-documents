---
id: hello-world
title: Hello World
sidebar_position: 1
description: Build and run your first container application on NE503 from scratch — write the app, build the ARM64 image, deploy to the device, start and verify, then clean up. Full source in neoruntime-apps/examples/hello-world/.
keywords: [NE503, Hello World, application tutorial, container application, application deployment, getting started, minimal closed loop]
tags: [application development, NE503, tutorial, getting started]
---

# Hello World

This tutorial walks the **complete closed loop** of an NE503 container application with a minimal Hello World app: write the application → build the ARM64 image → deploy to the device → start and verify → clean up. It does not use the AI SDK — it just prints one log line per second in a loop, which verifies that your development environment and deployment pipeline work end to end. That loop is the foundation for every AI application you build next.

The full source lives in the `neoruntime-apps` repo under `examples/hello-world/`, and every file in this article matches it.

:::tip Skip the build and deploy directly
Don't want to build the image yourself? Download the prebuilt package [hello-world.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/hello-world.tar), unzip it to get `app.yaml` and `image.tar`, and jump straight to [§4 Deploy to the Device](#4-deploy-to-the-device).
:::

## 1. Prerequisites

| Condition | Verification |
|:---|:---|
| NE503 device online and running | Open `https://<device-ip>` in a browser; the Web login page should appear |
| Docker (>= 20.10) on the dev machine | Run `docker --version` |
| Dev machine can reach the device | `curl -k -o /dev/null -w "%{http_code}" https://<device-ip>` returns `200` |
| Device login credentials | Web Console defaults to `admin` / `password` (change after first login) |

:::tip Architecture: why buildx
The device is **ARM64**. Apple Silicon development machines are also ARM64, so builds are native; on x86 machines Docker buildx emulates via QEMU — slower but functionally identical. On the device, apps run under the built-in **containerd** runtime and do not depend on the Docker on your dev machine — Docker is only used to build the image on your computer.
:::

## 2. Application Structure

There are 4 files under `examples/hello-world/`:

```
hello-world/
├── app.py           # App logic
├── app.yaml         # Manifest (image/resources/startup policy)
├── Dockerfile       # Container build definition
└── entrypoint.sh    # Debug-mode entry (not used for normal startup)
```

**`app.py`** — the main loop prints a timestamped counter, and handles SIGTERM / SIGINT for graceful exit (the platform sends SIGTERM when stopping an app; the app should wind down on its own rather than be killed):

```python
import os, time, signal

class HelloWorldApp:
    def __init__(self):
        self.running = True
        self.app_id = os.environ.get("APP_ID", "hello_world")  # injected by the platform
        self.counter = 0
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        self.running = False   # stop signal received, exit the main loop

    def run(self):
        while self.running:
            self.counter += 1
            ts = time.strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{ts}] #{self.counter:06d} - Hello World from AIPC!")
            time.sleep(1)
        print(f"[{self.app_id}] Goodbye!")

if __name__ == "__main__":
    HelloWorldApp().run()
```

> The repo version adds a startup banner, exception handling, and cleanup logs; the logic is identical. Full annotated version: [app.py](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/hello-world/app.py).

**`app.yaml`** — the manifest, declaring the image, resource limits, and startup policy. Hello World calls no platform service, so it needs **no `permissions`**:

```yaml
apiVersion: v1
kind: Application
metadata:
  id: hello-world
  name: Hello World
  version: 1.0.0
  description: A simple hello world application that prints continuously
  author: AIPC Team
spec:
  image: aipc/hello-world:1.0.0      # must match the docker build -t tag
  resources:
    cpu: "10%"
    memory: "32Mi"
  autostart: false
  restart_policy: on-failure
  restart_max_retries: 3
```

**`Dockerfile`** — based on `python:3.11-alpine`. The repo template pre-installs a set of debugging tools for inspecting the container; delete that `RUN` line to slim the image if you don't need them:

```dockerfile
FROM python:3.11-alpine3.19

# Template pre-installs debugging tools (for docker exec inspection); remove to slim the image
RUN apk add --no-cache bash curl iputils net-tools procps strace

WORKDIR /app
COPY app.py /app/app.py
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Run as a non-root user
RUN adduser -D -u 1000 appuser && chown -R appuser:appuser /app

ENV PYTHONUNBUFFERED=1
ENV APP_ID=hello_world

# Liveness probe: the platform uses it to judge app health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python3 -c "import sys; sys.exit(0)" || exit 1

CMD ["python3", "/app/app.py"]
```

**`entrypoint.sh`** — not used for normal startup; when you need to debug inside the container, run `docker exec -it <container> /app/entrypoint.sh bash` for an interactive shell.

## 3. Build the Image

In the app directory, build the ARM64 image, export it as a tar, then package it as an `.aipc`:

```bash
cd neoruntime-apps/examples/hello-world

# 1. Build the ARM64 image (--load loads it into local Docker)
docker buildx build --platform linux/arm64 --load -t aipc/hello-world:1.0.0 .

# 2. Export the image as a tar
docker save aipc/hello-world:1.0.0 -o image.tar

# 3. Package as .aipc (a zip of app.yaml + image.tar)
zip hello-world.aipc app.yaml image.tar
```

Real build artifacts:

| Artifact | Size |
|:---|:---|
| Docker image | 26.5 MB (113 MB on disk) |
| `image.tar` | 25 MB |
| `hello-world.aipc` | 25 MB |

> `.aipc` is just a zip archive of `app.yaml` + `image.tar`, convenient for storage and distribution. Deploying uses the `image.tar` and `app.yaml` inside it; the `.aipc` itself is not uploaded.

:::warning Intermittent build failure?
On macOS + Docker Desktop, `apk add` occasionally fails with `Failed to create ...: I/O error`. This is a known intermittent buildx issue — **re-running the build command succeeds**.
:::

## 4. Deploy to the Device

After building you have `app.yaml` and `image.tar`. Pick one of three ways — **Web Console recommended** (graphical, no SSH).

> If you packaged `.aipc` with the repo's unified build script `scripts/build_app.sh`, run `unzip -o hello-world.aipc` first to get the two files back.

### 4.1 Upload via Web Console (recommended)

1. Open `https://<device-ip>` and log in with the defaults `admin` / `password`.
2. Click **App Management** in the left nav, then the **Import** card in the top-right.
3. The **Application Setup Wizard** opens; in the first step **Source**, pick the third option **Upload Package** (accepts both the manifest and the image).
4. Under **App Manifest (app.yaml)**, choose your local `app.yaml`; under **Container Image**, choose `image.tar`.

![Upload package: select app.yaml + image.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/web-import-upload-package.png)

5. Click **Install** in the bottom-right; the wizard runs the remaining steps (parse manifest → import image → register app), usually in 10–15 seconds. Hello World then appears in the app list (initially Stopped; started in the next section).

### 4.2 Deploy via aipc-cli (alternative)

If you're already SSH'd into the device, one command installs it. First copy the two files over:

```bash
scp app.yaml image.tar root@<device-ip>:/tmp/
ssh root@<device-ip>
aipc-cli app install app.yaml image.tar   # note: run from /tmp on the device
```

### 4.3 Deploy via HTTP API (alternative)

Suited to scripting / CI automation: log in for a token → upload the image and manifest separately → trigger an async install and poll progress.

> The legacy single-file upload `curl -F 'app=@xxx.aipc' /api/v1/apps` no longer works — the two-step flow below is required.

```bash
# Log in for a token (returned with a "Bearer " prefix; pass the whole string as the Authorization header)
curl -k -X POST https://<device-ip>/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Upload image and manifest (field name is "file" for both; each returns its path)
curl -k -X POST https://<device-ip>/api/v1/apps/upload-image \
  -H "Authorization: Bearer <token>" -F "file=@image.tar"
curl -k -X POST https://<device-ip>/api/v1/apps/upload-manifest \
  -H "Authorization: Bearer <token>" -F "file=@app.yaml"

# Trigger the async install (JSON body with the two paths above), poll the returned task_id until phase=complete
curl -k -X POST https://<device-ip>/api/v1/apps/install-package \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"manifest_path":"<manifest path>","image_path":"<image path>","force":true}'
curl -k https://<device-ip>/api/v1/apps/install-progress/<task_id> \
  -H "Authorization: Bearer <token>"
```

Usually completes in 10–15 seconds.

## 5. Start and Verify

### 5.1 Start the app

After deployment the app is Stopped; start it once manually.

**Option 1: Web Console (recommended)** — go to **App Management**, click **Start** on the Hello World card; the status badge switches from Stopped to Running within a few seconds.

**Option 2: HTTP API**

```bash
curl -k -X POST https://<device-ip>/api/v1/apps/hello-world/start \
  -H "Authorization: Bearer <token>"
```

:::tip First start times out?
On first start of an image, the platform loads it into the container runtime, which may exceed the 10-second API timeout and return `code:6002 DeadlineExceeded`. This is **not an error** — call start once more (or click Start again in the Web UI) and it succeeds.
:::

### 5.2 Verify in the Web Console

Log into `https://<device-ip>` and confirm the app is running from a user's perspective. The **Applications** area in the middle of the Dashboard lists running apps; under **Applications** on the left, Hello World is **Running** with live resource usage; the detail page shows the app ID, version, uptime, and Stop / Restart / Uninstall actions — the app is now managed by the platform.

![Web Console login page](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/01-login.png)

![Dashboard (Hello World running)](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/02-dashboard.png)

![App Management (Hello World Running)](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/03-apps-list.png)

![Hello World app detail](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/04-app-detail.png)

### 5.3 View runtime logs

Logs can also be fetched via the API (returns NDJSON, one JSON object per line):

```bash
curl -k "https://<device-ip>/api/v1/apps/hello-world/logs?max_lines=10" \
  -H "Authorization: Bearer <token>"
```

```json
{"timestamp":1781509897838838800,"level":"info","message":"[2026-06-15 07:51:23] #000011 - Hello World from AIPC!"}
{"timestamp":1781509897838892960,"level":"info","message":"[2026-06-15 07:51:24] #000012 - Hello World from AIPC!"}
{"timestamp":1781509897838901400,"level":"info","message":"[2026-06-15 07:51:25] #000013 - Hello World from AIPC!"}
```

The counter increments once per second, confirming the app is running steadily.

## 6. Stop and Clean Up

After verification, stop and uninstall:

```bash
# Stop
curl -k -X POST https://<device-ip>/api/v1/apps/hello-world/stop -H "Authorization: Bearer <token>"
# → {"data":{"message":"App stopped successfully"}}

# Uninstall
curl -k -X DELETE https://<device-ip>/api/v1/apps/hello-world -H "Authorization: Bearer <token>"
# → {"data":{"message":"App uninstalled successfully"}}
```

## Related Docs

- [SDK Workflow](./0-sdk-workflow.md) — next step: embed the SDK into your app image so your app can do real AI inference
- [Person Detection](../2-cookbook/1-person-detection.md) — a complete on-device case using the SDK
- [App Reference §2 app.yaml Complete Reference](../3-reference/0-app-reference.md#2-manifest-structure) — what each `app.yaml` field means, and permissions
- [Troubleshooting FAQ](../../5-troubleshooting.md) — build, deploy, and startup errors
