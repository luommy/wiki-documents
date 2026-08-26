---
description: "NE503 AIPC platform developer guide: environment setup and full release-package builds using the official Docker development image."
keywords: [NE503, development environment, build, Docker, Hailo SDK, release package]
tags: [platform development, NE503, environment setup, build]
---

# Developer Guide

This document guides you through setting up the NE503 AIPC development environment with the official Docker image and building from source to release package.

## 1. Get Source Code

The source is split into three repositories — clone the ones you need (app developers usually only need the last two):

```bash
# Platform repo: platform services, HAL, web console, firmware build
git clone https://github.com/camthink-ai/neoruntime.git

# SDK repo: Python SDK (neoruntime_ipc_sdk), C++ SDK, proto definitions
git clone https://github.com/camthink-ai/neoruntime-sdks.git

# Apps repo: example apps, showcases, app templates, and the unified build script
git clone https://github.com/camthink-ai/neoruntime-apps.git
```

> When building apps, clone `neoruntime-apps` and `neoruntime-sdks` into the **same parent directory** — the unified build script `scripts/build_app.sh` takes the SDK from the adjacent `neoruntime-sdks`.

Clone `neoruntime` only when you develop the platform services/HAL or build the full release package. The build has three layers — Layer 1 (Go + Node.js + Python: platform services and web), Layer 2 (+ C++ toolchain: native components like camera-daemon / ai-runtime and HAL v2), Layer 3 (+ Hailo Yocto cross-compile SDK: HAL firmware and the full release package). All layer dependencies are bundled in the official Docker image (see §2); most builds need only Layers 1/2, and only the `pack-release` step requires Layer 3.

## 2. Docker Development Environment

The official image `camthink/ne503-dev:v1.0` ships all three layers of dependencies (incl. the Hailo/Poky SDK at `/opt/hailo-sdk`) ready to use. The image is multi-platform (amd64 + arm64); Apple Silicon pulls the arm64 native build, no QEMU needed.

```bash
# Pull the image
docker pull camthink/ne503-dev:v1.0

# Create a persistent dev container (reusable long-term)
docker run -d --name ne503-dev \
  -v $(pwd):/ne503 \
  -w /ne503 \
  camthink/ne503-dev:v1.0 \
  bash -c "sleep infinity"

# Use it
docker exec -it ne503-dev bash                          # interactive shell
docker exec ne503-dev make pack-release VERSION=1.0.0   # run a build directly
```

> The repo's `docker/dev/` also has self-built images `ne503-dev-env` (lightweight, SDK mounted at runtime) and `ne503-dev-env-full` (SDK bundled) for when you need customization.

### Python SDK (Development Mode)

`pip3 install -e ".[dev]"` installs the Python SDK in **editable (development) mode** — changes to the SDK source take effect immediately, no reinstall needed. Run it from the `neoruntime-sdks` repo:

```bash
cd ../neoruntime-sdks/python   # adjust to your repo location
pip3 install -e ".[dev]"
```

> On `error: externally-managed-environment` (the system Python refuses to install packages globally), create a virtual environment first: `python3 -m venv .venv && source .venv/bin/activate`, then re-run the install command above (activate with `source .venv/bin/activate` again in each new shell).

## 3. Full Build

The build produces the release package `build/release/aipc-hailo15-<version>.tar.gz`, containing the platform services, HAL libraries, web console, and deployment scripts.

```bash
docker exec ne503-dev bash -c \
  'source /opt/hailo-sdk/environment-setup-armv8a-poky-linux && \
   make pack-release SDK_PATH=/opt/hailo-sdk VERSION=1.0.0'
```

```plaintext
# Expected output (stage progress)
==> Compiling proto (inference / device / event / camera / app / ...)
==> Building device-control (CGO_ENABLED=0)
==> Building event-bus / app-manager / platform-api / device-discovery / os-updater
==> Building Web Console / Python SDK
=== Layer 1 complete ===
==> Building HAL v2 [platform=hailo15]
==> Building camera-daemon / ai-runtime (C++) / aipc-cli
=== Layer 2 complete ===
==> Building MCU firmware          # built by default (BUILD_MCU_FW=0 skips it)
=== Packaging release [1.0.0, platform=hailo15]
File:   build/release/aipc-hailo15-1.0.0.tar.gz
```

Verify the artifacts are ARM aarch64 (no `file` in the container — use `readelf`):

```bash
docker exec ne503-dev bash -c \
  'readelf -h build/output/device-control | grep Machine'
# Expected: Machine: AArch64
```

All artifacts under `build/output/` (Go/C++ services, `aipc-cli`, `shm-reader`, `hal/hailo15/libaipc_hal.so`) are aarch64.

## 4. Make Target Quick Reference

Authoritative list in the repo's `make help`; common targets:

| Target | Description |
|------|------|
| `make pack-release` | Full Hailo-15 release package (needs `SDK_PATH`; `BUILD_MCU_FW=0` skips MCU firmware) |
| `make docker-pack-release` | Build the release package inside a Docker container |
| `make build-go` / `make platform` | proto + all Go platform services (the latter incl. os-updater) |
| `make build-native` | Go + HAL v2 + camera-daemon + ai-runtime + aipc-cli + tools |
| `make build-web` | Web console |
| `make hal-v2` | HAL v2 (`HAL_PLATFORM=hailo15` cross-compile; defaults to `stub`) |
| `make camera-daemon` / `make ai-runtime` | Build individual C++ components |
| `make proto` / `make aipc-cli` | Compile .proto / device CLI tool |
| `make test` / `test-basic` / `test-smoke` | Unit / repo checks / HTTP smoke |
| `make fmt` / `make lint` / `make clean` | Format / lint / clean |

## 5. Common Build Issues

| Issue | Fix |
|------|------|
| protoc / protoc-gen-go not found | `apt install protobuf-compiler` + `go install .../protoc-gen-go@latest` + add `$(go env GOPATH)/bin` to PATH |
| grpc_cpp_plugin not found | `apt install protobuf-compiler-grpc libgrpc++-dev libprotobuf-dev` |
| camera-daemon cross-compile protobuf version mismatch | C++ protos must be generated with the SDK's bundled protoc; the Makefile handles it when `HAL_PLATFORM=hailo15` — on failure run `make proto-camera` manually or check `make help` for the `proto-*` targets |
| CMake picks the wrong toolchain | `rm -rf platform/camera-daemon/build-hailo15` and rebuild |
| pnpm reports Ignored build scripts | `cd web && pnpm approve-builds esbuild msw unrs-resolver` |
| Web build reports Cannot find module `.../lib/...` | The `.gitignore` `lib/` rule hits `web/src/**/lib/`; add a `!web/src/**/lib/` exception |
| Python SDK docs stage floods `ModuleNotFoundError: grpc` | sphinx autodoc missing `grpcio`; **non-fatal**, the package is unaffected — ignore |

## Related Documentation

- [System Architecture](./0-system-architecture.md) — four-layer architecture, data path, and service inventory
- [System Flashing](./2-system-flashing.md) — system image flashing and upgrades
- [Software Deployment](./3-software-deployment.md) — platform software deployment
- [Troubleshooting](../5-troubleshooting.md) — runtime troubleshooting
