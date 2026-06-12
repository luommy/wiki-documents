---
description: 将设备接入 NeoMind 的完整指南：通过 MQTT（内置 Broker，自动发现）、HTTP Webhook、手动注册或外部 Broker 四种方式接入，含 ESP32/Python 示例与草稿审批流程。
keywords: [NeoMind, 设备接入, onboarding, MQTT, Webhook, 自动发现, ESP32]
tags: [NeoMind, 用户指南]
---

# 接入设备

NeoMind 提供四种设备接入方式，覆盖绝大多数 IoT 场景。本文按由易到难的顺序介绍。

## 接入方式总览

| 方式 | 适用场景 | 双向通信 | 推荐度 |
|------|---------|---------|--------|
| **MQTT（内置 Broker）** | 绝大多数设备 / 传感器 / 相机 | ✅（遥测 + 下行指令） | ⭐⭐⭐⭐⭐ |
| HTTP Webhook | 只能发 HTTP 的设备 / 第三方系统 | ❌（仅接收） | ⭐⭐⭐ |
| 手动注册 | 调试 / 自定义设备类型 | 取决于适配器 | ⭐⭐ |
| 外部 MQTT Broker | 已有 EMQX/Mosquitto 的环境 | ✅ | ⭐⭐⭐⭐ |

## 第一步：查看连接信息

接入任何设备前，先拿到 NeoMind 的连接参数。两种途径：

**CLI**（最全）：

```bash
neomind system info
```

输出包含：

- **MQTT Broker 地址**：`mqtt://<SERVER_IP>:1883`（启用 TLS 时为 `mqtts://`）
- **TLS 状态**：`tls_enabled`（如为 true，需让设备信任 CA 证书）
- **认证状态**：`auth_enabled`（如为 true，凭据在 `credentials` 数组中）
- **Webhook URL 模板**：`http://<SERVER_IP>:9375/api/devices/{device_id}/webhook`
- **网络信息**：服务器 IP、WiFi SSID
- **已连接设备数**

**Web UI**：进入 **Settings（设置） → MQTT Broker**，可视化查看 Broker 状态、下载 CA 证书、查看凭据。

<!-- 截图占位符：Settings → MQTT Broker 页面 + Devices 列表
     建议上传 resources.camthink.ai/wiki/img/ai-application/neomind/user-guide/
     settings-mqtt.png / devices-list.png / pending-devices.png
-->

> **重要**：`neomind system info` 的实际输出可能因部署而异（TLS、认证、IP）。始终以命令输出为准。

## 方式一：MQTT（推荐）

NeoMind **内置 MQTT Broker**（监听 `:1883`），无需额外安装 EMQX/Mosquitto。设备连上后**发布到任意 topic** 即可被自动发现。

### 设备侧流程

1. 设备连接到 `<SERVER_IP>:1883`
2. 设备向任意 topic 发布遥测数据
3. NeoMind 自动发现设备并创建**草稿（draft）**
4. 用户在「待审批设备」中确认并命名

### Topic 与 Payload 格式

**Topic**：任意。常见模式：

```
devices/{device_id}/temperature
sensors/{sensor_id}/{metric_name}
```

**Payload**：简单 JSON：

```json
{"value": 23.5}
```

或带多字段与时间戳：

```json
{
  "temperature": 23.5,
  "humidity": 65.0,
  "timestamp": 1716200000
}
```

### 示例：ESP32 + Arduino（C++）

```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid     = "YOUR_WIFI";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "192.168.1.100";  // 来自 neomind system info
const int   mqtt_port   = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, mqtt_port);
  // 若启用了认证：
  // client.connect("esp32-sensor-01", "username", "password");
  client.connect("esp32-sensor-01");
}

void loop() {
  float temp = readTemperature();   // 你的传感器读数
  char msg[32];
  snprintf(msg, 32, "{\"value\": %.1f}", temp);
  client.publish("sensors/esp32-01/temperature", msg);
  delay(5000);
}
```

### 示例：Python

```python
import paho.mqtt.client as mqtt
import json, time

client = mqtt.Client("python-sensor-01")

# 若启用了 TLS：
# client.tls_set(ca_certs="ca-cert.pem")   # 从 Settings → MQTT 下载
# client.tls_insecure_set(False)

# 若启用了认证：
# client.username_pw_set("username", "password")

client.connect("192.168.1.100", 1883)

while True:
    data = {"temperature": 25.3, "humidity": 60.5}
    client.publish("sensors/python-01/data", json.dumps(data))
    time.sleep(10)
```

### 审批草稿设备

