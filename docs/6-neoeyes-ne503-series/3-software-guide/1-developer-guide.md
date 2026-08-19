---
description: NE503 AIPC 平台开发者指南，涵盖环境搭建、分层构建和常见构建问题。
keywords: [NE503, 开发环境, 构建, Docker, Hailo SDK, 交叉编译]
tags: [平台开发, NE503, 环境搭建, 构建]
---

# Developer Guide

本文档指导你搭建 NE503 AIPC 平台的完整开发环境，并完成从源码到发布包的构建。

## Part A：环境搭建

### 1. 系统要求

| 系统 | 支持程度 | 说明 |
|------|---------|------|
| Ubuntu 20.04+ | 完全支持 | 推荐，所有层级原生可用 |
| macOS (Intel / Apple Silicon) | 支持 | Layer 1/2 原生可用；Layer 3 经 Docker 镜像（arm64 原生，无需 QEMU） |

**硬件：** 最低 4 核 CPU、8 GB 内存、20 GB 磁盘。仅 Go/Web 开发时 4 GB 内存即可。

### 2. 获取源码

源码拆分为三个仓库，按需 clone（应用开发者通常只需后两个）：

```bash
# 平台主仓：平台服务、HAL、Web 控制台、固件构建
git clone https://github.com/camthink-ai/neoruntime.git

# SDK 仓：Python SDK（hailo_ipc_sdk）、C++ SDK、proto 定义
git clone https://github.com/camthink-ai/neoruntime-sdks.git

# 应用仓：示例应用、showcase、应用模板与统一构建脚本
git clone https://github.com/camthink-ai/neoruntime-apps.git
```

> 构建应用时，把 `neoruntime-apps` 与 `neoruntime-sdks` clone 到**同一父目录**下——应用统一构建脚本 `scripts/build_app.sh` 默认从旁边的 `neoruntime-sdks` 取 SDK。

验证平台主仓完整性：

```bash
cd neoruntime && ls Makefile platform/ web/
```

三个仓库的目录结构：

```
neoruntime/               # 平台主仓
├── platform/             # 平台服务（Go + C++）
│   ├── camera-daemon/    #   采集/ISP/编码/RTSP（C++）
│   ├── ai-runtime/       #   AI 推理运行时（C++）
│   ├── device-control/   #   设备外设控制（Go）
│   ├── event-bus/        #   事件总线（Go）
│   ├── app-manager/      #   容器应用管理（Go）
│   ├── platform-api/     #   REST/WebSocket 网关（Go）
│   └── device-discovery/ #   设备发现 CT-Disc（Go）
├── hal_v2/               # HAL v2（C++，当前唯一维护版本）
├── mcu_board_prj/        # MCU 固件工程
├── web/                  # Web 控制台（React + TypeScript）
├── configs/              # 配置模板（platform/、ai/）
├── tools/                # 开发工具（含 aipc-cli）
├── scripts/              # 设备侧脚本（firstboot、healthmon 等）
├── systemd/              # 服务 unit 定义
├── deploy/               # 部署脚本
└── docker/               # Docker 开发环境

neoruntime-sdks/          # SDK 仓
├── python/hailo_ipc_sdk/ # Python SDK（含 protobuf 桩）
├── cpp/                  # C++ SDK
└── proto/                # protobuf 定义

neoruntime-apps/          # 应用仓
├── examples/             # 教程示例（hello-world、person-detection 等）
├── showcases/            # model-showcase、parking-lot、gym-ops
├── templates/basic/      # 应用脚手架
└── scripts/build_app.sh  # 应用统一构建脚本
```

### 3. 安装依赖

NE503 构建系统分为三层：

| 层级 | 内容 | 典型场景 |
|------|------|---------|
| Layer 1 | Go + Node.js + protoc + Python | 平台服务、Web 控制台、SDK 开发 |
| Layer 2 | Layer 1 + CMake + g++ + gRPC C++ | camera-daemon 等原生 C/C++ 组件 |
| Layer 3 | Layer 1/2 + Hailo Yocto SDK（交叉编译） | Hailo-15 HAL 固件构建 |

