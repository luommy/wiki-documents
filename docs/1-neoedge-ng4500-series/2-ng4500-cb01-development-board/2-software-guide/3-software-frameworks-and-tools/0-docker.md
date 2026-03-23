---
description: 本指南详细介绍如何在 NVIDIA Jetson Orin 系列设备上安装并配置 Docker 与 NVIDIA Container Runtime。涵盖 GPU 加速配置、非 root 权限设置及运行时测试。
keywords: [Docker, NVIDIA Jetson, Orin Nano, Container Runtime, GPU 加速, 容器化部署, 环境配置, NVIDIA Container Toolkit]
tags: [Docker, Jetson Orin, 容器技术, 环境搭建, 边缘计算]
---


# Docker

---

本指南将完整演示如何在 **NVIDIA Jetson Orin** 系列设备上安装并配置 **Docker 和 NVIDIA Container Runtime**。这是运行基于 GPU 加速的容器（如 Ollama、n8n、ROS 等 AI 推理应用）的关键步骤。

---

## 1. 概览

- 安装 Docker CE 支持容器化应用
- 配置 NVIDIA 运行时以启用 GPU 加速
- 设置非 `sudo` 模式运行 Docker
- 配置持久默认运行时为 NVIDIA

本指南涵盖：

- Docker 安装
- NVIDIA 运行时配置
- 运行时测试
- 常见问题排查


---

## 2. 系统要求

| 组件         | 要求                               |
| ---------- | -------------------------------- |
| Jetson 硬件  | Orin Nano / NX / AGX             |
| 操作系统       | Ubuntu 20.04 或 22.04（基于 JetPack） |
| Docker 版本  | 建议 Docker CE ≥ 20.10             |
| NVIDIA 运行时 | `nvidia-container-toolkit`       |
| CUDA 驱动    | 已包含在 JetPack（需 JetPack ≥ 5.1.1）  |

---

## 3. 安装 Docker CE

从 Ubuntu 官方源安装 Docker：

```bash
sudo apt-get update
sudo apt-get install -y docker.io
```

> ⚠️ 如需安装最新版本，也可以使用 Docker 官方 APT 源。

检查 Docker 是否安装成功：

```bash
docker --version
# 示例输出：Docker version 20.10.17, build 100c701
```

---

## 4. 非 `sudo` 模式运行 Docker（可选）

若希望以普通用户身份运行 Docker 命令：

```bash
sudo groupadd docker         # 创建 docker 用户组（若已存在可跳过）
sudo usermod -aG docker $USER
sudo systemctl restart docker
```

> 🔁 重启系统或重新登录使变更生效：

```bash
newgrp docker
```

---

## 5. 安装 NVIDIA 容器运行时

安装容器运行时以便容器访问 Jetson GPU：

```bash
sudo apt-get install -y nvidia-container-toolkit
```

---

## 6. 配置 NVIDIA Docker 运行时

### A. 注册 NVIDIA 为 Docker 运行时

运行以下配置命令：

```bash
sudo nvidia-ctk runtime configure --runtime=docker
```

确保 NVIDIA 被注册为有效容器运行时。

---

### B. 设置 NVIDIA 为默认运行时

编辑 Docker 守护进程配置文件：

```bash
sudo nano /etc/docker/daemon.json
```

粘贴或确认以下 JSON 内容存在：

```json
{
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  },
  "default-runtime": "nvidia"
}
```

保存并退出编辑器。

---
### C. 重启 Docker 服务

应用配置更改：

```bash
sudo systemctl restart docker
```

验证 Docker 是否启用了 NVIDIA 运行时：

```bash
docker info | grep -i runtime
```

输出示例应包含：

