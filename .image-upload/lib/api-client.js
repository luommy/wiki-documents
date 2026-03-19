const axios = require('axios');
const https = require('https');

/**
 * File Browser API 客户端
 */
class FileBrowserAPI {
  /**
   * @param {Object} config - 配置对象
   * @param {string} config.baseUrl - File Browser 服务地址
   * @param {string} config.username - 用户名
   * @param {string} config.password - 密码
   */
  constructor(config) {
    // 验证必需参数
    if (!config.baseUrl) {
      throw new Error('baseUrl 是必需的配置参数');
    }
    if (!config.username) {
      throw new Error('username 是必需的配置参数');
    }
    if (!config.password) {
      throw new Error('password 是必需的配置参数');
    }

    this.baseUrl = config.baseUrl;
    this.username = config.username;
    this.password = config.password;
    this.token = null;

    // 创建自定义 HTTPS Agent（解决 TLS 连接问题）
    const httpsAgent = new https.Agent({
      rejectUnauthorized: true,
      keepAlive: true,
      minVersion: 'TLSv1.2',
    });

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      httpsAgent: httpsAgent,
      proxy: false,  // 明确禁用代理，避免系统代理干扰
    });
  }

  /**
   * 登录获取 JWT Token
   * @returns {Promise<string>} JWT Token
   */
  async login() {
    try {
      const response = await this.client.post('/api/login', {
        username: this.username,
        password: this.password,
      });

      this.token = response.data;
      return this.token;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      throw new Error(`登录失败 (HTTP ${status || 'N/A'}): ${message}`);
    }
  }

  /**
   * 获取认证请求头
   * @returns {Object} 请求头
   */
  getAuthHeaders() {
    if (!this.token) {
      throw new Error('未登录,请先调用 login() 方法');
    }
    return {
      'X-Auth': this.token,
    };
  }

  /**
   * 上传文件
   * @param {string} remotePath - 远程路径(如 /wiki/img/test/image.png)
   * @param {Buffer} fileBuffer - 文件内容
   * @param {boolean} override - 是否覆盖已存在的文件
   * @returns {Promise<void>}
   */
  async uploadFile(remotePath, fileBuffer, override = false) {
    try {
      const url = `/api/resources${remotePath}${override ? '?override=true' : ''}`;

      await this.client.post(url, fileBuffer, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/octet-stream',
        },
      });
    } catch (error) {
      throw new Error(`上传文件失败 (${remotePath}): ${error.message}`);
    }
  }

  /**
   * 创建文件夹
   * @param {string} folderPath - 文件夹路径
   * @returns {Promise<void>}
   */
  async createFolder(folderPath) {
    try {
      // File Browser API: POST /api/resources/{path}?override=false
      // 请求体需要指定规则,但创建文件夹需要使用特殊方式
      await this.client.post(
        `/api/resources${folderPath}?override=false`,
        '', // 空字符串作为请求体,避免创建 JSON 文件
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/octet-stream', // 使用二进制流避免 JSON 解析
          },
        }
      );
    } catch (error) {
      if (error.response?.status === 409) {
        // 文件夹已存在,不算错误
        return;
      }
      throw new Error(`创建文件夹失败 (${folderPath}): ${error.message}`);
    }
  }

  /**
   * 检查文件或文件夹是否存在
   * @param {string} remotePath - 远程路径
   * @returns {Promise<boolean>}
   */
  async fileExists(remotePath) {
    try {
      await this.client.get(`/api/resources${remotePath}`, {
        headers: this.getAuthHeaders(),
      });
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw new Error(`检查文件存在失败 (${remotePath}): ${error.message}`);
    }
  }

  /**
   * 列出文件夹内容
   * @param {string} folderPath - 文件夹路径
   * @returns {Promise<Array>} 文件列表
   */
  async listFolder(folderPath) {
    try {
      const response = await this.client.get(`/api/resources${folderPath}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.items || [];
    } catch (error) {
      throw new Error(`列出文件夹内容失败 (${folderPath}): ${error.message}`);
    }
  }
}

module.exports = FileBrowserAPI;