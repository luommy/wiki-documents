# Wiki 图片自动上传系统实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 Node.js CLI 工具,实现 Wiki 图片自动上传到 File Browser 并更新 Markdown 中的链接

**Architecture:** 使用 Node.js 创建独立 CLI 工具(位于 `.image-upload/` 目录),通过 File Browser API 上传图片,解析 Markdown 文件提取图片引用,替换为远程 URL。采用模块化设计:API 客户端、Markdown 解析器、链接替换器、上传协调器。

**Tech Stack:** Node.js, Axios, Chalk, Commander, Glob, Inquirer, Ora, Crypto-js

---

## 文件结构

```
wiki-documents/
├── .image-upload/                # 图片上传工具独立目录(新建)
│   ├── package.json              # 独立的依赖配置(新建)
│   ├── scripts/
│   │   ├── test-api.js           # API 验证脚本(新建)
│   │   └── upload-images.js      # 主 CLI 工具(新建)
│   ├── lib/
│   │   ├── api-client.js         # File Browser API 封装(新建)
│   │   ├── markdown-parser.js    # Markdown 文件解析(新建)
│   │   ├── image-uploader.js     # 图片上传逻辑(新建)
│   │   └── link-replacer.js      # 链接替换逻辑(新建)
│   ├── test/
│   │   └── fixtures/
│   │       ├── sample.png        # 测试图片(新建)
│   │       └── test-article.md   # 测试文章(新建)
│   ├── .upload-config.json       # 配置文件(新建)
│   └── .upload-cache.json        # 上传缓存(新建,git忽略)
└── .gitignore                    # 修改:添加 .image-upload/ 忽略规则
```

**重要说明:**
- 所有开发产出物都在 `.image-upload/` 目录内
- CLI 工具通过相对路径访问父项目的 `static/` 目录
- 不修改主项目的 `package.json`

---

## Chunk 1: 项目设置和 API 验证

### Task 1: 创建 .image-upload 目录和独立 package.json

**Files:**
- Create: `.image-upload/package.json`

- [ ] **Step 1: 创建 .image-upload 目录**

```bash
mkdir -p .image-upload
```

- [ ] **Step 2: 创建独立的 package.json**

创建 `.image-upload/package.json`:

```json
{
  "name": "wiki-image-upload",
  "version": "1.0.0",
  "description": "Wiki 图片自动上传工具",
  "private": true,
  "scripts": {
    "test-api": "node scripts/test-api.js",
    "upload-images": "node scripts/upload-images.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "chalk": "^4.1.2",
    "commander": "^11.0.0",
    "glob": "^10.3.0",
    "inquirer": "^8.2.0",
    "ora": "^5.4.0",
    "crypto-js": "^4.2.0",
    "dotenv": "^16.0.0"
  }
}
```

- [ ] **Step 3: 安装依赖**

```bash
cd .image-upload && yarn install
```

Expected: 在 `.image-upload/node_modules/` 中安装所有依赖

- [ ] **Step 4: 提交目录结构**

```bash
cd .. # 回到项目根目录
git add .image-upload/package.json .image-upload/yarn.lock
git commit -m "feat: 创建独立的图片上传工具目录和配置"
```

---

### Task 2: 创建配置文件

**Files:**
- Create: `.image-upload/.upload-config.json`
- Modify: `.gitignore`

- [ ] **Step 1: 创建配置文件**

创建 `.image-upload/.upload-config.json`:

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

- [ ] **Step 2: 更新 .gitignore**

在项目根目录的 `.gitignore` 文件末尾添加:

```gitignore
# 图片上传工具
.image-upload/.upload-cache.json
.image-upload/.upload-config.local.json
.image-upload/.env
.image-upload/test/fixtures/uploaded/
```

- [ ] **Step 3: 创建环境变量文件(本地使用,不提交)**

创建 `.image-upload/.env` (不提交到 git):

```bash
echo "FILE_BROWSER_PASSWORD=N0ep+\$=WMkz%4vxV" > .image-upload/.env
```

- [ ] **Step 4: 提交配置文件**

```bash
git add .image-upload/.upload-config.json .gitignore
git commit -m "feat: 添加图片上传工具配置文件"
```

---

### Task 3: 创建测试资源

**Files:**
- Create: `.image-upload/test/fixtures/sample.png`
- Create: `.image-upload/test/fixtures/test-article.md`

- [ ] **Step 1: 创建测试目录**

```bash
mkdir -p .image-upload/test/fixtures
```

- [ ] **Step 2: 创建测试图片**

使用任意 PNG 图片或从现有图片复制:

```bash
cp static/img/ne301/application-guide/urban-waste-bin-overflow-monitoring/image1.png .image-upload/test/fixtures/sample.png
```

如果源文件不存在,创建一个占位图片:

```bash
# 创建一个简单的 1x1 像素 PNG
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > .image-upload/test/fixtures/sample.png
```

- [ ] **Step 3: 创建测试文章**

创建 `.image-upload/test/fixtures/test-article.md`:

```markdown
---
sidebar_label: Test Upload
description: 测试图片上传功能
---

# 测试文章

这是一张测试图片:

![测试图片](/img/test/sample.png)

这是 JSX 格式的图片:

<img src="/img/test/sample.png" style={{display: "block", margin: "20px auto", maxWidth: "80%"}} />

这是另一张图片:

![另一张图片](/img/test/another.png)
```

- [ ] **Step 4: 提交测试资源**

```bash
git add .image-upload/test/
git commit -m "test: 添加图片上传测试资源"
```

---

