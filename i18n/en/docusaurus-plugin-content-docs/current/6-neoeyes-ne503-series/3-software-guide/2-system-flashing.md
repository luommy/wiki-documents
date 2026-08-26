---
description: NE503 guide for initial system flashing, boot-chain recovery, and OS upgrades.
keywords: [NE503, system flashing, firmware, eMMC, TFTP, U-Boot]
tags: [software guide, NE503, system deployment]
---

# System Flashing

This page covers the NE503 system image: initial flashing, boot-chain recovery, MCU firmware OTA, and OS upgrades. For platform release-package deployment, see [Software Deployment](./3-software-deployment.md).

## Choose a Path

| Device state | Path |
| --- | --- |
| New device, or no U-Boot menu appears after power-on | [Prepare firmware and host](#1-prepare-firmware-and-host) → [Recover the boot chain](#2-recover-the-boot-chain) → [Flash the system to eMMC](#3-flash-the-system-to-emmc) → [Log in and verify](#4-log-in-and-verify) → [Flash the MCU Firmware](#5-flash-the-mcu-firmware) |
| Device boots normally and needs an OS upgrade | Go directly to [Upgrade a Running Device](#6-upgrade-a-running-device) |
| OS is installed and the MCU firmware needs an update | Go directly to [Flash the MCU Firmware](#5-flash-the-mcu-firmware) |

## 1. Prepare Firmware and Host

### 1.1 Download the Firmware

Download the system firmware Release for `hailo15-ne503` from [meta-hailo-os Releases](https://github.com/camthink-ai/meta-hailo-os/releases) and extract it on an Ubuntu host. Get the matching flashing-tool wheel from the same Release. If you need to download the wheel separately, it is available in the repository's [`tools/` directory](https://github.com/camthink-ai/meta-hailo-os/tree/main/tools).

The wheel filename follows `hailo15_board_tools-<VERSION>-py3-none-any.whl`; take `<VERSION>` directly from the filename. The system firmware, wheel, and BSP must use matching versions.

The complete NE503 build artifacts and deployment procedure are documented in the [NE503 firmware and deployment guide](https://github.com/camthink-ai/meta-hailo-os/blob/main/docs/hailo15-ne503-firmware-and-deployment.md). The tools, boot-chain files, and system images must come from the same Release.

Boot-chain files:

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

System-image files:

```text
fitImage
swupdate-image-hailo15-ne503.ext4.gz
hailo-update-image-hailo15-ne503.swu
```

### 1.2 Install Tools and Connect the Device

The steps below use an Ubuntu 20.04/22.04 host. Prepare a 1.8V-compatible USB-to-serial cable, an Ethernet cable, and PoE power.

```bash
pip install tools/hailo15_board_tools-<VERSION>-py3-none-any.whl
sudo apt-get update
sudo apt-get install u-boot-tools
```

Connect the serial cable to the NE503 debug port and find the serial node:

```bash
ls -lh /dev/serial/by-id/
screen /dev/ttyACM0 115200
```

The examples use `/dev/ttyACM0`; replace it with the actual node.

![CamThink serial adapter](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-04-serial-board.png)

![NE503 board serial connection](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-05-board-connection.png)

![Query serial device node](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-06-device-node.png)

### 1.3 Configure TFTP

```bash
sudo apt update
sudo apt install tftpd-hpa
sudo nano /etc/default/tftpd-hpa
```

Confirm:

```text
TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/var/lib/tftpboot"
TFTP_ADDRESS="0.0.0.0:69"
TFTP_OPTIONS="--secure"
```

Copy the system images:

```bash
sudo mkdir -p /var/lib/tftpboot
sudo chown tftp:tftp /var/lib/tftpboot
sudo chmod 755 /var/lib/tftpboot
sudo cp fitImage /var/lib/tftpboot/
sudo cp swupdate-image-hailo15-ne503.ext4.gz /var/lib/tftpboot/
sudo cp hailo-update-image-hailo15-ne503.swu /var/lib/tftpboot/
sudo systemctl restart tftpd-hpa
```

## 2. Recover the Boot Chain

Use this section for a new device or when the U-Boot menu cannot be reached. If the menu is available, skip to [Section 3](#3-flash-the-system-to-emmc).

### 2.1 Enter UART Recovery Mode

Set BOOT0 to **OFF** and BOOT1 to **ON**, power the device through PoE, and press Reset.

![DIP switch flash mode](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-07-dip-switch.png)

### 2.2 Load the UART Recovery Firmware

```bash
uart_boot_fw_loader \
  --serial-device-name /dev/ttyACM0 \
  --firmware ./hailo15_uart_recovery_fw.bin
```

### 2.3 Write the SPI Flash Boot Components

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

After the command exits normally, return BOOT0 and BOOT1 to **OFF**.

![DIP switch normal mode](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-18-dip-normal.png)

## 3. Flash the System to eMMC

### 3.1 Enter the U-Boot Menu

1. Connect PoE through the RJ45 port;
2. Keep the serial terminal at `115200` baud;
3. During the autoboot countdown, press `↑` or `↓` to open the U-Boot menu.

![U-Boot boot menu](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/sys-21-emmc-init-1.png)

### 3.2 Configure the Network

The defaults are device `10.0.0.1` and TFTP host `10.0.0.2`. If the host uses another subnet, select **U-Boot console**:

```text
setenv ipaddr 192.168.93.XXX
setenv serverip 192.168.93.YYY
saveenv
reset
```

`serverip` must be the IP address of the Ubuntu host running TFTP.

### 3.3 Write the System Image

Return to the U-Boot menu and select **eMMC AB Board Init**. This is the current NE503 entry point for initial installation and recovery with the A/B layout.

The device fetches the system files over TFTP and writes them to eMMC. Wait for the automatic reboot. Do not remove power or the Ethernet cable during the write.

## 4. Log In and Verify

After reboot, log in through the serial console or SSH:

```text
Username: root
Password: root
```

Change the default password immediately, then run:

```bash
uname -r
df -h /
lsmod | grep hailo
ip addr show eth0
```

Confirm that the device has an IP address, the root filesystem is mounted, and the Hailo kernel modules are loaded.

For a first-time deployment, continue with [Section 5: MCU Firmware](#5-flash-the-mcu-firmware) after this verification. Complete that required step before deploying platform software.

## 5. Flash the MCU Firmware

MCU firmware flashing is a required step for the initial NE503 deployment. After Section 4 confirms that the system is running normally and accessible over SSH, deploy the MCU OTA package that matches the current NeoRuntime Release.

1. Download the `ne503_ota_package_v<X.Y.Z>.bin` package for the current NE503 Release from [neoruntime Releases](https://github.com/camthink-ai/neoruntime/releases);
2. Copy the OTA package to `/data/aipc/firmware/mcu/`:

```bash
ssh root@<device-ip> "mkdir -p /data/aipc/firmware/mcu"
scp ne503_ota_package_v<X.Y.Z>.bin root@<device-ip>:/data/aipc/firmware/mcu/
```

3. Keep the device powered and reboot it. During boot, `aipc-mcu-prep.service` checks the OTA package before the runtime services start and upgrades the MCU automatically when the package version is newer than the installed version:

```bash
ssh root@<device-ip> "reboot"
```

4. Verify the service result after the reboot:

```bash
ssh root@<device-ip> "systemctl status aipc-mcu-prep.service"
ssh root@<device-ip> "journalctl -b -u aipc-mcu-prep.service --no-pager | grep complete"
```

The success log should contain `rtc=ok ota=done rc=0`. If the installed MCU version is already equal to or newer than the OTA package, the service skips a duplicate flash and completes the version check normally.

Field updates use `ne503_ota_package_v<X.Y.Z>.bin`. `ne503_Main_v*.hex` is for factory SWD/ST-LINK programming only; the old `ne503_mcu.elf` + ST-LINK manual-flashing flow is no longer used.

## 6. Upgrade a Running Device

When the device is already running normally, use the Web Console OS upgrade entry. Do not repeat UART recovery or U-Boot TFTP flashing.

1. Open **Settings → Device Info**;
2. In **System OS Version**, click **Update**;
3. Select the `.swu` file for `hailo15-ne503`;
4. Wait for package validation to pass;
5. Keep the device powered, acknowledge the confirmation, and start the upgrade;
6. Wait for the device to reboot, verify the new system, and come back online.

![System OS Upgrade dialog](https://resources.camthink.ai/wiki/img/neoeyes-ne503-series/software-guide/system-flashing/system-os-upgrade.jpg)

The upgrade is complete when the page reports success and the device is online again. See the [NeoRuntime OS upgrade guide](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/os-upgrade.md) for the A/B mechanism.

## 7. Source Documentation

- [meta-hailo-os Releases: system firmware downloads](https://github.com/camthink-ai/meta-hailo-os/releases)
- [meta-hailo-os: NE503 firmware and deployment](https://github.com/camthink-ai/meta-hailo-os/blob/main/docs/hailo15-ne503-firmware-and-deployment.md)
- [neoruntime Releases: platform software and MCU firmware downloads](https://github.com/camthink-ai/neoruntime/releases)
- [NeoRuntime: OS A/B upgrade](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/os-upgrade.md)
- [NeoRuntime: MCU OTA](https://github.com/camthink-ai/neoruntime/blob/main/docs/deployment/baseboard-mcu-rtc-ota.md)
- [Software Deployment](./3-software-deployment.md)
