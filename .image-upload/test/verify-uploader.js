/**
 * ImageUploader 核心功能验证
 * 不需要实际 API 连接
 */

const path = require('path');
const fs = require('fs');
const ImageUploader = require('../lib/image-uploader');

console.log('=== ImageUploader 核心功能验证 ===\n');

// 测试配置
const testConfig = {
  fileBrowser: {
    baseUrl: 'https://test.example.com',
    username: 'test',
    password: 'test',
    remoteBasePath: '/wiki/img',
    publicBaseUrl: 'https://resources.example.com/wiki/img'
  },
  upload: {
    concurrency: 3,
    skipUploaded: true,
    createFolder: true
  }
};

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  错误: ${error.message}`);
    failed++;
  }
}

// 创建测试实例
const uploader = new ImageUploader(testConfig);

// 测试 1: Hash 计算
test('1. Hash 计算', () => {
  const testFile = __filename;
  const hash = uploader.calculateHash(testFile);

  if (typeof hash !== 'string' || hash.length !== 64) {
    throw new Error(`Hash 格式错误: ${hash}`);
  }
});

// 测试 2: 相同内容产生相同 hash
test('2. Hash 一致性', () => {
  const file1 = '/tmp/test-hash-1.txt';
  const file2 = '/tmp/test-hash-2.txt';
  const content = 'same content';

  fs.writeFileSync(file1, content);
  fs.writeFileSync(file2, content);

  const hash1 = uploader.calculateHash(file1);
  const hash2 = uploader.calculateHash(file2);

  fs.unlinkSync(file1);
  fs.unlinkSync(file2);

  if (hash1 !== hash2) {
    throw new Error(`Hash 不一致: ${hash1} vs ${hash2}`);
  }
});

// 测试 3: 缓存加载
test('3. 缓存加载', () => {
  uploader.loadCache();

  if (!(uploader.cache instanceof Map)) {
    throw new Error('缓存不是 Map 实例');
  }
});

// 测试 4: 缓存保存
test('4. 缓存保存', () => {
  const testHash = 'test-hash-abc123';
  const testData = {
    remotePath: '/wiki/img/test.png',
    uploadedAt: new Date().toISOString(),
    size: 1024
  };

  uploader.cache.set(testHash, testData);
  uploader.saveCache();

  const cacheFile = path.join(__dirname, '../lib/.upload-cache.json');
  if (!fs.existsSync(cacheFile)) {
    throw new Error('缓存文件未创建');
  }

  // 验证内容
  const saved = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  if (!saved[testHash]) {
    throw new Error('缓存数据未正确保存');
  }

  // 清理
  fs.unlinkSync(cacheFile);
});

// 测试 5: 统计功能
test('5. 统计初始化', () => {
  const stats = uploader.getStats();

  if (typeof stats.uploaded !== 'number' ||
      typeof stats.skipped !== 'number' ||
      typeof stats.failed !== 'number') {
    throw new Error('统计字段类型错误');
  }
});

// 测试 6: 统计重置
test('6. 统计重置', () => {
  uploader.stats.uploaded = 10;
  uploader.stats.failed = 5;

  uploader.resetStats();

  if (uploader.stats.uploaded !== 0 || uploader.stats.failed !== 0) {
    throw new Error('统计未正确重置');
  }
});

// 测试 7: URL 构建
test('7. URL 构建', () => {
  const remotePath = '/wiki/img/test/example.png';
  const publicUrl = uploader.buildPublicUrl(remotePath);
  const expected = 'https://resources.example.com/wiki/img/test/example.png';

  if (publicUrl !== expected) {
    throw new Error(`URL 构建错误: ${publicUrl}`);
  }
});

// 测试 8: URL 构建嵌套路径
test('8. URL 构建嵌套路径', () => {
  const remotePath = '/wiki/img/docs/guide/step1/screenshot.png';
  const publicUrl = uploader.buildPublicUrl(remotePath);
  const expected = 'https://resources.example.com/wiki/img/docs/guide/step1/screenshot.png';

  if (publicUrl !== expected) {
    throw new Error(`URL 构建错误: ${publicUrl}`);
  }
});

// 测试 9: 缓存清空
test('9. 缓存清空', () => {
  uploader.cache.set('test', { data: 'test' });
  uploader.clearCache();

  if (uploader.cache.size !== 0) {
    throw new Error('缓存未正确清空');
  }
});

// 测试 10: 配置验证
test('10. 配置验证', () => {
  if (uploader.config !== testConfig) {
    throw new Error('配置未正确保存');
  }

  if (!uploader.apiClient) {
    throw new Error('API 客户端未创建');
  }
});

// 输出结果
console.log('\n=== 测试结果 ===');
console.log(`通过: ${passed}`);
console.log(`失败: ${failed}`);
console.log(`总计: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}
