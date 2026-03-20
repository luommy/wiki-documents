#!/usr/bin/env node

/**
 * 路径映射验证工具
 *
 * 验证路径映射算法的正确性
 *
 * 用法：
 *   node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series/0-overview.md
 *   node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series
 *   node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series --verbose
 */

const fs = require('fs');
const path = require('path');
const { generateRemotePath, mapImagePaths } = require('../lib/path-mapper');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

/**
 * 提取文档中的所有图片引用
 *
 * @param {string} content - 文档内容
 * @returns {string[]} 图片路径数组
 */
function extractImageReferences(content) {
  const images = new Set();

  // 移除代码块（避免匹配代码中的内容）
  const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

  // 匹配 Markdown 图片语法: ![alt](path)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownImageRegex.exec(contentWithoutCodeBlocks)) !== null) {
    const imagePath = match[2];
    // 只添加有效的图片路径（排除模板变量和无效路径）
    if (!imagePath.includes('${') && imagePath.length > 1 && imagePath !== '...') {
      images.add(imagePath);
    }
  }

  // 匹配 HTML img 标签: <img src="path" ...>
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlImageRegex.exec(contentWithoutCodeBlocks)) !== null) {
    images.add(match[1]);
  }

  // 匹配 ZoomableImage 组件: <ZoomableImage src="path" ...>
  const zoomableImageRegex = /<ZoomableImage[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = zoomableImageRegex.exec(contentWithoutCodeBlocks)) !== null) {
    images.add(match[1]);
  }

  return Array.from(images);
}

/**
 * 验证单个文档
 *
 * @param {string} docPath - 文档路径
 * @param {boolean} verbose - 是否输出详细信息
 * @returns {Object} 验证结果
 */
function verifyDocument(docPath, verbose = false) {
  const result = {
    passed: true,
    errors: [],
    imageCount: 0,
    mappedCount: 0,
    skippedCount: 0
  };

  try {
    // 读取文档内容
    const absolutePath = path.resolve(docPath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`文档不存在: ${docPath}`);
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');

    // 提取图片引用
    const images = extractImageReferences(content);
    result.imageCount = images.length;

    if (images.length === 0) {
      if (verbose) {
        console.log(`${colors.gray}  ⚠️  文档中未找到图片引用${colors.reset}`);
      }
      return result;
    }

    // 对每个图片进行验证
    const mapping = mapImagePaths(images, docPath);

    for (const [originalPath, mappedPath] of Object.entries(mapping)) {
      result.mappedCount++;

      const validation = validateMappedPath(mappedPath, originalPath);

      if (validation.valid) {
        if (validation.skipped) {
          result.skippedCount++;
          if (verbose) {
            console.log(`${colors.gray}  ⊘${colors.reset} ${originalPath}`);
            console.log(`${colors.gray}     → ${validation.reason}${colors.reset}`);
          }
        } else if (verbose) {
          console.log(`${colors.green}  ✅${colors.reset} ${originalPath}`);
          console.log(`${colors.gray}     → ${mappedPath}${colors.reset}`);
        }
      } else {
        result.passed = false;
        result.errors.push({
          originalPath,
          mappedPath,
          reason: validation.reason
        });

        if (verbose) {
          console.log(`${colors.red}  ❌${colors.reset} ${originalPath}`);
          console.log(`${colors.red}     → ${validation.reason}${colors.reset}`);
          if (mappedPath !== originalPath) {
            console.log(`${colors.gray}     实际映射: ${mappedPath}${colors.reset}`);
          }
        }
      }
    }
  } catch (error) {
    result.passed = false;
    result.errors.push({
      reason: error.message
    });
  }

  return result;
}

/**
 * 验证映射后的路径
 *
 * @param {string} mappedPath - 映射后的路径
 * @param {string} originalPath - 原始路径
 * @returns {Object} 验证结果 { valid: boolean, reason?: string }
 */
function validateMappedPath(mappedPath, originalPath) {
  // 跳过 base64 编码的图片
  if (originalPath.startsWith('data:image/')) {
    return {
      valid: true,
      skipped: true,
      reason: 'base64 编码的图片'
    };
  }

  // 如果是远程 URL，直接通过
  if (mappedPath.startsWith('http://') || mappedPath.startsWith('https://')) {
    return { valid: true };
  }

  // 检查是否以 /img/ 开头
  if (!mappedPath.startsWith('/img/')) {
    return {
      valid: false,
      reason: '映射后路径未以 /img/ 开头'
    };
  }

  // 计算路径深度
  const depth = mappedPath.split('/').filter(p => p.length > 0).length;

  // 检查路径深度是否合理 (2-7 层)
  if (depth < 2) {
    return {
      valid: false,
      reason: `映射后路径深度异常（预期 2-7 层，实际 ${depth} 层）`
    };
  }

  if (depth > 7) {
    return {
      valid: false,
      reason: `映射后路径深度异常（预期 2-7 层，实际 ${depth} 层）`
    };
  }

  // 检查文件名是否进行了 URL 编码
  const filename = path.basename(mappedPath);
  const originalFilename = path.basename(originalPath);

  // 如果原文件名包含特殊字符，应该被编码
  if (/[\u4e00-\u9fa5\s]/.test(originalFilename) && !/%[0-9A-F]{2}/.test(filename)) {
    return {
      valid: false,
      reason: '文件名中的特殊字符未进行 URL 编码'
    };
  }

  // 检查路径中是否包含 .. （路径遍历）
  if (mappedPath.includes('..')) {
    return {
      valid: false,
      reason: '映射后路径包含路径遍历字符 (..)'
    };
  }

  // 检查文件扩展名是否合理
  const ext = path.extname(filename);
  const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'];

  if (ext && !validExtensions.includes(ext.toLowerCase())) {
    return {
      valid: false,
      reason: `不支持的图片扩展名: ${ext}`
    };
  }

  return { valid: true };
}

