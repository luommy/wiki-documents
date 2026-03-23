#!/usr/bin/env node

/**
 * 上传结果验证工具
 *
 * 检查上传后的图片 URL 是否可访问
 *
 * 用法：
 *   node scripts/verify-uploads.js docs/1-neoedge-ng4500-series/0-overview.md
 *   node scripts/verify-uploads.js docs/1-neoedge-ng4500-series
 *   node scripts/verify-uploads.js docs/1-neoedge-ng4500-series --fix
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { generateRemotePath, mapImagePaths } = require('../lib/path-mapper');

// 加载配置
function loadConfig() {
  const configPath = path.join(__dirname, '..', '.upload-config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('配置文件不存在: .upload-config.json');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // 环境变量替换
  if (config.fileBrowser.username && config.fileBrowser.username.startsWith('${')) {
    const match = config.fileBrowser.username.match(/\${([^}]+)}/);
    if (!match) {
      throw new Error(`环境变量格式错误: ${config.fileBrowser.username}`);
    }
    const envVar = match[1];
    const envValue = process.env[envVar];
    if (!envValue) {
      throw new Error(`环境变量未设置: ${envVar}`);
    }
    config.fileBrowser.username = envValue;
  }
  if (config.fileBrowser.password && config.fileBrowser.password.startsWith('${')) {
    const match = config.fileBrowser.password.match(/\${([^}]+)}/);
    if (!match) {
      throw new Error(`环境变量格式错误: ${config.fileBrowser.password}`);
    }
    const envVar = match[1];
    const envValue = process.env[envVar];
    if (!envValue) {
      throw new Error(`环境变量未设置: ${envVar}`);
    }
    config.fileBrowser.password = envValue;
  }

  return config;
}

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
 * 发送 HTTP HEAD 请求
 *
 * @param {string} url - 要检查的 URL
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<Object>} 请求结果 { status, contentType, contentLength, error }
 */
async function checkUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const options = {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Wiki-Documents-Verifier/1.0)'
        },
        timeout
      };

      const req = protocol.request(url, options, (res) => {
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: res.headers['content-length'],
          error: null
        });
      });

      req.on('error', (error) => {
        resolve({
          status: null,
          contentType: null,
          contentLength: null,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: null,
          contentType: null,
          contentLength: null,
          error: 'timeout'
        });
      });

      req.end();
    } catch (error) {
      resolve({
        status: null,
        contentType: null,
        contentLength: null,
        error: error.message
      });
    }
  });
}

/**
 * 验证单个图片 URL
 *
 * @param {string} docPath - 文档路径
 * @param {string} originalPath - 原始图片路径
 * @param {string} baseUrl - 公共基础 URL
 * @param {number} timeout - 超时时间
 * @returns {Promise<Object>} 验证结果
 */
async function verifyImage(docPath, originalPath, baseUrl, timeout = 5000) {
  // 生成远程路径
  const remotePath = generateRemotePath(docPath, originalPath);

  // 跳过 base64 编码的图片
  if (originalPath.startsWith('data:image/')) {
    return {
      originalPath,
      remotePath: null,
      url: null,
      status: 'skipped',
      reason: 'base64 编码的图片'
    };
  }

  // 如果已经是远程 URL，直接检查
  if (originalPath.startsWith('http://') || originalPath.startsWith('https://')) {
    const result = await checkUrl(originalPath, timeout);
    return {
      originalPath,
      remotePath: originalPath,
      url: originalPath,
      status: result.status === 200 ? 'success' : 'failed',
      statusCode: result.status,
      contentType: result.contentType,
      contentLength: result.contentLength,
      error: result.error
    };
  }

  // 构建完整的 URL
  const fullUrl = `${baseUrl}${remotePath}`;

  // 检查 URL
  const result = await checkUrl(fullUrl, timeout);

  // 判断验证状态
  let status = 'failed';
  let reason = null;

  if (result.error === 'timeout') {
    status = 'timeout';
    reason = '请求超时';
  } else if (result.error) {
    status = 'error';
    reason = result.error;
  } else if (result.status === 200) {
    status = 'success';
  } else if (result.status === 404) {
    status = 'not_found';
    reason = '404 Not Found';
  } else {
    status = 'failed';
    reason = `${result.status} ${http.STATUS_CODES[result.status] || 'Unknown'}`;
  }

  return {
    originalPath,
    remotePath,
    url: fullUrl,
    status,
    statusCode: result.status,
    contentType: result.contentType,
    contentLength: result.contentLength,
    error: result.error,
    reason
  };
}

/**
 * 并发控制 - 限制同时执行的 Promise 数量
 *
 * @param {Array} items - 要处理的项目数组
 * @param {Function} asyncFn - 异步处理函数
 * @param {number} concurrency - 并发数量限制
 * @returns {Promise<Array>} 处理结果数组
 */
async function limitConcurrency(items, asyncFn, concurrency = 10) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const promise = asyncFn(item).then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

