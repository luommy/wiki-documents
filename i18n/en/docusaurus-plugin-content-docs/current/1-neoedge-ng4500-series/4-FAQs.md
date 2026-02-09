---
description: Frequently asked questions and technical troubleshooting guide for NeoEdge NG4500 AIBOX series. Covers system version checks, boot issues, and HDMI display fixes.
keywords: [NeoEdge NG4500, FAQ, AIBOX Troubleshooting, Jetson Orin, HDMI Fix, System Version, Remote Desktop, Technical Support]
tags: [NeoEdge NG4500, FAQ, Troubleshooting, Technical Guide, AIBOX]
---

# FAQs

## Overview

This document serves as a comprehensive technical guide for the AIBOX series devices, including common issue resolutions, version update records, maintenance guidelines, and more. This Wiki will be continuously updated; it is recommended to check for the latest version periodically.

| Version | Release Date   | Main Updates                                                               | Status              |
| ------- | -------------- | -------------------------------------------------------------------------- | ------------------- |
| V1.2    | To be released | 1. Fixed OEM HDMI display black screen issue<br />2. Orin DRAM PCNs update | ✅ To be released    |
| V1.1    | 2025-05-14     | Initial version release                                                    | ✅ Under maintenance |

## Common Issues and Solutions

### FAQ1：How to Check System Version Information

You can execute the following command to confirm the device's version information and the model in use.

```shell
# Query command
cat /etc/nv_tegra_release

# Example output:
# R36 (release), REVISION: 4.3, GCID: 38968081, BOARD: generic, EABI: aarch64, DATE: Wed Jan  8 01:49:37 UTC 2025
# KERNEL_VARIANT: oot
TARGET_USERSPACE_LIB_DIR=nvidia
TARGET_USERSPACE_LIB_DIR_PATH=usr/lib/aarch64-linux-gnu/nvidia
# Series_Name = NeoEdge NG4500
# Category_Name = Edge AI Box
# Product_Name = NG4521
# Software_Version = V1.1
# Image_Name = aibox-NG4521-36.4.3-super-jetpack-V1.1
# branch r36.4.3
# commit ID b32073f8936a9150acb6ce2ea11ec2f4be981e86
```

### FAQ2：AIBOX Stuck on First Boot, Unable to Enter System

**Symptom**: The device gets stuck at the command line during first boot with the following prompt, unable to enter the system.

```bash
A start job is running for end-user configuration... (1min 30s / no limit)
```

**Solutions**

- **Method 1: Pre-set Username and Password**

Execute in the flashing package directory:

```shell
sudo tools/l4t_create_default_user.sh -u <USERNAME> -p <PASSWORD> -a -n <HOSTNAME>
```

- **Method 2: Connect HDMI in Advance**

Connect HDMI before powering on to obtain EDID information in advance and enter the OEM boot normally.

### FAQ3：Intermittent HDMI Black Screen During OEM Boot

**Symptom**：HDMI black screen occurs when entering the OEM boot program

**Solution**

The OEM boot program has compatibility issues with 4K resolution, causing black screens.

- **Method 1: Switch HDMI Resolution**

Modify the `aibox-orin-NG45XX-super.conf` file in the flashing package by removing the following line:

```shell
DCE_OVERLAY_DTB_FILE="tegra234-dcb-p3767-0000-hdmi.dtbo";
```

- **Method 2: Update to Version V1.2**

This issue has been fixed in V1.2 version.

### FAQ4：Windows Remote Desktop Login to AIBOX Fails

**Symptom**: Black screen or crash occurs when connecting via remote desktop.

**Solution**:

Configure the startwm.sh file. Use the command `sudo vi /etc/xrdp/startwm.sh` to open the file and replace its content with the following:

```shell
if test -r /etc/profile; then
        . /etc/profile
fi

unset DBUS_SESSION_BUS_ADDRESS
unset XDG_RUNTIME_DIR

exec /bin/sh /usr/bin/gnome-session
```

After replacement, restart the service with the following command:

```shell
sudo systemctl restart xrdp.service
```

---

If you encounter any issues not covered in this documentation or require additional technical support, please don't hesitate to contact our technical team.
