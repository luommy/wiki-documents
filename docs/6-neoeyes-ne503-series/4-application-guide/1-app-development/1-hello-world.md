---
id: hello-world
title: Hello World
sidebar_position: 1
description: 从零在 NE503 上跑通第一个容器应用：编写应用 → 构建 ARM64 镜像 → 部署到设备 → 启动验收 → 清理，完整源码在 neoruntime-apps 仓库 examples/hello-world/。
keywords: [NE503, Hello World, 应用教程, 容器应用, 应用部署, 入门, 最小闭环]
tags: [应用开发, NE503, 教程, 入门]
---

# Hello World

本教程用一个最简的 Hello World 应用跑通 NE503 容器应用的**完整闭环**：编写应用 → 构建 ARM64 镜像 → 部署到设备 → 启动验收 → 清理。它不依赖 AI SDK，只在一个循环里每秒打印一条计数日志，用于验证「开发环境 + 部署流程」是否打通——这是后续任何 AI 应用的基础。

完整源码在 `neoruntime-apps` 仓库的 `examples/hello-world/` 目录，本文所有文件与其一致。

:::tip 跳过构建，直接部署
不想自己 build 镜像？下载预编译包 [hello-world.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/hello-world.tar)，解压即得 `app.yaml` 与 `image.tar`，直接跳到 [§4 部署到设备](#4-部署到设备)。
:::

## 1. 前置条件

| 条件 | 验证方法 |
|:---|:---|
| NE503 设备已联网并运行 | 浏览器访问 `https://<设备IP>`，能看到 Web 登录页 |
| 开发机已安装 Docker（>= 20.10） | 终端执行 `docker --version` |
| 开发机能连通设备 | `curl -k -o /dev/null -w "%{http_code}" https://<设备IP>` 返回 `200` |
| 设备登录凭据 | Web 控制台默认 `admin` / `password`（首次登录后请修改） |

:::tip 架构：为什么用 buildx
设备是 **ARM64** 架构。Apple Silicon 开发机同为 ARM64，可原生构建；x86 开发机由 Docker buildx 走 QEMU 模拟，稍慢但功能一致。设备端跑容器用的是内置的 **containerd**，不依赖你开发机上的 Docker——Docker 只负责在你电脑上把镜像构建出来。
:::

## 2. 应用结构

`examples/hello-world/` 下共 4 个文件：

```
hello-world/
├── app.py           # 应用主逻辑
├── app.yaml         # 应用清单（镜像/资源/启动策略）
├── Dockerfile       # 容器构建定义
└── entrypoint.sh    # 调试模式入口（正常启动用不到）
```

**`app.py`** —— 主循环打印带计数的日志，并处理 SIGTERM / SIGINT 优雅退出（平台停止应用时发 SIGTERM，应用应借此结束而不是被杀掉）：

```python
import os, time, signal

class HelloWorldApp:
    def __init__(self):
        self.running = True
        self.app_id = os.environ.get("APP_ID", "hello_world")  # 平台注入
        self.counter = 0
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        self.running = False   # 收到停止信号，跳出主循环

    def run(self):
        while self.running:
            self.counter += 1
            ts = time.strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{ts}] #{self.counter:06d} - Hello World from AIPC!")
            time.sleep(1)
        print(f"[{self.app_id}] Goodbye!")

if __name__ == "__main__":
    HelloWorldApp().run()
```

> 仓库原版还带启动横幅、异常捕获与清理日志，逻辑与上面一致，完整注释版见 [app.py](https://github.com/camthink-ai/neoruntime-apps/blob/main/examples/hello-world/app.py)。

**`app.yaml`** —— 应用清单，声明镜像、资源限制与启动策略。Hello World 不调用平台服务，所以**不需要任何 `permissions`**：

```yaml
apiVersion: v1
kind: Application
metadata:
  id: hello-world
  name: Hello World
  version: 1.0.0
  description: A simple hello world application that prints continuously
  author: AIPC Team
spec:
  image: aipc/hello-world:1.0.0      # 必须与 docker build -t 的 tag 一致
  resources:
    cpu: "10%"
    memory: "32Mi"
  autostart: false
  restart_policy: on-failure
  restart_max_retries: 3
```

**`Dockerfile`** —— 基于 `python:3.11-alpine`。仓库模板预装了一组调试工具，便于进容器排查；不需要可删掉那行 `RUN` 以减小镜像：

```dockerfile
FROM python:3.11-alpine3.19

# 模板预装调试工具（docker exec 进容器排查用），不需要可删除以减小镜像
RUN apk add --no-cache bash curl iputils net-tools procps strace

WORKDIR /app
COPY app.py /app/app.py
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# 用非 root 用户运行
RUN adduser -D -u 1000 appuser && chown -R appuser:appuser /app

ENV PYTHONUNBUFFERED=1
ENV APP_ID=hello_world

# 存活探针：平台按它判断应用是否健康
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python3 -c "import sys; sys.exit(0)" || exit 1

CMD ["python3", "/app/app.py"]
```

**`entrypoint.sh`** —— 正常启动用不到；需要进容器调试时 `docker exec -it <容器> /app/entrypoint.sh bash` 进入交互 shell。

## 3. 构建镜像

在应用目录下构建 ARM64 镜像，导出为 tar，再打包成 `.aipc`：

```bash
cd neoruntime-apps/examples/hello-world

# 1. 构建 ARM64 镜像（--load 载入本地 Docker）
docker buildx build --platform linux/arm64 --load -t aipc/hello-world:1.0.0 .

# 2. 导出镜像为 tar
docker save aipc/hello-world:1.0.0 -o image.tar

# 3. 打包成 .aipc（app.yaml + image.tar 的 zip）
zip hello-world.aipc app.yaml image.tar
```

真实构建产物：

| 产物 | 大小 |
|:---|:---|
| Docker 镜像 | 26.5 MB（磁盘占用 113 MB） |
| `image.tar` | 25 MB |
| `hello-world.aipc` | 25 MB |

> `.aipc` 只是 `app.yaml` + `image.tar` 的 zip 归档包，便于保存分发。部署时用的是包里的 `image.tar` 和 `app.yaml` 两个文件，`.aipc` 本身不参与上传。

:::warning 构建偶发失败？
macOS + Docker Desktop 上 `apk add` 偶尔报 `Failed to create ...: I/O error`。这是 buildx 的已知偶发问题，**重新执行一次构建命令即可成功**。
:::

## 4. 部署到设备

构建完成后手上有 `app.yaml` 与 `image.tar`。三种方式任选，**推荐 Web 控制台**（图形界面、无需 SSH）。

> 用仓库统一构建脚本 `scripts/build_app.sh` 打包 `.aipc` 的，先 `unzip -o hello-world.aipc` 解压出两个文件再操作。

### 4.1 通过 Web 控制台上传（推荐）

1. 浏览器打开 `https://<设备IP>`，用默认凭据 `admin` / `password` 登录。
2. 左侧导航点击 **App Management**，在右上角 **Import** 卡片上点击。
3. 弹出 **Application Setup Wizard**，第一步 **Source** 选择第三种 **Upload Package**（同时接收清单和镜像）。
4. 在 **App Manifest (app.yaml)** 一栏选择本地 `app.yaml`；在 **Container Image** 一栏选择 `image.tar`。

![上传应用包：选择 app.yaml + image.tar](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/web-import-upload-package.png)

5. 点击右下角 **Install**，向导自动完成解析清单 → 导入镜像 → 注册应用，通常 10–15 秒。回到应用列表即可看到 Hello World（初始为 Stopped，下一节启动）。

### 4.2 通过 aipc-cli 命令行部署（备选）

已 SSH 登录设备时，一条命令装好。先把两个文件传到设备：

```bash
scp app.yaml image.tar root@<设备IP>:/tmp/
ssh root@<设备IP>
aipc-cli app install app.yaml image.tar   # 注意此时在设备上的 /tmp 目录执行
```

### 4.3 通过 HTTP API 部署（备选）

适合脚本化 / CI 自动化：登录取 token → 分步上传镜像与清单 → 触发异步安装并轮询进度。

> 旧的单文件上传 `curl -F 'app=@xxx.aipc' /api/v1/apps` 已失效，必须用下面的两步流程。

```bash
# 登录取 token（返回带 "Bearer " 前缀，整串作为 Authorization 头）
curl -k -X POST https://<设备IP>/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 分步上传镜像与清单（字段名均为 file，各返回自己的 path）
curl -k -X POST https://<设备IP>/api/v1/apps/upload-image \
  -H "Authorization: Bearer <token>" -F "file=@image.tar"
curl -k -X POST https://<设备IP>/api/v1/apps/upload-manifest \
  -H "Authorization: Bearer <token>" -F "file=@app.yaml"

# 触发异步安装（传入上面两个 path），用返回的 task_id 轮询到 phase=complete
curl -k -X POST https://<设备IP>/api/v1/apps/install-package \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"manifest_path":"<manifest path>","image_path":"<image path>","force":true}'
curl -k https://<设备IP>/api/v1/apps/install-progress/<task_id> \
  -H "Authorization: Bearer <token>"
```

通常 10–15 秒完成。

## 5. 启动与验收

### 5.1 启动应用

部署后应用处于 Stopped，需手动启动一次。

**方式一：Web 控制台（推荐）** —— 进入 **App Management**，在 Hello World 卡片上点击 **Start**，状态徽章几秒内由 Stopped 切换为 Running。

**方式二：HTTP API**

```bash
curl -k -X POST https://<设备IP>/api/v1/apps/hello-world/start \
  -H "Authorization: Bearer <token>"
```

:::tip 首次启动超时？
首次启动某镜像时平台要把它载入容器运行时，可能超过接口 10 秒超时并返回 `code:6002 DeadlineExceeded`。这**不是错误**——再调用一次（或 Web 上再点一次 Start）即可成功。
:::

### 5.2 在 Web 控制台验收

用浏览器登录 `https://<设备IP>`，从用户视角确认应用运行。Dashboard 中部 **Applications** 区域可见运行中的应用；左侧 **Applications** 里 Hello World 处于 **Running** 并显示实时资源占用；详情页可见应用 ID、版本、运行时长及 Stop / Restart / Uninstall 操作——说明应用已被平台纳管。

![Web 控制台登录页](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/01-login.png)

![Dashboard 仪表盘（Hello World 运行中）](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/02-dashboard.png)

![应用管理页（Hello World Running）](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/03-apps-list.png)

![Hello World 应用详情](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/application-guide/app-development/hello-world/04-app-detail.png)

### 5.3 查看运行日志

日志也可通过接口获取（返回 NDJSON，每行一个 JSON 对象）：

```bash
curl -k "https://<设备IP>/api/v1/apps/hello-world/logs?max_lines=10" \
  -H "Authorization: Bearer <token>"
```

```json
{"timestamp":1781509897838838800,"level":"info","message":"[2026-06-15 07:51:23] #000011 - Hello World from AIPC!"}
{"timestamp":1781509897838892960,"level":"info","message":"[2026-06-15 07:51:24] #000012 - Hello World from AIPC!"}
{"timestamp":1781509897838901400,"level":"info","message":"[2026-06-15 07:51:25] #000013 - Hello World from AIPC!"}
```

计数每秒递增，说明应用稳定运行。

## 6. 停止与清理

验收完成后停止并卸载：

```bash
# 停止
curl -k -X POST https://<设备IP>/api/v1/apps/hello-world/stop -H "Authorization: Bearer <token>"
# → {"data":{"message":"App stopped successfully"}}

# 卸载
curl -k -X DELETE https://<设备IP>/api/v1/apps/hello-world -H "Authorization: Bearer <token>"
# → {"data":{"message":"App uninstalled successfully"}}
```

## 相关文档

- [SDK Workflow](./0-sdk-workflow.md) —— 下一步：把 SDK 装进应用镜像，让应用真正做 AI 推理
- [Person Detection](../2-cookbook/1-person-detection.md) —— 一个用 SDK 的完整真机案例
- [App Reference §2 app.yaml 完整参考](../3-reference/0-app-reference.md#2-appyaml-完整参考) —— `app.yaml` 各字段含义与权限声明
- [故障排查 FAQ](../../5-troubleshooting.md) —— 构建、部署、启动报错
