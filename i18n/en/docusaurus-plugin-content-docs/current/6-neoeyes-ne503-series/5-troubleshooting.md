---
description: NE503 symptom-based troubleshooting for device access, video, AI models, apps, events, storage, peripherals, and services.
keywords: [NE503 troubleshooting, symptom FAQ, RTSP, WebSocket, container, event bus, error codes, diagnostic commands]
tags: [NE503, Troubleshooting, FAQ]
---

# Troubleshooting

Start with the symptom instead of reading the page from top to bottom. Commands assume an SSH session on the device; <code>curl</code> commands require a valid Bearer token. Before flashing, deleting a model, or cleaning files, confirm the backup and rollback path.

## Start here

| Symptom | Go to | First check |
|:---|:---|:---|
| Web console does not open | [Device & Network](#1-device--network) | Device IP, subnet, <code>ping</code>, and HTTPS |
| Web preview is black or RTSP has no video | [Video & Streams](#2-video--streams) | Stream switch, port, and <code>camera-daemon</code> |
| Model is loaded but produces no result | [AI & Models](#3-ai--models) | Model state, permissions, input size, and threshold |
| App exits or keeps restarting after installation | [Apps & Containers](#4-apps--containers) | App logs, resources, and manifest permissions |
| Event publish succeeds but the receiver gets nothing | [Events & Integrations](#5-events--integrations) | Topic, permissions, and subscriber connection |
| Upload fails or the disk is full | [Storage & Disk](#6-storage--disk) | <code>/</code>, <code>/data</code>, logs, and core dumps |
| Flashing fails or a peripheral does not respond | [Flashing & Peripherals](#7-flashing--peripherals) | Wiring, serial link, and firmware procedure |
| A service fails to start or a socket is unreachable | [System & Services](#8-system--services) | <code>systemctl</code>, <code>journalctl</code>, and <code>/run/aipc</code> |

## 1. Device & Network

### 1.1 Cannot Access the Web Console

**Symptom**: The device web page does not open.

Check in this order:

1. Confirm the computer and device are on the same subnet; the default device subnet is <code>10.0.0.x</code>.
2. Run <code>ping &lt;device_ip&gt;</code>. If it fails, check the Ethernet or PoE connection, the computer IP, and the firewall.
3. If the device has used a DHCP router, check the current address in the router admin page; DHCP may have changed it.
4. Open <code>https://&lt;device_ip&gt;</code> and accept the self-signed certificate.
5. If the network is reachable but the page still does not open, check the platform service over SSH:

~~~bash
ssh root@<device_ip>
aipc-cli system health
systemctl status platform-api
~~~

### 1.2 Forgotten Web Password

**Symptom**: You cannot log in to the Web console.

- If you can still log in, use Device Info → **Change Password**, or call <code>POST /api/v1/system/password</code>.
- If the test device still uses the default credentials <code>admin</code> / <code>password</code>, log in and change them immediately.
- If the changed password is lost, <code>aipc-cli</code> has no password-reset command; contact technical support or reflash the firmware.

The device currently has no factory-reset API. Reflashing has the same effect as a factory reset, so back up anything that must be kept first.

### 1.3 Lens Control Malfunction

**Symptom**: Focus, zoom, or iris does not respond or behaves abnormally.

Check the camera service, then read the lens state; reset the lens zero point only when needed:

~~~bash
systemctl status camera-daemon
grpcurl -plaintext -d '{}' unix:///run/aipc/device-control.sock aipc.device.DeviceControl/GetLensStatus
grpcurl -plaintext -d '{}' unix:///run/aipc/device-control.sock aipc.device.DeviceControl/LensResetZero
~~~

If the lens still does not respond, the issue is usually in the lens motor or HAL control path. The interface is defined in <code>platform/device-control/proto/device.proto</code>.

### 1.4 Serial / RS-485 Communication Failure

**Symptom**: An external RS-485 device, such as a PTZ or sensor, does not respond.

Distinguish the two serial links: the external RS-485 baud rate is set by the app through <code>Rs485Init</code>; <code>/dev/ttyS0 @ 921600</code> is the internal host link between the processor board and interface-board MCU, not a peripheral interface.

Troubleshoot peripherals in [§7.4 Alarm Input / Wiegand / RS-485](#74-alarm-input--wiegand--rs-485-runtime-issues). Check A/B polarity, shared ground, power, baud rate, device address, and protocol frame.

### 1.5 Browser Compatibility & Fallback

| Browser | Minimum | Support | Known issue | Handling |
|:---|:---|:---|:---|:---|
| Chrome | 88+ | Full | — | Preferred |
| Edge | 88+ | Full | — | Use directly |
| Firefox | 78+ | Basic | No WebCodecs | Use MSE playback |
| Safari | 14+ | Partial | No WebCodecs | Falls back to MSE |
| Mobile browsers | — | Limited | Limited performance | Use a desktop browser |

Chrome 88+ or Edge 88+ is recommended. Safari's MSE fallback may perform worse.

### 1.6 WebSocket Failures at the Access Layer

| Symptom | Check first | Handling |
|:---|:---|:---|
| 1006 abnormal closure | <code>platform-api</code> and port 443 | Check the service, firewall, and network |
| 401/403 | Whether the token has expired | Log in again for a new token |
| Black screen | WebSocket state and SPS/PPS reception | Refresh, then check service logs |
| Artifacts or mosaic | Packet loss and decoder | Switch browser and check network quality |
| High latency | Network delay and buffering | Ensure LAN bandwidth and check the encoding GOP |

Web preview uses MJPEG by default. If HD preview is black, the verified temporary workaround is to set <code>HD_PREVIEW_ENABLED=0</code> for the app so it falls back to MJPEG. The HD path can become the default again after the platform exposes H.264 through nginx with <code>wss://</code>.

## 2. Video & Streams

### 2.1 RTSP Pull Failure

**Symptom**: A player or puller cannot connect to RTSP, or connects without video.

Check in order:

1. Confirm the pulling side is on the same subnet and the device IP has not changed through DHCP.
2. Confirm <code>aipc-cli stream list</code> shows the target stream enabled and the RTSP switch saved in the Web console.
3. Use <code>rtsp://&lt;device_ip&gt;:8554/main</code>; the port is <code>8554</code>.
4. Confirm the network policy allows port 8554.
5. If it still fails, check the service and client connection:

~~~bash
systemctl status camera-daemon
journalctl -u camera-daemon -n 50 --no-pager
ffmpeg -rtsp_transport tcp -i rtsp://<device_ip>:8554/main -t 10 -f null -
~~~

RTSP on <code>:8554</code> currently has no authentication. Any client that can reach the device may pull the stream; isolate it at the network layer in production.

### 2.2 WebSocket Disconnections at the Integration Layer

**Symptom**: A third-party system frequently disconnects after joining the video stream.

Separate authentication failures from runtime disconnects: 401/403 usually indicates a token problem; a connection that drops after it is established points to client timeouts, network changes, or server errors.

~~~bash
journalctl -u platform-api --since "1 hour ago" | grep -i "websocket\|h264"
wscat --no-check -c wss://<device_ip>/api/v1/h264/main
~~~

For client reconnection and video configuration, see [Video and Imaging](./2-user-guide/1-media-and-image.md).

### 2.3 Stuck in SIMULATION Mode with No Detections

**Symptom**: The app log contains <code>Running in SIMULATION mode - no actual inference</code> and detections remain at zero.

This is the SDK fallback when it cannot obtain a real video stream; it does not by itself prove an app logic error. Check whether <code>camera-daemon</code> is crashing:

~~~bash
ssh root@<device_ip> "systemctl status camera-daemon"
ssh root@<device_ip> "journalctl -u camera-daemon -n 20 --no-pager"
~~~

If the log contains <code>dlopen(/data/aipc/lib/hal/hal-hailo15.so) failed</code>, the firmware usually lacks the HAL library. Reflash an image that contains it. The app will produce real detections only after the camera service recovers.

## 3. AI & Models

### 3.1 Model Imported but No Detections

**Symptom**: The model is imported, the app is running, but no detections or inference results appear.

Check these five items instead of looking only at the NPU Worker:

1. Models or <code>aipc-cli model list</code> must show the model as Loaded. If not, scan the model library and load it to the NPU.
2. <code>permissions.models</code> in <code>app.yaml</code> must contain the actual model ID.
3. If the threshold is too high, lower it until the pipeline produces a result, then raise it gradually.
4. The model input must match the platform's fixed **384×640 NV12** output.
5. The app must have permission for the raw-frame stream <code>third</code> or <code>sub</code>; <code>main</code> publishes encoded H.264 and cannot replace the inference input stream.

The standard HEF path is <code>/data/aipc/models/&lt;category&gt;/</code> → <code>scan</code> → <code>load</code>. The corresponding endpoints are <code>POST /ai/models/scan</code> and <code>POST /ai/models/&lt;id&gt;/load</code>.

### 3.2 Inference Reports Model Not Found

**Symptom**: The log contains <code>Model not found</code>, or app-manager reports <code>requires model X, but not found</code>.

The model name in the app configuration must exactly match the registered device name. Query the device first, then update <code>app.py</code> or <code>app.yaml</code>:

~~~python
from neoruntime_ipc_sdk import InferenceClient, FdMediaClient
print(InferenceClient().list_models())
print(FdMediaClient().list_streams())
~~~

You can also query models through the authenticated API:

~~~bash
curl -k https://<device_ip>/api/v1/ai/models \
  -H "Authorization: Bearer <token>"
~~~

### 3.3 Zero Detections from a High Threshold

**Symptom**: The model and stream are healthy, but the detection count is zero.

Temporarily lower the confidence threshold in the Models Detail dialog or app configuration. First confirm that detections appear, then raise the value until false positives and missed detections are acceptable for the business case.

### 3.4 Input Size Mismatch

**Symptom**: The log contains <code>byte_size mismatch</code>, or inference results are abnormal.

The platform preprocessor outputs fixed **384×640 NV12** frames. Use an HEF matching that size, such as <code>hailo_yolov8n_384_640.hef</code>; a mismatched model cannot run end to end on the current input path.

### 3.5 Inference Running but Zero Frames / Events

**Symptom**: The model is Loaded, the app is Running, the NPU Worker is active, but the app receives no frames or events and the logs show no clear error.

The app may still be attached to an expired container session. Check the app status heartbeat first; no heartbeat means that an active Worker does not prove that results are being returned.

For deeper diagnosis, observe inference failures:

~~~bash
strace -f -p $(pidof ai-runtime) -e trace=sendmsg -s 200 2>&1 | grep "Inference failed"
~~~

If errors such as <code>Inference failed: -2814</code> appear, restart <code>ai-runtime</code>, scan and load the model again, then start the app. To separate NPU firmware issues from the <code>ai-runtime</code> software stack, run <code>hailortcli run -t 5 &lt;hef&gt;</code> in a maintenance window.

## 4. Apps & Containers

### 4.1 App Installation Failure

**Symptom**: <code>aipc-cli app install</code> or package upload fails.

Classify the failure first:

| Failure area | Check first | Handling |
|:---|:---|:---|
| Image import or pull | Network and image source | Check external connectivity and install logs |
| <code>app.yaml</code> parsing | YAML syntax and fields | Run <code>yamllint app.yaml</code> locally |
| Permission | Whether the user belongs to the <code>aipc</code> group | Correct the user permission and retry |

~~~bash
journalctl -u app-manager -n 100 --no-pager
yamllint app.yaml
~~~

The old single-file upload interface <code>curl -F app=@.aipc</code> no longer works. Use the upload-image → upload-manifest → install-package flow.

### 4.2 Container Startup Failure

**Symptom**: Installation succeeds, but the app exits immediately or keeps restarting.

1. Read the app error with <code>aipc-cli app logs &lt;app-id&gt;</code>.
2. Check Dashboard memory and storage, then confirm system resources with <code>df -h</code> and <code>free -h</code>.
3. Confirm <code>permissions</code> includes the models, streams, and events the app needs.
4. If the error mentions image import or containerd, continue with [Storage & Disk](#6-storage--disk).

~~~bash
aipc-cli app logs <app-id>
journalctl -u app-manager --since "1 hour ago" | grep -i "container\|error\|failed"
systemctl status containerd
~~~

### 4.3 Health Check Failure

**Symptom**: app-manager marks the app unhealthy after startup.

<code>app.yaml</code> supports HTTP, command, and TCP probes. Reproduce the same probe type inside the container, then correct the target address, command, or port based on the result:

~~~bash
journalctl -u app-manager | grep -i healthcheck
aipc-cli app exec <app-id> -- /path/to/healthcheck.sh
aipc-cli app info <app-id>
~~~

Use <code>curl</code> for an HTTP probe, <code>aipc-cli app exec</code> for a command probe, and a port-listening check for a TCP probe.

### 4.4 Field-Verified Quick Reference

| Symptom | Cause | Handling |
|:---|:---|:---|
| <code>apk add ... I/O error</code> during build | Intermittent Docker Desktop, buildx, or network failure | Retry the build and check the image source |
| Start returns <code>DeadlineExceeded</code> | First image import exceeds the 10-second gRPC timeout | Wait for import to finish, then retry start |
| Log fails with <code>json.tool</code> | Response is NDJSON, one JSON object per line | Parse line by line, not as an array |
| <code>curl -F app=@.aipc</code> returns a JSON parse error | Old single-file upload API is unavailable | Use the staged upload flow |

## 5. Events & Integrations

### 5.1 Event Publish Failure

**Symptom**: Publishing an event fails, or the subscriber receives nothing.

Confirm three items:

1. <code>event-bus</code> is running.
2. The Topic uses <code>app/&lt;app_id&gt;/&lt;event&gt;</code>, for example <code>app/person_alert/person_detected</code>.
3. <code>app.yaml</code> declares the publish Topic in <code>permissions.events.publish</code>.

~~~bash
systemctl status event-bus
journalctl -u event-bus -n 100 --no-pager
aipc-cli event publish app/demo/started '{"message":"test"}'
~~~

### 5.2 Subscription Failure / No Events Received

**Symptom**: The subscriber connects but receives no expected event.

Confirm that the subscription Topic exactly matches the published Topic and that <code>permissions.events.subscribe</code> declares it. The subscriber must also connect to the device Event Bus; in isolated network mode, the device-internal bus is not an external service.

~~~bash
systemctl status event-bus
aipc-cli event subscribe "app/<your_app>/*"
~~~

Events are currently pushed only over WebSocket in real time; there is no REST history endpoint, and <code>/api/v1/events</code> returns 404. The server receives all Topics, so filter by the Topic field at the receiver.

### 5.3 Topic Permissions & Wildcards

Topics are hierarchical and separated by <code>/</code>:

| Syntax | Match scope | Example |
|:---|:---|:---|
| <code>*</code> | One level | <code>app/demo/*</code> matches <code>app/demo/started</code>, not a deeper path |
| <code>#</code> | Multiple levels | MQTT-style multi-level matching |

Every Topic an app publishes or subscribes to must be declared in <code>app.yaml</code> under <code>permissions.events</code>; otherwise the runtime rejects it.

## 6. Storage & Disk

### 6.1 Low Disk Space

**Symptom**: Dashboard shows high disk usage, or app startup, upload, or logging fails.

Locate the full partition before touching files:

~~~bash
df -h / /data
du -sh /data/aipc/* /home/root/* 2>/dev/null | sort -rh | head
~~~

For routine cleanup, use Maintenance → File Manager to remove old logs, unused apps, models, and packages. If container logs keep growing, adjust the app log policy; consider microSD expansion above 80% usage.

### 6.2 containerd Partition Mismatch

**Symptom**: Starting a large image reports <code>parent snapshot sha256:...</code> or <code>no space</code>, while the large partition still has space.

Older devices may place the deployment root at <code>/opt/aipc</code> on the small root partition; factory devices usually use <code>/data/aipc</code> on the large partition. Check the containerd <code>root</code> first:

~~~bash
df -h / /data
grep '^root' /etc/containerd/config.toml
~~~

If <code>root</code> still points to the small partition, back up the configuration and stop the related services before following the migration procedure in [Deployment & Operations](./2-user-guide/5-deployment.md). Clean the old directory only after the migration is verified; do not delete unconfirmed containerd data.

### 6.3 App Volume Directory Missing

**Symptom**: Startup reports <code>error mounting "/data/aipc/data/&lt;id&gt;" ... no such file or directory</code>.

app-manager does not create host directories declared in <code>app.yaml</code>. Confirm the app ID, then create the directories:

~~~bash
ssh root@<device_ip> "mkdir -p /data/aipc/data/<app-id> /data/aipc/logs/<app-id>"
~~~

### 6.4 Root Partition Filled by Logs or Core Dumps

**Symptom**: Upload returns <code>no space left</code>, although the app image is not large.

Locate large files on the root partition:

~~~bash
df -h /
du -sh /data/aipc/* /home/root/* 2>/dev/null | sort -rh | head
~~~

Confirm each file's purpose and export logs needed for support before removing stale logs or <code>/home/root/*.core</code>. Do not delete the evidence required to diagnose the original failure.

## 7. Flashing & Peripherals

### 7.1 Flashing Fails or Aborts Midway

**Symptom**: SPI Flash boot-chain flashing fails, times out, or crashes midway.

Common causes are an unstable UART connection, a wrong baud rate, a firmware-package mismatch, or missing <code>mkenvimage</code>. Follow [System Flashing](./3-software-guide/2-system-flashing.md) §2 to recover the boot chain, then repeat §3 to flash the system.

### 7.2 Recovering from an Interrupted Upgrade

**Symptom**: A power or network interruption during a U-Boot TFTP upgrade leaves the device unbootable.

Follow [System Flashing](./3-software-guide/2-system-flashing.md) §2 to recover the boot chain, then repeat §3 to flash the system. Confirm power, Ethernet, and the complete TFTP file before retrying.

### 7.3 U-Boot Won't Start

**Symptom**: There is no U-Boot output on the serial console after power-on, or boot is stuck.

Follow [System Flashing](./3-software-guide/2-system-flashing.md#2-recover-the-boot-chain) to recover the boot chain. This affects the boot path, so use a firmware package that matches the hardware.

### 7.4 Alarm Input / Wiegand / RS-485 Runtime Issues

When a peripheral does not work, check the physical layer, app configuration, and platform service in that order:

1. **Physical layer**: verify power, terminal wiring, A/B polarity, and shared ground.
2. **Configuration**: call <code>Rs485Init</code> before use, with the correct baud rate, address, and protocol frame.
3. **Service layer**: inspect <code>device-control</code> logs; if the issue remains, collect logs and wiring details.

The following are current platform limits, not configuration errors:

| Symptom | Current cause | Handling |
|:---|:---|:---|
| Alarm input triggers but no event is reported | No platform consumer for <code>EV_ALARM_IN</code> | Currently unavailable; wait for firmware support |
| Web Alarm Input Level has no effect | The control changes local state only; no API or MCU AIN_SET command is connected | Currently unavailable |
| Wiegand cannot receive a card-reader input | The current path is GPIO output only; there is no reader input or protocol encoder | Use it only as an access-control output |
| On-device Pan/Tilt call fails | The MCU host-link protocol has no corresponding PTZ command | Implement the protocol in the app for an external RS-485 PTZ |
| RS-485 receives no data | Initialization, wiring, ground, or protocol frame is wrong | Follow the three-layer order above |

See [Hardware Wiring](./2-user-guide/8-product-wiring.md) and [Interface Board](./2-hardware-guide/2-aipc-board-connection.md) for terminal definitions.

## 8. System & Services

Use this section for service-level diagnosis. For a field issue, complete the matching symptom section first.

### 8.1 General Troubleshooting Flow

| Order | What you see | Next step |
|:---|:---|:---|
| 1 | A command or page fails | Record the time, error code, and affected function |
| 2 | Service is not <code>active</code> | Run <code>systemctl status &lt;service&gt;</code>, then inspect startup logs |
| 3 | Socket is missing | Run <code>ls -la /run/aipc/*.sock</code>, then inspect the service process |
| 4 | Service is online but requests fail | Check permissions, dependencies, parameters, and resources |

### 8.2 Service Startup Failure

Start with failed services and their startup logs:

~~~bash
systemctl status ai-runtime camera-daemon app-manager event-bus device-control device-discovery platform-api
systemctl --failed
journalctl -u <service-name> -b --no-pager
~~~

If the service exists but its interface is unreachable, check the Unix socket:

~~~bash
ls -la /run/aipc/*.sock
nc -U /run/aipc/ai-runtime.sock
~~~

If the socket is missing, repair the service first. If access is denied, check the /run/aipc directory and socket owner/group. Do not kill a process or delete a socket without confirming which service owns it.

### 8.3 Common Startup Issues & Socket Permissions

| Log or symptom | Check first | Handling direction |
|:---|:---|:---|
| Dependency is not ready | <code>systemctl status &lt;upstream-service&gt;</code> | Restore the upstream service, then restart the current one |
| Socket is occupied | <code>ls -la /run/aipc/*.sock</code> and the owning process | Confirm ownership before handling a stale process |
| <code>permission denied</code> | Socket and the /run/aipc permissions | Correct the user/group; do not open access to everyone |
| Binary or config is missing | Service <code>ExecStart</code> and config path | Repair the package or config; do not hide the error with an empty file |
| YAML parse failure | The referenced YAML file | Back up first, then fix syntax with <code>yamllint</code> |

### 8.4 API Request Failures

| Status | Meaning | Check first |
|:---|:---|:---|
| 401 | Unauthenticated or expired token | Log in again and replace the token |
| 403 | Insufficient permission | Check user and app permissions |
| 404 | Path or resource does not exist | Verify the API path and resource ID |
| 500 | Internal service error | Read the <code>platform-api</code> logs |
| 503 | Service temporarily unavailable | Check dependencies and service state |

### 8.5 Log Level Adjustment

The device uses configuration files under <code>/data/aipc/etc/*.yaml</code>; the repository's <code>configs/</code> directory contains templates only. For temporary extra logging, back up the configuration, adjust <code>log_level</code>, reload the service according to its startup method, and restore the original level afterward.

~~~bash
journalctl -u ai-runtime --since "1 hour ago" | grep -i error
journalctl -u ai-runtime | grep -E "timeout|connection refused|permission denied"
~~~

Common levels are <code>debug</code>, <code>info</code>, <code>warn</code>, and <code>error</code>. Do not leave <code>debug</code> enabled in production because logs can fill the disk quickly.

### 8.6 Performance Monitoring & Resource Checks

~~~bash
top -p $(pgrep -f ai-runtime)
free -h
df -h / /data
iostat -x 1 5
~~~

For service-specific status, query AI Runtime, the app, and device-control:

~~~bash
grpcurl -plaintext -d '{}' unix:///run/aipc/ai-runtime.sock aipc.inference.InferenceService/GetStats
aipc-cli app info <app-id>
grpcurl -plaintext -d '{}' unix:///run/aipc/device-control.sock aipc.device.DeviceControl/GetDeviceStatus
~~~

## Appendix A: Error Codes

These are common business error codes returned by <code>platform-api</code>; the full definition is in <code>platform/platform-api/handlers/response.go</code>.

| Code | Meaning | Code | Meaning | Code | Meaning |
|:---|:---|:---|:---|:---|:---|
| 0 | Success | 1000 | Unknown error | 1001 | Invalid request |
| 1002 | Invalid JSON | 1003 | Missing parameter | 1004 | Invalid parameter |
| 2000 | Unauthenticated | 2001 | Permission denied | 2002 | Token expired |
| 2003 | Invalid token | 3000 | Service unavailable | 3001 | Service timeout |
| 3002 | Service error | 3003 | gRPC error | 3004 | Database error |
| 4000 | Resource not found | 4001 | Resource already exists | 4002 | Resource exhausted |
| 4003 | Operation failed | 5000 | Model not found | 5001 | Model load failed |
| 5002 | Inference error | 5003 | Invalid model format | 6000 | App not found |
| 6001 | App installation failed | 6002 | App startup failed | 6003 | App stop failed |
| 6004 | App is running | 6005 | App is not running | 7000 | Device error |
| 7001 | PTZ error | 7002 | Camera error | 7003 | GPIO error |
| 8000 | File not found | 8001 | File upload failed | 8002 | File deletion failed |
| 8003 | Storage full | 8004 | Access denied | 9000 | SSH configuration error |
| 9001 | SSH service error | 10000 | Process not found | 10001 | Process termination failed |

> <code>DELETE /ai/models/&lt;id&gt;</code> may also delete the model file. If a factory HEF has no backup, it cannot be recovered after deletion; confirm the file copy before deleting.

## Related Docs

- [System Architecture · Platform Services Layer](./3-software-guide/0-system-architecture.md) — service responsibilities and socket relationships
- [System Flashing](./3-software-guide/2-system-flashing.md) — boot-chain recovery and system flashing
- [Hardware Wiring](./2-user-guide/8-product-wiring.md) — peripheral wiring and terminal definitions
- [Deployment & Operations](./2-user-guide/5-deployment.md) — disk, OTA, and rollback
