# NE302 Wiki 信息架构与文档建设 Spec

> 日期：2026-08-12  
> 状态：待用户审阅  
> 范围：为 NeoEyes NE302 建立独立的产品 Wiki 文档体系，明确 Quick Start、User Guide、Hardware Guide 的边界和后续软件文档路线。

## 1. 目标

将 NE302 作为 NeoEyes 产品线中的独立产品加入 Wiki，同时保留它与 NE301 之间的 STM32N6 平台关系。

本 Spec 解决以下问题：

1. NE302 是否与 NE301 共用产品导航。
2. Quick Start 与 User Guide 如何拆分。
3. 当前 datasheet、硬件设计稿、图片素材和 GitHub 源码能够支撑哪些页面。
4. 哪些内容可以直接写入，哪些内容必须经过 NE302 实机核查后才能承诺。
5. 如何保证中英文、图片、导航和后续软件文档可持续维护。

## 2. 产品定位与边界

### 2.1 产品关系

NE302 与 NE301 共享 STM32N6 视觉 AI 平台和 STM32U0 低功耗控制思路，但不作为 NE301 的一个硬件变体挂在 NE301 Series 下。

导航层采用独立产品系列：

```text
NeoEyes NE301 Series
NeoEyes NE302 Series
NeoEyes NE503 Series
```

NE302 的产品定位是：

> NeoEyes NE301 同平台的 Mini AI Vision Camera，面向室内持续供电设备，提供连续 4MP 图像采集、本地 INT8 推理和结构化结果输出。

### 2.2 与 NE301 的差异边界

| 维度 | NE301 | NE302 |
|---|---|---|
| 产品形态 | 模块化低功耗 AI 相机 | 紧凑型 Mini AI Vision Camera |
| 典型供电 | 电池、太阳能、Type-C、PoE 等 | USB Type-C 持续供电 |
| 典型部署 | 户外、低频抓拍、事件触发 | 室内、连续视觉、设备集成 |
| 结构 | 可换镜头/通信/供电模块 | 38×38 mm PCBA，42×42×20 mm 外壳 |
| 视觉能力 | 低功耗事件型视觉 | 连续 4MP 采集，最高 30 fps |
| 安装 | NeoEyes 模块化安装结构 | 后置磁吸或 3M 胶固定 |

共享平台只用于解释技术关系、复用经过核实的通用开发概念和交叉链接；不复制 NE301 的电池续航、低功耗部署、模块化相机等产品描述。

## 3. 证据与写作规则

### 3.1 资料来源优先级

1. `camthink_neoeyes_ne302_datasheet.pdf`：公开产品定位和公开规格的第一来源。
2. `/Users/harryhua/Downloads/NE302-硬件设计-markdown/NE302.md`：硬件方案、主板/接口板差异、结构设计和工程备注来源。
3. `/Users/harryhua/Movies/0-Materials/NE302 Camera mini主板接口板/`：产品外观、主板、接口板和标注图片来源。
4. `https://github.com/camthink-ai/ne302`：软件能力、工程结构、编译/烧录流程和开发资源来源。
5. NE301 Wiki：仅作为同平台 UI 和文档组织的参考，不作为 NE302 参数或功能的直接来源。

### 3.2 公开规格口径

以 NE302 datasheet 的当前版本为公开规格基线：

| 分类 | 公开口径 |
|---|---|
| 主控 | STM32N6，Cortex-M55，800 MHz，Arm Helium |
| AI 加速 | Neural-ART，1 GHz，最高 0.6 TOPS INT8 |
| 内存 | 4.2 MB 片上 SRAM/NPU RAM；32 MB PSRAM |
| Flash | 128 MB SPI Flash |
| 图像 | 4 MP CMOS，2688×1520，最高 30 fps |
| 编码 | H.264、JPEG 硬件编码 |
| 镜头 | 标准 M12，HFOV 88°/137° |
| 无线 | Wi-Fi 6，2.4 GHz；BLE 5.3 |
| 天线 | 外置 SMA，3–4 dBi |
| 存储与控制 | MicroSD、Trigger/Reset 按键、双色指示灯 |
| 供电 | USB Type-C 持续供电 |
| 尺寸 | 38×38 mm PCBA；42×42×20 mm 外壳 |
| 设备 | 白色补光灯、环境温湿度传感器 |
| 部署 | 室内；后置磁吸或 3M 胶安装 |
| 工作温度 | -20 °C 至 +50 °C |

设计稿中出现的 V1.0/V1.1 差异、不同电源采样范围、BLE 兼容备注和接口复用信息属于工程版本信息。除非与当前量产版本确认一致，否则不直接放入产品概述的公开规格表；必要时放入 Hardware Guide 的“版本说明”并标注适用版本。

### 3.3 证据标签

文档内部编辑时使用以下判断：

