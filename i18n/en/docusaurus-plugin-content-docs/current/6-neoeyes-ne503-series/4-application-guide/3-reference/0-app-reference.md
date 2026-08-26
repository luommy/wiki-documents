---
description: "NE503 app.yaml reference based on source code: structure, permissions, single and multi-container settings, health checks, and plugins."
keywords: [NE503, app.yaml, application manifest, container, permissions, multi-container, health check]
tags: [Application Development, NE503, Configuration Reference, Container]
---

# App Reference

This page answers one question: **how should the fields in an application manifest be written?** Start with the [SDK Workflow](../1-app-development/0-sdk-workflow.md) for a first project, and use the [SDK Examples](./2-sdk-examples.md) when you need runnable code.

App Manager reads the image, permissions, resources, and lifecycle settings from `app.yaml`. Calling an SDK method does not grant a service permission that the manifest did not declare.

## 1. Choose a manifest mode

| Mode | Entry point | Use it for | Platform access |
|:---|:---|:---|:---|
| Single container | `spec.image` | Most Python/C++ applications | The app uses `spec.permissions` |
| Multi-container | `spec.containers` | A main process plus internal services | Only a `role: main` container may declare platform permissions |

### 1.1 Minimal single-container manifest

```yaml
apiVersion: v1
kind: Application
metadata:
  id: people_counting
  name: People Counting
  version: 1.0.0
spec:
  image: aipc/people-counting:1.0.0
```

Source validation requires `apiVersion`, `kind`, `metadata.id`, `metadata.name`, `metadata.version`, and `spec.image` for single-container apps. The accepted `kind` values are `Application`, `ModelService`, and `BusinessService`.

### 1.2 Recommended authoring order

1. Confirm the actual stream and model names on the target device.
2. Declare only the permissions the application really uses.
3. Add resources, environment variables, and writable directories.
4. Configure startup, health checks, and restart behavior last.

Do not treat example names such as `cam0_main` or `person_v1` as device-wide constants.

## 2. Manifest structure

### 2.1 Top-level fields

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `apiVersion` | string | Yes | Must currently be `v1` |
| `kind` | string | Yes | `Application`, `ModelService`, or `BusinessService` |
| `metadata` | object | Yes | Application identity and version |
| `spec` | object | Yes | Image, permissions, resources, and runtime settings |

### 2.2 `metadata`

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `id` | string | Yes | Unique application identifier |
| `name` | string | Yes | Display name |
| `version` | string | Yes | Application version |
| `description` | string | No | Functional description |
| `author` | string | No | Author |
| `email` | string | No | Contact email |

### 2.3 Runtime fields in `spec`

| Field | Purpose | Notes |
|:---|:---|:---|
| `image` | Single-container image | Multi-container apps declare an image per container under `containers` |
| `resources` | CPU and memory limits | `cpu` accepts values such as `50%` and `0.5`; `memory` accepts `256Mi` and `1Gi` |
| `permissions` | Platform service access | See Section 3 |
| `env` | Container environment variables | `name` + `value` |
| `volumes` | Host-to-container mounts | Single-container mounts use `host`, `container`, and `readonly` |
| `autostart` | Start automatically with the system | Set it to match deployment needs |
| `restart_policy` | Base restart policy | `always`, `on-failure`, or `no` |
| `restart_max_retries` | Maximum base-policy retries | Used with `on-failure` |
| `healthcheck` | Container health check | See Section 4.4 |
| `auto_restart` | Restart settings with backoff | See Section 4.5 |
| `security` | Container security options | Keep the strict defaults unless required |
| `plugin` | Capabilities provided by this app | See Section 6 |
| `plugin_dependencies` | Required plugin capabilities | See Section 6 |
| `dev` | Development hot reload | Development only |

## 3. Permissions: declare what the code calls

Permissions live under `spec.permissions`. In multi-container mode, put them on the `main` container; a `sub` container must not declare platform permissions.

### 3.1 Video and inference

