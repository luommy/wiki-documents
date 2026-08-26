---
description: NE503 故障排查 FAQ，按设备网络、视频流、AI 模型、应用容器、事件集成、存储、烧录外设和系统服务组织，帮助现场人员先定位现象，再执行最短排查路径。
keywords: [NE503 故障排查, 症状 FAQ, 排障, Troubleshooting, RTSP, WebSocket, 容器, 事件总线, 错误码, 诊断命令]
tags: [NE503, 故障排查, FAQ]
---

# Troubleshooting

先按现象定位，不必从头通读。文中的命令默认在设备 SSH 会话中执行；带 `curl` 的命令需要有效的 Bearer Token。升级、重刷、删除模型和清理文件前，先确认备份与回退方式。

## 先定位

| 现象 | 先看哪里 | 第一项检查 |
|:---|:---|:---|
| Web 控制台打不开 | [设备与网络](#1-设备与网络) | 设备 IP、网段、`ping` 和 HTTPS |
| Web 预览黑屏或 RTSP 无画面 | [视频与流](#2-视频与流) | 码流开关、端口和 `camera-daemon` |
| 模型已加载但没有结果 | [AI 与模型](#3-ai-与模型) | 模型状态、权限、输入尺寸和阈值 |
| 应用安装后退出或反复重启 | [应用与容器](#4-应用与容器) | 应用日志、资源和清单权限 |
| 事件发布成功但接收端无消息 | [事件与集成](#5-事件与集成) | Topic、权限和订阅端连接 |
| 上传失败或磁盘占满 | [存储与磁盘](#6-存储与磁盘) | `/`、`/data` 和日志/core dump |
| 烧录失败或外设无响应 | [烧录与外设](#7-烧录与外设) | 接线、串口和固件流程 |
| 服务启动失败或 Socket 不通 | [系统与服务](#8-系统与服务) | `systemctl`、`journalctl` 和 `/run/aipc` |

## 1. 设备与网络

### 1.1 无法访问 Web 控制台

**现象**：浏览器打不开设备 Web 页面。

按下面顺序检查：

1. 确认电脑与设备在同一网段；默认设备网段为 `10.0.0.x`。
2. 执行 `ping <设备IP>`。不通时先检查网线或 PoE、电脑 IP 和防火墙。
3. 如果设备接入过 DHCP 路由器，到路由器管理页确认当前 IP；地址可能已变化。
4. 用 `https://<设备IP>` 访问，并允许浏览器接受自签名证书。
5. 网络可通但页面仍打不开时，通过 SSH 检查平台服务：

~~~bash
ssh root@<设备IP>
aipc-cli system health
systemctl status platform-api
~~~

### 1.2 忘记 Web 密码

**现象**：无法登录 Web 控制台。

- 仍能登录时，在 Device Info → **Change Password** 修改，或调用 `POST /api/v1/system/password`。
- 测试设备仍使用默认凭据 `admin` / `password` 时，登录后立即修改密码。
- 已修改且遗忘时，`aipc-cli` 没有密码重置命令；联系技术支持或重刷固件。

设备当前没有「恢复出厂」API。重刷固件会达到恢复出厂的效果，执行前备份需要保留的数据。

### 1.3 镜头控制异常

**现象**：对焦、变焦或光圈无响应，或者行为异常。

先确认摄像头服务正常，再查看镜头状态；必要时执行镜头零点复位：

~~~bash
systemctl status camera-daemon
grpcurl -plaintext -d '{}' unix:///run/aipc/device-control.sock aipc.device.DeviceControl/GetLensStatus
grpcurl -plaintext -d '{}' unix:///run/aipc/device-control.sock aipc.device.DeviceControl/LensResetZero
~~~

仍无响应时，问题通常位于镜头电机或 HAL 控制链路。接口定义见源码 `platform/device-control/proto/device.proto`。

### 1.4 串口与 RS-485 通信失败

**现象**：外部 RS-485 设备（例如云台、传感器）无响应。

先分清两个串口：外部 RS-485 的波特率由应用通过 `Rs485Init` 设置；`/dev/ttyS0 @ 921600` 是核心板与接口板 MCU 之间的内部 host-link，不是外设接口。

外设问题按[§7.4 报警输入 / Wiegand / RS-485](#74-报警输入--wiegand--rs-485-运行时问题)排查。重点检查 A/B 极性、共地、供电、波特率、设备地址和协议帧。

### 1.5 浏览器兼容性与降级

| 浏览器 | 最低版本 | 支持程度 | 已知问题 | 处理方式 |
|:---|:---|:---|:---|:---|
| Chrome | 88+ | 完全支持 | — | 优先使用 |
| Edge | 88+ | 完全支持 | — | 可直接使用 |
| Firefox | 78+ | 基本支持 | 不支持 WebCodecs | 使用 MSE 播放 |
| Safari | 14+ | 部分支持 | 不支持 WebCodecs | 自动降级为 MSE |
| 移动端浏览器 | — | 有限支持 | 性能受限 | 改用桌面浏览器 |

优先使用 Chrome 88+ 或 Edge 88+。Safari 的 MSE 降级方案性能可能较低。

### 1.6 WebSocket 访问层失败

| 现象 | 先检查 | 处理 |
|:---|:---|:---|
| 1006 异常关闭 | `platform-api` 和 443 端口 | 检查服务、防火墙和网络 |
| 401/403 | Token 是否过期 | 重新登录获取 Token |
| 黑屏 | WebSocket 是否建立、是否收到 SPS/PPS | 刷新页面，再查服务日志 |
| 花屏或马赛克 | 丢包和解码器 | 换浏览器，检查网络质量 |
| 延迟高 | 网络延迟和缓冲区 | 保证局域网带宽，检查编码 GOP |

Web 预览默认使用 MJPEG。若 HD 预览黑屏，当前已验证的临时处理是为应用设置 `HD_PREVIEW_ENABLED=0`，让预览回退到 MJPEG。平台通过 nginx 以 `wss://` 暴露 H.264 后，才可恢复 HD 默认路径。

## 2. 视频与流

### 2.1 RTSP 拉流失败

**现象**：播放器或拉流程序无法连接 RTSP，或连接后无画面。

按顺序确认：

1. 拉流端与设备在同一网段，且设备 IP 没有因 DHCP 变化。
2. `aipc-cli stream list` 显示目标码流已启用，Web 控制台中的 RTSP 开关已保存。
3. 地址使用 `rtsp://<设备IP>:8554/main`，端口为 `8554`。
4. 网络策略允许访问 8554。
5. 仍失败时检查服务和客户端连接：

~~~bash
systemctl status camera-daemon
journalctl -u camera-daemon -n 50 --no-pager
ffmpeg -rtsp_transport tcp -i rtsp://<设备IP>:8554/main -t 10 -f null -
~~~

`:8554` 当前无认证。能访问设备网络的客户端都可能拉流，生产环境应在网络层隔离。

### 2.2 WebSocket 集成层断连

**现象**：第三方系统接入视频流后频繁断连。

先区分认证失败和运行时断连：401/403 通常是 Token 问题；连接建立后断开，则检查客户端超时、网络波动和服务端日志。

~~~bash
journalctl -u platform-api --since "1 hour ago" | grep -i "websocket\|h264"
wscat --no-check -c wss://<设备IP>/api/v1/h264/main
~~~

客户端重连策略和视频配置见[视频与成像](./2-user-guide/1-media-and-image.md)。

### 2.3 一直处于仿真模式（SIMULATION）无检测

**现象**：应用日志出现 `Running in SIMULATION mode - no actual inference`，检测结果一直为 0。

这是 SDK 在拿不到真实视频流时的降级状态，不代表应用逻辑本身出错。先检查 `camera-daemon` 是否反复崩溃：

~~~bash
ssh root@<设备IP> "systemctl status camera-daemon"
ssh root@<设备IP> "journalctl -u camera-daemon -n 20 --no-pager"
~~~

如果日志包含 `dlopen(/data/aipc/lib/hal/hal-hailo15.so) failed`，通常表示固件缺少 HAL 库，需要重刷包含该库的镜像。摄像头服务恢复后，同一应用才会输出真实检测框。

## 3. AI 与模型

### 3.1 模型导入成功但无检测结果

**现象**：模型已导入，应用显示运行中，但没有检测或推理结果。

按下面五项检查，不要只看 NPU Worker 是否活跃：

1. Models 页或 `aipc-cli model list` 是否显示模型为 Loaded。未加载时先执行扫描，再加载到 NPU。
2. `app.yaml` 的 `permissions.models` 是否声明了实际模型 ID。
3. 阈值是否过高；先降低阈值确认链路能出结果，再逐步调回业务值。
4. 模型输入是否匹配平台固定的 **384×640 NV12** 输出。
5. 应用是否授权了发布原始帧的 `third` 或 `sub` 流；`main` 只发布编码 H.264，不能替代推理输入流。

HEF 的标准路径是放入 `/data/aipc/models/<category>/`，执行 `scan`，再执行 `load`。对应接口为 `POST /ai/models/scan` 和 `POST /ai/models/{id}/load`。

### 3.2 推理报 Model not found

**现象**：日志出现 `Model not found`，或 app-manager 报 `requires model X, but not found`。

应用配置中的模型名必须与设备实际注册名完全一致。先查设备返回的名称，再修改 `app.py` 或 `app.yaml`：

~~~python
from neoruntime_ipc_sdk import InferenceClient, FdMediaClient
print(InferenceClient().list_models())
print(FdMediaClient().list_streams())
~~~

也可用已认证的 API 查询模型：

~~~bash
curl -k https://<设备IP>/api/v1/ai/models \
  -H "Authorization: Bearer <token>"
~~~

### 3.3 阈值过高导致零检出

**现象**：模型和码流正常，但检出数为 0。

在 Models 的 Detail 弹窗或应用配置中暂时降低 confidence threshold。先用较低值确认能检出，再逐步提高，直到误检和漏检达到业务可接受水平。

### 3.4 输入尺寸不匹配

**现象**：日志出现 `byte_size mismatch`，或推理结果异常。

平台前处理固定输出 **384×640 NV12**。使用与该尺寸匹配的 HEF，例如 `hailo_yolov8n_384_640.hef`；不匹配的模型无法在当前输入链路中端到端运行。

### 3.5 推理持续但零帧零事件

**现象**：模型 Loaded、应用 Running、NPU Worker 活跃，但应用侧没有帧和事件，日志也没有明显错误。

应用可能仍挂在已失效的容器 session 上。先看应用的 status 心跳；完全没有心跳时，Worker 活跃并不能证明结果已回推。

需要深入定位时，可观察推理失败返回：

~~~bash
strace -f -p $(pidof ai-runtime) -e trace=sendmsg -s 200 2>&1 | grep "Inference failed"
~~~

看到 `Inference failed: -2814` 等错误后，重启 `ai-runtime`，重新执行模型扫描和加载，再启动应用。若需要区分 NPU 固件和 `ai-runtime` 软件栈，再在停服窗口用 `hailortcli run -t 5 <hef>` 做单独验证。

## 4. 应用与容器

### 4.1 应用安装失败

**现象**：`aipc-cli app install` 或上传安装包失败。

先按错误类型定位：

| 错误方向 | 第一项检查 | 处理 |
|:---|:---|:---|
| 镜像导入或拉取失败 | 网络与镜像源 | 检查外网和安装日志 |
| `app.yaml` 解析失败 | YAML 语法和字段 | 本地运行 `yamllint app.yaml` |
| 权限错误 | 运行用户是否属于 `aipc` 组 | 修正用户权限后重试 |

~~~bash
journalctl -u app-manager -n 100 --no-pager
yamllint app.yaml
~~~

旧的单文件上传接口 `curl -F app=@.aipc` 已失效，使用 upload-image → upload-manifest → install-package 的两步上传流程。

### 4.2 容器启动失败

**现象**：应用安装成功，但启动后立即退出或反复重启。

1. `aipc-cli app logs <app-id>` 查看应用本身的错误。
2. 检查 Dashboard 的内存和存储；再用 `df -h`、`free -h` 确认系统资源。
3. 检查 `permissions` 是否包含应用需要的模型、码流和事件权限。
4. 如果是镜像导入或 containerd 错误，继续看[存储与磁盘](#6-存储与磁盘)。

~~~bash
aipc-cli app logs <app-id>
journalctl -u app-manager --since "1 hour ago" | grep -i "container\|error\|failed"
systemctl status containerd
~~~

### 4.3 健康检查失败

**现象**：应用启动后被 app-manager 标记为不健康。

`app.yaml` 支持 HTTP、执行命令和 TCP 三类探针。先在容器内按同一种方式复现，再根据返回结果修改目标地址、命令或端口：

~~~bash
journalctl -u app-manager | grep -i healthcheck
aipc-cli app exec <app-id> -- /path/to/healthcheck.sh
aipc-cli app info <app-id>
~~~

HTTP 探针用 `curl` 验证，执行型探针用 `aipc-cli app exec`，TCP 探针检查端口监听状态。

### 4.4 实战速查表

| 现象 | 原因 | 处理 |
|:---|:---|:---|
| 构建时 `apk add ... I/O error` | Docker Desktop、buildx 或网络偶发失败 | 重试构建，并检查镜像源 |
| 启动返回 `DeadlineExceeded` | 首次导入镜像超过 10 秒 gRPC 超时 | 等待导入完成后重试启动 |
| 日志不能用 `json.tool` 解析 | 返回的是 NDJSON，每行一个 JSON | 按行解析，不要当数组解析 |
| `curl -F app=@.aipc` 报 JSON 解析错 | 旧单文件上传 API 已失效 | 改用分步上传流程 |

## 5. 事件与集成

### 5.1 事件发布失败

**现象**：应用发布事件时报错，或订阅端收不到消息。

确认三项：

1. `event-bus` 正常运行。
2. Topic 使用 `app/<app_id>/<event>` 格式，例如 `app/person_alert/person_detected`。
3. `app.yaml` 的 `permissions.events.publish` 声明了发布 Topic。

~~~bash
systemctl status event-bus
journalctl -u event-bus -n 100 --no-pager
aipc-cli event publish app/demo/started '{"message":"test"}'
~~~

### 5.2 订阅失败 / 收不到事件

**现象**：订阅端连接成功，但收不到预期事件。

检查订阅 Topic 是否与发布端完全一致，`permissions.events.subscribe` 是否已声明；同时确认订阅端连的是设备上的 Event Bus。隔离网络模式下，应用不能把设备内部总线当作外网服务访问。

~~~bash
systemctl status event-bus
aipc-cli event subscribe "app/<your_app>/*"
~~~

事件当前只通过 WebSocket 实时推送，没有 REST 历史查询端点；`/api/v1/events` 返回 404。服务端收取全量 Topic 后，接收端应根据消息中的 Topic 字段过滤。

### 5.3 Topic 权限与通配符

Topic 按 `/` 分层：

| 写法 | 匹配范围 | 示例 |
|:---|:---|:---|
| `*` | 单层 | `app/demo/*` 可匹配 `app/demo/started`，不能匹配更深层级 |
| `#` | 多层 | MQTT 风格的多层匹配 |

应用发布或订阅的 Topic 必须先写入 `app.yaml` 的 `permissions.events`，否则运行时会拒绝。

## 6. 存储与磁盘

### 6.1 磁盘空间不足

**现象**：Dashboard 显示磁盘过高，应用启动、上传或写日志失败。

先定位占用分区，再处理文件：

~~~bash
df -h / /data
du -sh /data/aipc/* /home/root/* 2>/dev/null | sort -rh | head
~~~

日常优先在 Maintenance → File Manager 清理旧日志、闲置应用、模型和安装包。容器日志持续增长时，调整应用日志策略；占用超过 80% 时考虑使用 microSD 扩展。

### 6.2 containerd 分区错配

**现象**：启动大镜像时报 `parent snapshot sha256:...` 或 `no space`，但大分区仍有空间。

旧版设备的部署根可能位于小根分区 `/opt/aipc`；出厂设备通常把部署根放在大分区 `/data/aipc`。先确认 containerd 的 `root`：

~~~bash
df -h / /data
grep '^root' /etc/containerd/config.toml
~~~

如果 `root` 仍指向小分区，应先备份配置、停止相关服务，再按[部署与运维](./2-user-guide/5-deployment.md)的迁移流程改到 `/data`。迁移完成并确认服务正常后，才清理旧目录；不要直接删除未确认的 containerd 数据。

### 6.3 应用卷目录不存在

**现象**：启动报 `error mounting "/data/aipc/data/<id>" ... no such file or directory`。

`app-manager` 不会自动创建 `app.yaml` 中声明的 host 目录。确认应用 ID 后创建目录：

~~~bash
ssh root@<设备IP> "mkdir -p /data/aipc/data/<app-id> /data/aipc/logs/<app-id>"
~~~

### 6.4 根分区被日志或 core dump 占满

**现象**：上传返回 `no space left`，但应用镜像并不大。

先确认根分区中的大文件：

~~~bash
df -h /
du -sh /data/aipc/* /home/root/* 2>/dev/null | sort -rh | head
~~~

确认文件用途并保留必要日志后，再清理陈旧日志或 `/home/root/*.core`。删除前先导出需要提供给技术支持的日志，避免丢失故障证据。

## 7. 烧录与外设

### 7.1 烧录不通 / 中途失败

**现象**：SPI Flash 烧录引导链失败、超时或中途崩溃。

常见原因是 UART 不稳定、波特率错误、固件包版本不匹配或缺少 `mkenvimage`。按[系统烧录](./3-software-guide/2-system-flashing.md)第 2 节恢复引导链，再按第 3 节重新烧录系统。

### 7.2 升级中断恢复

**现象**：U-Boot TFTP 升级中断电或网络中断，设备无法启动。

按[系统烧录](./3-software-guide/2-system-flashing.md)第 2 节恢复引导链，再按第 3 节重新烧录系统。重新操作前确认供电、网线和 TFTP 文件完整。

### 7.3 U-Boot 无法启动

**现象**：上电后串口无 U-Boot 输出，或卡在引导阶段。

按[系统烧录](./3-software-guide/2-system-flashing.md#2-恢复引导链)恢复引导链。此操作会影响设备启动链，必须使用匹配当前硬件的固件包。

### 7.4 报警输入 / Wiegand / RS-485 运行时问题

外设不工作时，依次检查物理层、应用配置和平台服务：

1. **物理层**：确认供电、端子线序、A/B 极性和共地。
2. **配置层**：确认应用先调用 `Rs485Init`，再使用正确的波特率、地址和协议帧。
3. **服务层**：查看 `device-control` 日志；仍不能定位时收集日志和接线信息。

已确认的能力边界如下，属于当前平台限制，不是配置错误：

| 现象 | 当前原因 | 处理 |
|:---|:---|:---|
| 报警输入触发但没有事件 | 平台层尚无 `EV_ALARM_IN` 消费者 | 当前不可用，等待固件补齐 |
| Web 的 Alarm Input Level 不生效 | 控件只修改本地状态，未接 API；MCU 也没有 AIN_SET 命令 | 当前不可用 |
| Wiegand 无法接收读卡器输入 | 当前路径为 GPIO 纯输出，没有读卡器输入和协议编码 | 只能作为门禁输出 |
| 机内 Pan/Tilt 调用报错 | MCU host-link 协议没有对应 PTZ 命令 | 外部 RS-485 云台由应用实现协议 |
| RS-485 收不到数据 | 初始化、接线、共地或协议帧存在问题 | 按三层顺序排查 |

端子定义见[整机接线](./2-user-guide/8-product-wiring.md)和[接口板端子](./2-hardware-guide/2-aipc-board-connection.md)。

## 8. 系统与服务

本节用于服务级排查。现场问题优先完成前面对应症状域的检查，再进入本节。

### 8.1 通用排查流程

| 顺序 | 看到什么 | 下一步 |
|:---|:---|:---|
| 1 | 命令或页面失败 | 记录时间、错误码和受影响功能 |
| 2 | 服务是否为 `active` | `systemctl status <service>`；不是则看启动日志 |
| 3 | Socket 是否存在 | `ls -la /run/aipc/*.sock`；不存在则查服务进程 |
| 4 | 服务在线但请求失败 | 检查权限、依赖、参数和资源 |

### 8.2 服务启动失败

先看失败服务和启动日志：

~~~bash
systemctl status ai-runtime camera-daemon app-manager event-bus device-control device-discovery platform-api
systemctl --failed
journalctl -u <service-name> -b --no-pager
~~~

服务存在但接口不通时检查 Unix Socket：

~~~bash
ls -la /run/aipc/*.sock
nc -U /run/aipc/ai-runtime.sock
~~~

若 Socket 不存在，先修复对应服务；若权限被拒绝，检查 `/run/aipc` 目录和 Socket 所属用户/组。不要在没有确认服务归属的情况下直接杀进程或删除 Socket。

### 8.3 常见启动问题与 Socket 权限

| 日志或现象 | 第一项检查 | 处理方向 |
|:---|:---|:---|
| 依赖服务未就绪 | `systemctl status <上游服务>` | 先恢复上游服务，再重启当前服务 |
| Socket 被占用 | `ls -la /run/aipc/*.sock`、检查进程 | 确认进程归属后处理残留进程 |
| `permission denied` | Socket 和 `/run/aipc` 权限 | 修正用户/组，避免放宽到所有用户 |
| 二进制或配置不存在 | 服务的 `ExecStart` 和配置路径 | 修复安装包或配置，不要用空文件掩盖错误 |
| YAML 解析失败 | 对应 YAML 文件 | 先备份，再用 `yamllint` 修复语法 |

### 8.4 API 请求失败

| 状态码 | 含义 | 第一项检查 |
|:---|:---|:---|
| 401 | 未认证或 Token 失效 | 重新登录并换 Token |
| 403 | 权限不足 | 检查用户和应用权限 |
| 404 | 路径或资源不存在 | 核对 API 路径和资源 ID |
| 500 | 服务内部错误 | 查看 `platform-api` 日志 |
| 503 | 服务暂不可用 | 检查依赖服务和启动状态 |

### 8.5 日志级别调整

设备实际使用的配置位于 `/data/aipc/etc/*.yaml`；源码仓库 `configs/` 只是模板。需要临时获取更多日志时，先备份配置，调整 `log_level` 后按服务的启动方式重载，并在排查完成后恢复原级别。

~~~bash
journalctl -u ai-runtime --since "1 hour ago" | grep -i error
journalctl -u ai-runtime | grep -E "timeout|connection refused|permission denied"
~~~

常见级别为 `debug`、`info`、`warn`、`error`。生产环境不要长期使用 `debug`，否则日志会快速占满磁盘。

### 8.6 性能监控与资源排查

~~~bash
top -p $(pgrep -f ai-runtime)
free -h
df -h / /data
iostat -x 1 5
~~~

需要进一步确认服务状态时，再查询 AI Runtime、应用和设备控制服务：

~~~bash
grpcurl -plaintext -d '{}' unix:///run/aipc/ai-runtime.sock aipc.inference.InferenceService/GetStats
aipc-cli app info <app-id>
grpcurl -plaintext -d '{}' unix:///run/aipc/device-control.sock aipc.device.DeviceControl/GetDeviceStatus
~~~

## 附录 A 错误码表

以下是 `platform-api` 常见业务错误码；完整定义见源码 `platform/platform-api/handlers/response.go`。

| 错误码 | 含义 | 错误码 | 含义 | 错误码 | 含义 |
|:---|:---|:---|:---|:---|:---|
| 0 | 成功 | 1000 | 未知错误 | 1001 | 请求无效 |
| 1002 | JSON 无效 | 1003 | 缺少参数 | 1004 | 参数无效 |
| 2000 | 未认证 | 2001 | 无权限 | 2002 | Token 已过期 |
| 2003 | Token 无效 | 3000 | 服务不可用 | 3001 | 服务超时 |
| 3002 | 服务错误 | 3003 | gRPC 错误 | 3004 | 数据库错误 |
| 4000 | 资源未找到 | 4001 | 资源已存在 | 4002 | 资源耗尽 |
| 4003 | 操作失败 | 5000 | 模型未找到 | 5001 | 模型加载失败 |
| 5002 | 推理错误 | 5003 | 模型格式无效 | 6000 | 应用未找到 |
| 6001 | 应用安装失败 | 6002 | 应用启动失败 | 6003 | 应用停止失败 |
| 6004 | 应用正在运行 | 6005 | 应用未运行 | 7000 | 设备错误 |
| 7001 | PTZ 错误 | 7002 | 摄像头错误 | 7003 | GPIO 错误 |
| 8000 | 文件未找到 | 8001 | 文件上传失败 | 8002 | 文件删除失败 |
| 8003 | 存储已满 | 8004 | 访问拒绝 | 9000 | SSH 配置错误 |
| 9001 | SSH 服务错误 | 10000 | 进程未找到 | 10001 | 进程终止失败 |

> `DELETE /ai/models/{id}` 可能连带删除模型文件本身。出厂 HEF 若无备份，删除后无法恢复；执行删除前务必确认文件副本。

## 相关文档

- [系统架构 · 平台服务层](./3-software-guide/0-system-architecture.md) — 服务职责与 Socket 关系
- [系统烧录](./3-software-guide/2-system-flashing.md) — 引导链恢复和系统烧录
- [整机接线](./2-user-guide/8-product-wiring.md) — 外设接线与端子定义
- [部署与运维](./2-user-guide/5-deployment.md) — 磁盘、OTA 和回滚
