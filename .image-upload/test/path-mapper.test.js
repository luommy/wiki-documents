const path = require('path');
const { generateRemotePath, mapImagePath, mapImagePaths, extractFolderName } = require('../lib/path-mapper');

describe('generateRemotePath', () => {
  describe('Basic Functionality', () => {
    it('should handle 2-level directories', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/0-overview.md';
      const imagePath = '/img/ne301/application-guide/architecture/overview.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/neoedge-ng4500-series/overview/overview.png');
    });

    it('should handle 3-level directories', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/0-dev-guide.md';
      const imagePath = '/img/ne301/application-guide/monitoring/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/image.png');
    });

    it('should handle 4-level directories', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md';
      const imagePath = '/img/ne301/application-guide/monitoring/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/image.png');
    });

    it('should handle 5+ level directories', () => {
      const docPath = 'docs/1-series/2-board/3-guide/4-topic/5-detail.md';
      const imagePath = '/img/xxx/app/screenshots/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/board/guide/topic/detail/image.png');
    });
  });

  describe('Edge Cases', () => {
    it('should handle root-level documents', () => {
      const docPath = 'docs/overview.md';
      const imagePath = '/img/xxx/architecture/diagram.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/overview/diagram.png');
    });

    it('should handle docs prefix removal', () => {
      const docPath = 'some/path/docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/test/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/image.png');
    });

    it('should handle images without /img/ prefix', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/static/img/test.png';

      expect(generateRemotePath(docPath, imagePath)).toBe(imagePath);
    });

    it('should handle Windows paths', () => {
      const docPath = 'docs\\1-series\\2-guide\\0-overview.md';
      const imagePath = '/img/test/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/overview/image.png');
    });
  });

  describe('Security', () => {
    it('should reject null docPath', () => {
      expect(() => generateRemotePath(null, '/img/test.png'))
        .toThrow('Both docPath and imagePath are required');
    });

    it('should reject null imagePath', () => {
      expect(() => generateRemotePath('docs/test.md', null))
        .toThrow('Both docPath and imagePath are required');
    });

    it('should reject undefined inputs', () => {
      expect(() => generateRemotePath(undefined, undefined))
        .toThrow('Both docPath and imagePath are required');
    });

    it('should reject path traversal in docPath', () => {
      expect(() => generateRemotePath('../etc/passwd', '/img/test.png'))
        .toThrow('Path traversal detected');
    });

    it('should reject path traversal in imagePath', () => {
      expect(() => generateRemotePath('docs/test.md', '/img/../etc/passwd'))
        .toThrow('Path traversal detected');
    });

    it('should reject non-string inputs (number)', () => {
      expect(() => generateRemotePath(123, '/img/test.png'))
        .toThrow('docPath and imagePath must be strings');
    });

    it('should reject non-string inputs (object)', () => {
      expect(() => generateRemotePath({}, '/img/test.png'))
        .toThrow('docPath and imagePath must be strings');
    });

    it('should reject non-string inputs (array)', () => {
      expect(() => generateRemotePath(['docs/test.md'], '/img/test.png'))
        .toThrow('docPath and imagePath must be strings');
    });
  });

  describe('URL Encoding', () => {
    it('should encode Chinese characters in filename', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test/架构图.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/%E6%9E%B6%E6%9E%84%E5%9B%BE.png');
    });

    it('should encode spaces in filename', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test/my image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/my%20image.png');
    });

    it('should return remote URLs as-is', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const httpsPath = 'https://example.com/image.png';
      const httpPath = 'http://example.com/image.png';

      expect(generateRemotePath(docPath, httpsPath)).toBe(httpsPath);
      expect(generateRemotePath(docPath, httpPath)).toBe(httpPath);
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with mapImagePath (wrapper)', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test/image.png';
      const result = mapImagePath(imagePath, docPath);

      expect(result).toBe('/img/series/guide/image.png');
    });

    it('should work with mapImagePaths (batch mapping)', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePaths = [
        '/img/test/image1.png',
        '/img/test/image2.png',
        'https://example.com/remote.png'
      ];
      const result = mapImagePaths(imagePaths, docPath);

      expect(result).toEqual({
        '/img/test/image1.png': '/img/series/guide/image1.png',
        '/img/test/image2.png': '/img/series/guide/image2.png',
        'https://example.com/remote.png': 'https://example.com/remote.png'
      });
    });

    it('should work with extractFolderName', () => {
      const docPath = 'docs/1-series/2-guide/0-overview.md';
      const result = extractFolderName(docPath);

      expect(result).toBe('overview');
    });

    it('should work with extractFolderName for root docs', () => {
      const docPath = 'docs/overview.md';
      const result = extractFolderName(docPath);

      expect(result).toBe('overview');
    });
  });

  describe('Error Handling', () => {
    it('should return original path on internal error', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test/image.png';
      const result = generateRemotePath(docPath, imagePath);

      // 正常情况应该返回映射后的路径
      expect(result).toBe('/img/series/guide/image.png');
    });
  });
});
