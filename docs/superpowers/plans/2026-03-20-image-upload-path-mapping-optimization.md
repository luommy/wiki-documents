# 图片上传路径映射优化实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化图片上传路径映射实现，确保所有图片上传到正确位置，提供完善的测试、工具和文档支持。

**Architecture:** 保留现有的基于文档层级的路径映射算法，补充测试覆盖，开发验证和调试工具，更新文档，清理旧文件并重新上传。

**Tech Stack:** Node.js, Jest, File Browser API, Markdown

---

## 文件结构

### 新增文件
- `.image-upload/test/e2e-test.js` - 端到端测试
- `.image-upload/test/edge-cases.test.js` - 边界情况测试
- `.image-upload/test/performance.test.js` - 性能测试
- `.image-upload/scripts/verify-path-mapping.js` - 路径映射验证工具
- `.image-upload/scripts/verify-uploads.js` - 上传结果验证工具
- `.image-upload/scripts/cleanup-old-uploads.js` - 清理工具
- `.image-upload/docs/path-mapping-algorithm.md` - 算法文档
- `.image-upload/docs/migration-guide.md` - 迁移指南

### 修改文件
- `.image-upload/scripts/upload-images.js` - 增强调试模式
- `.image-upload/README.md` - 更新文档

### 删除文件
- `.image-upload/lib/path-mapper.js.backup` - 旧版本代码

---

## Chunk 1: 测试补充（阶段 1）

### Task 1.1: 端到端测试

**Files:**
- Create: `.image-upload/test/e2e-test.js`
- Test: `.image-upload/test/e2e-test.js`

- [ ] **Step 1: 编写端到端测试的测试框架**

创建 `.image-upload/test/e2e-test.js`:

```javascript
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
```

- [ ] **Step 2: 运行端到端测试**

```bash
cd .image-upload
npm test -- test/e2e-test.js
```

Expected: PASS

- [ ] **Step 3: 提交端到端测试**

```bash
git add .image-upload/test/e2e-test.js
git commit -m "test: 添加端到端测试覆盖完整上传流程"
```

### Task 1.2: 边界情况测试

**Files:**
- Create: `.image-upload/test/edge-cases.test.js`
- Test: `.image-upload/test/edge-cases.test.js`

- [ ] **Step 1: 编写边界情况测试**

创建 `.image-upload/test/edge-cases.test.js`:

```javascript
/**
 * 边界情况测试
 */

const { generateRemotePath } = require('../lib/path-mapper');

describe('Edge Cases', () => {
  describe('超长路径', () => {
    it('should handle paths longer than 200 characters', () => {
      const longPath = 'docs/1-series/2-board/3-module/4-component/5-feature/6-implementation/7-details/8-advanced/9-expert/0-guide.md';
      const imagePath = '/img/test/image.png';

      const result = generateRemotePath(longPath, imagePath);

      expect(result.length).toBeLessThan(300);
      expect(result).toContain('series');
      expect(result).toContain('guide');
    });
  });

  describe('特殊字符', () => {
    it('should handle emoji in filename', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test/📷-screenshot.png';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('%F0%9F%93%B7');
    });

    it('should handle special symbols in filename', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test/image@2x.png';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('image%402x.png');
    });
  });

  describe('重复文件名', () => {
    it('should handle same filename from different paths', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath1 = '/img/folder1/image.png';
      const imagePath2 = '/img/folder2/image.png';

      const result1 = generateRemotePath(docPath, imagePath1);
      const result2 = generateRemotePath(docPath, imagePath2);

      // 两个不同的图片路径映射到相同位置（因为只保留文件名）
      expect(result1).toBe(result2);
      expect(result1).toBe('/img/series/guide/image.png');
    });
  });

  describe('空文档', () => {
    it('should handle document with no images', () => {
      const docPath = 'docs/1-series/0-empty.md';
      const images = [];

      // 应该返回空映射
      const { mapImagePaths } = require('../lib/path-mapper');
      const mapping = mapImagePaths(images, docPath);

      expect(Object.keys(mapping).length).toBe(0);
    });
  });

  describe('混合引用', () => {
    it('should handle mix of local and remote images', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const localImage = '/img/test/local.png';
      const remoteImage = 'https://example.com/remote.png';

      const result1 = generateRemotePath(docPath, localImage);
      const result2 = generateRemotePath(docPath, remoteImage);

      expect(result1).toBe('/img/series/guide/local.png');
      expect(result2).toBe(remoteImage);
    });
  });

  describe('极端边界情况', () => {
    it('should handle deeply nested paths (10+ levels)', () => {
      const docPath = 'docs/1-a/2-b/3-c/4-d/5-e/6-f/7-g/8-h/9-i/0-j.md';
      const imagePath = '/img/test.png';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('a');
      expect(result).toContain('j');
    });

    it('should handle filename with multiple dots', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test.image.v2.png';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('test.image.v2.png');
    });

    it('should handle uppercase extensions', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test.PNG';

      const result = generateRemotePath(docPath, imagePath);

      expect(result).toContain('test.PNG');
    });
  });
});
```

