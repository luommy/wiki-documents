/**
 * ImageUploader 使用示例
 * 展示主要功能和使用方式
 */

const path = require('path');
const fs = require('fs');
const ImageUploader = require('./lib/image-uploader');

// 示例配置
const config = {
  fileBrowser: {
    baseUrl: 'https://fsx.camthink.ai',
    username: 'harry',
    password: process.env.FILE_BROWSER_PASSWORD, // 从环境变量读取
    remoteBasePath: '/wiki/img',
    publicBaseUrl: 'https://resources.camthink.ai/wiki/img'
  },
  upload: {
    concurrency: 3,           // 并发上传数
    retryAttempts: 3,         // 重试次数
    skipUploaded: true,       // 跳过已上传文件
    createFolder: true        // 自动创建文件夹
  }
};

async function main() {
  // 1. 创建上传器实例
  const uploader = new ImageUploader(config);

  // 2. 初始化(登录 + 加载缓存)
  await uploader.initialize();

  // 3. 上传单个图片
  const staticDir = '/path/to/wiki-documents/static';
  const localPath = '/img/docs/getting-started/screenshot.png';

  try {
    const remoteUrl = await uploader.uploadImage(localPath, staticDir);
    console.log(`上传成功: ${remoteUrl}`);
  } catch (error) {
    console.error(`上传失败: ${error.message}`);
  }

  // 4. 批量上传
  const images = [
    '/img/docs/guide/step1.png',
    '/img/docs/guide/step2.png',
    '/img/docs/guide/step3.png'
  ];

  const results = await uploader.uploadImages(images, staticDir);

  // 5. 查看统计
  const stats = uploader.getStats();
  console.log('上传统计:', stats);

  // 6. 处理上传失败的文件
  if (stats.failed > 0) {
    console.log('失败的文件:', stats.errors);
  }
}

// API 说明
console.log(`
=== ImageUploader API ===

初始化:
  await uploader.initialize()

单个上传:
  const url = await uploader.uploadImage(localPath, staticDir, force?)

批量上传:
  const mapping = await uploader.uploadImages(localPaths, staticDir, force?)

统计信息:
  const stats = uploader.getStats()
  // { uploaded, skipped, failed, errors }

缓存管理:
  uploader.loadCache()
  uploader.saveCache()
  uploader.clearCache()

Hash 计算:
  const hash = uploader.calculateHash(filePath)

URL 构建:
  const url = uploader.buildPublicUrl(remotePath)

参数说明:
  localPath  - 相对路径,如 /img/docs/example.png
  staticDir  - static 目录的绝对路径
  force      - 是否强制上传(忽略缓存),默认 false
`);