```yaml
permissions:
  video:
    - main.raw
    - sub.raw
  inference:
    models:
      - person_vehicle_v1
    max_qps: 10
    max_concurrent: 2
    allow_register_model: false
```

| Field | Meaning | Important detail |
|:---|:---|:---|
| `video` | Video resources the app may access | Match manifest resource names to the target device and SDK `stream` values; `.raw` denotes a raw-frame resource |
| `inference.models` | Model IDs the app may use | Must match models registered on the device |
| `max_qps` | Inference request-rate limit | Limits the app's request budget |
| `max_concurrent` | Concurrent inference limit | Check it carefully for cascades and batches |
| `allow_register_model` | Allow dynamic model registration | Enable only when the app really needs it |

See [SDK Reference](./1-sdk-reference.md) for the call shape. Do not copy model or stream names from an example into production configuration without checking the device.

### 3.2 Event Bus

```yaml
permissions:
  events:
    publish:
      - app/people_counting/*
    subscribe:
      - inference/**
```

`publish` and `subscribe` are separate topic allowlists. Topic matching supports exact matches, single-level `*`, and multi-level `**`; the topic protocol and message fields are defined in [Event Integration](./5-event-integration.md).

### 3.3 Device control and GPIO

```yaml
permissions:
  device:
    light: true
    ir_cut: true
    ptz: false
    lens: false
    gpio:
      read: [12, 13]
      write: [21, 22]
```

| Field | Control scope |
|:---|:---|
| `light` | White light |
| `ir_cut` | IR-CUT |
| `ptz` | Pan/tilt/zoom |
| `lens` | Lens zoom, focus, and iris-related capabilities |
| `gpio.read` | GPIO pins the app may read |
| `gpio.write` | GPIO pins the app may write |

### 3.4 Network

```yaml
permissions:
  network:
    mode: isolated
    outbound:
      - https://api.example.com
      - mqtt://broker.example.com:8883
    inbound:
      - 8554
```

The source defines the single-container network fields as `mode`, `outbound`, and `inbound`:

| Field | Description |
|:---|:---|
| `mode` | `isolated` (default) or `host` |
| `outbound` | Allowed destinations in isolated mode |
| `inbound` | Exposed ports in host mode |

This `network.mode` is a single-container permission setting. Multi-container topology uses `spec.networking` in Section 5; do not mix the two.

## 4. Single-container runtime settings

### 4.1 Environment variables

```yaml
env:
  - name: APP_MODE
    value: production
  - name: LOG_LEVEL
    value: INFO
  - name: THRESHOLD
    value: "10"
```

Manifest values are injected into the container as strings. Convert numeric values explicitly in Python. The SDK also reads variables such as `APP_ID`, `AI_RUNTIME_ENDPOINT`, `EVENT_BUS_ENDPOINT`, and `DEVICE_CONTROL_ENDPOINT`.

### 4.2 Volume mounts

```yaml
volumes:
  - host: /data/aipc/data/people_counting
    container: /app/data
    readonly: false
  - host: /data/aipc/logs/people_counting
    container: /app/logs
    readonly: false
```

Mount only persistent data, logs, or model directories. Set `readonly: true` whenever possible, and avoid exposing a broad host directory to the app.

### 4.3 Security settings

```yaml
security:
  no_new_privileges: true
  readonly_rootfs: true
```

The source models these fields as optional boolean pointers; when omitted, strict security values remain the default. Override them only when the runtime requirement is understood.

### 4.4 Health checks

```yaml
healthcheck:
  enabled: true
  type: command
  command: "/app/main --health"
  path: /healthz
  port: 8080
  interval: 30s
  timeout_seconds: 5
  retries: 3
  health_check_interval_seconds: 30
```

`type` may be `command`, `http`, or `tcp`. Use `command` for command checks, `path` and `port` for HTTP checks, and `port` for TCP checks. The source field is `timeout_seconds`, not the commonly seen Docker Compose field `timeout`.

### 4.5 Automatic restart

```yaml
auto_restart:
  enabled: true
  max_retries: 3
  retry_delay_seconds: 10
  backoff_multiplier: 2.0
  health_check_interval_seconds: 30
```

