---
description: Learn how to install and run Ollama on NeoEdge NG4500 for local LLM inference with CUDA acceleration. Supports DeepSeek-R1 and other mainstream models.
keywords: [Ollama, NeoEdge NG4500, Local LLM, CUDA Acceleration, Jetson Orin, DeepSeek-R1, AI Inference, Model Management, Chatbot Deployment]
tags: [Ollama, Local LLM, AI Inference, Jetson Orin, DeepSeek-R1]
---


# Ollama

---

This guide describes how to install, update, configure, and uninstall **Ollama** on **NVIDIA Jetson Orin** devices. Ollama enables local inference for large language models (LLMs) with CUDA acceleration, and is optimized specifically for Jetson hardware.

---

## 1.Overview

- Fast local LLM inference
- CUDA acceleration support
- Built-in model version management
- Simple CLI tool with optional WebUI

This guide covers:

- Installation via script or Docker
- Running models
- Updating Ollama and models
- Optional remote access setup
- Complete uninstallation procedure

![overview](https://resources.camthink.ai/wiki/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/ollama/NG45XX_ollama_overview.png)

---

## 2. System Requirements

### Hardware

| Component | Minimum Requirement                        |
| --- | --------------------------- |
| Device  | Jetson Orin Nano / NX  |
| Memory  | ≥ 8GB (for running small to medium models)             |
| Storage  | ≥ 10GB (for model and cache storage)  |

### Software

- Ubuntu 20.04 or 22.04（based on JetPack）
- JetPack 5.1.1+ (includes CUDA, cuDNN, TensorRT)
- Python 3.8+ (optional)
- Docker(optional, for containerized deployment)

---

## 3. Installing Ollama

### Method A: Script Installation (Recommended)

Run the official installation script：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

- Installs the CLI binary and background service.
- CUDA support is enabled by default on Jetson devices.

### Method B: Docker-Based Installation (Optional)

```bash
sudo docker run --runtime nvidia --rm --network=host \
  -v ~/ollama:/ollama \
  -e OLLAMA_MODELS=/ollama \
  dustynv/ollama:r36.4.0
```

> 🧩 This Docker image is maintained by Jetson community contributor dustynv, optimized for JetPack environments.

---

## 4.Usage

### Common Commands

```bash
ollama serve         # Start the Ollama background service
ollama run           # Run a model
ollama pull          # Download a model from the registry
ollama list          # List installed models
ollama show          # Display model information
ollama rm            # Remove a model
ollama help          # Show help menu
```

###  Check Version

```bash
ollama -v
# Sample：ollama version 0.5.7
```

### Start the Service (If Not Auto-Started)

```bash
ollama serve &
```

---

## 5. (Optional) Enable Remote Access

To allow external devices to access the Ollama service:

1.Edit the systemd service file：

   ```bash
   sudo nano /etc/systemd/system/ollama.service
   ```

2. Add the following lines under the `[Service]` section:

   ```ini
   Environment="OLLAMA_HOST=0.0.0.0"
   Environment="OLLAMA_ORIGINS=*"
   ```

3. Reload and restart the service:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart ollama
   ```

---

## 6. Running

Use the  `ollama run` command to start model inference:

```bash
ollama run deepseek-r1:7b
```

- More available models refer to：[https://ollama.com/search](https://ollama.com/search)
- The model will be downloaded on first run and cached locally for future use.

---

## 7. Update

Update to the Latest Version：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### (Optional) Install a Specific Version

To install a specific version, specify the version number like this：

```bash
curl -fsSL https://ollama.com/install.sh | OLLAMA_VERSION=0.1.32 sh
```

---

## 8. Uninstall

### Stop and Remove the System Service

```bash
sudo systemctl stop ollama
sudo systemctl disable ollama
sudo rm /etc/systemd/system/ollama.service
```

### Remove the Executable

```bash
sudo rm $(which ollama)
```

（Note: Ollama is typically installed in`/usr/local/bin`、`/usr/bin` or `/bin`）

### Delete Model Files and User Account

```bash
sudo rm -r /usr/share/ollama
sudo userdel ollama
sudo groupdel ollama
```

---

## 9. Troubleshooting

| Issue        | Solution                         |
| ----------- | -------------------------------- |
| Port 11434 not responding | Restart`ollama serve` or reload the system service |
| Installation failed      | Ensure curl is installed and you have internet access; try using  `sudo`    |
| Unable to uninstall Ollamaollama | Use `which ollama`  to locate the actual path, then delete it manually |
| Out of Memory (OOM) error   | Try using a smaller model （e.g., `1.5b` or `7b`），or add swap space |

---

## 10. Appendix

### Path References

| Purpose        | 	Path                                 |
| ------------ | ------------------------------------ |
| Ollama executable | `/usr/local/bin/ollama`              |
| Model cache        | `~/ollama/` or`/usr/share/ollama`    |
| Service configuration      | `/etc/systemd/system/ollama.service` |

### References

- [Ollama  Official Website](https://ollama.com/)
- [Ollama GitHub Repository](https://github.com/ollama/ollama)
- [NVIDIA Jetson Community Forum](https://forums.developer.nvidia.com/)
