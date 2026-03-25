---
description: NeoMind is an edge AI platform powered by Large Language Models (LLM), supporting local deployment, device management, automation control, and AI conversations. This guide will help you quickly complete installation, configuration, and core feature usage.
keywords: [NeoMind, quick start, edge AI, LLM platform, device management, MQTT, Ollama, automation, IoT]
tags: [NeoMind, quick start, edge AI, device management]
---

import SupportGrid from '@site/src/components/SupportGrid';

# NeoMind Quick Start Guide

## Overview

NeoMind is an edge AI platform that brings the power of Large Language Models (LLM) to CamThink AI cameras and IoT device management and automation. Through a natural language interface, you can easily query device status, create automation rules, and have intelligent conversations with the AI assistant.

**Core Features**:

- **LLM-Powered**: Supports multiple LLM backends including Ollama, OpenAI, and Anthropic
- **Edge Deployment**: Fully offline operation with secure, local data
- **Device Management**: Supports MQTT protocol with automatic device discovery and registration
- **Automation Engine**: Event-driven rule engine for intelligent device coordination
- **AI Agents**: Autonomous agents for complex task execution
- **Cross-Platform Support**: Native desktop applications for macOS, Windows, and Linux

**System Requirements**:

- **Operating System**: macOS 11+, Windows 10+, Ubuntu 20.04+
- **Memory**: 8GB RAM (16GB+ recommended)
- **Storage**: 5GB available space
- **Network**: Supports offline operation (internet connection recommended for model download)

## 1. Installation and Registration

### 1.1 Download and Install