- [ ] **Step 2: 运行边界情况测试**

```bash
cd .image-upload
npm test -- test/edge-cases.test.js
```

Expected: PASS

- [ ] **Step 3: 提交边界情况测试**

```bash
git add .image-upload/test/edge-cases.test.js
git commit -m "test: 添加边界情况测试覆盖特殊场景"
```

### Task 1.3: 性能测试

**Files:**
- Create: `.image-upload/test/performance.test.js`
- Test: `.image-upload/test/performance.test.js`

- [ ] **Step 1: 编写性能测试**

创建 `.image-upload/test/performance.test.js`:

```javascript
/**
 * 性能测试
 */

const { generateRemotePath } = require('../lib/path-mapper');

describe('Performance', () => {
  describe('批量路径映射性能', () => {
    it('should map 1000 images in less than 100ms', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePaths = [];

      // 生成 1000 个图片路径
      for (let i = 0; i < 1000; i++) {
        imagePaths.push(`/img/test/image-${i}.png`);
      }

      const startTime = Date.now();

      imagePaths.forEach(imagePath => {
        generateRemotePath(docPath, imagePath);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`    1000 次路径映射耗时: ${duration}ms`);
      expect(duration).toBeLessThan(100);
    });

    it('should handle large number of unique paths efficiently', () => {
      const docPaths = [];
      const imagePaths = [];

      // 生成 100 个不同的文档路径
      for (let i = 0; i < 100; i++) {
        docPaths.push(`docs/1-series-${i}/0-guide.md`);
        imagePaths.push(`/img/test/image-${i}.png`);
      }

      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        generateRemotePath(docPaths[i], imagePaths[i]);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`    100 次不同路径映射耗时: ${duration}ms`);
      expect(duration).toBeLessThan(50);
    });
  });

  describe('内存使用', () => {
    it('should not leak memory during repeated operations', () => {
      const docPath = 'docs/1-series/0-guide.md';
      const imagePath = '/img/test/image.png';

      // 获取初始内存使用
      const initialMemory = process.memoryUsage().heapUsed;

      // 执行 10000 次操作
      for (let i = 0; i < 10000; i++) {
        generateRemotePath(docPath, imagePath);
      }

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }

      // 获取最终内存使用
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      console.log(`    内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);

      // 内存增长应该小于 10MB
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});
```

- [ ] **Step 2: 运行性能测试**

```bash
cd .image-upload
npm test -- test/performance.test.js
```

Expected: PASS

- [ ] **Step 3: 提交性能测试**

```bash
git add .image-upload/test/performance.test.js
git commit -m "test: 添加性能测试确保映射效率"
```

### Task 1.4: 运行所有测试

- [ ] **Step 1: 运行完整测试套件**

```bash
cd .image-upload
npm test
```

Expected: All tests PASS

- [ ] **Step 2: 检查测试覆盖率**

```bash
cd .image-upload
npm test -- --coverage
```

Expected:
- 行覆盖率 ≥ 90%
- 分支覆盖率 ≥ 85%
- 函数覆盖率 100%

- [ ] **Step 3: 提交测试覆盖率报告**

```bash
git add .image-upload/coverage/
git commit -m "test: 更新测试覆盖率报告"
```

---

## Chunk 2: 工具开发（阶段 2）

### Task 2.1: 路径映射验证工具

**Files:**
- Create: `.image-upload/scripts/verify-path-mapping.js`

- [ ] **Step 1: 编写验证工具框架**

创建 `.image-upload/scripts/verify-path-mapping.js`:

```javascript
#!/usr/bin/env node

