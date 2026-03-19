#!/usr/bin/env node

/**
 * Wiki 图片上传 CLI 工具
 *
 * 功能:
 * - 扫描 Markdown 文件中的本地图片引用
 * - 自动上传图片到 File Browser
 * - 替换 Markdown 中的图片链接为远程 URL
 *
 * 用法:
 *   node upload-images.js <file|directory> [options]
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const glob = require('glob');
const dotenv = require('dotenv');

// 导入核心库
const ImageUploader = require('../lib/image-uploader');
const { extractImages, parseFile } = require('../lib/markdown-parser');
const LinkReplacer = require('../lib/link-replacer');
const { mapImagePaths } = require('../lib/path-mapper');
const { syncToCounterpart, getLanguageCounterpart } = require('../lib/language-sync');

// 加载环境变量
dotenv.config();

/**
 * 加载配置文件
 * @param {string} configPath - 配置文件路径
 * @returns {Object} 配置对象
 */
function loadConfig(configPath) {
  const defaultConfigPath = path.join(__dirname, '..', '.upload-config.json');
  const finalPath = configPath || defaultConfigPath;

  if (!fs.existsSync(finalPath)) {
    throw new Error(`配置文件不存在: ${finalPath}`);
  }

  const config = JSON.parse(fs.readFileSync(finalPath, 'utf-8'));

  // 递归替换环境变量
  function replaceEnvVars(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // 匹配 ${VAR_NAME} 格式
        if (obj[key].startsWith('${') && obj[key].endsWith('}')) {
          const envVar = obj[key].match(/\$\{(.+)\}/)?.[1];
          if (envVar) {
            const value = process.env[envVar];
            if (!value) {
              throw new Error(`环境变量 ${envVar} 未设置`);
            }
            obj[key] = value;
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        replaceEnvVars(obj[key]);
      }
    }
  }

  replaceEnvVars(config);

  return config;
}

/**
 * 查找所有 Markdown 文件
 * @param {string} inputPath - 输入路径(文件或目录)
 * @param {Object} config - 配置对象
 * @returns {string[]} Markdown 文件路径数组
 */
function findMarkdownFiles(inputPath, config) {
  const stat = fs.statSync(inputPath);

  if (stat.isFile()) {
    // 单个文件
    const ext = path.extname(inputPath).toLowerCase();
    if (config.markdown.fileExtensions.includes(ext)) {
      return [inputPath];
    } else {
      console.warn(chalk.yellow(`警告: 文件 ${inputPath} 不是 Markdown 文件`));
      return [];
    }
  }

  if (stat.isDirectory()) {
    // 目录: 递归查找所有 Markdown 文件
    const patterns = config.markdown.fileExtensions.map(ext =>
      path.join(inputPath, '**', `*${ext}`)
    );

    const files = [];
    for (const pattern of patterns) {
      const matches = glob.sync(pattern, { nodir: true });
      files.push(...matches);
    }

    return [...new Set(files)]; // 去重
  }

  return [];
}

/**
 * 提取所有图片引用
 * @param {string[]} files - Markdown 文件路径数组
 * @returns {Object} { allImages: string[], fileImages: Map<filePath, images[]> }
 */
function extractAllImages(files) {
  const allImages = new Set();
  const fileImages = new Map();

  for (const file of files) {
    try {
      const images = parseFile(file);
      fileImages.set(file, images);
      images.forEach(img => allImages.add(img));
    } catch (error) {
      console.warn(chalk.yellow(`警告: 解析文件 ${file} 失败: ${error.message}`));
    }
  }

  return {
    allImages: Array.from(allImages),
    fileImages
  };
}

/**
 * 过滤需要上传的图片(本地图片以 /img/ 开头)
 * @param {string[]} images - 图片路径数组
 * @returns {string[]} 需要上传的图片路径
 */
function filterLocalImages(images) {
  return images.filter(img => img.startsWith('/img/'));
}

/**
 * 主函数
 */
