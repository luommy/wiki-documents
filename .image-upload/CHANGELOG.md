# 更新日志

## [2026-03-19] - 修复 TLS 连接和缓存问题

### 修复的问题

#### 1. TLS 连接错误
- **问题**: `Client network socket disconnected before secure TLS connection was established`
- **原因**: 系统代理设置干扰 Node.js axios 的 TLS 连接
- **解决方案**:
  - 在 `lib/api-client.js` 中添加自定义 HTTPS Agent
  - 明确禁用代理 (`proxy: false`)
  - 配置 TLS 1.2+ 支持

#### 2. 缓存导致图片未上传
- **问题**: 工具显示"跳过(缓存)"但图片实际未上传
- **解决方案**:
  - 添加 `--force` 参数强制重新上传
  - 更新 README 文档，添加故障排查指南
  - 创建 `test-connection.js` 诊断脚本

### 新增功能

1. **网络连接诊断工具** (`test-connection.js`)
   - 自动测试 3 种连接方式（直接连接、本地代理、系统代理）
   - 快速诊断 TLS 连接问题
   - 推荐最佳配置

2. **文档增强**
   - 添加"错误 7: TLS 连接错误"故障排查
   - 添加"错误 8: 缓存导致图片未上传"故障排查
   - 添加网络环境检查命令

### 修改的文件

- `lib/api-client.js` - 添加 HTTPS Agent 和代理配置
- `README.md` - 添加故障排查章节
- `test-connection.js` - 新增网络诊断工具

### 使用建议

如果遇到 TLS 连接问题：

```bash
# 1. 运行诊断脚本
cd .image-upload
node test-connection.js

# 2. 如果显示"直接连接"成功，工具已自动配置
# 3. 如果仍有问题，使用 --force 强制上传
yarn upload-images ../docs/your-file.md --force
```

### 验证

成功上传 52 张图片到：
- 文档: `docs/5-neoeyes-ne301-series/3-application-guide/4-refrigerator-inventory-monitoring.md`
- 远程路径: `https://resources.camthink.ai/wiki/img/ne301/application-guide/refrigerator-inventory-monitoring/`
