---
id: parking-lot
title: Parking Lot
description: 以 NE503 停车场场景为例，演示车辆检测、深度防伪和车牌识别的多模型应用如何配置、部署、验证并发布事件。
keywords: [NE503, Parking Lot, 停车场, 车辆检测, 车牌识别, 深度防伪, Event Bus, Cookbook]
tags: [NE503, 应用开发, Cookbook, 车辆检测, 事件集成]
---

# Parking Lot

本文以 `camthink-ai/neoruntime-apps` 中的 Parking Lot Showcase 为例，完整走通一个多模型边缘 AI 应用：从 `app.yaml` 权限和模型声明开始，部署容器，打开应用 Web 界面，并从 Event Bus 验证车辆检测事件。

> **验证记录**：本文的运行结果来自 NE503 测试设备 `192.168.93.50`，最近一次复测为 2026 年 8 月 18 日固件（此前 8 月 7 日部署的 ai-runtime 存在推理回归，单发推理成功率仅约 6%，8 月 17 日验证时车辆检出断续为 0–2 辆；8 月 18 日固件修复后复测，推理零失败、车辆持续检出 6–8 辆）。应用通过 `sub.raw` 取流。历次测试画面均未识别出车牌，也未触发防伪告警，因此文中不会把车牌识别写成已通过的结果。

## 1. 目标

完成本文后，你可以：

- 部署 Parking Lot Showcase，并在浏览器打开应用 Web 界面；
- 了解车辆检测、深度防伪和车牌识别在同一应用中的调用关系；
- 通过 `parking/vehicles`、`parking/plates` 和 `parking/alerts` 主题接收应用事件；
- 用设备上的实时画面、模型状态和 WebSocket 事件确认应用确实在运行，而不是只确认容器已经启动。

本文是一个可复现的项目实录，不是四个模型的通用接口参考。需要了解 REST、WebSocket、MQTT 桥接和认证格式时，请参阅[事件集成](../3-reference/5-event-integration.md)。

## 2. 模型与数据链路

### 2.1 应用使用的模型

应用清单声明并在启动时注册以下四个模型：

| 模型 ID | 用途 | 输入格式与尺寸 | 本次验证状态 |
|:---|:---|:---|:---|
| `yolov5m_vehicles` | 检测车辆 | RGB，1920 × 1080 | 成功检测车辆 |
| `scdepthv3` | 根据深度结果辅助判断防伪 | RGB，320 × 256 | 已注册并参与流水线 |
| `license_plate_det` | 检测车牌区域 | RGB，416 × 416 | 已注册；本次画面未产生车牌结果 |
| `plate_recognition` | 识别车牌字符 | NV12，320 × 48 | 已注册；本次画面未产生车牌结果 |

模型文件由应用从设备模型目录读取：

```text
/data/aipc/models/detection/yolov5m_vehicles.hef
/data/aipc/models/depth/scdepthv3.hef
/data/aipc/models/detection/tiny_yolov4_license_plates.hef
/data/aipc/models/ocr/paddle_ocr_v5_mobile_recognition_nv12.hef
```

应用清单中的 `allow_register_model: true` 允许应用在启动时向 AI Runtime 动态注册自己需要的模型。如果设备的模型列表中暂时看不到 `license_plate_det` 或 `plate_recognition`，不要先把它判断为代码错误：先检查应用是否已启动，再查看应用日志中的模型注册结果和模型文件路径。

### 2.2 从视频到事件

数据链路可以简化为：

```text
NE503 摄像头
    ↓
sub.raw 原始帧
    ↓
Parking Lot 应用的捕获线程
    ├─ yolov5m_vehicles → 车辆框与置信度
    ├─ scdepthv3         → 深度防伪分数
    └─ 车牌检测 → 车牌识别 → 车牌文本
    ↓
应用 Web UI（MJPEG + SSE）
    ↓
Event Bus
    ├─ parking/vehicles
    ├─ parking/plates
    └─ parking/alerts
```

`app.yaml` 只授予应用 `sub.raw` 视频权限，并将 `STREAM_ID` 默认设为 `sub`。源码使用独立的预览和推理媒体客户端；推理线程会根据模型输入尺寸探测可用流，不能把 `main`、`sub` 或 `third` 直接当成用户必须修改的固定值。只要清单权限、设备流和模型输入尺寸匹配，应用即可完成取流和推理。