async function main() {
  // 解析命令行参数
  program
    .name('upload-images')
    .description('Wiki 图片自动上传工具')
    .version('1.0.0')
    .argument('<input>', 'Markdown 文件或目录路径')
    .option('-c, --config <path>', '配置文件路径')
    .option('--dry-run', '仅扫描和预览,不上传或修改文件', false)
    .option('--force', '强制上传所有图片(忽略缓存)', false)
    .option('--no-cache', '禁用缓存')  // 移除默认值,让 Commander 自动处理
    .option('--static-dir <path>', 'static 目录路径(默认为自动检测)')
    .parse(process.argv);

  const options = program.opts();
  const inputPath = program.args[0];

  console.log(chalk.bold.blue('\n🚀 Wiki 图片上传工具\n'));

  // 验证输入路径
  if (!inputPath || !fs.existsSync(inputPath)) {
    console.error(chalk.red(`错误: 输入路径不存在或未指定: ${inputPath || 'N/A'}`));
    process.exit(1);
  }

  try {
    // 1. 加载配置
    console.log(chalk.gray('→ 加载配置...'));
    const config = loadConfig(options.config);
    console.log(chalk.green('✓ 配置加载成功'));

    // 2. 检测 static 目录
    let staticDir = options.staticDir;
    if (!staticDir) {
      // 自动检测: 向上查找 static 目录
      let currentDir = path.resolve(inputPath);
      while (currentDir !== path.dirname(currentDir)) {
        const testPath = path.join(currentDir, 'static');
        if (fs.existsSync(testPath)) {
          staticDir = testPath;
          break;
        }
        currentDir = path.dirname(currentDir);
      }
    }

    if (!staticDir || !fs.existsSync(staticDir)) {
      console.error(chalk.red('错误: 未找到 static 目录,请使用 --static-dir 指定'));
      process.exit(1);
    }

    console.log(chalk.gray(`→ static 目录: ${staticDir}`));

    // 3. 查找 Markdown 文件
    console.log(chalk.gray('→ 扫描 Markdown 文件...'));
    const files = findMarkdownFiles(inputPath, config);

    if (files.length === 0) {
      console.log(chalk.yellow('⚠ 未找到任何 Markdown 文件'));
      process.exit(0);
    }

    console.log(chalk.green(`✓ 找到 ${files.length} 个 Markdown 文件`));

    // 4. 提取图片引用
    console.log(chalk.gray('→ 提取图片引用...'));
    const { allImages, fileImages } = extractAllImages(files);
    const localImages = filterLocalImages(allImages);

    console.log(chalk.gray(`  - 总图片引用: ${allImages.length}`));
    console.log(chalk.gray(`  - 本地图片: ${localImages.length}`));

    if (localImages.length === 0) {
      console.log(chalk.yellow('\n⚠ 未找到需要上传的本地图片'));
      process.exit(0);
    }

    // 5. Dry run 模式: 仅显示预览
    if (options.dryRun) {
      console.log(chalk.bold.cyan('\n📋 Dry Run 模式 - 预览\n'));

      // 生成路径映射预览
      const pathMapping = {};
      for (const file of files) {
        const images = fileImages.get(file) || [];
        const localImgs = filterLocalImages(images);
        const fileMapping = mapImagePaths(localImgs, file);
        Object.assign(pathMapping, fileMapping);
      }

      console.log(chalk.bold('将处理的文件:'));
      files.forEach(file => {
        const images = fileImages.get(file) || [];
        const localImgs = filterLocalImages(images);
        if (localImgs.length > 0) {
          console.log(chalk.gray(`  ${file}`));
          localImgs.forEach(img => {
            const mapped = pathMapping[img];
            if (mapped && mapped !== img) {
              console.log(chalk.gray(`    - ${img} → ${mapped}`));
            } else {
              console.log(chalk.gray(`    - ${img}`));
            }
          });
        }
      });

      console.log(chalk.bold('\n将上传的图片:'));
      localImages.forEach(img => {
        const mapped = pathMapping[img];
        if (mapped && mapped !== img) {
          console.log(chalk.cyan(`  ${img}`));
          console.log(chalk.gray(`    → ${mapped}`));
        } else {
          console.log(chalk.gray(`  ${img}`));
        }
      });

      console.log(chalk.bold.cyan('\n✓ Dry run 完成(未做任何修改)\n'));
      process.exit(0);
    }

    // 6. 初始化上传器
    console.log(chalk.gray('\n→ 初始化上传器...'));
    const uploader = new ImageUploader(config);

    // 禁用缓存
    if (!options.cache) {
      uploader.clearCache();
      console.log(chalk.gray('  缓存已禁用'));
    }

    await uploader.initialize();
    console.log(chalk.green('✓ 上传器初始化成功'));

    // 7. 上传图片
    console.log(chalk.bold.cyan('\n📤 开始上传图片\n'));

    // 生成路径映射（基于文档名）
    const pathMapping = {};
    for (const file of files) {
      const images = fileImages.get(file) || [];
      const fileMapping = mapImagePaths(images, file);
      Object.assign(pathMapping, fileMapping);
    }

    // 显示路径映射（如果有变化）
    const hasMapping = Object.keys(pathMapping).some(key => pathMapping[key] !== key);
    if (hasMapping) {
      console.log(chalk.gray('→ 检测到智能路径映射:'));
      for (const [local, mapped] of Object.entries(pathMapping)) {
        if (local !== mapped) {
          console.log(chalk.gray(`  ${local} → ${mapped}`));
        }
      }
      console.log('');
    }

    const uploadSpinner = ora('上传中...').start();
    const uploadResults = await uploader.uploadImages(
      localImages,
      staticDir,
      options.force,
      pathMapping  // 传递路径映射
    );
    uploadSpinner.stop();

    // 显示上传统计
    const stats = uploader.getStats();
    console.log(chalk.bold('\n📊 上传统计:'));
    console.log(chalk.green(`  ✓ 成功上传: ${stats.uploaded}`));
    console.log(chalk.gray(`  - 跳过(缓存): ${stats.skipped}`));
    if (stats.failed > 0) {
      console.log(chalk.red(`  ✗ 失败: ${stats.failed}`));
      stats.errors.forEach(err => {
        console.log(chalk.red(`    - ${err.file}: ${err.error}`));
      });
    }

    // 8. 替换 Markdown 文件中的链接
    console.log(chalk.bold.cyan('\n🔄 替换图片链接\n'));

    const replacer = new LinkReplacer();
    let updatedFiles = 0;
    const allMappings = {}; // 收集所有映射用于同步

    for (const [file, images] of fileImages.entries()) {
      const localImgs = filterLocalImages(images);

      if (localImgs.length === 0) {
        continue;
      }

      // 构建映射表
      const mapping = {};
      localImgs.forEach(img => {
        if (uploadResults[img]) {
          mapping[img] = uploadResults[img];
          allMappings[img] = uploadResults[img]; // 收集映射
        }
      });

      if (Object.keys(mapping).length === 0) {
        continue;
      }

      // 读取文件内容
      const content = fs.readFileSync(file, 'utf-8');

      // 替换链接
      const newContent = replacer.replaceLinks(content, mapping);

      // 写回文件
      fs.writeFileSync(file, newContent, 'utf-8');
      updatedFiles++;

      console.log(chalk.gray(`  ✓ ${file} (${localImgs.length} 个图片)`));
    }

    // 9. 同步到对应语言版本
    console.log(chalk.bold.cyan('\n🌐 同步到对应语言版本\n'));

    const syncedFiles = [];
    const failedSyncs = [];

    for (const file of files) {
      const result = syncToCounterpart(file, allMappings);

      if (result.success) {
        if (result.updated > 0) {
          console.log(chalk.green(`  ✓ ${result.counterpart} (${result.updated} 个链接)`));
          console.log(chalk.gray(`    方向: ${result.language}`));
          syncedFiles.push(result.counterpart);
        } else {
          console.log(chalk.gray(`  - ${result.counterpart} (无需更新)`));
        }
      } else if (result.counterpart) {
        console.log(chalk.yellow(`  ⚠ ${result.counterpart}`));
        console.log(chalk.yellow(`    ${result.error}`));
        failedSyncs.push(result);
      }
    }

    // 10. 完成总结
    console.log(chalk.bold.green('\n✨ 处理完成!\n'));
    console.log(chalk.gray(`  - 处理文件: ${files.length}`));
    console.log(chalk.gray(`  - 更新文件: ${updatedFiles}`));
    console.log(chalk.gray(`  - 上传图片: ${stats.uploaded}`));
    console.log(chalk.gray(`  - 跳过图片: ${stats.skipped}`));

    if (syncedFiles.length > 0) {
      console.log(chalk.green(`  - 同步文件: ${syncedFiles.length}`));
    }

    if (stats.failed > 0) {
      console.log(chalk.red(`  - 失败图片: ${stats.failed}`));
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red(`\n❌ 错误: ${error.message}\n`));
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主函数
main();