大多数开发者只需 Layer 1/2。

**完整发布包构建（`pack-release`）必须安装 Layer 3**；仅开发 Go 服务、Web 控制台或 Python SDK 时可跳过。

**如何选择安装方式：**

| 你的情况 | 选择 |
|---------|------|
| 想最快出包 / 不想折腾本机环境 / macOS 用户 | 方式一 Docker（推荐） |
| Ubuntu 本机开发，能联网跑脚本 | 方式二 脚本安装 |
| 脚本失败 / 离线 / 需精确控制版本 | 方式三 手动安装 |

> 方式二是方式三的自动化封装——脚本失败时可退回方式三，对照手动步骤排查。

#### 方式一：Docker 预打包镜像（推荐）

官方发布镜像 `camthink/ne503-dev:v1.0` 已包含三层全部依赖（含 Hailo/Poky SDK，位于 `/opt/hailo-sdk`），开箱即用——这也是仓库 README 推荐的最快出包路径。

镜像为**多平台**（amd64 + arm64），在 Apple Silicon 上自动拉取 arm64 原生版，无需 QEMU 模拟，性能与 Linux 原生一致。

> 仓库 `docker/dev/` 下另有自建镜像 `ne503-dev-env`（轻量版，SDK 运行时挂载）与 `ne503-dev-env-full`（SDK 内置版），需要定制时用。

**拉取镜像：**

```bash
docker pull camthink/ne503-dev:v1.0
```

**创建持久开发容器：**

```bash
docker run -d --name ne503-dev \
  -v $(pwd):/ne503 \
  -w /ne503 \
  camthink/ne503-dev:v1.0 \
  bash -c "sleep infinity"
```

该容器可长期保留、反复使用，无需每次重新创建。后续通过 `docker exec` 使用：

```bash
docker exec -it ne503-dev bash         # 进入容器交互
docker exec ne503-dev make pack-release VERSION=1.0.0   # 在容器内执行构建
```

容器内三层依赖已预装，可直接进入 §6 完整构建。

#### 方式二：脚本安装

项目提供自动化脚本，支持 Ubuntu/Debian（apt）和 macOS（brew），覆盖 Layer 1/2：

```bash
./scripts/setup_env.sh layer1    # Go + Node.js + protoc + Python
./scripts/setup_env.sh layer2    # Layer 1 + cmake + g++ + gRPC C++
```

脚本自动检测已有工具并跳过。首次搭建建议直接运行 `./scripts/setup_env.sh layer2`。

脚本也提供 `layer3` 入口，但**不会自动下载 Hailo SDK**（SDK 为约 2.7 GB 的私有工具链，需联系技术支持获取）——它只打印 SDK 的手动安装指引：

```bash
./scripts/setup_env.sh layer3    # 安装 Layer 2 + 打印 Hailo SDK 手动安装步骤
```

如需完整构建，推荐方式一 Docker 镜像（SDK 已内置）；或按 `layer3` 打印的指引手动安装 SDK，详见方式三。

安装完成后，**确保 `$(go env GOPATH)/bin` 在 PATH 中**（脚本不会自动配置）：

```bash
# macOS
echo 'export PATH="$PATH:$(go env GOPATH)/bin"' >> ~/.zshrc && source ~/.zshrc

# Ubuntu
echo 'export PATH="$PATH:$(go env GOPATH)/bin"' >> ~/.bashrc && source ~/.bashrc
```

#### 方式三：手动安装

<details>
<summary>Ubuntu 20.04+</summary>

**Layer 1：**

```bash
# Go 1.25+
sudo add-apt-repository -y ppa:longsleep/golang-backports
sudo apt-get update -qq && sudo apt-get install -y golang-go

# Node.js 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs && npm install -g pnpm

# protoc + Go 插件
sudo apt-get install -y protobuf-compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Python 3
sudo apt-get install -y python3 python3-pip
```

