/**
 * 性能测试
 * 测试路径映射算法的性能指标
 */

const { mapImagePaths } = require('../lib/path-mapper');

/**
 * 强制垃圾回收（如果可用）
 * 用于测试前清理内存，确保测量准确性
 */
function forceGC() {
  if (global.gc) {
    global.gc();
  }
}

/**
 * 生成测试数据
 * @param {number} count - 图片数量
 * @returns {{docPath: string, imagePaths: string[]}} 测试数据
 */
function generateTestData(count) {
  return {
    docPath: 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/1-driver-installation-and-updates.md',
    imagePaths: Array.from({ length: count }, (_, i) => `/img/test/image-${i}.png`)
  };
}

describe('Performance Tests', () => {
  it('should map 1000 image paths in less than 100ms (average of 5 runs)', () => {
    const { docPath, imagePaths } = generateTestData(1000);
    const runs = 5;
    const times = [];

    // 多次运行取平均值
    for (let i = 0; i < runs; i++) {
      const startTime = performance.now();
      const results = mapImagePaths(imagePaths, docPath);
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 验证结果数量
      expect(Object.keys(results).length).toBe(1000);

      times.push(executionTime);
    }

    // 计算平均执行时间
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;

    // 验证平均执行时间 < 100ms
    expect(avgTime).toBeLessThan(100);
  });

  it('should use less than 50MB memory for 1000 mappings', () => {
    // 清理内存，确保测量准确性
    forceGC();

    const { docPath, imagePaths } = generateTestData(1000);

    // 获取初始内存使用
    const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    // 执行映射
    const results = mapImagePaths(imagePaths, docPath);

    // 再次清理内存，释放临时对象
    forceGC();

    // 获取峰值内存使用
    const peakMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    const memoryDelta = peakMemory - initialMemory;

    // 验证内存增量 < 50MB
    expect(memoryDelta).toBeLessThan(50);
  });
});