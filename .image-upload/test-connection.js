// 测试代理配置的临时脚本
const axios = require('axios');
const https = require('https');

async function testConnection() {
  const configs = [
    { name: '直接连接（无代理）', proxy: false },
    { name: '使用本地代理', proxy: { host: '127.0.0.1', port: 17897 } },
    { name: '使用系统代理', proxy: undefined },  // axios 默认行为
  ];

  for (const config of configs) {
    console.log(`\n测试: ${config.name}`);
    try {
      const client = axios.create({
        baseURL: 'https://fsx.camthink.ai',
        timeout: 10000,
        proxy: config.proxy,
        httpsAgent: new https.Agent({
          rejectUnauthorized: true,
          keepAlive: true,
          minVersion: 'TLSv1.2',
        }),
      });

      const start = Date.now();
      await client.post('/api/login', {
        username: process.env.FILE_BROWSER_USERNAME || 'harry',
        password: process.env.FILE_BROWSER_PASSWORD || 'N0ep+$=WMkz%4vxV',
      });
      const duration = Date.now() - start;

      console.log(`✅ 成功！耗时: ${duration}ms`);
      console.log(`推荐配置: ${JSON.stringify(config)}`);
      return;
    } catch (error) {
      console.log(`❌ 失败: ${error.message}`);
      if (error.code) {
        console.log(`   错误代码: ${error.code}`);
      }
    }
  }
}

testConnection();
