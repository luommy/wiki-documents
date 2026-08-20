---
description: Complete NE503 RESTful API reference covering all HTTP endpoints — system management, AI models, event bus, device control, app management, container management, media configuration, system monitoring, and storage management — including authentication and WebSocket real-time communication interfaces.
keywords: [NE503 API, RESTful API, HTTP interface, WebSocket, device control API, model management API, app management API]
tags: [API reference, NE503, RESTful, HTTP interface, developer]
---

# RESTful API Reference

The Platform API is the HTTP gateway for the NE503. It is built on Go + Gin (data storage SQLite / GORM), proxies all backend services (AI Runtime, Event Bus, Device Control, App Manager, camera-daemon, etc.) via a gRPC connection pool, and supports WebSocket real-time communication (event streams, video streams, container logs, web terminal). The overall layered platform architecture, service topology, and startup dependencies are covered in [System Architecture](../../3-software-guide/0-system-architecture.md).

---

## 1. Overview

The Platform API is the HTTP gateway for the NE503. Built on Go + Gin, it uniformly proxies all backend gRPC services (AI Runtime, Event Bus, Device Control, App Manager, etc.) and supports WebSocket real-time communication (event streams, video streams, container logs, web terminal).

| Item | Description |
|:---|:---|
| Endpoint prefix | `/api/v1` |
| Base URL | `http://<device_ip>:8080` |
| Swagger UI | `/swagger/` (interactive docs, try it directly in the browser) |
| OpenAPI spec | `/api/v1/swagger.yaml` |
| Protocols | HTTP + WebSocket |
| Response format | JSON |

> The paths in the following sections omit the `/api/v1` prefix. Prepend it when sending real requests, e.g. `/api/v1/system/info`. The login endpoint `/api/login` is the exception — it lives outside this prefix.

---

## 2. Authentication

The Platform API **enables authentication by default**. Every request must carry a valid token (except public endpoints), otherwise it returns `401`.

**Log in to obtain a token:**

```bash
# The login endpoint is independent of the /api/v1 prefix
curl -X POST http://<device_ip>:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

```json
// Response
{"code":0,"message":"Success","data":{"token":"Bearer <token>","username":"admin"}}
```

> The factory default account is `admin` / `password`. **Change it for production deployments** (via `POST /system/password` or the config keys `auth.username` / `auth.password`). The returned token is a static Bearer key used as the credential for subsequent requests.

**Token transmission methods:**

| Method | Format | Use case |
|:---|:---|:---|
| HTTP Header | `Authorization: Bearer <token>` | REST API requests (recommended) |
| HTTP Header | `X-API-Key: <token>` | REST API requests |
| Query Parameter | `?token=<token>` | WebSocket connections (when the browser cannot set custom headers) |

**Public endpoints (no auth required):**

- `POST /api/login` — Login
- `GET /system/health` — Health check

> Note: Authentication is enabled out of the factory. For third-party integration, you must first log in to obtain a token, then carry that token on all other endpoint calls.

---
## 3. System Management

The system management endpoints handle device login authentication, system information queries, firmware upgrade (OTA), time and NTP configuration, and other low-level operations. They are intended for integrators performing device onboarding, health monitoring, and remote maintenance.

### 3.1 Login & System Information

| Method | Path | Description |
| --- | --- | --- |
| POST | `/login` | Submit username and password to obtain an access token; the real path is `POST /api/login` (independent of the `/api/v1` prefix). Public endpoint, no auth required. |
| GET | `/system/health` | Health check. Public endpoint, no auth required; commonly used for liveness probes. |
| GET | `/system/info` | Get device system information (model, version, hardware, etc.). |
| GET | `/system/stats` | Get system runtime statistics (CPU, memory, disk, and other resource usage). |

Login is the prerequisite for calling any protected endpoint: the token returned on success must be sent as `Authorization: Bearer <token>` in subsequent request headers. The request body is JSON containing the `username` and `password` fields (both required).

### 3.2 Password & Restart

| Method | Path | Description |
| --- | --- | --- |
| POST | `/system/password` | Change the backend login password. |
| POST | `/system/restart` | Trigger a device system reboot. |

The change-password request body is JSON and takes `old_password` (old password, optional) and `new_password` (new password, required). `/system/restart` has no request body; the device will reboot after the call, during which services are briefly unavailable — implement reconnection and retry accordingly.

### 3.3 Firmware Upgrade (OTA)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/system/ota/detect` | Check whether a new OTA firmware update is available. |
| GET | `/system/ota/status` | Query the current OTA upgrade progress and status. |
| POST | `/system/ota/install` | Upload a firmware package and install it. `multipart/form-data` field name is `firmware`. |
| POST | `/system/ota/parse` | Parse firmware file information only — does not install. `multipart/form-data` field name is `firmware`. |
| POST | `/system/ota/install-from-path` | Install firmware from an absolute local path on the device (operations use). |

