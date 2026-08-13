---
description: "NE503 reference: aipc-cli command cheat sheet (system / app / device / stream / model modules and output formats) and a symptom-organized troubleshooting table."
keywords: [NE503 aipc-cli, command line, CLI cheat sheet, troubleshooting, symptoms]
tags: [User Guide, NE503, CLI, Troubleshooting]
---

# Troubleshooting

After signing in via the web terminal (Maintenance → Terminal) or SSH, use the unified `aipc-cli` to manage apps, models, the device, streams, and the system. This appendix provides a command cheat sheet and symptom-organized troubleshooting.

## aipc-cli Cheat Sheet

```bash
# System
aipc-cli system info              # Device info
aipc-cli system health            # Health check

# Apps
aipc-cli app list                 # List apps
aipc-cli app start <id>           # Start an app
aipc-cli app stop <id>            # Stop an app
aipc-cli app logs <id> -f         # Tail app logs in real time

# Device (lens / IR)
aipc-cli device status            # Device status
aipc-cli device zoom in 5         # Zoom (in / out / stop, speed 1-10)
aipc-cli device focus auto        # Autofocus

# Streams
aipc-cli stream list              # List stream status
aipc-cli stream url <id>          # Show a stream's RTSP URL

# Models
aipc-cli model list               # List models
aipc-cli model register <path>    # Register a new model
```

**Output format**: all commands accept `-o table` (default) / `-o json` / `-o yaml` for scripting.

> The CLI covers most of the management operations available in the web console. It suits batch operations, automation scripts, and remote debugging.

## Symptom-Based Troubleshooting

Find the issue by symptom, then follow the steps.

### Cannot Access the Web Console

1. Confirm your computer is on the same subnet as the device (default `10.0.0.x`)
2. `ping 10.0.0.1` (or the device's actual IP) to confirm connectivity
3. If the device uses DHCP, check the router for its assigned IP
4. Make sure the browser uses `https://` (not http) and that the certificate warning is bypassed
5. If still failing: SSH in (`root` / `root`) and run `aipc-cli system health` to check services

### RTSP Stream Won't Play

1. Confirm the pulling end is on the same network as the device
2. Confirm the device IP hasn't changed (DHCP may reassign)
3. `aipc-cli stream list` to confirm the stream is enabled and RTSP is on
4. Verify the address and port: `rtsp://<device-ip>:8554/main`, default port 8554
5. Check that the firewall allows port 8554

### Container App Fails to Start

1. `aipc-cli app logs <id>` for error logs
2. Check resources (Dashboard memory / storage) for exhaustion
3. If image pull fails, check internet connectivity
4. Misconfigured Permissions (e.g., app needs a stream but wasn't granted it) can also prevent startup

### Model Imports but Produces No Detections

1. Is the model **Loaded** (Models page or `aipc-cli model list`) — unloaded models don't run
2. Did the app's Permissions grant access to that model
3. **Is the Threshold too high** — lower it in the Detail dialog and retry
4. Input size mismatch (platform preprocessing is fixed at 384×640 NV12)
5. Is the stream enabled and the app authorized for that stream

### Event Bus Receives No Events

1. Are the app's Publish / Subscribe Topics correctly paired
2. Does the subscriber's topic match the publisher's (mind wildcards `*` / `#`)
3. Network mode: in Isolated mode the app has no external network; Event Bus runs on the internal platform bus — confirm the subscriber connects to the device's Event Bus

### Disk Full

1. Use Maintenance → File Manager to inspect `/data/aipc/logs`, recordings, and model files
2. Clean up old logs and unneeded recordings / container images
3. Above 80%, consider adding a microSD card (Settings → Storage)
4. If container logs grow unbounded, tune the app's logging policy

### Forgot the Web Password

SSH in (`root` / `root`) and reset via `aipc-cli`, or use Device Info → Change Password if you can still log in.
