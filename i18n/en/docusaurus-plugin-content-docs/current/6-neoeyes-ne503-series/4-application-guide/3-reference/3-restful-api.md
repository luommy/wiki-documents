---
description: NE503 RESTful API reference from source code, covering authentication, system, AI, device, media, app, file, storage, network, operations, and WebSocket endpoints.
keywords: [NE503 API, RESTful API, HTTP, WebSocket, device control, AI model, app management, media configuration]
tags: [API Reference, NE503, RESTful, WebSocket, Developer]
---

# RESTful API Reference

Platform API is the NE503 HTTP gateway. This page is organized by resource so you can locate an endpoint first, then open Swagger for its request body and response schema.

Paths below omit the `/api/v1` prefix. For example, `GET /system/info` means `GET https://<device-ip>/api/v1/system/info`. Login, `POST /api/login`, is outside that prefix.

## 1. Request conventions

### 1.1 Base URL and authentication

| Item | Value |
|:---|:---|
| Base URL | `https://<device-ip>` |
| API prefix | `/api/v1` |
| Swagger UI | `/swagger/` (depends on the device deployment) |
| Protocol | HTTP + WebSocket |
| Standard response | JSON |

Log in before calling protected endpoints and send the returned token in the request header:

```bash
curl -k -X POST https://<device-ip>/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"<username>","password":"<password>"}'
```

```bash
curl -k https://<device-ip>/api/v1/system/info \
  -H 'Authorization: Bearer <token>'
```

The following public endpoints are registered in source:

| Method | Actual path | Use |
|:---|:---|:---|
| `POST` | `/api/login` | Login |
| `GET` | `/api/v1/auth/public-key` | Fetch the public key before login |
| `GET` | `/api/v1/system/health` | Health check |
| `GET` | `/api/v1/system/ota/status` | Poll OTA status |
| `GET` | `/api/v1/system/os-upgrade/status` | Poll OS-upgrade status |

`/api/v1/logout` is also registered. Whether clients need to call it explicitly depends on session management. Other `/api/v1` routes normally pass through the authentication middleware.

### 1.2 Requests and responses

- Use `Content-Type: application/json` for JSON requests.
- Use the multipart field defined by the endpoint for file uploads.
- Treat reboot, upgrade, format, model deletion, file deletion, and process termination as state-changing operations; test them on a staging device first.
- Check the business fields such as `code`, `message`, and `data` in addition to the HTTP status.
- Never commit tokens, passwords, API keys, or device addresses to logs or the documentation repository.

## 2. Find an endpoint by task

| Task | Resource groups | Start with |
|:---|:---|:---|
| Device enrollment | system, device-info, network | `/system/info`, `/system/health`, `/device-info`, `/network/config` |
| Model preparation | ai | `/ai/capabilities`, `/ai/models`, `/ai/models/upload` |
| App installation and runtime | apps, containers, images | `/apps`, `/apps/{app_id}/start`, `/containers` |
| Camera and streams | media, streams, h264 | `/media/config`, `/media/status`, `/streams`, `/h264/{stream_id}` |
| Peripherals | device | `/device/status`, `/device/light`, `/device/lens/*` |
| Real-time events | events | `/events/topics`, `/events/publish`, `/events/stream` |
| Operations | monitor, processes, logs, files | `/monitor/*`, `/processes`, `/logs/*`, `/files/*` |

## 3. System, models, and events

### 3.1 System, time, OTA, and OS upgrade

| Method | Path |
|:---|:---|
| `GET` | `/system/info` |
| `GET` | `/system/stats` |
| `GET` | `/system/time` |
| `POST` | `/system/time/set` |
| `POST` | `/system/time/sync-from-client` |
| `GET` / `PUT` | `/system/time/config` |
| `PUT` | `/system/time/timezone` |
| `GET` | `/system/time/timezones` |
| `PUT` | `/system/time/ntp` |
| `POST` | `/system/time/ntp/sync` |
| `POST` | `/system/password` |
| `POST` | `/system/restart` |
| `GET` | `/system/ota/detect` |
| `POST` | `/system/ota/parse` |
| `POST` | `/system/ota/install` |
| `POST` | `/system/ota/install-from-path` |
| `GET` | `/system/ota/status` (public status query) |
| `POST` | `/system/os-upgrade/upload` |
| `POST` | `/system/os-upgrade/validate` |
| `POST` | `/system/os-upgrade/install` |
| `GET` | `/system/os-upgrade/status` (public status query) |
| `POST` | `/system/os-upgrade/reboot` |
| `POST` | `/system/os-upgrade/cancel` |
| `DELETE` | `/system/os-upgrade/package` |