Typical upgrade flow: first call `/system/ota/detect` to check for updates or `/system/ota/parse` to validate a local firmware package → upload and install via `/system/ota/install` → poll `/system/ota/status` to track progress. `install-from-path` takes a body `{ "path": "<absolute path of the firmware file on the device>" }` and is intended for operations scenarios where the firmware has already been pushed to the device. Third-party integrations typically just use the upload method.

### 3.4 Time Management

| Method | Path | Description |
| --- | --- | --- |
| GET | `/system/time` | Get the current system time of the device. |
| POST | `/system/time/set` | Manually set the system time. |
| GET | `/system/time/config` | Get time configuration (whether NTP is enabled, NTP server, etc.). |
| PUT | `/system/time/timezone` | Set the device timezone. |
| GET | `/system/time/timezones` | List the timezones supported by the device. |
| PUT | `/system/time/ntp` | Configure NTP settings (enable/disable, server address). |
| POST | `/system/time/ntp/sync` | Trigger an immediate NTP time synchronization. |

The manual time-set request body is `{ "datetime": "<RFC3339 timestamp>" }`, e.g. `2024-01-01T12:00:00Z`. The timezone-set request body is `{ "timezone": "Asia/Shanghai" }`; valid values can be fetched first via `/system/time/timezones`. The NTP configuration body is `{ "enabled": true, "server": "ntp.aliyun.com" }`; once NTP is enabled you can call `/system/time/ntp/sync` to synchronize immediately instead of waiting for the next scheduled sync.

---

## 4. AI Models & Inference

This group of endpoints is intended for developers who need to manage inference models directly — registering, uploading, querying, and unloading model files (.hef, .onnx, .bin, .tflite, etc.) within the device AI runtime, and retrieving overall runtime statistics. These are generally not called from application code; they are used during the model preparation stage.

### 4.1 Model Management

| Method | Path | Description |
| --- | --- | --- |
| GET | `/ai/models` | List all registered models. |
| POST | `/ai/models` | Register a new model (points to a model file path already on the device). |
| POST | `/ai/models/upload` | Upload a model file and auto-register it with the runtime. |
| GET | `/ai/models/{model_id}` | Query detailed information for a specific model. |
| DELETE | `/ai/models/{model_id}` | Unload (unregister) a specific model. |
| GET | `/ai/models/{model_id}/apps` | Query the list of apps currently using a given model. |

Request body notes:

- `POST /ai/models`: JSON body; `model_path` is required (absolute path of the model file on the device, e.g. `/data/aipc/models/yolov8n.hef`); `model_id` is optional and used to customize the model identifier — the system generates one if omitted.
- `POST /ai/models/upload`: `multipart/form-data` upload; the required field is `model` (the model file itself; supports `.hef`, `.onnx`, `.bin`, `.tflite`); optional fields include `model_id`, `model_type` (hef/onnx/tflite), `variant`, `threshold` (detection threshold), `max_detections` (max detection count), and other inference parameters. Use this when the model file is not yet on the device.

### 4.2 Runtime Statistics

| Method | Path | Description |
| --- | --- | --- |
| GET | `/ai/stats` | Get overall statistics for the AI runtime (number of registered models, load status, etc.). |

Before deleting a model, call `GET /ai/models/{model_id}/apps` first to confirm no apps are referencing it, to avoid disrupting running inference tasks.

---

## 5. App & Container Management