/**
 * 路径映射验证工具
 * 验证路径映射算法的正确性
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');

const { parseFile } = require('../lib/markdown-parser');
const { mapImagePaths } = require('../lib/path-mapper');

program
  .name('verify-path-mapping')
  .description('验证路径映射的正确性')
  .argument('<input>', 'Markdown 文件或目录路径')
  .option('-v, --verbose', '显示详细信息', false)
  .parse(process.argv);

const options = program.opts();
const inputPath = program.args[0];

// 验证输入路径
if (!fs.existsSync(inputPath)) {
  console.error(chalk.red(`错误: 路径不存在: ${inputPath}`));
  process.exit(1);
}

// 查找所有 Markdown 文件
function findMarkdownFiles(input) {
  const stat = fs.statSync(input);

  if (stat.isFile()) {
    return [input];
  }

  if (stat.isDirectory()) {
    const pattern = path.join(input, '**/*.md');
    return glob.sync(pattern, { nodir: true });
  }

  return [];
}

const files = findMarkdownFiles(inputPath);

if (files.length === 0) {
  console.log(chalk.yellow('未找到任何 Markdown 文件'));
  process.exit(0);
}

console.log(chalk.bold.blue('\n🔍 路径映射验证工具\n'));
console.log(chalk.gray(`扫描 ${files.length} 个文件...\n`));

let totalImages = 0;
let successCount = 0;
let errorCount = 0;

files.forEach(file => {
  try {
    const images = parseFile(file);

    if (images.length === 0) {
      if (options.verbose) {
        console.log(chalk.gray(`  ${file} (无图片)`));
      }
      return;
    }

    const mapping = mapImagePaths(images, file);

    console.log(chalk.green(`✅ ${file}`));

    images.forEach(img => {
      const mapped = mapping[img];

      if (mapped && mapped !== img) {
        console.log(chalk.gray(`    - ${img}`));
        console.log(chalk.cyan(`      → ${mapped}`));
        successCount++;
      } else if (mapped === img) {
        console.log(chalk.gray(`    - ${img} (未映射)`));
        successCount++;
      } else {
        console.log(chalk.red(`    - ${img}`));
        console.log(chalk.red(`      ❌ 映射失败`));
        errorCount++;
      }

      totalImages++;
    });
  } catch (error) {
    console.log(chalk.red(`❌ ${file}`));
    console.log(chalk.red(`  错误: ${error.message}`));
    errorCount++;
  }
});

console.log(chalk.bold('\n📊 统计结果:\n'));
console.log(chalk.gray(`  总图片数: ${totalImages}`));
console.log(chalk.green(`  成功映射: ${successCount}`));

if (errorCount > 0) {
  console.log(chalk.red(`  映射失败: ${errorCount}`));
  process.exit(1);
}

console.log(chalk.bold.green('\n✅ 所有路径映射正确\n'));
```

- [ ] **Step 2: 测试验证工具**

```bash
cd .image-upload
chmod +x scripts/verify-path-mapping.js
node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series/0-overview.md --verbose
```

Expected: 输出正确的路径映射结果

- [ ] **Step 3: 提交验证工具**

```bash
git add .image-upload/scripts/verify-path-mapping.js
git commit -m "feat: 添加路径映射验证工具"
```

### Task 2.2: 上传结果验证工具

**Files:**
- Create: `.image-upload/scripts/verify-uploads.js`

- [ ] **Step 1: 编写上传验证工具**

创建 `.image-upload/scripts/verify-uploads.js`:

```javascript
#!/usr/bin/env node

/**
 * 上传结果验证工具
 * 检查上传后的图片 URL 是否可访问
 */

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');
const axios = require('axios');

const { parseFile } = require('../lib/markdown-parser');

program
  .name('verify-uploads')
  .description('验证上传后的图片 URL 是否可访问')
  .argument('<input>', 'Markdown 文件或目录路径')
  .option('--fix', '生成修复建议', false)
  .parse(process.argv);

const options = program.opts();
const inputPath = program.args[0];

// 验证输入路径
if (!fs.existsSync(inputPath)) {
  console.error(chalk.red(`错误: 路径不存在: ${inputPath}`));
  process.exit(1);
}

