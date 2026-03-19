# Wiki 图片上传工具

> 自动化 Markdown 文档图片上传工具,支持批量处理、智能缓存、链接替换

## 📖 目录

- [快速开始](#快速开始)
- [使用方法](#使用方法)
- [配置说明](#配置说明)
- [同名文件处理](#同名文件处理)
- [注意事项](#注意事项)
- [故障排查](#故障排查)
- [工作流程](#工作流程)
- [开发指南](#开发指南)

## 🚀 快速开始

### 1. 安装依赖

```bash
cd .image-upload
yarn install
```

### 2. 配置环境变量

创建 `.env` 文件:

```bash
FILE_BROWSER_PASSWORD=your_password_here
```

### 3. 运行工具

```bash
# 预览模式(推荐首次使用)
yarn upload-images ../docs --dry-run

# 实际上传
yarn upload-images ../docs
```

## 📚 使用方法

### 基础命令

```bash
yarn upload-images <file|directory> [options]
```

### 使用场景

#### 1. 预览模式 (Dry Run)

仅扫描和预览,不上传或修改文件:

```bash
yarn upload-images ../docs --dry-run
```

**适用场景:**
- 首次使用工具
- 确认要处理的文件范围
- 检查图片路径是否正确

#### 2. 上传单个文件

```bash
yarn upload-images ../docs/guide/getting-started.md
```

**适用场景:**
- 处理单个新增文档
- 快速验证工具功能

#### 3. 上传整个目录

```bash
yarn upload-images ../docs/
```

**适用场景:**
- 批量处理文档
- 初始化现有文档库

#### 4. 强制上传(忽略缓存)

```bash
yarn upload-images ../docs --force
```

**适用场景:**
- 图片内容更新后需要重新上传
- 缓存数据损坏需要重建
- File Browser 上的文件被删除

#### 5. 禁用缓存

```bash
yarn upload-images ../docs --no-cache
```

**适用场景:**
- 测试和调试
- 确保每次都重新上传

### 命令行选项

| 选项 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--config <path>` | `-c` | 配置文件路径 | `.upload-config.json` |
| `--dry-run` | - | 仅扫描和预览,不做任何修改 | `false` |
| `--force` | - | 强制上传所有图片(忽略缓存) | `false` |
| `--no-cache` | - | 禁用缓存机制 | `false` |
| `--static-dir <path>` | - | static 目录路径 | 自动检测 |
| `--version` | `-V` | 显示版本号 | - |
| `--help` | `-h` | 显示帮助信息 | - |

## ⚙️ 配置说明

### 配置文件结构 (`.upload-config.json`)

```json
{
  "fileBrowser": {
    "baseUrl": "https://fsx.camthink.ai",
    "username": "harry",
    "password": "${FILE_BROWSER_PASSWORD}",
    "remoteBasePath": "/wiki",
    "publicBaseUrl": "https://resources.camthink.ai/wiki"
  },
  "upload": {
    "concurrency": 3,
    "retryAttempts": 3,
    "skipUploaded": true
  },
  "markdown": {
    "fileExtensions": [".md", ".mdx"],
    "imageExtensions": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"]
  }
}
```

### 配置项说明

#### `fileBrowser` - File Browser 配置

| 字段 | 说明 | 示例 |
|------|------|------|
| `baseUrl` | File Browser 服务器地址 | `https://fsx.camthink.ai` |
| `username` | 登录用户名 | `harry` |
| `password` | 登录密码(支持环境变量) | `${FILE_BROWSER_PASSWORD}` |
| `remoteBasePath` | 远程基础路径 | `/wiki` |
| `publicBaseUrl` | 公开访问 URL 前缀 | `https://resources.camthink.ai/wiki` |

#### `upload` - 上传配置

| 字段 | 说明 | 默认值 | 推荐值 |
|------|------|--------|--------|
| `concurrency` | 并发上传数量 | `3` | `3-5` |
| `retryAttempts` | 失败重试次数 | `3` | `3` |
| `skipUploaded` | 跳过已上传的文件 | `true` | `true` |

#### `markdown` - Markdown 配置

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `fileExtensions` | 支持的文件扩展名 | `[".md", ".mdx"]` |
| `imageExtensions` | 支持的图片扩展名 | `[".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"]` |

### 环境变量

在 `.env` 文件中设置:

```bash
FILE_BROWSER_PASSWORD=your_password_here
```

**安全提示:**
- 永远不要将 `.env` 文件提交到 Git
- `.gitignore` 已配置忽略 `.env` 文件
- 密码通过环境变量注入,避免硬编码

## 🔄 同名文件处理

### 问题场景

当 Markdown 文档引用了同名但不同路径的图片时:

```markdown
![图片1](/img/section1/image.png)
![图片2](/img/section2/image.png)
![图片3](/img/section3/image.png)
```

### 处理机制

工具通过以下方式确保正确处理:

1. **完整路径识别**: 使用图片的完整路径(`/img/section1/image.png`)作为唯一标识
2. **Hash 校验**: 计算文件内容的 SHA256 hash,即使文件名相同也能区分
3. **缓存映射**: 缓存中存储 `完整路径 -> 远程 URL` 的映射关系

### 示例

**本地文件结构:**
```
static/img/
├── section1/
│   └── image.png  (内容 A)
├── section2/
│   └── image.png  (内容 B)
└── section3/
    └── image.png  (内容 C)
```

**上传后结果:**
```
https://resources.camthink.ai/wiki/img/section1/image.png
https://resources.camthink.ai/wiki/img/section2/image.png
https://resources.camthink.ai/wiki/img/section3/image.png
```

**特性:**
- ✅ 保留原始目录结构
- ✅ 不同内容的同名文件不会冲突
- ✅ 相同内容的文件自动去重(通过 hash)

## ⚠️ 注意事项

### 1. 图片路径规范

**支持的格式:**
```markdown
<!-- 标准 Markdown -->
![描述](/img/path/image.png)

<!-- JSX 语法 -->
<img src="/img/path/image.png" />
<img src={"/img/path/image.png"} />

<!-- 自定义组件 -->
<ZoomableImage src="/img/path/image.png" />
```

**要求:**
- 本地图片必须以 `/img/` 开头
- 图片文件必须存在于 `static/img/` 目录下
- 路径区分大小写

### 2. static 目录检测

工具会自动向上查找 `static` 目录:

```
当前目录
  ├── static/        ← 自动检测到
  ├── docs/
  │   └── article.md
  └── .image-upload/
```

如果自动检测失败,使用 `--static-dir` 手动指定:

```bash
yarn upload-images ../docs --static-dir /path/to/static
```

### 3. 缓存机制

**缓存文件:** `lib/.upload-cache.json`

**缓存内容:**
```json
{
  "/img/docs/image.png": {
    "hash": "a1b2c3d4...",
    "url": "https://resources.camthink.ai/wiki/img/docs/image.png"
  }
}
```

**缓存策略:**
- 默认启用缓存(推荐)
- 相同 hash 的文件只上传一次
- 使用 `--force` 强制重新上传
- 使用 `--no-cache` 临时禁用缓存

### 4. 文件修改

**重要提示:**
- 工具会直接修改 Markdown 文件
- 建议在执行前使用 `--dry-run` 预览
- 建议使用 Git 管理文档,便于回滚

**修改示例:**
```markdown
<!-- 修改前 -->
![示例](/img/docs/example.png)

<!-- 修改后 -->
![示例](https://resources.camthink.ai/wiki/img/docs/example.png)
```

### 5. 并发控制

**默认并发数:** 3

**调整建议:**
- 网络状况良好: 可提高到 5
- 网络不稳定: 保持默认值 3
- 大量小文件: 可提高到 5-8

在 `.upload-config.json` 中修改:
```json
{
  "upload": {
    "concurrency": 5
  }
}
```

## 🔧 故障排查

### 错误 1: 环境变量未设置

**错误信息:**
```
错误: 环境变量 FILE_BROWSER_PASSWORD 未设置
```

**解决方案:**
1. 创建 `.env` 文件
2. 添加密码配置:
   ```bash
   FILE_BROWSER_PASSWORD=your_password_here
   ```
3. 确认 `.env` 文件在 `.image-upload/` 目录下

---

### 错误 2: 配置文件不存在

**错误信息:**
```
错误: 配置文件不存在: .upload-config.json
```

**解决方案:**
1. 检查配置文件是否存在
2. 使用 `--config` 指定配置文件路径:
   ```bash
   yarn upload-images ../docs --config /path/to/config.json
   ```

---

### 错误 3: 未找到 static 目录

**错误信息:**
```
错误: 未找到 static 目录,请使用 --static-dir 指定
```

**解决方案:**
使用 `--static-dir` 手动指定:
```bash
yarn upload-images ../docs --static-dir /path/to/static
```

---

### 错误 4: 登录失败

**错误信息:**
```
错误: 登录失败: 401 Unauthorized
```

**可能原因:**
1. 用户名或密码错误
2. File Browser 服务不可用
3. 网络连接问题

**解决方案:**
1. 检查 `.env` 文件中的密码
2. 检查 `.upload-config.json` 中的 `username`
3. 测试 API 连接:
   ```bash
   yarn test-api
   ```

---

### 错误 5: 上传失败

**错误信息:**
```
✗ 失败: 2
  - /img/docs/image1.png: 上传失败
  - /img/docs/image2.png: 文件不存在
```

**可能原因:**
1. 图片文件不存在
2. 网络连接中断
3. File Browser 权限不足

**解决方案:**
1. 检查图片文件是否存在
2. 检查文件路径是否正确
3. 使用 `--force` 重新上传
4. 检查 File Browser 权限设置

---

### 错误 6: 图片未替换

**现象:**
上传成功但 Markdown 文件中的链接未更新

**可能原因:**
1. 图片路径不以 `/img/` 开头
2. 上传失败但未报告错误

**解决方案:**
1. 使用 `--dry-run` 检查图片路径
2. 检查上传统计中的失败数量
3. 手动检查 Markdown 文件中的图片路径

---

### 调试技巧

#### 1. 使用 Dry Run 预览

```bash
yarn upload-images ../docs --dry-run
```

查看将要处理的文件和图片列表。

#### 2. 查看详细错误

错误信息会显示完整的堆栈跟踪:

```
❌ 错误: 配置文件不存在
    at loadConfig (scripts/upload-images.js:40:11)
    ...
```

#### 3. 测试 API 连接

```bash
yarn test-api
```

验证 File Browser API 是否正常工作。

#### 4. 检查缓存文件

查看 `lib/.upload-cache.json` 了解缓存状态:

```bash
cat lib/.upload-cache.json
```

#### 5. 清理缓存

如果缓存数据有问题,可以删除缓存文件:

```bash
rm lib/.upload-cache.json
```

或使用 `--no-cache` 选项。

## 🔄 工作流程

完整的处理流程:

```
1. 加载配置
   ↓
2. 检测 static 目录
   ↓
3. 扫描 Markdown 文件
   ↓
4. 提取图片引用
   ↓
5. 过滤本地图片(/img/*)
   ↓
6. [Dry Run] → 预览并退出
   ↓
7. 初始化上传器(登录 API)
   ↓
8. 加载缓存
   ↓
9. 批量上传图片
   ├─ 计算文件 hash
   ├─ 检查缓存
   ├─ 上传新文件
   └─ 更新缓存
   ↓
10. 替换 Markdown 链接
    ├─ 读取文件
    ├─ 替换链接
    └─ 写回文件
    ↓
11. 显示统计信息
    ↓
12. 完成
```

## 👨‍💻 开发指南

### 项目结构

```
.image-upload/
├── scripts/                      # 脚本工具
│   ├── upload-images.js          # CLI 主程序 ✓
│   └── test-api.js               # API 测试脚本 ✓
│
├── lib/                          # 核心库
│   ├── api-client.js             # File Browser API 客户端 ✓
│   ├── image-uploader.js         # 图片上传协调器 ✓
│   ├── markdown-parser.js        # Markdown 解析器 ✓
│   ├── link-replacer.js          # 链接替换器 ✓
│   └── .upload-cache.json        # 上传缓存
│
├── test/                         # 测试文件
│   ├── verify-uploader.js        # 协调器核心功能验证 ✓
│   ├── test-uploader.js          # 完整集成测试
│   ├── test-uploader-unit.js     # 单元测试
│   ├── edge-case-test-report.md  # 边界情况测试报告
│   └── fixtures/                 # 测试资源
│       └── test-article.md       # 测试文档
│
├── docs/                         # 文档
│   └── image-uploader-impl.md    # 协调器实现文档 ✓
│
├── .upload-config.json           # 配置文件 ✓
├── .env                          # 环境变量
├── .gitignore                    # Git 忽略规则
├── package.json                  # 项目配置 ✓
├── README.md                     # 本文档
└── USAGE.md                      # 详细使用指南
```

### 核心模块

#### 1. API 客户端 (`lib/api-client.js`)
- File Browser API 认证登录
- 文件上传(支持覆盖)
- 文件夹创建
- 文件存在检查
- 文件夹列表查询

#### 2. 图片上传协调器 (`lib/image-uploader.js`)
- 管理上传流程
- SHA256 hash 计算
- 缓存机制(避免重复上传)
- 上传统计信息
- 并发上传控制

#### 3. Markdown 解析器 (`lib/markdown-parser.js`)
- 提取标准 Markdown 图片引用
- 提取 JSX 格式图片引用
- 支持多种图片语法

#### 4. 链接替换器 (`lib/link-replacer.js`)
- 替换 Markdown 格式链接
- 替换 JSX 格式链接
- 替换自定义组件链接

### 运行测试

```bash
# API 测试
yarn test-api

# 协调器核心功能测试
node test/verify-uploader.js

# 完整集成测试(需要有效凭据)
node test/test-uploader.js

# 边界情况测试
# 详见 test/edge-case-test-report.md
```

### 添加新功能

1. 在 `lib/` 目录创建模块
2. 在 `test/` 目录添加测试
3. 更新文档
4. 运行测试验证

### 代码规范

- 使用 JSDoc 注释
- 错误处理要完整
- 统计信息要准确
- 缓存机制要可靠
- 使用 `const` 和 `let`,避免 `var`
- 异步函数使用 `async/await`

## 📄 许可证

内部项目 - CamThink AI

## 🆘 获取帮助

- 查看使用指南: [USAGE.md](./USAGE.md)
- 查看实现文档: [docs/image-uploader-impl.md](./docs/image-uploader-impl.md)
- 运行测试: `yarn test-api`
- 显示帮助: `yarn upload-images --help`
