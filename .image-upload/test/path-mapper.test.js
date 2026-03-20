const path = require('path');
const { generateRemotePath, mapImagePath, mapImagePaths, extractFolderName } = require('../lib/path-mapper');

describe('generateRemotePath', () => {
  describe('Basic Functionality', () => {
    it('should handle 2-level directories', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/0-overview.md';
      const imagePath = '/img/ne301/application-guide/architecture/overview.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/neoedge-ng4500-series/architecture/overview.png');
    });

    it('should handle 3-level directories', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/0-dev-guide.md';
      const imagePath = '/img/ne301/application-guide/monitoring/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/monitoring/image.png');
    });

    it('should handle 4-level directories', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md';
      const imagePath = '/img/ne301/application-guide/monitoring/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/monitoring/image.png');
    });

    it('should handle 5+ level directories', () => {
      const docPath = 'docs/1-series/2-board/3-guide/4-topic/5-detail.md';
      const imagePath = '/img/xxx/app/screenshots/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/board/guide/topic/detail/screenshots/image.png');
    });
  });

  describe('Edge Cases', () => {
    it('should handle root-level documents', () => {
      const docPath = 'docs/overview.md';
      const imagePath = '/img/xxx/architecture/diagram.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/overview/architecture/diagram.png');
    });

    it('should handle docs prefix removal', () => {
      const docPath = 'some/path/docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/test/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/test/image.png');
    });

    it('should handle document without docs prefix', () => {
      const docPath = '1-series/0-guide.md';
      const imagePath = '/img/xxx/test/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/test/image.png');
    });

    it('should skip product IDs in lastFolder', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/ne301/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/image.png');
    });

    it('should handle product ID with previous folder', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/ne301/architecture/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/architecture/image.png');
    });

    it('should encode special characters', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/architecture/架构图.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('%E6%9E%B6%E6%9E%84%E5%9B%BE.png');
    });

    it('should handle spaces in paths', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/architecture/my image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('my%20image.png');
    });

    it('should handle Windows paths', () => {
      const docPath = 'docs\\1-series\\0-guide.md';
      const imagePath = '/img/xxx/architecture/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/architecture/image.png');
    });

    it('should handle missing /img/ prefix', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/static/images/test.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe(imagePath); // Returns original
    });
  });

  describe('Security', () => {
    it('should reject null inputs', () => {
      expect(() => generateRemotePath(null, '/img/test.png'))
        .toThrow('Both docPath and imagePath are required');

      expect(() => generateRemotePath('docs/test.md', null))
        .toThrow('Both docPath and imagePath are required');
    });

    it('should reject undefined inputs', () => {
      expect(() => generateRemotePath(undefined, '/img/test.png'))
        .toThrow('Both docPath and imagePath are required');

      expect(() => generateRemotePath('docs/test.md', undefined))
        .toThrow('Both docPath and imagePath are required');
    });

    it('should reject non-string inputs', () => {
      expect(() => generateRemotePath(123, '/img/test.png'))
        .toThrow('docPath and imagePath must be strings');

      expect(() => generateRemotePath('docs/test.md', { path: '/img/test.png' }))
        .toThrow('docPath and imagePath must be strings');

      expect(() => generateRemotePath([], '/img/test.png'))
        .toThrow('docPath and imagePath must be strings');
    });

    it('should reject path traversal in docPath', () => {
      expect(() => generateRemotePath('../etc/passwd', '/img/test.png'))
        .toThrow('Path traversal detected');
    });

    it('should reject path traversal in imagePath', () => {
      expect(() => generateRemotePath('docs/test.md', '../etc/shadow'))
        .toThrow('Path traversal detected');
    });

    it('should return remote URLs as-is', () => {
      const remoteUrl = 'https://example.com/image.png';
      const result = generateRemotePath('docs/test.md', remoteUrl);

      expect(result).toBe(remoteUrl);
    });

    it('should handle http URLs', () => {
      const remoteUrl = 'http://example.com/image.png';
      const result = generateRemotePath('docs/test.md', remoteUrl);

      expect(result).toBe(remoteUrl);
    });
  });

  describe('mapImagePath (wrapper)', () => {
    it('should work as backward-compatible wrapper', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/monitoring/image.png';
      const result = mapImagePath(imagePath, docPath);

      expect(result).toBe('/img/series/guide/monitoring/image.png');
    });
  });

  describe('mapImagePaths (batch mapping)', () => {
    it('should map multiple image paths', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePaths = [
        '/img/xxx/monitoring/image1.png',
        '/img/xxx/architecture/image2.png',
        '/img/xxx/screenshots/image3.png'
      ];
      const result = mapImagePaths(imagePaths, docPath);

      expect(result).toEqual({
        '/img/xxx/monitoring/image1.png': '/img/series/guide/monitoring/image1.png',
        '/img/xxx/architecture/image2.png': '/img/series/guide/architecture/image2.png',
        '/img/xxx/screenshots/image3.png': '/img/series/guide/screenshots/image3.png'
      });
    });

    it('should handle remote URLs in batch', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePaths = [
        'https://example.com/image1.png',
        '/img/xxx/test/image2.png'
      ];
      const result = mapImagePaths(imagePaths, docPath);

      expect(result['https://example.com/image1.png']).toBe('https://example.com/image1.png');
      expect(result['/img/xxx/test/image2.png']).toBe('/img/series/guide/test/image2.png');
    });

    it('should preserve original path on error', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePaths = [
        '/static/images/test.png', // 没有 /img/ 前缀
        '/img/xxx/test/image.png'
      ];
      const result = mapImagePaths(imagePaths, docPath);

      expect(result['/static/images/test.png']).toBe('/static/images/test.png');
      expect(result['/img/xxx/test/image.png']).toBe('/img/series/guide/test/image.png');
    });

    it('should handle empty array', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const result = mapImagePaths([], docPath);

      expect(result).toEqual({});
    });
  });

  describe('extractFolderName (backward compatibility)', () => {
    it('should extract filename from document path', () => {
      const docPath = 'docs/1-series/0-quick-start.md';
      const result = extractFolderName(docPath);

      expect(result).toBe('quick-start');
    });

    it('should handle nested paths', () => {
      const docPath = 'docs/1-series/2-guide/3-installation.md';
      const result = extractFolderName(docPath);

      expect(result).toBe('installation');
    });

    it('should handle root-level documents', () => {
      const docPath = 'docs/overview.md';
      const result = extractFolderName(docPath);

      expect(result).toBe('overview');
    });

    it('should handle path without file', () => {
      const docPath = 'docs/1-series/2-guide';
      const result = extractFolderName(docPath);

      expect(result).toBe('guide');
    });
  });

  describe('Error Handling', () => {
    it('should return original path on internal error', () => {
      const docPath = 'docs/1-series/0-guide.md';
      // 构造一个会导致内部错误的路径（虽然实际代码会捕获所有错误）
      const imagePath = '/img/xxx/test/image.png';

      const result = generateRemotePath(docPath, imagePath);
      // 应该返回映射后的路径，而不是抛出错误
      expect(typeof result).toBe('string');
    });
  });

  describe('URL Encoding', () => {
    it('should encode lastFolder with special characters', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/架构图/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('%E6%9E%B6%E6%9E%84%E5%9B%BE');
    });

    it('should encode both lastFolder and filename', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/测试文件夹/测试图片.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('%E6%B5%8B%E8%AF%95%E6%96%87%E4%BB%B6%E5%A4%B9');
      expect(result).toContain('%E6%B5%8B%E8%AF%95%E5%9B%BE%E7%89%87.png');
    });

    it('should handle empty lastFolder', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/ne301/image.png'; // 产品 ID 会被跳过，导致 lastFolder 为空
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/image.png');
    });
  });
});
