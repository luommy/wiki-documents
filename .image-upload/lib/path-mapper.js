/**
 * 路径映射工具
 * 根据文档名生成更有意义的云端文件夹名
 */

const path = require('path');

/**
 * 从文档名提取文件夹名
 * 规则：去掉数字前缀和 .md 后缀
 *
 * @param {string} docPath - 文档路径
 * @returns {string|null} 提取的文件夹名，如果不适用则返回 null
 *
 * @example
 * extractFolderName('4-refrigerator-inventory-monitoring.md')
 * // 返回: 'refrigerator-inventory-monitoring'
 *
 * extractFolderName('3-ne301-model-converter.md')
 * // 返回: 'ne301-model-converter'
 */
function extractFolderName(docPath) {
  const basename = path.basename(docPath, '.md');

  // 匹配模式: 数字-名称
  const match = basename.match(/^\d+-(.+)$/);

  if (match) {
    return match[1];
  }

  // 如果不匹配数字前缀模式，返回原始名称
  return basename;
}

/**
 * 为图片路径生成映射后的云端路径
 *
 * @param {string} localImagePath - 本地图片路径 (如 /img/ne301/application-guide/monitoring/image.png)
 * @param {string} docPath - 文档路径 (如 docs/.../4-refrigerator-inventory-monitoring.md)
 * @returns {string} 映射后的云端路径
 */
function mapImagePath(localImagePath, docPath) {
  // 提取建议的文件夹名
  const suggestedFolderName = extractFolderName(docPath);

  if (!suggestedFolderName) {
    return localImagePath;
  }

  // 解析原路径
  const pathParts = localImagePath.split('/');

  // 查找 /img/ 后的路径部分
  const imgIndex = pathParts.indexOf('img');
  if (imgIndex === -1) {
    return localImagePath;
  }

  // 获取当前文件夹名（假设在 /img/ne301/application-guide/ 之后）
  // 例如：/img/ne301/application-guide/monitoring/image.png
  //                  0    1        2              3         4
  const folderIndex = imgIndex + 3; // application-guide 之后的文件夹

  if (folderIndex < pathParts.length - 1) {
    const currentFolder = pathParts[folderIndex];

    // 如果当前文件夹名是通用的（如 monitoring, guide, images 等）
    // 替换为更有意义的名称
    const genericFolders = ['monitoring', 'guide', 'images', 'img', 'pics'];

    if (genericFolders.includes(currentFolder)) {
      pathParts[folderIndex] = suggestedFolderName;
      return pathParts.join('/');
    }
  }

  return localImagePath;
}

/**
 * 批量映射图片路径
 *
 * @param {string[]} localImagePaths - 本地图片路径数组
 * @param {string} docPath - 文档路径
 * @returns {Object} 映射关系 { 原路径: 映射后路径 }
 */
function mapImagePaths(localImagePaths, docPath) {
  const mapping = {};

  for (const localPath of localImagePaths) {
    const mappedPath = mapImagePath(localPath, docPath);
    mapping[localPath] = mappedPath;
  }

  return mapping;
}

module.exports = {
  extractFolderName,
  mapImagePath,
  mapImagePaths
};