- **官方规格**：datasheet 明确给出的产品参数。
- **源码已声明**：GitHub README、工程目录或构建脚本明确声明的能力。
- **硬件设计资料**：原理图、结构设计稿、BOM 或标注图片中的信息。
- **实机已验证**：在 NE302 真实设备上操作并记录的功能。
- **待确认**：只有设计备注、推断或未完成实测的内容。

对外文档不展示“待确认”字样作为产品能力；没有足够证据的内容暂不写入承诺性描述。

## 4. 总体信息架构

目录建议为：

```text
docs/8-neoeyes-ne302-series/
├── 0-overview.md
├── 1-quick-start.md
├── 2-user-guide/
│   ├── _category_.json
│   ├── 0-console-overview.md
│   ├── 1-live-preview-and-ai-inference.md
│   ├── 2-model-validation-and-application.md
│   ├── 3-hardware-control-and-trigger.md
│   └── 4-system-storage-and-device-information.md
└── 3-hardware-guide/
    ├── _category_.json
    ├── 0-components-overview.md
    ├── 1-main-board.md
    ├── 2-interface-board.md
    └── 3-hardware-resources.md
```

英文目录保持完全相同的相对路径：

```text
i18n/en/docusaurus-plugin-content-docs/current/8-neoeyes-ne302-series/
```

侧边栏中将 NE302 放在 NE301 之后、NE503 之前。使用 `8-` 目录前缀是为了避免改动现有 `7-release-notes/` 路径；侧边栏展示顺序由 `sidebars.js` 明确控制。

## 5. 页面设计

### 5.1 Product Overview

文件：`0-overview.md`

结构：

1. 产品简介
2. NE302 与 NE301 平台关系
3. 核心能力
4. 产品规格
5. 连续视觉处理流程
6. 硬件平台与两种板卡
7. 镜头、天线、存储和安装方式
8. 典型室内应用场景
9. 产品资料、源码和开发入口
10. 技术支持

职责：回答“NE302 是什么、适合什么场景、主要参数是什么”。不写详细 UI 操作和烧录步骤。

### 5.2 Quick Start

文件：`1-quick-start.md`

结构 DNA 是“一条线”，目标是让第一次接触设备的读者完成首次成功体验：

1. 套件与工具准备
2. 主板与接口板确认
3. 天线、MicroSD、Type-C 和板间连接
4. 设备上电与指示灯确认
5. 访问 `192.168.10.10`
6. 使用默认管理员账号首次登录并修改密码
7. 查看实时画面
8. 完成一次基础 AI 结果验证
9. 下一步链接：User Guide、Hardware Guide、Software Guide

Quick Start 只保留完成动作所需的信息，不展开：

- 每个 UI 字段的详细含义
- 模型生命周期管理
- MQTT/存储策略的全部参数
- 硬件版本差异
- CLI、源码编译和故障排查

### 5.3 User Guide

目录：`2-user-guide/`

User Guide 是按能力域组织的参考手册，不是 Quick Start 的扩展版。NE302 UI 已知与 NE301 基本一致，但正式写作前必须登录 NE302 逐页核查页面、字段、按钮、默认值和功能耦合。

#### `0-console-overview.md`

- 登录方式和控制台入口
- 导航栏和模块关系
- 页面状态、保存和生效规则
- 设备信息入口
- 从控制台进入后续能力域的路径

#### `1-live-preview-and-ai-inference.md`

- 实时预览
- 抓拍/视频流
- AI 推理开关
- 推理结果展示
- 图像、编码和实时处理相关配置

#### `2-model-validation-and-application.md`

- 模型验证
- 模型导入/切换/当前模型
- MQTT 或其他结果输出
- MicroSD 记录
- 连续视觉处理链路：采集 → 推理 → 逻辑 → 输出

#### `3-hardware-control-and-trigger.md`

- Trigger/Reset 按键
- 双色指示灯
- 补光灯
- 温湿度传感器
- 触发源、采集时机和硬件联动

#### `4-system-storage-and-device-information.md`

- 系统设置
- 网络和无线连接
- MicroSD 状态与存储
- 固件/软件版本
- 设备信息
- 重启、恢复和升级相关操作

### 5.4 Hardware Guide

目录：`3-hardware-guide/`

#### `0-components-overview.md`

- NE302 整机/外壳
- 38×38 mm 主板
- 接口板
- 摄像头与 M12 镜头
- SMA 天线
- Type-C、MicroSD 和安装部件

#### `1-main-board.md`

- STM32N6、STM32U0、PSRAM、Flash、Wi-Fi 芯片和摄像头
- 主板尺寸与固定孔
- 主板接口位置
- 主板标注图
- 设计稿中确认过的接口与器件说明

#### `2-interface-board.md`

- Type-C 供电
- N6-STLINK、U0-STLINK
- U6-UART
- N6-BOOT、U0-BOOT
- MicroSD
- 接口板标注图和连接注意事项

#### `3-hardware-resources.md`