// 查找所有 Markdown 文件
function findMarkdownFiles(input) {
  const stat = fs.statSync(input);

  if (stat.isFile()) {
    return [input];
  }

  if (stat.isDirectory()) {
    const pattern = path.join(input, '**/*.md');
    return glob.sync(pattern, { nodir: true });
  }

  return [];
}

const files = findMarkdownFiles(inputPath);

console.log(chalk.bold.blue('\n🔍 上传结果验证工具\n'));
console.log(chalk.gray(`扫描 ${files.length} 个文件...\n`));

// 提取所有图片 URL
const allImages = new Set();

files.forEach(file => {
  const images = parseFile(file);
  images.forEach(img => {
    // 只检查远程 URL
    if (img.startsWith('https://')) {
      allImages.add(img);
    }
  });
});

if (allImages.size === 0) {
  console.log(chalk.yellow('未找到任何远程图片 URL'));
  process.exit(0);
}

console.log(chalk.gray(`检查 ${allImages.size} 个图片 URL...\n`));

// 检查 URL 可访问性
async function checkUrl(url) {
  try {
    const response = await axios.head(url, {
      timeout: 5000,
      validateStatus: (status) => status === 200
    });

    return {
      url,
      status: response.status,
      contentType: response.headers['content-type'],
      accessible: true
    };
  } catch (error) {
    return {
      url,
      status: error.response?.status || 'N/A',
      error: error.message,
      accessible: false
    };
  }
}

(async () => {
  const results = {
    accessible: [],
    failed: [],
    timeout: []
  };

  for (const url of allImages) {
    process.stdout.write(chalk.gray(`检查: ${url} ... `));

    const result = await checkUrl(url);

    if (result.accessible) {
      console.log(chalk.green('✅'));
      results.accessible.push(url);
    } else {
      console.log(chalk.red('❌'));
      results.failed.push(result);
    }
  }

  // 输出统计结果
  console.log(chalk.bold('\n📊 验证结果:\n'));
  console.log(chalk.green(`  ✅ 可访问: ${results.accessible.length} 个`));

  if (results.failed.length > 0) {
    console.log(chalk.red(`  ❌ 失败: ${results.failed.length} 个`));

    if (options.fix) {
      console.log(chalk.bold.yellow('\n💡 修复建议:\n'));
      results.failed.forEach((result, index) => {
        console.log(chalk.yellow(`${index + 1}. ${result.url}`));
        console.log(chalk.gray(`   状态: ${result.status}`));
        console.log(chalk.gray(`   建议: 重新上传该图片`));
        console.log();
      });
    }

    process.exit(1);
  }

  console.log(chalk.bold.green('\n✅ 所有图片 URL 可访问\n'));
})();
```

- [ ] **Step 2: 测试上传验证工具**

```bash
cd .image-upload
chmod +x scripts/verify-uploads.js
node scripts/verify-uploads.js docs/1-neoedge-ng4500-series/0-overview.md
```

Expected: 输出图片 URL 可访问性检查结果

- [ ] **Step 3: 提交上传验证工具**

```bash
git add .image-upload/scripts/verify-uploads.js
git commit -m "feat: 添加上传结果验证工具"
```

### Task 2.3: 清理工具

**Files:**
- Create: `.image-upload/scripts/cleanup-old-uploads.js`

- [ ] **Step 1: 编写清理工具**

创建 `.image-upload/scripts/cleanup-old-uploads.js`:

```javascript
#!/usr/bin/env node

/**
 * 清理工具
 * 清理 File Browser 中的旧文件
 */

const { program } = require('commander');
const chalk = require('chalk');
const dotenv = require('dotenv');

const FileBrowserAPI = require('../lib/api-client');

dotenv.config();

program
  .name('cleanup-old-uploads')
  .description('清理 File Browser 中的旧图片文件')
  .option('--dry-run', '预览模式，不实际删除', false)
  .option('--confirm', '确认执行删除', false)
  .parse(process.argv);

const options = program.opts();

if (!options.dryRun && !options.confirm) {
  console.error(chalk.red('错误: 必须指定 --dry-run 或 --confirm'));
  process.exit(1);
}

