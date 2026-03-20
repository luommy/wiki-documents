/**
 * ImageUploader 单元测试
 * 不依赖实际 API 的功能测试
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ImageUploader = require('../lib/image-uploader');

// Mock FileBrowserAPI
jest.mock('../lib/api-client');

describe('ImageUploader', () => {
  let uploader;
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

  beforeEach(() => {
    uploader = new ImageUploader(testConfig);
  });

  describe('calculateHash', () => {
    test('应该计算正确的 SHA256 hash', () => {
      // 创建测试文件
      const testFile = path.join(__dirname, 'test-hash.txt');
      fs.writeFileSync(testFile, 'test content');

      const hash = uploader.calculateHash(testFile);

      // 验证 hash 格式
      expect(hash).toMatch(/^[a-f0-9]{64}$/);

      // 清理
      fs.unlinkSync(testFile);
    });

    test('相同内容应该产生相同 hash', () => {
      const testFile1 = path.join(__dirname, 'test-hash-1.txt');
      const testFile2 = path.join(__dirname, 'test-hash-2.txt');

      fs.writeFileSync(testFile1, 'same content');
      fs.writeFileSync(testFile2, 'same content');

      const hash1 = uploader.calculateHash(testFile1);
      const hash2 = uploader.calculateHash(testFile2);

      expect(hash1).toBe(hash2);

      // 清理
      fs.unlinkSync(testFile1);
      fs.unlinkSync(testFile2);
    });
  });

  describe('缓存管理', () => {
    test('loadCache 应该正确加载缓存', () => {
      uploader.loadCache();
      expect(uploader.cache).toBeInstanceOf(Map);
    });

    test('saveCache 应该保存缓存', () => {
      const testHash = 'abc123';
      const testData = {
        remotePath: '/wiki/img/test.png',
        uploadedAt: '2024-01-01T00:00:00Z',
        size: 1024
      };

      uploader.cache.set(testHash, testData);
      uploader.saveCache();

      // 验证文件存在
      const cacheFile = path.join(__dirname, '../lib/.upload-cache.json');
      expect(fs.existsSync(cacheFile)).toBe(true);

      // 清理
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
    });

    test('clearCache 应该清空缓存', () => {
      uploader.cache.set('test', 'data');
      uploader.clearCache();

      expect(uploader.cache.size).toBe(0);
    });
  });

  describe('统计功能', () => {
    test('getStats 应该返回统计对象', () => {
      const stats = uploader.getStats();

      expect(stats).toHaveProperty('uploaded');
      expect(stats).toHaveProperty('skipped');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('errors');
    });

    test('resetStats 应该重置统计', () => {
      uploader.stats.uploaded = 5;
      uploader.stats.failed = 2;

      uploader.resetStats();

      expect(uploader.stats.uploaded).toBe(0);
      expect(uploader.stats.failed).toBe(0);
    });
  });

  describe('buildPublicUrl', () => {
    test('应该正确构建公共 URL', () => {
      const remotePath = '/wiki/img/test/example.png';
      const publicUrl = uploader.buildPublicUrl(remotePath);

      expect(publicUrl).toBe('https://resources.example.com/wiki/img/test/example.png');
    });

    test('应该处理嵌套路径', () => {
      const remotePath = '/wiki/img/docs/guide/step1/screenshot.png';
      const publicUrl = uploader.buildPublicUrl(remotePath);

      expect(publicUrl).toBe('https://resources.example.com/wiki/img/docs/guide/step1/screenshot.png');
    });
  });
});
