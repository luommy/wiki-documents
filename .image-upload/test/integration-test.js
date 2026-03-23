/**
 * 集成测试：使用真实文档路径测试路径映射算法（简化版 - 无 lastFolder）
 */

const { generateRemotePath } = require('../lib/path-mapper');

console.log('🧪 路径映射集成测试（简化版）\n');
console.log('=' .repeat(80));

// 测试用例
const testCases = [
  {
    name: '2 级文档',
    docPath: 'docs/1-neoedge-ng4500-series/0-overview.md',
    images: [
      '/img/Overview/NG45xx/NG45XX.png',
      '/img/Hardware_Guide/Edge_AI_Box/BracketAndUage/NG45_Series_Outline.png'
    ],
    expectedPatterns: [
      '/img/neoedge-ng4500-series/overview/NG45XX.png',
      '/img/neoedge-ng4500-series/overview/NG45_Series_Outline.png'
    ]
  },
  {
    name: '3 级文档',
    docPath: 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/0-dev-guide.md',
    images: [
      '/img/Board/NG4500-CB01_1.png',
      '/img/Board/NG4500-CB01_2.png'
    ],
    expectedPatterns: [
      '/img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/NG4500-CB01_1.png',
      '/img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/NG4500-CB01_2.png'
    ]
  },
  {
    name: '4 级文档',
    docPath: 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md',
    images: [
      '/img/NGC_API_KEY.png',
      '/img/Generate_personal_key.png',
      '/img/docker_nvidia-smi.png'
    ],
    expectedPatterns: [
      '/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/NGC_API_KEY.png',
      '/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/Generate_personal_key.png',
      '/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/docker_nvidia-smi.png'
    ]
  },
  {
    name: '5 级文档（驱动安装）',
    docPath: 'docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/1-driver-installation-and-updates/0-interface-and-modules-configure.md',
    images: [
      '/img/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png',
      '/img/NG45XX_SOFTWARE/Driver/NG45XX_RS232.png'
    ],
    expectedPatterns: [
      '/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/driver-installation-and-updates/interface-and-modules-configure/NG45XX_GPIO.png',
      '/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/driver-installation-and-updates/interface-and-modules-configure/NG45XX_RS232.png'
    ]
  }
];

let passCount = 0;
let failCount = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n测试 ${index + 1}: ${testCase.name}`);
  console.log(`文档路径: ${testCase.docPath}`);
  console.log('-'.repeat(80));

  testCase.images.forEach((imagePath, imgIndex) => {
    const result = generateRemotePath(testCase.docPath, imagePath);
    const expected = testCase.expectedPatterns[imgIndex];

    const passed = result === expected;
    const status = passed ? '✅' : '❌';

    console.log(`\n${status} 图片 ${imgIndex + 1}: ${imagePath}`);
    console.log(`  生成路径: ${result}`);
    console.log(`  预期路径: ${expected}`);

    if (passed) {
      passCount++;
    } else {
      failCount++;
      console.log(`  ⚠️  路径不匹配！`);
    }
  });
});

console.log('\n' + '='.repeat(80));
console.log(`\n测试结果: ${passCount} 通过, ${failCount} 失败\n`);

if (failCount > 0) {
  process.exit(1);
}