**Layer 2（在 Layer 1 基础上追加）：**

```bash
sudo apt-get install -y build-essential cmake protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev
```

**Layer 3 — Hailo SDK：**

Hailo Yocto Poky SDK 是 x86_64 Linux 专用交叉编译工具链，用于构建 camera-daemon、ai-runtime 和 HAL v2 固件。

1. 联系 [CamThink 技术支持](mailto:support@camthink.ai) 获取 SDK 安装脚本（文件名格式 `poky-glibc-x86_64-*-aarch64-toolchain-4.0.23.sh`，约 2.7 GB）

2. 安装到 `/opt/poky`：

```bash
chmod +x poky-glibc-x86_64-*-aarch64-toolchain-4.0.23.sh
sudo ./poky-glibc-x86_64-*-aarch64-toolchain-4.0.23.sh -d /opt/poky/4.0.23 -y
```

3. 验证安装：

```bash
ls /opt/poky/4.0.23/environment-setup-armv8a-poky-linux
```

> 手动安装的 SDK 路径为 `/opt/poky/4.0.23`。后续章节命令以 Docker 默认的 `/opt/hailo-sdk` 为例——手动安装者请将其替换为 `/opt/poky/4.0.23`。

</details>

<details>
<summary>macOS</summary>

**Layer 1：**

```bash
brew install go node protobuf
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
npm install -g pnpm
```

**Layer 2（在 Layer 1 基础上追加）：**

```bash
brew install cmake grpc
xcode-select --install
```

**Layer 3 — Hailo SDK（仅 Linux）：**

