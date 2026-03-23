/**
 * Markdown 解析器
 * 提取标准 Markdown 和 JSX 格式的图片引用
 */

const fs = require('fs');
const path = require('path');

/**
 * 从 Markdown 内容提取图片引用
 * @param {string} content - Markdown 内容
 * @returns {string[]} 图片路径数组(去重)
 */
function extractImages(content) {
  const images = new Set();

  // 1. 标准 Markdown 格式: ![alt](/img/path)
  const markdownRegex = /!\[.*?\]\((\/img\/[^)\s]+)/g;
  let match;
  while ((match = markdownRegex.exec(content)) !== null) {
    images.add(match[1]);
  }

  // 2. JSX 格式: <img src="/img/path" />
  const jsxRegex = /<img\s+[^>]*src=["'](\/img\/[^"']+)["'][^>]*\/?>/g;
  while ((match = jsxRegex.exec(content)) !== null) {
    images.add(match[1]);
  }

  // 3. JSX 格式: <img src={"/img/path"} />
  const jsxCurlyRegex = /<img\s+[^>]*src=\{["'](\/img\/[^"']+)["']\}[^>]*\/?>/g;
  while ((match = jsxCurlyRegex.exec(content)) !== null) {
    images.add(match[1]);
  }

  // 4. React 组件属性: image: "/img/path" 或 image: '/img/path'
  const reactPropRegex = /image:\s*["'](\/img\/[^"']+)["']/g;
  while ((match = reactPropRegex.exec(content)) !== null) {
    images.add(match[1]);
  }

  return Array.from(images);
}

/**
 * 从文件路径读取并提取图片
 * @param {string} filePath - 文件路径
 * @returns {string[]} 图片路径数组
 */
function parseFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return extractImages(content);
}

module.exports = {
  extractImages,
  parseFile
};
