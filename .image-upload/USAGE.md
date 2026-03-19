# Wiki 图片上传工具

自动上传 Markdown 文档中的本地图片到 File Browser,并替换图片链接为远程 URL。

## 功能特性

- ✅ 自动扫描 Markdown 文件中的本地图片引用
- ✅ 支持标准 Markdown 和 JSX 格式的图片标签
- ✅ 智能缓存机制,避免重复上传
- ✅ 批量并发上传,提高效率
- ✅ 自动替换图片链接为远程 URL
- ✅ 支持 dry-run 模式预览
- ✅ 详细的进度显示和错误报告

## 快速开始

### 1. 配置环境变量

创建 `.env` 文件:

```bash
FILE_BROWSER_PASSWORD=your_password_here
```

### 2. 配置文件

配置文件位于 `.upload-config.json`,包含以下设置:

```json
{
  "fileBrowser": {
    "baseUrl": "https://fsx.camthink.ai",
    "username": "harry",
    "password": "${FILE_BROWSER_PASSWORD}",
    "remoteBasePath": "/wiki/img",
    "publicBaseUrl": "https://resources.camthink.ai/wiki/img"
  },
  "upload": {
    "concurrency": 3,
    "retryAttempts": 3,
    "skipUploaded": true,
    "createFolder": true
  },
  "markdown": {
    "fileExtensions": [".md", ".mdx"],
    "imageExtensions": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"]
  }
}
```

### 3. 使用方法

#### 预览模式 (Dry Run)

仅扫描和预览,不上传或修改文件:

```bash
yarn upload-images test/fixtures --dry-run
```

#### 上传单个文件

```bash
yarn upload-images test/fixtures/test-article.md
```

#### 上传整个目录

```bash
yarn upload-images docs/
```

#### 强制上传(忽略缓存)

```bash
yarn upload-images test/fixtures --force
```

#### 禁用缓存

```bash
yarn upload-images test/fixtures --no-cache
```

#### 指定配置文件

```bash
yarn upload-images test/fixtures --config custom-config.json
```

#### 指定 static 目录

```bash
yarn upload-images test/fixtures --static-dir /path/to/static
```

## 命令行选项

| 选项 | 简写 | 说明 |
|------|------|------|
| `--config <path>` | `-c` | 配置文件路径 |
| `--dry-run` | - | 仅扫描和预览,不上传或修改文件 |
| `--force` | - | 强制上传所有图片(忽略缓存) |
| `--no-cache` | - | 禁用缓存 |
| `--static-dir <path>` | - | static 目录路径(默认自动检测) |
| `--version` | `-V` | 显示版本号 |
| `--help` | `-h` | 显示帮助信息 |

## 工作流程

1. **加载配置** - 读取配置文件并替换环境变量
2. **扫描文件** - 递归查找所有 Markdown 文件
3. **提取图片** - 从 Markdown 中提取所有图片引用
4. **过滤本地图片** - 仅保留以 `/img/` 开头的本地图片
5. **初始化上传器** - 登录 File Browser API 并加载缓存
6. **上传图片** - 批量上传图片,支持并发和缓存
7. **替换链接** - 将 Markdown 中的本地链接替换为远程 URL
8. **显示统计** - 输出上传统计信息

## 支持的图片格式

- Markdown: `![alt](/img/path/image.png)`
- JSX: `<img src="/img/path/image.png" />`
- JSX (花括号): `<img src={"/img/path/image.png"} />`
- 自定义组件: `<ZoomableImage src="/img/path/image.png" />`

## 缓存机制

工具使用 SHA256 hash 识别图片内容:

- 相同内容的图片只上传一次
- 缓存文件位于 `lib/.upload-cache.json`
- 使用 `--force` 强制重新上传
- 使用 `--no-cache` 禁用缓存

## 示例输出

```
🚀 Wiki 图片上传工具

→ 加载配置...
✓ 配置加载成功
→ static 目录: /path/to/static
→ 扫描 Markdown 文件...
✓ 找到 5 个 Markdown 文件
→ 提取图片引用...
  - 总图片引用: 12
  - 本地图片: 8

📤 开始上传图片

📊 上传统计:
  ✓ 成功上传: 5
  - 跳过(缓存): 3

🔄 替换图片链接

  ✓ docs/guide.md (3 个图片)
  ✓ docs/tutorial.md (2 个图片)

✨ 处理完成!

  - 处理文件: 5
  - 更新文件: 2
  - 上传图片: 5
  - 跳过图片: 3
```

## 开发

### 项目结构

```
.image-upload/
├── scripts/
│   ├── upload-images.js    # CLI 主程序
│   └── test-api.js         # API 测试脚本
├── lib/
│   ├── api-client.js       # File Browser API 客户端
│   ├── markdown-parser.js  # Markdown 解析器
│   ├── link-replacer.js    # 链接替换器
│   └── image-uploader.js   # 图片上传协调器
├── test/
│   ├── fixtures/           # 测试文件
│   └── *.js               # 测试脚本
├── .upload-config.json     # 配置文件
├── .env                    # 环境变量
└── package.json
```

### 测试

```bash
# 测试 API 连接
yarn test-api

# Dry run 测试
yarn upload-images test/fixtures --dry-run
```

## 故障排除

### 错误: 环境变量未设置

```
错误: 环境变量 FILE_BROWSER_PASSWORD 未设置
```

解决方案: 在 `.env` 文件中设置密码

### 错误: 配置文件不存在

```
错误: 配置文件不存在: .upload-config.json
```

解决方案: 使用 `--config` 指定配置文件路径

### 错误: 未找到 static 目录

```
错误: 未找到 static 目录,请使用 --static-dir 指定
```

解决方案: 使用 `--static-dir` 手动指定 static 目录路径

## 许可证

MIT
