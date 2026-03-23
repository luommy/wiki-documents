/**
 * 边界情况测试
 */

const { generateRemotePath, mapImagePaths } = require('../lib/path-mapper');

describe('Edge Cases', () => {
  describe('超长路径', () => {
    it('should handle paths longer than 200 characters', () => {
      const longPath = 'docs/1-series/2-board/3-module/4-component/5-feature/6-implementation/7-details/8-advanced/9-expert/0-guide.md';
      const imagePath = '/img/test/image.png';

      const result = generateRemotePath(longPath, imagePath);

      expect(result.length).toBeLessThan(300);
      expect(result).toContain('series');
      expect(result).toContain('board');
      expect(result).toContain('module');
      expect(result).toContain('component');
    });
  });

  describe('特殊字符', () => {
    it('should handle emoji in filename', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test/📷-screenshot.png';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('%F0%9F%93%B7');
    });

    it('should handle special symbols in filename', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test/image@2x.png';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('image%402x.png');
    });
  });

  describe('重复文件名', () => {
    it('should handle same filename from different paths', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath1 = '/img/folder1/image.png';
      const imagePath2 = '/img/folder2/image.png';

      const result1 = generateRemotePath(docPath, imagePath1);
      const result2 = generateRemotePath(docPath, imagePath2);

      // 两个不同的图片路径映射到相同位置（因为只保留文件名）
      expect(result1).toBe(result2);
      expect(result1).toBe('/img/series/guide/image.png');
    });
  });

  describe('空文档', () => {
    it('should handle document with no images', () => {
      const docPath = 'docs/1-series/0-empty.md';
      const images = [];

      const mapping = mapImagePaths(images, docPath);

      expect(Object.keys(mapping).length).toBe(0);
    });
  });

  describe('混合引用', () => {
    it('should handle mix of local and remote images', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const localImage = '/img/test/local.png';
      const remoteImage = 'https://example.com/remote.png';

      const result1 = generateRemotePath(docPath, localImage);
      const result2 = generateRemotePath(docPath, remoteImage);

      expect(result1).toBe('/img/series/guide/local.png');
      expect(result2).toBe(remoteImage);
    });
  });

  describe('极端边界情况', () => {
    it('should handle deeply nested paths (10+ levels)', () => {
      const docPath = 'docs/1-a/2-b/3-c/4-d/5-e/6-f/7-g/8-h/9-i/0-j.md';
      const imagePath = '/img/test.png';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('a');
      expect(result).toContain('j');
    });

    it('should handle filename with multiple dots', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test.image.v2.png';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('test.image.v2.png');
    });

    it('should handle uppercase extensions', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test.PNG';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('test.PNG');
    });
  });
});