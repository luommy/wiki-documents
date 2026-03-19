#!/usr/bin/env node

const FileBrowserAPI = require('../lib/api-client');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 配置
const config = {
  baseUrl: process.env.FILE_BROWSER_URL || 'https://fsx.camthink.ai',
  username: process.env.FILE_BROWSER_USERNAME || 'harry',
  password: process.env.FILE_BROWSER_PASSWORD,
};

if (!config.password) {
  console.error('❌ 错误: 未设置 FILE_BROWSER_PASSWORD 环境变量');
  console.error('请创建 .image-upload/.env 文件并设置: FILE_BROWSER_PASSWORD=your_password');
  process.exit(1);
}

const api = new FileBrowserAPI(config);

async function testAPI() {
  console.log('=== File Browser API 验证测试 ===\n');

  try {
    // 测试 1: 登录
    console.log('1. 测试登录...');
    const token = await api.login();
    console.log(`✓ 登录成功,Token 长度: ${token.length}\n`);

    // 测试 2 & 3: 上传文件到新文件夹(会自动创建)
    console.log('2. 测试上传文件到新文件夹...');
    const testFolder = '/wiki/img/test-' + Date.now();
    const testImagePath = path.join(__dirname, '../test/fixtures/sample.png');
    const remotePath = `${testFolder}/sample.png`;

    console.log(`  本地文件: ${testImagePath}`);
    console.log(`  远程路径: ${remotePath}`);

    const imageBuffer = await fs.readFile(testImagePath);
    console.log(`  文件大小: ${imageBuffer.length} bytes`);

    try {
      await api.uploadFile(remotePath, imageBuffer);
      console.log(`✓ 文件上传成功,文件夹自动创建: ${testFolder}\n`);
    } catch (error) {
      console.error('✗ 上传失败详情:');
      console.error('  错误消息:', error.message);
      if (error.response) {
        console.error('  HTTP 状态:', error.response.status);
        console.error('  响应数据:', error.response.data);
      }
      throw error;
    }

    // 测试 3: 检查文件存在
    console.log('3. 测试检查文件...');
    const exists = await api.fileExists(remotePath);
    console.log(`✓ 文件存在检查: ${exists}\n`);

    // 测试 4: 验证公开访问 URL
    console.log('4. 验证公开访问 URL...');
    const publicUrl = `https://resources.camthink.ai${remotePath}`;
    console.log(`公开 URL: ${publicUrl}`);
    console.log('请在浏览器中验证该 URL 是否可访问\n');

    console.log('=== 所有测试通过 ===');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI();