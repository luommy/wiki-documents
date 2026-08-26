---
description: NE503 生产环境安全加固：出厂默认凭据与首次改密、端口暴露面与防护、Web/API Token 管理、应用权限最小化及外网访问方案。
keywords: [NE503 安全, 默认密码, RTSP 风险, SSH 加固, Token 管理, 应用权限, 外网部署]
tags: [用户指南, NE503, 安全, 部署]
---

# Security Hardening

NE503 出厂面向内网快速上手：默认凭据可登录，RTSP 不提供认证。试验台环境可以使用默认配置，但设备交付到生产环境前，必须完成本篇的凭据、网络和应用权限配置。平台隔离与安全模型见开源仓 [security-architecture.md](https://github.com/camthink-ai/neoruntime/blob/main/docs/architecture/security-architecture.md)。

## 1. 出厂默认与首改清单

| 面 | 出厂默认 | 风险 | 首改动作 |
|:---|:---------|:-----|:---------|
| Web / REST API | `admin` / `password` | 弱凭据可完全接管设备 | 登录后立即改密（见 §3） |
| SSH | `root` / `root`，root 可直接登录 | 获得设备完整控制权 | 改密并优先使用密钥登录（见 §3） |
| RTSP `:8554` | **无认证**——网络可达即可拉流 | 画面泄露 | 网络隔离，绝不暴露公网（见 §2） |
| API Token | 登录发放的会话 Token（每次随机）与内置静态集成密钥 | 泄漏后可调用 API | 会话随改密失效；静态密钥须更换（见 §3） |

> 当前固件**不会自动强制**首次登录改密，默认密码会一直有效，直到手动修改。生产部署流程必须把首次登录后的改密记录为交付前检查项，不能因为设备未弹出改密提示而跳过。

## 2. 网络面暴露与防护

设备的主要网络面如下。`:443` 用于管理，`:8554` 用于视频流，`:22` 用于 SSH 运维；应按使用者划分可访问的来源网段，而不是把三个端口一起开放。

| 端口 | 服务 | 认证 | 防护建议 |
|:-----|:-----|:-----|:---------|
| `:443` | Web 控制台 / REST API（TLS，自签证书） | 登录 Token | 仅允许运维网段访问 |
| `:8554` | RTSP 码流 | **无** | 仅允许 NVR 等视频消费端访问 |
| `:22` | SSH | root 密码或密钥 | 限制来源 IP，不使用时在防火墙封禁 |

部署原则：

1. **内网部署**：设备只放入监控内网 / VLAN，不放在公网路由可达的位置；
2. **防火墙**：只放行必要端口与来源，例如仅允许 NVR 访问 8554，仅允许运维机访问 443 和 22；
3. **RTSP 特别处理**：当前固件默认开启 RTSP，且 RTSP 无认证。任何能够访问 8554 的主机都可能拉取画面，因此必须使用 VLAN、ACL 或防火墙限制来源；
4. **绝不直接映射公网**：三个网络面都不具备公网直暴的安全强度（见 §5）。

## 3. 凭据与 Token 管理

### 3.1 通过 Web 控制台修改登录密码

1. 登录 Web 控制台，进入 **Settings → Device Info**。
2. 在页面底部点击 **Change Password**。
3. 在对话框中输入旧密码、新密码，并再次输入新密码进行确认。
4. 点击 **Confirm**。平台服务会自动重启；看到服务恢复后，使用新密码重新登录。

![Change System Password 对话框](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/qs-settings-change-password.png)

对话框中的字段如下：

| 字段 | 填写内容 | 作用 |
|:-----|:---------|:-----|
| **Old Password** | 当前 Web / API 登录密码 | Web 控制台页面会要求填写，用于校验当前凭据 |
| **New Password** | 新密码（页面提示为 8–32 个字符） | 设置新的登录密码 |
| **Confirm Password** | 再次输入新密码 | 防止两次输入不一致 |

改密成功后，原有 Web 登录会话和会话 Token 会失效。若页面因服务重启暂时无法访问，等待服务恢复后重新打开登录页；不要在重启过程中反复提交表单。

### 3.2 通过 API 修改密码

API 使用有效的登录 Token 鉴权。当前接口实测只需发送 `new_password`，不要求在请求体中提供旧密码：

```http
POST /api/v1/system/password
Authorization: Bearer <有效登录Token>
Content-Type: application/json
```

```json
{
  "new_password": "<新密码>"
}
```

请求字段使用 snake_case：`new_password`；不要改写为 `NewPassword` 或 `newPassword`。接口返回成功后，平台服务自动重启，原有会话 Token 失效，需使用新密码重新登录并获取 Token。

> Web 控制台和 API 的输入要求不同：Web 页面显示并要求 **Old Password**、**New Password**、**Confirm Password** 三个字段；API 当前只要求有效会话和 `new_password`。对接脚本必须把 Token 当作密码保管，不要把 Token 写入日志、代码仓库或公开配置。

### 3.3 会话 Token、静态密钥与 SSH

- **会话 Token**：每次登录随机发放。脚本和对接系统应将其视同密码保管；改密或平台服务重启后会失效，调用接口收到 `401` 时应重新登录获取，而不是无限重试旧 Token。
- **静态集成密钥**：设备配置内置固定 API 密钥，`Authorization: Bearer` 和 `X-API-Key` 均可使用。它**不随 Web 密码变化**，且出厂默认值已随开源仓库公开；生产部署前必须通过 SSH 修改设备配置中的 `auth.token_key` 并更换为现场保管的值。更换后同步更新所有对接系统，避免旧密钥继续留在脚本或配置文件中。
- **SSH 密码**：登录 SSH 后执行 `passwd` 修改 root 密码，并优先改用密钥登录、限制来源 IP。Web 控制台没有提供 SSH 服务启停入口；不需要 SSH 时，应在上游防火墙封禁 22 端口。不要直接套用其他 Linux 发行版的 `ssh` 或 `dropbear` 服务命令，除非已按当前设备系统确认服务单元名称。

## 4. 应用与容器权限

应用安装向导的 **Permissions** 页面把模型、码流、事件和设备控制拆成独立权限。安装应用时，应先根据应用实际功能选择权限，再完成安装；不要为了“以后可能用到”而全部勾选。

进入 **Applications → Import**，在 **Application Setup Wizard** 中完成 **Source**、**Basic Info** 和 **Resources** 后，打开 **Permissions**。页面较长，以下两张图按从上到下的顺序展示完整权限区域：

![Application Setup Wizard 的 Permissions 页面上部](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/qs-apps-permissions-top.png)

![Application Setup Wizard 的 Permissions 页面下部](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/user-guide/security-hardening/qs-apps-permissions-bottom.png)

各组权限的配置原则如下：

| 权限组 | 配置原则 |
|:-------|:---------|
| **AI Models Access** | 只授权应用实际调用的模型；同时设置 **Max Inference QPS** 和 **Max Concurrent Inference**，避免应用占满推理资源。除非确有需要，不开启 **Allow Dynamic Model Registration**。 |
| **Video Stream Permissions** | 只授权应用需要读取的码流；不使用视频输入的应用不要授予码流权限。 |
| **Event Permissions** | 只勾选应用确实需要发布或订阅的事件主题；发布和订阅分别控制，不要把两者混为一谈。 |
| **Network Mode** | 默认保持 **Isolated Mode**，使应用处于隔离网络。只有应用确实需要访问外部服务或局域网设备时，才评估并启用 **Host**；启用前应明确它需要访问的地址和端口。 |
| **设备控制** | **Light Control**、**IR Cut Filter**、**PTZ Control**、**Lens Control** 等控制权限按功能逐项授权。只读或只分析画面的应用不应获得控制摄像头的权限。 |

应用还运行在五层沙箱中：Linux 命名空间、能力裁剪、seccomp、cgroups 和只读 rootfs。沙箱限制不能替代权限配置；应用仍只能调用 `app.yaml` 声明并获准的资源。

镜像来源也属于安全边界：只安装自建镜像或官方 [neoruntime-apps](https://github.com/camthink-ai/neoruntime-apps) 仓库发布的 `.aipc` 包。安装前核对包的来源、版本和发布记录，不安装无法确认来源的包。

## 5. 外网远程访问建议

确需从外网访问设备（远程运维、跨网取流）时，**不要暴露设备端口**，应先进入受控内网，或由内网服务完成中转：

| 需求 | 推荐方案 |
|:-----|:---------|
| 远程运维 Web / API | 通过 VPN（站点到站点或客户端）接入内网后访问；或使用带认证的反向代理 |
| 远程取流 | 由内网 NVR / 流媒体服务器转发，而不是让设备 RTSP 直接出公网 |
| 告警上云 | 使用事件总线 → MQTT 桥接的**出站**连接（见[事件集成](../4-application-guide/3-reference/5-event-integration.md)），不为设备开放入站端口 |

## 6. 相关文档

- [部署与运维](./5-deployment.md) — 交付检查清单（含安全基线项）
- [REST API · 认证](../4-application-guide/3-reference/3-restful-api.md) — Token 获取与使用