## 3. 配置文件

### 3.1 应用清单

以下是与本案例直接相关的 `showcases/parking-lot/app.yaml` 片段：

```yaml
spec:
  image: parking-lot:1.0.0

  permissions:
    video:
      - sub.raw

    inference:
      models:
        - yolov5m_vehicles
        - scdepthv3
        - license_plate_det
        - plate_recognition
      max_qps: 25
      max_concurrent: 4
      allow_register_model: true

    events:
      publish:
        - parking/vehicles
        - parking/plates
        - parking/alerts
      subscribe:
        - system/*

    network:
      mode: host

  env:
    - name: STREAM_ID
      value: "sub"
    - name: TARGET_FPS
      value: "20"
    - name: VEHICLE_MODEL
      value: "yolov5m_vehicles"
    - name: DEPTH_MODEL
      value: "scdepthv3"
    - name: PLATE_DET_MODEL
      value: "license_plate_det"
    - name: PLATE_REC_MODEL
      value: "plate_recognition"
    - name: HD_PREVIEW_ENABLED
      value: "0"
```

几个关键字段的作用如下：

| 字段 | 作用 | 配错时的表现 |
|:---|:---|:---|
| `video: sub.raw` | 授予应用读取子码流原始帧的权限 | 应用无法取得推理帧，日志出现媒体或权限错误 |
| `inference.models` | 声明应用需要的模型 | 未声明或路径不存在时，模型注册失败 |
| `allow_register_model` | 允许应用启动时动态注册模型 | 设为 `false` 时，应用不能按自身配置补注册模型 |
| `max_qps` / `max_concurrent` | 限制应用可使用的推理资源 | 配额过低时吞吐下降或请求排队 |
| `events.publish` | 声明应用可发布的主题 | 主题未声明时，发布权限不足 |
| `network.mode: host` | 让应用 Web UI 使用设备网络命名空间 | 外部访问端口和端口映射方式会改变 |

### 3.2 预览模式

当前出货固件中的 `platform-api` 只监听设备内部的 `127.0.0.1:8080`。应用的 HD MSE 预览会把浏览器指向 `ws://<设备IP>:8080/api/v1/h264/main`；外部浏览器无法访问这个回环地址，页面会出现黑色预览区，而且当前实现没有自动回退到 MJPEG。

因此，本案例固定使用：

```yaml
- name: PLATFORM_API_PORT
  value: "8080"
- name: HD_PREVIEW_ENABLED
  value: "0"
```

此时 Web UI 使用应用自己的 MJPEG 端点 `http://<设备IP>:8090/stream`。等 HD 地址经 nginx `:443` 暴露为 `wss://`，或应用增加可靠的失败回退后，再重新启用 HD 预览。`PLATFORM_API_TOKEN` 只能在部署时通过运行环境注入，不能把真实 token 写进清单或源码。

## 4. 核心代码

### 4.1 注册模型

应用启动时遍历 `MODEL_DEFS`，把四个 HEF 注册到 AI Runtime。`yolov5m_vehicles` 还带有对应的后处理配置，用来选择正确的 YOLO 后处理函数；只把模型文件复制到设备而不注册正确的后处理配置，可能导致张量名称不匹配或没有检测框。

核心逻辑可以概括为：

```python
for model_id, model_def in MODEL_DEFS.items():
    infer_client.register_model(
        model_path=model_def["path"],
        model_id=model_id,
        owner_id=Config.get_app_id(),
        model_type=model_def.get("register_type", model_def["type"]),
        model_variant=model_def.get("variant"),
    )
```

实际源码会先查询已注册模型、跳过不需要重复注册的模型，并在失败后重试。上面的片段用于说明调用关系，不应替代仓库中的完整实现。

### 4.2 发布业务事件

流水线完成一帧处理后，应用将结果发布到三个业务主题：

```python
if result.vehicles:
    event_client.publish("parking/vehicles", [
        {
            "bbox": [float(c) for c in vehicle.bbox],
            "class": vehicle.class_name,
            "confidence": round(float(vehicle.confidence), 3),
        }
        for vehicle in result.vehicles
    ])

if result.plates:
    event_client.publish("parking/plates", [
        {
            "bbox": [float(c) for c in plate.bbox],
            "plate": plate.text,
            "confidence": round(float(plate.confidence), 3),
        }
        for plate in result.plates
    ])
```

