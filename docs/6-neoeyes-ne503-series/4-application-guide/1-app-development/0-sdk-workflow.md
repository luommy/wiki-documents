---
id: sdk-workflow
title: SDK Workflow
sidebar_position: 0
description: NE503 Python SDK（hailo_ipc_sdk）上手工作流——SDK 是什么、源码在哪、三种方式装进应用镜像、调用范式与权限契约。读完即具备看懂后续教程的 SDK 基础。
keywords: [NE503, Python SDK, hailo_ipc_sdk, SDK 嵌入, 容器应用, build_app.sh, 调用范式]
tags: [应用开发, NE503, SDK, 入门]
---

# SDK Workflow

本篇走一遍「把 NE503 Python SDK（`hailo_ipc_sdk`）用起来」的完整流程：**SDK 是什么 → 源码从哪来 → 怎么装进应用镜像 → 第一次怎么调 → 权限注意什么**。走完这一步，[Hello World](./1-hello-world.md)（部署闭环）和 [Person Detection](../2-cookbook/1-person-detection.md)（真实 AI 应用）就只剩各自的业务细节，不用再回头查 SDK 怎么接。

:::info 阅读顺序
**SDK Workflow（本篇）→ [Hello World](./1-hello-world.md)（部署闭环，不用 SDK）→ [Person Detection](../2-cookbook/1-person-detection.md)（真实 AI 应用，用 SDK）**
:::

## 1. SDK 是什么

`hailo_ipc_sdk` 运行在**应用容器内**，通过 Unix Socket 连平台的 AI Runtime、Event Bus、Device Control 等服务——应用代码不直接碰硬件或推理引擎，只调 SDK 客户端，由 SDK 转发到对应服务。

**关键约束：SDK 不在 PyPI 上，不能 `pip install` 从网上拉。** 源码在 `neoruntime-sdks` 仓库的 `python/hailo_ipc_sdk/` 目录，必须随应用镜像一起带进设备——设备容器运行时没有外网 pip。

每个客户端解决什么问题、怎么选，见 [SDK 参考 §2 模块速览](../3-reference/1-sdk-reference.md#2-每个模块解决什么问题)。

## 2. 拿到 SDK 并装进应用镜像

SDK 在 **neoruntime-sdks** 仓库，示例应用在 **neoruntime-apps** 仓库。把两个仓库 clone 到**同一父目录**下——统一构建脚本默认从旁边的 `neoruntime-sdks` 取 SDK：

```bash
git clone https://github.com/camthink-ai/neoruntime-sdks.git
git clone https://github.com/camthink-ai/neoruntime-apps.git
```

把 SDK 装进镜像有三条路，按你的项目结构选一。

**方式 A：统一构建脚本（推荐，仓库示例应用都用这种）**

`neoruntime-apps` 的 `scripts/build_app.sh` 自动把旁边的 `neoruntime-sdks/python/hailo_ipc_sdk/` 复制进应用目录，`docker buildx` 打进镜像并打包 `.aipc`。无需手动 `pip install`，也不需要联网：

```bash
cd neoruntime-apps
./scripts/build_app.sh examples/person-detection
# 自动：复制 SDK → buildx → save → 打包 .aipc
```

**方式 B：自建项目手动 `COPY`**

应用不在仓库示例结构内时，在 Dockerfile 里把 SDK 拷进去并本地安装：

```dockerfile
COPY hailo_ipc_sdk /app/hailo_ipc_sdk
RUN pip install --no-cache-dir /app/hailo_ipc_sdk
```

**方式 C：打成 wheel 再 `pip install`（适合分发与跨应用复用）**

先打成一个通用 wheel（SDK 纯 Python，产出 `py3-none-any`，与设备 ARM64 架构无关），镜像里只带产物、不带整个源码树：

```bash
cd neoruntime-sdks/python
pip wheel . --no-deps -w dist/     # 产出 dist/hailo_ipc_sdk-<版本>-py3-none-any.whl（版本随 setup.py）
```

```dockerfile
COPY hailo_ipc_sdk-<版本>-py3-none-any.whl /tmp/
RUN pip install --no-cache-dir /tmp/hailo_ipc_sdk-<版本>-py3-none-any.whl && rm /tmp/hailo_ipc_sdk-<版本>-py3-none-any.whl
```

> 无论哪种方式，要点都是 **SDK 必须随镜像带入**。SDK 自带生成好的 protobuf 桩（`python/hailo_ipc_sdk/proto/*_pb2.py`），`import hailo_ipc_sdk` 开箱即用，无需手动生成。

## 3. 调用范式

SDK 所有客户端形态一致：**实例化不用传参**（SDK 自动从平台注入的环境变量读 socket 路径），然后按三类模式调用：

1. **订阅式迭代器**——`for ... in xxx.subscribe(...)` 持续产出结果（推理逐帧、事件、编码流），应用主循环架在它上面；
2. **发布**——`EventClient.publish(topic, payload)` 广播事件，其他应用订阅同一主题联动；
3. **控制**——`DeviceClient.set_white_light(n)` 等直接驱动硬件。

每个客户端的最小骨架代码见 [SDK 示例 §1 选型表](../3-reference/2-sdk-examples.md#1-四类典型模式先选型)。写调用时两个必须记住的坑：

- **名字不能写死**——`stream`/`model` 用设备真实值，先 `list_streams()` / `list_models()` 查再填（见 [SDK 参考 §3.2](../3-reference/1-sdk-reference.md#32-流名与模型名不能写死)）；
- **订阅是阻塞迭代器**——Ctrl-C 打断不了，要做优雅退出（见 [SDK 参考 §3.4](../3-reference/1-sdk-reference.md#34-订阅是阻塞迭代器要做优雅退出)）。

## 4. 权限即契约

SDK 能调什么，**由 `app.yaml` 的 `permissions` 决定**，不是代码里写啥就能调啥。平台按清单做沙箱隔离：未声明的视频流、模型、事件主题或设备控制，SDK 调用时会被平台直接拒绝。所以 `app.py` 里的调用必须与 `app.yaml` 声明一一对应。

各权限字段的含义见 [应用参考 §4 权限模型](../3-reference/0-app-reference.md#4-权限模型)。

## 5. 下一步

- [Hello World](./1-hello-world.md) —— 不用 SDK，先跑通"构建→部署→启动→验收"的完整闭环；
- [Person Detection](../2-cookbook/1-person-detection.md) —— 用 SDK 的真实 AI 应用，含完整代码与设备实测；
- 四类应用模式与仓库完整源码：[SDK 示例](../3-reference/2-sdk-examples.md)；
- 各客户端 API 详情：[SDK 参考](../3-reference/1-sdk-reference.md)；
- 构建部署报错：[故障排查 FAQ](../../5-troubleshooting.md)。