(async () => {
  console.log(chalk.bold.blue('\n🗑️  清理工具\n'));

  // 加载配置
  const config = {
    baseUrl: process.env.FILE_BROWSER_BASE_URL || 'https://fsx.camthink.ai',
    username: process.env.FILE_BROWSER_USERNAME,
    password: process.env.FILE_BROWSER_PASSWORD
  };

  if (!config.username || !config.password) {
    console.error(chalk.red('错误: 未配置 File Browser 凭据'));
    process.exit(1);
  }

  // 初始化 API 客户端
  const api = new FileBrowserAPI(config);

  console.log(chalk.gray('登录 File Browser...'));
  await api.login();
  console.log(chalk.green('✓ 登录成功\n'));

  // 列出 /img/ 目录下的所有文件
  console.log(chalk.gray('扫描 /img/ 目录...'));

  try {
    const items = await api.listFolder('/img');

    console.log(chalk.gray(`找到 ${items.length} 个项目\n`));

    if (options.dryRun) {
      console.log(chalk.bold.yellow('📋 预览模式 - 以下文件将被删除:\n'));

      items.forEach((item, index) => {
        console.log(chalk.gray(`${index + 1}. ${item.name} (${item.type})`));
      });

      console.log(chalk.bold.yellow(`\n共计 ${items.length} 个项目`));
      console.log(chalk.gray('\n使用 --confirm 执行实际删除'));
    } else {
      console.log(chalk.bold.red('⚠️  警告: 即将删除所有文件！\n'));
      console.log(chalk.yellow('这将删除 /img/ 目录下的所有文件。'));
      console.log(chalk.yellow('建议先使用 --dry-run 预览。\n'));

      // 实际删除逻辑（需要用户确认）
      console.log(chalk.gray('删除功能需要手动确认后才能执行'));
      console.log(chalk.gray('请在 File Browser 中手动删除 /img/ 目录'));
    }
  } catch (error) {
    console.error(chalk.red(`错误: ${error.message}`));
    process.exit(1);
  }
})();
```

- [ ] **Step 2: 测试清理工具**

```bash
cd .image-upload
chmod +x scripts/cleanup-old-uploads.js
node scripts/cleanup-old-uploads.js --dry-run
```

Expected: 输出预览信息

- [ ] **Step 3: 提交清理工具**

```bash
git add .image-upload/scripts/cleanup-old-uploads.js
git commit -m "feat: 添加清理工具用于删除旧文件"
```

### Task 2.4: 增强调试模式

**Files:**
- Modify: `.image-upload/scripts/upload-images.js`

- [ ] **Step 1: 添加调试模式代码**

在 `.image-upload/scripts/upload-images.js` 中添加调试模式：

找到第 296 行附近（在"开始上传图片"之前），添加：

```javascript
// 调试模式：显示详细的路径映射过程
if (options.debug) {
  console.log(chalk.bold.cyan('\n📝 路径映射详情:\n'));

  for (const file of files) {
    const images = fileImages.get(file) || [];
    const localImgs = filterLocalImages(images);

    if (localImgs.length === 0) continue;

    console.log(chalk.bold(`文档: ${file}`));

    // 提取文档层级
    const docHierarchy = extractDocHierarchy(file);
    console.log(chalk.gray(`  层级: [${docHierarchy.directories.map(d => `'${d}'`).join(', ')}]`));
    if (docHierarchy.filename) {
      console.log(chalk.gray(`  文件名: '${docHierarchy.filename}'`));
    }

    console.log();

    localImgs.forEach(img => {
      const mapped = pathMapping[img];
      const imgParts = img.split('/');
      const filename = imgParts[imgParts.length - 1];

      console.log(chalk.cyan(`  图片: ${img}`));
      console.log(chalk.gray(`    文件名: ${filename}`));
      console.log(chalk.gray(`    映射: ${mapped}`));
      console.log();
    });
  }
}
```

在第 12 行添加导入：

```javascript
const { extractDocHierarchy } = require('../lib/path-mapper');
```

在第 168 行添加 `--debug` 选项：

```javascript
.option('--debug', '调试模式：显示详细的路径映射过程', false)
```

- [ ] **Step 2: 测试调试模式**

```bash
cd .image-upload
node scripts/upload-images.js docs/1-neoedge-ng4500-series/0-overview.md --debug --dry-run
```

Expected: 输出详细的路径映射过程

- [ ] **Step 3: 提交调试模式增强**

```bash
git add .image-upload/scripts/upload-images.js
git commit -m "feat: 增强 upload-images.js 的调试模式"
```

---

## Chunk 3: 文档更新（阶段 3）

### Task 3.1: 更新 README

**Files:**
- Modify: `.image-upload/README.md`

- [ ] **Step 1: 添加路径映射章节到 README**

在 `.image-upload/README.md` 末尾添加新章节：

```markdown
## 路径映射算法