`restart_policy` is the base policy. `auto_restart` adds retry limits, initial delay, backoff, and health-check polling. When both are configured, verify the intended failure-recovery behavior so the app is not restarted twice by competing mechanisms.

## 5. Multi-container configuration

### 5.1 `main` and `sub`

```yaml
spec:
  containers:
    main:
      image: aipc/smart-detection-main:1.0.0
      role: main
      permissions:
        video: [main.raw]
        inference:
          models: [person_vehicle_v1]
      resources:
        cpu: "100%"
        memory: "512Mi"
      env:
        - name: DETECTOR_ADDR
          value: detector:50051
      ports:
        - containerPort: 8080
          protocol: TCP
          name: http

    detector:
      image: aipc/detector:1.0.0
      role: sub
      resources:
        cpu: "50%"
        memory: "256Mi"
      ports:
        - containerPort: 50051
          protocol: TCP
          name: grpc
      command: ["/app/detector"]
      args: ["--listen", "50051"]
```

Each `ContainerSpec` supports `image`, `role`, `permissions`, `resources`, `env`, `ports`, `command`, `args`, `healthcheck`, `volumes`, and `security`. Source validation requires an image per container and assigns platform-service access to the `main` container; a `sub` container must not declare `permissions`.

### 5.2 Container networking and startup order

```yaml
networking:
  mode: internal
  ingress:
    - port: 8080
      target: main:8080
      protocol: HTTP

lifecycle:
  startup_order: [detector, main]
  shutdown_order: [main, detector]
  restart_policy: on-failure
```

`networking.mode` may be `internal`, `bridge`, or `host`. `ingress.target` uses `container-name:port`; the `lifecycle` order fields express start and stop dependencies. Multi-container `networking` is different from single-container `permissions.network`.

## 6. Development mode and plugins

### 6.1 Development hot reload

```yaml
dev:
  enabled: true
  watch_path: /app
  sync:
    - host: .
      container: /app
  reload_signal: SIGTERM
  debug_port: 5678
```

`dev` is for local hot reload: `sync` maps a development directory into the container, `reload_signal` supports `SIGHUP` or `SIGTERM`, and `debug_port` can be used for IDE debugging. Remove or disable it in a release manifest.

### 6.2 Providing a plugin capability

```yaml
plugin:
  capabilities:
    - id: rtsp-server
      version: "1.0"
      transport: both
      description: RTSP streaming server
      proto: rtsp.RtspService
      topics:
        publish: [plugin/rtsp/stream-status]
        subscribe: [system/video-config-changed]

plugin_dependencies:
  - capability: rtsp-server
    min_version: "1.0"
    required: true
```

`transport` may be `grpc`, `event`, or `both`. `proto` describes a gRPC capability and `topics` describe an event capability. Dependency fields are named `capability`, `min_version`, and `required` in source.

## 7. Pre-deployment checklist

- `kind`, `metadata`, and the image mode satisfy source validation.
- The video resources and `inference.models` IDs have been confirmed on the target device.
- Every Event Bus topic used by code is covered by a `publish` or `subscribe` allowlist.
- Enable only the device-control and GPIO capabilities the app actually uses.
- Every writable directory has an explicit volume; read-only directories stay read-only.
- `healthcheck` uses the source field `timeout_seconds`, with fields matching its type.
- A multi-container app has exactly one `main` role and no platform permissions on `sub` containers.
- Release manifests do not enable `dev`, and the restart policy cannot create a restart loop.

## 8. Related documentation

- [SDK Workflow](../1-app-development/0-sdk-workflow.md) — project creation to deployment
- [SDK Reference](./1-sdk-reference.md) — Python SDK package, modules, and endpoints
- [SDK Examples](./2-sdk-examples.md) — inference, events, and device control
- [RESTful API Reference](./3-restful-api.md) — external HTTP interfaces
- [Event Integration](./5-event-integration.md) — Event Bus topics and message protocol