Manages AI applications running on the device and their underlying containers: install, start/stop, view logs and runtime status, and pull/delete container images. Intended for third-party integrators who need to remotely deploy or operate their own applications.

### 5.1 App Management

Applications are described by an `app.yaml` manifest. Each app has a unique `app_id` and maps to one or more underlying containers.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/apps` | List all installed apps. |
| POST | `/apps` | Install an app from an `app.yaml` manifest. |
| GET | `/apps/{app_id}` | View details of a specific app. |
| DELETE | `/apps/{app_id}` | Uninstall a specific app. Use `keep_logs` to retain logs. |
| POST | `/apps/{app_id}/start` | Start a specific app. |
| POST | `/apps/{app_id}/stop` | Stop a specific app. Use `timeout` to control the graceful-shutdown wait. |
| POST | `/apps/{app_id}/restart` | Restart a specific app. |
| GET | `/apps/{app_id}/stats` | View app runtime statistics (CPU, memory, etc.). |
| GET | `/apps/{app_id}/logs` | View app logs. Supports `max_lines` and `follow`. |
| GET | `/apps/{app_id}/permissions` | View the permissions granted to an app. |
| POST | `/apps/wizard` | Quickly install an app via the wizard (just provide app_id/name/image). |
| POST | `/apps/upload-image` | Upload a container image file to the device. |

Differences between the two install entry points:
- `POST /apps`: You already have a complete `app.yaml` manifest. Request body `{ manifest_path, image_path? }`; `manifest_path` is required, `image_path` is optional (used for offline install of a local image).
- `POST /apps/wizard`: No need to write a manifest in advance. Request body `{ metadata: { id, name }, image, config? }` (the actual device requires `metadata.id` / `metadata.name` plus a top-level `image`, which differs slightly from the spec annotation). `config` is a custom application configuration object — suitable for a third-party system to quickly push an app.
- `POST /apps/upload-image`: `multipart/form-data` upload; field name `file`. Used to import an image offline when the device has no internet access.

### 5.2 Container Management

Directly manipulates underlying containers (generally managed indirectly through the app layer; use only for troubleshooting or special scenarios).

| Method | Path | Description |
| --- | --- | --- |
| GET | `/containers` | List containers. Supports filtering by `state`, `search`, and pagination. |
| GET | `/containers/{id}` | View container details. |
| DELETE | `/containers/{id}` | Delete a specific container. |
| GET | `/containers/{id}/stats` | View container resource usage. |
| GET | `/containers/{id}/logs` | View container logs. `tail` controls the number of lines returned. |
| GET | `/containers/{id}/logs/stream` | Stream container logs in real time (SSE, `text/event-stream`). |
| POST | `/containers/{id}/start` | Start a container. |
| POST | `/containers/{id}/stop` | Stop a container. |
| POST | `/containers/{id}/restart` | Restart a container. |

Common filter parameters for `GET /containers`: `state` accepts `running` / `stopped` / `all`; `search` does a fuzzy match by name; `page` / `page_size` paginate (defaults 1 / 20).

### 5.3 Container Images

| Method | Path | Description |
| --- | --- | --- |
| GET | `/images` | List local container images. |
| POST | `/images/pull` | Pull an image from a registry. Request body `{ image }`. |
| DELETE | `/images/{image}` | Delete a local image. |

### 5.4 Container Real-time Logs & Terminal (WebSocket)

Two WebSocket endpoints are used for real-time interaction. Pass the authentication token via the `token` query parameter when connecting:

| Method | Path | Description |
| --- | --- | --- |
| GET | `/containers/{id}/logs/ws` | Stream container logs in real time (WebSocket). `tail` controls the initial line count. |
| GET | `/containers/{id}/exec/ws` | Interactive container terminal (WebSocket). Supports `cols` / `rows` / `command`. |

`exec/ws` runs `/bin/sh` by default; terminal size defaults to 80×24. Generally only used for on-site debugging; third-party integrations rarely use it directly.

---

## 6. App Store

The App Store is used to browse and search for installable AI applications and to manage records of apps already installed on the device. Third-party integrators typically use the store endpoints to find a target app, trigger the install, and then use the install-management endpoints to query runtime status or uninstall. The `/api/v1` prefix has been removed from the paths below.

### 6.1 Store Catalog

Browse the list of apps in the store along with their categories and tags.

| Method | Path | Description |
|------|------|------|
| GET | `/store/apps` | List apps in the store. Supports filtering by category, keyword search, featured flag, and pagination. |
| GET | `/store/apps/{key}` | Get details for a specific app (`key` is the unique app identifier in the path). |
| GET | `/store/categories` | List app categories, for filtering and navigation. |
| GET | `/store/tags` | List app tags, for multi-dimensional retrieval. |

Common query parameters for `GET /store/apps`: `category`, `search`, `featured`, `page`, and `page_size` — all optional.

### 6.2 Install & Installed-app Management

Install apps from the store and maintain the local install records on the device.

| Method | Path | Description |
|------|------|------|
| POST | `/store/apps/{key}/install` | Install the specified app from the store (`key` is the app identifier). |
| GET | `/store/installs` | List installed-app records on the device. |
| POST | `/store/installs` | Create an install record. |
| GET | `/store/installs/{app_id}` | Get install details for a specific installed app. |
| PUT | `/store/installs/{app_id}` | Update the install record for a specific app. |
| DELETE | `/store/installs/{app_id}` | Delete the install record for a specific app (uninstall and clean up the record). |

Request body notes:

- **`POST /store/apps/{key}/install`**: The optional body can specify `version` (version number) and `config` (app initialization configuration object). If omitted, the store default version and configuration are used.
- **`POST /store/installs`**: The body must provide `app_id` and `name` (both required), with optional fields `version`, `image`, and `store_app_id`, for manually recording an install.
- **`PUT /store/installs/{app_id}`**: Used to write back install status. Updatable fields include `status`, `container_id`, `pid`, `message`, and `config`, useful for tracking the runtime state of a container or process.

For day-to-day third-party integration, you typically only need `POST /store/apps/{key}/install` to trigger the install and then `GET /store/installs/{app_id}` to poll status. The `POST/PUT/DELETE /store/installs` group is lower-level record maintenance and is generally not called directly.

---

## 7. Device Control

This group is used to remotely operate the NE503 hardware peripherals and lens, and to query/maintain basic device information. Suitable for third-party platforms integrating fill lights, infrared night vision, PTZ zoom, and GPIO peripherals.

### 7.1 Device Status & Information

| Method | Path | Description |
| --- | --- | --- |
| GET | `/device/status` | Query the overall device runtime status. |
| GET | `/device-info` | Get device information (model, version, name, etc.). |
| PUT | `/device-info` | Modify the device name. |

### 7.2 Light Source & Night Vision

| Method | Path | Description |
| --- | --- | --- |
| POST | `/device/light` | Set the white fill-light brightness (0–100). |
| POST | `/device/ir-led` | Toggle the infrared fill light on/off. |
| POST | `/device/ir-cut` | Switch the IR-CUT filter mode (auto/day/night). |

### 7.3 Lens & PTZ

| Method | Path | Description |
| --- | --- | --- |
| POST | `/device/ptz` | Unified PTZ and lens control (pan/tilt/zoom/focus/preset/stop). |
| POST | `/device/zoom` | Control zoom speed independently. |
| POST | `/device/focus` | Control focus speed independently. |
| POST | `/device/autofocus` | Toggle autofocus on/off. |

### 7.4 GPIO

| Method | Path | Description |
| --- | --- | --- |
| POST | `/device/gpio` | Write the logic level of a specified GPIO pin. |
| GET | `/device/gpio/{pin}` | Read the logic level of a specified GPIO pin. |

**Request body notes**

- Light sources: `/device/light` takes `level` (integer 0–100); `/device/ir-led` takes a boolean `status`; `/device/ir-cut` takes `mode` (`auto` / `day` / `night`).
- The unified PTZ entry `/device/ptz` distinguishes actions via `action` (`pan` / `tilt` / `stop` / `preset` / `zoom` / `focus`), then pairs each action with `direction` + `speed` (pan/tilt), `zoom_speed` / `focus_speed` (positive/negative indicates direction), or `preset_id` (1–255). If you only need single zoom or focus control, you can use `/device/zoom` or `/device/focus` directly — both take a single `speed` (-100 to 100; negative = zoom out / near focus, positive = zoom in / far focus).
- GPIO: writing takes `pin` (pin number) and a boolean `value`; reading puts the pin number in the `{pin}` path parameter.
- Rename device: `PUT /device-info` takes `device_name`. Only letters, digits, underscores, and hyphens are allowed.

---

## 8. Media & Video Streams

This group of endpoints is used to view the list of video streams, subscribe to real-time H.264 video, and adjust low-level camera parameters (ISP image, encoder, RTSP, AI overlay, OSD subtitles, etc.). Intended for third-party integrators doing secondary video integration or image tuning.

### 8.1 Video Stream Query & Real-time Subscription

| Method | Path | Description |
|------|------|------|
| GET | `/streams` | List the video streams (encode channels) currently available on the device with their basic information. |
| GET | `/streams/{stream_id}` | Query detailed information for a specific stream (resolution, codec, frame rate, etc.). |
| GET | `/h264/{stream_id}` | Subscribe to the real-time H.264 raw bitstream for a specific stream. Continuously pushes video frames over WebSocket. |

### 8.2 Camera Configuration (Overall)

| Method | Path | Description |
|------|------|------|
| GET | `/media/config` | Read the full configuration of the camera daemon. |
| POST | `/media/config` | Update the daemon configuration via partial overlay and apply immediately. The body only needs to include the fields you want to change. |

### 8.3 Image & Encoding

| Method | Path | Description |
|------|------|------|
| PUT | `/media/image` | Adjust ISP image parameters (brightness, contrast, saturation, sharpness; each 0–100). |
| PUT | `/media/encoder` | Adjust the encoding parameters of a specific stream (bitrate, frame rate, GOP, etc.). Must specify `stream_name`. |
| PUT | `/media/encoder/reconfig` | Perform a full encoder rebuild for a specific stream (can change resolution, switch codec h264/h265, bitrate, frame rate, GOP). A heavier change than `/media/encoder` above. |

### 8.4 RTSP, Overlay & OSD

| Method | Path | Description |
|------|------|------|
| PUT | `/media/rtsp` | Enable or disable the built-in RTSP service (body `{ "enabled": true/false }`). |
| PUT | `/media/ai-overlay` | Configure the AI detection result overlay (enable/disable, show labels/confidence, line thickness). |
| PUT | `/media/osd` | Configure on-screen display (OSD). Supports adding text and timestamp overlays per stream; set position, font size, color, and enabled flag. |

### 8.5 Key Request Body Notes

- `PUT /media/image`: Pass the four integers `brightness` / `contrast` / `saturation` / `sharpness`, each ranging from 0 to 100. Send only the fields you want to adjust.
- `PUT /media/encoder` and `PUT /media/encoder/reconfig`: Must include `stream_name` to target a stream. The former does light parameter tuning (`bitrate_bps` / `framerate` / `gop`); the latter does a full rebuild and can change `width` (64–4096), `height` (64–2160), `codec` (`h264` or `h265`), `fps`, etc. It is more expensive — use it when you need to switch codec or resolution.
- `POST /media/config`: A partial overlay of the overall configuration. The body is a JSON object with any subset of fields — suitable for batch updates without dealing with each dedicated endpoint.

### 8.6 Usage Suggestions

For third-party real-time preview, first call `GET /streams` to get the available stream IDs, then establish a WebSocket via `GET /h264/{stream_id}` to pull the H.264 raw bitstream and decode/play it yourself. If you prefer a standard protocol, call `PUT /media/rtsp` to turn on the built-in RTSP service and pull the stream from any RTSP player. Overlays (detection results, timestamp watermarks) are rendered on the device side via the `ai-overlay` and `osd` endpoints — no client-side drawing required.

---

## 9. Event Bus & Event Logs

This group is for third-party integrators who need to receive device events in real time or retrieve historical event records. The Event Bus provides a publish/subscribe real-time event channel, while Event Logs persistently store events generated during device operation for filtered retrieval and statistics.

### 9.1 Event Bus

The Event Bus is organized around topics. Integrators can subscribe to topics of interest and publish events proactively — suitable for real-time linkage (e.g. receiving an immediate push when a target is detected).

| Method | Path | Description |
|------|------|------|
| GET | `/events/topics` | List all current event topics and their subscriber counts. |
| POST | `/events/publish` | Publish an event to a specific topic. The message is dispatched to all current subscribers. |
| GET | `/events/stream` | Subscribe to a real-time event stream. The connection upgrades to WebSocket and continuously pushes events. |

Request body and connection notes:

- `POST /events/publish` requires `topic` (e.g. `app/detection/result`) and may carry an arbitrary `payload` object as the event content.
- `GET /events/stream` is a WebSocket endpoint. The connection URL looks like `ws://<device_ip>:8080/api/v1/events/stream?token=<token>`. The token obtained at login must be passed via the `token` query parameter for authentication.

