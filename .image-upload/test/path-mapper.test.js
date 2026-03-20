const path = require('path');
const { generateRemotePath, mapImagePath } = require('../lib/path-mapper');

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

    it('should skip product IDs in lastFolder', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/ne301/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/series/guide/image.png');
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
  });

  describe('mapImagePath (wrapper)', () => {
    it('should work as backward-compatible wrapper', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/xxx/monitoring/image.png';
      const result = mapImagePath(imagePath, docPath);

      expect(result).toBe('/img/series/guide/monitoring/image.png');
    });
  });
});
