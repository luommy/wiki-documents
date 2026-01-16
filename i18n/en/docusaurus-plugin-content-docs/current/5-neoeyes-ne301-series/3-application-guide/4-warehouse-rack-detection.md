---
title: Warehouse Rack Detection
sidebar_label: Warehouse Rack Detection
---

# Use Case - Warehouse Rack Detection

## 1. Preface

**CamThink** is a new developer-focused brand from Milesight, created to make edge AI simpler for everyone. We build open, developer-friendly edge AI hardware for both community builders and enterprise engineers. And help them to move from early prototypes to reliable real-world deployments — accelerating your strategy in edge AI.

**Camthink NeoEye 301** is Powered by the STM32N6(Cortex-M55) processor with the Neural-ART™ NPU, which delivers real-time Al inference and professional grade image processing with ultra-low power consumption.

**Home Assistant** is a free, open-source home automation platform designed to be a central "brain" for your smart applications, it prioritizes local control and privacy, As of early 2026, Home Assistant has become significantly more user-friendly through its "Year of Voice" and "Collective Intelligence" initiatives.

In this use case, we will show you how to manage the **Warehouse Shelf Status** for the smart retail and warehouse industries.

## 2. Requirement

**Hardware:**
- **Camthink NeoEye 301**, Ultra-Low Power Vision AI Camera.

**Software Platform:**
- **Camthink AI Tool Stack**, an end-to-end AI toolset covering the entire workflow from data collection, annotation, training, quantization, to deployment.
- **HomeAssistant Platform**, you will need to install it in your server in advance.

## 3. Configuration

In this part, we will show you how to achive this full usecase step by step.

### 3.1 Install the NE301 correctly

Firstly, install camthink NE301 correctly, press and hold the button for 2 or 3 seconds to activate the WiFi.


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image1.jpeg" alt="image1" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image2.png" alt="image2" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
### 3.2 Configure the network and MQTT data forwarding.

Connect the WiFI endpoints start with `NE301_<Last 6 MAC digits>`, Input the default IP address: `192.168.10.10`


<img src="/img/ne301/application-guide/warehouse-rack-detection/image3.png" alt="image3" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
<img src="/img/ne301/application-guide/warehouse-rack-detection/image4.png" alt="image4" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
- Default Username: `admin`
- Default password: `hicamthink`

Click Login to see the live view with detailed settings.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image5.png" alt="image5" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Navigate to **Systems** settings to connect the network access.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image6.png" alt="image6" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
> Camthink NE301 supports WiFi and Cellular modules. Choose the method to make sure the network access is connected.

Navigate to **Application Management** to configure where to forward the data and pictures.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image7.png" alt="image7" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Input the details of your own mqtt broker or AI tool stack server:

- **Server address**: the IP address of the MQTT broker.
- **Port**: the port of MQTT server, default value: `1883`
- **Data Receiving Topic**: the downlink command topic used to control and trigger the image capture.
- **Data Reporting Topic**: the uplink command topic used to traismit the data and the pictures.
- **Client id**: the mqtt client id, some servers will verify this value.
- **Username** : the username to join mqtt server, input it according to the server's needs.
- **Password**: the password to join mqtt server, input it according to the server's needs.

### 3.3 Collect the images, train and quantize the model.

Login Your own AI tool stack server to create a new project.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image8.png" alt="image8" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Click **Create New AI Model Project**, Input the name and description:


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image9.png" alt="image9" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image10.png" alt="image10" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
Open this project and bind the device for image collection, you will need to create this device firstly.


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image11.png" alt="image11" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image12.png" alt="image12" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
The pictures of the refrigerator captured by NE301 will uplink as configured.
If you have prepared the images, just upload them to this platform directly for model training.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image13.png" alt="image13" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Before start to train the models, create the Class here, let's name it as 'Chipset'.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image14.png" alt="image14" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Choose the proper type to tag the object.


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image15.png" alt="image15" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image16.png" alt="image16" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
Just do it one by one to make sure all the objects are marked correctly.
If you have the datasets already, just upload them here directly.

Click **Train Model** to start the training.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image17.png" alt="image17" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Click **New Training** to create a new task, keep all the default settings.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image18.png" alt="image18" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Then start the training. It will take a little while.


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image19.png" alt="image19" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image20.png" alt="image20" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
To deploy the model into NE301, we need to quantize it before upload it to the device.
Click **Quantize** button.


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image21.png" alt="image21" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image22.png" alt="image22" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
Click it to start, just keep the default settings here.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image23.png" alt="image23" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
It takes a little while to finish it.
The NE301 Model Package (*.bin) is the exact quantized model. Click to download it.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image24.png" alt="image24" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
You can also test the model here to confirm if all good.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image25.png" alt="image25" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
### 3.4 Verify and Deploy the new model.

