---
description: NE503 系统首次烧录、引导恢复和 OS 升级操作指南。
keywords: [NE503, 系统烧录, 固件, eMMC, TFTP, U-Boot]
tags: [软件指南, NE503, 系统部署]
---

# System Flashing

本文说明 NE503 系统镜像的首次烧录、引导链恢复、MCU 固件 OTA 和 OS 升级。平台软件发布包请参阅 [Software Deployment](./3-software-deployment.md)。

## 操作路径

| 设备状态 | 操作路径 |
| --- | --- |
| 全新设备，或上电后没有 U-Boot 菜单 | [准备固件和主机](#1-准备固件和主机) → [恢复引导链](#2-恢复引导链) → [烧录系统到 eMMC](#3-烧录系统到-emmc) → [登录并验证](#4-登录并验证) → [烧录 MCU 固件](#5-烧录-mcu-固件) |
| 已能正常启动，需要升级 OS | 直接执行 [OS 升级](#6-升级已运行设备的-os) |
| OS 已完成安装，需要更新 MCU 固件 | 直接执行 [烧录 MCU 固件](#5-烧录-mcu-固件) |

## 1. 准备固件和主机

### 1.1 下载固件

从 [meta-hailo-os Releases](https://github.com/camthink-ai/meta-hailo-os/releases) 下载适用于 `hailo15-ne503` 的系统固件 Release，并解压到 Ubuntu 主机。对应的烧录工具 wheel 也从同一 Release 获取；如果需要单独下载，可在仓库的 [`tools/` 目录](https://github.com/camthink-ai/meta-hailo-os/tree/main/tools)中找到。

wheel 文件名格式为 `hailo15_board_tools-<VERSION>-py3-none-any.whl`，其中 `<VERSION>` 直接取文件名中的版本号。系统固件、wheel 和 BSP 必须使用同一版本。

完整的 NE503 构建产物和部署说明见 [NE503 firmware and deployment guide](https://github.com/camthink-ai/meta-hailo-os/blob/main/docs/hailo15-ne503-firmware-and-deployment.md)。工具、引导链文件和系统镜像必须来自同一个 Release。

引导链文件：

```text
hailo15_uart_recovery_fw.bin
hailo15_scu_bl.bin
scu_bl_cfg_a.bin
hailo15_scu_fw.bin
u-boot.dtb.signed
u-boot-spl.bin
u-boot-initial-env
customer_certificate.bin
u-boot-tfa.itb
```

系统镜像文件：

```text
fitImage
swupdate-image-hailo15-ne503.ext4.gz
hailo-update-image-hailo15-ne503.swu
```

### 1.2 安装工具并连接设备

以下步骤按 Ubuntu 20.04/22.04 主机说明。准备 1.8V 兼容的 USB 转串口线、网线和 PoE 供电。

```bash
pip install tools/hailo15_board_tools-<VERSION>-py3-none-any.whl
sudo apt-get update
sudo apt-get install u-boot-tools
```

连接 NE503 调试串口，查询串口节点：

```bash
ls -lh /dev/serial/by-id/
screen /dev/ttyACM0 115200
```

以下示例使用 `/dev/ttyACM0`，请替换为实际节点。

![CamThink 串口小板](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-04-serial-board.png)

![NE503 主板串口连接](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-05-board-connection.png)

![查询串口设备节点](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-06-device-node.png)

### 1.3 配置 TFTP

```bash
sudo apt update
sudo apt install tftpd-hpa
sudo nano /etc/default/tftpd-hpa
```

确认配置如下：

```text
TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/var/lib/tftpboot"
TFTP_ADDRESS="0.0.0.0:69"
TFTP_OPTIONS="--secure"
```

复制系统镜像：

```bash
sudo mkdir -p /var/lib/tftpboot
sudo chown tftp:tftp /var/lib/tftpboot
sudo chmod 755 /var/lib/tftpboot
sudo cp fitImage /var/lib/tftpboot/
sudo cp swupdate-image-hailo15-ne503.ext4.gz /var/lib/tftpboot/
sudo cp hailo-update-image-hailo15-ne503.swu /var/lib/tftpboot/
sudo systemctl restart tftpd-hpa
```

## 2. 恢复引导链

全新设备或无法进入 U-Boot 菜单时执行本节。已经能够进入 U-Boot 菜单时，直接跳到[第 3 节](#3-烧录系统到-emmc)。

### 2.1 进入 UART 恢复模式

将拨码开关设为 BOOT0 **OFF**、BOOT1 **ON**，然后通过 PoE 上电并按下 Reset。

![拨码开关烧录模式](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-07-dip-switch.png)

### 2.2 加载 UART 恢复固件

```bash
uart_boot_fw_loader \
  --serial-device-name /dev/ttyACM0 \
  --firmware ./hailo15_uart_recovery_fw.bin
```

### 2.3 写入 SPI Flash 引导组件

```bash
hailo15_spi_flash_program \
  --scu-bootloader ./hailo15_scu_bl.bin \
  --scu-bootloader-config ./scu_bl_cfg_a.bin \
  --scu-firmware ./hailo15_scu_fw.bin \
  --uboot-device-tree ./u-boot.dtb.signed \
  --bootloader ./u-boot-spl.bin \
  --bootloader-env ./u-boot-initial-env \
  --customer-certificate ./customer_certificate.bin \
  --uboot-tfa ./u-boot-tfa.itb \
  --uart-load \
  --serial-device-name /dev/ttyACM0
```

命令正常结束后，将拨码开关恢复为 BOOT0 **OFF**、BOOT1 **OFF**。

![拨码开关正常模式](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-18-dip-normal.png)

## 3. 烧录系统到 eMMC

### 3.1 进入 U-Boot 菜单

1. 通过 RJ45 网口接入 PoE；
2. 保持串口终端为 `115200`；
3. 上电后，在自动启动倒计时期间按 `↑` 或 `↓`，进入 U-Boot 菜单。

![U-Boot 启动菜单](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-21-emmc-init-1.png)

### 3.2 配置网络

默认参数为设备 `10.0.0.1`、TFTP 主机 `10.0.0.2`。如果主机使用其他网段，在 U-Boot 菜单选择 **U-Boot console**：

```text
setenv ipaddr 192.168.93.XXX
setenv serverip 192.168.93.YYY
saveenv
reset
```

`serverip` 必须是运行 TFTP 的 Ubuntu 主机 IP。

### 3.3 写入系统镜像

重新进入 U-Boot 菜单，选择 **eMMC AB Board Init**。这是当前 NE503 A/B 系统布局的首次装机和恢复入口。

设备会通过 TFTP 获取系统文件并写入 eMMC。等待设备自动重启，写入过程中不要断电或断开网线。

## 4. 登录并验证

设备重启后，通过串口或 SSH 登录：

```text
用户名：root
密码：root
```

首次登录后立即修改默认密码，然后执行：

```bash
uname -r
df -h /
lsmod | grep hailo
ip addr show eth0
```

确认设备已取得 IP、根文件系统已挂载，并且 Hailo 内核模块已加载。

首次部署时，完成本节验证后必须继续执行[第 5 节 MCU 固件](#5-烧录-mcu-固件)，再进行后续的平台软件部署。

## 5. 烧录 MCU 固件

MCU 固件是 NE503 首次部署的必做步骤。完成第 4 节并确认系统正常运行、可以通过 SSH 登录后，必须先部署与当前 NeoRuntime Release 匹配的 MCU OTA 包。

1. 从 [neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases) 下载当前 NE503 Release 对应的 `ne503_ota_package_v<X.Y.Z>.bin`；
2. 将 OTA 包上传到设备的 `/data/aipc/firmware/mcu/`：

```bash
ssh root@<device-ip> "mkdir -p /data/aipc/firmware/mcu"
scp ne503_ota_package_v<X.Y.Z>.bin root@<device-ip>:/data/aipc/firmware/mcu/
```

3. 保持设备供电稳定并重启。设备启动时，`aipc-mcu-prep.service` 会在运行时服务启动前检查该目录中的 OTA 包，并在包版本高于当前 MCU 版本时自动执行升级：

```bash
ssh root@<device-ip> "reboot"
```

4. 重启完成后验证服务结果：

```bash
ssh root@<device-ip> "systemctl status aipc-mcu-prep.service"
ssh root@<device-ip> "journalctl -b -u aipc-mcu-prep.service --no-pager | grep complete"
```

成功日志应包含 `rtc=ok ota=done rc=0`。如果设备上的 MCU 版本已经不低于 OTA 包版本，服务会跳过重复烧录，但仍会正常完成版本检查。

现场 OTA 使用 `ne503_ota_package_v<X.Y.Z>.bin`；`ne503_Main_v*.hex` 仅用于工厂 SWD/ST-LINK 编程，旧版 `ne503_mcu.elf` + ST-LINK 手工烧录流程不再适用。

## 6. 升级已运行设备的 OS

设备已经正常运行时，使用 Web Console 的 OS 升级入口，不需要重新执行 UART 恢复或 U-Boot TFTP 烧录。

1. 打开 **Settings → Device Info**；
2. 在 **System OS Version** 项点击 **Update**；
3. 选择适用于 `hailo15-ne503` 的 `.swu` 文件；
4. 等待升级包校验通过；
5. 保持供电稳定，勾选确认项并开始升级；
6. 等待设备重启、验证新系统并重新上线。

![System OS Upgrade 对话框](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/system-os-upgrade.jpg)

页面显示升级成功且设备重新上线后，升级完成。A/B 升级机制见 [NeoRuntime OS upgrade guide](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/os-upgrade.md)。

## 7. 相关源码文档

- [meta-hailo-os Releases：系统固件下载](https://github.com/camthink-ai/meta-hailo-os/releases)
- [meta-hailo-os：NE503 固件与部署说明](https://github.com/camthink-ai/meta-hailo-os/blob/main/docs/hailo15-ne503-firmware-and-deployment.md)
- [neoruntime Releases：平台软件与 MCU 固件下载](https://github.com/camthink-ai/neoruntime/releases)
- [NeoRuntime：OS A/B 升级](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/os-upgrade.md)
- [NeoRuntime：MCU OTA](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/baseboard-mcu-rtc-ota.md)
- [Software Deployment](./3-software-deployment.md)