防伪告警只在深度分析产生告警时发布：

```json
{
  "type": "spoof_detected",
  "bbox": [120.0, 80.0, 420.0, 360.0],
  "vehicle_class": "vehicle",
  "reason": "depth score below threshold",
  "score": 0.018
}
```

车辆事件的实际载荷是数组，示例为：

```json
[
  {
    "bbox": [120.0, 80.0, 420.0, 360.0],
    "class": "vehicle",
    "confidence": 0.82
  }
]
```

### 4.3 应用 Web UI

应用默认在 `8090` 端口启动 Web UI，主要端点如下：

| 端点 | 用途 |
|:---|:---|
| `/` | Parking Lot Monitor 页面 |
| `/stream` | MJPEG 实时画面 |
| `/api/stats` | 帧率、推理耗时和资源统计 |
| `/api/events` | 页面使用的 SSE 事件流 |
| `/api/alerts` | 当前防伪告警历史 |
| `/api/plates` | 车牌截图和识别结果 |

应用页面的 SSE（`/api/events`）只服务于当前 Web UI；对接外部业务系统时，应订阅设备 Event Bus 的 WebSocket 或使用设备内部的 SDK 桥接程序，不要把页面 SSE 当成平台级事件接口。

## 5. 部署步骤

### 5.1 获取应用

有两种方式：

- **使用 Release bundle**：从 `neoruntime-apps` 的 Release 下载 `parking-lot-latest-arm64.tar.gz`，解压后得到 `app.yaml` 和 `parking-lot-image.tar`；
- **从源码构建**：克隆 `neoruntime-apps` 和同级的 `neoruntime-sdks`，按照仓库 README 准备 SDK wheel，然后构建 showcase bundle。

从源码构建时使用仓库提供的脚本：

```bash
cd neoruntime-apps/showcases/parking-lot
./build.sh arm64
```

构建前确认 manifest 中已经使用 `HD_PREVIEW_ENABLED: "0"`。不要直接复用仍将 HD 预览设为 `"1"` 的旧 bundle。

### 5.2 安装和启动

把 `app.yaml` 与 `parking-lot-image.tar` 上传到设备临时目录，然后在设备上安装：

```bash
cd /tmp/parking-lot
sha256sum -c SHA256SUMS

aipc-cli app install app.yaml parking-lot-image.tar
```

通过设备 API 启动应用：

```bash
curl -k -X POST \
  "https://<设备IP>/api/v1/apps/parking_lot/start" \
  -H "Authorization: Bearer <会话token>"
```

也可以在 Web 控制台 **App Management → Installed Apps** 中启动。安装成功不等于流水线已经工作，继续执行下一节的三项验证。

### 5.3 打开应用页面

在与设备网络可达的浏览器中打开：

```text
http://<设备IP>:8090
```

成功时应看到 `Parking Lot Monitor` 页面、实时画面和模型统计卡片。若页面能打开但画面是黑色，先检查 `HD_PREVIEW_ENABLED` 是否确实为 `0`，再确认 `/stream` 能持续返回 MJPEG 帧。

## 6. 验证方法

### 6.1 验证页面和实时画面

1. 刷新 `http://<设备IP>:8090`，等待页面完整加载。
2. 确认预览区能看到真实摄像头画面，而不是纯黑区域。
3. 确认页面出现 `Active Models`，并列出四个模型。
4. 将镜头对准车辆，观察 `VEHICLES` 数值和画面中的检测框。
5. 记录 `FPS`、推理耗时和 CPU/NPU 状态；这些数值会随场景、固件和设备负载变化，不能当作固定性能承诺。

2026 年 8 月 18 日固件复测时 `192.168.93.50` 的实际页面结果：

- 预览为真实 MJPEG 画面，页面右上角约 `22 FPS`（历次测试稳定在此水平，此预览帧率与推理吞吐无关）；
- 当前画面检测到 `6–8 vehicles`（8 月 17 日旧固件下同画面仅 0–2 辆且断续，系当时 ai-runtime 推理回归所致，8 月 18 日固件已修复）；
- `Active Models` 列出 4 个模型；
- `PLATES` 为 `0`，`ALERTS` 为 `0`；
- 车辆检测事件可以从 Event Bus WebSocket 收到（8 月 18 日固件复测：推理调用零失败，事件持续产生）；
- 本次画面没有识别出车牌，不能据此宣称车牌 OCR 已通过业务验收。

