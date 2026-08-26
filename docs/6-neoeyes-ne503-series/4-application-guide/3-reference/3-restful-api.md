---
description: NE503 RESTful API 参考，按源码整理认证、系统、AI、设备、媒体、应用、文件、存储、网络、运维和 WebSocket 接口。
keywords: [NE503 API, RESTful API, HTTP, WebSocket, 设备控制, AI 模型, 应用管理, 媒体配置]
tags: [API参考, NE503, RESTful, WebSocket, 开发者]
---

# RESTful API Reference

Platform API 是 NE503 的 HTTP 网关。本文按资源组织接口，帮助你先定位端点，再到 Swagger 查看具体请求体和响应 schema。

本文的路径默认省略 `/api/v1` 前缀：例如表中的 `GET /system/info`，实际地址是 `GET https://<设备IP>/api/v1/system/info`。登录 `POST /api/login` 不使用 `/api/v1` 前缀。

## 1. 请求约定

### 1.1 基础地址和认证

| 项目 | 值 |
|:---|:---|
| 基础地址 | `https://<设备IP>` |
| API 前缀 | `/api/v1` |
| Swagger UI | `/swagger/`（以设备实际部署为准） |
| 协议 | HTTP + WebSocket |
| 常规响应 | JSON |

除公开接口外，请先登录，再把返回的访问令牌放入请求头：

```bash
curl -k -X POST https://<设备IP>/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"<username>","password":"<password>"}'
```

```bash
curl -k https://<设备IP>/api/v1/system/info \
  -H 'Authorization: Bearer <token>'
```

源代码注册的公开接口是：

| 方法 | 实际路径 | 用途 |
|:---|:---|:---|
| `POST` | `/api/login` | 登录 |
| `GET` | `/api/v1/auth/public-key` | 登录前获取公钥 |
| `GET` | `/api/v1/system/health` | 健康检查 |
| `GET` | `/api/v1/system/ota/status` | OTA 状态轮询 |
| `GET` | `/api/v1/system/os-upgrade/status` | OS 升级状态轮询 |

`/api/v1/logout` 也由服务端注册，但是否需要客户端显式调用取决于会话管理方式。其余 `/api/v1` 路由默认经过认证中间件。

### 1.2 请求和响应

- JSON 请求使用 `Content-Type: application/json`。
- 文件上传使用接口定义的 `multipart/form-data` 字段。
- 设备重启、升级、格式化、删除模型、删除文件、停止进程等接口会改变设备状态；先在测试设备验证。
- 业务判断不能只看 HTTP 状态码，同时检查响应中的 `code`、`message`、`data` 或 Swagger 定义的业务状态。
- 令牌、密码、API key 和设备地址不要提交到日志或文档仓库。

## 2. 按任务找接口

| 任务 | 资源组 | 先看哪些接口 |
|:---|:---|:---|
| 设备纳管 | system、device-info、network | `/system/info`、`/system/health`、`/device-info`、`/network/config` |
| 模型准备 | ai | `/ai/capabilities`、`/ai/models`、`/ai/models/upload` |
| 应用安装运行 | apps、containers、images | `/apps`、`/apps/{app_id}/start`、`/containers` |
| 相机和码流 | media、streams、h264 | `/media/config`、`/media/status`、`/streams`、`/h264/{stream_id}` |
| 设备外设 | device | `/device/status`、`/device/light`、`/device/lens/*` |
| 实时事件 | events | `/events/topics`、`/events/publish`、`/events/stream` |
| 系统运维 | monitor、processes、logs、files | `/monitor/*`、`/processes`、`/logs/*`、`/files/*` |

## 3. 系统、模型和事件

### 3.1 系统、时间、OTA 和 OS 升级

| 方法 | 路径 |
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
| `GET` | `/system/ota/status`（公开状态查询） |
| `POST` | `/system/os-upgrade/upload` |
| `POST` | `/system/os-upgrade/validate` |
| `POST` | `/system/os-upgrade/install` |
| `GET` | `/system/os-upgrade/status`（公开状态查询） |
| `POST` | `/system/os-upgrade/reboot` |
| `POST` | `/system/os-upgrade/cancel` |
| `DELETE` | `/system/os-upgrade/package` |

升级和重启接口应按“上传/解析或校验 → 执行 → 轮询状态 → 必要时重连”的状态机使用。`install-from-path` 要求设备上的本地绝对路径，不是调用方电脑路径。

### 3.2 AI Runtime

| 方法 | 路径 |
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

模型文件上传、注册、加载和删除不是同一个动作。尤其是 `DELETE /ai/models/{model_id}`，应先确认是否会删除设备上的模型文件以及是否仍有应用使用它，再执行。

### 3.3 Event Bus

| 方法 | 路径 | 用途 |
|:---|:---|:---|
| `GET` | `/events/topics` | 列出主题 |
| `POST` | `/events/publish` | 发布事件 |
| `GET` | `/events/stream` | WebSocket 实时事件流 |

事件的 Topic、payload、认证和 WebSocket 使用边界见 [事件集成](./5-event-integration.md)，这里不重复协议说明。

## 4. 设备、摄像头和音视频

### 4.1 设备控制

| 方法 | 路径 |
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

设备控制接口可能实际改变灯光、镜头、云台、GPIO、RS485 或其他外设。请求前确认权限、硬件能力和停止/复位方式。

### 4.2 码流和媒体配置

| 方法 | 路径 |
|:---|:---|
| `GET` | `/streams` |
| `GET` | `/streams/{stream_id}` |
| `GET` | `/h264/{stream_id}`（WebSocket/MSE 码流） |
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

