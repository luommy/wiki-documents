---
description: NE503 应用清单参考，按工程源码说明 app.yaml 的结构、权限、单容器、多容器、健康检查和插件字段。
keywords: [NE503, app.yaml, 应用清单, 容器, 权限, 多容器, 健康检查]
tags: [应用开发, NE503, 配置参考, 容器]
---

# App Reference

本页只回答一个问题：**应用清单中的字段应该怎么写**。第一次开发请先看 [SDK 工作流](../1-app-development/0-sdk-workflow.md)；需要可运行代码时看 [SDK 示例](./2-sdk-examples.md)。

App Manager 从 `app.yaml` 读取镜像、权限、资源和生命周期配置。未声明的服务权限不会因为代码调用了 SDK 就自动获得。

## 1. 先选择清单模式

| 模式 | 入口 | 适用场景 | 平台访问权限 |
|:---|:---|:---|:---|
| 单容器 | `spec.image` | 大多数 Python/C++ 应用 | 应用直接使用 `spec.permissions` |
| 多容器 | `spec.containers` | 需要拆分主进程和内部服务 | 只有 `role: main` 的容器可声明平台权限 |

### 1.1 最小单容器清单

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

`apiVersion`、`kind`、`metadata.id`、`metadata.name`、`metadata.version` 和单容器的 `spec.image` 是源码校验的最低要求。`kind` 当前接受 `Application`、`ModelService` 和 `BusinessService`。

### 1.2 写配置时的顺序

1. 先确认设备上实际存在的码流和模型名称。
2. 再声明应用真正需要的 `permissions`。
3. 加入资源、环境变量和可写目录。
4. 最后配置启动、健康检查和重启策略。

不要把示例中的 `cam0_main`、`person_v1` 或其他名称当成所有设备都存在的固定值。

## 2. 清单结构

### 2.1 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `apiVersion` | string | 是 | 当前必须是 `v1` |
| `kind` | string | 是 | `Application`、`ModelService` 或 `BusinessService` |
| `metadata` | object | 是 | 应用身份和版本信息 |
| `spec` | object | 是 | 镜像、权限、资源和运行时配置 |

### 2.2 `metadata`

| 字段 | 类型 | 必填 | 说明 |
|:---|:---|:---:|:---|
| `id` | string | 是 | 应用唯一标识 |
| `name` | string | 是 | 显示名称 |
| `version` | string | 是 | 应用版本 |
| `description` | string | 否 | 功能描述 |
| `author` | string | 否 | 作者 |
| `email` | string | 否 | 联系邮箱 |

### 2.3 `spec` 的运行配置

| 字段 | 作用 | 备注 |
|:---|:---|:---|
| `image` | 单容器镜像 | 多容器模式改为在 `containers` 的每个容器中声明 |
| `resources` | CPU、内存限制 | `cpu` 支持如 `50%`、`0.5`；`memory` 支持如 `256Mi`、`1Gi` |
| `permissions` | 平台服务访问范围 | 见第 3 节 |
| `env` | 容器环境变量 | `name` + `value` |
| `volumes` | 宿主机到容器的目录挂载 | 单容器使用 `host`、`container`、`readonly` |
| `autostart` | 系统启动时是否自动启动 | 按部署需求设置 |
| `restart_policy` | 基础重启策略 | `always`、`on-failure` 或 `no` |
| `restart_max_retries` | 基础重启最大次数 | 与 `on-failure` 配合使用 |
| `healthcheck` | 容器健康检查 | 见第 4.4 节 |
| `auto_restart` | 带退避参数的增强重启 | 见第 4.5 节 |
| `security` | 容器安全选项 | 默认保持严格安全设置 |
| `plugin` | 声明本应用提供的能力 | 见第 6 节 |
| `plugin_dependencies` | 声明依赖的插件能力 | 见第 6 节 |
| `dev` | 开发期热更新 | 只用于开发环境 |

## 3. 权限：按代码实际调用声明

权限写在 `spec.permissions` 中。多容器模式下，权限只应写在 `main` 容器；`sub` 容器不能声明平台权限。

### 3.1 视频与推理

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

| 字段 | 含义 | 使用时注意 |
|:---|:---|:---|
| `video` | 允许访问的视频资源名 | 清单中的资源名和 SDK 调用中的 `stream` 值必须按设备实际配置对应；`.raw` 表示原始帧资源 |
| `inference.models` | 允许应用使用的模型 ID | 必须与设备已注册模型一致 |
| `max_qps` | 推理请求速率上限 | 同时约束应用的调用预算 |
| `max_concurrent` | 并发推理上限 | 级联或批量调用时尤其要检查 |
| `allow_register_model` | 是否允许应用注册模型 | 只有确实需要动态注册时才开启 |

推理订阅的实际调用形态见 [SDK 参考](./1-sdk-reference.md)，模型和码流名称不要从文档示例直接复制到生产配置。

### 3.2 事件总线

```yaml
permissions:
  events:
    publish:
      - app/people_counting/*
    subscribe:
      - inference/**
```

`publish` 和 `subscribe` 是两个独立的主题白名单。主题匹配支持精确匹配、`*` 单级匹配和 `**` 多级匹配；主题协议和消息字段统一见 [事件集成](./5-event-integration.md)。

### 3.3 设备控制与 GPIO

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