![Parking Lot Monitor 实时检测界面](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/cookbook/parking-lot/webui-dashboard.png)

### 6.2 验证事件输出

先登录设备获取一次性会话 token，再通过设备的事件 WebSocket 订阅事件：

```bash
curl -k -X POST https://<设备IP>/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password"}'

npx -y wscat --no-check \
  -c 'wss://<设备IP>/api/v1/events/stream?token=<会话token>'
```

将镜头对准车辆后，应能看到 `parking/vehicles`，其载荷包含 `bbox`、`class` 和 `confidence`。只有在画面确实包含清晰车牌并满足模型条件时，才会看到 `parking/plates`；只有深度防伪分数低于阈值时，才会看到 `parking/alerts`。

当前应用的事件服务端固定订阅全部主题，不读取 URL 中的 `topics` 查询参数。验证时不要把“没有 `parking/*` 过滤参数”误认为漏订阅；收到事件后按消息中的 `topic` 字段过滤即可。

### 6.3 验证应用状态和日志

```bash
curl -k https://<设备IP>/api/v1/apps/parking_lot \
  -H "Authorization: Bearer <会话token>"

curl -k "https://<设备IP>/api/v1/apps/parking_lot/logs?tail=200" \
  -H "Authorization: Bearer <会话token>"
```

重点检查：

- 四个模型是否完成注册；
- 是否持续出现 `Pipeline error`、媒体取帧失败或模型超时；
- 应用是否发生重启；
- Web UI 能显示画面但事件为空时，是否只是当前画面没有满足车牌或防伪触发条件。

## 7. 常见错误

| 现象 | 优先检查 | 修复方式 |
|:---|:---|:---|
| Web UI 能打开，但预览区全黑 | `HD_PREVIEW_ENABLED` 是否为 `1`；浏览器是否尝试访问外部 `:8080` | 将清单改为 `HD_PREVIEW_ENABLED: "0"`，卸载并按新清单重新安装；确认 `/stream` 返回 MJPEG |
| 页面显示模型数量为 0 或模型注册失败 | 模型文件路径、模型 ID、`allow_register_model` | 检查 `/data/aipc/models` 下的四个 HEF 和应用日志；确认清单声明了四个模型 |
| 有车辆画面但没有 `parking/plates` | 当前车牌太小、遮挡、角度或光照不满足检测条件 | 换一段包含清晰车牌的画面；不要把空结果当成 OCR 模型未启动 |
| WebSocket 没有收到事件 | token 是否有效、是否使用 `wss://`、是否连到对外 443 | 重新登录获取会话 token；使用 `/api/v1/events/stream`；外部访问不要使用内部 `127.0.0.1:50053` |
| 使用 `topics=parking/*` 仍没有预期过滤结果 | 当前应用事件服务端不读取该查询参数 | 先订阅全量流，再按消息中的 `topic` 过滤 |
| 容器已安装但页面访问失败 | 应用是否已启动、端口 8090 是否可达、`network.mode` 是否为 `host` | 查看应用状态和日志；启动应用；确认访问的是应用端口 `8090`，不是平台内部 `8080` |
| 日志出现 token 401 | 会话 token 已因改密或 platform-api 重启失效 | 重新调用 `/api/login` 获取新会话 token；不要把旧 token 固定写入脚本 |

## 8. 相关文档

- [应用开发工作流](../1-app-development/0-sdk-workflow.md) — 了解 Gen3 B-path 应用结构和构建流程
- [应用参考](../3-reference/0-app-reference.md) — 查看 `app.yaml` 权限、生命周期和容器约束
- [事件集成](../3-reference/5-event-integration.md) — 对接 WebSocket、MQTT 和 HTTP
- [版本兼容性矩阵](../../3-software-guide/5-version-matrix.md) — 核对 OS、平台、SDK 和模型环境
- [故障排查 FAQ](../../5-troubleshooting.md) — 排查 SDK、容器和应用运行问题

---

**文档版本**：v1.0 · **最后更新**：2026-08-18
