# Wiki 图片自动上传系统设计文档

**日期：** 2026-03-19
**状态：** 设计完成，待实施
**作者：** Claude Code

---

## Context

### 问题背景

当前的 wiki-documents 项目使用 Docusaurus 构建，图片存储在 `/static/img/` 目录下，通过 Git 管理。用户的工作流程是：

1. 编写文章并嵌入本地图片
2. 反复修改直到定稿
3. 准备构建时需要将图片上传到 File Browser 服务
4. 更新文章中的图片链接为线上 URL
5. 执行 `yarn build`

### 当前痛点

- 图片上传需要手动操作
- 链接替换容易出错
- 没有自动化的工具支持
- File Browser 只有创建权限，没有删除权限，需要谨慎上传

### 目标

构建一个 Node.js CLI 工具，实现：

- 手动触发的图片上传
- 自动更新 Markdown 中的图片链接
- 支持指定文件或目录
- 智能处理同名文件冲突
- 生成清晰的上传报告

---

## 技术方案

### 核心架构

```
wiki-image-upload/
├── scripts/
│   ├── upload-images.js       # 主 CLI 工具
│   └── test-api.js            # API 验证脚本
├── lib/
│   ├── api-client.js          # File Browser API 封装
│   ├── markdown-parser.js     # Markdown 文件解析
│   ├── image-uploader.js      # 图片上传逻辑
│   └── link-replacer.js       # 链接替换逻辑
├── .upload-cache.json         # 上传缓存
├── .upload-config.json        # 配置文件
└── test/                      # 测试文件夹
    └── fixtures/
```

### File Browser API 集成

基于探索的 API 结构：

```javascript
class FileBrowserAPI {
  // 登录获取 JWT Token
  async login() {
    POST /api/login
    Body: {username, password}
    返回: JWT token
    Header: X-Auth (非标准 Authorization)
  }

  // 上传文件
  async uploadFile(remotePath, localFilePath) {
    POST /api/resources/{remotePath}?override=true
    Header: X-Auth: {token}
    Body: 文件内容
  }

  // 下载文件
  async downloadFile(remotePath) {
    GET /api/raw/{remotePath}
    Header: X-Auth: {token}
  }

  // 创建文件夹（需要验证）
  async createFolder(remotePath) {
    POST /api/resources/{folderPath}
    Header: X-Auth: {token}
  }

  // 检查文件存在（需要验证）
  async fileExists(remotePath) {
    GET /api/resources/{remotePath}
    Header: X-Auth: {token}
  }
}
```

**API 配置：**
- 服务地址：`https://fsx.camthink.ai`
- 公开访问：`https://resources.camthink.ai/wiki/img/...`
- 认证：用户名 + 密码（存储在环境变量中）

### 图片路径映射策略

采用**方案A：保持原有目录结构**

```
本地路径：/static/img/ne301/application-guide/image1.png
远程路径：/wiki/img/ne301/application-guide/image1.png
公开URL：https://resources.camthink.ai/wiki/img/ne301/application-guide/image1.png
```

**优势：**
- 与本地结构完全一致
- 即使文章移动，图片路径相对稳定
- 简单直接，易于理解

### Markdown 解析和链接替换

支持两种格式：

1. **标准 Markdown**
   ```markdown
   ![alt](/img/path/image.png)
   → ![alt](https://resources.camthink.ai/wiki/img/path/image.png)
   ```

2. **JSX 格式**
   ```jsx
   <img src="/img/path/image.png" style={{...}} />
   → <img src="https://resources.camthink.ai/wiki/img/path/image.png" style={{...}} />
   ```

**关键：** 保持原有格式，只替换 URL 部分

### CLI 命令设计

```bash
# 基本用法
yarn upload-images <file-or-directory>

# 示例
yarn upload-images docs/5-neoeyes-ne301-series/application-guide.md
yarn upload-images docs/5-neoeyes-ne301-series/

# 可选参数
yarn upload-images --dry-run <path>   # 预览模式
yarn upload-images --force <path>     # 强制重新上传
```

### 用户交互流程

```
1. 解析命令行参数
2. 扫描 Markdown 文件
3. 提取本地图片引用
4. 登录 File Browser
5. 逐个处理图片：
   - 检查缓存（是否已上传）
   - 检查远程同名文件
   - 如有冲突，询问用户：
     [S] 跳过
     [O] 覆盖
     [R] 重命名
     [A] 中止
   - 上传图片
   - 更新缓存
6. 替换 Markdown 中的链接
7. 生成上传报告
```

### 缓存和配置管理

**缓存文件：** `.upload-cache.json`
```json
{
  "images": {
    "/img/ne301/app/image1.png": {
      "localHash": "sha256:abc123",
      "remoteUrl": "https://resources.camthink.ai/wiki/img/ne301/app/image1.png",
      "uploadedAt": "2026-03-19T10:25:00Z"
    }
  }
}
```

