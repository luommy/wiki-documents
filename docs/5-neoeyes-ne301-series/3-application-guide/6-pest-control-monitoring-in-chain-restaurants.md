---
sidebar_label: Pest Control Monitoring in Chain Restaurants
---

# 连锁餐厅捕虫箱监测

案例研究 - 连锁餐厅捕虫箱监测

<div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
  <img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p1_0.jpeg" alt="image_p1_0.jpeg" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
  <img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p1_1.png" alt="image_p1_1.png" style={{width: '48%', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'}} />
</div>

## 1. 前言

CamThink 是 Milesight 旗下的全新开发者品牌，旨在让边缘 AI 更加简单易用。我们要为社区构建者和企业工程师打造开放、开发者友好的边缘 AI 硬件，帮助他们从早期原型迈向可靠的实际部署——加速您的边缘 AI 战略。

Camthink NeoEye 301 搭载了 STM32N6 (Cortex-M55) 处理器和 Neural-ART NPU，可提供实时 AI 推理和专业级图像处理，且功耗极低。

Home Assistant 是一个免费开源的家庭自动化平台，旨在成为智能应用的中央“大脑”，它优先考虑本地控制和隐私。截至 2026 年初，Home Assistant 通过“语音之年”和“集体智慧”计划，变得更加用户友好。

在全球快餐连锁行业中，QSC（质量、服务、清洁）不仅仅是一个指标——它是品牌信任的基础。在“清洁”这一支柱中，昆虫管理是最关键但也最耗费人力的任务之一。

在本案例中，我们将通过边缘 AI 解决方案展示如何管理捕虫箱状态，将“定期清洁”转变为“按需清洁”。

## 2. 需求

硬件：
• Camthink NeoEye 301，超低功耗视觉 AI 相机。建议使用蜂窝版本。

软件平台：
• Camthink AI 工具栈，端到端 AI 工具集，涵盖从数据收集、标注、训练、量化到部署的整个工作流。
• HomeAssistant 平台，您需要预先将其安装在服务器上。

## 3. 配置

在本部分中，我们将逐步展示如何实现此完整用例。

### 3.1 正确安装 NE301

首先，正确安装带有 SIM 卡的 Camthink NE301，按住按钮 2 或 3 秒以激活 WiFi。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p2_2.png" alt="image_p2_2.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p2_3.png" alt="image_p2_3.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

### 3.2 配置网络和 MQTT 数据转发

连接以 `NE301_<MAC 后 6 位>` 开头的 WiFI 热点，输入默认 IP 地址：192.168.10.10

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p2_4.png" alt="image_p2_4.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p2_5.png" alt="image_p2_5.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

默认用户名：admin 默认密码：hicamthink 点击 Login 查看详细设置的实时视图。导航到 System settings 连接网络。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p3_6.png" alt="image_p3_6.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

Camthink NE301 支持 WiFi 和蜂窝模块。选择一种方式确保网络已连接。导航到 Application Management 配置数据和图片的转发位置。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p3_7.png" alt="image_p3_7.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

输入您自己的 MQTT Broker 或 AI 工具栈服务器的详细信息：
• Server address: MQTT Broker 的 IP 地址。
• Port: MQTT 服务器端口，默认值：1883。
• Data Receiving Topic: 用于控制和触发图像捕获的下行命令主题。
• Data Receiving Topic: 用于传输数据和图片的上行命令主题。
• Client id: MQTT 客户端 ID，某些服务器会验证此值。
• Username : 加入 MQTT 服务器的用户名，根据服务器需求输入。
• Password: 加入 MQTT 服务器的密码，根据服务器需求输入。

### 3.3 收集图像、训练和量化模型

登录您自己的 AI 工具栈服务器以创建新项目。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p4_8.png" alt="image_p4_8.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

点击 Create New AI Model Project，输入名称和描述：

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p4_9.png" alt="image_p4_9.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p4_10.png" alt="image_p4_10.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

打开此项目并绑定设备以进行图像收集。您需要先创建此设备。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p5_11.png" alt="image_p5_11.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p5_12.png" alt="image_p5_12.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

NE301 拍摄的捕虫箱图片将按配置上传。如果您已准备好图像，直接上传到此平台进行模型训练即可。在开始训练模型之前，请在此处创建类别。在本示例中，我们创建两个类别来识别捕虫箱内的粘纸是“有效 (Effective)”还是“急需更换 (Critical-Replacement)”。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p5_13.png" alt="image_p5_13.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

选择正确的类型来标记对象。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p6_14.png" alt="image_p6_14.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

逐个操作以确保所有对象都标记正确。

如果您已有数据集，直接在此处上传。点击 'Train Model' 开始训练。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p6_15.png" alt="image_p6_15.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

点击 'New Training' 创建新任务，保留所有默认设置

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p7_16.png" alt="image_p7_16.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