Use upgrade and reboot endpoints as a state machine: upload/parse or validate, execute, poll status, and reconnect when necessary. `install-from-path` requires an absolute path on the device, not on the caller's computer.

### 3.2 AI Runtime

| Method | Path |
|:---|:---|
| `GET` | `/ai/capabilities` |
| `GET` / `POST` | `/ai/models` |
| `POST` | `/ai/models/parse` |
| `POST` | `/ai/models/upload` |
| `POST` | `/ai/models/scan` |
| `GET` | `/ai/models/{model_id}` |
| `DELETE` | `/ai/models/{model_id}` |
| `POST` | `/ai/models/{model_id}/load` |
| `POST` | `/ai/models/{model_id}/unload` |
| `GET` | `/ai/models/{model_id}/apps` |
| `GET` | `/ai/stats` |

Uploading, registering, loading, and deleting a model are separate operations. Before `DELETE /ai/models/{model_id}`, check whether the device file will be removed and whether any app is still using it.

### 3.3 Event Bus

| Method | Path | Use |
|:---|:---|:---|
| `GET` | `/events/topics` | List topics |
| `POST` | `/events/publish` | Publish an event |
| `GET` | `/events/stream` | WebSocket event stream |

See [Event Integration](./5-event-integration.md) for Event Bus topics, payloads, authentication, and WebSocket boundaries.

## 4. Device, camera, and audio/video

### 4.1 Device control

| Method | Path |
|:---|:---|
| `GET` | `/device/status` |
| `POST` | `/device/light` |
| `POST` | `/device/ir-led` |
| `POST` | `/device/ir-cut` |
| `POST` | `/device/ptz` |
| `POST` | `/device/zoom` |
| `POST` | `/device/focus` |
| `POST` | `/device/autofocus` |
| `POST` | `/device/lens/oneshot-af` |
| `POST` | `/device/lens/af/oneshot` |
| `GET` | `/device/lens/af/status` |
| `POST` | `/device/lens/af/cancel` |
| `POST` | `/device/lens/zoom-follow` |
| `GET` | `/device/lens/status` |
| `PUT` | `/device/lens/zoom-level` |
| `PUT` | `/device/lens/focus-level` |
| `POST` | `/device/lens/reset-zero` |
| `POST` | `/device/lens/iris` |
| `POST` | `/device/lens/iris-target` |
| `PUT` | `/device/lens/limits` |
| `POST` | `/device/lens/init` |
| `POST` | `/device/lens/goto` |
| `GET` / `POST` | `/device/gpio` |
| `GET` | `/device/gpio/{pin}` |
| `GET` / `POST` | `/device/fan` |
| `GET` / `POST` | `/device/heat` |
| `GET` / `POST` | `/device/radar` |
| `GET` / `POST` | `/device/alarm-out` |
| `GET` | `/device/alarm-out/{channel}` |
| `GET` / `POST` | `/device/wiegand` |
| `GET` | `/device/wiegand/{channel}` |
| `GET` | `/device/alarm-outputs` |
| `POST` | `/device/rs485/init` |
| `POST` | `/device/rs485/deinit` |
| `POST` | `/device/rs485/tx` |
| `GET` | `/device/capabilities` |

Device-control endpoints can change lights, lenses, PTZ, GPIO, RS485, and other peripherals. Confirm permissions, hardware capability, and stop/reset behavior before calling them.

### 4.2 Streams and media configuration

