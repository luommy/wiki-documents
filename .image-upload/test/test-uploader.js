/**
 * ImageUploader 测试脚本
 */

const path = require('path');
const ImageUploader = require('../lib/image-uploader');
const fs = require('fs');

// 加载配置
const configPath = path.join(__dirname, '../.upload-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// 替换环境变量
if (config.fileBrowser.password.startsWith('${')) {
  const envVar = config.fileBrowser.password.match(/\$\{(.+)\}/)[1];
  config.fileBrowser.password = process.env[envVar];

  if (!config.fileBrowser.password) {
    console.error(`错误: 环境变量 ${envVar} 未设置`);
    process.exit(1);
  }
}

async function testUploader() {
  console.log('=== ImageUploader 测试 ===\n');

  const uploader = new ImageUploader(config);

  try {
    // 1. 初始化
    console.log('1. 初始化上传器...');
    await uploader.initialize();
    console.log('   ✓ 登录成功\n');

    // 2. 测试缓存功能
    console.log('2. 测试缓存功能...');
    const testHash = uploader.calculateHash(__filename);
    console.log(`   ✓ Hash 计算: ${testHash.substring(0, 16)}...`);

    uploader.loadCache();
    console.log(`   ✓ 缓存加载: ${uploader.cache.size} 条记录`);

    uploader.saveCache();
    console.log('   ✓ 缓存保存成功\n');

    // 3. 测试统计功能
    console.log('3. 测试统计功能...');
    const stats = uploader.getStats();
    console.log('   当前统计:', stats);

    uploader.resetStats();
    console.log('   ✓ 统计重置成功\n');

    // 4. 测试 URL 构建
    console.log('4. 测试 URL 构建...');
    const testRemotePath = '/wiki/img/test/example.png';
    const publicUrl = uploader.buildPublicUrl(testRemotePath);
    console.log(`   远程路径: ${testRemotePath}`);
    console.log(`   公共 URL: ${publicUrl}\n`);

    // 5. 测试单文件上传(如果有测试图片)
    const testImagePath = '/img/test-upload.png';
    const staticDir = path.join(__dirname, '../../static');

    if (fs.existsSync(path.join(staticDir, testImagePath))) {
      console.log('5. 测试单文件上传...');
      const remoteUrl = await uploader.uploadImage(testImagePath, staticDir, false);
      console.log(`   ✓ 上传成功: ${remoteUrl}`);

      const newStats = uploader.getStats();
      console.log('   统计:', newStats);
    } else {
      console.log('5. 跳过上传测试(测试图片不存在)');
    }

    console.log('\n=== 测试完成 ===');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
testUploader();