/**
 * 验证目录中的所有文档
 *
 * @param {string} dirPath - 目录路径
 * @param {boolean} verbose - 是否输出详细信息
 * @returns {Object} 验证结果
 */
function verifyDirectory(dirPath, verbose = false) {
  const result = {
    totalDocs: 0,
    passedDocs: 0,
    failedDocs: 0,
    totalImages: 0,
    mappedImages: 0,
    skippedImages: 0,
    allErrors: []
  };

  const absolutePath = path.resolve(dirPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`目录不存在: ${dirPath}`);
  }

  // 查找所有 .md 文件
  function findMarkdownFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const markdownFiles = findMarkdownFiles(absolutePath);

  for (const file of markdownFiles) {
    const relativePath = path.relative(process.cwd(), file);
    const docResult = verifyDocument(relativePath, verbose);

    result.totalDocs++;
    result.totalImages += docResult.imageCount;
    result.mappedImages += docResult.mappedCount;
    result.skippedImages += docResult.skippedCount;

    if (docResult.passed) {
      result.passedDocs++;
      if (!verbose) {
        console.log(`${colors.green}✅${colors.reset} ${relativePath}`);
      }
    } else {
      result.failedDocs++;
      result.allErrors.push({
        docPath: relativePath,
        errors: docResult.errors
      });

      if (!verbose) {
        console.log(`${colors.red}❌${colors.reset} ${relativePath}`);
        for (const error of docResult.errors) {
          console.log(`${colors.gray}   - ${error.originalPath || ''}: ${error.reason}${colors.reset}`);
        }
      }
    }
  }

  return result;
}

/**
 * 打印摘要报告
 *
 * @param {Object} result - 验证结果
 * @param {string} target - 验证目标（文档或目录）
 */
function printSummary(result, target) {
  console.log('');
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}验证摘要${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`目标: ${target}`);

  if (result.totalDocs !== undefined) {
    // 目录验证结果
    console.log(`文档总数: ${result.totalDocs}`);
    console.log(`${colors.green}通过: ${result.passedDocs}${colors.reset}`);
    console.log(`${colors.red}失败: ${result.failedDocs}${colors.reset}`);
    console.log(`图片总数: ${result.totalImages}`);
    console.log(`已映射: ${result.mappedImages}`);
    console.log(`跳过: ${result.skippedImages}`);

    const passRate = result.totalDocs > 0
      ? ((result.passedDocs / result.totalDocs) * 100).toFixed(2)
      : 0;
    console.log(`通过率: ${passRate}%`);
  } else {
    // 单个文档验证结果
    console.log(`图片总数: ${result.imageCount}`);
    console.log(`已映射: ${result.mappedCount}`);
    console.log(`跳过: ${result.skippedCount}`);
  }

  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
}

/**
 * 打印使用帮助
 */
function printHelp() {
  console.log(`
路径映射验证工具

用法:
  node scripts/verify-path-mapping.js <文档或目录路径> [--verbose]

示例:
  # 验证单个文档
  node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series/0-overview.md

  # 验证整个目录
  node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series

  # 输出详细报告
  node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series --verbose

选项:
  --verbose, -v  输出详细的验证信息
  --help, -h     显示帮助信息
`);
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);

  // 检查帮助选项
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  // 检查参数
  if (args.length === 0) {
    console.error(`${colors.red}错误: 请指定文档或目录路径${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  // 解析选项
  const targetPath = args[0];
  const verbose = args.includes('--verbose') || args.includes('-v');

  // 获取相对路径（相对于项目根目录）
  let relativePath = targetPath;
  if (path.isAbsolute(targetPath)) {
    relativePath = path.relative(process.cwd(), targetPath);
  }

  try {
    // 检查是文件还是目录
    const absolutePath = path.resolve(relativePath);
    const stats = fs.statSync(absolutePath);

    if (stats.isFile()) {
      // 验证单个文档
      console.log(`验证文档: ${relativePath}`);
      console.log('');

      const result = verifyDocument(relativePath, verbose);

      if (!verbose && result.imageCount > 0) {
        console.log('');
        console.log(`图片总数: ${result.imageCount}`);
        console.log(`已映射: ${result.mappedCount}`);
        console.log(`跳过: ${result.skippedCount}`);
      }

      printSummary(result, relativePath);

      process.exit(result.passed ? 0 : 1);
    } else if (stats.isDirectory()) {
      // 验证目录
      console.log(`验证目录: ${relativePath}`);
      console.log('');

      const result = verifyDirectory(relativePath, verbose);

      printSummary(result, relativePath);

      process.exit(result.failedDocs === 0 ? 0 : 1);
    } else {
      console.error(`${colors.red}错误: 路径既不是文件也不是目录${colors.reset}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}错误: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// 运行主函数
main();