设备首次发送数据后，进入「待审批」。在 Web UI 的 **Devices（设备） → Pending（待审批）** 中处理，或用 CLI：

```bash
# 查看待审批草稿
neomind device drafts list

# 查看草稿详情（含采样数据、检测到的指标）
neomind device drafts get <DRAFT_ID>

# 审批并命名
neomind device drafts approve <DRAFT_ID> --name "ESP32 温度传感器" --type temp_sensor

# 或拒绝
neomind device drafts reject <DRAFT_ID>
```

### 自动发现配置

```bash
# 查看当前设置
neomind device drafts config

# 开启自动审批（跳过人工确认）
neomind device drafts config --auto-approve true

# 关闭自动发现
neomind device drafts config --enabled false

# 限制采样数（避免过多未知设备涌入）
neomind device drafts config --max-samples 5
```

## 方式二：HTTP Webhook

适合只能发 HTTP 请求的设备或第三方系统（单向接收）。

```bash
# 1. 先创建设备（拿到 device_id）
neomind device create --name "气象站" --device-type weather-station --adapter-type webhook

# 2. 查看该设备的 webhook URL
neomind device webhook-url <DEVICE_ID>
# 输出：POST http://<SERVER_IP>:9375/api/devices/<DEVICE_ID>/webhook
```

设备向该 URL 发 POST：

```bash
curl -X POST http://192.168.1.100:9375/api/devices/<DEVICE_ID>/webhook \
  -H 'Content-Type: application/json' \
  -d '{"data": {"temperature": 23.5, "humidity": 65}}'
```

Payload 结构：

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

## 方式三：手动注册

适合调试或需要自定义设备类型的场景。

```bash
# 1. 查看可用设备类型
neomind device types list

# 2. 创建设备
neomind device create --name "我的传感器" --device-type temp_sensor --adapter-type mqtt
# adapter-type 取值：mqtt（默认，双向）/ webhook（仅接收）

# 若无匹配类型，先创建类型
neomind device types create \
  --name 'My Sensor' \
  --metrics '[{"name":"temperature","display_name":"Temperature","data_type":"Float","unit":"°C"}]'

# 3. 验证
neomind device get <DEVICE_ID>
```

## 方式四：接入外部 MQTT Broker

如果已有 EMQX / Mosquitto 等外部 Broker，可让 NeoMind 订阅它，自动发现挂在那个 Broker 上的设备。

进入 **Settings → MQTT** 添加外部 Connector，或用 CLI：

```bash
neomind connector create --name "厂房EMQX" --host emqx.local --port 1883
neomind connector list            # 查看所有 Connector 与连接状态
neomind connector test <ID>       # 测试连接
neomind connector subscriptions   # 查看活跃订阅
```

## 向设备下发指令

支持双向通信的设备（MQTT 适配器）可接收下行指令：

```bash
neomind device control <DEVICE_ID> <command> --params '<json>'
# 例：开空调
neomind device control ac-01 power_on --params '{"mode": "cool", "temp": 24}'
```

指令通过 MQTT 发到 `{device_topic}/command` 或 `{device_topic}/downlink`，设备订阅对应 topic 即可。

## 支持的设备类型

NeoMind 内置常见设备类型，覆盖 CamThink 硬件：

- **NE301**（边缘 AI 相机）— 视频流 + AI 推理
- **NE101**（感知相机）— 图像 + 环境传感

完整的设备类型定义（指标、指令、默认配置）在 [NeoMind-DeviceTypes](https://github.com/camthink-ai/NeoMind-DeviceTypes) 仓库。你可以引用这些类型，或提交自定义类型 JSON 到该仓库与社区共享。

## 常见问题

| 现象 | 排查 |
|------|------|
| 设备发送了数据但未出现 | 1. `neomind system info` 看 `mqtt.connected`  2. 确认设备发布到正确的 Broker IP  3. 检查「待审批」草稿列表 |
| Connection refused | 服务未运行或端口（1883 MQTT / 9375 HTTP）被防火墙拦截 |
| Auth failed / Not authorized | 启用了认证。`neomind system info` 取凭据，配置到设备 |
| TLS handshake failed | 启用了 TLS。设备需用 `mqtts://` 并信任 CA 证书（Settings → MQTT 下载） |
| Webhook 返回 404 | 必须先 `neomind device create` 创建设备，再用返回的 device_id 拼 webhook URL |
| 收到 corrupt message | 设备用明文 TCP 连了 TLS 端口。改用 `mqtts://` |

更多见 [故障排查](./10-troubleshooting.md)。

---

*最后更新: 2026-06-12 · NeoMind v0.8.11*