### Task 4: 创建 API 客户端基础结构

**Files:**
- Create: `.image-upload/lib/api-client.js`

- [ ] **Step 1: 创建 lib 目录和 API 客户端框架**

创建 `.image-upload/lib/api-client.js`:

```javascript
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * File Browser API 客户端
 */
class FileBrowserAPI {
  /**
   * @param {Object} config - 配置对象
   * @param {string} config.baseUrl - File Browser 服务地址
   * @param {string} config.username - 用户名
   * @param {string} config.password - 密码
   */
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.username = config.username;
    this.password = config.password;
    this.token = null;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * 登录获取 JWT Token
   * @returns {Promise<string>} JWT Token
   */
  async login() {
    try {
      const response = await this.client.post('/api/login', {
        username: this.username,
        password: this.password,
      });

      this.token = response.data;
      return this.token;
    } catch (error) {
      throw new Error(`登录失败: ${error.message}`);
    }
  }

  /**
   * 获取认证请求头
   * @returns {Object} 请求头
   */
  getAuthHeaders() {
    if (!this.token) {
      throw new Error('未登录,请先调用 login() 方法');
    }
    return {
      'X-Auth': this.token,
    };
  }
}

module.exports = FileBrowserAPI;
```

- [ ] **Step 2: 提交 API 客户端框架**

```bash
git add .image-upload/lib/api-client.js
git commit -m "feat: 添加 File Browser API 客户端基础结构"
```

---

### Task 5: 实现 API 测试脚本

**Files:**
- Create: `.image-upload/scripts/test-api.js`

- [ ] **Step 1: 创建 scripts 目录和 API 测试脚本**

创建 `.image-upload/scripts/test-api.js`:

```javascript
#!/usr/bin/env node

const FileBrowserAPI = require('../lib/api-client');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 配置
const config = {
  baseUrl: process.env.FILE_BROWSER_URL || 'https://fsx.camthink.ai',
  username: process.env.FILE_BROWSER_USERNAME || 'harry',
  password: process.env.FILE_BROWSER_PASSWORD,
};

if (!config.password) {
  console.error('❌ 错误: 未设置 FILE_BROWSER_PASSWORD 环境变量');
  console.error('请创建 .image-upload/.env 文件并设置: FILE_BROWSER_PASSWORD=your_password');
  process.exit(1);
}

const api = new FileBrowserAPI(config);

async function testAPI() {
  console.log('=== File Browser API 验证测试 ===\n');

  try {
    // 测试 1: 登录
    console.log('1. 测试登录...');
    const token = await api.login();
    console.log(`✓ 登录成功,Token 长度: ${token.length}\n`);

    // 测试 2: 创建测试文件夹
    console.log('2. 测试创建文件夹...');
    const testFolder = '/wiki/img/test-api';
    try {
      await api.createFolder(testFolder);
      console.log(`✓ 文件夹创建成功: ${testFolder}\n`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`✓ 文件夹已存在: ${testFolder}\n`);
      } else {
        throw error;
      }
    }

    // 测试 3: 上传文件
    console.log('3. 测试上传文件...');
    const testImagePath = path.join(__dirname, '../test/fixtures/sample.png');
    const remotePath = `${testFolder}/sample.png`;

    const imageBuffer = await fs.readFile(testImagePath);
    await api.uploadFile(remotePath, imageBuffer);
    console.log(`✓ 文件上传成功: ${remotePath}\n`);

    // 测试 4: 检查文件存在
    console.log('4. 测试检查文件...');
    const exists = await api.fileExists(remotePath);
    console.log(`✓ 文件存在检查: ${exists}\n`);

    // 测试 5: 验证公开访问 URL
    console.log('5. 验证公开访问 URL...');
    const publicUrl = `https://resources.camthink.ai${remotePath}`;
    console.log(`公开 URL: ${publicUrl}`);
    console.log('请在浏览器中验证该 URL 是否可访问\n');

    console.log('=== 所有测试通过 ===');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI();
```

- [ ] **Step 2: 运行测试验证**

```bash
cd .image-upload && yarn test-api
```

Expected: 输出 "=== 所有测试通过 ==="

- [ ] **Step 3: 提交测试脚本**

```bash
cd .. # 回到项目根目录
git add .image-upload/scripts/test-api.js
git commit -m "feat: 添加 File Browser API 测试脚本"
```

---

### Task 6: 实现 API 客户端的完整功能

**Files:**
- Modify: `.image-upload/lib/api-client.js:1-70`

- [ ] **Step 1: 添加上传文件方法**

在 `.image-upload/lib/api-client.js` 的 `getAuthHeaders()` 方法后添加:

```javascript
  /**
   * 上传文件
   * @param {string} remotePath - 远程路径(如 /wiki/img/test/image.png)
   * @param {Buffer} fileBuffer - 文件内容
   * @param {boolean} override - 是否覆盖已存在的文件
   * @returns {Promise<void>}
   */
  async uploadFile(remotePath, fileBuffer, override = false) {
    try {
      const url = `/api/resources${remotePath}${override ? '?override=true' : ''}`;

      await this.client.put(url, fileBuffer, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/octet-stream',
        },
      });
    } catch (error) {
      throw new Error(`上传文件失败 (${remotePath}): ${error.message}`);
    }
  }
```

- [ ] **Step 2: 添加创建文件夹方法**

继续添加:

```javascript
  /**
   * 创建文件夹
   * @param {string} folderPath - 文件夹路径
   * @returns {Promise<void>}
   */
  async createFolder(folderPath) {
    try {
      await this.client.post(
        `/api/resources${folderPath}`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );
    } catch (error) {
      if (error.response?.status === 409) {
        // 文件夹已存在,不算错误
        return;
      }
      throw new Error(`创建文件夹失败 (${folderPath}): ${error.message}`);
    }
  }
