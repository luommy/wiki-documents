---
description: NE503 AIPC 平台开发者指南：基于 Docker 开发镜像的环境搭建与完整发布包构建。
keywords: [NE503, 开发环境, 构建, Docker, Hailo SDK, 发布包]
tags: [平台开发, NE503, 环境搭建, 构建]
---

# Developer Guide

本文档指导你用官方 Docker 开发镜像搭建 NE503 AIPC 开发环境，并完成从源码到发布包的构建。

## 1. 获取源码

源码拆分为三个仓库，按需 clone（应用开发者通常只需后两个）：

```bash
# 平台主仓：平台服务、HAL、Web 控制台、固件构建
git clone https://github.com/camthink-ai/neoruntime.git

# SDK 仓：Python SDK（neoruntime_ipc_sdk）、C++ SDK、proto 定义
git clone https://github.com/camthink-ai/neoruntime-sdks.git

# 应用仓：示例应用、showcase、应用模板与统一构建脚本
git clone https://github.com/camthink-ai/neoruntime-apps.git
```

> 构建应用时，把 `neoruntime-apps` 与 `neoruntime-sdks` clone 到**同一父目录**下——应用统一构建脚本 `scripts/build_app.sh` 默认从旁边的 `neoruntime-sdks` 取 SDK。

平台主仓 `neoruntime` 只在开发平台服务/HAL 或构建完整发布包时需要 clone。构建分三层——Layer 1（Go + Node.js + Python，平台服务与 Web）、Layer 2（+ C++ 工具链，camera-daemon / ai-runtime 等原生组件与 HAL v2）、Layer 3（+ Hailo Yocto 交叉编译 SDK，HAL 固件与完整发布包）；各层依赖均已内置在官方 Docker 镜像（见 §2），多数构建只需 Layer 1/2，出 `pack-release` 发布包才需要 Layer 3。

## 2. Docker 开发环境

官方镜像 `camthink/ne503-dev:v1.0` 内置三层全部依赖（含 Hailo/Poky SDK，位于 `/opt/hailo-sdk`），开箱即用。镜像多平台（amd64 + arm64），Apple Silicon 拉取 arm64 原生版，无需 QEMU。

```bash
# 拉取镜像
docker pull camthink/ne503-dev:v1.0

# 创建持久开发容器（可长期复用）
docker run -d --name ne503-dev \
  -v $(pwd):/ne503 \
  -w /ne503 \
  camthink/ne503-dev:v1.0 \
  bash -c "sleep infinity"

# 使用
docker exec -it ne503-dev bash                          # 交互进入
docker exec ne503-dev make pack-release VERSION=1.0.0   # 直接执行构建
```

> 仓库 `docker/dev/` 下另有自建镜像 `ne503-dev-env`（轻量版，SDK 运行时挂载）与 `ne503-dev-env-full`（SDK 内置版），需要定制时用。

### Python SDK（开发模式）

`pip3 install -e ".[dev]"` 把 Python SDK 以**可编辑（开发）模式**装入当前环境——源码改动即时生效，无需重装。在 `neoruntime-sdks` 仓库目录下执行：

```bash
cd ../neoruntime-sdks/python   # 按你的仓库位置调整
pip3 install -e ".[dev]"
```

> 若报 `error: externally-managed-environment`（系统 Python 拒绝全局装包），先建虚拟环境：`python3 -m venv .venv && source .venv/bin/activate`，再重跑上面的安装命令（每次新开终端先 `source .venv/bin/activate` 激活）。

## 3. 完整构建

构建产出 `build/release/aipc-hailo15-<version>.tar.gz` 发布包，包含平台服务、HAL 库、Web 控制台和部署脚本。

```bash
docker exec ne503-dev bash -c \
  'source /opt/hailo-sdk/environment-setup-armv8a-poky-linux && \
   make pack-release SDK_PATH=/opt/hailo-sdk VERSION=1.0.0'
```