macOS 无法本机安装 Hailo SDK（x86_64 Linux 专用交叉编译工具链）。**Layer 3 请直接使用 [方式一 Docker 预打包镜像](#方式一docker-预打包镜像推荐)**——镜像为多平台（amd64 + arm64），Apple Silicon 拉取 arm64 原生版，Go/Node/CMake/SDK 交叉编译器全部原生可用，容器内三层全通，无需任何手动 SDK 配置。

</details>

#### 依赖版本一览

| 工具 | 最低版本 | 检查命令 | 层级 |
|------|---------|---------|------|
| Go | 1.25+ | `go version` | L1 |
| Node.js | 22+ | `node --version` | L1 |
| pnpm | 最新 | `pnpm --version` | L1 |
| protoc | 3.12+ | `protoc --version` | L1 |
| protoc-gen-go | 最新 | `which protoc-gen-go` | L1 |
| protoc-gen-go-grpc | 最新 | `which protoc-gen-go-grpc` | L1 |
| Python | 3.8+ | `python3 --version` | L1 |
| CMake | 3.16+ | `cmake --version` | L2 |
| GCC/G++ | 10+ (C++20) | `g++ --version` | L2 |
| gRPC C++ | 1.30+ | `which grpc_cpp_plugin` | L2 |

### 4. 验证环境

Makefile 没有专门的 `env-check` 目标——用逐项命令直接验证关键依赖（也可跳过本节，直接进 §6 构建并按 §8 排查报错）：

```bash
go version          # Layer 1：Go 服务
node --version      # Layer 1：Web 控制台
protoc --version    # Layer 1：proto 编译
cmake --version     # Layer 2：C++ 组件
g++ --version       # Layer 2
ls /opt/hailo-sdk 2>/dev/null || ls /opt/poky 2>/dev/null   # Layer 3：Hailo SDK（仅完整发布包需要）
```

各命令有版本输出即对应层就绪。Layer 3 缺失仅影响完整发布包构建（`pack-release`），不影响 Go 服务和 Web 控制台开发。

### 5. Python SDK 与 IDE 配置

> 以下命令在开发环境内执行：Docker 用户先 `docker exec -it ne503-dev bash` 进入容器，本机用户在项目根目录执行。

#### Python SDK（开发模式）

Python SDK 在独立的 `neoruntime-sdks` 仓库：

```bash
cd ../neoruntime-sdks/python
pip3 install -e ".[dev]"
```

> 报错 `error: externally-managed-environment`（Ubuntu 24.04+、macOS Homebrew Python）时改用 venv：
>
> ```bash
> cd ../neoruntime-sdks/python
> python3 -m venv .venv && source .venv/bin/activate
> pip install -e ".[dev]"
> ```
>
> 安装完成后用 `deactivate` 退出；后续每次开发前 `source .venv/bin/activate` 重新激活即可。

#### IDE 推荐

VS Code + 扩展：

- Go — `golang.go`
- Python — `ms-python.python`
- C/C++ — `ms-vscode.cpptools`
- CMake Tools — `ms-vscode.cmake-tools`
- Protocol Buffers — `bufbuild.vscode-buf`

## Part B：版本构建

### 6. 完整构建

构建产出 `build/release/aipc-hailo15-<version>.tar.gz` 发布包，包含平台服务、HAL 库、Web 控制台和部署脚本。

#### 容器内构建（推荐，全平台）

使用方式一创建的 `ne503-dev` 容器执行，Ubuntu / macOS Intel / Apple Silicon 通用：

```bash
docker exec ne503-dev bash -c \
  'source /opt/hailo-sdk/environment-setup-armv8a-poky-linux && \
   make pack-release SDK_PATH=/opt/hailo-sdk VERSION=1.0.0'
```

```plaintext
# 预期输出（阶段进度，省略单文件编译细节）
==> Compiling proto (inference / device / event / camera / app / ...)
==> Building device-control (CGO_ENABLED=0)
==> Building event-bus / app-manager / platform-api / device-discovery / os-updater
==> Building Web Console
==> Building Python SDK
=== Layer 1 complete: proto + Go services + web + Python SDK ===
==> Building HAL v2 [platform=hailo15]
==> Building camera-daemon / ai-runtime (C++) / aipc-cli
==> Building tools (shm-reader, nv12-to-jpeg)
=== Layer 2 complete ===
==> Building MCU firmware          # 默认连带构建（BUILD_MCU_FW=0 可跳过）
=== Packaging release [1.0.0, platform=hailo15]
=== Release Package Ready ===
File:   build/release/aipc-hailo15-1.0.0.tar.gz
```

> 手动安装环境（方式三）下，SDK 路径为 `/opt/poky/4.0.23`，将上述命令中的 env 脚本和 `SDK_PATH` 替换为该路径即可。

#### 验证构建产物

确认二进制为 ARM aarch64 架构（容器内无 `file` 命令，用 `readelf`）：

```bash
docker exec ne503-dev bash -c \
  'readelf -h build/output/device-control | grep Machine'
# 预期输出: Machine: AArch64
```

`build/output/` 下所有产物（Go/C++ 服务、`aipc-cli`、`shm-reader`、`hal/hailo15/libaipc_hal.so`）均为 aarch64。在主机（非容器）上也可用 `file build/output/device-control`（输出含 `ARM aarch64`）。

### 7. 单独构建某个服务

开发迭代时只需重编和替换单个服务：

```bash
# 设备管理
make device-control HAL_PLATFORM=hailo15

# 消息总线
make event-bus HAL_PLATFORM=hailo15

# 应用管理
make app-manager HAL_PLATFORM=hailo15

# API 网关
make platform-api HAL_PLATFORM=hailo15

# 设备发现
make device-discovery HAL_PLATFORM=hailo15

# 视频采集（需先 source SDK 环境）
source /opt/hailo-sdk/environment-setup-armv8a-poky-linux
make camera-daemon HAL_PLATFORM=hailo15 SDK_PATH=/opt/hailo-sdk

# AI 推理（需先 source SDK 环境）
source /opt/hailo-sdk/environment-setup-armv8a-poky-linux
make ai-runtime HAL_PLATFORM=hailo15 SDK_PATH=/opt/hailo-sdk
```

> `HAL_PLATFORM=hailo15` 自动设置交叉编译参数。以上命令在容器内或已 source SDK 环境的 Linux 上执行；macOS 用户请先 `docker exec -it ne503-dev bash` 进入容器。

### 8. 构建问题排查

#### protoc / protoc-gen-go 未找到

```bash
sudo apt install protobuf-compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
export PATH="$PATH:$(go env GOPATH)/bin"
```

#### grpc_cpp_plugin 未找到

```bash
sudo apt install protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev
```

#### camera-daemon 交叉编译 protobuf 版本不匹配

C++ proto 文件需用 SDK 自带 protoc 生成。Makefile 在 `HAL_PLATFORM=hailo15` 时自动处理。

如果自动生成失败，可手动运行对应 proto 目标（如 `make proto-camera`），或执行 `make help` 查看 `proto-*` 系列。

#### CMake 选择了错误的工具链

```bash
rm -rf platform/camera-daemon/build-hailo15
make camera-daemon HAL_PLATFORM=hailo15 SDK_PATH=/opt/hailo-sdk
```

#### pnpm 首次运行报 Ignored build scripts

```bash
cd web && pnpm approve-builds esbuild msw unrs-resolver
```

#### Web 控制台构建失败（缺少模块）

`pnpm build` 报 `Cannot find module '.../lib/...'`，根因是 `.gitignore` 的 `lib/` 规则误伤了 `web/src/**/lib/` 目录，导致这些源文件没被 git 跟踪。确认 `.gitignore` 包含取消忽略的例外：

```gitignore
lib/
!web/src/**/lib/
```

补上例外后，缺失文件即可正常跟踪，重新拉取后 `pnpm build` 恢复正常。

#### Python SDK 文档构建报 ModuleNotFoundError: grpc

`Building Python SDK Documentation` 阶段刷大量 `ModuleNotFoundError: No module named 'grpc'`，是 sphinx autodoc 导入 SDK 模块时缺 `grpcio` 所致。**非致命**——Python SDK 已构建成功、文档照常生成、构建继续进入 Layer 2，最终出包不受影响，可直接忽略。

### Make 目标速查

（以仓库 Makefile 当前 `make help` 输出为准，常用目标如下）

| 目标 | 说明 |
|------|------|
| `make pack-release` | 完整 Hailo-15 发布包（需 `SDK_PATH`；默认连带构建 MCU 固件，`BUILD_MCU_FW=0` 可跳过） |
| `make docker-pack-release` | 在 Docker 容器内出发布包（免本机装 SDK） |
| `make build-go` | proto + 所有 Go 平台服务 |
| `make build-native` | Go + HAL v2 + camera-daemon + ai-runtime + aipc-cli + tools |
| `make build-web` | Web 控制台 |
| `make platform` | 所有 Go 平台服务（含 os-updater） |
| `make hal-v2` | HAL v2（`HAL_PLATFORM=hailo15` 交叉编译；默认 `stub`） |
| `make camera-daemon` / `make ai-runtime` | 单独构建 C++ 组件 |
| `make proto` | 编译 .proto 生成代码 |
| `make aipc-cli` | 设备 CLI 工具 |
| `make test` / `test-basic` / `test-smoke` | 单元 / 仓库检查 / HTTP 冒烟 |
| `make fmt` / `make lint` | 格式化 / 静态检查 |
| `make clean` | 清理构建产物 |

## 相关文档

- [System Architecture](./0-system-architecture.md) — 四层架构和核心服务详解
- [System Flashing](./2-system-flashing.md) — 系统镜像烧录和升级
- [Software Deployment](./3-software-deployment.md) — 平台软件部署和迭代开发
- [Platform Services](./4-platform-services.md) — 各服务职责与源码指针
- [Troubleshooting](../5-troubleshooting.md) — 运行时问题排查