### 工作原理

路径映射基于文档的完整层级结构生成图片 URL：

```
文档路径 → 提取层级 → 添加图片文件名 → 生成远程路径
```

### 示例

| 文档路径 | 图片原路径 | 映射后路径 |
|---------|-----------|-----------|
| docs/1-series/0-overview.md | /img/test.png | /img/series/overview/test.png |
| docs/1-series/2-board/0-guide.md | /img/board.png | /img/series/board/guide/board.png |
| docs/1-series/2-board/1-driver/0-wifi.md | /img/wifi.png | /img/series/board/driver/wifi/wifi.png |

### 路径规则

- ✅ 保留完整文档层级
- ✅ 移除数字前缀
- ✅ 移除图片原始路径的文件夹
- ✅ 只保留图片文件名

## 故障排查

### 图片 404 错误

如果遇到图片 404 错误，按以下步骤排查：

1. **验证路径映射**
   ```bash
   node scripts/verify-path-mapping.js <doc-path> --verbose
   ```

2. **检查图片 URL 可访问性**
   ```bash
   node scripts/verify-uploads.js <doc-path>
   ```

3. **重新上传**
   ```bash
   node scripts/upload-images.js <doc-path> --force --no-cache
   ```

### 调试模式

使用 `--debug` 选项查看详细的路径映射过程：

```bash
node scripts/upload-images.js <doc-path> --debug --dry-run
```

## 验证工具

### 路径映射验证

验证路径映射的正确性：

```bash
# 验证单个文档
node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series/0-overview.md

# 验证整个目录
node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series

# 详细输出
node scripts/verify-path-mapping.js docs/1-neoedge-ng4500-series --verbose
```

### 上传结果验证

检查上传后的图片 URL 是否可访问：

```bash
# 验证单个文档
node scripts/verify-uploads.js docs/1-neoedge-ng4500-series/0-overview.md

# 验证整个目录
node scripts/verify-uploads.js docs/1-neoedge-ng4500-series

# 生成修复建议
node scripts/verify-uploads.js docs/1-neoedge-ng4500-series --fix
```

## 清理工具

清理 File Browser 中的旧文件：

```bash
# 预览将要删除的文件
node scripts/cleanup-old-uploads.js --dry-run

# 执行清理
node scripts/cleanup-old-uploads.js --confirm
```
```

- [ ] **Step 2: 提交 README 更新**

```bash
git add .image-upload/README.md
git commit -m "docs: 更新 README 添加路径映射说明和工具使用指南"
```

### Task 3.2: 创建算法文档

**Files:**
- Create: `.image-upload/docs/path-mapping-algorithm.md`

- [ ] **Step 1: 编写算法文档**

创建 `.image-upload/docs/path-mapping-algorithm.md`:

```markdown
# 路径映射算法详解

## 概述

路径映射算法根据文档的完整层级结构生成图片 URL，确保图片位置与文档结构一致。

## 算法流程

### 1. 提取文档层级

**输入**：
```
docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/0-docker.md
```

**处理步骤**：
1. 移除 `docs` 前缀
2. 移除数字前缀（`1-`, `2-` 等）
3. 提取文件名（不含 `.md` 后缀）

**输出**：
```javascript
{
  directories: ['neoedge-ng4500-series', 'ng4500-cb01-development-board', 'software-guide'],
  filename: 'docker'
}
```

### 2. 提取图片文件名

**输入**：
```
/img/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png
```

**处理步骤**：
1. 验证以 `/img/` 开头
2. 提取文件名
3. URL 编码（如果包含特殊字符）

**输出**：
```javascript
{
  filename: 'NG45XX_GPIO.png'
}
```

### 3. 构建远程路径

**组合规则**：
```
/img/ + directories.join('/') + '/' + filename + '/' + image_filename
```

**输出**：
```
/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/docker/NG45XX_GPIO.png
```

## 边界情况处理

