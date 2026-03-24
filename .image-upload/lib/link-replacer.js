/**
 * 链接替换器
 * 负责替换 Markdown 和 JSX 格式中的图片链接
 */

class LinkReplacer {
  /**
   * 转义正则表达式特殊字符
   * @param {string} string - 需要转义的字符串
   * @returns {string} 转义后的字符串
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 替换内容中的图片链接
   * @param {string} content - Markdown 或 JSX 内容
   * @param {Object} mapping - 路径映射对象 {本地路径: 远程URL}
   * @returns {string} 替换后的内容
   */
  replaceLinks(content, mapping) {
    let result = content;

    for (const [localPath, remoteUrl] of Object.entries(mapping)) {
      result = this.replaceLink(result, localPath, remoteUrl);
    }

    return result;
  }

  /**
   * 替换单个图片链接
   * @param {string} content - 内容
   * @param {string} localPath - 本地路径
   * @param {string} remoteUrl - 远程 URL
   * @returns {string} 替换后的内容
   */
  replaceLink(content, localPath, remoteUrl) {
    const escapedPath = this.escapeRegExp(localPath);

    // 1. 替换标准 Markdown 格式: ![alt](path)
    const markdownRegex = new RegExp(
      `!\\[([^\\]]*)\\]\\(${escapedPath}\\)`,
      'g'
    );
    content = content.replace(markdownRegex, `![$1](${remoteUrl})`);

    // 2. 替换 JSX 格式: <img src="path" .../> 或 <img src='path' .../>
    // 匹配双引号
    const jsxDoubleQuoteRegex = new RegExp(
      `(<img\\s+[^>]*src=)"${escapedPath}"([^>]*>)`,
      'g'
    );
    content = content.replace(jsxDoubleQuoteRegex, `$1"${remoteUrl}"$2`);

    // 匹配单引号
    const jsxSingleQuoteRegex = new RegExp(
      `(<img\\s+[^>]*src=)'${escapedPath}'([^>]*>)`,
      'g'
    );
    content = content.replace(jsxSingleQuoteRegex, `$1'${remoteUrl}'$2`);

    // 3. 替换自定义组件格式: <ZoomableImage src="path" .../>
    // 匹配双引号
    const componentDoubleQuoteRegex = new RegExp(
      `(<\\w+\\s+[^>]*src=)"${escapedPath}"([^>]*\\/>)`,
      'g'
    );
    content = content.replace(componentDoubleQuoteRegex, `$1"${remoteUrl}"$2`);

    // 匹配单引号
    const componentSingleQuoteRegex = new RegExp(
      `(<\\w+\\s+[^>]*src=)'${escapedPath}'([^>]*\\/>)`,
      'g'
    );
    content = content.replace(componentSingleQuoteRegex, `$1'${remoteUrl}'$2`);

    // 4. 替换 React 组件属性: image: "path" 或 image: 'path'
    // 匹配双引号
    const reactPropDoubleQuoteRegex = new RegExp(
      `(image:\\s*)"${escapedPath}"`,
      'g'
    );
    content = content.replace(reactPropDoubleQuoteRegex, `$1"${remoteUrl}"`);

    // 匹配单引号
    const reactPropSingleQuoteRegex = new RegExp(
      `(image:\\s*)'${escapedPath}'`,
      'g'
    );
    content = content.replace(reactPropSingleQuoteRegex, `$1'${remoteUrl}'`);

    // 5. 替换 useBaseUrl 格式: src={useBaseUrl("path")} 或 src={useBaseUrl('path')}
    // 匹配双引号 - 注意要匹配整个 src={useBaseUrl("...")}
    const useBaseUrlDoubleQuoteRegex = new RegExp(
      `src=\\{useBaseUrl\\("${escapedPath}"\\)\\}`,
      'g'
    );
    content = content.replace(useBaseUrlDoubleQuoteRegex, `src="${remoteUrl}"`);

    // 匹配单引号 - 注意要匹配整个 src={useBaseUrl('...')}
    const useBaseUrlSingleQuoteRegex = new RegExp(
      `src=\\{useBaseUrl\\('${escapedPath}'\\)\\}`,
      'g'
    );
    content = content.replace(useBaseUrlSingleQuoteRegex, `src="${remoteUrl}"`);

    // 6. 替换 imageSrc: useBaseUrl("path") 或 imageSrc: useBaseUrl('path')
    // 匹配双引号
    const imageSrcDoubleQuoteRegex = new RegExp(
      `imageSrc:\\s*useBaseUrl\\("${escapedPath}"\\)`,
      'g'
    );
    content = content.replace(imageSrcDoubleQuoteRegex, `imageSrc: "${remoteUrl}"`);

    // 匹配单引号
    const imageSrcSingleQuoteRegex = new RegExp(
      `imageSrc:\\s*useBaseUrl\\('${escapedPath}'\\)`,
      'g'
    );
    content = content.replace(imageSrcSingleQuoteRegex, `imageSrc: "${remoteUrl}"`);

    // 7. 替换 image: useBaseUrl("path") 或 image: useBaseUrl('path')
    // 匹配双引号
    const imageDoubleQuoteRegex = new RegExp(
      `image:\\s*useBaseUrl\\("${escapedPath}"\\)`,
      'g'
    );
    content = content.replace(imageDoubleQuoteRegex, `image: "${remoteUrl}"`);

    // 匹配单引号
    const imageSingleQuoteRegex = new RegExp(
      `image:\\s*useBaseUrl\\('${escapedPath}'\\)`,
      'g'
    );
    content = content.replace(imageSingleQuoteRegex, `image: "${remoteUrl}"`);

    return content;
  }
}

module.exports = LinkReplacer;
