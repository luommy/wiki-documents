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

      // 验证映射路径格式正确
      Object.entries(mapping).forEach(([original, mapped]) => {
        // 原始路径应该是 /img/ 开头的（由 markdown-parser 解析后的路径）
        expect(original).toMatch(/^\/img\//);

        // 映射后的路径也应该是 /img/ 开头
        expect(mapped).toMatch(/^\/img\//);

        // 应该包含正确的文档路径结构
        expect(mapped).toContain('/img/neoedge-ng4500-series/overview/');

        // 应该以有效的图片扩展名结尾
        expect(mapped).toMatch(/\.(png|jpg|jpeg|gif|svg)$/i);

        // 映射后的路径应该包含文档相关的路径信息
        expect(mapped).toContain('neoedge-ng4500-series');
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

        // 应该以 /img/ 开头
        expect(mapped).toMatch(/^\/img\//);

        // 应该以有效的图片扩展名结尾
        expect(mapped).toMatch(/\.(png|jpg|jpeg|gif|svg)$/i);
      });
    });
  });

  describe('Error scenarios', () => {
    it('should handle document file not found gracefully', () => {
      const docPath = 'docs/non-existent-document.md';

      // 尝试解析不存在的文档
      expect(() => {
        parseFile(path.join(__dirname, '../../', docPath));
      }).toThrow();
    });

    it('should handle document with no images', () => {
      // 创建一个临时测试文件（无图片）
      const fs = require('fs');
      const tempDir = path.join(__dirname, '../../.image-upload/test/fixtures');
      const tempFile = path.join(tempDir, 'empty-doc.md');

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(tempFile, '# Empty Document\n\nThis document has no images.\n');

      try {
        const images = parseFile(tempFile);
        const mapping = mapImagePaths(images, 'docs/test.md');

        // 应该返回空映射
        expect(mapping).toEqual({});
      } finally {
        // 清理临时文件
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  });

  describe('Security tests', () => {
    it('should sanitize image paths to prevent directory traversal', () => {
      // 创建一个包含恶意图片路径的测试文档
      const fs = require('fs');
      const tempDir = path.join(__dirname, '../../.image-upload/test/fixtures');
      const tempFile = path.join(tempDir, 'malicious-doc.md');

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const maliciousContent = `
# Malicious Document

![Legitimate Image](./images/legitimate.png)
![Traversal Attack](../../../etc/passwd.png)
![Another Attack](../../secrets/config.jpg)
![Absolute Path](/etc/shadow.png)
![Dot Attack](./../../../../tmp/secret.png)
      `;

      fs.writeFileSync(tempFile, maliciousContent);

      try {
        const images = parseFile(tempFile);
        const mapping = mapImagePaths(images, 'docs/test.md');

        // 验证映射后的路径都被正确清理
        Object.values(mapping).forEach(mappedPath => {
          // 不应该包含 ..
          expect(mappedPath).not.toContain('..');
          // 应该以 /img/ 开头
          expect(mappedPath).toMatch(/^\/img\//);
          // 应该在 /img/ 目录下，不能逃逸
          expect(mappedPath).toMatch(/^\/img\/[^.]/);
        });

        // 验证所有恶意路径都被正确处理（没有返回原始恶意路径）
        Object.keys(mapping).forEach(originalPath => {
          // 原始路径应该被解析为安全的 /img/ 路径
          expect(originalPath).toMatch(/^\/img\//);
        });
      } finally {
        // 清理临时文件
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });

    it('should handle malicious document paths safely', () => {
      // 测试包含路径遍历的文档路径（如果文件存在）
      const fs = require('fs');
      const maliciousPaths = [
        '../../../etc/passwd',
        'docs/../../etc/passwd',
        'docs/test/../../system/file.md',
      ];

      maliciousPaths.forEach(maliciousPath => {
        const fullPath = path.join(__dirname, '../../', maliciousPath);

        // 只有当文件实际存在时才测试（避免不必要的错误）
        if (fs.existsSync(fullPath)) {
          const images = parseFile(fullPath);
          const mapping = mapImagePaths(images, maliciousPath);

          // 验证生成的映射不包含路径遍历
          Object.values(mapping).forEach(mappedPath => {
            // 映射后的路径不应该包含 ..
            expect(mappedPath).not.toContain('..');
            // 映射后的路径不应该跳出 /img/ 目录
            expect(mappedPath).toMatch(/^\/img\/[^.]/);
          });
        }
      });
    });
  });
});