```
 Runtimes: io.containerd.runc.v2 nvidia runc
 Default Runtime: nvidia
```
---
### D. 登陆nvcr.io
获取 [NGC_API_KEY](https://org.ngc.nvidia.com/setup)
- Generate API Key
![NCG_API_KEY](https://resources.camthink.ai/wiki/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/NGC_API_KEY.png)
- Generate Personal Key
![Generate_personal_key](https://resources.camthink.ai/wiki/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/Generate_personal_key.png)
- docker login
  ```shell
  sudo docker login nvcr.io
  #用户固定:$oauthtoken
  Username: "$oauthtoken"
  #密码token
  Password: "YOUR_NGC_API_KEY"
  ```
---

## 7. 测试容器中 GPU 访问

运行官方 CUDA 容器测试 GPU 可用性：

```bash
docker run --rm --runtime=nvidia nvcr.io/nvidia/l4t-base:r36.2.0 nvidia-smi
```

期望输出：

- 显示 CUDA 版本与 Jetson GPU 信息
- 确认容器已成功访问 GPU

![docker_nvidia-smi](https://resources.camthink.ai/wiki/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/docker_nvidia-smi.png)

**你也可以使用社区维护的 [jetson-containers](https://github.com/dusty-nv/jetson-containers)，快速搭建你的开发环境（推荐）**

|||
|---|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **ML** | [`pytorch`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/pytorch) [`tensorflow`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/tensorflow) [`jax`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/jax) [`onnxruntime`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/onnxruntime) [`deepstream`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/cv/deepstream) [`holoscan`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/cv/holoscan) [`CTranslate2`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/ctranslate2) [`JupyterLab`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/code/jupyterlab)                                                                                                                                                                                                                                                                               |
| **LLM** | [`SGLang`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/sglang) [`vLLM`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/vllm) [`MLC`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/mlc) [`AWQ`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/awq) [`transformers`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/transformers) [`text-generation-webui`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/text-generation-webui) [`ollama`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/ollama) [`llama.cpp`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/llama_cpp) [`llama-factory`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/llama-factory) [`exllama`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/exllama) [`AutoGPTQ`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/local_llm) [`FlashAttention`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/attention/flash-attention) [`DeepSpeed`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/deepspeed) [`bitsandbytes`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/bitsandbytes) [`xformers`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/attention/xformers) |
| **VLM** | [`llava`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vlm/llava) [`llama-vision`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vlm/llama-vision) [`VILA`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vlm/vila) [`LITA`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vlm/lita) [`NanoLLM`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/llm/nano_llm) [`ShapeLLM`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vlm/shape-llm) [`Prismatic`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vlm/prismatic) [`xtuner`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vlm/xtuner)                                                                                                                                                                                                                                                                                                                |
| **VIT** | [`NanoOWL`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vit/nanoowl) [`NanoSAM`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vit/nanosam) [`Segment Anything (SAM)`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vit/sam) [`Track Anything (TAM)`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vit/tam) [`clip_trt`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vit/clip_trt)                                                                                                                                                                                                                                                                                                                                                                                                |
| **RAG** | [`llama-index`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/rag/llama-index) [`langchain`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/rag/langchain) [`jetson-copilot`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/rag/jetson-copilot) [`NanoDB`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vectordb/nanodb) [`FAISS`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vectordb/faiss) [`RAFT`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/rapids/raft)                                                                                                                                                                                                                                                                                                                                                      |
| **L4T** | [`l4t-pytorch`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/l4t/l4t-pytorch) [`l4t-tensorflow`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/l4t/l4t-tensorflow) [`l4t-ml`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/l4t/l4t-ml) [`l4t-diffusion`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/l4t/l4t-diffusion) [`l4t-text-generation`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/l4t/l4t-text-generation)                                                                                                                                                                                                                                                                                                                                                              |
| **CUDA** | [`cupy`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/numeric/cupy) [`cuda-python`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/cuda/cuda-python) [`pycuda`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/cuda/pycuda) [`cv-cuda`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/cv/cv-cuda) [`opencv:cuda`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/cv/opencv) [`numba`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/numeric/numba)                                                                                                                                                                                                                                                                                                                                          |
| **Robotics** | [`Cosmos`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/diffusion/cosmos) [`Genesis`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/sim/genesis) [`ROS`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/robots/ros) [`LeRobot`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/robots/lerobot) [`OpenVLA`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vla/openvla) [`3D Diffusion Policy`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/diffusion/3d_diffusion_policy) [`Crossformer`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/vla/crossformer) [`MimicGen`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/sim/mimicgen) [`OpenDroneMap`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/robots/opendronemap) [`ZED`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/hardware/zed)                                                                                                                                                                                         |
| **Graphics** | [`stable-diffusion-webui`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/diffusion/stable-diffusion-webui) [`comfyui`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/diffusion/comfyui) [`nerfstudio`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/nerf/nerfstudio) [`meshlab`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/nerf/meshlab) [`pixsfm`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/nerf/pixsfm) [`gsplat`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/nerf/gsplat)                                                                                                                                                                                                                                                                                                                                    |
| **Mamba** | [`mamba`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/mamba/mamba) [`mambavision`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/mamba/mambavision) [`cobra`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/mamba/cobra) [`dimba`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/mamba/dimba) [`videomambasuite`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/ml/mamba/videomambasuite)                                                                                                                                                                                                                                                                                                                                                                                                |
| **Speech** | [`whisper`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/speech/whisper) [`whisper_trt`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/speech/whisper_trt) [`piper`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/speech/piper-tts) [`riva`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/speech/riva-client) [`audiocraft`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/speech/audiocraft) [`voicecraft`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/speech/voicecraft) [`xtts`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/speech/xtts)                                                                                                                                                                                                                                                                                                              |
| **Home/IoT** | [`homeassistant-core`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/smart-home/homeassistant-core) [`wyoming-whisper`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/smart-home/wyoming/wyoming-whisper) [`wyoming-openwakeword`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/smart-home/wyoming/openwakeword) [`wyoming-piper`](https://github.com/dusty-nv/jetson-containers/tree/master/packages/smart-home/wyoming/wyoming-piper)                                                                                                                                                                                                                                                                                                                                        |

---

## 8. 使用技巧与故障排查

| 问题               | 解决方法                                |
| ---------------- | ----------------------------------- |
| 找不到 `nvidia-smi` | Jetson 使用 `tegrastats` 替代           |
| 容器中无 GPU         | 确保默认运行时设置为 `nvidia`                 |
| 权限错误             | 检查用户是否加入了 `docker` 用户组              |
| 容器崩溃             | 查看日志：`journalctl -u docker.service` |

---

## 9. 附录

### 关键文件路径

| 文件                                  | 用途              |
| ----------------------------------- | --------------- |
| `/etc/docker/daemon.json`           | Docker 运行时配置    |
| `/usr/bin/nvidia-container-runtime` | NVIDIA 运行时二进制路径 |
| `~/.docker/config.json`             | Docker 用户配置（可选） |

### 参考链接

- [Jetson Docker Runtime 官方文档](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html)
- [NVIDIA 开发者论坛](https://forums.developer.nvidia.com/)
- [JetPack SDK 下载](https://developer.nvidia.com/embedded/jetpack)


