---
description: "NeoMind extension management guide: installing and uninstalling extensions (.nep), official marketplace, extension capabilities (metrics/commands/components), process isolation and crash protection, configuration."
keywords: [NeoMind, extension, install, marketplace, process isolation]
tags: [NeoMind, User Guide]
---

# Extension Management

Extensions are NeoMind's **pluggable capability modules** — vision AI, OCR, weather forecasts, custom data sources, and more are all delivered as extensions. Extensions run in **separate processes** communicating via FFI; a crash never affects the main service.

## What Are Extensions?

Extensions provide three types of capabilities:

| Capability | Description | Example |
|------------|-------------|---------|
| **Metric** | Time-series data produced by the extension, stored in `telemetry.redb`, viewable on dashboards | Weather extension's `temperature` metric |
| **Command** | Actions callable by AI Agent / API / Rules | YOLO extension's `detect` command |
| **Component** | Custom dashboard visualization components | Vision extension's live video component |

## Official Extensions

The [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions) repository provides official extensions:

| Extension | Type | Description |
|-----------|------|-------------|
| **Weather Forecast** | Data Source | Weather forecast and real-time meteorological data |
| **YOLO Detection** | Vision AI | Object detection (YOLO models), supports images and video streams |
| **OCR** | Vision AI | Image text extraction (PaddleOCR) |
| **Face Recognition** | Vision AI | Face detection and recognition |
| **Video Stream** | Streaming | RTSP/RTMP video stream ingestion and inference |
| **Device Inference** | Device AI | Edge AI camera (NE101/NE301) inference result ingestion |

See [Use Cases](../use-cases/1-object-detection.md) for end-to-end examples.

## Installing Extensions

### Option 1: Web UI (Recommended)

1. Go to **Extensions** tab
2. Click **Install Extension** or **Upload**
3. Upload the `.nep` package (downloaded from [NeoMind-Extensions](https://github.com/camthink-ai/NeoMind-Extensions/releases))
4. NeoMind auto-unpacks, verifies ABI version, and loads

Extensions auto-start after installation. If the extension declares `config_parameters` (e.g., API Key), you must configure them before it can run properly.

### Option 2: CLI

```bash
# Install extension
neomind extension install /path/to/weather-forecast.nep

# Install from URL
neomind extension install https://github.com/camthink-ai/NeoMind-Extensions/releases/download/v0.6.1/weather-forecast-v0.6.1.nep

# List installed extensions
neomind extension list

# View extension details (metrics, commands, config params)
neomind extension info <extension_id>

# Uninstall
neomind extension uninstall <extension_id>
```

### Option 3: AI Chat

Just tell [AI Chat](./5-ai-chat.md):

> "Help me install the weather extension"

The LLM guides you to upload the `.nep` package or provide a download link.

## Configuring Extensions

Some extensions require configuration parameters to run (e.g., weather extension needs an API Key). After installation:

1. Click the extension in **Extensions** tab to open details
2. Fill in parameters in the **Configuration** panel
3. Save — the extension auto-restarts

Configuration parameters have type validation (string / integer / boolean / enum); invalid values are rejected on save.

## Extension Status

| Status | Icon | Description |
|--------|------|-------------|
| **Running** | Green | Extension running normally |
| **Stopped** | Gray | Extension stopped (manually or unconfigured) |
| **Error** | Red | Extension crashed or failed to load |
| **Warning** | Yellow | Extension running with issues (e.g., API rate limited) |

### Reloading Extensions

```bash
# Reload extension (restarts process after config changes)
neomind extension reload <extension_id>

# Check extension status
neomind extension status <extension_id>
```

## Crash Protection

Extensions run in separate processes. If an extension crashes:

1. **Main service unaffected** — API, MQTT, dashboard, and other extensions keep running
2. **Auto-restart** — Extension restarts automatically (circuit breaker mechanism)
3. **Crash loop detection** — If it crashes repeatedly in a short period (e.g., 5 times in 5 minutes), the extension enters **Crash Loop** state, stopping auto-restart to prevent resource exhaustion
4. **In-app notification** — Crash events are written to the message center

Crash loops require manual investigation (check logs at `data/logs/`) before restarting the extension.

## Using Extension Data

### In Dashboards

Extension metrics work just like device metrics. When adding widgets in the dashboard editor, select extension metrics as data sources:

- DataSourceId format: `extension:<extension_id>:<metric_name>`
- Example: `extension:weather:temperature`

### In AI Chat

> "Call the weather extension, will it rain in Shanghai tomorrow?"

The LLM automatically calls the extension's command tool.

### In AI Agents

[Agents](./6-ai-agent.md) in Focused mode can bind extension metrics as data sources, or extension tools as analysis capabilities.

### In Rules

[Automation rules](./7-automation-rules.md) can use extension metrics as conditions:

```
RULE "Heat Wave Warning"
WHEN extension("weather").tomorrow_temp > 35
DO
  NOTIFY "Heat wave tomorrow"
END
```

## Extension Package Format (.nep)

`.nep` is the standard NeoMind extension package format — essentially a ZIP archive:

```
weather-forecast.nep
├── manifest.json      # Extension metadata (ID, name, version, ABI version, capabilities)
├── extension.so       # Compiled dynamic library (Linux)
├── extension.dylib    # macOS
├── extension.dll      # Windows
└── assets/            # Model files, config templates, etc. (optional)
```

Extensions must match the main service's **ABI version** (currently v3); mismatched versions are rejected on load.

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Extension Error after install | ABI version mismatch | Upgrade extension or main service to matching version |
| Extension metrics not showing | Extension unconfigured / API Key wrong | Check Configuration panel |
| Extension Crash Loop | Init failure / model missing | Check logs `data/logs/`, fix, then restart |
| AI can't call extension command | Extension stopped | Start extension in Extensions tab |
| No component after install | Extension doesn't provide Dashboard components | This extension only provides metrics/commands, no visual components |

See [Troubleshooting](./10-troubleshooting.md) for more.

## Developing Your Own Extension?

Extension development is covered in the [Developer Guide](../developer-guide/7-extension-development.md), including a complete tutorial for creating extensions from scratch.

## Next Steps

- **[Use Cases](../use-cases/1-object-detection.md)** — See extensions in real-world scenarios (object detection / OCR / face recognition)
- **[Dashboard](./4-use-dashboard.md)** — How to display extension-provided visual components on dashboards
- **[AI Agent](./6-ai-agent.md)** — Let Agents call extension commands for automated inspection

---

*Last updated: 2026-06-13 · NeoMind v0.8.11*
