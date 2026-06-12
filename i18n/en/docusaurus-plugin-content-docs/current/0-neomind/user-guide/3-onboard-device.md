---
description: Complete guide to onboarding devices into NeoMind via MQTT (embedded broker, auto-discovery), HTTP webhook, manual registration, or an external broker. Includes ESP32/Python examples and the draft approval flow.
keywords: [NeoMind, device onboarding, MQTT, webhook, auto-discovery, ESP32]
tags: [NeoMind, User Guide]
---

# Onboard a Device

NeoMind offers four ways to connect devices, covering the vast majority of IoT scenarios. This guide covers them in order of simplicity.

## Connection Methods at a Glance

| Method | Best for | Bidirectional | Recommended |
|--------|----------|---------------|-------------|
| **MQTT (embedded broker)** | Most devices / sensors / cameras | ✅ (telemetry + commands) | ⭐⭐⭐⭐⭐ |
| HTTP Webhook | HTTP-only devices / 3rd-party systems | ❌ (receive only) | ⭐⭐⭐ |
| Manual registration | Debugging / custom device types | depends on adapter | ⭐⭐ |
| External MQTT broker | Existing EMQX/Mosquitto setups | ✅ | ⭐⭐⭐⭐ |

## Step 1: Find Your Connection Info

Before onboarding any device, grab NeoMind's connection parameters. Two ways:

**CLI** (most complete):

```bash
neomind system info
```

The output includes:

- **MQTT broker address**: `mqtt://<SERVER_IP>:1883` (or `mqtts://` when TLS is on)
- **TLS status**: `tls_enabled` (if true, devices must trust the CA cert)
- **Auth status**: `auth_enabled` (if true, credentials are in the `credentials` array)
- **Webhook URL template**: `http://<SERVER_IP>:9375/api/devices/{device_id}/webhook`
- **Network info**: server IP, WiFi SSID
- **Connected device count**

**Web UI**: Go to **Settings → MQTT Broker** for a visual view of broker status, CA cert download, and credentials.

<!-- Screenshot placeholder: Settings → MQTT Broker + Devices list + Pending devices
     Upload to resources.camthink.ai/wiki/img/ai-application/neomind/user-guide/
     settings-mqtt.png / devices-list.png / pending-devices.png
-->

> **Important**: `neomind system info` output varies by deployment (TLS, auth, IP). Always trust the command output over the defaults documented here.

## Method 1: MQTT (Recommended)

NeoMind **embeds an MQTT broker** (listening on `:1883`) — no need to install EMQX/Mosquitto. Once a device connects and **publishes to any topic**, it's auto-discovered.

### Device-Side Flow

1. The device connects to `<SERVER_IP>:1883`
2. The device publishes telemetry to any topic
3. NeoMind auto-discovers it and creates a **draft**
4. You approve and name the device under "Pending Devices"

### Topic & Payload Format

**Topic**: any. Common patterns:

```
devices/{device_id}/temperature
sensors/{sensor_id}/{metric_name}
```

**Payload**: simple JSON:

```json
{"value": 23.5}
```

Or with multiple fields and a timestamp:

```json
{
  "temperature": 23.5,
  "humidity": 65.0,
  "timestamp": 1716200000
}
```

### Example: ESP32 + Arduino (C++)

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid     = "YOUR_WIFI";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "192.168.1.100";  // from neomind system info
const int   mqtt_port   = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, mqtt_port);
  // If auth is enabled:
  // client.connect("esp32-sensor-01", "username", "password");
  client.connect("esp32-sensor-01");
}

void loop() {
  float temp = readTemperature();   // your sensor reading
  char msg[32];
  snprintf(msg, 32, "{\"value\": %.1f}", temp);
  client.publish("sensors/esp32-01/temperature", msg);
  delay(5000);
}
```

### Example: Python

```python
import paho.mqtt.client as mqtt
import json, time

client = mqtt.Client("python-sensor-01")

# If TLS is enabled:
# client.tls_set(ca_certs="ca-cert.pem")   # download from Settings → MQTT
# client.tls_insecure_set(False)

# If auth is enabled:
# client.username_pw_set("username", "password")

client.connect("192.168.1.100", 1883)

while True:
    data = {"temperature": 25.3, "humidity": 60.5}
    client.publish("sensors/python-01/data", json.dumps(data))
    time.sleep(10)
