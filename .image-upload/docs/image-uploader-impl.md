# ImageUploader 实现总结

## 文件位置
`/Users/harryhua/Documents/GitHub/wiki-documents/.worktrees/image-upload/.image-upload/lib/image-uploader.js`

## 核心功能

### 1. 初始化管理
- `initialize()` - 登录 API 并加载缓存
- 管理 FileBrowserAPI 客户端实例

### 2. 缓存机制
- `loadCache()` - 从 `.upload-cache.json` 加载缓存
- `saveCache()` - 保存缓存到文件
- `clearCache()` - 清空缓存
- 缓存结构: `Map<hash, {remotePath, uploadedAt, size}>`

### 3. Hash 计算
- `calculateHash(filePath)` - 计算 SHA256 hash
- 用于识别相同内容的文件,避免重复上传

### 4. 上传功能
- `uploadImage(localPath, staticDir, force)` - 上传单个图片
- `uploadImages(localPaths, staticDir, force)` - 批量上传(并发控制)
- 自动创建远程文件夹
- 支持强制上传(忽略缓存)

### 5. 统计信息
- `getStats()` - 获取统计信息
- `resetStats()` - 重置统计
- 统计项: `uploaded`, `skipped`, `failed`, `errors[]`

### 6. URL 构建
- `buildPublicUrl(remotePath)` - 将远程路径转换为公共访问 URL
- 示例: `/wiki/img/test.png` → `https://resources.camthink.ai/wiki/img/test.png`

## 关键特性

### 1. 缓存避免重复上传
```javascript
// 计算文件 hash
const hash = this.calculateHash(fullPath);

// 检查缓存
if (!force && this.config.upload.skipUploaded && this.cache.has(hash)) {
  const cached = this.cache.get(hash);
  this.stats.skipped++;
  return this.buildPublicUrl(cached.remotePath);
}
```

### 2. 并发控制
```javascript
// 使用批次处理控制并发
for (let i = 0; i < localPaths.length; i += concurrency) {
  const batch = localPaths.slice(i, i + concurrency);
  await Promise.allSettled(batch.map(/* ... */));
}
```

### 3. 错误处理
- 捕获所有错误并记录到 `stats.errors`
- 失败不影响其他文件上传
- 提供详细的错误信息

### 4. 缓存持久化
- 使用 JSON 格式存储
- 自动加载和保存
- 失败不影响程序运行

## 配置项

```javascript
{
  fileBrowser: {
    baseUrl: 'https://fsx.camthink.ai',
    username: 'harry',
    password: process.env.FILE_BROWSER_PASSWORD,
    remoteBasePath: '/wiki/img',
    publicBaseUrl: 'https://resources.camthink.ai/wiki/img'
  },
  upload: {
    concurrency: 3,        // 并发数
    retryAttempts: 3,      // 重试次数(未实现)
    skipUploaded: true,    // 启用缓存
    createFolder: true     // 自动创建文件夹
  }
}
```

## 测试验证

### 核心功能测试
✓ Hash 计算
✓ Hash 一致性
✓ 缓存加载/保存/清空
✓ 统计功能
✓ URL 构建
✓ 配置验证

测试脚本: `test/verify-uploader.js`
测试结果: 10/10 通过

## 使用示例

```javascript
const ImageUploader = require('./lib/image-uploader');

// 1. 创建实例
const uploader = new ImageUploader(config);

// 2. 初始化
await uploader.initialize();

// 3. 上传图片
const url = await uploader.uploadImage(
  '/img/docs/example.png',  // 相对路径
  '/path/to/static',        // static 目录
  false                     // 不强制上传
);

// 4. 查看统计
const stats = uploader.getStats();
console.log(`上传: ${stats.uploaded}, 跳过: ${stats.skipped}`);
```

## 依赖关系

- `api-client.js` - File Browser API 客户端
- `fs` - 文件系统操作
- `path` - 路径处理
- `crypto` - SHA256 hash 计算

## 下一步

- 集成到 CLI 工具
- 与 Markdown 解析器协作
- 实现完整的图片上传流程
- 添加重试机制(目前占位)