### 9.2 Event Logs

Event Logs persistently archive historical events. They support filtering and paginated queries by category, level, and time range, and provide aggregate statistics for troubleshooting or integration with external monitoring systems.

| Method | Path | Description |
|------|------|------|
| GET | `/event-logs` | Filter and paginate event logs by category, level, time range, and keyword. |
| POST | `/event-logs` | Write an event log entry, for the system or integrators to record key events proactively. |
| DELETE | `/event-logs` | Clean up historical logs by retention days to free up storage. |
| GET | `/event-logs/statistics` | Get aggregate statistics for event logs (e.g. counts per level/category). |

Key parameter notes:

- `GET /event-logs` supports the query parameters `category`, `level`, `start_time` / `end_time` (time range, ISO 8601 format), `search` (keyword search), `limit` (page size, max 1000, default 50), and `offset` (pagination offset, default 0). The response includes an `entries` list plus a `total` field for pagination calculation.
- `POST /event-logs` body requires `event_type`, `source`, and `message`; optional fields are `level`, `category`, `user`, and an arbitrary `data` extension field.
- `DELETE /event-logs` body requires `days` (retention days, 1–365); logs older than that are purged. This is an operations-oriented action; third-party integrations generally only need the query and statistics endpoints.

---

## 10. System Monitoring, Storage & Network