```

- [ ] **Step 3: 添加检查文件存在方法**

继续添加:

```javascript
  /**
   * 检查文件或文件夹是否存在
   * @param {string} remotePath - 远程路径
   * @returns {Promise<boolean>}
   */
  async fileExists(remotePath) {
    try {
      await this.client.head(`/api/resources${remotePath}`, {
        headers: this.getAuthHeaders(),
      });
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw new Error(`检查文件存在失败 (${remotePath}): ${error.message}`);
    }
  }
```

- [ ] **Step 4: 添加列出文件夹内容方法**

继续添加:

```javascript
  /**
   * 列出文件夹内容
   * @param {string} folderPath - 文件夹路径
   * @returns {Promise<Array>} 文件列表
   */
  async listFolder(folderPath) {
    try {
      const response = await this.client.get(`/api/resources${folderPath}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`列出文件夹内容失败 (${folderPath}): ${error.message}`);
    }
  }
```

- [ ] **Step 5: 提交 API 客户端完整实现**

```bash
git add .image-upload/lib/api-client.js
git commit -m "feat: 完成 File Browser API 客户端所有方法"
```

---

### Task 7: 运行 API 验证测试

**Files:**
- None

- [ ] **Step 1: 确保 .env 文件存在**

检查 `.image-upload/.env` 文件:

```bash
cat .image-upload/.env
```

Expected: 显示 `FILE_BROWSER_PASSWORD=...`

- [ ] **Step 2: 运行测试脚本**

```bash
cd .image-upload && yarn test-api
```

Expected: 所有测试通过,输出类似:

```
=== File Browser API 验证测试 ===

1. 测试登录...
✓ 登录成功,Token 长度: XXX

2. 测试创建文件夹...
✓ 文件夹创建成功: /wiki/img/test-api

3. 测试上传文件...
✓ 文件上传成功: /wiki/img/test-api/sample.png

4. 测试检查文件...
✓ 文件存在检查: true

5. 验证公开访问 URL...
公开 URL: https://resources.camthink.ai/wiki/img/test-api/sample.png
请在浏览器中验证该 URL 是否可访问

=== 所有测试通过 ===
```

- [ ] **Step 3: 手动验证公开访问 URL**

在浏览器中打开:`https://resources.camthink.ai/wiki/img/test-api/sample.png`

Expected: 图片正常显示

- [ ] **Step 4: 如果测试失败**

检查以下内容:
1. File Browser 服务是否在线
2. 用户名密码是否正确
3. 网络连接是否正常
4. API 端点是否正确

---

## Chunk 2: 核心库实现

### Task 8: 实现 Markdown 解析器

**Files:**
- Create: `.image-upload/lib/markdown-parser.js`

- [ ] **Step 1: 创建 Markdown 解析器**

创建 `.image-upload/lib/markdown-parser.js`:

```javascript
/**
 * Markdown 文件解析器
 * 用于提取 Markdown 文件中的图片引用
 */
class MarkdownParser {
  /**
   * 从 Markdown 内容中提取所有图片引用
   * @param {string} content - Markdown 内容
   * @returns {Array<{path: string, alt: string, format: string, fullMatch: string}>}
   */
  extractImages(content) {
    const images = [];

    // 匹配标准 Markdown 格式: ![alt](path)
    const mdRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = mdRegex.exec(content)) !== null) {
      const [fullMatch, alt, path] = match;
      if (path.startsWith('/img/')) {
        images.push({
          path,
          alt: alt || '',
          format: 'markdown',
          fullMatch,
        });
      }
    }

    // 匹配 JSX 格式: <img src="..." /> 或 <img src={...} />
    const jsxRegex = /<img[^>]+src=\{?["']([^"']+)["']\}?[^>]*\/?>/g;

    while ((match = jsxRegex.exec(content)) !== null) {
      const [fullMatch, src] = match;
      if (src.startsWith('/img/')) {
        images.push({
          path: src,
          alt: '',
          format: 'jsx',
          fullMatch,
        });
      }
    }

    // 去重(同一图片可能被引用多次)
    const uniqueImages = [];
    const seen = new Set();

    for (const img of images) {
      if (!seen.has(img.path)) {
        seen.add(img.path);
        uniqueImages.push(img);
      }
    }

    return uniqueImages;
  }

  /**
   * 从文件路径读取并提取图片
   * @param {string} filePath - Markdown 文件路径
   * @returns {Promise<{content: string, images: Array}>}
   */
  async parseFile(filePath) {
    const fs = require('fs').promises;
    const content = await fs.readFile(filePath, 'utf-8');
    const images = this.extractImages(content);
    return { content, images };
  }
}

module.exports = MarkdownParser;
```

- [ ] **Step 2: 提交 Markdown 解析器**

```bash
git add .image-upload/lib/markdown-parser.js
git commit -m "feat: 添加 Markdown 图片引用解析器"
```

---

### Task 9: 实现链接替换器

**Files:**
- Create: `.image-upload/lib/link-replacer.js`

- [ ] **Step 1: 创建链接替换器**

创建 `.image-upload/lib/link-replacer.js`:

```javascript
/**
 * Markdown 链接替换器
 * 用于将本地图片链接替换为远程 URL
 */
class LinkReplacer {
  /**
   * 替换 Markdown 中的图片链接
   * @param {string} content - Markdown 内容
   * @param {Object} mapping - 路径映射 {"/img/old.png": "https://...new.png"}
   * @returns {string} 替换后的内容
   */
  replaceLinks(content, mapping) {
    let result = content;

    for (const [oldPath, newUrl] of Object.entries(mapping)) {
      // 替换标准 Markdown 格式
      const mdRegex = new RegExp(
        `!\\[([^\\]]*)\\]\\(${this.escapeRegex(oldPath)}\\)`,
        'g'
      );
      result = result.replace(mdRegex, `![$1](${newUrl})`);

      // 替换 JSX 格式(保持其他属性不变)
      const jsxRegex = new RegExp(
        `(<img[^>]+src=\\{?["'])${this.escapeRegex(oldPath)}(["'][^>]*\\/?>)`,
        'g'
      );
      result = result.replace(jsxRegex, `$1${newUrl}$2`);
    }

    return result;
  }

  /**
   * 转义正则表达式特殊字符
   * @param {string} string - 要转义的字符串
   * @returns {string} 转义后的字符串
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = LinkReplacer;
```

- [ ] **Step 2: 提交链接替换器**

```bash
git add .image-upload/lib/link-replacer.js
git commit -m "feat: 添加 Markdown 图片链接替换器"
```

---

### Task 10: 实现图片上传协调器

**Files:**
- Create: `.image-upload/lib/image-uploader.js`

- [ ] **Step 1: 创建图片上传协调器**

创建 `.image-upload/lib/image-uploader.js`:

```javascript
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const FileBrowserAPI = require('./api-client');

/**
 * 图片上传协调器
 * 负责协调 API 客户端、缓存和用户交互
 */
class ImageUploader {
  /**
   * @param {Object} config - 配置对象
   * @param {FileBrowserAPI} config.api - File Browser API 客户端
   * @param {Object} config.uploadConfig - 上传配置
   */
  constructor(config) {
    this.api = config.api;
    this.uploadConfig = config.uploadConfig;
    this.cache = { images: {} };
    this.stats = {
      uploaded: [],
      skipped: [],
      failed: [],
    };
  }

  /**
   * 加载上传缓存
   * @param {string} cachePath - 缓存文件路径
   */
  async loadCache(cachePath) {
    try {
      const cacheData = await fs.readFile(cachePath, 'utf-8');
      this.cache = JSON.parse(cacheData);
    } catch (error) {
      // 缓存文件不存在,使用空缓存
      this.cache = { images: {} };
    }
  }

  /**
   * 保存上传缓存
   * @param {string} cachePath - 缓存文件路径
   */
  async saveCache(cachePath) {
    await fs.writeFile(cachePath, JSON.stringify(this.cache, null, 2), 'utf-8');
  }

  /**
   * 计算文件 SHA256 hash
   * @param {string} filePath - 文件路径
   * @returns {Promise<string>} hash 字符串
   */
  async calculateHash(filePath) {
    const content = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * 检查图片是否已上传
   * @param {string} localPath - 本地路径
   * @param {string} hash - 文件 hash
   * @returns {boolean}
   */
  isAlreadyUploaded(localPath, hash) {
    const cached = this.cache.images[localPath];
    return cached && cached.localHash === hash;
  }

  /**
   * 上传单个图片
   * @param {string} localPath - 本地路径(如 /img/ne301/app/image.png)
   * @param {string} staticDir - static 目录绝对路径
   * @param {boolean} force - 是否强制重新上传
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async uploadImage(localPath, staticDir, force = false) {
    try {
      // 构建本地文件完整路径
      const absoluteLocalPath = path.join(staticDir, localPath);

      // 检查文件是否存在
      try {
        await fs.access(absoluteLocalPath);
      } catch {
        return {
          success: false,
          error: 'FILE_NOT_FOUND',
          message: `文件不存在: ${absoluteLocalPath}`,
        };
      }

      // 计算文件 hash
      const hash = await this.calculateHash(absoluteLocalPath);

      // 检查缓存
      if (!force && this.isAlreadyUploaded(localPath, hash)) {
        this.stats.skipped.push({
          path: localPath,
          reason: 'already_uploaded',
          url: this.cache.images[localPath].remoteUrl,
        });
        return {
          success: true,
          url: this.cache.images[localPath].remoteUrl,
          cached: true,
        };
      }

      // 构建远程路径
      const remotePath = localPath.replace('/img/', '/wiki/img/');
      const publicUrl = `https://resources.camthink.ai${remotePath}`;

      // 读取文件内容
      const fileBuffer = await fs.readFile(absoluteLocalPath);

      // 检查远程文件是否存在
      const exists = await this.api.fileExists(remotePath);

      if (exists && !force) {
        return {
          success: false,
          error: 'FILE_EXISTS',
          message: `远程文件已存在: ${remotePath}`,
          needsConfirmation: true,
          remotePath,
        };
      }

      // 确保远程文件夹存在
      const remoteDir = path.dirname(remotePath);
      await this.api.createFolder(remoteDir);

      // 上传文件
      await this.api.uploadFile(remotePath, fileBuffer, force);

      // 更新缓存
      this.cache.images[localPath] = {
        localHash: hash,
        remoteUrl: publicUrl,
        remotePath,
        uploadedAt: new Date().toISOString(),
      };

      this.stats.uploaded.push({
        path: localPath,
        url: publicUrl,
      });

      return {
        success: true,
        url: publicUrl,
      };
    } catch (error) {
      this.stats.failed.push({
        path: localPath,
        error: error.message,
      });

      return {
        success: false,
        error: 'UPLOAD_FAILED',
        message: error.message,
      };
    }
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    return this.stats;
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      uploaded: [],
      skipped: [],
      failed: [],
    };
  }
}

module.exports = ImageUploader;
```

- [ ] **Step 2: 提交图片上传协调器**

```bash
git add .image-upload/lib/image-uploader.js
git commit -m "feat: 添加图片上传协调器"
```

---

## Chunk 2 完成检查点

✅ **已完成的任务:**
- Task 8: 实现 Markdown 解析器
- Task 9: 实现链接替换器
- Task 10: 实现图片上传协调器

**关键成果:**
- 核心库全部实现完成
- 模块化设计,职责清晰
- 准备好集成到 CLI 工具

**下一步:** 继续 Chunk 3 - CLI 工具实现

---

## Chunk 3: CLI 工具实现

### Task 11: 创建 CLI 工具主框架

**Files:**
- Create: `.image-upload/scripts/upload-images.js`

- [ ] **Step 1: 创建 CLI 工具框架**

创建 `.image-upload/scripts/upload-images.js`:

```javascript
#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const glob = require('glob');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const FileBrowserAPI = require('../lib/api-client');
const MarkdownParser = require('../lib/markdown-parser');
const LinkReplacer = require('../lib/link-replacer');
const ImageUploader = require('../lib/image-uploader');

// 版本和帮助信息
program
  .name('upload-images')
  .description('上传 Wiki 图片到 File Browser 并更新 Markdown 链接')
  .version('1.0.0')
  .argument('<path>', 'Markdown 文件或目录路径')
  .option('-d, --dry-run', '预览模式,不实际上传')
  .option('-f, --force', '强制重新上传所有图片')
  .option('--config <path>', '配置文件路径', '.upload-config.json')
  .option('--cache <path>', '缓存文件路径', '.upload-cache.json');

program.parse();

const options = program.opts();
const targetPath = program.args[0];

// 主函数
async function main() {
  console.log(chalk.bold.blue('\n=== Wiki 图片上传工具 ===\n'));

  try {
    // 1. 加载配置
    const config = await loadConfig(options.config);
    console.log(chalk.gray(`配置文件: ${options.config}`));

    // 2. 扫描 Markdown 文件
    const markdownFiles = await scanMarkdownFiles(targetPath);
    console.log(chalk.green(`✓ 找到 ${markdownFiles.length} 个 Markdown 文件\n`));

    if (markdownFiles.length === 0) {
      console.log(chalk.yellow('未找到 Markdown 文件,退出'));
      return;
    }

    // 3. 提取图片引用
    const parser = new MarkdownParser();
    const allImages = new Map();

    for (const file of markdownFiles) {
      const { images } = await parser.parseFile(file);
      for (const img of images) {
        if (!allImages.has(img.path)) {
          allImages.set(img.path, { ...img, files: [] });
        }
        allImages.get(img.path).files.push(file);
      }
    }

    console.log(chalk.green(`✓ 找到 ${allImages.size} 张本地图片\n`));

    if (allImages.size === 0) {
      console.log(chalk.yellow('未找到本地图片引用,退出'));
      return;
    }

    // 4. 预览模式
    if (options.dryRun) {
      console.log(chalk.cyan('预览模式 - 以下图片将被上传:\n'));
      for (const [imagePath, info] of allImages) {
        console.log(`  ${imagePath}`);
        console.log(chalk.gray(`    引用文件: ${info.files.join(', ')}`));
      }
      return;
    }

    // 5. 登录 File Browser
    const spinner = ora('登录 File Browser...').start();
    const api = new FileBrowserAPI(config.fileBrowser);
    await api.login();
    spinner.succeed('登录成功');

    // 6. 初始化上传器
    const uploader = new ImageUploader({
      api,
      uploadConfig: config.upload,
    });

    await uploader.loadCache(options.cache);

    // 7. 逐个上传图片
    console.log(chalk.cyan('\n开始上传图片...\n'));

    const uploadResults = new Map();

    for (const [imagePath, info] of allImages) {
      const result = await processImageUpload(
        uploader,
        imagePath,
        config.upload.force || options.force
      );
      uploadResults.set(imagePath, result);
    }

    // 8. 更新 Markdown 文件
    console.log(chalk.cyan('\n更新 Markdown 文件中的链接...\n'));

    const replacer = new LinkReplacer();
    const mapping = {};

    for (const [imagePath, result] of uploadResults) {
      if (result.success && result.url) {
        mapping[imagePath] = result.url;
      }
    }

    for (const file of markdownFiles) {
      const { content } = await parser.parseFile(file);
      const newContent = replacer.replaceLinks(content, mapping);

      if (newContent !== content) {
        await fs.writeFile(file, newContent, 'utf-8');
        console.log(chalk.green(`✓ 更新: ${file}`));
      }
    }

    // 9. 保存缓存
    await uploader.saveCache(options.cache);
    console.log(chalk.gray(`\n缓存已保存: ${options.cache}`));

    // 10. 生成报告
    generateReport(uploader.getStats(), uploadResults);

  } catch (error) {
    console.error(chalk.red('\n❌ 错误:'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 辅助函数将在后续步骤中添加...

main();
```

- [ ] **Step 2: 提交 CLI 工具框架**

```bash
git add .image-upload/scripts/upload-images.js
git commit -m "feat: 添加图片上传 CLI 工具主框架"
```

---

### Task 12: 实现 CLI 辅助函数

**Files:**
- Modify: `.image-upload/scripts/upload-images.js:110-120`

- [ ] **Step 1: 添加配置加载函数**

在 `main()` 函数之前添加:

```javascript
/**
 * 加载配置文件
 * @param {string} configPath - 配置文件路径
 * @returns {Promise<Object>}
 */
async function loadConfig(configPath) {
  try {
    // 配置文件路径相对于 .image-upload 目录
    const fullPath = path.join(__dirname, '..', configPath);
    const configData = await fs.readFile(fullPath, 'utf-8');
    const config = JSON.parse(configData);

    // 替换环境变量
    if (config.fileBrowser.password?.startsWith('${') && config.fileBrowser.password.endsWith('}')) {
      const envVar = config.fileBrowser.password.slice(2, -1);
      config.fileBrowser.password = process.env[envVar];
    }

    // 验证必需配置
    if (!config.fileBrowser.password) {
      throw new Error('未设置 FILE_BROWSER_PASSWORD 环境变量');
    }

    return config;
  } catch (error) {
    throw new Error(`加载配置文件失败: ${error.message}`);
  }
}
```

- [ ] **Step 2: 添加文件扫描函数**

继续添加:

```javascript
/**
 * 扫描 Markdown 文件
 * @param {string} targetPath - 文件或目录路径
 * @returns {Promise<Array<string>>}
 */
async function scanMarkdownFiles(targetPath) {
  const absolutePath = path.resolve(targetPath);
  const stat = await fs.stat(absolutePath);

  if (stat.isFile()) {
    // 单个文件
    if (absolutePath.endsWith('.md') || absolutePath.endsWith('.mdx')) {
      return [absolutePath];
    }
    throw new Error('目标文件不是 Markdown 文件');
  } else if (stat.isDirectory()) {
    // 目录
    const pattern = path.join(absolutePath, '**/*.{md,mdx}');
    const files = glob.sync(pattern);
    return files;
  } else {
    throw new Error('目标路径既不是文件也不是目录');
  }
}
```

- [ ] **Step 3: 添加图片上传处理函数**

继续添加:

```javascript
/**
 * 处理单个图片上传
 * @param {ImageUploader} uploader - 上传器实例
 * @param {string} imagePath - 图片路径
 * @param {boolean} force - 是否强制重新上传
 * @returns {Promise<Object>}
 */
async function processImageUpload(uploader, imagePath, force = false) {
  // static 目录在父项目中,使用相对路径
  const staticDir = path.join(__dirname, '../../static');

  console.log(chalk.cyan(`处理: ${imagePath}`));

  const result = await uploader.uploadImage(imagePath, staticDir, force);

  if (result.success) {
    if (result.cached) {
      console.log(chalk.gray(`  ✓ 已缓存: ${result.url}`));
    } else {
      console.log(chalk.green(`  ✓ 上传成功: ${result.url}`));
    }
  } else if (result.error === 'FILE_EXISTS' && result.needsConfirmation) {
    // 文件已存在,询问用户
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `远程文件已存在: ${result.remotePath}`,
        choices: [
          { name: '跳过 (S)', value: 'skip' },
          { name: '覆盖 (O)', value: 'overwrite' },
          { name: '中止 (A)', value: 'abort' },
        ],
        default: 'skip',
      },
    ]);

    if (answer.action === 'skip') {
      console.log(chalk.yellow('  跳过'));
      return { success: false, error: 'USER_SKIPPED' };
    } else if (answer.action === 'abort') {
      console.log(chalk.red('用户中止'));
      process.exit(0);
    } else {
      // 覆盖
      console.log(chalk.yellow('  强制覆盖...'));
      return await processImageUpload(uploader, imagePath, true);
    }
  } else {
    console.log(chalk.red(`  ✗ 失败: ${result.message || result.error}`));
  }

  return result;
}
```

- [ ] **Step 4: 添加报告生成函数**

继续添加:

```javascript
/**
 * 生成上传报告
 * @param {Object} stats - 统计信息
 * @param {Map} results - 上传结果
 */
function generateReport(stats, results) {
  console.log(chalk.bold.blue('\n========== 上传报告 ==========\n'));

  console.log(`处理的文件: ${results.size} 张图片`);
  console.log(chalk.green(`成功上传: ${stats.uploaded.length} 张`));
  console.log(chalk.yellow(`跳过: ${stats.skipped.length} 张`));
  console.log(chalk.red(`失败: ${stats.failed.length} 张`));

  if (stats.uploaded.length > 0) {
    console.log(chalk.green('\n上传的图片:'));
    for (const item of stats.uploaded) {
      console.log(`  ✓ ${item.path}`);
      console.log(chalk.gray(`    → ${item.url}`));
    }
  }

  if (stats.skipped.length > 0) {
    console.log(chalk.yellow('\n跳过的图片:'));
    for (const item of stats.skipped) {
      console.log(`  - ${item.path} (${item.reason})`);
    }
  }

  if (stats.failed.length > 0) {
    console.log(chalk.red('\n失败的图片:'));
    for (const item of stats.failed) {
      console.log(`  ✗ ${item.path}`);
      console.log(chalk.gray(`    错误: ${item.error}`));
    }
  }

  console.log(chalk.bold.blue('\n==============================\n'));
}
```

- [ ] **Step 5: 提交 CLI 辅助函数**

```bash
git add .image-upload/scripts/upload-images.js
git commit -m "feat: 完成 CLI 工具所有辅助函数"
```

---

### Task 13: 创建便捷执行脚本

**Files:**
- Create: `.image-upload/run.sh`

- [ ] **Step 1: 创建便捷执行脚本**

创建 `.image-upload/run.sh`:

```bash
#!/bin/bash
# 便捷执行脚本 - 从项目根目录运行

cd "$(dirname "$0")"
node scripts/upload-images.js "$@"
```

- [ ] **Step 2: 设置执行权限**

```bash
chmod +x .image-upload/run.sh
```

- [ ] **Step 3: 提交执行脚本**

```bash
git add .image-upload/run.sh
git commit -m "feat: 添加便捷执行脚本"
```

---

## Chunk 3 完成检查点

✅ **已完成的任务:**
- Task 11: 创建 CLI 工具主框架
- Task 12: 实现 CLI 辅助函数
- Task 13: 创建便捷执行脚本

**关键成果:**
- CLI 工具完整实现
- 支持预览模式、强制上传、同名文件询问
- 可通过便捷脚本执行

**下一步:** 继续 Chunk 4 - 测试和验证

---

## Chunk 4: 测试和验证

### Task 14: 功能测试

**Files:**
- None

- [ ] **Step 1: 创建测试文章**

创建一个简单的测试文章:

```bash
cat > docs/test-upload-article.md << 'EOF'
---
sidebar_label: Test Upload Article
description: 测试图片上传功能
---

# 测试上传文章

这是一张测试图片:

![测试图片](/img/ne301/application-guide/urban-waste-bin-overflow-monitoring/image1.png)

这是 JSX 格式:

<img src="/img/ne301/application-guide/urban-waste-bin-overflow-monitoring/image2.png" style={{display: "block", margin: "20px auto", maxWidth: "80%"}} />
EOF
```

- [ ] **Step 2: 运行预览模式测试**

```bash
cd .image-upload && yarn upload-images --dry-run ../docs/test-upload-article.md
```

Expected: 显示将要上传的图片列表,不实际上传

- [ ] **Step 3: 运行实际上传**

```bash
yarn upload-images ../docs/test-upload-article.md
```

Expected:
- 登录成功
- 上传图片成功
- 更新 Markdown 文件中的链接
- 生成上传报告

- [ ] **Step 4: 验证链接替换**

```bash
cat ../docs/test-upload-article.md
```

Expected: 图片链接已从 `/img/...` 替换为 `https://resources.camthink.ai/wiki/img/...`

- [ ] **Step 5: 验证图片可访问**

在浏览器中打开替换后的 URL,确认图片正常显示

- [ ] **Step 6: 清理测试文件**

```bash
rm ../docs/test-upload-article.md
```

---

### Task 15: 边界情况测试

**Files:**
- None

- [ ] **Step 1: 测试不存在的文件路径**

```bash
yarn upload-images ../docs/nonexistent.md
```

Expected: 提示文件不存在错误

- [ ] **Step 2: 测试没有图片的文章**

```bash
echo "# No Images" > ../docs/no-images.md
yarn upload-images ../docs/no-images.md
rm ../docs/no-images.md
```

Expected: 提示未找到本地图片,正常退出

- [ ] **Step 3: 测试同名文件冲突**

创建两个文章引用同一图片:

```bash
echo '![Test](/img/ne301/test.png)' > ../docs/test1.md
echo '![Test](/img/ne301/test.png)' > ../docs/test2.md
yarn upload-images ../docs/
rm ../docs/test1.md ../docs/test2.md
```

Expected: 正确处理重复引用,只上传一次

- [ ] **Step 4: 测试缓存功能**

```bash
# 创建测试文章
cat > ../docs/test-cache.md << 'EOF'
![Test](/img/ne301/application-guide/urban-waste-bin-overflow-monitoring/image1.png)
EOF

# 第一次上传
yarn upload-images ../docs/test-cache.md

# 第二次上传(应该使用缓存)
yarn upload-images ../docs/test-cache.md

# 清理
rm ../docs/test-cache.md
```

Expected: 第二次运行时显示"已缓存",跳过上传

---

### Task 16: 端到端验证

**Files:**
- None

- [ ] **Step 1: 选择一个真实的文章**

选择一个包含图片的现有文章进行测试

- [ ] **Step 2: 备份原文件**

```bash
cp docs/5-neoeyes-ne301-series/application-guide/urban-waste-bin-overflow-monitoring.md docs/5-neoeyes-ne301-series/application-guide/urban-waste-bin-overflow-monitoring.md.backup
```

- [ ] **Step 3: 运行上传**

```bash
cd .image-upload && yarn upload-images ../docs/5-neoeyes-ne301-series/application-guide/urban-waste-bin-overflow-monitoring.md
```

- [ ] **Step 4: 验证链接**

检查 Markdown 文件中的图片链接是否正确替换

- [ ] **Step 5: 构建测试**

```bash
cd .. && yarn build
```

Expected: 构建成功,图片正常显示

- [ ] **Step 6: 恢复原文件(如果需要)**

```bash
# 如果测试成功,保留新的链接
# 如果需要恢复,执行:
mv docs/5-neoeyes-ne301-series/application-guide/urban-waste-bin-overflow-monitoring.md.backup docs/5-neoeyes-ne301-series/application-guide/urban-waste-bin-overflow-monitoring.md
```

---

## Chunk 4 完成检查点

✅ **已完成的任务:**
- Task 14: 功能测试
- Task 15: 边界情况测试
- Task 16: 端到端验证

**关键成果:**
- 所有功能测试通过
- 边界情况处理正确
- 端到端工作流验证成功

**下一步:** 继续 Chunk 5 - 文档和收尾

---

## Chunk 5: 文档和收尾

### Task 17: 创建使用文档

**Files:**
- Create: `.image-upload/README.md`

- [ ] **Step 1: 创建使用文档**

创建 `.image-upload/README.md`:

```markdown
# Wiki 图片上传工具

独立的图片上传工具,用于将本地图片上传到 File Browser 并自动更新 Markdown 文件中的链接。

## 快速开始

### 1. 配置环境变量

创建 `.env` 文件(不提交到 git):

```bash
FILE_BROWSER_PASSWORD=your_password_here
```

### 2. 安装依赖

```bash
yarn install
```

### 3. 运行工具

从项目根目录执行:

```bash
# 上传单个文件
./.image-upload/run.sh docs/your-article.md

# 或者进入 .image-upload 目录执行
cd .image-upload && yarn upload-images ../docs/your-article.md

# 上传整个目录
./.image-upload/run.sh docs/5-neoeyes-ne301-series/

# 预览模式
./.image-upload/run.sh --dry-run docs/your-article.md

# 强制重新上传
./.image-upload/run.sh --force docs/your-article.md

# API 验证
cd .image-upload && yarn test-api
```

## 工作流程

1. 编写文章,嵌入本地图片(```/img/...```)
2. 运行上传工具
3. 工具自动上传图片并更新 Markdown 中的链接
4. 运行 `yarn build` 构建站点

## 同名文件处理

当远程已存在同名文件时,工具会询问:

- **跳过 (S)**: 不上传,保留原文件
- **覆盖 (O)**: 强制上传并覆盖
- **中止 (A)**: 停止整个上传过程

## 配置说明

配置文件:```.upload-config.json```

```json
{
  "fileBrowser": {
    "baseUrl": "https://fsx.camthink.ai",
    "remoteBasePath": "/wiki/img",
    "publicBaseUrl": "https://resources.camthink.ai/wiki/img"
  },
  "upload": {
    "concurrency": 3,
    "retryAttempts": 3
  }
}
```

## 注意事项

1. **权限限制**: File Browser 只有创建权限,没有删除权限
2. **谨慎上传**: 确保文章定稿后再上传,避免产生垃圾文件
3. **缓存机制**: 已上传的图片会被缓存,避免重复上传
4. **路径一致性**: 保持本地和远程路径结构一致

## 故障排查

### 登录失败

检查:
- 用户名密码是否正确
- File Browser 服务是否在线
- 网络连接是否正常

### 上传失败

检查:
- 文件是否存在
- 文件权限是否正确
- 磁盘空间是否充足

### 链接未替换

检查:
- Markdown 格式是否正确
- 图片路径是否以 ```/img/``` 开头
- 是否在预览模式(dry-run)

## 目录结构

```
.image-upload/
├── scripts/           # CLI 工具脚本
├── lib/               # 核心库
├── test/              # 测试资源
├── .upload-config.json  # 配置文件
├── .upload-cache.json   # 上传缓存(git忽略)
└── .env                # 环境变量(git忽略)
```
```

- [ ] **Step 2: 提交使用文档**

```bash
git add .image-upload/README.md
git commit -m "docs: 添加图片上传工具使用文档"
```

---

### Task 18: 更新项目 README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 在 README 添加工具说明**

在项目 README 的适当位置添加:

```markdown
## 图片上传工具

本项目提供了独立的图片上传工具(位于 ```.image-upload/``` 目录),用于将本地图片上传到 File Browser 并更新 Markdown 中的链接。

### 使用方法

```bash
# 上传单个文件
./.image-upload/run.sh docs/your-article.md

# 上传整个目录
./.image-upload/run.sh docs/5-neoeyes-ne301-series/

# 预览模式
./.image-upload/run.sh --dry-run docs/your-article.md

# API 验证
cd .image-upload && yarn test-api
```

详细文档请参考: [图片上传工具 README](./.image-upload/README.md)
```

- [ ] **Step 2: 提交 README 更新**

```bash
git add README.md
git commit -m "docs: 在 README 添加图片上传工具说明"
```

---

### Task 19: 最终验证和清理

**Files:**
- None

- [ ] **Step 1: 运行完整测试套件**

```bash
# API 测试
cd .image-upload && yarn test-api

# 功能测试(使用测试文章)
yarn upload-images --dry-run test/fixtures/test-article.md
```

Expected: 所有测试通过

- [ ] **Step 2: 检查文件完整性**

```bash
ls -la .image-upload/lib/ .image-upload/scripts/ .image-upload/test/fixtures/
```

Expected: 所有必需文件都存在

- [ ] **Step 3: 检查 Git 状态**

```bash
git status
```

Expected: 工作目录干净,所有更改已提交

- [ ] **Step 4: 创建最终提交(如有遗漏)**

```bash
git add -A
git commit -m "feat: 完成 Wiki 图片自动上传系统"
```

---

## Chunk 5 完成检查点

✅ **已完成的任务:**
- Task 17: 创建使用文档
- Task 18: 更新项目 README
- Task 19: 最终验证和清理

**关键成果:**
- 完整的使用文档
- README 更新
- 所有功能验证通过
- 项目收尾完成

---

## 实施完成总结

✅ **所有 Chunk 完成:**
- Chunk 1: 项目设置和 API 验证
- Chunk 2: 核心库实现
- Chunk 3: CLI 工具实现
- Chunk 4: 测试和验证
- Chunk 5: 文档和收尾

**总任务数:** 19 个任务
**总步骤数:** ~60 个步骤

**成功标准验证:**
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
- ✅ 所有开发产出物隔离在 `.image-upload/` 目录

**准备好执行了吗?**