| 情况 | 输入 | 输出 | 说明 |
|------|------|------|------|
| 远程 URL | `https://example.com/img.png` | 原样返回 | 不处理远程图片 |
| 非 /img/ 路径 | `/static/img/test.png` | 原样返回 | 只处理 `/img/` 开头 |
| 根文档 | `docs/overview.md` | `/img/overview/...` | 使用文件名作为层级 |
| 中文文件名 | `/img/测试.png` | `/img/.../%E6%B5%8B%E8%AF%95.png` | URL 编码 |
| Windows 路径 | `docs\\test.md` | 自动转换分隔符 | 跨平台兼容 |

## 安全检查

算法在处理前进行以下安全检查：

1. **空值检查**：确保 `docPath` 和 `imagePath` 都存在
2. **类型检查**：确保参数都是字符串
3. **路径遍历检测**：拒绝包含 `..` 的路径
4. **错误处理**：发生错误时返回原路径

## 代码实现

核心函数位于 `.image-upload/lib/path-mapper.js`：

- `generateRemotePath(docPath, imagePath)` - 主函数
- `extractDocHierarchy(docPath)` - 提取文档层级
- `extractImageComponents(imagePath)` - 提取图片组件
- `buildRemotePath(docHierarchy, imageComponents)` - 构建远程路径

## 测试覆盖

- **单元测试**：`.image-upload/test/path-mapper.test.js`
- **集成测试**：`.image-upload/test/integration-test.js`
- **端到端测试**：`.image-upload/test/e2e-test.js`
- **边界情况测试**：`.image-upload/test/edge-cases.test.js`

覆盖率：行 ≥ 90%，分支 ≥ 85%，函数 100%
```

- [ ] **Step 2: 提交算法文档**

```bash
git add .image-upload/docs/path-mapping-algorithm.md
git commit -m "docs: 创建路径映射算法文档"
```

### Task 3.3: 创建迁移指南

**Files:**
- Create: `.image-upload/docs/migration-guide.md`

- [ ] **Step 1: 编写迁移指南**

创建 `.image-upload/docs/migration-guide.md`:

```markdown
# 迁移指南：从旧版本升级

## 背景

新版本使用基于文档完整层级的路径映射，不再使用图片原始路径的文件夹。

### 主要变化

**旧版本**：
```
文档: docs/1-series/2-board/0-guide.md
图片: /img/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png
映射: /img/series/board/Driver/NG45XX_GPIO.png  ❌
      （保留了图片原始路径的 Driver 文件夹）
```

**新版本**：
```
文档: docs/1-series/2-board/0-guide.md
图片: /img/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png
映射: /img/series/board/guide/NG45XX_GPIO.png  ✅
      （只保留图片文件名）
```

## 迁移步骤

### 1. 备份现有文件

在 File Browser 中导出 `/img/` 目录：

1. 登录 File Browser: https://fsx.camthink.ai
2. 导航到 `/img/` 目录
3. 选择所有文件
4. 点击"下载"按钮
5. 保存备份文件

### 2. 清理旧文件

```bash
cd .image-upload

# 预览将要删除的文件
node scripts/cleanup-old-uploads.js --dry-run

# 确认无误后，执行清理
node scripts/cleanup-old-uploads.js --confirm
```

### 3. 重新上传所有图片

```bash
# 上传单个目录
node scripts/upload-images.js docs/1-neoedge-ng4500-series

# 上传所有文档
node scripts/upload-images.js docs/
```

### 4. 验证

```bash
# 验证所有图片可访问
node scripts/verify-uploads.js docs/

# 验证路径映射正确性
node scripts/verify-path-mapping.js docs/ --verbose
```

## 预期影响

### 文档变化

- ✅ 文档中的图片链接会自动更新
- ✅ 所有链接指向新的 URL

### URL 变化

- ❌ 旧的图片 URL 会失效
- ✅ 新的 URL 更符合文档结构

### 用户影响

- ⚠️ 用户需要清理浏览器缓存才能看到新图片
- ⚠️ 服务会短暂中断（预计 30 分钟）

## 回滚方案

如果出现问题：

1. 从备份恢复 File Browser 的 `/img/` 目录
2. 运行 `git revert` 回滚代码更改
3. 重新运行旧版本的上传脚本

## 故障排查

### 图片 404 错误

