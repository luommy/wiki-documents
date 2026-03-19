/**
 * 图片上传协调器
 * 管理上传流程、缓存和统计
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FileBrowserAPI = require('./api-client');

class ImageUploader {
  /**
   * @param {Object} config - 配置对象
   * @param {Object} config.fileBrowser - File Browser 配置
   * @param {Object} config.upload - 上传配置
   */
  constructor(config) {
    this.config = config;
    this.apiClient = new FileBrowserAPI(config.fileBrowser);

    // 缓存数据结构: { hash: { remotePath, uploadedAt, size } }
    this.cache = new Map();

    // 统计信息
    this.stats = {
      uploaded: 0,    // 成功上传数量
      skipped: 0,     // 跳过数量(缓存命中)
      failed: 0,      // 失败数量
      errors: []      // 错误详情
    };

    // 缓存文件路径
    this.cacheFile = path.join(__dirname, '.upload-cache.json');
  }

  /**
   * 初始化(登录并加载缓存)
   * @returns {Promise<void>}
   */
  async initialize() {
    // 登录获取 token
    await this.apiClient.login();

    // 加载缓存
    this.loadCache();
  }

  /**
   * 计算文件的 SHA256 hash
   * @param {string} filePath - 文件路径
   * @returns {string} hash 字符串
   */
  calculateHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(fileBuffer);
    return hash.digest('hex');
  }

  /**
   * 加载缓存
   * @returns {void}
   */
  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf-8');
        const cacheObj = JSON.parse(data);

        // 转换为 Map
        this.cache = new Map(Object.entries(cacheObj));
      }
    } catch (error) {
      // 缓存加载失败不影响运行,使用空缓存
      console.warn(`加载缓存失败: ${error.message}`);
      this.cache = new Map();
    }
  }

  /**
   * 保存缓存
   * @returns {void}
   */
  saveCache() {
    try {
      // 转换为对象
      const cacheObj = Object.fromEntries(this.cache);

      // 写入文件
      fs.writeFileSync(
        this.cacheFile,
        JSON.stringify(cacheObj, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error(`保存缓存失败: ${error.message}`);
    }
  }

  /**
   * 上传单个图片
   * @param {string} localPath - 本地图片路径(相对于 static 目录)
   * @param {string} staticDir - static 目录绝对路径
   * @param {boolean} force - 是否强制上传(忽略缓存)
   * @param {string|null} mappedRemotePath - 映射后的远程路径(可选)
   * @returns {Promise<string>} 远程 URL
   */
  async uploadImage(localPath, staticDir, force = false, mappedRemotePath = null) {
    // 构建完整文件路径
    const fullPath = path.join(staticDir, localPath);

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      const error = new Error(`文件不存在: ${fullPath}`);
      this.stats.failed++;
      this.stats.errors.push({
        file: localPath,
        error: error.message
      });
      throw error;
    }

    // 计算 hash
    const hash = this.calculateHash(fullPath);

    // 检查缓存
    if (!force && this.config.upload.skipUploaded && this.cache.has(hash)) {
      const cached = this.cache.get(hash);
      this.stats.skipped++;
      return this.buildPublicUrl(cached.remotePath);
    }

    // 构建远程路径
    // 如果提供了映射路径，使用映射路径；否则使用默认逻辑
    // localPath 格式: /img/xxx/yyy.png
    // remotePath 格式: /wiki/img/xxx/yyy.png
    const remotePath = mappedRemotePath || `${this.config.fileBrowser.remoteBasePath}${localPath}`;

    try {
      // File Browser 会在上传文件时自动创建文件夹
      // 因此不需要显式创建文件夹

      // 读取文件内容
      const fileBuffer = fs.readFileSync(fullPath);

      // 上传文件
      await this.apiClient.uploadFile(remotePath, fileBuffer, true);

      // 更新缓存
      const fileStat = fs.statSync(fullPath);
      this.cache.set(hash, {
        remotePath: remotePath,
        uploadedAt: new Date().toISOString(),
        size: fileStat.size
      });

      // 保存缓存
      this.saveCache();

      // 更新统计
      this.stats.uploaded++;

      // 返回公共 URL
      return this.buildPublicUrl(remotePath);
    } catch (error) {
      this.stats.failed++;
      this.stats.errors.push({
        file: localPath,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * 构建公共访问 URL
   * @param {string} remotePath - 远程路径
   * @returns {string} 公共 URL
   */
  buildPublicUrl(remotePath) {
    // remotePath: /wiki/img/xxx/yyy.png
    // 返回: https://resources.camthink.ai/wiki/img/xxx/yyy.png
    const publicBase = this.config.fileBrowser.publicBaseUrl;
    const relativePath = remotePath.replace(this.config.fileBrowser.remoteBasePath, '');
    return `${publicBase}${relativePath}`;
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计对象
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   * @returns {void}
   */
  resetStats() {
    this.stats = {
      uploaded: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * 清空缓存
   * @returns {void}
   */
  clearCache() {
    this.cache.clear();
    this.saveCache();
  }

  /**
   * 批量上传图片
   * @param {string[]} localPaths - 本地路径数组
   * @param {string} staticDir - static 目录路径
   * @param {boolean} force - 是否强制上传
   * @param {Object} pathMapping - 路径映射 { localPath: mappedRemotePath }
   * @returns {Promise<Object>} 结果映射 { localPath: remoteUrl }
   */
  async uploadImages(localPaths, staticDir, force = false, pathMapping = {}) {
    const results = {};
    const concurrency = this.config.upload.concurrency || 3;

    // 使用并发控制
    for (let i = 0; i < localPaths.length; i += concurrency) {
      const batch = localPaths.slice(i, i + concurrency);

      await Promise.allSettled(
        batch.map(async (localPath) => {
          try {
            // 使用映射路径（如果有）
            const mappedRemotePath = pathMapping[localPath] || null;
            const remoteUrl = await this.uploadImage(localPath, staticDir, force, mappedRemotePath);
            results[localPath] = remoteUrl;
          } catch (error) {
            // 错误已在 uploadImage 中记录到统计
            results[localPath] = null;
          }
        })
      );
    }

    return results;
  }
}

module.exports = ImageUploader;