- 主板原理图下载
- 接口板原理图下载
- Wi-Fi HaLow 接口板资料
- GitHub Hardware/Docs 资源
- 版本适用范围和资源使用说明

## 6. UI 核查方案

### 6.1 核查目标

验证“NE302 UI 基本跟 NE301 一致”是否足以复用页面结构，而不是直接假设所有字段完全相同。

### 6.2 核查范围

至少核查：

1. 登录页、默认入口和首次登录行为。
2. 顶部导航的模块数量和名称。
3. 实时预览、抓拍、AI 推理和视频输出。
4. 模型验证、模型导入和模型切换。
5. MQTT/结果输出与 MicroSD 保存。
6. 补光灯、温湿度、Trigger/Reset 和指示灯相关设置。
7. 网络、无线、存储、系统信息和固件升级。

### 6.3 核查输出

核查完成后形成内部差异表：

| 项目 | NE301 | NE302 | 处理 |
|---|---|---|---|
| 页面路径 |  |  | 复用/改写 |
| 页面字段 |  |  | 保留/删除/新增 |
| 默认值 |  |  | 以实机为准 |
| 截图 |  |  | 重新截图/复用 |
| 跨页依赖 |  |  | 更新交叉链接 |

只有通过核查的字段才能进入 User Guide 的最终正文。

## 7. 图片与资源策略

### 7.1 图片目录

```text
static/img/neoeyes-ne302-series/
├── overview/
├── quick-start/
├── user-guide/
└── hardware-guide/
```

### 7.2 图片使用原则

- 产品概述优先使用最终外观渲染图和整机图。
- Hardware Guide 优先使用主板、接口板和标注图。
- User Guide 使用英文 UI 截图；如果 NE302 UI 与 NE301 不完全一致，重新截图。
- 原理图和其他非图片资源作为下载文件，不强制嵌入页面。
- 文件名统一使用小写字母、数字和连字符；不直接使用中文原始文件名。
- 图片先使用 `/img/neoeyes-ne302-series/...` 本地路径，质量检查后再通过 `upload-images.sh` 上传 CDN。

## 8. 分阶段交付

### Phase 1：产品与硬件入口

交付：

- Product Overview
- Quick Start
- Hardware Guide 4 页
- 中英文镜像
- 图片整理和本地引用
- 侧边栏入口

目标：用户可以理解产品、完成基本连接、查看硬件结构并取得硬件资源。

### Phase 2：UI User Guide

前置条件：完成 NE302 实机 UI 差异核查。

交付：

- User Guide 5 页
- NE302 专属 UI 截图
- 页面字段、依赖和保存/生效行为
- 中英文同步

目标：用户可以按能力域查找和配置设备，而不是依赖 Quick Start 猜测页面用途。

### Phase 3：Software Guide

基于 GitHub README、SETUP、Makefile 和实际烧录验证补充：

- 开发环境搭建
- 编译、签名、打包和烧录
- N6/U0 启动与 Boot 开关
- 软件工程结构
- 模型转换与部署
- OTA 和恢复流程

没有实机验证的内容只作为开发参考，不写成已验证的操作承诺。

## 9. 非目标

本 Spec 不包含：

- 修改 NE301 现有产品定义。
- 将 NE302 改名为 NE301 的某个版本。
- 重构整个 wiki 的产品目录。
- 在未核查实机前复制 NE301 全部 UI 文案。
- 根据设计稿推断未确认的量产参数。
- 直接发布性能、功耗、兼容性或稳定性 benchmark。

## 10. 验收标准

### 信息架构

- NE302 在侧边栏中作为独立产品系列出现。
- Quick Start 和 User Guide 分开。
- User Guide 按能力域组织，不按 Quick Start 的线性步骤重复。
- NE301 与 NE302 的共享平台关系有说明，但产品边界清晰。

### 内容

- 产品公开规格全部来自 datasheet 或已核实的官方源码资料。
- 所有 UI 字段和截图经过 NE302 实机核查，或明确留在待验证清单中。
- 不把设计稿中的版本备注直接写成当前量产规格。
- 中英文标题层级、表格、参数和图片位置一致。

### 工程质量

- Frontmatter 通过验证脚本。
- 图片引用对应的 `static/` 文件全部存在。
- 中英文文件路径和文件名完全一致。
- `yarn build` 通过，无新增 broken links 或 broken anchors。
- 只修改 NE302 相关文件，不覆盖现有 NE503 未提交改动。

## 11. 当前结论

NE302 应独立成为一个产品系列；它与 NE301 的关系应表达为“同平台、不同产品定位”。

首期文档体系按 Product Overview + Quick Start + User Guide + Hardware Guide 设计。现有资料可以支撑产品和硬件入口，用户提供的 UI 入口信息使 Quick Start 可落地；User Guide 的最终正文需要先完成 NE302 与 NE301 的实机差异核查。
