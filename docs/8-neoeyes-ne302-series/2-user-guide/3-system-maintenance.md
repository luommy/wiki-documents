---
id: ne302-system-maintenance
title: System Maintenance
sidebar_position: 3
description: Change the NE302 login password, upgrade firmware and manage device storage from the Web console.
keywords: [NE302, System Settings, Storage Management, firmware, password]
tags: [NE302, user-guide, maintenance, firmware]
---

# System Maintenance

在这里修改登录密码、升级固件和处理设备存储。网络连接与结果发送见 [Data Transmission](./1-data-transmission.md)；抓拍保存策略和 Records 见 [Capture and Storage](./0-capture-storage.md)。

## 1. 修改登录密码

打开 **System Settings → Device Password**：

1. 在 **Login Password** 输入新密码并确认；长度为 8–32 个字符；
2. 点击该区域的 **save**；
3. 退出后用新密码重新登录。

**Username** 固定为 `admin`。**Local WiFi Settings** 是另一组配置；保存 Wi-Fi 设置后可能需要重新连接设备网络。

![NE302 Device Password 设置](/img/neoeyes-ne302-series/user-guide/ne302-system-settings-device-password.png)

## 2. Firmware Upgrade

打开 **System Settings → Firmware Upgrade**。在 **Firmware Information** 查看当前版本；固件从 [NE302 GitHub Releases](https://github.com/camthink-ai/ne302/releases) 下载。下表是 `v4.3.0` 的对应文件；使用其它版本时，只使用目标 Release 中配套的文件。

![NE302 Firmware Import 对话框](/img/neoeyes-ne302-series/user-guide/ne302-firmware-upgrade.png)

| 组件 | v4.3.0 文件 | 用途 |
| :--- | :--- | :--- |
| **App** | [ne302_App_signed_v4.3.0.12_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_App_signed_v4.3.0.12_pkg.bin) | App 导入框 |
| **Web** | [ne302_Web_v1.5.0.1_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_Web_v1.5.0.1_pkg.bin) | Web 导入框 |
| **AI Model** | [ne302_Model_v4.0.0.0_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_Model_v4.0.0.0_pkg.bin) | AI Model 导入框 |
| **FSBL** | [ne302_FSBL_signed_v1.0.3.0_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_FSBL_signed_v1.0.3.0_pkg.bin) | **Advanced Options** 中的 FSBL Firmware Upgrade |
| **WiFi Firmware** | [ne302_Wifi_flash_v2.15.5.2_pkg.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_Wifi_flash_v2.15.5.2_pkg.bin) | **Advanced Options** 中的 WiFi Firmware Upgrade |
| **WakeCore** | [ne302_WakeCore.bin](https://github.com/camthink-ai/ne302/releases/download/v4.3.0/ne302_WakeCore.bin) | 不使用 Web 页面；按 [Build and Flash](../4-software-guide/1-build-and-flash.md) 通过 U0-STLINK 烧录 |

需要保留当前配置时，先用 **Export Firmware** 导出 **Device File**；它是 `.json` 配置备份，不是升级包。

1. 下载一个组件对应的 `_pkg.bin`，一次只升级一个组件；
2. 在 **Import Firmware** 的对应位置上传文件。App、Web、AI Model 和 FSBL 校验完成后，点击 **Confirm Burn**；
3. 升级 WiFi 时，上传 `ne302_Wifi_flash_*_pkg.bin`，等页面提示已写入 Flash 后点击 **Confirm Upgrade**；
4. 等设备重启，重新登录并在 **Firmware Information** 确认版本。

FSBL 仅在 Release 或工程师明确要求时升级。不要混用不同 Release 的包，也不要将 `.json`、`.hex` 或未打包映像上传到 OTA 框。

## 3. Storage Management

打开 **Storage Management**，先确认 **SD Card Status** 和 **Internal Flash** 的可用空间。

![NE302 Storage Management](/img/neoeyes-ne302-series/user-guide/ne302-storage-management.png)

在对应存储的 **File Manager** 中，先用 **Preview** 确认文件、用 **Download** 导出要保留的内容，再删除明确选中的文件或目录。删除目录会同时删除内部文件。

需要清空内部 Flash 时，先导出要保留的文件，再在 **File Manager → Format Flash** 输入设备密码并完成确认。格式化会永久清除内部 Flash 中的文件。