| Method | Path |
|:---|:---|
| `GET` | `/streams` |
| `GET` | `/streams/{stream_id}` |
| `GET` | `/h264/{stream_id}` (WebSocket/MSE stream) |
| `GET` / `POST` | `/media/config` |
| `GET` / `PUT` | `/media/config/field` |
| `GET` | `/media/config/export` |
| `POST` | `/media/config/import` |
| `GET` / `PUT` | `/media/image` |
| `GET` / `PUT` | `/media/transform` |
| `PUT` | `/media/encoder` |
| `PUT` | `/media/rtsp` |
| `PUT` | `/media/ai-overlay` |
| `GET` / `PUT` | `/media/osd` |
| `POST` | `/media/osd/upload-image` |
| `GET` | `/media/osd/font` |
| `GET` | `/media/osd/image/{name}` |
| `GET` / `PUT` | `/media/privacy-mask` |
| `PUT` | `/media/encoder/reconfig` |
| `GET` | `/media/profile` |
| `GET` | `/media/profiles` |
| `POST` | `/media/profile/switch` |
| `POST` | `/media/profile/backup` |
| `POST` | `/media/pipeline/reconfigure` |
| `GET` | `/media/status` |
| `POST` | `/media/streams` |
| `DELETE` | `/media/streams/{name}` |
| `POST` | `/media/streams/{name}/enable` |
| `DELETE` | `/media/streams/{name}/disable` |

Bulk configuration import may write several runtime files and restart camera-daemon. Hot-reconfigure endpoints have their own semantics. Export the current configuration and define a rollback before changing it.

### 4.3 Audio

| Method | Path |
|:---|:---|
| `GET` | `/audio/capture-devices` |
| `GET` | `/audio/playback-devices` |
| `GET` | `/audio/status` |
| `POST` | `/audio/capture/start` |
| `POST` | `/audio/capture/stop` |
| `PUT` | `/audio/config` |
| `POST` | `/audio/playback/start` |
| `POST` | `/audio/playback/stop` |
| `GET` | `/audio/stream` (WebSocket) |
| `GET` | `/audio/talk` (WebSocket) |

## 5. Apps, containers, and images

### 5.1 App management

| Method | Path |
|:---|:---|
| `GET` / `POST` | `/apps` |
| `GET` | `/apps/{app_id}` |
| `DELETE` | `/apps/{app_id}` |
| `POST` | `/apps/{app_id}/start` |
| `POST` | `/apps/{app_id}/stop` |
| `POST` | `/apps/{app_id}/restart` |
| `GET` | `/apps/{app_id}/stats` |
| `GET` | `/apps/{app_id}/logs` |
| `GET` | `/apps/{app_id}/permissions` |
| `POST` | `/apps/wizard` |
| `POST` | `/apps/upload-image` |
| `POST` | `/apps/upload-manifest` |
| `POST` | `/apps/install-package` |
| `GET` | `/apps/install-progress/{task_id}` |

See [App Reference](./0-app-reference.md) for manifest fields. Install, start, stop, and restart are different state transitions; automation should check each result and the resulting app state.

### 5.2 Containers and images

| Method | Path |
|:---|:---|
| `GET` | `/containers` |
| `GET` / `DELETE` | `/containers/{id}` |
| `GET` | `/containers/{id}/stats` |
| `GET` | `/containers/{id}/logs` |
| `GET` | `/containers/{id}/logs/stream` |
| `GET` | `/containers/{id}/logs/ws` (WebSocket) |
| `POST` | `/containers/{id}/start` |
| `POST` | `/containers/{id}/stop` |
| `POST` | `/containers/{id}/restart` |
| `GET` | `/containers/{id}/exec/ws` (WebSocket) |
| `GET` | `/images` |
| `POST` | `/images/pull` |
| `DELETE` | `/images/{image}` |

Container operations are operational interfaces. Do not mix container IDs, image names, and app IDs; check image dependencies before deletion.

## 6. Files, logs, storage, and network

### 6.1 Files and terminal

| Method | Path |
|:---|:---|
| `GET` / `DELETE` | `/files` |
| `GET` / `POST` | `/files/content` |
| `POST` | `/files/upload` |
| `GET` | `/files/download` |
| `POST` | `/files/batch-download` |
| `POST` | `/files/batch-delete` |
| `POST` | `/files/mkdir` |
| `POST` | `/files/rename` |
| `GET` | `/terminal/ws` (WebSocket) |

File operations are restricted to server-configured allowed roots. Use approved absolute paths even for downloads and renames, and review the target set before delete or batch-delete calls.

### 6.2 Logs and SSH

| Method | Path |
|:---|:---|
| `GET` / `POST` | `/ssh/config` |
| `GET` | `/ssh/status` |
| `GET` | `/ssh/logs` |
| `GET` | `/logs/services` |
| `GET` | `/logs/files` |
| `GET` | `/logs/content` |
| `GET` | `/logs/download` |
| `GET` | `/logs/stream/ws` (WebSocket) |
| `POST` | `/debug-logs/export` |
| `GET` | `/debug-logs/services` |
| `GET` | `/debug-logs/files` |

