const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

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
    this.baseUrl = config.baseUrl;
    this.username = config.username;
    this.password = config.password;
    this.token = null;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
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
      throw new Error(`登录失败: ${error.message}`);
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
}

module.exports = FileBrowserAPI;