# Wiki 图片上传工具

> 自动化 Markdown 文档图片上传器，支持批量处理和链接替换

**快速链接：** [安装](#-安装) · [使用](#-使用) · [配置](#-配置) · [完整文档](./USAGE.md)

## ✨ 特性

- 🚀 **批量处理** - 并发上传多张图片（8个并发）
- 🔄 **自动同步** - 自动同步中英文文档的图片链接
- 🎯 **智能路径映射** - 基于文档名的智能文件夹命名
- ⚡ **高可靠性** - 必须所有图片上传成功才修改文档
- 🔍 **预览模式** - 执行前预览变更
- 🌐 **多格式支持** - 标准 Markdown、JSX 和自定义组件

## 📦 安装

```bash
cd .image-upload
yarn install
cp .env.example .env
# 编辑 .env 文件，填写您的凭据
yarn test-api  # 验证配置
```

## 🚀 使用

### 基本命令

```bash
# 预览模式（首次使用推荐）
./upload-images.sh docs --dry-run

# 上传单个文件
./upload-images.sh docs/guide/getting-started.md

# 上传整个目录
./upload-images.sh docs/

# 强制重新上传
./upload-images.sh docs --force
```

### 命令选项

| 选项 | 描述 |
|------|------|
| `--dry-run` | 仅预览，不上传或修改 |
| `--force` | 强制重新上传所有图片 |
| `--no-cache` | 禁用缓存机制 |
| `--static-dir <路径>` | 手动指定 static 目录 |

## ⚙️ 配置

### 环境变量（`.env`）

```bash
FILE_BROWSER_USERNAME=your_username_here
FILE_BROWSER_PASSWORD=your_password_here
```

### 配置文件（`.upload-config.json`）

关键设置：

```json
{
  "fileBrowser": {
    "baseUrl": "https://fsx.camthink.ai",
    "username": "${FILE_BROWSER_USERNAME}",
    "password": "${FILE_BROWSER_PASSWORD}"
  },
  "upload": {
    "concurrency": 8,
    "retryAttempts": 3
  }
}
```

**完整配置说明：** [USAGE.md](./USAGE.md#配置)

## 📝 图片路径标准

**支持的格式：**
```markdown
![描述](/img/path/image.png)
<img src="/img/path/image.png" />
<ZoomableImage src="/img/path/image.png" />
```

**要求：**
- 本地图片必须以 `/img/` 开头
- 文件必须存在于 `static/img/` 目录
- 已上传的图片（`https://resources.camthink.ai/wiki/img/*`）会被自动跳过

## 🌐 语言同步

工具自动同步中英文文档的图片链接：

- **中文 → 英文：** `docs/...` → `i18n/en/docusaurus-plugin-content-docs/current/...`
- **英文 → 中文：** `i18n/en/...` → `docs/...`

**示例：**
```bash
./upload-images.sh docs/guide.md
# 输出：
# ✓ docs/guide.md (10 个图片)
# ✓ i18n/en/.../guide.md (10 个链接) - 方向：中文 → 英文
```

## 🔧 故障排除

### 常见问题

<details>
<summary><b>错误：环境变量未设置</b></summary>

```bash
# 解决方案：创建 .env 文件
cp .env.example .env
# 编辑 .env，填写您的凭据
```
</details>

<details>
<summary><b>错误：登录失败（401 Unauthorized）</b></summary>

**可能原因：**
- 用户名或密码错误
- File Browser 服务不可用

**解决方案：**
```bash
yarn test-api  # 测试 API 连接
```
</details>

<details>
<summary><b>错误：上传失败</b></summary>

**检查：**
1. 图片文件存在于 `static/img/` 目录
2. 文件路径正确
3. File Browser 权限

**调试：**
```bash
yarn upload-images ../docs --dry-run  # 预览模式
```
</details>

**完整故障排除指南：** [USAGE.md](./USAGE.md#故障排除)

## 📚 文档

- **[USAGE.md](./USAGE.md)** - 完整使用指南，包含所有选项和示例
- **[docs/image-uploader-impl.md](./docs/image-uploader-impl.md)** - 实现细节
- **[README.md](./README.md)** - English Documentation

## 🔄 工作流程

```
1. 加载配置
   ↓
2. 扫描 Markdown 文件
   ↓
3. 提取本地图片（/img/*）
   ↓
4. 过滤已上传图片
   ↓
5. [Dry Run] → 预览并退出
   ↓
6. 批量上传图片
   ↓
7. 替换 Markdown 链接
   ↓
8. 同步到对应语言版本
   ↓
9. 完成
```

## 🛠️ 开发

### 项目结构

```
.image-upload/
├── scripts/           # CLI 工具
│   ├── upload-images.js
│   └── test-api.js
├── lib/               # 核心库
│   ├── api-client.js
│   ├── image-uploader.js
│   ├── markdown-parser.js
│   ├── link-replacer.js
│   ├── language-sync.js
│   └── path-mapper.js
└── test/              # 测试文件
```

### 运行测试

```bash
yarn test-api                 # API 连接测试
node test/verify-uploader.js  # 核心功能测试
```

**完整开发指南：** [USAGE.md](./USAGE.md#开发指南)

## 📄 许可证

内部项目 - CamThink AI

---

**需要帮助？**
- 运行 `yarn upload-images --help` 查看 CLI 选项
- 查看 [USAGE.md](./USAGE.md) 获取详细文档
- 运行 `yarn test-api` 验证配置
