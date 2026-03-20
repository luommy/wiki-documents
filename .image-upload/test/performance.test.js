/**
 * 性能测试
 * 测试路径映射算法的性能指标
 */

const { mapImagePaths } = require('../lib/path-mapper');

describe('Performance Tests', () => {
  it('should map 1000 image paths in less than 100ms', () => {
    // 生成测试数据
    const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/1-driver-installation-and-updates.md';
    const imagePaths = Array.from({ length: 1000 }, (_, i) => `/img/test/image-${i}.png`);

    // 测量执行时间
    const startTime = performance.now();
    const results = mapImagePaths(imagePaths, docPath);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // 验证结果数量
    expect(Object.keys(results).length).toBe(1000);

    // 验证执行时间 < 100ms
    expect(executionTime).toBeLessThan(100);
  });

  it('should use less than 50MB memory for 1000 mappings', () => {
    // 获取初始内存使用
    const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;

    // 生成测试数据
    const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/1-driver-installation-and-updates.md';
    const imagePaths = Array.from({ length: 1000 }, (_, i) => `/img/test/image-${i}.png`);

    // 执行映射
    const results = mapImagePaths(imagePaths, docPath);

    // 获取峰值内存使用
    const peakMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    const memoryDelta = peakMemory - initialMemory;

    // 验证内存增量 < 50MB
    expect(memoryDelta).toBeLessThan(50);
  });
});