```

### Approve a Draft Device

After a device sends its first payload, it lands in "Pending". Handle it in the Web UI under **Devices → Pending**, or via CLI:

```bash
# List pending drafts
neomind device drafts list

# View draft details (sample data, detected metrics)
neomind device drafts get <DRAFT_ID>

# Approve and name
neomind device drafts approve <DRAFT_ID> --name "ESP32 Temp Sensor" --type temp_sensor

# Or reject
neomind device drafts reject <DRAFT_ID>
```

### Auto-Discovery Configuration

```bash
# View current settings
neomind device drafts config

# Enable auto-approve (skip manual review)
neomind device drafts config --auto-approve true

# Disable auto-discovery entirely
neomind device drafts config --enabled false

# Cap sample count (prevents flooding from unknown devices)
neomind device drafts config --max-samples 5
```

## Method 2: HTTP Webhook

For devices or 3rd-party systems that can only push HTTP (one-way).

```bash
# 1. Create the device first (capture the device_id)
neomind device create --name "Weather Station" --device-type weather-station --adapter-type webhook

# 2. Get the device's webhook URL
neomind device webhook-url <DEVICE_ID>
# Output: POST http://<SERVER_IP>:9375/api/devices/<DEVICE_ID>/webhook
```

The device POSTs to that URL:

```bash
curl -X POST http://192.168.1.100:9375/api/devices/<DEVICE_ID>/webhook \
  -H 'Content-Type: application/json' \
  -d '{"data": {"temperature": 23.5, "humidity": 65}}'
```

Payload structure:

```json
{
  "timestamp": 1716200000,
  "quality": 1.0,
  "data": {
    "temperature": 23.5,
    "humidity": 65
  }
}
```

## Method 3: Manual Registration

For debugging or custom device types.

```bash
# 1. List available device types
neomind device types list

# 2. Create the device
neomind device create --name "My Sensor" --device-type temp_sensor --adapter-type mqtt
# adapter-type values: mqtt (default, bidirectional) / webhook (receive only)

# If no type matches, create one first
neomind device types create \
  --name 'My Sensor' \
  --metrics '[{"name":"temperature","display_name":"Temperature","data_type":"Float","unit":"°C"}]'

# 3. Verify
neomind device get <DEVICE_ID>
```

## Method 4: Connect an External MQTT Broker

If you already run EMQX / Mosquitto / etc., you can have NeoMind subscribe to it and auto-discover devices attached to that broker.

Go to **Settings → MQTT** to add an external Connector, or via CLI:

```bash
neomind connector create --name "Plant EMQX" --host emqx.local --port 1883
neomind connector list            # list all connectors and their status
neomind connector test <ID>       # test a connection
neomind connector subscriptions   # list active subscriptions
```

## Send Commands to a Device

Bidirectional devices (MQTT adapter) can receive downlink commands:

```bash
neomind device control <DEVICE_ID> <command> --params '<json>'
# Example: turn on the AC
neomind device control ac-01 power_on --params '{"mode": "cool", "temp": 24}'
```

Commands are delivered over MQTT to `{device_topic}/command` or `{device_topic}/downlink` — the device subscribes to that topic to receive them.

## Supported Device Types

NeoMind ships with built-in types for CamThink hardware:

- **NE301** (Edge AI Camera) — video streaming + AI inference
- **NE101** (Sensing Camera) — image + environmental sensing

Full device type definitions (metrics, commands, default config) live in the [NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes) repo. You can reference these types, or submit custom type JSONs there to share with the community.

## Common Issues

| Symptom | Troubleshoot |
|---------|--------------|
| Device sent data but doesn't appear | 1. `neomind system info` → check `mqtt.connected`  2. Confirm the device publishes to the right broker IP  3. Check the "Pending" drafts list |
| Connection refused | Server not running, or port (1883 MQTT / 9375 HTTP) blocked by firewall |
| Auth failed / Not authorized | Auth is on. Get credentials from `neomind system info` and configure the device |
| TLS handshake failed | TLS is on. Use `mqtts://` and trust the CA cert (download from Settings → MQTT) |
| Webhook returns 404 | You must `neomind device create` first, then use the returned device_id in the webhook URL |
| "Received corrupt message" | Device used plain TCP on a TLS port. Switch to `mqtts://` |

More in [Troubleshooting](./10-troubleshooting.md).

---

*Last updated: 2026-06-12 · NeoMind v0.8.11*
