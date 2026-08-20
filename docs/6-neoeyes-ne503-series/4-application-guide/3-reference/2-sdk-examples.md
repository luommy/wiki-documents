---
description: NE503 Python SDK 四类典型应用模式（实时计数、事件告警、设备控制、级联推理）的选型与最小骨架，完整可运行源码在 neoruntime-apps 仓库 examples/ 下，直接抄改即可。
keywords: [NE503, SDK 示例, 应用模式, InferenceClient, EventClient, DeviceClient, 级联推理]
tags: [应用开发, NE503, SDK, 示例]
---

# SDK Examples

本文用 4 个最常见场景演示 `hailo_ipc_sdk` 怎么搭。先看[选型表](#1-四类典型模式先选型)定位你要的模式，再照骨架写。**每个模式的完整可运行源码在 `neoruntime-apps` 仓库 `examples/` 目录下**，直接拿去改，不用在这篇里抄完整代码。

骨架里的 `stream`、`model` 是示例值，部署前先查设备真实值再填（见 [SDK 参考 §3.2](./1-sdk-reference.md#32-流名与模型名不能写死)）。

## 1. 四类典型模式（先选型）

| # | 模式 | 典型场景 | 核心 API | 仓库完整示例 |
|:--|:-----|:---------|:---------|:-------------|
| 1 | 实时推理计数 | 统计画面中各目标的出现次数 | `subscribe()` + `count_by_label()` | [examples/people-counting](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/people-counting/app.py) |
| 2 | 推理 → 事件告警 | 检测到目标时发事件，与其他应用联动 | `subscribe()` + `EventClient.publish()` | [examples/object-detection](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/object-detection/app.py) |
| 3 | 推理 → 设备控制 | 根据检测结果开灯、切日夜 | `subscribe()` + `DeviceClient` | [examples/person-detection](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/person-detection/app.py) |
| 4 | 级联推理（进阶） | 第一次推理的输出裁剪后喂给第二个模型 | `subscribe()` + `infer()` | [examples/face-cascade](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/face-cascade/README.md) |

> 前三种覆盖了绝大多数应用。「订阅推理流」是共性骨架，差异在拿到结果后做什么——计数、发事件、还是控设备。级联推理是最深的一族，先读懂前三种再上。

## 2. 模式一：实时推理计数

每帧都会返回检测结果，用 `count_by_label()` 按标签计数、定时汇总即可：

```python
import time
from hailo_ipc_sdk import InferenceClient

inf = InferenceClient()
report_at = time.monotonic() + 5.0        # 每 5 秒打印一次汇总

for frame_seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    if time.monotonic() < report_at:
        continue

    report_at = time.monotonic() + 5.0
    print(f"seq={frame_seq}: {len(result.objects)} objects")
    for obj in result.objects:
        print(f"  {obj.label} {obj.score:.2f} {obj.bbox.to_xyxy()}")
```

完整版（含阈值过滤、告警事件、优雅退出）见 [examples/people-counting](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/people-counting/app.py) 与 [Person Detection 教程](../2-cookbook/1-person-detection.md)。

## 3. 模式二：推理 → 事件告警

检测到告警条件时通过事件总线广播，其他应用（如仪表板、联动脚本）订阅同一主题处理：

```python
from hailo_ipc_sdk import InferenceClient, EventClient

inf = InferenceClient()
events = EventClient()

for frame_seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    hits = [o for o in result.get_objects_by_label("person") if o.score >= 0.6]
    if hits:
        events.publish(
            f"app/{APP_ID}/person_detected",     # 主题命名：app/<应用ID>/<事件名>
            {"frame": frame_seq, "count": len(hits)},
            persistent=True,                     # 持久化，订阅者后来上线也能收到
        )
```

事件总线的订阅、通配符与权限声明见 [SDK 参考 §3 平台约束](./1-sdk-reference.md#3-平台特有的约束) 和 [事件集成](./5-event-integration.md)；完整联动示例见 [examples/object-detection](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/object-detection/app.py)。

## 4. 模式三：推理 → 设备控制

`DeviceClient` 直接控制硬件外设，检测结果驱动灯光/日夜切换：

```python
from hailo_ipc_sdk import InferenceClient, DeviceClient, IrCutMode

inf = InferenceClient()
device = DeviceClient()

for frame_seq, result in inf.subscribe(stream="sub", model="hailo_yolov8n_384_640"):
    if result.has_person():              # 检测到人：开补光灯、切日间
        device.set_white_light(80)
        device.set_ircut(IrCutMode.DAY)
    else:                                # 无人：关灯、开红外、切夜间
        device.set_white_light(0)
        device.set_ir_led(True)
        device.set_ircut(IrCutMode.NIGHT)
```

灯光、云台、镜头、GPIO 等全部外设接口见 [SDK 参考模块速览](./1-sdk-reference.md#2-每个模块解决什么问题)；完整真机案例（含初始状态读取、超时切换）见 [examples/person-detection](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/person-detection/app.py)。

## 5. 模式四：级联推理（进阶）

第一段订阅的检测结果只是「目标在哪」，很多时候还要对目标区域再做一次推理——人脸检测后再跑关键点，车辆检测后再跑车牌。核心是第一次拿到的 `bbox` 裁剪出小图，用 `infer()` 单帧喂第二段模型：

```python
for frame_seq, result in inf.subscribe(stream="sub", model="<检测模型>"):
    for obj in result.objects:
        crop = frame_crop(obj.bbox)       # 按 bbox 裁剪，实现见仓库完整示例
        second = inf.infer(crop, model_id="<第二段模型>")
        # second.classifications / second.landmarks / ... 处理结果
```

完整实现（含裁剪、结果合并、事件总线输出）见 [examples/face-cascade](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/face-cascade/README.md)。两段模型都要先在设备上导入并查真实模型名，不能写死。

## 6. 把骨架变成真机应用

骨架只是核心逻辑，跑真机还需要构建镜像、声明权限、上传部署：

1. **clone 仓库**（与 SDK 同父目录）：
   ```bash
   git clone https://github.com/camthink-ai/neoruntime-apps.git
   ```
2. **复制最近的示例为起点**：`cp -r examples/<模式> my-app/`，改 `app.py` 的业务逻辑、`app.yaml` 的 `metadata.id`/模型名/权限声明（权限参考 [应用参考 §4 权限模型](./0-app-reference.md#4-权限模型)）。
3. **构建 → 上传 → 启动**：与 Hello World 完全一致，见 [Hello World §3 构建镜像](../1-app-development/1-hello-world.md#3-构建镜像) 与 [§4 部署到设备](../1-app-development/1-hello-world.md#4-部署到设备)。报错排查见 [故障排查 FAQ](../../5-troubleshooting.md)。

## 7. 相关文档

- [SDK 参考](./1-sdk-reference.md) — 模块速览、安装与平台特有约束
- [SDK 工作流](../1-app-development/0-sdk-workflow.md) — 从克隆到部署的开发流程与调用范式
- [应用参考](./0-app-reference.md) — app.yaml 配置、权限模型、部署流程
- [Person Detection 教程](../2-cookbook/1-person-detection.md) — 完整真机案例
- [事件集成](./5-event-integration.md) — 事件总线协议与主题