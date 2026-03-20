/**
 * 端到端测试：完整上传流程测试
 */

const path = require('path');
const { parseFile } = require('../lib/markdown-parser');
const { mapImagePaths } = require('../lib/path-mapper');

describe('End-to-End Upload Flow', () => {
  describe('Complete workflow', () => {
    it('should map images for a 2-level document correctly', () => {
      // 1. 扫描文档
      const docPath = 'docs/1-neoedge-ng4500-series/0-overview.md';

      // 2. 提取图片
      const images = parseFile(path.join(__dirname, '../../', docPath));

      // 3. 生成映射
      const mapping = mapImagePaths(images, docPath);

      // 4. 验证映射正确性
      expect(Object.keys(mapping).length).toBeGreaterThan(0);

      // 验证所有映射路径都以 /img/ 开头
      Object.values(mapping).forEach(mapped => {
        expect(mapped.startsWith('/img/')).toBe(true);
      });
    });

    it('should map images for a 5-level document correctly', () => {
      const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/1-driver-installation-and-updates/0-interface-and-modules-configure.md';
      const images = parseFile(path.join(__dirname, '../../', docPath));
      const mapping = mapImagePaths(images, docPath);

      expect(Object.keys(mapping).length).toBeGreaterThan(0);

      // 验证深层文档的路径映射
      Object.entries(mapping).forEach(([original, mapped]) => {
        // 应该包含完整文档层级
        expect(mapped).toContain('neoedge-ng4500-series');
        expect(mapped).toContain('ng4500-cb01-development-board');
        expect(mapped).toContain('software-guide');
        expect(mapped).toContain('driver-installation-and-updates');
        expect(mapped).toContain('interface-and-modules-configure');
      });
    });
  });
});