This group is used to query device runtime status (CPU, memory, disk, network), manage external storage devices, and view and modify network configuration. Suitable for third-party integrators building operations monitoring dashboards or performing remote maintenance.

### 10.1 System Resource Monitoring

Query the current usage of various device resources. All are read-only GET endpoints, usable for health checks and load inspections.

| Method | Path | Description |
|------|------|------|
| GET | `/monitor/summary` | Get a system resource overview (a summary view of key indicators like CPU, memory, and disk). |
| GET | `/monitor/cpu` | Get CPU usage details. |
| GET | `/monitor/memory` | Get memory and swap usage. |
| GET | `/monitor/disk` | Get the usage of each disk partition. |
| GET | `/monitor/network` | Get send/receive traffic statistics for network interfaces. |

### 10.2 Storage Management

List available disks and partitions, and perform mount, unmount, and format operations on block devices. Request body notes for mutating operations:

| Method | Path | Description |
|------|------|------|
| GET | `/storage/disks` | List currently available disks and their partition information. |
| POST | `/storage/mount` | Mount a block device to a specified directory. |
| POST | `/storage/unmount` | Unmount a previously mounted disk. |

- Mount (`/storage/mount`): Provide `device` (e.g. `/dev/sda1`) and the mount target `target` (e.g. `/mnt/sda1`); `device` is required.
- Unmount (`/storage/unmount`): Only the previously mounted `target` path is required.

