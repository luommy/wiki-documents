---
description: Step-by-step guide to deploying DeepSeek-R1 Large Language Model on NeoEdge NG4500 using Ollama. Enable offline AI inference with high privacy and low latency on Jetson Orin.
keywords: [DeepSeek-R1, NeoEdge NG4500, Ollama, LLM Deployment, Edge AI, Offline Inference, Jetson Orin, AI Chatbot, Generative AI]
tags: [DeepSeek-R1, LLM, Edge AI, Ollama, Jetson Orin]
---

# DeepSeek-R1 Local Deployment

---
This guide describes how to locally deploy the **DeepSeek-R1 LLMs** on **NVIDIA Jetson Orin** devices using **Ollama**, a lightweight inference engine, to enable offline AI interaction with a simple and efficient installation process.

---

## 1. Overview

Large language models (LLMs) like DeepSeek-R1 are gradually becoming a core component of edge intelligence applications. Running them directly on Jetson Orin offers key benefits：

- **Fully offline operation**  
- **Low-latency response**  
- **Enhanced data privacy**

This guide including：

- Environment preparation  
- Installing Ollama  
- Running the DeepSeek-R1  
- (Optional) Using Open WebUI for a web-based interface

---

## 2. Environment preparation

### Hardware

| Component   | Requirement                           |
| ---- | ---------------------------- |
| Device   | Jetson Orin（Nano / NX ） |
| Memory  | ≥ 8GB（larger models require more）             |
| Storage | ≥ 10GB（varies by model size）              |
| GPU  | NVIDIA GPU with CUDA support       |

### Software

- Ubuntu 20.04 / 22.04（JetPack 5.1.1+ recommended）  
- NVIDIA CUDA Toolkit and drivers （included with JetPack）  
- Docker (optional, for containerized deployment)

> ⚙️ Tip: Use  `jetson_clocks`and check `nvpmodel` to enable maximum performance mode for the best inference results.

---

## 3.Ollama Installation（Inference Engine）

### Option A: Native Script Installation

Open your terminal or command prompt and run the following command to install the NativeScript CLI.

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

- Installs the Ollama service and CLI tools.  
- Automatically handle dependencies and configure the background service.

### Option B: Docker Deployment

```bash
sudo docker run --runtime=nvidia --rm --network=host \
  -v ~/ollama:/ollama \
  -e OLLAMA_MODELS=/ollama \
  dustynv/ollama:r36.4.0
```

> 🧩 The Docker version is maintained by the NVIDIA community (dustynv) and optimized for Jetson.

### Verify Ollama is Running (refer to the code below)

```bash
ss -tuln | grep 11434
```

Expected output:

```
LISTEN 0 128 127.0.0.1:11434 ...
```

If port `11434`  is listening, the Ollama service has started successfully.

---

## 4. Running the DeepSeek-R1

### Getting Start the Model

To run the 1.5B parameter version：

```bash
ollama run deepseek-r1:1.5b
```

- Ollama will automatically download the model if it is not cached locally.  
- Starts an interactive conversation in the command line.

> 💡 Depending on your hardware capability, you can replace `1.5b` with `8b`、`14b` ,etc.

### Model Version Comparison

| Version   | 	Memory Requirement   | Notes              |
| ---- | ------- | ---------------- |
| 1.5B | ~6–8 GB | Suitable for Orin Nano/NX |
| 8B+  | ≥ 16 GB |	Requires AGX Orin     |
| 70B  | 🚫      | Not supported on Jetson       |

---

## 5. Web Interface (Open WebUI)

Open WebUI provides a user-friendly browser-based chat interface.
![open_webui](https://resources.camthink.ai/wiki/img/neoedge-ng4500-series/application-guide/deepseek-r1/open_webui.gif)

### Install Open WebUI (using Docker)

```bash
sudo docker run -d --network=host \
  -v ${HOME}/open-webui:/app/backend/data \
  -e OLLAMA_BASE_URL=http://127.0.0.1:11434 \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### Access the WebUI

Visit your browser with：

```
http://localhost:3000/
```

- You can interact with the DeepSeek-R1 model graphically  
- View conversation history, and review model responses directly in the browser.

---

## 6. Performance Optimization

| Optimization Area        | Description                              |
| ----------- | ------------------------------- |
| Memory Usage       | Use a smaller model (e.g., 1.5B) or enable swap          |
| Jetson Performance | Enable `MAXN` and run `jetson_clocks`  |
| Model Caching        | Ensure sufficient space in the `~/ollama` directory          |
| Runtime Monitoring       | Use `htop`or`tegrastats` to monitor system load|

> 📉 The initial model load may take about 30 seconds to 1 minute; subsequent runs will be faster thanks to caching.

---

## 7. Troubleshooting

| Issue           | Solution                      |
| ------------- | ------------------------- |
| Port 11434 not listening  | Restart Ollama or check Docker container status |
| Model fails to load        | Insufficient memory; try using a smaller version (e.g., 1.5B)     |
| Cannot access Web UI   |Verify Docker is running and connected to the host network    |
| Ollama command not found | Re-run the installation script or add it to your  `$PATH`     |

---

## 8. Appendix

### Example Directory

```bash
~/ollama/                # Model cache directory  
~/open-webui/            # WebUI persistent data 
```

### References

- [DeepSeek-R1  Model on HuggingFace](https://huggingface.co/deepseek-ai)  
- [Ollama  Official Documentation](https://ollama.com/)  
- [Open WebUI GitHub](https://github.com/open-webui/open-webui)  
- [NVIDIA Jetson Developer Forum](https://forums.developer.nvidia.com/)