/**
 * 验证单个文档
 *
 * @param {string} docPath - 文档路径
 * @param {Object} config - 配置对象
 * @param {boolean} verbose - 是否输出详细信息
 * @returns {Promise<Object>} 验证结果
 */
async function verifyDocument(docPath, config, verbose = false) {
  const result = {
    docPath,
    total: 0,
    success: 0,
    failed: 0,
    not_found: 0,
    timeout: 0,
    error: 0,
    skipped: 0,
    images: []
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
    result.total = images.length;

    if (images.length === 0) {
      if (verbose) {
        console.log(`${colors.gray}  ⚠️  文档中未找到图片引用${colors.reset}`);
      }
      return result;
    }

    // 并发验证图片（限制并发数为 10）
    const verifyResults = await limitConcurrency(
      images,
      async (originalPath) => {
        return await verifyImage(
          docPath,
          originalPath,
          config.fileBrowser.publicBaseUrl
        );
      },
      10
    );

    // 收集结果并更新统计
    for (const verifyResult of verifyResults) {
      result.images.push(verifyResult);

      // 更新统计
      if (verifyResult.status === 'success') {
        result.success++;
      } else if (verifyResult.status === 'not_found') {
        result.not_found++;
      } else if (verifyResult.status === 'timeout') {
        result.timeout++;
      } else if (verifyResult.status === 'error') {
        result.error++;
      } else if (verifyResult.status === 'failed') {
        result.failed++;
      } else if (verifyResult.status === 'skipped') {
        result.skipped++;
      }

      // 输出详细信息
      if (verbose) {
        switch (verifyResult.status) {
          case 'success':
            console.log(`${colors.green}  ✅${colors.reset} ${verifyResult.originalPath}`);
            break;
          case 'not_found':
            console.log(`${colors.red}  ❌${colors.reset} ${verifyResult.originalPath}`);
            console.log(`${colors.red}     状态: 404 Not Found${colors.reset}`);
            break;
          case 'timeout':
            console.log(`${colors.yellow}  ⏱️ ${colors.reset} ${verifyResult.originalPath}`);
            console.log(`${colors.yellow}     状态: 请求超时${colors.reset}`);
            break;
          case 'error':
            console.log(`${colors.yellow}  ⚠️ ${colors.reset} ${verifyResult.originalPath}`);
            console.log(`${colors.yellow}     错误: ${verifyResult.reason}${colors.reset}`);
            break;
          case 'failed':
            console.log(`${colors.red}  ❌${colors.reset} ${verifyResult.originalPath}`);
            console.log(`${colors.red}     状态: ${verifyResult.reason}${colors.reset}`);
            break;
          case 'skipped':
            console.log(`${colors.gray}  ⊘${colors.reset} ${verifyResult.originalPath}`);
            console.log(`${colors.gray}     原因: ${verifyResult.reason}${colors.reset}`);
            break;
        }
      }
    }
  } catch (error) {
    console.error(`${colors.red}错误: ${error.message}${colors.reset}`);
    result.error++;
  }

  return result;
}

/**
 * 验证目录中的所有文档
 *
 * @param {string} dirPath - 目录路径
 * @param {Object} config - 配置对象
 * @param {boolean} verbose - 是否输出详细信息
 * @returns {Promise<Object>} 验证结果
 */
async function verifyDirectory(dirPath, config, verbose = false) {
  const result = {
    totalDocs: 0,
    totalImages: 0,
    success: 0,
    failed: 0,
    not_found: 0,
    timeout: 0,
    error: 0,
    skipped: 0,
    allImages: []
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

    console.log(`${colors.blue}验证文档: ${relativePath}${colors.reset}`);

    const docResult = await verifyDocument(relativePath, config, verbose);

    result.totalDocs++;
    result.totalImages += docResult.total;
    result.success += docResult.success;
    result.failed += docResult.failed;
    result.not_found += docResult.not_found;
    result.timeout += docResult.timeout;
    result.error += docResult.error;
    result.skipped += docResult.skipped;
    result.allImages.push(...docResult.images);
  }

  return result;
}

/**
 * 打印验证报告
 *
 * @param {Object} result - 验证结果
 * @param {string} target - 验证目标
 */
function printReport(result, target) {
  console.log('');
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}📊 验证结果${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`目标: ${target}`);
  console.log('');

  if (result.totalDocs !== undefined) {
    // 目录验证结果
    console.log(`文档总数: ${result.totalDocs}`);
  }

  console.log(`${colors.green}✅ 可访问: ${result.success}${colors.reset} 个`);
  console.log(`${colors.red}❌ 404 错误: ${result.not_found}${colors.reset} 个`);
  console.log(`${colors.red}❌ 其他失败: ${result.failed}${colors.reset} 个`);
  console.log(`${colors.yellow}⏱️  超时: ${result.timeout}${colors.reset} 个`);
  console.log(`${colors.yellow}⚠️  错误: ${result.error}${colors.reset} 个`);

  if (result.skipped > 0) {
    console.log(`${colors.gray}⊘ 跳过: ${result.skipped}${colors.reset} 个`);
  }

  console.log('');

  // 列出失败的图片
  const failedImages = result.images || result.allImages || [];
  const criticalFailures = failedImages.filter(
    img => img.status === 'not_found' || img.status === 'failed'
  );

  if (criticalFailures.length > 0) {
    console.log(`${colors.red}═══════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.red}❌ 失败的图片：${colors.reset}`);
    console.log(`${colors.red}═══════════════════════════════════════════════════${colors.reset}`);
    console.log('');

    criticalFailures.forEach((img, index) => {
      console.log(`${colors.red}${index + 1}. ${img.remotePath || img.originalPath}${colors.reset}`);
      if (img.docPath) {
        console.log(`${colors.gray}   文档: ${img.docPath}${colors.reset}`);
      }
      console.log(`${colors.red}   状态: ${img.reason || img.status}${colors.reset}`);
      console.log('');
    });
  }

  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
}