批量配置导入可能写入多个运行时配置并触发 camera-daemon 重启；热重配置接口则按各自语义执行。修改前先导出配置，确认目标字段和回滚方案。

### 4.3 音频

| 方法 | 路径 |
|:---|:---|
| `GET` | `/audio/capture-devices` |
| `GET` | `/audio/playback-devices` |
| `GET` | `/audio/status` |
| `POST` | `/audio/capture/start` |
| `POST` | `/audio/capture/stop` |
| `PUT` | `/audio/config` |
| `POST` | `/audio/playback/start` |
| `POST` | `/audio/playback/stop` |
| `GET` | `/audio/stream`（WebSocket） |
| `GET` | `/audio/talk`（WebSocket） |

## 5. 应用、容器和镜像

### 5.1 应用管理

| 方法 | 路径 |
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

应用清单字段见 [应用参考](./0-app-reference.md)。安装、启动、停止和重启是不同状态转换，自动化脚本应分别检查返回结果和应用状态。

### 5.2 容器和镜像

| 方法 | 路径 |
|:---|:---|
| `GET` | `/containers` |
| `GET` / `DELETE` | `/containers/{id}` |
| `GET` | `/containers/{id}/stats` |
| `GET` | `/containers/{id}/logs` |
| `GET` | `/containers/{id}/logs/stream` |
| `GET` | `/containers/{id}/logs/ws`（WebSocket） |
| `POST` | `/containers/{id}/start` |
| `POST` | `/containers/{id}/stop` |
| `POST` | `/containers/{id}/restart` |
| `GET` | `/containers/{id}/exec/ws`（WebSocket） |
| `GET` | `/images` |
| `POST` | `/images/pull` |
| `DELETE` | `/images/{image}` |

容器操作属于运维接口。不要把容器 ID、镜像名和应用 ID 混用；删除镜像前确认没有应用依赖它。

## 6. 文件、日志、存储和网络

### 6.1 文件和终端

| 方法 | 路径 |
|:---|:---|
| `GET` / `DELETE` | `/files` |
| `GET` / `POST` | `/files/content` |
| `POST` | `/files/upload` |
| `GET` | `/files/download` |
| `POST` | `/files/batch-download` |
| `POST` | `/files/batch-delete` |
| `POST` | `/files/mkdir` |
| `POST` | `/files/rename` |
| `GET` | `/terminal/ws`（WebSocket） |

文件处理受服务端允许目录限制。即使请求看起来只是“下载”或“重命名”，也应使用设备允许的绝对路径，并在删除、批量删除前复核目标集合。

### 6.2 日志和 SSH

| 方法 | 路径 |
|:---|:---|
| `GET` / `POST` | `/ssh/config` |
| `GET` | `/ssh/status` |
| `GET` | `/ssh/logs` |
| `GET` | `/logs/services` |
| `GET` | `/logs/files` |
| `GET` | `/logs/content` |
| `GET` | `/logs/download` |
| `GET` | `/logs/stream/ws`（WebSocket） |
| `POST` | `/debug-logs/export` |
| `GET` | `/debug-logs/services` |
| `GET` | `/debug-logs/files` |

### 6.3 存储、网络和设备信息

| 方法 | 路径 |
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

`POST /storage/format`、`POST /network/config` 和设备信息写接口会改变设备状态，自动化系统应增加权限隔离、参数校验和回滚策略。

## 7. 监控、进程、事件日志和开发工作台

### 7.1 监控与进程

| 方法 | 路径 |
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

`kill` 是高风险动作；先查询 PID 的命令和归属，再确认不是平台关键服务。

### 7.2 事件日志

| 方法 | 路径 |
|:---|:---|
| `GET` / `POST` / `DELETE` | `/event-logs` |
| `GET` | `/event-logs/statistics` |
| `GET` | `/event-logs/templates` |

### 7.3 设置、应用商店和开发工作台

| 方法 | 路径 |
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

## 8. WebSocket 使用

| 端点 | 用途 |
|:---|:---|
| `/events/stream` | Event Bus 实时事件 |
| `/h264/{stream_id}` | H.264/MSE 视频流 |
| `/audio/stream` | 音频流 |
| `/audio/talk` | 双向语音 |
| `/terminal/ws` | Web 终端 |
| `/logs/stream/ws` | 日志流 |
| `/containers/{id}/logs/ws` | 容器日志 WebSocket |
| `/containers/{id}/exec/ws` | 容器 exec WebSocket |

这些端点均属于 `/api/v1` 下的认证路由。浏览器无法在原生 WebSocket 构造器中自定义普通 Header 时，按部署版本支持的认证方式传递会话信息，并处理过期、断线和重连。事件 WebSocket 的主题语义见 [事件集成](./5-event-integration.md)。

## 9. 源码、Swagger 和变更检查

- [neoruntime `main.go`](https://github.com/camthink-ai/neoruntime/blob/main/platform/platform-api/server/main.go) — 路由注册和认证边界
- [OpenAPI `swagger.yaml`](https://github.com/camthink-ai/neoruntime/blob/main/docs/api/swagger.yaml) — 请求参数、响应 schema 和交互式接口依据
- [应用参考](./0-app-reference.md) — 应用清单和容器权限
- [事件集成](./5-event-integration.md) — Event Bus 和事件 WebSocket

平台路由由工程源码持续演进。若设备实际 Swagger、源码和本文出现差异：请求体和响应以设备 Swagger 为准，路由是否注册以对应版本的 `main.go` 为准，并在升级评审中同步本文。
