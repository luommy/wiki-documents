---
description: Comprehensive guide to refrigerator inventory monitoring using NeoEyes NE301 and Home Assistant. Learn data collection, model training, and MQTT integration for smart retail.
keywords: [Refrigerator Monitoring, Smart Retail, NeoEyes NE301, Home Assistant, MQTT Integration, AI Inventory, Inventory Tracking, STM32N6 AI, Edge AI Solution]
tags: [NE301, Smart Retail, Inventory Monitoring, Home Assistant, Case Study]
---

# Refrigerator Inventory Monitoring Application Guide

## Introduction

CamThink is a new developer-centric brand from Milesight, designed to make Edge AI simpler for everyone. We build open, developer-friendly Edge AI hardware for community builders and enterprise engineers, helping them transition from early prototypes to reliable real-world deployments—accelerating your Edge AI strategy implementation.

CamThink NeoEyes NE301 is powered by the STM32N6 (Cortex-M55) processor equipped with Neural-ART NPU, enabling real-time AI inference and professional-grade image processing with ultra-low power consumption.

Home Assistant is a free and open-source home automation platform designed to be the central "brain" of your smart applications, prioritizing local control and privacy. By early 2026, Home Assistant has become even more user-friendly through its "Year of Voice" and "Collective Intelligence" initiatives.

In this use case, we will show you how to manage the status of refrigerator beverages in the smart retail and warehousing industry.

## Hardware and Software Requirements

**Hardware:**
- CamThink NeoEyes NE301, ultra-low power vision AI camera.

**Software Platform:**
- **CamThink AI Tool Stack**: An end-to-end AI toolset covering the entire workflow from data collection, annotation, training, quantization to deployment.
- **Home Assistant Platform**: You need to install it on your server in advance.

## Operation Guide

In this section, we will show you step-by-step how to implement this complete use case.

### Correct Installation of NE301

First, correctly install the CamThink NE301 and press the button for 2 to 3 seconds to activate WiFi.

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/refrigerator1.png" alt="refrigerator1" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/refrigerator2.png" alt="refrigerator2" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

### Configure Network and MQTT Data Forwarding

Connect to the WiFi endpoint starting with `NE301_<last 6 digits of MAC>` and enter the default IP address: 192.168.10.10

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/connect.png" alt="connect" style={{display: 'block', margin: '20px auto', maxWidth: '40%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/login.png" alt="login" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

- **Default Username**: `admin`
- **Default Password**: `hicamthink`

Click login to view the live view with detailed settings.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/live.png" alt="live" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Navigate to **System Settings** to connect to network access.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/system.png" alt="system" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

> CamThink NE301 supports both WiFi and Cellular modules. Select the appropriate method to ensure network connectivity works.

Navigate to **Application Management** to configure where data and images will be forwarded.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/application-management.png" alt="application-management" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Enter definitions for your own MQTT Broker or AI Stack Server:
- **Server Address**: IP address of the MQTT Broker.
- **Port**: Port of the MQTT Server, default: 1883.
- **Data Receive Topic**: Downlink command topic for control and triggering image capture.
- **Data Send Topic**: Uplink command topic for transmitting data and pictures.
- **Client ID**: MQTT Client ID, some servers verify this value.
- **Username**: Username for connecting to the MQTT server, please input according to server requirements.
- **Password**: Password for connecting to the MQTT server, please input according to server requirements.

### Collect Images, Train and Quantize Model

Login to your own AI Tool Stack server to create a new project.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/AI-tool-stack.png" alt="AI-tool-stack" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Click to create a new AI Model project, enter name and description:

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack1.png" alt="stack1" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack2.png" alt="stack2" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

Open this project and bind the device for image collection. You need to create this device first.

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack3.png" alt="stack3" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack4.png" alt="stack4" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

Refrigerator pictures taken by NE301 will be uplinked as configured.
If you already have images prepared, you can directly upload them to this platform for model training.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack5.png" alt="stack5" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Before starting training, create a class here, we name it `Beverage`.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack6.png" alt="stack6" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Select the appropriate type to label objects.

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack7.png" alt="stack7" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack8.png" alt="stack8" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

Go through one by one to ensure all objects are labeled correctly.
If you already have a dataset, you can upload it directly here.

Click "Train Model" to start training.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack9.png" alt="stack9" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Click "New Training" to create a new task, keep all default settings.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack10.png" alt="stack10" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Then start training. This will take some time.

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack11.png" alt="stack11" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack12.png" alt="stack12" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

To deploy the model to NE301, we need to quantize it before uploading to the device. Click the Quantization button.

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack13.png" alt="stack13" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack14.png" alt="stack14" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

Click it to start, keep default settings here.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack15.png" alt="stack15" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

It takes a little time to complete. The NE301 model package (*.bin) is the precisely quantized model. Click to download.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack16.png" alt="stack16" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

You can also test the model here to confirm if everything is working fine.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack17.png" alt="stack17" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />


### Verify and Deploy New Model

Let's go back to the device to upload the new model. Click the upload button to install.

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack18.png" alt="stack18" style={{width: '32%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack19.png" alt="stack19" style={{width: '32%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack20.png" alt="stack20" style={{width: '32%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

After completion, beverage cans are marked correctly.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack21.png" alt="stack21" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

You can upload more pictures to verify performance.

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack22.png" alt="stack22" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack23.png" alt="stack23" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

### Configure Home Assistant Application

To make the data more valuable for customers, we chose Home Assistant for integration and visualization. You can also connect it to other third-party platforms.

Open “Devices & Services” to install MQTT integration.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack24.png" alt="stack24" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Click **Add Integration** button to install the MQTT plugin.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack25.png" alt="stack25" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Just type MQTT to search for it.

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack26.png" alt="stack26" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack27.png" alt="stack27" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

Choose the second one, and input the MQTT Broker configured in NE301.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack28.png" alt="stack28" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack29.png" alt="stack29" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Submit to save. MQTT connection is ready.

Create an MQTT device to ensure data can be subscribed correctly.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack30.png" alt="stack30" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Other settings keep default.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack31.png" alt="stack31" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Select type `Numeric` and enter entity name here.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack32.png" alt="stack32" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Keep these settings empty.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack33.png" alt="stack33" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Please enter specific MQTT details correctly here, especially downlink and uplink topics, and templates.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack34.png" alt="stack34" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

```jinja2
{{ value_json.ai_result.ai_result.detection_count }}
```
For more details on how to set value templates, you can visit the Home Assistant website or contact us.
Click "Next" and save.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack35.png" alt="stack35" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

The first entity for beverage count is created well.

Let's create the second entity to identify names.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack36.png" alt="stack36" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Input value template for `name`.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack37.png" alt="stack37" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

The value template name is different here.
```jinja2
{{ value_json.ai_result.ai_result.detections[0].class_name }}
```
Click submit to save it.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack38.png" alt="stack38" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Refresh the page to view activities with values correctly.
<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack39.png" alt="stack39" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

Home Assistant supports viewing on dashboards, including history records.
<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack40.png" alt="stack40" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

## Quick Test

Let's take some beverages to test.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack41.png" alt="stack41" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

The quantity of beverages changes immediately.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack42.png" alt="stack42" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

These values are also updated on the Home Assistant platform where customers can verify all historical data.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack43.png" alt="stack43" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

The Home Assistant platform supports other applications triggering alerts, which you can configure for comprehensive management.

## FAQ

**1. Q: Can I use the same MQTT Broker and CamThink AI Tool Stack for model training and quantization?**

A: The server in this guide is for internal use only. You need to install your own AI Tool Stack.

**2. Q: How to take full images more easily using NE301?**

A: We recommend connecting a tablet/phone to NE301's WiFi and capturing via the button here.

<img src="https://resources.camthink.ai/wiki/img/neoeyes-ne301-series/application-guide/refrigerator-inventory-monitoring/stack44.png" alt="stack44" style={{display: 'block', margin: '20px auto', maxWidth: '80%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />

**3. Q: How to set value templates in Home Assistant?**

A: You can visit the Home Assistant website for detailed information on how to use it. Here is an example of data reported by NE301:

```json
{
    "metadata": {
        "image_id": "cam01_1767513409",
        "timestamp": 1767513409,
        "format": "jpeg",
        "width": 1280,
        "height": 720,
        "size": 51464,
        "quality": 60},
    "device_info": {
        "device_name": "NE301-2A3E75",
        "mac_address": "44:9f:da:2a:3e:75",
        "serial_number": "SN202500001",
        "hardware_version": "V1.1",
        "software_version": "1.0.1.1146",
        "power_supply_type": "full-power",
        "battery_percent": 0,
        "communication_type": "wifi"},
    "ai_result": {
        "model_name": "YOLOv8 Nano Object Detection Model",
        "model_version": "1.0.0",
        "inference_time_ms": 50,
        "confidence_threshold": 0.5,
        "nms_threshold": 0.5,
        "ai_result": {
            "type": 1,
            "detections": [{
                "index": 0,
                "class_name": "Baverage",
                "confidence": 0.9015386700630188,
                "x": 0.0039368569850921631,
                "y": 0.17518982291221619,
                "width": 0.53541159629821777,
                "height": 0.82280164957046509}],
            "detection_count": 1,
            "poses": [],
            "pose_count": 0,
            "type_name": "object_detection"}},
        "image_data": "data:image/jpeg;base64,/9j/2wBDAA0J",
        "encoding": "base64"
}
```
