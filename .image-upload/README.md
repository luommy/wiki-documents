# 图片上传工具 - 项目概览

## 项目结构

```
.image-upload/
├── lib/                          # 核心库
│   ├── api-client.js             # File Browser API 客户端 ✓
│   ├── image-uploader.js         # 图片上传协调器 ✓
│   ├── markdown-parser.js        # Markdown 解析器 ✓
│   ├── link-replacer.js          # 链接替换器 ✓
│   ├── image-uploader.example.js # 使用示例
│   └── .upload-cache.json        # 上传缓存
│
├── scripts/                      # 脚本工具
│   └── test-api.js               # API 测试脚本 ✓
│
├── test/                         # 测试文件
│   ├── verify-uploader.js        # 协调器核心功能验证 ✓
│   ├── test-uploader.js          # 完整集成测试
│   ├── test-uploader-unit.js     # 单元测试
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
└── README.md                     # 本文档
```

## 核心模块

### 1. API 客户端 (`lib/api-client.js`)
**状态:** ✓ 已完成并测试

**功能:**
- File Browser API 认证登录
- 文件上传(支持覆盖)
- 文件夹创建
- 文件存在检查
- 文件夹列表查询

**测试:** `scripts/test-api.js`

### 2. 图片上传协调器 (`lib/image-uploader.js`)
**状态:** ✓ 已完成并测试

**功能:**
- 管理上传流程
- SHA256 hash 计算
- 缓存机制(避免重复上传)
- 上传统计信息
- 并发上传控制
- 单个/批量上传支持

**测试:** `test/verify-uploader.js` (10/10 通过)

**核心方法:**
```javascript
// 初始化
await uploader.initialize()

// 单个上传
const url = await uploader.uploadImage(localPath, staticDir, force?)

// 批量上传
const mapping = await uploader.uploadImages(localPaths, staticDir, force?)

// 统计信息
const stats = uploader.getStats()

// 缓存管理
uploader.loadCache()
uploader.saveCache()
uploader.clearCache()
```

### 3. Markdown 解析器 (`lib/markdown-parser.js`)
**状态:** ✓ 已完成

**功能:**
- 提取标准 Markdown 图片引用
- 提取 JSX 格式图片引用
- 支持多种图片语法

### 4. 链接替换器 (`lib/link-replacer.js`)
**状态:** ✓ 已完成

**功能:**
- 替换 Markdown 格式链接
- 替换 JSX 格式链接
- 替换自定义组件链接

## 配置说明

### `.upload-config.json`
```json
{
  "fileBrowser": {
    "baseUrl": "https://fsx.camthink.ai",
    "username": "harry",
    "password": "${FILE_BROWSER_PASSWORD}",  // 从环境变量读取
    "remoteBasePath": "/wiki/img",
    "publicBaseUrl": "https://resources.camthink.ai/wiki/img"
  },
  "upload": {
    "concurrency": 3,          // 并发数
    "retryAttempts": 3,        // 重试次数(占位)
    "skipUploaded": true,      // 跳过已上传
    "createFolder": true       // 自动创建文件夹
  },
  "markdown": {
    "fileExtensions": [".md", ".mdx"],
    "imageExtensions": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"]
  }
}
```

### `.env`
```
FILE_BROWSER_PASSWORD=your_password_here
```

## 测试结果

### API 客户端测试
```bash
node scripts/test-api.js
```
✓ 登录成功
✓ 创建文件夹成功
✓ 上传文件成功
✓ 文件存在检查成功

### 协调器核心功能测试
```bash
node test/verify-uploader.js
```
✓ 10/10 测试通过

测试项:
1. Hash 计算
2. Hash 一致性
3. 缓存加载
4. 缓存保存
5. 统计初始化
6. 统计重置
7. URL 构建
8. URL 构建嵌套路径
9. 缓存清空
10. 配置验证

## 使用示例

### 基础使用
```javascript
const ImageUploader = require('./lib/image-uploader');
const config = require('./.upload-config.json');

// 加载环境变量
require('dotenv').config();
config.fileBrowser.password = process.env.FILE_BROWSER_PASSWORD;

async function main() {
  // 创建上传器
  const uploader = new ImageUploader(config);

  // 初始化
  await uploader.initialize();

  // 上传单个图片
  const url = await uploader.uploadImage(
    '/img/docs/example.png',  // 相对路径
    '/path/to/static',        // static 目录
    false                     // 不强制上传
  );

  console.log('上传成功:', url);
  console.log('统计信息:', uploader.getStats());
}

main();
```

### 批量上传
```javascript
const images = [
  '/img/docs/step1.png',
  '/img/docs/step2.png',
  '/img/docs/step3.png'
];

const results = await uploader.uploadImages(images, staticDir);
console.log('上传结果:', results);
console.log('统计:', uploader.getStats());
```

## 下一步计划

### 待实现功能
- [ ] CLI 工具主框架 (Task #14)
- [ ] CLI 辅助函数 (Task #21)
- [ ] 便捷执行脚本 (Task #23)
- [ ] 功能测试 (Task #15)
- [ ] 边界情况测试 (Task #16)
- [ ] 端到端验证 (Task #26)

### 核心流程
1. 扫描 Markdown 文件
2. 提取图片引用
3. 批量上传图片
4. 替换 Markdown 链接
5. 保存修改后的文件

## 开发指南

### 运行测试
```bash
# API 测试
node scripts/test-api.js

# 协调器测试
node test/verify-uploader.js

# 完整测试(需要有效凭据)
node test/test-uploader.js
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

## 技术栈

- **Node.js** - 运行环境
- **axios** - HTTP 客户端
- **dotenv** - 环境变量管理
- **crypto** - Hash 计算
- **fs/path** - 文件系统操作

## 相关文档

- [API 客户端实现](./docs/api-client-impl.md) - 待创建
- [协调器实现](./docs/image-uploader-impl.md) - 已完成
- [Markdown 解析](./docs/markdown-parser.md) - 待创建
- [使用指南](./docs/usage-guide.md) - 待创建

## 更新日志

### 2024-03-19
- ✓ 完成 API 客户端实现和测试
- ✓ 完成图片上传协调器实现
- ✓ 完成核心功能验证(10/10 通过)
- ✓ 创建配置文件和环境变量管理
- ✓ 添加使用示例和文档

## 许可证

内部项目 - CamThink AI
