/**
 * 语言同步工具
 * 自动同步中英文文档的图片链接
 */

const fs = require('fs');
const path = require('path');

/**
 * 获取文档的语言版本路径
 * @param {string} docPath - 文档路径
 * @returns {Object} { language: 'zh'|'en', counterpart: 对应语言版本路径|null }
 */
function getLanguageCounterpart(docPath) {
  const normalizedPath = path.normalize(docPath);

  // 检查是否是英文文档（在 i18n/en 目录下）
  if (normalizedPath.includes(path.join('i18n', 'en'))) {
    // 英文 → 中文
    // i18n/en/docusaurus-plugin-content-docs/current/... → docs/...
    const match = normalizedPath.match(/i18n[\/\\]en[\/\\]docusaurus-plugin-content-docs[\/\\]current[\/\\](.+)/);
    if (match) {
      return {
        language: 'en',
        counterpart: path.join('docs', match[1])
      };
    }
  } else if (normalizedPath.startsWith('docs')) {
    // 中文 → 英文
    // docs/... → i18n/en/docusaurus-plugin-content-docs/current/...
    const relativePath = normalizedPath.replace(/^docs[\/\\]/, '');
    return {
      language: 'zh',
      counterpart: path.join('i18n', 'en', 'docusaurus-plugin-content-docs', 'current', relativePath)
    };
  }

  return {
    language: 'unknown',
    counterpart: null
  };
}

/**
 * 同步图片链接到对应语言版本
 * @param {string} sourceDoc - 源文档路径
 * @param {Object} linkMapping - 链接映射 { oldLink: newLink }
 * @returns {Object} { success: boolean, counterpart: string|null, updated: number, language: string, error?: string }
 */
function syncToCounterpart(sourceDoc, linkMapping) {
  const { language, counterpart } = getLanguageCounterpart(sourceDoc);

  if (!counterpart) {
    return {
      success: false,
      counterpart: null,
      updated: 0,
      language: 'unknown',
      error: '未找到对应的语言版本'
    };
  }

  // 检查对应文档是否存在
  if (!fs.existsSync(counterpart)) {
    return {
      success: false,
      counterpart,
      updated: 0,
      language: language === 'zh' ? '中文 → 英文' : '英文 → 中文',
      error: `对应文档不存在`
    };
  }

  try {
    // 读取对应文档内容
    let content = fs.readFileSync(counterpart, 'utf-8');
    let updatedCount = 0;

    // 替换链接
    for (const [oldLink, newLink] of Object.entries(linkMapping)) {
      const regex = new RegExp(escapeRegExp(oldLink), 'g');
      const matches = content.match(regex);

      if (matches) {
        content = content.replace(regex, newLink);
        updatedCount += matches.length;
      }
    }

    // 如果有更新，写回文件
    if (updatedCount > 0) {
      fs.writeFileSync(counterpart, content, 'utf-8');
    }

    return {
      success: true,
      counterpart,
      updated: updatedCount,
      language: language === 'zh' ? '中文 → 英文' : '英文 → 中文'
    };
  } catch (error) {
    return {
      success: false,
      counterpart,
      updated: 0,
      language: language === 'zh' ? '中文 → 英文' : '英文 → 中文',
      error: error.message
    };
  }
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  getLanguageCounterpart,
  syncToCounterpart
};