然后开始训练。这需要一点时间。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p7_17.png" alt="image_p7_17.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p7_18.png" alt="image_p7_18.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

要将模型部署到 NE301，我们需要在上传到设备之前对其进行量化。

点击 Quantize 按钮。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p7_19.png" alt="image_p7_19.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p8_20.png" alt="image_p8_20.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

点击开始，这里保留默认设置

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p8_21.png" alt="image_p8_21.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

完成需要一点时间。

NE301 Model Package (*.bin) 即为精确的量化模型。点击下载。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p9_22.png" alt="image_p9_22.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

您也可以在此处测试模型以确认一切正常

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p9_23.png" alt="image_p9_23.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

### 3.4 验证并部署新模型

让我们回到设备上传新模型。

点击 Upload 按钮进行安装

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p10_24.png" alt="image_p10_24.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p10_25.png" alt="image_p10_25.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p10_26.png" alt="image_p10_26.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

完成后，捕虫箱内的检测目标将被正确标记。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p10_27.png" alt="image_p10_27.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

您还可以上传更多图像来验证性能。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p11_28.png" alt="image_p11_28.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

### 3.5 配置 HomeAssistant 应用

为了让数据值对客户更有价值，我们选择 HomeAssistant 进行集成和可视化。您也可以将其连接到其他第三方平台。

打开 'Devices & Services' 安装 MQTT 集成。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p11_29.png" alt="image_p11_29.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

点击 Add Integration 按钮安装 MQTT 插件。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p12_30.png" alt="image_p12_30.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

输入 MQTT 搜索。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p12_31.png" alt="image_p12_31.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p12_32.png" alt="image_p12_32.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

选择第二个，并输入在 NE301 中配置的 MQTT Broker

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p12_33.png" alt="image_p12_33.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p13_34.png" alt="image_p13_34.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

提交保存。MQTT 连接已就绪。

在本指南中，我们将尝试一种新方法，通过直接编辑配置文件 /homeassistant/configuration.yaml 来创建 MQTT 设备。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p13_35.png" alt="image_p13_35.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

以下是本指南中的配置详细信息：

```yaml
# 加载默认集成集。请勿删除。
default_config: 

# 从 themes 文件夹加载前端主题
frontend: 
  themes: !include_dir_merge_named themes 

automation: !include automations.yaml 
script: !include scripts.yaml 
scene: !include scenes.yaml 

mqtt: 
  sensor: 
    # 1. 监测状态 (来自 class_name) 
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

    # 2. 电池 (来自 battery_percent) 
    - name: "Battery" 
      unique_id: "ne301_battery" 
      state_topic: "device/76b2fc32/uplink" 
      value_template: "{{ value_json.device_info.battery_percent }}" 
      device_class: battery 
      unit_of_measurement: "%" 
      state_class: measurement 

    # 3. 最后事件 (来自 timestamp) 
    - name: "Last Event" 
      unique_id: "ne301_last_event" 
      state_topic: "device/76b2fc32/uplink" 
      value_template: "{{ (value_json.metadata.timestamp | int) |  
timestamp_local }}" 
      device_class: timestamp 

    # 4. 传感器名称 (来自 device_name) 
    - name: "Sensor Name" 
      unique_id: "ne301_device_name_info" 
      state_topic: "device/76b2fc32/uplink" 
      value_template: "{{ value_json.device_info.device_name }}" 
      icon: "mdi:id-card" 

You will need to update the name, state_topic, the class value to yours. 
```

然后，点击开发者工具页面中的 'Manually configured MQTT entities' 直接应用更改

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p15_36.png" alt="image_p15_36.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p15_37.png" alt="image_p15_37.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

您会发现传感器已正确创建。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p15_38.png" alt="image_p15_38.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

## 4. 快速测试

让我们开始监测捕虫箱的状态。状态数值将正确显示

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p16_39.png" alt="image_p16_39.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p16_40.png" alt="image_p16_40.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p17_41.png" alt="image_p17_41.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

您也可以在历史记录中查看详细信息

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p17_42.png" alt="image_p17_42.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

HomeAssistant 平台支持其他应用程序触发警报，您可以配置它们以实现全面管理。

## 5. 问答

**Q1: 我可以使用同一个 MQTT Broker 和 Camthink AI 工具栈进行模型训练和量化吗？**

A: 本指南中的服务器仅供内部使用。您需要自行安装自己的 AI 工具栈。

**Q2: 由于芯片组较小，如何提高模型性能？**

A: 您可以在量化过程中尝试将 Input Size 选项设置为 320。

<img src="/img/ne301/application-guide/pest-control-monitoring-in-chain-restaurants/image_p18_43.png" alt="image_p18_43.png" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />

**Q3: 如何在 HomeAssistant 中设置 value template？**

A: 您可以访问 HomeAssistant 网站了解有关如何使用它的详细信息。以下是 NE301 报告数据的一个示例：

```json
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