```bash
# 1. 检查图片 URL
node scripts/verify-uploads.js <doc-path>

# 2. 重新上传单个文档
node scripts/upload-images.js <doc-path> --force

# 3. 查看详细日志
node scripts/upload-images.js <doc-path> --debug
```

### 路径映射错误

```bash
# 验证路径映射
node scripts/verify-path-mapping.js <doc-path> --verbose

# 如果发现错误，请提交 issue
```

## 时间安排

建议在低峰时段（如凌晨）进行迁移：

- 00:00 - 开始备份
- 00:15 - 清理旧文件
- 00:20 - 开始上传
- 00:50 - 验证完成
- 01:00 - 服务恢复

## 支持和反馈

如有问题，请联系开发团队或在 GitHub 提交 issue。
```

- [ ] **Step 2: 提交迁移指南**

```bash
git add .image-upload/docs/migration-guide.md
git commit -m "docs: 创建迁移指南文档"
```

---

## Chunk 4: 清理和迁移（阶段 4）

### Task 4.1: 删除旧版本代码

**Files:**
- Delete: `.image-upload/lib/path-mapper.js.backup`

- [ ] **Step 1: 删除备份文件**

```bash
cd .image-upload
rm lib/path-mapper.js.backup
```

- [ ] **Step 2: 提交删除**

```bash
git add .image-upload/lib/path-mapper.js.backup
git commit -m "chore: 删除旧版本的 path-mapper 备份文件"
```

### Task 4.2: 执行迁移

**注意：此任务需要在低峰时段执行，预计耗时 30-60 分钟**

- [ ] **Step 1: 通知用户服务中断**

发送通知：
```
标题：Wiki 图片服务维护通知

内容：
我们将于 2026-03-21 凌晨 00:00-01:00 进行图片服务维护。
在此期间，Wiki 网站可能无法正常显示图片。
维护完成后，所有图片将迁移到新的 URL 结构。
如有疑问，请联系开发团队。
```

- [ ] **Step 2: 备份 File Browser**

```bash
# 登录 File Browser Web 界面
# 导出 /img/ 目录
# 保存备份文件
```

- [ ] **Step 3: 清理旧文件**

```bash
cd .image-upload
node scripts/cleanup-old-uploads.js --confirm
```

Expected: 删除所有旧图片

- [ ] **Step 4: 重新上传所有图片**

```bash
cd .image-upload
node scripts/upload-images.js docs/ --force --no-cache
```

Expected: 所有图片上传成功

- [ ] **Step 5: 验证上传结果**

```bash
cd .image-upload
node scripts/verify-uploads.js docs/
```

Expected: 所有图片 URL 返回 200

- [ ] **Step 6: 验证路径映射**

```bash
cd .image-upload
node scripts/verify-path-mapping.js docs/
```

Expected: 所有路径映射正确

- [ ] **Step 7: 提交迁移完成**

```bash
git add -A
git commit -m "chore: 完成图片路径映射优化迁移

- 删除旧版本代码
- 清理 File Browser 旧文件
- 重新上传所有图片
- 验证所有图片可访问
- 所有测试通过"
```

---

## 完成检查清单

### 测试覆盖
- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] 所有端到端测试通过
- [ ] 所有边界情况测试通过
- [ ] 所有性能测试通过
- [ ] 测试覆盖率 ≥ 90%

### 工具开发
- [ ] `verify-path-mapping.js` 可正常运行
- [ ] `verify-uploads.js` 可正常运行
- [ ] `cleanup-old-uploads.js` 可正常运行
- [ ] `upload-images.js` 调试模式正常

### 文档更新
- [ ] README 更新完整
- [ ] 算法文档清晰
- [ ] 迁移指南可操作

### 迁移完成
- [ ] 旧版本代码已删除
- [ ] File Browser 已清理
- [ ] 所有图片已重新上传
- [ ] 所有图片 URL 可访问
- [ ] 无 404 错误

### 验收标准
- [ ] 所有测试通过
- [ ] 工具正常运行
- [ ] 文档完整清晰
- [ ] 图片全部可访问
- [ ] 服务稳定运行

---

## 变更历史

| 日期 | 版本 | 作者 | 变更说明 |
|------|------|------|----------|
| 2026-03-20 | 1.0 | Claude Code | 初始计划 |