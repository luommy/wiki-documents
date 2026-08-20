---
description: NE503 container application development reference — complete app.yaml field definitions, Dockerfile patterns, the permission model, and multi-container configuration.
keywords: [NE503, application development, app.yaml, Dockerfile, container, permission model]
tags: [application development, NE503, reference, container]
---

# App Reference

This document is the complete configuration reference for NE503 container applications, covering every `app.yaml` field, Dockerfile patterns, the security sandbox model, and multi-container architecture. For step-by-step tutorials aimed at beginners, see [SDK Examples](./2-sdk-examples.md).

## 1. App Overview

Apps on the NE503 platform run as OCI containers, with their lifecycle managed uniformly by App Manager. Each app declares its image, resource needs, and permissions via an `app.yaml` manifest.

**Core concepts:**

- **Single-container mode** — most apps need only one container; specify the image in `spec.image`.
- **Multi-container mode** — complex apps can split into main + sub containers for process-level isolation. Only the main container has access to platform services.
- **Least privilege** — all permissions (video streams, inference, device control, etc.) must be declared explicitly; undeclared permissions are unavailable.

**Project file structure:**

```
my-app/
├── app.yaml          # app manifest (required)
├── Dockerfile        # build definition (required)
├── app.py            # entry file
├── requirements.txt  # Python dependencies (optional)
└── config/           # config files (optional)
```

## 2. app.yaml Complete Reference

The app manifest is the AIPC platform's core configuration file. This section explains every field, level by level.

### 2.1 Minimal Config

```yaml
apiVersion: v1
kind: Application
metadata:
  id: my_app
  name: My Application
  version: 1.0.0
spec:
  image: aipc/my_app:1.0.0
```

### 2.2 Full Single-Container Config

The example below includes all available fields, grouped by level:

```yaml
apiVersion: v1
kind: Application

metadata:
  id: my_app                          # required - unique identifier
  name: My Application                # required - display name
  version: 1.0.0                      # required - semantic version
  description: App feature description # optional - app description
  author: Developer                   # optional - author
  email: dev@example.com              # optional - contact email

spec:
  image: aipc/my_app:1.0.0            # required - container image (docker.io/ is auto-prepended when no registry prefix)

  # ── Resource limits ─────────────────────────────
  resources:
    cpu: "50%"                         # CPU limit; percentage ("50%") or cores ("1.5")
    memory: "256Mi"                    # memory limit; Mi/Gi suffix ("512Mi", "1Gi")

  # ── Permission declarations ─────────────────────
  permissions:
    video:                             # video stream access
      - sub.raw                        #   raw video stream (sub publishes NV12 frames, DMA-BUF zero-copy, for inference)
      - main                           #   encoded video stream (H264, for RTSP pull, cannot subscribe for inference)
    inference:                         # AI inference
      models: [hailo_yolov8n_384_640]  #   allowed model list (must match loaded models on the device)
      max_qps: 30                      #   max inference requests per second
      max_concurrent: 2                #   max concurrent inferences
      allow_register_model: false      #   whether dynamic model registration is allowed
    events:                            # event bus
      publish: [app/my_app/*]          #   publishable topics (wildcard * supported)
      subscribe: [model/*/detections, system/*]  # subscribable topics
    device:                            # device control
      light: true                      #   fill light
      ir_cut: true                     #   IR-CUT filter
      ptz: false                       #   PTZ control
      lens: false                      #   lens zoom/focus
      gpio:
        read: [12, 13]                 #   readable GPIO pin numbers
        write: [21, 22]                #   writable GPIO pin numbers
    network:                           # network access
      mode: isolated                   #   network mode: isolated (default) or host
      outbound:                        #   outbound allowlist (isolated mode only)
        - "https://api.example.com"
        - "mqtt://broker.example.com:8883"
      inbound:                         #   inbound ports (host mode only)
        - 8554

  # ── Environment variables ───────────────────────
  env:
    - name: LOG_LEVEL
      value: INFO
    - name: CUSTOM_CONFIG
      value: "production"

  # ── Volume mounts ───────────────────────────────
  volumes:
    - host: /data/aipc/data/my_app      # host path
      container: /app/data             # in-container path
      readonly: false                  # read-only mount

  # ── Security sandbox ────────────────────────────
  security:
    no_new_privileges: true            # disable privilege escalation (default true)
    readonly_rootfs: true              # read-only root filesystem (default true)

  # ── Startup policy ──────────────────────────────
  autostart: true                      # auto-start on boot (default false)
  restart_policy: on-failure           # basic restart policy: always | on-failure | no
  restart_max_retries: 3               # basic restart max retries

  # ── Health check ────────────────────────────────
  healthcheck:
    enabled: true
    type: command                      # check type: command | http | tcp
    command: "/app/main --health"      # command type: command to run
    path: /healthz                     # http type: check path
    port: 8080                         # http/tcp type: port number
    interval: 30s                      # check interval
    timeout_seconds: 5                 # timeout (seconds)
    retries: 3                         # consecutive failure threshold

  # ── Auto-restart (enhanced, with exponential backoff) ──
  auto_restart:
    enabled: true                      # enable auto-restart
    max_retries: 3                     # max restart count (0 = unlimited)
    retry_delay_seconds: 10            # initial retry delay (seconds)
    backoff_multiplier: 2.0            # backoff multiplier (delay × this each failure, capped at 5 min)
    health_check_interval_seconds: 30  # health-check polling interval (seconds)

  # ── Plugin system ───────────────────────────────
  plugin:
    capabilities:
      - id: rtsp-server                # capability unique id
        version: "1.0"                 # capability version
        transport: both                # transport: grpc | event | both
        description: RTSP streaming service
        proto: "rtsp.RtspService"      # gRPC service definition (required for grpc/both)
        topics:                        # event topics (required for event/both)
          publish:
            - "plugin/rtsp/stream-status"
          subscribe:
            - "system/video-config-changed"

  plugin_dependencies:                 # other plugin capabilities this app depends on
    - capability: rtsp-server          # capability id
      min_version: "1.0"               # minimum version required
      required: true                   # hard dependency
```

