---
description: "NeoMind dashboard guide: create and edit dashboards, add widgets (value card / chart / gauge / table / vision), real-time data, data source format, public sharing links, and mobile responsiveness."
keywords: [NeoMind, dashboard, widget, real-time, sharing]
tags: [NeoMind, User Guide]
---

# Use Dashboards

The dashboard is NeoMind's core visualization surface. Drag widgets onto a canvas, bind them to device data sources, and watch telemetry, AI inference results, and device state update in real time.

## Overview

Every dashboard is a **responsive grid** that hosts widgets:

- **Real-time updates** — pushed via WebSocket / SSE; changes show up in seconds
- **Responsive layout** — drag-edit on desktop; auto-stacks to a single column on mobile
- **Shareable** — generate public links with expiration for no-login viewing
- **Multi-backend** — one dashboard can display data from multiple NeoMind instances at once

## Create a Dashboard

1. Go to the **Dashboards** tab
2. Click **New Dashboard**
3. Enter a name (required) and description (optional)
4. Save — you'll land in edit mode

<!-- Screenshot placeholder: dashboard grid editor + widget picker
     Upload to resources.camthink.ai/wiki/img/ai-application/neomind/user-guide/
     dashboard-editor.png / widget-picker.png
-->

## Add & Configure Widgets

In edit mode, click **Add Widget** and pick a type from the library:

| Widget Type | Use Case | Typical Data |
|-------------|----------|--------------|
| **Value Card** | Large single-number display | Temperature, humidity, counter |
| **Chart** | Time-series line / bar / area | Historical telemetry trends |
| **Gauge** | Circular / linear gauge with threshold band | CPU usage, water level |
| **Table** | Multi-row structured data | Device list, recognition records |
| **VLM Vision** | Image / video renderer + AI bounding boxes | YOLO / OCR / face recognition results |
| **Stream Player** | RTSP / RTMP / HLS video stream | NE301 / NE101 live feed |
| **Custom** | Community or self-built | anything |

The core config for every widget is its **data source**.

### Data Source Format (DataSourceId)

NeoMind identifies a single data point with the unified format `"{type}:{id}:{field}"`:

| Type | Example | Meaning |
|------|---------|---------|
| `device` | `device:esp32-01:temperature` | A device metric |
| `extension` | `extension:weather:temp` | A metric published by an extension |
| `agent` | `agent:guard-01:last_result` | An agent execution result |

When you pick a device and metric in the widget config panel, the DataSourceId is generated automatically — no need to type it.

### Edit Mode vs Preview Mode

- **Edit mode**: drag to reposition / resize widgets, edit configs. Grid snaps.
- **Preview mode**: layout locked, only real-time data renders. This is what viewers see via a share link.

## Real-Time Data Flow

NeoMind pushes device data to the frontend via **WebSocket / SSE**:

- Device publishes MQTT → backend event bus → subscribed widgets refresh
- End-to-end latency is typically < 1 second (same data center)
- On disconnect, the frontend auto-reconnects and backfills recent data

For history, use the widget's "Time Range" config (last 1 hour / 24 hours / 7 days / custom).

## Share a Dashboard

Generate a **public link** to share a dashboard with users who aren't logged in:

1. On the dashboard detail page, click **Share**
2. Set an expiration (1 hour / 1 day / 7 days / never)
3. Copy the generated link (e.g. `https://your-host/share/<token>`)
4. Recipients view it read-only — no account needed

> **Note**: A share link exposes only the read-only view of that one dashboard — never API keys, device control, or other dashboards. The link auto-expires.

## Mobile

- **Responsive breakpoint**: below 768 px, widgets stack into a single column
- **Edit mode**: drag-edit is disabled on mobile (screen too small) — edit on desktop
- **Touch**: charts support pinch-to-zoom and pan
- **Mobile Web**: just visit `http://your-host:9375` in a mobile browser — no app install needed

## Multi-Instance Dashboards

If you run multiple NeoMind backends (e.g. several edge servers across a plant), register them under **Settings → Instances**. Once registered, the widget config picker lets you **pick data sources across instances** — one dashboard, multiple backends.

## Custom Widgets

Need something the built-in library doesn't cover?

- Install community widgets from [NeoMind-Dashboard-Components](https://github.com/camthink-ai/NeoMind-Dashboard-Components)
- Build your own with React and publish to the marketplace

See [Developer Guide — Dashboard Component Development](../developer-guide/1-overview.md).

## Next Steps

- [AI Chat](./5-ai-chat.md) — Query device data in natural language
- [AI Agent](./6-ai-agent.md) — Scheduled / event-triggered autonomous patrols
- [Automation Rules](./7-automation-rules.md) — Auto-alert when data crosses thresholds

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
