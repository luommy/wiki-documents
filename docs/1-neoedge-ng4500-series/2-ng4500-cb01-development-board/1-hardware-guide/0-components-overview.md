---
description: 了解 NeoEdge NG4500 系列硬件组件概览，包含 NVIDIA Jetson Orin 模组对比、载板主要特性（双网口、USB 3.2、M.2 扩展）及支持的摄像头与扩展模块。
keywords: [NG4500, 硬件组件, Jetson Orin, 载板特性, 接口说明, 扩展模块, 摄像头模组, 边缘计算]
tags: [硬件指南, 组件概览, NG4500 系列, 核心模组, 扩展连接]
---

# Components Overview
## **Jetson Modules Brief**
本产品支持的核心模组包括Orin Nano/NX, 及对应的Super版本。Jetson Orin 系列模组因配置不同，性能存在差异。
![Orin_Parameters_Comparation](/img/Orin_Parameters_Comparation.png)
模组的主要差异，如下几点：  

- Cores数量不同带来的性能差别
- CPU/GPU主频差异对性能的影响
- DRAM大小及带宽性能对数据处理能力的影响
- DLA/PVA功能模块：Orin Nano 4/8G 不支持， Orin NX 8G/16G 支持
- 供电要求（如Orin Nano只支持5V供电），及对应功耗和散热的差异 
## Carrier Board Overview 
**Main features**:
- DC-Jack 12-36 V input
- 100M/1000M 双网口
- Type-A*4 USB3.1+; Type-C *1  USB3.2
- HDMI*1
- Audio Input/Output 
- DI *4  DO *4 with isolation, RS232 *1, RS485 *1, 5V output
- M.2 Key M  *2 for storage, Key B for Cellular, Key E for Wifi/BLE
- Support RTC
- Camera Input Interfaces *2 （4 Lanes MIPI）
- 14Pins FFC可拓展IO接口    
 ## **Support Accessories Overview**
 ### Camera modules 
  兼容树莓派镜头模组，“Camera Module V2” 和 "HQ Camera"可选
- Camera Module V2: IMX219 4K resolution with fixed Lens

  - More Information: [Raspberry Pi Camera Module 2](https://www.raspberrypi.com/products/camera-module-v2/)

- HQ Camera:   MX477 12Mp resolution with CS-Mount Lens
  Sensor modules

  - More information: [Raspberry Pi High Quality Camera](https://www.raspberrypi.com/products/raspberry-pi-high-quality-camera/)

- 可通过DI/DO，及RS485,RS232, GPIO来外接各种传感器

  
 ### Expansion modules
- 4G 模组：[4G Module](../../../3-hardware-dev-resources/3-4g-module.md)
- 5G 模组：[5G Module](../../../3-hardware-dev-resources/4-5g-module.md)
- WiFi/BT 模组
 ### Mounts and enclosures

  可以依Carrier Board的固定孔，自行设计外壳或固定支架