**配置文件：** `.upload-config.json`
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
    "skipUploaded": true
  }
}
```

### 错误处理

**错误类型：**
- AUTH_FAILED: 登录失败
- NETWORK_ERROR: 网络错误
- FILE_NOT_FOUND: 本地文件不存在
- UPLOAD_FAILED: 上传失败
- PERMISSION_DENIED: 权限不足

**处理策略：**
- 网络错误：自动重试（最多3次）
- 文件不存在：跳过并记录
- 上传失败：记录并继续处理下一个
- 用户友好的错误消息

---

## 实施步骤

### Phase 1: API 验证（关键文件：scripts/test-api.js）

1. 创建测试脚本 `scripts/test-api.js`
2. 在 File Browser 创建测试文件夹 `/wiki/img/test/`
3. 验证 API 功能：
   - 登录获取 Token
   - 创建文件夹
   - 上传文件
   - 检查文件存在
   - 验证公开访问 URL
4. 记录 API 细节和注意事项

### Phase 2: 核心库实现

**关键文件：**

1. `lib/api-client.js` - File Browser API 客户端
   - 实现登录、上传、创建文件夹等方法
   - 错误处理和重试逻辑
   - Token 管理

2. `lib/markdown-parser.js` - Markdown 解析
   - 提取本地图片引用（支持 Markdown 和 JSX 格式）
   - 过滤 `/static/img/` 路径
   - 返回图片列表和位置信息

3. `lib/link-replacer.js` - 链接替换
   - 替换标准 Markdown 格式
   - 替换 JSX 格式（保留其他属性）
   - 保持原有格式不变

4. `lib/image-uploader.js` - 上传逻辑
   - 协调 API 客户端和缓存
   - 处理同名文件冲突
   - 并发上传控制

### Phase 3: CLI 工具实现

**关键文件：`scripts/upload-images.js`**

1. 命令行参数解析
2. 文件扫描逻辑
3. 用户交互（询问同名文件处理方式）
4. 缓存管理
5. 报告生成
6. 集成到 `package.json` scripts

### Phase 4: 测试和文档

1. 创建测试文章和图片
2. 端到端测试流程
3. 编写使用文档
4. 添加到项目 README

---

## 关键文件路径

| 文件 | 用途 | 优先级 |
|------|------|--------|
| `scripts/test-api.js` | API 验证脚本 | P0 |
| `lib/api-client.js` | File Browser API 封装 | P0 |
| `lib/markdown-parser.js` | Markdown 解析 | P0 |
| `lib/link-replacer.js` | 链接替换 | P0 |
| `lib/image-uploader.js` | 上传逻辑协调 | P0 |
| `scripts/upload-images.js` | 主 CLI 工具 | P0 |
| `.upload-config.json` | 配置文件 | P1 |
| `.upload-cache.json` | 上传缓存 | P1 |
| `docs/upload-guide.md` | 使用文档 | P2 |

---

## 验证计划

### 1. API 验证测试

```bash
# 运行 API 测试脚本
yarn test-api

# 验证内容：
# - 登录成功
# - 创建文件夹成功
# - 上传文件成功
# - 文件可通过公开 URL 访问
```

### 2. 功能测试

```bash
# 创建测试文章
# docs/test-upload.md
# 包含 3-5 张本地图片

# 预览模式
yarn upload-images --dry-run docs/test-upload.md

# 实际上传
yarn upload-images docs/test-upload.md

# 验证：
# - Markdown 中的链接已替换
# - 图片可通过 URL 访问
# - 缓存文件正确生成
# - 报告内容准确
```

### 3. 边界情况测试

- 网络中断恢复
- 同名文件冲突处理
- 部分上传失败
- 文件权限问题
- 无效的 Markdown 格式

### 4. 端到端验证

```bash
# 完整工作流测试
1. 编写新文章，嵌入本地图片
2. 运行 yarn upload-images
3. 检查链接替换结果
4. 运行 yarn build
5. 验证构建的网站图片正常显示
```

---

## 依赖和配置

### 新增 npm 依赖

```json
{
  "dependencies": {
    "axios": "^1.6.0",           // HTTP 请求
    "chalk": "^4.1.2",           // 终端彩色输出
    "commander": "^11.0.0",      // 命令行参数解析
    "glob": "^10.3.0",           // 文件匹配
    "inquirer": "^8.2.0",        // 交互式命令行
    "ora": "^5.4.0",             // 进度指示器
    "crypto-js": "^4.2.0"        // 文件 hash 计算
  }
}
```

### 环境变量

```bash
# .env (不提交到 git)
FILE_BROWSER_PASSWORD=N0ep+$=WMkz%4vxV
```

### Git 忽略

```gitignore
# .gitignore 添加
.upload-cache.json
.upload-config.local.json
test/fixtures/uploaded/
```

---

## 风险和注意事项

1. **API 兼容性**
   - File Browser API 文档不完善
   - 需要通过测试验证 API 行为
   - 可能需要根据实际情况调整

2. **权限限制**
   - 只有创建权限，没有删除权限
   - 上传需谨慎，避免产生垃圾文件
   - 同名文件冲突需要明确处理策略

3. **路径一致性**
   - 保持本地和远程路径结构一致
   - 未来文档结构调整需要重新规划

4. **性能考虑**
   - 大量图片上传的并发控制
   - 网络不稳定情况的重试机制
   - 缓存机制避免重复上传

---

## 成功标准

- ✅ 能够成功登录 File Browser
- ✅ 能够创建远程文件夹
- ✅ 能够上传图片并获取公开访问 URL
- ✅ 能够正确识别和解析 Markdown 中的图片引用
- ✅ 能够保持原有格式替换图片链接
- ✅ 能够智能处理同名文件冲突
- ✅ 生成清晰的上传报告
- ✅ 支持预览模式
- ✅ 错误情况有友好的提示
- ✅ 缓存机制正常工作
- ✅ 集成到 package.json scripts

---

## 后续优化（可选）

1. **图片优化**
   - 自动压缩图片
   - 生成缩略图
   - WebP 格式转换

2. **增强功能**
   - 批量操作
   - 增量上传（基于 Git diff）
   - 上传进度可视化
   - 断点续传

3. **CI/CD 集成**
   - GitHub Actions 自动上传
   - 构建前自动检查图片链接

4. **监控和维护**
   - 图片访问统计
   - 孤儿图片清理
   - 链接有效性检查
