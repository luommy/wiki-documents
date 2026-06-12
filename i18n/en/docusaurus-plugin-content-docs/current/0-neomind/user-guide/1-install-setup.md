---
description: Complete install flow for NeoMind on desktop (macOS/Windows/Linux) or server, covering one-line script, Docker, manual install, nginx reverse proxy, and development setup.
keywords: [NeoMind, install, deploy, Docker, one-line script, first-run setup]
tags: [NeoMind, User Guide]
---

# Install & Setup

NeoMind ships in three deployment modes: **Desktop App** (recommended for getting started), **Server one-line install**, and **Build from source**. None require an external database or message broker.

## Desktop App

### Download

Grab the installer for your platform from [GitHub Releases](https://github.com/camthink-ai/NeoMind/releases/latest):

| Platform | Format |
|----------|--------|
| macOS (Apple Silicon + Intel) | `.dmg` |
| Windows | `.msi` / `.exe` |
| Linux | `.AppImage` / `.deb` |

### First-Launch Wizard

On first launch, NeoMind runs a **setup wizard** that walks you through:

1. **Create an admin account** — set username and password (your first sign-in credentials)
2. **Configure an LLM backend** — pick Ollama (local) or a cloud model; see [Configure LLM Backend](./2-configure-llm.md)
3. **Connect a device** — enter the onboarding wizard; see [Onboard a Device](./3-onboard-device.md)

<!-- Screenshot placeholder: first-launch wizard
     Upload to resources.camthink.ai/wiki/img/ai-application/neomind/user-guide/
     onboarding-wizard.png / llm-config.png
-->

You'll land in the main UI when the wizard completes.

## Server One-Line Install (Linux / macOS)

The fastest server install:

```bash
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh | sh
```

The install script:

- Downloads statically compiled `neomind` and `neomind-extension-runner` binaries to `/usr/local/bin`
- Deploys frontend static assets to `/var/www/neomind`
- Registers a systemd service (`neomind.service`) for auto-start on boot
- Listens on `http://your-server:9375` by default

After install, open `http://your-server:9375` in a browser and complete the first-run setup.

### Install Options (Environment Variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `VERSION` | latest | Specific version, e.g. `0.8.11` |
| `INSTALL_DIR` | `/usr/local/bin` | Binary install directory |
| `DATA_DIR` | `/var/lib/neomind` | Data directory (redb files, logs) |
| `WEB_DIR` | `/var/www/neomind` | Frontend static files |
| `PORT` | `9375` | Backend API port |
| `NO_WEB` | `false` | `true` = backend only, skip frontend |
| `NO_SERVICE` | `false` | `true` = skip systemd registration |
| `USE_NGINX` | `false` | `true` = auto-configure nginx reverse proxy on port 80 |

Examples:

```bash
# Pin a version
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh | VERSION=0.8.11 sh

# Custom directories
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | INSTALL_DIR=~/.local/bin DATA_DIR=~/.neomind sh

# Enable nginx reverse proxy (port 80)
curl -fsSL https://raw.githubusercontent.com/camthink-ai/NeoMind/main/scripts/install.sh \
  | USE_NGINX=true sh
```

## Docker

```bash
git clone https://github.com/camthink-ai/NeoMind.git
cd NeoMind
docker compose up -d
```

`docker-compose.yml` bundles backend, extension runner, and frontend with persistent volumes. Visit `http://host:9375` after deploy.

## Manual Installation

For environments where the one-line script can't run (air-gapped servers, custom directory layouts):

```bash
VERSION=0.8.11
# Download
wget https://github.com/camthink-ai/NeoMind/releases/download/v${VERSION}/neomind-server-linux-amd64.tar.gz
wget https://github.com/camthink-ai/NeoMind/releases/download/v${VERSION}/neomind-web-${VERSION}.tar.gz

# Install binaries
tar xzf neomind-server-linux-amd64.tar.gz
sudo install -m 755 neomind /usr/local/bin/
sudo install -m 755 neomind-extension-runner /usr/local/bin/

# Deploy frontend
sudo mkdir -p /var/www/neomind
sudo tar xzf neomind-web-${VERSION}.tar.gz -C /var/www/neomind

# Start
./neomind serve
```

### With nginx Reverse Proxy

Expose only port 80 externally; keep 9375 loopback-only:

```nginx
server {
    listen 80;
    root /var/www/neomind;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:9375/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Build from Source (Development)

For contributors or custom builds.

**Prerequisites**: Rust 1.85+ (toolchain pinned to 1.92.0), Node.js 20+, Ollama (or a cloud LLM API key).

```bash
# Clone
git clone https://github.com/camthink-ai/NeoMind.git
cd NeoMind

# Start backend (port 9375 by default)
cargo run -p neomind-cli -- serve

# Start frontend dev server (port 5173, hot reload)
cd web && npm install && npm run dev

# Build desktop app
cd web && npm run tauri:build
```

See [Developer Guide](../developer-guide/1-overview.md) for build/contribution details.

## First-Run Setup (All Modes)

Regardless of install path, first visit to the Web UI requires three steps:

1. **Create an admin account** — the first registered user becomes admin
2. **Configure an LLM backend** — lets AI agents understand and execute instructions; see [Configure LLM Backend](./2-configure-llm.md)
3. **Onboard a device** — connect cameras or sensors via the onboarding wizard; see [Onboard a Device](./3-onboard-device.md)

Once done, you can chat with devices in [AI Chat](./5-ai-chat.md), build [Dashboards](./4-use-dashboard.md), or create automation rules.

## Verify the Install

```bash
# Probe backend health
curl http://localhost:9375/api/health

# Open API docs (Swagger)
# Visit http://localhost:9375/api/docs in a browser

# systemd status (one-line install)
systemctl status neomind.service
```

For common issues (port conflicts, LLM connection failures, MQTT unreachable), see [Troubleshooting](./10-troubleshooting.md).

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
