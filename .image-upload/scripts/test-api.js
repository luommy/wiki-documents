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

    // 测试 2: 创建测试文件夹
    console.log('2. 测试创建文件夹...');
    const testFolder = '/wiki/img/test-api';
    try {
      await api.createFolder(testFolder);
      console.log(`✓ 文件夹创建成功: ${testFolder}\n`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`✓ 文件夹已存在: ${testFolder}\n`);
      } else {
        throw error;
      }
    }

    // 测试 3: 上传文件
    console.log('3. 测试上传文件...');
    const testImagePath = path.join(__dirname, '../test/fixtures/sample.png');
    const remotePath = `${testFolder}/sample.png`;

    const imageBuffer = await fs.readFile(testImagePath);
    await api.uploadFile(remotePath, imageBuffer);
    console.log(`✓ 文件上传成功: ${remotePath}\n`);

    // 测试 4: 检查文件存在
    console.log('4. 测试检查文件...');
    const exists = await api.fileExists(remotePath);
    console.log(`✓ 文件存在检查: ${exists}\n`);

    // 测试 5: 验证公开访问 URL
    console.log('5. 验证公开访问 URL...');
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