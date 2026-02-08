---
title: AI-Driven QSC Compliance for Chain Restaurants
description: This use case demonstrates how to manage insect trap box status through edge AI solutions, transforming "scheduled cleaning" into "demand-driven" operations to improve QSC management in fast-food chains.
tags: [Camthink, NeoEye 301, AI, QSC, Smart Monitoring, Home Assistant]
sidebar_label: AI-Driven QSC For Chain Restaurant
sidebar_position: 6
---

# Case Study - **AI-Driven QSC For Chain Restaurant**

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_1.jpg)

## 1. Preface

**[CamThink](https://www.camthink.ai/?utm_source=wiki&utm_medium=social&utm_campaign=use_case&utm_content=trapbox-monitor-20260203)** is a new developer-focused brand from **Milesight**, created to make edge AI simpler for everyone. We build open, developer-friendly edge AI hardware for both community builders and enterprise engineers. And help them to move from early prototypes to reliable real-world deployments — accelerating your strategy in edge AI.

**Camthink** **[NeoEye 301](https://www.camthink.ai/product/neoeyes-301/?utm_source=wiki&utm_medium=social&utm_campaign=use_case&utm_content=trapbox-monitor-20260203)** is powered by the STM32N6(Cortex-M55) processor with the Neural-ART" NPU, which delivers real-time Al inference and professional grade image processing with ultra-low power consumption.

**[Home Assistant](https://www.home-assistant.io/integrations/)** is a free, open-source home automation platform designed to be a central "brain" for your smart applications, it prioritizes **local control** and **privacy**, As of early 2026, Home Assistant has become significantly more user-friendly through its "Year of Voice" and "Collective Intelligence" initiatives.

In the world of global fast-food chains, **QSC (Quality, Service, Cleanliness)** isn't just a metric— It is the foundation of brand trust. Within the "Cleanliness" pillar, insect management is one of the most critical yet labor-intensive tasks.

In this use case, we will show you how to manage the Insect trap box status to by Edge AI solutions to shift "**Scheduled Cleaning**" to "**Demand-driven**".

## 2. Requirement

**Hardware:**

- Camthink [NeoEye 301](https://www.camthink.ai/product/neoeyes-301/?utm_source=wiki&utm_medium=social&utm_campaign=use_case&utm_content=trapbox-monitor-20260203), Ultra-Low Power Vision AI Camera. Cellular version is recommended

**Software Platform:**

- **Camthink** **[AI Tool Stack](https://github.com/camthink-ai/AIToolStack?utm_source=wiki&utm_medium=social&utm_campaign=use_case&utm_content=trapbox-monitor-20260203)**, an end-to-end AI toolset covering the entire workflow from data collection, annotation, training, quantization, to deployment.
- **HomeAssistant** **[Platform](https://www.home-assistant.io/installation/)**, you will need to install it in your server in advance.

## 3. Configuration

In this part, we will show you how to achieve this full usecase step by step.

### 3.1 Install the NE301 correctly

Firstly, install **Camthink [NE301**](https://www.camthink.ai/product/neoeyes-301/?utm_source=wiki&utm_medium=social&utm_campaign=use_case&utm_content=trapbox-monitor-20260203) with SIM card inside correctly, press and hold the button for 2 or 3 seconds to activate the WiFi.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_3.jpg)

### 3.2 Configure the network and MQTT data forwarding.

Connect the WiFI endpoints start with NE301_`<Last 6 MAC digits>`, Input the default IP address: `192.168.10.10`

- **Default Username:** `admin`
- **Default password**: `hicamthink`


| ![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_4.jpg) | ![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_5.jpg) |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |


Click **Login** to see the live view with detailed settings. Navigate to **System settings** to connect the network access.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_6.jpg)

Camthink NE301 supports WiFi and Cellular modules. Choose the method to make sure the network access is connected.

Navigate to **Application Management** to configure where to forward the data and pictures.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_7.jpg)

Input the details of your own mqtt broker or AI tool stack server

- **Server address:** the IP address of the MQTT broker.
- **Port**: the port of MQTT server, default value: 1883
- **Data Receiving Topic**: the downlink command topic used to control and trigger the image capture.
- **Data Receiving Topic**: the uplink command topic used to traismit the data and the pictures.
- **Client id**: the mqtt client id, some servers will verify this value.
- **Username** : the username to join mqtt server, input it according to the server's needs.
- **Password**: the password to join mqtt server, input it according to the server's needs.

### 3.3 Collect the images, train and quantize the model.

Login Your own AI tool stack server to create a new project

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_8.jpg)

Click **Create New AI Model Project**, Input the name and description:

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_9.jpg)![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_10.jpg)

Open this project and bind the device for image collection. You will need to create this device first.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_11.jpg)![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_12.jpg)

The pictures of the refrigerator captured by NE301 will uplink as configured.

If you have prepared the images, just upload them to this platform directly for model training.

Before starting to train the models, create the Class here, in this example, we create two classes to identify whether the **Sticky paper** inside the **Insect trap box** is still **Effective** or **Critical-Replacement**.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_13.jpg)

Choose the proper type to tag the object.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_14.jpg)

Just do it one by one to make sure all the objects are marked correctly.

If you have the datasets already, just upload them here directly

Click '**Train Model**' to start the training.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_15.jpg)

Click '**New Training**' to create a new task, keep all the default settings

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_16.jpg)

Then start the training. It will take a little while.


| ![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_17.jpg) | ![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_18.jpg) |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |


To deploy the model into NE301, we need to quantize it before upload it to the device.

Click the **Quantize** button.


| ![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_19.jpg) | ![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_20.jpg) |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |


Click it to start, just keep the default settings here

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_21.jpg)

It takes a little while to finish it.

The **NE301 Model Package** (*.bin) is the exact quantized model. 

Click to download it.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_22.jpg)

You can also test the model here to confirm if all good

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_23.jpg)

### 3.4 Verify and Deploy the new model.

let's back to the device to upload the new model.

Click Upload button to install it

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_24.jpg)


| ![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_25.jpg) | ![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_26.jpg) |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |


When done, the chipsets on the shelf are marked correctly.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_27.jpg)

You can upload more images to verify the performance.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_28.jpg)

### 3.5 Configure the HomeAssistant applications.

To make the data values more valuable for customers, we choose HomeAssistant for integration and visualization. You can also connect it to other 3rd-party platforms.

Open the 'Devices & Services' to install the MQTT integration.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_29.jpg)

Click **Add Integration** button to install the MQTT addon.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_30.jpg)

Just input MQTT to search it.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_31.jpg)![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_32.jpg)

Choose the second one, and input the mqtt broker configured in NE301

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_33.jpg)![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_34.jpg)

Submit to save it. The MQTT connection is ready.

In this guide, we will try a new method to create the mqtt devices by Edit the configuration file **/homeassistant/configuration.yaml** directly.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_35.jpg)

Here is the configuration details in this guide:

```Python

# Loads default set of integrations. Do not remove.
default_config:

# Load frontend themes from the themes folder
frontend:
  themes: !include_dir_merge_named themes

automation: !include automations.yaml
script: !include scripts.yaml
scene: !include scenes.yaml

mqtt:
  sensor:
    # 1. Monitoring Status (from class_name)
    - name: "Monitoring Status"
      unique_id: "ne301_monitoring_status"
      state_topic: "device/76b2fc32/uplink"
      value_template: >-
        {% if value_json.ai_result.ai_result.detections | length > 0 %}
          {{ value_json.ai_result.ai_result.detections[0].class_name }}
        {% else %}
          None
        {% endif %}
      icon: "mdi:image-filter-center-focus"
    # 2. Battery (from battery_percent)
    - name: "Battery"
      unique_id: "ne301_battery"
      state_topic: "device/76b2fc32/uplink"
      value_template: "{{ value_json.device_info.battery_percent }}"
      device_class: battery
      unit_of_measurement: "%"
      state_class: measurement
    # 3. Last Event (from timestamp)
    - name: "Last Event"
      unique_id: "ne301_last_event"
      state_topic: "device/76b2fc32/uplink"
      value_template: "{{ (value_json.metadata.timestamp | int) | timestamp_local }}"
      device_class: timestamp
    # 4. Sensor Name (from device_name)
    - name: "Sensor Name"
      unique_id: "ne301_device_name_info"
      state_topic: "device/76b2fc32/uplink"
      value_template: "{{ value_json.device_info.device_name }}"
      icon: "mdi:id-card"

```

You will need to update the **name**, **state_topic**, the **class** value to yours.

Then apply the changes by click '**Manually configured MQTT entities'** in **Developer tools** page directly

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_36.jpg)![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_37.jpg)

You will find the Sensor is created correctly.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_38.jpg)

## 4. Quick Test

Let's start to monitor the level status of the trash bin. The status will appear with the values correctly

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_39.jpg)![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_40.jpg)![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_41.jpg)

You can also check it in more details in histories

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_42.jpg)

HomeAssistant platform supports the other appplications to trigger the alert, you can configure them to achieve the full management.

## Q&A

- Q: Can I use the same MQTT broker and [Camthink AI Tool Stack](https://github.com/camthink-ai/AIToolStack?utm_source=wiki&utm_medium=social&utm_campaign=use_case&utm_content=trapbox-monitor-20260203) for Model Training and Quantilization? A: The server in this guide is for internal use. You need to install your own AI Tool Stack on your own
- Q: Since the Chipset is smaller, how to improve the model's performance. A: You can try the option of **Input Size** to be **320** during the quantize process.

![](/img/ne301/application-guide/6-chain-restaurant-qsc-compliance/image_43.jpg)

- Q: How to set the value template in HomeAssistant? A: You can visit the HomeAssistant [website](https://www.home-assistant.io/docs/configuration/templating/#using-value-templates-with-mqtt) to get the details about how to use it. Here is an example of NE301's report data:

```JSON
{
  "metadata": {
    "image_id": "cam01_1767603614",
    "timestamp": 1770084900,
    "format": "jpeg",
    "width": 1280,
    "height": 720,
    "size": 38692,
    "quality": 60
  },
  "device_info": {
    "device_name": "NE301-2A38A5",
    "mac_address": "44:9f:da:2a:38:a5",
    "serial_number": "SN202500001",
    "hardware_version": "V1.1",
    "software_version": "1.0.1.1146",
    "power_supply_type": "full-power",
    "battery_percent": 100,
    "communication_type": "wifi"
  },
  "ai_result": {
    "model_name": "YOLOv8 Nano Object Detection Model",
    "model_version": "1.0.0",
    "inference_time_ms": 50,
    "confidence_threshold": 0.23999999463558197,
    "nms_threshold": 0.55000001192092896,
    "ai_result": {
  "type": 1,
  "detections": [
    {
      "index": 0,
      "class_name": "Effective",
      "confidence": 0.20715469121932983,
      "x": 0.0040618181228637695,
      "y": 0.052804142236709595,
      "width": 0.9992167949676514,
      "height": 0.8042476177215576
    }
  ],
  "detection_count": 1,
  "poses": [],
  "pose_count": 0,
  "type_name": "object_detection"
  },
    "encoding": "base64"
}
}

```