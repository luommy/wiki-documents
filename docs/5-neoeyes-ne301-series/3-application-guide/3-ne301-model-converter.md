---
description: NE301 Model Converter 是零代码的端到端模型转换平台，支持将 PyTorch/YOLO 模型自动转换为 NE301 边缘设备可用的 .bin 格式，通过 Docker 一键部署，提供实时进度反馈和智能 OOM 修复。
keywords: [NE301, 模型转换, PyTorch, YOLOv8, Docker, 边缘AI, 模型量化, TFLite, OOM修复]
tags: [NE301, 模型转换, Docker, YOLOv8, 边缘AI]
---

# NE301 Model Converter

## 1. 概览

[NE301](https://www.camthink.ai/store/ne301/) Model Converter 是一个基于 Docker 的零代码模型转换平台，支持将 PyTorch/YOLO 模型自动转换为 [NE301](https://www.camthink.ai/store/ne301/) 边缘设备可用的 .bin 格式。

**核心特性**：

- **零代码操作** - Web 界面操作，无需编程经验
- **端到端自动化** - PyTorch → TFLite → 量化 → [NE301](https://www.camthink.ai/store/ne301/) .bin 全自动流程
- **智能 OOM 修复**（v2.1 新增）- 自动诊断和修复 [NE301](https://www.camthink.ai/store/ne301/) 内存问题
- **实时进度反馈** - WebSocket 推送转换进度和日志
- **多尺寸支持** - 支持 256/320/480 输入尺寸（默认 256）
- **跨平台部署** - macOS / Linux / Windows

**支持模型**：YOLOv8（所有变体）

**转换流程**：

```
PyTorch (.pt/.pth)
    ↓ [0-30%] 导出为 TFLite
TFLite (float32)
    ↓ [30-60%] ST 官方量化
量化 TFLite (int8)
    ↓ [60-70%] NE301 准备 + mpool 自动修复
    ↓ [70-100%] NE301 打包
NE301 .bin 文件
```

---

## 2. 环境准备

### 2.1 系统要求


| 组件             | 要求                                     |
| -------------- | -------------------------------------- |
| Docker Desktop | 必须安装并运行                                |
| 内存             | 最低 4GB，推荐 8GB                          |
| 磁盘空间           | 10GB+（用于 Docker 镜像）                    |
| 浏览器            | Chrome / Firefox / Safari / Edge（最新版本） |


### 2.2 技术栈


| 组件          | 版本                  |
| ----------- | ------------------- |
| Python      | 3.11/3.12（不支持 3.14） |
| PyTorch     | 2.4.0               |
| Ultralytics | 8.3.0               |
| TensorFlow  | 2.16.2              |
| FastAPI     | Starlette 0.52.1    |


### 2.3 安装 Docker Desktop

**macOS/Linux**：

```bash
# 访问官网下载安装
https://www.docker.com/products/docker-desktop/

# 验证安装
docker --version
docker ps
```

**Windows**：

下载并安装 Docker Desktop for Windows，安装后重启计算机。

![](https://resources.camthink.ai/wikihttps://resources.camthink.ai/wiki/img/ne301/application-guide/ne301-model-converter/docker-desktop.png)

*Docker Desktop 运行界面*

---

## 3. 安装部署

### 3.1 克隆项目

**步骤 1：克隆主项目**

```bash
git clone https://github.com/camthink-ai/ne301-model-converter.git
cd ne301-model-converter
```

**步骤 2：克隆 [NE301](https://www.camthink.ai/store/ne301/) 工具链**

```bash
# NE301 工具链用于模型打包和量化
git clone https://github.com/camthink-ai/ne301.git ne301
```

**项目结构**：

```
ne301-model-converter/
├── backend/              # FastAPI 后端
├── frontend/             # Web 前端
├── ne301/               # NE301工具链
├── docker-compose.yml   # 生产部署
├── docker-compose.dev.yml   # 开发环境
└── docker-compose.dev.local.yml  # 本地开发（推荐）
```

### 3.2 拉取依赖镜像

```bash
# 拉取 NE301 工具链镜像（约 1GB）
docker pull camthink/ne301-dev:latest
```

### 3.3 启动服务

**生产部署**（首次启动 ~2 分钟）：

```bash
docker-compose up -d
```

**本地开发**（代码修改后 ~2 秒重启）：

```bash
docker-compose -f docker-compose.dev.local.yml up -d
```

**验证服务**：

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3.4 访问 Web 界面

打开浏览器访问：

```
http://localhost:8000
```

看到 [NE301](https://www.camthink.ai/store/ne301/) Model Converter 界面即表示部署成功。

![](https://resources.camthink.ai/wikihttps://resources.camthink.ai/wiki/img/ne301/application-guide/ne301-model-converter/web-interface.png)

*NE301 Model Converter Web 界面*

---

## 4. 模型转换

### 4.1 准备模型文件

**必需文件**：

- PyTorch 模型文件（`.pt` 或 `.pth`）
- 最大文件大小：500MB

**建议文件**：

- **类别定义 YAML**：定义检测类别名称，提高检测结果可读性
- **校准数据集 ZIP**：包含 32-100 张代表性图片，提高量化精度 5-15%（**强烈建议提供**）

**校准数据集创建步骤**：

```bash
# 1. 创建图片目录
mkdir calibration_images

# 2. 复制 32-100 张代表性图片
cp /path/to/your/images/*.jpg calibration_images/

# 3. 创建 ZIP 文件
zip -r calibration.zip calibration_images/
```

**最佳实践**：

- ✅ 使用与生产数据相似的图片
- ✅ 包含各种光照条件、角度
- ✅ 图片数量 32-100 张
- ❌ 避免重复或过于相似的图片

**示例模型**（项目提供）：

项目提供了一套完整的示例文件，位于 `example/` 目录：

- **模型文件**：`example/best.pt`（6MB）- 30 类家居物品检测 YOLOv8 模型
- **类别定义**：`example/test.yaml`（531B）- 30 个类别名称（Banana, Apple, Orange 等）
- **校准数据集**：`example/calibration.zip`（10MB）- ~50 张代表性图片

**模型详情**：

- 训练数据：家居垃圾分类数据集
- 检测类别：30 个家居物品类别（水果、蔬菜、食品、包装等）
- 适用场景：智能垃圾分类、库存管理、智慧家居

### 4.2 上传模型

1. 点击 **"选择模型文件"**
2. 选择 `.pt` 或 `.pth` 文件

![](https://resources.camthink.ai/wikihttps://resources.camthink.ai/wiki/img/ne301/application-guide/ne301-model-converter/upload-pytorch-model.png)

*上传 PyTorch 模型文件*

1. （建议）上传 `classes.yaml`

![](https://resources.camthink.ai/wikihttps://resources.camthink.ai/wiki/img/ne301/application-guide/ne301-model-converter/upload-class-yaml.png)

*上传类别定义文件*

1. （强烈建议）上传校准数据集 ZIP

![](https://resources.camthink.ai/wikihttps://resources.camthink.ai/wiki/img/ne301/application-guide/ne301-model-converter/upload-calibration-dataset.png)

*上传校准数据集*

### 4.3 选择转换预设


| 预设       | 输入尺寸    | 精度  | 速度  | 适用场景    |
| -------- | ------- | --- | --- | ------- |
| **快速** ⭐ | 256×256 | 良好  | 最快  | NE301推荐 |
| 平衡       | 320×320 | 较好  | 快速  | 质量较好    |
| 高精度      | 480×480 | 最好  | 较慢  | 高精度要求场景 |


**推荐使用"快速"预设**，在速度和精度之间取得最佳平衡，适合大多数边缘应用场景。

### 4.4 开始转换

1. 点击 **"开始转换"**
2. 实时查看转换进度和日志

**转换流程**：

```
[步骤 1/4] PyTorch → TFLite (0-30%)
[步骤 2/4] TFLite 量化 (30-60%)
[步骤 3/4] NE301 准备 + mpool 自动修复 (60-70%)
[步骤 4/4] NE301 打包 (70-100%)
```

![](https://resources.camthink.ai/wikihttps://resources.camthink.ai/wiki/img/ne301/application-guide/ne301-model-converter/conversion-progress.png)

*实时转换进度显示*

### 4.5 下载结果

转换完成后：

1. 点击 **"Download"**
2. 文件自动保存到本地

![](https://resources.camthink.ai/wikihttps://resources.camthink.ai/wiki/img/ne301/application-guide/ne301-model-converter/download-result.png)

*下载转换结果*

### 4.6 模型验证（可选）

转换完成后，建议在 [NE301](https://www.camthink.ai/store/ne301/) 设备上验证模型：

1. 导入模型到 [NE301](https://www.camthink.ai/store/ne301/) 设备

![](https://resources.camthink.ai/wikihttps://resources.camthink.ai/wiki/img/ne301/application-guide/ne301-model-converter/upload-model.png)

*导入模型到 [NE301](https://www.camthink.ai/store/ne301/) 设备*

1. 上传图片，[NE301](https://www.camthink.ai/store/ne301/) 将自动识别并呈现结果

![](https://resources.camthink.ai/wikihttps://resources.camthink.ai/wiki/img/ne301/application-guide/ne301-model-converter/model-verification.png)

*[NE301](https://www.camthink.ai/store/ne301/) 设备模型验证*

---

## 5. 常见问题

**Q: 校准数据集是必需的吗？**

A: 不是必需的，但**强烈建议提供**。不提供时系统使用 fake 量化，精度可能降低 5-15%。详见 [4.1 准备模型文件](#41-准备模型文件)。

**Q: 智能修复功能是什么？**

A: v2.1 新增功能，自动诊断和修复 [NE301](https://www.camthink.ai/store/ne301/) OOM 问题。系统会检测 mpool 配置错误并自动修复，确保模型成功加载。无需用户手动操作。

---

## 6. 附录

### 6.1 常用命令速查

```bash
# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 检查服务状态
docker-compose ps

# 重新构建镜像
docker-compose build
```

### 6.2 环境变量配置

创建 `backend/.env` 文件自定义配置：

```env
# Docker 配置
NE301_DOCKER_IMAGE=camthink/ne301-dev:latest
NE301_PROJECT_PATH=/app/ne301

# 服务器配置
HOST=0.0.0.0
PORT=8000
DEBUG=False

# 日志级别
LOG_LEVEL=INFO

# 文件存储
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
OUTPUT_DIR=./outputs
MAX_UPLOAD_SIZE=524288000  # 500MB
```

### 6.3 相关文档

- [项目仓库](https://github.com/camthink-ai/ne301-model-converter) - GitHub 仓库
- [开发文档](https://github.com/camthink-ai/ne301-model-converter/blob/main/CLAUDE.md) - 技术架构和开发指南
- [快速开始指南](https://github.com/camthink-ai/ne301-model-converter/blob/main/docs/QUICK_START_cn.md) - 5 分钟快速上手
- [Docker 部署指南](https://github.com/camthink-ai/ne301-model-converter/blob/main/docs/DOCKER_DEPLOYMENT_cn.md) - 详细 Docker 说明

---

**文档版本**: 2.1.0  
**最后更新**: 2026-03-19