### 10.3 Network Configuration

Query or modify network interface configuration, and switch between DHCP and static IP modes.

| Method | Path | Description |
|------|------|------|
| GET | `/network/config` | Get the current network configuration (IP, subnet mask, gateway, DNS, etc.). |
| GET | `/network/interfaces` | List all network interfaces. |

> Writing network configuration (DHCP/static switching, changing IP) is a device-initial-deployment operation. Third-party integrations generally only read `GET /network/config` and `/network/interfaces` for monitoring. If you need to change configuration, do so through the device operations workflow to avoid losing connectivity by misconfiguring the subnet.

---

## 11. Internal & Debug Endpoints

The following endpoints are for device operations and troubleshooting and **are not part of the third-party integration API** — integrators generally do not need to call them (app logs are available via `/apps/{app_id}/logs`). See the full definitions in Swagger (`/swagger/`):

| Category | Endpoint | Description |
|:---|:---|:---|
| File system | `/files/*` | Arbitrary file read/write, upload/download, delete, batch operations. |
| Processes | `/processes/*` | List processes and send signals (`kill`) to processes. |
| System logs | `/logs/*` | View and download systemd service logs. |
| Debug logs | `/debug-logs/*` | Package and export service and log files (tar.gz). |
| Web terminal | `/terminal/ws` | Root-level interactive shell (WebSocket). |
| Dev workbench | `/dev/*` | Web IDE projects and build pipeline. |

