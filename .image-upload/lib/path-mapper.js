/**
 * 路径映射工具
 * 根据文档路径和图片路径生成云端存储路径
 */

const path = require('path');

/**
 * 主函数：生成远程路径
 *
 * @param {string} docPath - 文档路径 (如 docs/1-neoedge-ng4500-series/2-user-guide/1-quick-start.md)
 * @param {string} imagePath - 图片路径 (如 /img/ne301/application-guide/monitoring/image.png)
 * @returns {string} 映射后的云端路径
 */
function generateRemotePath(docPath, imagePath) {
  // 1. 输入验证
  if (!docPath || !imagePath) {
    throw new Error('Both docPath and imagePath are required');
  }

  // 2. 检测路径遍历攻击
  if (docPath.includes('..') || imagePath.includes('..')) {
    throw new Error('Path traversal detected');
  }

  // 3. 如果是远程 URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  try {
    // 4. 提取文档层级（包括所有目录 + 文件名）
    const docHierarchy = extractDocHierarchy(docPath);

    // 5. 提取图片路径组件
    const imageComponents = extractImageComponents(imagePath);

    // 如果无法解析图片路径，返回原路径
    if (!imageComponents) {
      return imagePath;
    }

    // 6. 构建远程路径
    const remotePath = buildRemotePath(docHierarchy, imageComponents);

    return remotePath;
  } catch (error) {
    // 发生任何错误时返回原路径
    return imagePath;
  }
}

/**
 * 提取文档层级结构（包括目录和文件名）
 *
 * @param {string} docPath - 文档路径
 * @returns {Object} { directories: string[], filename: string }
 */
function extractDocHierarchy(docPath) {
  // 标准化路径分隔符 (Windows -> Unix)
  let normalized = docPath.replace(/\\/g, '/');

  // 分割路径
  let parts = normalized.split('/');

  // 移除 'docs' 前缀
  const docsIndex = parts.indexOf('docs');
  if (docsIndex !== -1) {
    parts = parts.slice(docsIndex + 1);
  }

  // 如果没有层级（根级别文档），使用文件名
  if (parts.length === 0) {
    const basename = path.basename(docPath, '.md');
    return {
      directories: [],
      filename: removeNumericPrefix(basename)
    };
  }

  // 检查最后一部分是否是文件（带 .md 后缀）
  const lastPart = parts[parts.length - 1];
  const isFile = lastPart && lastPart.endsWith('.md');

  let directories = [];
  let filename = '';

  if (isFile) {
    // 提取文件名（移除 .md 后缀和数字前缀）
    filename = removeNumericPrefix(lastPart.replace(/\.md$/, ''));
    // 目录是除最后一个之外的所有部分
    directories = parts.slice(0, -1).map(p => removeNumericPrefix(p));
  } else {
    // 没有文件，所有部分都是目录
    directories = parts.map(p => removeNumericPrefix(p));
  }

  return { directories, filename };
}

/**
 * 移除数字前缀
 *
 * @param {string} str - 输入字符串
 * @returns {string} 移除数字前缀后的字符串
 */
function removeNumericPrefix(str) {
  // 匹配模式: 数字-名称
  const match = str.match(/^\d+-(.+)$/);
  return match ? match[1] : str;
}

/**
 * 提取图片路径组件
 *
 * @param {string} imagePath - 图片路径
 * @returns {Object|null} { lastFolder, filename } 或 null
 */
function extractImageComponents(imagePath) {
  // 查找 /img/ 在路径中的位置
  const imgIndex = imagePath.indexOf('/img/');
  if (imgIndex === -1) {
    return null;
  }

  // 获取 /img/ 之后的部分
  const afterImg = imagePath.substring(imgIndex + 5); // '/img/'.length = 5

  // 分割路径
  const parts = afterImg.split('/').filter(p => p.length > 0);

  // 至少需要文件名
  if (parts.length < 1) {
    return null;
  }

  // 获取文件名
  const filename = parts[parts.length - 1];

  // 获取最后一个文件夹（文件名之前）
  let lastFolder = '';
  if (parts.length >= 2) {
    lastFolder = parts[parts.length - 2];

    // 跳过产品 ID
    const productIds = ['ne301', 'ng4500', 'ne4500', 'ne101'];
    if (productIds.includes(lastFolder.toLowerCase())) {
      // 如果最后文件夹是产品 ID，尝试使用前一个文件夹
      if (parts.length >= 3) {
        lastFolder = parts[parts.length - 3];
      } else {
        lastFolder = '';
      }
    }
  }

  return {
    lastFolder: lastFolder,
    filename: encodeURIComponent(filename)
  };
}

/**
 * 构建远程路径
 *
 * @param {Object} docHierarchy - 文档层级 { directories: string[], filename: string }
 * @param {Object} imageComponents - 图片组件 { lastFolder, filename }
 * @returns {string} 远程路径
 */
function buildRemotePath(docHierarchy, imageComponents) {
  // 构建路径: /img/ + directories + [filename or lastFolder] + filename
  let parts = ['/img'];

  // 添加文档目录层级
  parts = parts.concat(docHierarchy.directories);

  // 决定是否包含文档文件名
  const imageFilenameWithoutExt = imageComponents.filename.replace(/\.[^.]+$/, '');

  const shouldIncludeDocFilename =
    docHierarchy.filename && (
      docHierarchy.directories.length === 0 ||  // 根级别文档 (0 dirs)
      docHierarchy.directories.length >= 2 ||   // 2+ 目录层级
      !imageComponents.lastFolder ||             // 图片没有 lastFolder
      (docHierarchy.filename !== imageFilenameWithoutExt && docHierarchy.directories.length === 1)  // 1 目录且文件名不重复
    );

  if (shouldIncludeDocFilename) {
    parts.push(docHierarchy.filename);
  }

  // 添加图片的 lastFolder（如果有）
  if (imageComponents.lastFolder) {
    parts.push(imageComponents.lastFolder);
  }

  // 添加文件名
  parts.push(imageComponents.filename);

  // 构建最终路径
  let remotePath = parts.join('/');

  return remotePath;
}

/**
 * 包装函数：映射单个图片路径
 * 保持与旧 API 的兼容性
 *
 * @param {string} localImagePath - 本地图片路径
 * @param {string} docPath - 文档路径
 * @returns {string} 映射后的路径
 */
function mapImagePath(localImagePath, docPath) {
  return generateRemotePath(docPath, localImagePath);
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
    try {
      const mappedPath = generateRemotePath(docPath, localPath);
      mapping[localPath] = mappedPath;
    } catch (error) {
      // 如果出错，保留原路径
      mapping[localPath] = localPath;
    }
  }

  return mapping;
}

/**
 * 从文档名提取文件夹名（向后兼容）
 *
 * @param {string} docPath - 文档路径
 * @returns {string} 提取的文件夹名
 */
function extractFolderName(docPath) {
  const hierarchy = extractDocHierarchy(docPath);
  if (hierarchy.filename) {
    return hierarchy.filename;
  }
  return hierarchy.directories[hierarchy.directories.length - 1] || path.basename(docPath, '.md');
}

module.exports = {
  generateRemotePath,
  mapImagePath,
  mapImagePaths,
  extractFolderName
};
