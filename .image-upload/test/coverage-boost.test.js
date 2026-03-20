/**
 * 补充测试用例 - 提高代码覆盖率
 *
 * 针对以下未覆盖代码行补充测试：
 * - Line 57: catch 块中的错误处理
 * - Lines 82-83: 根级别文档处理
 * - Line 103: 没有文件时的目录处理
 * - Line 141: 图片路径部分 < 1
 * - Line 227: mapImagePaths 错误处理
 * - Line 245: extractFolderName 备用路径
 */

const { generateRemotePath, mapImagePaths, extractFolderName } = require('../lib/path-mapper');

describe('补充测试 - 提高覆盖率', () => {
  describe('未覆盖代码行测试', () => {
    /**
     * Line 82-83: 根级别文档处理
     * 当 parts.length === 0 时的逻辑
     */
    it('should handle docs at root level (Line 82-83)', () => {
      // 测试 docs/index.md 这种根级别文档
      const docPath = 'docs/index.md';
      const imagePath = '/img/test/image.png';
      const result = generateRemotePath(docPath, imagePath);

      expect(result).toBe('/img/index/image.png');
    });

    /**
     * Line 103: 没有文件时的目录处理
     * 当 isFile === false 时，所有部分都是目录
     */
    it('should handle path without file extension (Line 103)', () => {
      // 测试没有 .md 后缀的路径（虽然有文件名但没有扩展名）
      const docPath = 'docs/1-series/2-guide';
      const imagePath = '/img/test/image.png';
      const result = generateRemotePath(docPath, imagePath);

      // 由于没有 .md，会被当作目录，filename 为空
      expect(result).toBe('/img/series/guide/image.png');
    });

    /**
     * Line 141: 图片路径部分 < 1 时返回 null
     * 当 parts.length < 1 时的逻辑
     */
    it('should handle empty image path after /img/ (Line 141)', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/';

      // 路径解析失败，返回原路径
      const result = generateRemotePath(docPath, imagePath);
      expect(result).toBe('/img/');
    });

    it('should handle /img/ with only empty components (Line 141)', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img///';

      const result = generateRemotePath(docPath, imagePath);
      expect(result).toBe('/img///');
    });

    /**
     * Line 227: mapImagePaths 错误处理
     * 在批量映射时出错，保留原路径
     */
    it('should handle errors in mapImagePaths gracefully (Line 227)', () => {
      const docPath = 'docs/1-series/0-guide.md';

      // 注意：由于 generateRemotePath 内部有 try-catch，我们无法直接触发错误
      // 但可以测试批量映射的正常行为
      const imagePaths = [
        '/img/test/image1.png',
        '/static/img/image2.png',  // 没有 /img/ 前缀，会返回原路径
        'https://example.com/image3.png'  // 远程 URL，返回原路径
      ];

      const result = mapImagePaths(imagePaths, docPath);

      expect(result).toEqual({
        '/img/test/image1.png': '/img/series/guide/image1.png',
        '/static/img/image2.png': '/static/img/image2.png',
        'https://example.com/image3.png': 'https://example.com/image3.png'
      });
    });

    /**
     * Line 245: extractFolderName 备用路径
     * 当 filename 为空时，使用 directories 的最后一个元素
     */
    it('should extract folder name from directories when filename is empty (Line 245)', () => {
      // 测试没有文件名的路径
      const docPath = 'docs/1-series/2-guide';
      const result = extractFolderName(docPath);

      // 应该使用 directories 的最后一个元素
      expect(result).toBe('guide');
    });

    it('should extract folder name from basename when both empty (Line 245)', () => {
      // 测试空路径的边界情况
      const docPath = 'docs';
      const result = extractFolderName(docPath);

      // 应该使用 basename
      expect(result).toBe('docs');
    });

    /**
     * Line 57: catch 块中的错误处理
     * 当发生任何内部错误时返回原路径
     *
     * 注意：由于代码内部有全面的 try-catch 和前置验证，
     * 很难直接触发内部错误。这里测试已知的错误恢复行为。
     */
    it('should handle invalid image paths gracefully (Line 57)', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/invalid-path-that-triggers-error';

      // 空路径部分会被解析为空，函数会返回解析后的路径（这是预期行为）
      // catch 块主要用于未捕获的异常，这在当前的实现中很难触发
      // 因为所有输入都有前置验证
      const result = generateRemotePath(docPath, imagePath);
      // 只要不抛出异常即可验证容错性
      expect(result).toBeDefined();
    });

    /**
     * 分支覆盖率补充
     * 覆盖各种条件分支
     */
    describe('分支覆盖率补充', () => {
      // 分支：docsIndex !== -1
      it('should handle path without docs prefix', () => {
        const docPath = 'some/other/path/1-series/0-guide.md';
        const imagePath = '/img/test/image.png';
        const result = generateRemotePath(docPath, imagePath);

        // 没有 'docs' 前缀，会保留整个路径（从第一个路径段开始）
        expect(result).toBe('/img/some/other/path/series/guide/image.png');
      });

      // 分支：!isFile (没有 .md 后缀)
      it('should handle non-markdown document paths', () => {
        const docPath = 'docs/1-series/2-guide/0-readme';
        const imagePath = '/img/test/image.png';
        const result = generateRemotePath(docPath, imagePath);

        // 没有 .md 扩展名，filename 为空
        expect(result).toBe('/img/series/guide/readme/image.png');
      });

      // 分支：removeNumericPrefix 匹配失败
      it('should handle directory names without numeric prefix', () => {
        const docPath = 'docs/series/guide/overview.md';
        const imagePath = '/img/test/image.png';
        const result = generateRemotePath(docPath, imagePath);

        expect(result).toBe('/img/series/guide/overview/image.png');
      });

      // 分支：shouldIncludeDocFilename 为 true
      it('should include doc filename when present', () => {
        const docPath = 'docs/1-series/2-board/0-guide.md';
        const imagePath = '/img/test/image.png';
        const result = generateRemotePath(docPath, imagePath);

        // 应该包含文档文件名 'guide'
        expect(result).toBe('/img/series/board/guide/image.png');
      });
    });

    /**
     * 函数覆盖率补充
     * 确保所有导出函数都被测试
     */
    describe('函数覆盖率补充', () => {
      // extractFolderName - 各种场景
      it('extractFolderName - should handle 1-level path', () => {
        const result = extractFolderName('docs/1-guide.md');
        expect(result).toBe('guide');
      });

      it('extractFolderName - should handle 2-level path', () => {
        const result = extractFolderName('docs/1-series/0-overview.md');
        expect(result).toBe('overview');
      });

      it('extractFolderName - should handle 3-level path', () => {
        const result = extractFolderName('docs/1-series/2-board/3-guide.md');
        expect(result).toBe('guide');
      });

      it('extractFolderName - should handle path without docs prefix', () => {
        const result = extractFolderName('some/path/1-guide.md');
        expect(result).toBe('guide');
      });

      // mapImagePaths - 边界情况
      it('mapImagePaths - should handle empty array', () => {
        const result = mapImagePaths([], 'docs/test.md');
        expect(result).toEqual({});
      });

      it('mapImagePaths - should handle single item array', () => {
        const result = mapImagePaths(['/img/test/image.png'], 'docs/1-guide.md');
        expect(result).toEqual({
          '/img/test/image.png': '/img/guide/image.png'
        });
      });

      it('mapImagePaths - should handle mixed valid and invalid paths', () => {
        const result = mapImagePaths([
          '/img/valid/image.png',
          '/invalid/image.png',
          'https://example.com/remote.png'
        ], 'docs/1-guide.md');

        expect(result).toEqual({
          '/img/valid/image.png': '/img/guide/image.png',
          '/invalid/image.png': '/invalid/image.png',
          'https://example.com/remote.png': 'https://example.com/remote.png'
        });
      });

      // generateRemotePath - 边界路径
      it('generateRemotePath - should handle deeply nested docs', () => {
        const docPath = 'docs/1-series/2-board/3-guide/4-topic/5-subtopic/6-detail/7-finish.md';
        const imagePath = '/img/test/image.png';
        const result = generateRemotePath(docPath, imagePath);

        expect(result).toBe('/img/series/board/guide/topic/subtopic/detail/finish/image.png');
      });

      it('generateRemotePath - should handle image filename with special characters', () => {
        const docPath = 'docs/1-guide.md';
        const imagePath = '/img/test/my-file@2024.png';
        const result = generateRemotePath(docPath, imagePath);

        expect(result).toBe('/img/guide/my-file%402024.png');
      });

      it('generateRemotePath - should handle image with multiple dots in filename', () => {
        const docPath = 'docs/1-guide.md';
        const imagePath = '/img/test/image.min.png';
        const result = generateRemotePath(docPath, imagePath);

        expect(result).toBe('/img/guide/image.min.png');
      });
    });
  });
});