> These endpoints carry high privileges (arbitrary file operations, process signals, root shell) and third-party integrations should not depend on them. For production deployments, reduce the attack surface via firewalls or additional authentication.

---

## 12. SSH & System Settings

Read-only SSH service status queries and custom key-value configuration, for operations monitoring or for integrators to persist business parameters.

### 12.1 SSH Status

| Method | Path | Description |
|:---|:---|:---|
| GET | `/ssh/config` | Query the current SSH service configuration (port, auth method, etc.). |
| GET | `/ssh/status` | View the SSH service runtime status. |
| GET | `/ssh/logs` | Get SSH login records, for security auditing. |

> Writing SSH configuration (changing the port, toggling root login, etc.) is a device security hardening operation and is not part of the integration API. Adjust it through the device operations workflow.

### 12.2 System Settings

A generic key-value configuration store for persisting custom parameters (e.g. business configuration such as detection thresholds). Read and write whole entries by key.

| Method | Path | Description |
|------|------|------|
| GET | `/settings` | Get all custom settings. |
| POST | `/settings` | Add or update a setting entry (write value by key). |
| DELETE | `/settings/{key}` | Delete a specific setting entry by key. |

The write body is an object containing `key` (required, the setting name) and `value` (the value as a string), e.g. `{"key":"detection_threshold","value":"0.75"}`.

## 13. Response Format

All API responses use a unified JSON envelope.

**Success response:**

```json
{
  "code": 0,
  "message": "Success",
  "data": { ... }
}
```

**Error response:**

```json
{
  "code": 2000,
  "message": "Unauthorized",
  "error": {
    "detail": "Invalid or missing authentication token",
    "type": "auth"
  }
}
```

| Field | Type | Description |
|:---|:---|:---|
| `code` | int | `0` indicates success; non-zero indicates an error. |
| `message` | string | Status description. |
| `data` | object | Response data on success (absent on error). |
| `error` | object | Details on error (carried only for business errors like 401/1001; a route 404 does not carry it; absent on success). |
| `error.detail` | string | Human-readable error description. |
| `error.type` | string | Error category (e.g. `auth`). |

Common error codes: `1001` invalid request format, `2000` authentication failed, `3002` internal error, `4000` resource not found, `404` route not found.

---

## 14. WebSocket Interfaces

All WebSocket endpoints pass the authentication token via `?token=<token>`.

| Path | Purpose | Data direction |
|:---|:---|:---|
| `/events/stream` | Real-time event stream push | Server → Client |
| `/h264/{stream_id}` | H.264 video stream push | Server → Client |
| `/containers/{id}/logs/ws` | Real-time container log stream | Server → Client |
| `/containers/{id}/exec/ws` | Interactive container terminal | Bidirectional |
| `/terminal/ws` | Web terminal (SSH) | Bidirectional |
| `/logs/stream/ws` | Real-time service log stream | Server → Client |

---

## 15. Related Documentation

- [Platform Architecture](../../3-software-guide/0-system-architecture.md) — NE503 four-layer architecture, service responsibilities and source pointers
- [App Development](./0-app-reference.md) — Container app development reference
- [SDK Reference](./1-sdk-reference.md) — Complete Python SDK API reference
- [Video and Imaging](../../2-user-guide/1-media-and-image.md) — RTSP integration and NVR/VMS connection
- [Event Integration](./5-event-integration.md) — Practical Event Bus integration