let's back to the device to upload the new model.
Click **Upload** button to install it.


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image26.png" alt="image26" style={{width: "32%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image27.png" alt="image27" style={{width: "32%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image28.png" alt="image28" style={{width: "32%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
When done, the chipsets on the shelf are marked correctly.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image29.png" alt="image29" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
You can upload more images to verify the performance.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image30.png" alt="image30" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
### 3.5 Configure the HomeAssistant applications.

To make the data values more valuable for customers, we choose HomeAssistant for integration and visualization. You can also connect it to other 3rd-party platforms.

Open the **Devices & Services** to install the MQTT integration.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image31.png" alt="image31" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Click **Add Integration** button to install the MQTT addon.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image32.png" alt="image32" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Just input MQTT to search it.


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image33.png" alt="image33" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image34.png" alt="image34" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
Choose the second one, and input the mqtt broker configured in NE301.


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image35.png" alt="image35" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image36.png" alt="image36" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
Submit to save it. The MQTT connection is ready.

Create the MQTT device to make sure the datas can be subscribed correctly.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image37.png" alt="image37" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Keep the other settings to be default.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image38.png" alt="image38" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Choose type 'Number' and input the entity name here.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image39.png" alt="image39" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Keep these settings empty.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image40.png" alt="image40" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Input the MQTT specific details here correctly, especially the downlink and uplink topic, And the value template.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image41.png" alt="image41" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
```jinja2
{{ value_json.ai_result.ai_result.detection_count }}
```

More details about how to set the value template, you can visit HomeAssist website or contact us.
click **Next** and save it.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image42.png" alt="image42" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
The first entity about the chipset's number is created well.
Let's create the second entity to identify the name.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image43.png" alt="image43" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Input the value template of the 'name'.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image44.png" alt="image44" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
The template of the value Name is different here.

```jinja2
{{ value_json.ai_result.ai_result.detections[0].class_name }}
```

Click **Save Changes** to save it.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image45.png" alt="image45" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
Refresh the page to see the Activity with the values correctly.


<div style={{display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0"}}>
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image46.png" alt="image46" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
  <img src="/img/ne301/application-guide/warehouse-rack-detection/image47.png" alt="image47" style={{width: "48%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
</div>
HomeAssistant supports to check it in dashboard, including the histories.

## 4. Quick Test

Let's take some drinks to test it.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image48.png" alt="image48" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
The number of the baverage is changed immediately.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image49.png" alt="image49" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
The values are updated in HomeAssistant platform as well, customers can see all the history datas.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image50.png" alt="image50" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
HomeAssistant platform supports the other appplications to trigger the alert, you can configure them to achieve the full management.

## 5. Q&A

**Q: Can I use the same MQTT broker and Camthink AI Tool Stack for Model Training and Quantilization?**

A: The server in this guide is for internal use. You need to install your own AI Tool Stack on your own.

**Q: Since the Chipset is smaller, how to improve the model's performance?**

A: You can try the option of Input Size to be 320 during the quantize process.


<img src="/img/ne301/application-guide/warehouse-rack-detection/image51.png" alt="image51" style={{display: "block", margin: "20px auto", maxWidth: "80%", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"}} />
**Q: How to set the value template in HomeAssistant?**
A: You can visit the HomeAssistant website to get the details about how to use it. Here is an example of NE301's report data:

```json
{
    "metadata": {
        "image_id": "cam01_1767513409",
        "timestamp": 1767513409,
        "format": "jpeg",
        "width": 1280,
        "height": 720,
        "size": 51464,
        "quality": 60
    },
    "device_info": {
        "device_name": "NE301-2A3E75",
        "mac_address": "44:9f:da:2a:3e:75",
        "serial_number": "SN202500001",
        "hardware_version": "V1.1",
        "software_version": "1.0.1.1146",
        "power_supply_type": "full-power",
        "battery_percent": 0,
        "communication_type": "wifi"
    },
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
                "class_name": "Chipset",
                "confidence": 0.9015386700630188,
                "x": 0.0039368569850921631,
                "y": 0.17518982291221619,
                "width": 0.53541159629821777,
                "height": 0.82280164957046509
            }],
            "detection_count": 1,
            "poses": [],
            "pose_count": 0,
            "type_name": "object_detection"
        }
    },
    "image_data": "data:image/jpeg;base64,/9j/2wBDAA0J",
    "encoding": "base64"
}
```
