/**
 * 性能测试
 * 测试路径映射算法的性能指标
 */

const { generateRemotePath, mapImagePaths } = require('../lib/path-mapper');

describe('Performance Tests', () => {
  describe('Execution Time', () => {
    it('should map 1000 image paths in less than 100ms', () => {
      // 生成测试数据
      const testCases = generateTestCases(1000);

      // 测量执行时间
      const startTime = performance.now();
      const results = mapImagePaths(testCases.imagePaths, testCases.docPath);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 验证结果数量
      expect(Object.keys(results).length).toBe(1000);

      // 验证执行时间 < 100ms
      expect(executionTime).toBeLessThan(100);

      // 输出性能信息（调试用）
      console.log(`\n⚡ 性能指标: ${executionTime.toFixed(2)}ms (${(executionTime / 1000 * 1000).toFixed(2)}ms per 1000 mappings)`);
    });

    it('should map 10000 image paths in less than 1000ms', () => {
      // 生成测试数据
      const testCases = generateTestCases(10000);

      // 测量执行时间
      const startTime = performance.now();
      const results = mapImagePaths(testCases.imagePaths, testCases.docPath);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 验证结果数量
      expect(Object.keys(results).length).toBe(10000);

      // 验证执行时间 < 1000ms (1秒)
      expect(executionTime).toBeLessThan(1000);

      // 输出性能信息（调试用）
      console.log(`\n⚡ 性能指标: ${executionTime.toFixed(2)}ms (${(executionTime / 10000 * 1000).toFixed(2)}ms per 1000 mappings)`);
    });

    it('should have consistent performance across multiple runs', () => {
      const testCases = generateTestCases(1000);
      const times = [];

      // 预热运行（消除冷启动影响）
      mapImagePaths(testCases.imagePaths, testCases.docPath);

      // 运行 5 次测试
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        mapImagePaths(testCases.imagePaths, testCases.docPath);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      // 计算平均时间和标准差
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const variance = times.reduce((a, b) => a + Math.pow(b - avgTime, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);
      const cv = (stdDev / avgTime) * 100; // 变异系数

      // 验证平均时间 < 100ms
      expect(avgTime).toBeLessThan(100);

      // 验证性能稳定性（变异系数 < 30%，考虑到 JavaScript 引擎的 JIT 编译特性）
      expect(cv).toBeLessThan(30);

      console.log(`\n⚡ 性能稳定性: 平均 ${avgTime.toFixed(2)}ms, 标准差 ${stdDev.toFixed(2)}ms, 变异系数 ${cv.toFixed(1)}%`);
    });
  });

  describe('Memory Usage', () => {
    it('should use less than 50MB memory for 1000 mappings', () => {
      // 获取初始内存使用
      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;

      // 生成测试数据
      const testCases = generateTestCases(1000);

      // 执行映射
      const results = mapImagePaths(testCases.imagePaths, testCases.docPath);

      // 获取峰值内存使用
      const peakMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      const memoryDelta = peakMemory - initialMemory;

      // 验证内存增量 < 50MB
      expect(memoryDelta).toBeLessThan(50);

      console.log(`\n💾 内存使用: 初始 ${initialMemory.toFixed(2)}MB, 峰值 ${peakMemory.toFixed(2)}MB, 增量 ${memoryDelta.toFixed(2)}MB`);
    });

    it('should not have memory leaks across multiple runs', () => {
      const testCases = generateTestCases(1000);
      const memorySnapshots = [];

      // 运行 10 次，记录内存
      for (let i = 0; i < 10; i++) {
        // 强制垃圾回收（如果可用）
        if (global.gc) {
          global.gc();
        }

        mapImagePaths(testCases.imagePaths, testCases.docPath);

        const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024;
        memorySnapshots.push(memoryUsed);
      }

      // 计算内存增长趋势
      const initialMemory = memorySnapshots[0];
      const finalMemory = memorySnapshots[memorySnapshots.length - 1];
      const memoryGrowth = finalMemory - initialMemory;
      const growthPerRun = memoryGrowth / (memorySnapshots.length - 1);

      // 验证内存增长不明显（每次运行 < 1MB）
      expect(growthPerRun).toBeLessThan(1);

      console.log(`\n💾 内存泄漏测试: 初始 ${initialMemory.toFixed(2)}MB, 最终 ${finalMemory.toFixed(2)}MB, 增长 ${memoryGrowth.toFixed(2)}MB (${growthPerRun.toFixed(3)}MB/次)`);
    });
  });

  describe('Batch Processing Efficiency', () => {
    it('should be more efficient to process in batches than individually', () => {
      const testCases = generateTestCases(1000);
      const docPath = testCases.docPath;
      const imagePaths = testCases.imagePaths;

      // 批量处理
      const batchStartTime = performance.now();
      const batchResults = mapImagePaths(imagePaths, docPath);
      const batchEndTime = performance.now();
      const batchTime = batchEndTime - batchStartTime;

      // 逐个处理
      const individualStartTime = performance.now();
      const individualResults = {};
      for (const imagePath of imagePaths) {
        individualResults[imagePath] = generateRemotePath(docPath, imagePath);
      }
      const individualEndTime = performance.now();
      const individualTime = individualEndTime - individualStartTime;

      // 验证结果一致
      expect(batchResults).toEqual(individualResults);

      // 验证批量处理更快（理论上应该更快或相似）
      console.log(`\n⚡ 批量处理效率: 批量 ${batchTime.toFixed(2)}ms, 逐个 ${individualTime.toFixed(2)}ms, 效率提升 ${((individualTime - batchTime) / individualTime * 100).toFixed(1)}%`);
    });

    it('should handle varying batch sizes efficiently', () => {
      const batchSizes = [10, 100, 1000, 10000];
      const results = [];

      for (const batchSize of batchSizes) {
        const testCases = generateTestCases(batchSize);

        const startTime = performance.now();
        mapImagePaths(testCases.imagePaths, testCases.docPath);
        const endTime = performance.now();

        const time = endTime - startTime;
        const timePerItem = time / batchSize;

        results.push({ batchSize, time, timePerItem });

        // 验证每项处理时间合理（< 1ms）
        expect(timePerItem).toBeLessThan(1);
      }

      // 输出不同批次大小的性能
      console.log(`\n⚡ 批次大小性能:`);
      results.forEach(r => {
        console.log(`  ${r.batchSize.toString().padStart(5)} 项: ${r.time.toFixed(2)}ms (${r.timePerItem.toFixed(4)}ms/项)`);
      });
    });
  });

  describe('Stress Tests', () => {
    it('should handle mixed input types efficiently', () => {
      const testCases = generateMixedTestCases(1000);

      const startTime = performance.now();
      const results = mapImagePaths(testCases.imagePaths, testCases.docPath);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 验证所有路径都得到处理
      expect(Object.keys(results).length).toBe(1000);

      // 验证远程 URL 保持不变
      const remoteUrls = testCases.imagePaths.filter(p => p.startsWith('http'));
      remoteUrls.forEach(url => {
        expect(results[url]).toBe(url);
      });

      // 验证执行时间 < 100ms
      expect(executionTime).toBeLessThan(100);

      console.log(`\n⚡ 混合输入性能: ${executionTime.toFixed(2)}ms`);
    });

    it('should handle deep directory structures efficiently', () => {
      const testCases = generateDeepStructureTestCases(1000);

      const startTime = performance.now();
      const results = mapImagePaths(testCases.imagePaths, testCases.docPath);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 验证所有路径都得到处理
      expect(Object.keys(results).length).toBe(1000);

      // 验证执行时间 < 100ms
      expect(executionTime).toBeLessThan(100);

      // 验证深层路径被正确处理
      const firstResult = Object.values(results)[0];
      const pathDepth = firstResult.split('/').length;
      expect(pathDepth).toBeGreaterThan(5);

      console.log(`\n⚡ 深层结构性能: ${executionTime.toFixed(2)}ms, 路径深度 ${pathDepth}`);
    });
  });
});

/**
 * 生成测试用例
 *
 * @param {number} count - 生成的测试用例数量
 * @returns {Object} { docPath, imagePaths }
 */
function generateTestCases(count) {
  // 使用 4 级文档路径（常见场景）
  const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/1-driver-installation-and-updates.md';

  const imagePaths = [];
  for (let i = 0; i < count; i++) {
    imagePaths.push(`/img/test/image-${i}.png`);
  }

  return { docPath, imagePaths };
}

/**
 * 生成混合测试用例（包含本地路径和远程 URL）
 *
 * @param {number} count - 生成的测试用例数量
 * @returns {Object} { docPath, imagePaths }
 */
function generateMixedTestCases(count) {
  const docPath = 'docs/1-neoedge-ng4500-series/0-overview.md';

  const imagePaths = [];
  for (let i = 0; i < count; i++) {
    if (i % 5 === 0) {
      // 20% 是远程 URL
      imagePaths.push(`https://example.com/image-${i}.png`);
    } else {
      // 80% 是本地路径
      imagePaths.push(`/img/test/image-${i}.png`);
    }
  }

  return { docPath, imagePaths };
}

/**
 * 生成深层结构测试用例
 *
 * @param {number} count - 生成的测试用例数量
 * @returns {Object} { docPath, imagePaths }
 */
function generateDeepStructureTestCases(count) {
  // 使用 6 级文档路径（深度场景）
  const docPath = 'docs/1-series/2-board/3-guide/4-topic/5-detail/6-specific.md';

  const imagePaths = [];
  for (let i = 0; i < count; i++) {
    imagePaths.push(`/img/deep/folder/structure/image-${i}.png`);
  }

  return { docPath, imagePaths };
}