### 6.3 Storage, network, and device information

| Method | Path |
|:---|:---|
| `GET` | `/storage/disks` |
| `POST` | `/storage/mount` |
| `POST` | `/storage/unmount` |
| `POST` | `/storage/format` |
| `GET` / `POST` | `/network/config` |
| `GET` | `/network/interfaces` |
| `GET` / `PUT` | `/device-info` |
| `GET` | `/device-info/factory` |
| `POST` | `/device-info/factory` |

`POST /storage/format`, `POST /network/config`, and device-information writes change device state. Automation should add permission isolation, parameter validation, and rollback behavior.

## 7. Monitoring, processes, event logs, and the development workbench

### 7.1 Monitoring and processes

| Method | Path |
|:---|:---|
| `GET` | `/monitor/summary` |
| `GET` | `/monitor/cpu` |
| `GET` | `/monitor/memory` |
| `GET` | `/monitor/disk` |
| `GET` | `/monitor/network` |
| `GET` | `/monitor/snapshot` |
| `GET` | `/monitor/gyro/attitude` |
| `GET` | `/processes` |
| `GET` | `/processes/{pid}` |
| `POST` | `/processes/{pid}/kill` |

`kill` is high risk. Inspect the process command and owner before confirming that it is not a platform-critical service.

### 7.2 Event logs

| Method | Path |
|:---|:---|
| `GET` / `POST` / `DELETE` | `/event-logs` |
| `GET` | `/event-logs/statistics` |
| `GET` | `/event-logs/templates` |

### 7.3 Settings, app store, and development workbench

| Method | Path |
|:---|:---|
| `GET` / `POST` | `/settings` |
| `DELETE` | `/settings/{key}` |
| `GET` | `/config/jobs` |
| `GET` | `/config/jobs/{id}` |
| `GET` | `/store/apps` |
| `GET` | `/store/apps/{key}` |
| `POST` | `/store/apps/{key}/install` |
| `GET` | `/store/categories` |
| `GET` | `/store/tags` |
| `GET` / `POST` | `/store/installs` |
| `GET` / `PUT` / `DELETE` | `/store/installs/{app_id}` |
| `GET` | `/dev/base-images` |
| `GET` / `POST` | `/dev/projects` |
| `GET` / `PUT` / `DELETE` | `/dev/projects/{id}` |
| `POST` | `/dev/projects/{id}/upload` |
| `POST` | `/dev/projects/{id}/source` |
| `GET` | `/dev/projects/{id}/files` |
| `GET` / `POST` | `/dev/projects/{id}/file` |
| `GET` | `/dev/projects/{id}/builds` |
| `POST` | `/dev/projects/{id}/build` |

## 8. WebSocket usage

| Endpoint | Use |
|:---|:---|
| `/events/stream` | Event Bus real-time events |
| `/h264/{stream_id}` | H.264/MSE video |
| `/audio/stream` | Audio stream |
| `/audio/talk` | Two-way audio |
| `/terminal/ws` | Web terminal |
| `/logs/stream/ws` | Log stream |
| `/containers/{id}/logs/ws` | Container log WebSocket |
| `/containers/{id}/exec/ws` | Container exec WebSocket |

These endpoints are authenticated routes under `/api/v1`. When a browser cannot set a normal header on a native WebSocket constructor, use the authentication mechanism supported by the deployed version and handle expiry, disconnects, and reconnects. Event WebSocket semantics are in [Event Integration](./5-event-integration.md).

## 9. Source, Swagger, and change checks

- [neoruntime `main.go`](https://github.com/camthink-ai/neoruntime/blob/main/platform/platform-api/server/main.go) — route registration and authentication boundaries
- [OpenAPI `swagger.yaml`](https://github.com/camthink-ai/neoruntime/blob/main/docs/api/swagger.yaml) — request parameters and response schemas
- [App Reference](./0-app-reference.md) — app manifests and container permissions
- [Event Integration](./5-event-integration.md) — Event Bus and event WebSocket

Platform routes evolve with the engineering repository. If the device Swagger, source, and this page differ, use the device Swagger for request/response schemas, the version-matched `main.go` for route registration, and update this page during the upgrade review.
