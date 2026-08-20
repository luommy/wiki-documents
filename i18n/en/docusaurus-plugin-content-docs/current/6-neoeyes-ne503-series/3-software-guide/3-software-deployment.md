---
description: NE503 platform software deployment guide, covering release package deployment and deployment verification.
keywords: [NE503, deployment, deploy.sh, systemd]
tags: [platform development, NE503, deployment, operations]
---

# Software Deployment

This document explains how to deploy the NE503 platform software release package to a device. Platform software includes platform services, HAL libraries, and the Web console. This is distinct from system image (hailo-os) flashing — see [System Flashing](./2-system-flashing.md) for that.

> Prerequisites: Complete the environment setup and build process in [Developer Guide](./1-developer-guide.md) to produce the `build/release/aipc-hailo15-<version>.tar.gz` release package.

## 1. Release Package Deployment

### 1.1 Transfer Package

```bash
scp build/release/aipc-hailo15-<version>.tar.gz root@<device-ip>:/data/
```

### 1.2 Execute Deployment

```bash
ssh root@<device-ip>
# root partition is nearly full (3.3G, 99% used); extract directly in /data
cd /data && tar xzf aipc-hailo15-<version>.tar.gz
cd aipc-hailo15-<version> && ./deploy.sh
```

Expected output (key stages excerpted; per-file `+ xxx -> ...` logs omitted):

```plaintext
[deploy]   AIPC Hot-swap Deploy
[deploy]   Current version:  unknown (first deploy) or previous version
[deploy]   Package version:  1.0.0
[deploy]   Config deploy:    yes
[deploy]   Install prefix:   /data/aipc
Proceed with deployment? [y/N] y
[deploy] [1/8] Creating runtime directories...
[deploy] [2/8] Backing up current installation...
[deploy] [3/8] Stopping services for hot-swap...
[deploy] [4/8] Deploying binaries...
[deploy] [5/8] Deploying firstboot initialization script...
[deploy] [6/8] Deploying HAL libraries...
[deploy] [7/8] Deploying configs and systemd units...
[deploy] [8/8] Starting services...
[deploy] Running health checks (timeout 15s)...
[deploy] Service status:
[deploy]   aipc-healthmon: active
[deploy]   event-bus: active
[deploy]   camera-daemon: active
[deploy]   ai-runtime: active
[deploy]   platform-api: active
[deploy]   app-manager: active
[deploy]   device-control: active
[deploy]   device-discovery: active
[deploy]   Deploy successful!
[deploy]   Version: 1.0.0
```

### 1.3 deploy.sh Options

| Option | Description |
|--------|-------------|
| `--force` | Force deployment, skip confirmation prompts |
| `--rollback` | Roll back to previous version |
| `--status` | Display current deployment status |
| `--no-config` | Skip config file overwrite (preserve device config) |

> The install path is fixed at `/data/aipc` and cannot be customized (the root partition is 3.3G / 99% used and cannot fit the release package).

Complete examples:

```bash
./deploy.sh --force              # Force deploy (skip confirmation)
./deploy.sh --rollback           # Roll back to previous version
./deploy.sh --status             # Check deployment status
```

## 2. Release Package Contents

`aipc-hailo15-<version>.tar.gz` contains:

| Path | Contents |
|------|----------|
| `opt/aipc/bin/` | Platform service binaries + CLI + tools |
| `opt/aipc/scripts/` | Ops scripts (firstboot / healthmon / logrotate) |
| `opt/aipc/lib/hal/` | HAL shared libraries |
| `opt/aipc/etc/` | YAML configuration |
| `opt/aipc/etc/security/` | seccomp policies |
| `opt/aipc/web/` | Web console |
| `opt/aipc/swagger-ui/` | API documentation |
| `opt/aipc/models/` | Model directory (empty, requires separate download) |
| `systemd/` | systemd service units |
| `deploy.sh` | Hot-swap deployment script |
| `VERSION` | Version metadata |

## 3. Deployment Verification

After deployment, check service status on the device (all should be active):

```bash
systemctl status ai-runtime camera-daemon app-manager event-bus device-control device-discovery platform-api
```

Expected output:

```plaintext
● ai-runtime.service - AI Runtime Service
     Loaded: loaded (/etc/systemd/system/ai-runtime.service)
     Active: active (running)
```

Access the Web console at `https://<device-ip>` with default credentials `admin` / `password`.

## 4. Related Documentation

- [Developer Guide](./1-developer-guide.md) — Environment setup and building
- [System Architecture](./0-system-architecture.md) — Four-layer architecture and core services
- [System Flashing](./2-system-flashing.md) — System image flashing