### 2.3 Top-Level Fields

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `apiVersion` | string | yes | API version; currently fixed at `v1` |
| `kind` | string | yes | resource type: `Application`, `ModelService`, `BusinessService` |
| `metadata` | object | yes | app metadata; see [2.4 metadata fields](#24-metadata-fields) |
| `spec` | object | yes | app spec; see [2.5 spec fields](#25-spec-fields) |

### 2.4 metadata Fields

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `id` | string | yes | unique identifier; lowercase letters/digits/underscores; immutable after creation |
| `name` | string | yes | app display name |
| `version` | string | yes | semantic version (major.minor.patch) |
| `description` | string | no | app feature description |
| `author` | string | no | author name |
| `email` | string | no | contact email |

### 2.5 spec Fields

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `image` | string | required for single-container | container image reference; registry prefix auto-completed |
| `resources` | object | no | resource limits (`cpu`, `memory`) |
| `permissions` | object | no | permission declarations; see [2.6 permissions fields](#26-permissions-fields) |
| `env` | array | no | environment variable list; each item has `name` and `value` |
| `volumes` | array | no | volume mount list; see below |
| `security` | object | no | security sandbox config; see [4 Permission Model](#4-permission-model) |
| `autostart` | bool | no | auto-start on boot; default `false` |
| `restart_policy` | string | no | basic restart policy: `always`, `on-failure`, `no` (default) |
| `restart_max_retries` | int | no | basic restart max retries |
| `healthcheck` | object | no | health check config |
| `auto_restart` | object | no | enhanced auto-restart config (with exponential backoff; takes precedence over `restart_policy`) |
| `plugin` | object | no | plugin capability declarations |
| `plugin_dependencies` | array | no | plugin dependency declarations |
| `containers` | map | no | multi-container mode; see [5 Multi-Container Config](#5-multi-container-config) |
| `networking` | object | no | multi-container network config |
| `lifecycle` | object | no | multi-container lifecycle config |

### 2.6 permissions Fields

**video** — video stream access list:

| Value | Description |
|:---|:---|
| `sub.raw` | raw video stream (sub publishes NV12 frames, DMA-BUF shared-memory zero-copy, **for inference subscription**) |
| `main` | encoded video stream (H264, for RTSP pull, cannot be used for inference subscription) |

When a `.raw` stream is declared, the platform auto-mounts the `/dev/dma_heap` device (multi-container main containers also share the host IPC namespace) to support DMA-BUF zero-copy memory mapping. `main` only emits encoded H264; `subscribe(stream="main")` hangs forever — inference must use `sub`.

**inference** — AI inference permissions:

| Field | Type | Default | Description |
|:---|:---|:---|:---|
| `models` | string[] | -- | allowed model ID list (required; auto-registered with AI Runtime at startup) |
| `max_qps` | int | 0 | max inference requests per second |
| `max_concurrent` | int | 0 | max concurrent inferences |
| `allow_register_model` | bool | false | whether new models can be dynamically registered at runtime |

**events** — event bus permissions:

| Field | Type | Description |
|:---|:---|:---|:---|
| `publish` | string[] | publishable topic patterns; `*` wildcard supported (e.g. `app/my_app/*`) |
| `subscribe` | string[] | subscribable topic patterns; `*` wildcard supported (e.g. `model/*/detections`) |

**device** — device control permissions:

| Field | Type | Description |
|:---|:---|:---|:---|
| `light` | bool | fill-light control |
| `ir_cut` | bool | IR-CUT filter control |
| `ptz` | bool | PTZ control |
| `lens` | bool | lens zoom/focus control |
| `gpio.read` | int[] | readable GPIO pin numbers |
| `gpio.write` | int[] | writable GPIO pin numbers |

**network** — network access permissions:

| Field | Type | Description |
|:---|:---|:---|:---|
| `mode` | string | `isolated` (default; independent network namespace) or `host` (shared host network) |
| `outbound` | string[] | outbound allowlist; `isolated` mode only |
| `inbound` | int[] | inbound port list; `host` mode only |

### 2.7 volumes Fields

Each volume mount item contains:

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `host` | string | yes | host path (device deploy root is `/data/aipc`; a `/opt/aipc` prefix is auto-remapped to the actual deploy root for backward compatibility) |
| `container` | string | yes | in-container mount path |
| `readonly` | bool | no | read-only mount; default `false` |

The platform auto-mounts the `/run/aipc` directory so the container can access all IPC sockets (`ai-runtime.sock`, `event-bus.sock`, etc.). No manual declaration needed.

### 2.8 healthcheck Fields

| Field | Type | Description |
|:---|:---|:---|:---|
| `enabled` | bool | whether health check is enabled |
| `type` | string | check type: `command` (run a command), `http` (HTTP request), `tcp` (TCP connection) |
| `command` | string | command to run when `type=command` |
| `path` | string | request path when `type=http` |
| `port` | int | port number when `type=http` or `type=tcp` |
| `interval` | string | check interval (e.g. `30s`) |
| `timeout_seconds` | int | per-check timeout (seconds) |
| `retries` | int | consecutive failures before judged unhealthy |

### 2.9 auto_restart Fields

Enhanced auto-restart strategy with exponential backoff. When `auto_restart.enabled` is `true`, it takes precedence over `restart_policy`.

| Field | Type | Default | Description |
|:---|:---|:---|:---|
| `enabled` | bool | false | whether auto-restart is enabled |
| `max_retries` | int | 0 | max restart count (0 = unlimited retries) |
| `retry_delay_seconds` | int | 5 | first retry delay (seconds) |
| `backoff_multiplier` | float | 1.5 | backoff multiplier; delay × this each failure, capped at 5 min |
| `health_check_interval_seconds` | int | 30 | background health-check polling interval (seconds) |

**Backoff example** (`retry_delay_seconds: 10`, `backoff_multiplier: 2.0`):

- 1st restart: 10 s delay
- 2nd restart: 20 s delay
- 3rd restart: 40 s delay
- ...capped at 300 s (5 min)

### 2.10 plugin Fields

Declares plugin capabilities the app provides, for other apps to discover and depend on.

**capabilities items:**

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `id` | string | yes | capability unique id |
| `version` | string | yes | capability semantic version |
| `transport` | string | yes | transport: `grpc`, `event`, `both` |
| `description` | string | no | capability description |
| `proto` | string | required for grpc/both | gRPC service definition (e.g. `"rtsp.RtspService"`) |
| `topics` | object | required for event/both | contains `publish` and `subscribe` topic lists |

The plugin runtime socket path is `/run/aipc/plugins/<app_id>.sock`.

**plugin_dependencies items:**

| Field | Type | Required | Description |
|:---|:---|:---|:---|
| `capability` | string | yes | capability id depended on |
| `min_version` | string | no | minimum version required |
| `required` | bool | no | hard dependency (when true, the app cannot start if the dependency is unmet) |

### 2.11 Validation Rules

App Manager runs these checks at install time:

1. `apiVersion` must be `v1`
2. `kind` must be `Application`, `ModelService`, or `BusinessService`
3. `metadata.id`, `metadata.name`, `metadata.version` are required
4. In single-container mode `spec.image` is required; in multi-container mode each container's `image` is required
5. `network.mode` only allows `isolated` or `host`; `inbound` is only available in `host` mode
6. In multi-container mode there must be exactly one `role: main` container, and sub containers cannot declare any permissions
7. Plugin capability event topics must have corresponding publish/subscribe permissions in `permissions.events`

## 3. Dockerfile Patterns

### 3.1 Python — Base Image (Recommended)

The SDK is preinstalled in the base image; no extra install step:

```dockerfile
FROM aipc/python-base:1.0
WORKDIR /app
COPY . /app/
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser
CMD ["python", "app.py"]
```

### 3.2 Python — Wheel File (Offline)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY hailo_ipc_sdk-*.whl /tmp/
RUN pip install --no-cache-dir /tmp/hailo_ipc_sdk-*.whl && rm /tmp/*.whl
COPY . /app/
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser
CMD ["python", "app.py"]
```

### 3.3 Go — Multi-Stage Build

```dockerfile
FROM golang:1.25-alpine AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main ./cmd/main

FROM alpine:3.18
RUN apk --no-cache add ca-certificates tzdata
COPY --from=builder /app/main /app/main
RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup -s /bin/sh -D appuser
USER appuser
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD /app/main --health-check
ENTRYPOINT ["/app/main"]
```

### 3.4 Best Practices

- **Non-root** — create a dedicated user (UID 1000) and switch with `USER`. The platform auto-injects the AIPC group GID (1001) for socket access; no manual group config needed.
- **Slim image** — use multi-stage builds, `--no-cache-dir`, and clean temp files to reduce image size.
- **Read-only filesystem compatibility** — avoid writing to `/etc`, `/var`, etc. Write data to `volumes`-mounted paths.
- **Proxy build** — use `--build-arg HTTP_PROXY=...` when cross-compiling on an x86 dev machine.
- **Cross-arch** — use `docker buildx build --platform linux/arm64` for ARM images.

## 4. Permission Model

NE503 uses a multi-layer security sandbox; all security policies are enforced by the platform, so developers do not configure them in the Dockerfile.

### 4.1 Linux Capabilities

These dangerous capabilities are auto-dropped at container startup:

| Dropped capability | Risk |
|:---|:---|
| `CAP_SYS_ADMIN` | super-admin privileges |
| `CAP_NET_ADMIN` | network config changes |
| `CAP_SYS_MODULE` | load kernel modules |
| `CAP_SYS_TIME` | change system clock |
| `CAP_SYS_BOOT` | reboot the system |
| `CAP_SYS_NICE` | change process priority |
| `CAP_SYS_RESOURCE` | bypass resource limits |
| `CAP_SYS_RAWIO` | direct I/O port access |
| `CAP_SYS_PTRACE` | process tracing |
| `CAP_SYS_CHROOT` | change root directory |
| `CAP_MKNOD` | create device files |

### 4.2 Seccomp Syscall Filtering

App Manager loads a Seccomp profile at container startup. The default policy is allowlist mode (`defaultAction: SCMP_ACT_ERRNO`), permitting only common syscalls. The profile path is set by the platform admin; developers need not care.

### 4.3 Filesystem & Namespace Isolation

| Mechanism | Default | Overridable via app.yaml |
|:---|:---|:---|
| `no_new_privileges` | true | `security.no_new_privileges: false` |
| `readonly_rootfs` | true | `security.readonly_rootfs: false` |
| PID namespace isolation | independent | not overridable |
| Mount namespace isolation | independent | not overridable |
| UTS namespace isolation | independent | shared in `host` network mode |
| Network namespace isolation | independent | shared when `permissions.network.mode: host` |
| IPC namespace isolation | independent | multi-container main container shares host IPC when it declares video streams (needed for DMA-BUF mmap) |
| PIDs limit | 128 | not overridable |

### 4.4 Network Isolation

- **isolated mode** (default): the container has its own network namespace and can only reach external addresses via the `outbound` allowlist.
- **host mode**: the container shares the host network stack and can declare ports to listen on via `inbound`. Suited to scenarios like RTSP streaming that need to expose services externally.

### 4.5 Socket Access Mechanism

The platform mounts `/run/aipc` into all containers; it holds all IPC sockets. Containers gain access via the AIPC group GID (1001), auto-injected by the platform — developers need not add group config in the Dockerfile.

## 5. Multi-Container Config

When an app needs process-level isolation, use multi-container mode. For example, split the inference engine and business logic into separate containers for independent updates and resource limits.

### 5.1 Architecture Model

| Role | Platform service access | permissions | Typical use |
|:---|:---|:---|:---|
| **main** | yes; can access AI Runtime, Event Bus, and other platform sockets | declarable | business logic, platform interaction |
| **sub** | no; fully isolated | not declarable | independent algorithm process, third-party service |

Constraints:
- There must be exactly one `role: main` container
- sub containers cannot declare any permissions
- Containers communicate with each other via the shared network namespace

### 5.2 Full Example

```yaml
apiVersion: v1
kind: Application
metadata:
  id: smart_detection
  name: Smart Detection
  version: 1.0.0
spec:
  containers:
    main:
      image: smart-detection-main:1.0
      role: main                          # must be declared
      permissions:
        video: [sub.raw]
        inference:
          models: [hailo_yolov8n_384_640]
      resources:
        cpu: "100%"
        memory: "512Mi"
      ports:
        - containerPort: 8080
          protocol: TCP
          name: http                      # service-discovery name
      env:
        - name: SUB_DETECTOR_ADDR
          value: "detector:50051"
      volumes:
        - name: shared-data               # container-level volume mount
          container: /app/shared
          readonly: false
      security:
        readonly_rootfs: false

    detector:
      image: smart-detection-detector:1.0
      role: sub                           # sub container; cannot declare permissions
      resources:
        cpu: "50%"
        memory: "256Mi"
      ports:
        - containerPort: 50051
          protocol: TCP
      command: ["/app/detector"]          # override ENTRYPOINT
      args: ["--workers=4"]               # appended args

  networking:
    mode: internal                        # internal (default) | bridge | host
    ingress:
      - port: 8080                        # external port
        target: main:8080                 # target container:port
        protocol: HTTP                    # HTTP | TCP | UDP

  lifecycle:
    startup_order: [detector, main]       # start sub first
    shutdown_order: [main, detector]      # stop main first

  volumes:                                # app-level shared volume (visible to all containers)
    - host: /data/aipc/data/smart_detection
      container: /app/data
```

### 5.3 ContainerSpec Fields

Each container (entry under `containers`) supports:

| Field | Type | Description |
|:---|:---|:---|
| `image` | string | container image |
| `role` | string | `main` or `sub` |
| `permissions` | object | permission declarations (main container only) |
| `resources` | object | resource limits (`cpu`, `memory`) |
| `env` | array | environment variable list |
| `ports` | array | port declaration list; each item has `containerPort`, `protocol`, `name` |
| `command` | string[] | override image ENTRYPOINT |
| `args` | string[] | appended args |
| `healthcheck` | object | container-level health check |
| `volumes` | array | container-level volume mounts; each item has `name`, `container`, `readonly` |
| `security` | object | container-level security config (inherits app-level `spec.security` when unset) |

### 5.4 Network Modes

| Mode | Description | Use case |
|:---|:---|:---|
| `internal` | containers share a network namespace; not externally reachable (default) | internal microservice communication |
| `bridge` | join the LAN via the `aipc-br0` bridge | services needing LAN discovery |
| `host` | share the host network stack | services needing externally exposed ports |

### 5.5 Startup & Shutdown Order

- `startup_order` — specifies container startup order. When unset, all sub containers start first, then the main container.
- `shutdown_order` — specifies container shutdown order. When unset, defaults to the reverse of startup order (stop main, then sub).

### 5.6 Auto-Injected Environment Variables

In multi-container mode, the platform auto-injects these env vars into each container:

| Variable | Description |
|:---|:---|
| `APP_ID` | app ID (from `metadata.id`) |
| `APP_ROLE` | container role (`main` or `sub`) |
| `CONTAINER_NAME` | container name (the key in `containers`) |
| `AIPC_HOST_PREFIX` | platform deploy path prefix (e.g. `/data/aipc`) |

## 6. Lifecycle Management

The full app lifecycle from install to uninstall is managed by App Manager:

| Phase | CLI command | Description |
|:---|:---|:---|
| **install** | `aipc-cli app install <yaml> <tar>` | import image, validate manifest, register to app store |
| **start** | `aipc-cli app start <id>` | preload models, create container, start running |
| **stop** | `aipc-cli app stop <id>` | gracefully stop container (default 10 s timeout) |
| **uninstall** | `aipc-cli app remove <id>` | stop container, remove image and instance data, unregister |
| **update** | stop + uninstall old version, then install + start new version | hot update not supported; manual replacement required |

**Install methods:**

- **Local image file** — pass a `.tar` or `.tar.gz` file; imported directly into containerd.
- **Remote image registry** — pass an image reference (e.g. `docker.io/my/app:1.0`); auto-pulled and normalized to a full reference.

**Fault self-healing:**

- At startup, detects overlayfs snapshot corruption (common after power loss) and auto-reunpacks the image from the content store.
- At install, saves an image tar backup for rebuilding after power-loss recovery.

## 7. Environment Variable Reference

Container env vars auto-injected by the platform:

| Variable | Source | Description |
|:---|:---|:---|
| `APP_ID` | `metadata.id` | app unique identifier |
| `APP_ROLE` | `containerSpec.role` | container role (multi-container mode only) |
| `CONTAINER_NAME` | containers key name | container name (multi-container mode only) |
| `AIPC_HOST_PREFIX` | platform config | deploy path prefix, used for path translation |
| `<custom>` | `spec.env` | variables declared by the user in app.yaml |

Connection-config variables auto-read by the SDK (usually no need to change; the platform already provides them via socket mounts):

| Variable | Default | Description |
|:---|:---|:---|
| `AI_RUNTIME_ENDPOINT` | `unix:///run/aipc/ai-runtime.sock` | AI Runtime gRPC endpoint |
| `EVENT_BUS_ENDPOINT` | `unix:///run/aipc/event-bus.sock` | Event Bus gRPC endpoint |
| `DEVICE_CONTROL_ENDPOINT` | `unix:///run/aipc/device-control.sock` | device control gRPC endpoint |
| `CAMERA_CONTROL_ENDPOINT` | `unix:///run/aipc/camera-control.sock` | camera control gRPC endpoint |
| `SHM_BASE_PATH` | `/run/aipc/shm` | shared memory base path |
| `LOG_LEVEL` | `INFO` | log level |
| `DEBUG` | `0` | debug mode switch |

## 8. Related Docs

- [Python SDK Reference](./1-sdk-reference.md) — SDK API signatures and data types
- [SDK Examples](./2-sdk-examples.md) — full app examples and development tutorials
- [Platform Architecture](../../3-software-guide/0-system-architecture.md) — system design and data flow
- [System Architecture · Platform Services Layer](../../3-software-guide/0-system-architecture.md) — App Manager and other service responsibilities, with source pointers