/**
 * 生成修复建议
 *
 * @param {Object} result - 验证结果
 * @param {string} target - 验证目标
 */
function generateFixSuggestions(result, target) {
  const failedImages = result.images || result.allImages || [];
  const criticalFailures = failedImages.filter(
    img => img.status === 'not_found' || img.status === 'failed'
  );

  if (criticalFailures.length === 0) {
    console.log(`${colors.green}💡 所有图片均可访问，无需修复${colors.reset}`);
    return;
  }

  console.log('');
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}💡 修复建议${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log('');
  console.log('检测到 ' + criticalFailures.length + ' 个无法访问的图片，可能的原因：');
  console.log('');
  console.log('1. 图片未上传到服务器');
  console.log('2. 文档路径映射不正确');
  console.log('3. 服务器配置问题');
  console.log('');
  console.log('解决方案：');
  console.log('');

  if (result.totalDocs !== undefined) {
    // 目录验证
    console.log(`运行以下命令重新上传所有文档：`);
    console.log(`  ${colors.blue}node scripts/upload-images.js ${target}${colors.reset}`);
  } else {
    // 单个文档验证
    console.log(`运行以下命令重新上传该文档的图片：`);
    console.log(`  ${colors.blue}node scripts/upload-images.js ${target}${colors.reset}`);
  }

  console.log('');
  console.log('如果问题仍然存在，请检查：');
  console.log('1. .upload-config.json 中的公共基础 URL 是否正确');
  console.log('2. File Browser 服务器是否正常运行');
  console.log('3. 图片文件是否存在于本地 docs 目录中');
  console.log('');
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
}

/**
 * 打印使用帮助
 */
function printHelp() {
  console.log(`
上传结果验证工具

用法:
  node scripts/verify-uploads.js <文档或目录路径> [--verbose] [--fix]

示例:
  # 验证单个文档
  node scripts/verify-uploads.js docs/1-neoedge-ng4500-series/0-overview.md

  # 验证整个目录
  node scripts/verify-uploads.js docs/1-neoedge-ng4500-series

  # 输出详细报告
  node scripts/verify-uploads.js docs/1-neoedge-ng4500-series --verbose

  # 生成修复建议
  node scripts/verify-uploads.js docs/1-neoedge-ng4500-series --fix

选项:
  --verbose, -v  输出详细的验证信息
  --fix          生成修复建议
  --help, -h     显示帮助信息

检查项:
  ✅ HTTP 状态码 200
  ✅ Content-Type 正确（image/png, image/jpeg 等）
  ✅ 文件大小 > 0
  ✅ URL 格式正确
`);
}

/**
 * 主函数
 */
async function main() {
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

  try {
    // 加载配置
    const config = loadConfig();

    // 解析选项
    const targetPath = args[0];
    const verbose = args.includes('--verbose') || args.includes('-v');
    const fix = args.includes('--fix');

    // 获取相对路径（相对于项目根目录）
    let relativePath = targetPath;
    if (path.isAbsolute(targetPath)) {
      relativePath = path.relative(process.cwd(), targetPath);
    }

    // 检查是文件还是目录
    const absolutePath = path.resolve(relativePath);
    const stats = fs.statSync(absolutePath);

    let result;
    if (stats.isFile()) {
      // 验证单个文档
      console.log(`${colors.blue}验证文档: ${relativePath}${colors.reset}`);
      console.log('');
      result = await verifyDocument(relativePath, config, verbose);
    } else if (stats.isDirectory()) {
      // 验证目录
      console.log(`${colors.blue}验证目录: ${relativePath}${colors.reset}`);
      console.log('');
      result = await verifyDirectory(relativePath, config, verbose);
    } else {
      console.error(`${colors.red}错误: 路径既不是文件也不是目录${colors.reset}`);
      process.exit(1);
    }

    // 打印报告
    printReport(result, relativePath);

    // 生成修复建议
    if (fix) {
      generateFixSuggestions(result, relativePath);
    }

    // 根据结果决定退出码
    const totalFailures = result.failed + result.not_found + result.error;
    process.exit(totalFailures === 0 ? 0 : 1);
  } catch (error) {
    console.error(`${colors.red}错误: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// 运行主函数
main();