```plaintext
# 预期输出（阶段进度）
==> Compiling proto (inference / device / event / camera / app / ...)
==> Building device-control (CGO_ENABLED=0)
==> Building event-bus / app-manager / platform-api / device-discovery / os-updater
==> Building Web Console / Python SDK
=== Layer 1 complete ===
==> Building HAL v2 [platform=hailo15]
==> Building camera-daemon / ai-runtime (C++) / aipc-cli
=== Layer 2 complete ===
==> Building MCU firmware          # 默认连带构建（BUILD_MCU_FW=0 可跳过）
=== Packaging release [1.0.0, platform=hailo15]
File:   build/release/aipc-hailo15-1.0.0.tar.gz
```

验证产物为 ARM aarch64（容器内无 `file` 命令，用 `readelf`）：

```bash
docker exec ne503-dev bash -c \
  'readelf -h build/output/device-control | grep Machine'
# 预期输出: Machine: AArch64
```

`build/output/` 下所有产物（Go/C++ 服务、`aipc-cli`、`shm-reader`、`hal/hailo15/libaipc_hal.so`）均为 aarch64。

## 4. Make 目标速查

以仓库 `make help` 输出为准，常用目标：

| 目标 | 说明 |
|------|------|
| `make pack-release` | 完整 Hailo-15 发布包（需 `SDK_PATH`；`BUILD_MCU_FW=0` 跳过 MCU 固件） |
| `make docker-pack-release` | 在 Docker 容器内出发布包 |
| `make build-go` / `make platform` | proto + 所有 Go 平台服务（后者含 os-updater） |
| `make build-native` | Go + HAL v2 + camera-daemon + ai-runtime + aipc-cli + tools |
| `make build-web` | Web 控制台 |
| `make hal-v2` | HAL v2（`HAL_PLATFORM=hailo15` 交叉编译；默认 `stub`） |
| `make camera-daemon` / `make ai-runtime` | 单独构建 C++ 组件 |
| `make proto` / `make aipc-cli` | 编译 .proto / 设备 CLI 工具 |
| `make test` / `test-basic` / `test-smoke` | 单元 / 仓库检查 / HTTP 冒烟 |
| `make fmt` / `make lint` / `make clean` | 格式化 / 静态检查 / 清理 |

## 5. 常见构建问题

| 问题 | 处理 |
|------|------|
| protoc / protoc-gen-go 未找到 | `apt install protobuf-compiler` + `go install .../protoc-gen-go@latest` + 把 `$(go env GOPATH)/bin` 加入 PATH |
| grpc_cpp_plugin 未找到 | `apt install protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev` |
| camera-daemon 交叉编译 protobuf 版本不匹配 | C++ proto 需用 SDK 自带 protoc 生成；`HAL_PLATFORM=hailo15` 时 Makefile 自动处理，失败时手动 `make proto-camera` 或 `make help` 查看 `proto-*` 系列 |
| CMake 选错工具链 | `rm -rf platform/camera-daemon/build-hailo15` 后重新构建 |
| pnpm 报 Ignored build scripts | `cd web && pnpm approve-builds esbuild msw unrs-resolver` |
| Web 构建报 Cannot find module `.../lib/...` | `.gitignore` 的 `lib/` 规则误伤 `web/src/**/lib/`，需加 `!web/src/**/lib/` 例外 |
| Python SDK 文档阶段刷 `ModuleNotFoundError: grpc` | sphinx autodoc 缺 `grpcio` 所致，**非致命**，出包不受影响，忽略即可 |

## 相关文档

- [System Architecture](./0-system-architecture.md) — 四层架构、数据链路与服务清单
- [System Flashing](./2-system-flashing.md) — 系统镜像烧录和升级
- [Software Deployment](./3-software-deployment.md) — 平台软件部署
- [Troubleshooting](../5-troubleshooting.md) — 运行时问题排查
