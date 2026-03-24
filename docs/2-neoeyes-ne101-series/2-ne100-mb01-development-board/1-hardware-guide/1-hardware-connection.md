---
description: NE100-MB01 开发板硬件连接指南,详细介绍主板接口定义、GPIO 引脚配置、外设电源控制、PIR 传感器连接、16Pin 扩展接口及通信模块引脚定义。
keywords: [NE100-MB01, 硬件连接, GPIO, 引脚定义, 接口说明, PIR 传感器, 扩展接口, UART, I2C, SPI]
tags: [硬件指南, NE100-MB01, 接口定义, GPIO 配置, 传感器连接]
---

# Hardware Connection

## **主板接口概览**

### 顶层接口:

- Type-C 接口(用于 UART 和供电)
- MicroSD 卡槽
- Reset 按键
- 无线模块连接器
- Snap 按键
- 调试用 UART 接口
- USB 摄像头接口
- LED 板连接器
- FPC摄像头模块接口  
![NE10X_Top_IO_Marker.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/ne100-mb01-development-board/hardware-guide/hardware-connection/NE10X_Top_IO_Marker.png)

### 底层接口:

- 电源输入接口
- 报警输入接口
- PIR 输入接口
- 扩展 GPIO 接口(包括 UART、I2C、SPI、电源输出)
- Boot 按键  
![NE10X_Bot_IO_Marker.png](https://resources.camthink.ai/wiki/img/neoeyes-ne101-series/ne100-mb01-development-board/hardware-guide/hardware-connection/NE10X_Bot_IO_Marker.png)

## **开发套件快速入门指南**

- 开箱后,检查主板和配件确保完好无损。
- 将摄像头模块(OV5640 模块或 USB 模块)连接到主板。
- 将通信模块(Cat-1 或 WiFi-Halow)安装到主板(可选)。
- 通过 Type-C 或 4Pin Wafer 连接器连接调试 UART 接口。
- 通过 Type-C 接口或电源连接器供电。
- 完成以上步骤后,即可开始相关调试工作。

 **程序下载和调试请参考**:[AI Camera 系统烧录](../2-software-guide/1-system-flashing-and-initialization.md)

## **接口说明**

### 外设电源控制

在使用摄像头、ISP、电池电量检测、闪光灯或光传感器之前,必须将 CAM_PWR 引脚置高以启用这些设备。同样,在使用 TF 卡之前必须将 TF_PWR 引脚置高。


| 引脚号 | 引脚名称    | 功能     | 引脚类型 | 上拉/下拉   | 复用功能 |
| --- | ------- | ------ | ---- | ------- | ---- |
| 16  | CAM_PWR | GPIO3  | O    | PD 10K  |      |
| 35  | TF_PWR  | GPIO42 | O    | PD 100K |      |


### USB 摄像头接口
| 引脚号 | 引脚名称 | 功能             | 说明                  |
| --- | ---- | -------------- | ------------------- |
| 1   | VDD  | 电源供电           | 最大电流 500mA          |
| 2   | GND  | 地              | 与信号地共用              |
| 3   | DM   | USB 差分信号(-)    | 需符合 USB2.0 规范      |
| 4   | DP   | USB 差分信号(+)    | 需符合 USB2.0 规范      |

### PIR GPIO 定义


| 引脚号 | 引脚名称      | 功能   | 引脚类型  | 上拉/下拉 | 复用功能   |
| --- | --------- | ---- | ----- | ----- | ------ |
| 1   | VDD       | 电源供电 | S     |       |        |
| 2   | GND       | 地    | S     |       |        |
| 3   | Serial_IN | 配置端口 | I/O/T |       | GPIO41 |
| 4   | INT/Dout  | 报警输入 | I/O/T |       | GPIO2  |


### 扩展 GPIO 接口(16Pin)

16 针扩展排针提供 uart、I2C、SPI 和 GPIO 等通信接口。开发者可以使用这些接口扩展传感器模块,如 PIR 传感器、OLED 模块等。


| 引脚号 | 引脚名称     | 功能       | 引脚类型  | 上拉/下拉  | 复用功能            |
| --- | -------- | -------- | ----- | ------ | --------------- |
| 1   | TXD0     | Uart0 TX | I/O/T | PU 10K | GPIO43          |
| 2   | GND      | 地        | S     |        |                 |
| 3   | RXD0     | Uart0 RX | I/O/T | PU 10K | GPIO44          |
| 4   | GND      | 地        | S     |        |                 |
| 5   | GPIO     | GPIO41   | I/O/T |        |                 |
| 6   | 5V0      | 5V0 输入   | S     |        |                 |
| 7   | SPI_MISO | SPI_MISO | I/O/T |        | GPIO40          |
| 8   | 3V3      | 3V3 输出   | S     |        |                 |
| 9   | SPI_CLK  | SPI_CLK  | I/O/T |        | GPIO39          |
| 10  | Alarm_IN | 报警输入     | I     |        | GPIO2,ADC1_CH1  |
| 11  | SPI_MOSI | SPI_MOSI | I/O/T |        | GPIO38          |
| 12  | SPI_CS   | SPI_CS   | I/O/T |        | GPIO45          |
| 13  | GPIO     | GPIO19   | I/O/T |        | USB_D-,ADC2_CH8 |
| 14  | GPIO     | GPIO48   | I/O/T |        |                 |
| 15  | GPIO     | GPIO20   | I/O/T |        | USB_D+,ADC2_CH9 |
| 16  | GPIO     | GPIO46   | I/O/T |        |                 |


### FPC摄像头模块接口

摄像头模块 OV5640 支持 8 位并行输入接口。主板 IO 配置如下:


| 引脚号 | 引脚名称      | 功能     | 引脚类型 | 上拉/下拉  | ESP32-S3 引脚 |
| --- | --------- | ------ | ---- | ------ | ----------- |
| 1   | Null      |        |      |        |             |
| 2   | GND       | 地      | S    |        |             |
| 3   | I2C_SDA   | I2C_数据 | I/O  | PU 4K7 | GPIO4       |
| 4   | AVDD      | 2.8V   | S    |        |             |
| 5   | I2C_SCL   | I2C_时钟 | O    | PU 4K7 | GPIO5       |
| 6   | CAM_RST   | 复位#低   |      |        | RC 电路       |
| 7   | CSI_VSYNC | V同步    | I    |        | GPIO6       |
| 8   | CSI_PWDN  |        |      | PD 1K  |             |
| 9   | CSI_HSYNC | H同步    | I    |        | GPIO7       |
| 10  | DVDD      | 1V2    | S    |        |             |
| 11  | DOVDD     | 2V8    | S    |        |             |
| 12  | CSI_D7    | 数据位7   | I    |        | GPIO16      |
| 13  | CSI_MCLK  | 时钟输出   | O    |        | GPIO15      |
| 14  | CSI_D6    | 数据位6   | I    |        | GPIO17      |
| 15  | GND       | 地      | S    |        |             |
| 16  | CSI_D5    | 数据位5   | I    |        | GPIO18      |
| 17  | CSI_PCLK  | 像素时钟   | I    |        | GPIO13      |
| 18  | CSI_D4    | 数据位4   | I    |        | GPIO12      |
| 19  | CSI_D0    | 数据位0   | I    |        | GPIO11      |
| 20  | CSI_D3    | 数据位3   | I    |        | GPIO10      |
| 21  | CSI_D1    | 数据位1   | I    |        | GPIO9       |
| 22  | CSI_D2    | 数据位2   | I    |        | GPIO8       |
| 23  | Null      |        |      |        |             |
| 24  | Null      |        |      |        |             |


> 注意: 1. 使用前需将 CAM_PWR 引脚置高。

### 闪光灯和光传感器 IO


| 引脚号 | 引脚名称           | 功能       | 引脚类型 | 上拉/下拉   | ESP32-S3 引脚 |
| --- | -------------- | -------- | ---- | ------- | ----------- |
| 24  | FLASH_LED      | LEDC_PWM | O    | PD 100K | GPIO47      |
| 39  | LIGHT_RESISTOR | ADC      | A    |         | GPIO1       |


> 注意: 1. 使用前需将 CAM_PWR 引脚置高; 2. 光照强度 0% 到 100% 对应输出电压 0 到 2.5V。

### TF 卡 IO


| 引脚号 | 引脚名称 | 功能       | 引脚类型 | 上拉/下拉  | ESP32-S3 引脚 |
| --- | ---- | -------- | ---- | ------ | ----------- |
| 31  | CMD  | SDIO_CMD | O    | PU 10K | GPIO38      |
| 32  | CLK  | SDIO_CLK | O    | PU 10K | GPIO39      |
| 33  | DAT0 | SDIO_DA0 | I    | PU 10K | GPIO40      |
| 34  | CD   | SDIO_IRQ | I    | PU 1M  | GPIO41      |


> 注意: 1. 使用前需将 TF_PWR 引脚置高; 2. 请使用 MMC 1 位模式协议驱动; 3. 由于引脚冲突,无法与 WiFi-Halow 和 4G Cat1 模块同时使用。

### 其他 IO


| 引脚号 | 引脚名称    | 功能     | 引脚类型 | 上拉/下拉  | ESP32-S3 引脚 |
| --- | ------- | ------ | ---- | ------ | ----------- |
| 23  | CFG_KEY | IRQ_IN | I    | PU 10K | GPIO21      |
| 22  | BAT_DET | ADC    | A    |        | GPIO14      |


> 注意: 1. 启用电池电量检测前必须将 CAM_PWR 引脚置高; 2. 电池电量 0% 到 100% 对应电压范围 1.8 到 3V。

### 通信模块排针定义

通信模块安装在 J11 和 J15 排针上。J11 16 针排针提供相关信号。J15 12 针排针仅用于物理支撑。  
请注意,由于 IO 资源不足,IO 配置与某些 IO 存在冲突

### 16 针扩展排针

详细信息请参考对照表。


| 引脚号 | 引脚名称       | 功能       | 引脚类型  | 上拉/下拉 | ESP32-S3 引脚            |
| --- | ---------- | -------- | ----- | ----- | ---------------------- |
| 1   | VCC_IN     | 电源输出     | S     |       |                        |
| 2   | 3V3        | 3V3 输出   | S     |       |                        |
| 3   | VCC_IN     | 电源输出     | S     |       |                        |
| 4   | 3V3        | 3V3 输出   | S     |       |                        |
| 5   | WIFI_PWR_H | 电源使能     | I/O/T |       | GPIO48                 |
| 6   | GND        |          | GND   |       |                        |
| 7   | SPI_MOSI   | SPI_MOSI | I/O/T |       | GPIO38                 |
| 8   | SPI_MISO   | SPI_MISO | I/O/T |       | GPIO40                 |
| 9   | SPI_CS     | SPI_CS   | I/O/T |       | GPIO45                 |
| 10  | SPI_CS     | SPI_CS   | I/O/T |       | GPIO45                 |
| 11  | WIFI_BUSY  | 状态       | I/O/T |       | GPIO20,USB_D+,ADC2_CH9 |
| 12  | IRQ        | 中断       | I/O/T |       | GPIO41                 |
| 13  | GND        |          | GND   |       |                        |
| 14  | WIFI_WAKE  | 唤醒       | I/O/T |       | GPIO19,USB_D-,ADC2_CH8 |
| 15  | SPI_CLK    | SPI_CLK  | I/O/T |       | GPIO39                 |
| 16  | WIFI_RST   | 复位#低     | I/O/T |       | GPIO46                 |


### IO 冲突表

  如果使用 Cat-1 或 WiFi-Halow 模块,**16 针扩展排针**上被模块占用的 IO 不应使用或连接任何设备。


| 引脚号 | 引脚名称     | 功能       | Cat-1 模块   | WiFi-Halow 模块 |
| --- | -------- | -------- | ---------- | ------------- |
| 1   | TXD0     | Uart0 TX |            |               |
| 2   | GND      | 地        |            |               |
| 3   | RXD0     | Uart0 RX |            |               |
| 4   | GND      | 地        |            |               |
| 5   | GPIO     | GPIO41   |            | IRQ           |
| 6   | 3V3      | 3V3 输出   |            |               |
| 7   | SPI_MISO | SPI_MISO | UART_TXD   | SPI_MISO      |
| 8   | 3V3      | 3V3 输出   |            |               |
| 9   | SPI_CLK  | SPI_CLK  | UART_RXD   | SPI_CLK       |
| 10  | Alarm_IN | 报警输入     |            |               |
| 11  | SPI_MOSI | SPI_MOSI |            | SPI_MOSI      |
| 12  | SPI_CS   | SPI_CS   |            | SPI_CS        |
| 13  | GPIO     | GPIO19   |            | WIFI_WAKE     |
| 14  | GPIO     | GPIO48   | CAT1_PWR_H | WIFI_PWR_H    |
| 15  | GPIO     | GPIO20   |            | WIFI_RST      |
| 16  | GPIO     | GPIO46   |            | `WIFI_BUSY`   |