| 字段 | 控制范围 |
|:---|:---|
| `light` | 白光灯 |
| `ir_cut` | IR-CUT |
| `ptz` | 云台 |
| `lens` | 镜头变焦、对焦和光圈相关能力 |
| `gpio.read` | 允许读取的 GPIO 引脚 |
| `gpio.write` | 允许写入的 GPIO 引脚 |

### 3.4 网络

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

单容器网络权限字段由源码定义为 `mode`、`outbound` 和 `inbound`：

| 字段 | 说明 |
|:---|:---|
| `mode` | `isolated`（默认）或 `host` |
| `outbound` | 隔离模式下允许访问的目标 |
| `inbound` | `host` 模式下暴露的端口 |

这里的 `network.mode` 是单容器权限配置；多容器之间的网络拓扑使用第 5 节的 `spec.networking`，不要混用。

## 4. 单容器运行配置

### 4.1 环境变量

```yaml
env:
  - name: APP_MODE
    value: production
  - name: LOG_LEVEL
    value: INFO
  - name: THRESHOLD
    value: "10"
```

清单值最终作为字符串注入容器。需要在 Python 中作为数字使用时，在应用代码中显式转换；SDK 也会读取 `APP_ID`、`AI_RUNTIME_ENDPOINT`、`EVENT_BUS_ENDPOINT`、`DEVICE_CONTROL_ENDPOINT` 等环境变量。

### 4.2 卷挂载

```yaml
volumes:
  - host: /data/aipc/data/people_counting
    container: /app/data
    readonly: false
  - host: /data/aipc/logs/people_counting
    container: /app/logs
    readonly: false
```

只为持久化数据、日志或模型文件挂载目录。能只读时将 `readonly` 设为 `true`，并避免把整个宿主机目录暴露给应用。

### 4.3 安全设置

```yaml
security:
  no_new_privileges: true
  readonly_rootfs: true
```

两个字段在源码中是可选布尔指针；未显式设置时默认保持严格安全值。只有确有运行时需要时才覆盖默认值，并同步评估应用是否真的需要提权或写根文件系统。

### 4.4 健康检查

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

`type` 可选 `command`、`http` 或 `tcp`。按类型填写对应字段：`command` 使用 `command`；`http` 使用 `path` 和 `port`；`tcp` 使用 `port`。源码字段名是 `timeout_seconds`，不是 Docker Compose 中常见的 `timeout`。

### 4.5 自动重启

```yaml
auto_restart:
  enabled: true
  max_retries: 3
  retry_delay_seconds: 10
  backoff_multiplier: 2.0
  health_check_interval_seconds: 30
```

`restart_policy` 是基础策略；`auto_restart` 负责最大重试、初始延迟、退避倍数和健康检查轮询。两者同时配置时，先确认应用团队实际想要的失败恢复行为，避免重复重启。

## 5. 多容器配置

### 5.1 `main` 与 `sub`

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

每个 `ContainerSpec` 支持 `image`、`role`、`permissions`、`resources`、`env`、`ports`、`command`、`args`、`healthcheck`、`volumes` 和 `security`。工程校验要求每个容器有镜像，并且应用架构中由 `main` 容器提供平台服务访问；`sub` 容器不应声明 `permissions`。

### 5.2 容器网络与启动顺序

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

`networking.mode` 可选 `internal`、`bridge` 或 `host`。`ingress.target` 使用 `容器名:端口`；`lifecycle` 的顺序字段用于表达容器启动和停止依赖。多容器的 `networking` 不等同于单容器 `permissions.network`。

## 6. 开发模式与插件

### 6.1 开发期热更新

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

`dev` 用于本地热更新：`sync` 把开发机目录映射到容器，`reload_signal` 支持 `SIGHUP` 或 `SIGTERM`，`debug_port` 可用于 IDE 调试。发布应用时删除或关闭开发配置。

### 6.2 提供插件能力

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

`transport` 可选 `grpc`、`event` 或 `both`。`proto` 用于 gRPC 能力，`topics` 用于事件能力；依赖字段的源码名称是 `capability`、`min_version` 和 `required`。

## 7. 部署前检查

- `kind`、`metadata` 和镜像模式符合校验规则。
- `video` 中的资源名、`inference.models` 中的模型 ID 已在目标设备确认。
- 代码调用的 Event Bus 主题包含在 `publish` 或 `subscribe` 白名单中。
- 设备控制和 GPIO 权限只为实际使用的能力开启。
- 应用写入的目录都有显式卷挂载；只读目录不开放写权限。
- `healthcheck` 使用源码字段 `timeout_seconds`，并且类型对应的字段已填写。
- 多容器只有一个 `main` 角色，`sub` 容器未声明平台权限。
- 发布版本不带 `dev.enabled: true`，并检查重启策略不会造成反复拉起。

## 8. 相关文档

- [SDK 工作流](../1-app-development/0-sdk-workflow.md) — 从项目创建到部署
- [SDK 参考](./1-sdk-reference.md) — Python SDK 包名、模块和端点
- [SDK 示例](./2-sdk-examples.md) — 推理、事件、设备控制代码
- [RESTful API 参考](./3-restful-api.md) — 设备外部 HTTP 接口
- [事件集成](./5-event-integration.md) — Event Bus 主题和消息协议
