/**
 * 测试 3 级文档的路径映射
 */

const { generateRemotePath } = require('../lib/path-mapper');

console.log('🧪 3 级文档路径映射测试\n');
console.log('=' .repeat(80));

// 测试文档
const docPath = 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/0-dev-guide.md';

console.log(`\n文档路径: ${docPath}`);
console.log(`文档层级: 3 级 (neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide)`);
console.log('-'.repeat(80));

// 测试图片
const testImages = [
  {
    original: '/img/Board/NG4500-CB01_1.png',
    description: '主板正面'
  },
  {
    original: '/img/Board/NG4500-CB01_2.png',
    description: '主板背面'
  }
];

console.log('\n测试结果:\n');

testImages.forEach((img, index) => {
  const result = generateRemotePath(docPath, img.original);

  console.log(`图片 ${index + 1}: ${img.description}`);
  console.log(`  原始路径: ${img.original}`);
  console.log(`  生成路径: ${result}`);
  console.log('');

  // 验证路径结构
  const expected = '/img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/Board/NG4500-CB01_' + (index + 1) + '.png';
  if (result === expected) {
    console.log(`  ✅ 路径正确`);
  } else {
    console.log(`  ❌ 路径不匹配`);
    console.log(`  预期路径: ${expected}`);
  }
  console.log('');
});

console.log('='.repeat(80));
console.log('\n✅ 测试完成\n');