Visit the [NeoMind official release page](https://github.com/camthink-ai/NeoMind/releases/latest) and select the installer for your operating system:

- **macOS**: Download the `.dmg` file (supports both Apple Silicon and Intel chips)
- **Windows**: Download the `.msi` or `.exe` installer
- **Linux**: Download the `.AppImage` or `.deb` package

**macOS Installation Steps**:

1. Double-click the downloaded `.dmg` file and drag NeoMind to the Applications folder

![NeoMind macOS Installation](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-install-macOS.png)

2. **Important**: Before launching NeoMind for the first time, execute the following command (macOS security requirement):

```bash
sudo xattr -rd com.apple.quarantine /Applications/NeoMind.app
```

**Windows Installation Steps**:

Double-click the `.msi` or `.exe` file and follow the installation wizard.

**Linux Installation Steps**:

```bash
# AppImage method (recommended)
chmod +x neomind_0.5.11_amd64.AppImage
./neomind_0.5.11_amd64.AppImage

# deb package method
sudo dpkg -i neomind_0.5.11_amd64.deb
sudo apt-get install -f  # Install dependencies
```

### 1.2 First Launch and Registration

When you launch NeoMind for the first time, the system will guide you through the initial setup.

**Step 1**: Launch the application to enter the welcome screen

![NeoMind Registration Screen](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-register.png)

**Step 2**: Create an administrator account

![Create Administrator Account](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-register-1.png)

Fill in the following information:

- **Username**: Administrator account name (3-20 characters)
- **Password**: Strong password (at least 8 characters, including letters and numbers)
- **Confirm Password**: Re-enter the password

**Step 3**: Configure timezone and complete registration

![Registration Complete](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-register-2.png)

After successful registration, the system will automatically redirect to the login screen.

### 1.3 Login to the System

Use the administrator account you just created to log in to NeoMind.

![First Login](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-first-login.png)

**Note**:

- NeoMind supports local offline login with data stored in a local database
- After the first login, the system will automatically create default configuration files

## 2. System Configuration

### 2.1 Configure LLM Backend

NeoMind's core capabilities come from Large Language Models. We recommend using **Ollama** for local deployment to achieve fully offline operation.

**Prerequisites**:

- Local LLM (Ollama recommended) or other LLM backend (OpenAI, Anthropic, DeepSeek, etc.)

**Recommended Configuration**: Ollama Local Deployment

```bash
# Linux/macOS install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull recommended models
ollama pull ministral-3:3b  # Lightweight model (3B parameters)
ollama pull deepseek-r1:7b  # High-performance model (7B parameters)
```

**Verify Ollama Installation**:

Before configuring NeoMind, verify that Ollama is running properly:

```bash
# Test Ollama API
curl http://localhost:11434/api/version

# Test model inference
ollama run ministral-3:3b "Hello"
```

![Ollama Pre-Test](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/ollama-pre-test.png)

**Configuration Steps**:

**Step 1**: Go to Settings page and select "LLM Configuration"

![LLM Configuration Page 1](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-llm-1.png)

**Step 2**: Add LLM backend

![LLM Configuration Page 2](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-llm-2.png)

Click "Add Backend" and select the backend type according to your needs:

**Configure Ollama (Local Deployment, Recommended)**:

- **Backend Type**: Select Ollama
- **Name**: e.g., "Local Ollama"
- **Endpoint Address**: `http://localhost:11434` (default port)
- **Model**: Select the pulled model (e.g., `ministral-3:3b`)

**Configure OpenAI (Cloud Service)**:

- **Backend Type**: Select OpenAI
- **Name**: e.g., "OpenAI GPT-4"
- **Endpoint Address**: `https://api.openai.com/v1` (default)
- **API Key**: Enter your OpenAI API Key
- **Model**: Select a model (e.g., `gpt-4`, `gpt-3.5-turbo`)

**Supported LLM Backend Comparison**:


| Backend | Default Endpoint | Features | Use Cases |
|---------|------------------|----------|-----------|
| Ollama | http://localhost:11434 | Local deployment, fully offline | Edge devices, high privacy requirements |
| OpenAI | https://api.openai.com/v1 | Cloud service, powerful performance | Requires strongest model capabilities |


**Verify Configuration**:

After completing the configuration, click the "Test Connection" button to ensure NeoMind can successfully connect to the LLM backend.

![LLM Configuration Test](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-llm-2.png)

### 2.2 Configure Device Connection

NeoMind supports multiple device connection protocols for easy integration with different types of IoT devices and CamThink hardware products:

**Supported Connection Methods**:

- **MQTT Protocol**: The most common IoT communication protocol (recommended)
- **HTTP/Webhook**: Supports RESTful API and Webhook callbacks

**Configuration Steps**:

**Step 1**: Go to "Device Connection" settings page

![Device Connection Configuration 1](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-device-connection-1.png)

**Step 2**: Add MQTT broker

![Device Connection Configuration 2](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-device-connection-2.png)

Fill in the following information:

- **Name**: e.g., "EMQX Public Broker"
- **Address**: `broker.emqx.io` (public test server)
- **Port**: `1883` (default port)
- **Username/Password**: Public servers typically don't require these (leave blank)

**Other Common Public MQTT Brokers**:

- **Mosquitto Test Server**: `test.mosquitto.org:1883`
- **HiveMQ Public Server**: `broker.hivemq.com:1883`

**Step 3**: Save configuration

![Device Connection Configuration 3](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-settings-device-connection-3.png)

After saving, NeoMind will automatically attempt to connect to the MQTT broker, and the connection status will be displayed at the top of the page.

## 3. Device Management

### 3.1 Understanding Device Types

Before adding devices, you need to define device types. A device type describes the device's:

- **Uplink**: Data reported from the device to NeoMind (e.g., temperature, humidity, video analysis results)
- **Downlink**: Control commands sent from NeoMind to the device (e.g., restart, configuration update)

**Note**: Uplink means "uplink" (device → NeoMind), Downlink means "downlink" (NeoMind → device)

**Step 1**: Go to "Device Types" management page

![Device Type Management 1](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-1.png)

**Step 2**: Import or create device types

NeoMind supports three ways to add device types:

**Method 1: Quick Import CamThink Device Types (Recommended)**

If you use CamThink hardware products, you can quickly import preset device types:

1. Click "Import Device Type"
2. Select CamThink device model:
  - **NE101 Smart Camera**: Event-triggered ultra-low power smart camera with PIP/radar trigger support and long battery life
  - **NE301 Smart Camera**: Edge AI camera with 0.6TOPS compute power for real-time AI inference
3. Click "Confirm Import"

![Import CamThink Device Type](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-2.png)

**Method 2: Import Third-Party Device Types**

For third-party devices, you can:

1. Import device type definitions from JSON files
2. Import from NeoMind community template library
3. Use AI assistance to generate device types (based on data samples)

**Method 3: Manually Create Device Types**

If you need to customize device types, you can click the "Create Device Type" button and follow the on-screen prompts to fill in the basic device type information, define uplink metrics and downlink commands, then save.

![Manual Device Type Creation Interface](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-11.png)

After creation, you can view all defined types in the device type list:

![Device Type List](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-3.png)

### 3.2 Add Devices

There are two ways to add devices:

**Method 1: Manually Add Device**

**Step 1**: Go to "Device Management" page

![Device Management Page](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-4.png)

**Step 2**: Click "Add Device"

![Add Device](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-5.png)

Fill in the following information:

- **Device Name**: e.g., "Front Door Monitoring Camera"
- **Device Type**: Select CamThink NE301 Smart Camera
- **Device ID**: Unique identifier (auto-generated or manually entered), keep this ID consistent with the one on NE101/NE301
- **MQTT Uplink Topic**: Topic where the device publishes data (e.g., `/device/76b2fc32/uplink`)
- **MQTT Downlink Topic**: Topic for controlling the device (e.g., `/device/76b2fc32/downlink`)

![Pending Device Registration](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-8.png)

**Reference MQTT settings on NE301 at Application Management -> MQTT Settings**

![Save Device](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-7.png)

**Method 2: Auto-Discover Devices**

If your device supports connection to an MQTT server, NeoMind will automatically detect and list pending devices for registration.

![Configure Device Parameters](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-6.png)

Click the "Scan" tab to view the list of discovered devices, select the devices you want to add, and confirm registration.

### 3.3 View Device Status

In the device list, click the device name to view details

![Device Details](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-9.png)

You can manually trigger capture or set up scheduled capture, and the device will come online quickly

![Device Real-Time Data](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-device-management-10.png)

## 4. Dashboard Configuration

### 4.1 Dashboard Overview

The Dashboard provides a visual data display interface for centralized device status, data, and history management. Users can customize components and data sources.

**Step 1**: Go to Dashboard management page

![Dashboard Management Page](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-1.png)

### 4.2 Create Dashboard

**Step 1**: Click "Create Dashboard"

![Create Dashboard](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-2.png)

**Step 2**: Add data panels

![View Dashboard](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-5.png)

After clicking "Add Panel", you can customize data display panels:

- **Panel Type**: Choose data display method (line chart, gauge, value card, etc.)
- **Device Selection**: Select the device to monitor
- **Data Set**: Select device data fields, including:
  - Device name and status
  - Sensor data (temperature, humidity, etc.)
  - AI recognition results (detected objects, counts, etc.)
  - Other custom metrics

![Adjust Layout](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-4.png)

### 4.3 Using Dashboards

The Dashboard provides an intuitive display of device data and AI analysis results. For example, in a beverage inventory monitoring scenario, you can view:

- **Device Information**: Device name and online status
- **Real-Time Data**: Current detected beverage count
- **Data Trends**: Historical curve of beverage count changes
- **Sample Images**: Historical image records collected by the device

![Dashboard Example](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-dashboard-6.png)

You can create multiple dashboards for different scenarios to meet various business requirements.

## 5. AI Chat Assistant

### 5.1 Start Conversation

NeoMind includes an AI chat assistant that allows you to query device status, control devices, or create automation rules using natural language.

**Step 1**: Click the "Chat" icon in the left navigation bar

![AI Chat Interface](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-chat-0.png)

**Step 2**: Enter natural language commands

![AI Conversation Example](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-ai-agent-3.png)

**Example Conversation**:

```
User: How many bottles are in the beverage cabinet now?
AI: The beverage cabinet currently has 47 bottles.
    Including 18 cola, 15 mineral water, and 14 juice.
    This is 8 bottles less than yesterday.

User: How has the beverage consumption been recently?
AI: In the past 7 days, 52 bottles were consumed.
    Average daily consumption is 7.4 bottles, with Friday
    having the highest consumption (12 bottles).
    At the current consumption rate, inventory will last
    about 6 days.

User: Remind me to restock when beverages are below 20 bottles
AI: I'll create a rule for you:
    "When total beverage cabinet count < 20 bottles,
    send a restock reminder to your phone"
    Confirm creation?
```

### 5.2 AI Capabilities

The NeoMind AI assistant can complete the following tasks through natural language:

- **Device Query**: Query device status, historical data, fault diagnosis
- **Device Control**: Switch devices, adjust parameters, batch control
- **Automation Management**: Create/modify rules, query execution history
- **Smart Recommendations**: Optimize configuration, anomaly alerts, energy-saving suggestions

## 6. Advanced Features

### 6.1 AI Agents

AI agents are intelligent programs with autonomous execution capabilities that can complete complex automation tasks.

**Step 1**: Go to "AI Agents" management page

![AI Agent Management](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-ai-agent-1.png)

**Step 2**: Create AI agent

![Create AI Agent](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-ai-agent-2.png)

Fill in the following information:

- **Name**: e.g., "Temperature Monitoring Agent"
- **Description**: Task description of the agent
- **Trigger Condition**: When to execute (scheduled, event-triggered, etc.)
- **Execution Logic**: Workflow of the agent

**Example: Beverage Inventory Monitoring Agent**

```yaml
Name: Beverage Inventory Monitoring Agent
Trigger Condition: Every 30 minutes
Execution Logic:
  1. Read current beverage cabinet count
  2. If count < 20 bottles:
     - Send restock reminder to phone
     - Log inventory warning
  3. If count < 10 bottles:
     - Send urgent restock notification
     - Automatically send restock request to supplier
```

**Step 3**: Enable agent

After creation, enable the agent and it will run automatically according to the configured logic.

### 6.2 Automation Rules

Automation rules are event-driven. When conditions are met, preset actions are automatically executed.

**Step 1**: Go to "Automation Rules" management page

![Automation Rules Management](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-automation-1.png)

**Step 2**: Create rule

![Create Automation Rule](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-automation-2.png)

**Example Rule**:

```
Rule Name: Beverage Inventory Alert
Trigger Condition: Total beverage cabinet count < 20 for 5 minutes
Actions:
  1. Send restock reminder to phone
  2. Log inventory status
  3. Send email notification to administrator
```

**Rule Types**:

- **Threshold Rules**: Based on numerical comparison (temperature, humidity, etc.)
- **Time Rules**: Based on time triggers (scheduled tasks)
- **Status Rules**: Based on device status changes (switch, online/offline)
- **Combination Rules**: Logical combinations of multiple conditions

### 6.3 Plugin System

NeoMind supports plugin extensions. You can install official or third-party plugins to enhance system functionality.

**Step 1**: Go to "Plugins" management page

![Plugin Management](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-extension-1.png)

**Step 2**: Browse available plugins

![Plugin List](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-extension-2.png)

**Official Plugins**:

- **Weather Service**: Get real-time weather data
- **Data Backup**: Automatically backup configuration and data

**Step 3**: Install plugin

Click the "Install" button on a plugin, and NeoMind will automatically download and install it. After installation, the plugin will appear in the installed list.

### 6.4 Message Notifications

NeoMind provides a flexible notification system supporting multiple notification channels and trigger rules.

**Notification Channels**:

- **In-App Notification**: Display in NeoMind interface
- **Email Notification**: Send to specified email address
- **Webhook**: Push to third-party services like Enterprise WeChat or DingTalk
- **SMS Notification**: Send to mobile phone (requires SMS service configuration)

![Message Notification Settings](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-message-1.png)

![Message Rule Configuration](https://resources.camthink.ai/wiki/img/ai-application/neomind-quick-start/neomind-message-2.png)

## 7. Troubleshooting

**Cannot Connect to Ollama**:
- Confirm Ollama service is running: `curl http://localhost:11434/api/version`
- Confirm model is pulled: `ollama list`
- Restart service: `ollama serve`

**Device Cannot Connect to MQTT Broker**:
- Check if MQTT broker is running
- Verify device MQTT configuration (topic, username, password)
- Check NeoMind logs (`~/Library/Logs/NeoMind/`)

**macOS Security Prompt**:
```bash
sudo xattr -rd com.apple.quarantine /Applications/NeoMind.app
```

**Slow AI Response**:
- Use lightweight models (recommend `ministral-3:3b` or `deepseek-r1:7b`)
- Increase system memory (16GB+ recommended)
- Use GPU acceleration (if supported)

## 8. Appendix

### 8.1 Data Storage Location

| Platform | Data Directory |
|----------|---------------|
| macOS | `~/Library/Application Support/NeoMind/data/` |
| Windows | `%APPDATA%/NeoMind/data/` |
| Linux | `~/.config/NeoMind/data/` |

**Main Database Files**:
- `telemetry.redb` - Device time-series data
- `sessions.redb` - Chat history and sessions
- `devices.redb` - Device registry
- `automations.redb` - Automation rules

### 8.2 Related Resources

- **Official Website**: [https://www.camthink.ai](https://www.camthink.ai)
- **GitHub Repository**: [https://github.com/camthink-ai/NeoMind](https://github.com/camthink-ai/NeoMind)
- **Documentation Center**: [https://github.com/camthink-ai/NeoMind/tree/main/docs](https://github.com/camthink-ai/NeoMind/tree/main/docs)
- **Issue Tracker**: [https://github.com/camthink-ai/NeoMind/issues](https://github.com/camthink-ai/NeoMind/issues)

<SupportGrid />
