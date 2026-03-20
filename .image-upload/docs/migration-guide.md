# 迁移指南：从旧版本升级

## 背景

新版本使用基于文档完整层级的路径映射，不再使用图片原始路径的文件夹。这意味着：

- **旧版本**：图片路径映射基于原始文件夹结构（例如 `/img/neoedge-ng4500-series/arch.png`）
- **新版本**：图片路径映射基于文档层级（例如 `/img/1-neoedge-ng4500-series/0-overview/arch.png`）

此变更确保图片路径与文档结构一致，避免路径冲突和混淆。

## 迁移步骤

### 1. 备份现有文件

在执行迁移前，请务必备份现有的文档和图片。

**备份方式**：
- 在 File Browser 中导出 `/img/` 目录
- 备份本地 `docs/` 目录
- 如果使用 Git，创建备份分支：
  ```bash
  git checkout -b backup-before-migration
  git push origin backup-before-migration
  git checkout main
  ```

### 2. 清理旧文件

在 File Browser 中手动删除 `/img/` 目录下的所有旧图片文件。

**注意**：清理前请确保已完成备份！

### 3. 重新上传所有图片

使用新的上传脚本重新上传所有文档图片。

**方式一：使用 shell 脚本（推荐）**
```bash
# 上传单个目录
.image-upload/upload-images.sh docs/1-neoedge-ng4500-series

# 上传所有文档
.image-upload/upload-images.sh docs/
```

**方式二：使用 Node.js 脚本**
```bash
# 上传单个目录
node .image-upload/scripts/upload-images.js docs/1-neoedge-ng4500-series

# 上传所有文档
node .image-upload/scripts/upload-images.js docs/
```

**可选参数**：
- `--dry-run`：预览模式，仅扫描不上传
- `--force`：强制上传所有图片（忽略缓存）
- `--no-cache`：禁用缓存

### 4. 验证上传结果

验证所有图片是否已正确上传并可访问。

```bash
# 验证单个文档
node .image-upload/scripts/verify-uploads.js docs/1-neoedge-ng4500-series/0-overview.md

# 验证整个目录
node .image-upload/scripts/verify-uploads.js docs/1-neoedge-ng4500-series

# 输出详细报告
node .image-upload/scripts/verify-uploads.js docs/ --verbose

# 生成修复建议
node .image-upload/scripts/verify-uploads.js docs/ --fix
```

## 预期影响

### ✅ 正面影响

- 所有图片 URL 会更清晰、更符合文档结构
- 避免不同文档使用相同文件名时的路径冲突
- 更容易维护和查找图片

### ⚠️ 注意事项

- **所有图片 URL 会改变**：新版本的图片路径格式与旧版本不同
- **文档中的链接会自动更新**：上传脚本会自动更新 Markdown 文件中的图片链接
- **旧的图片 URL 会失效**：旧路径的图片将被删除，需要清理浏览器缓存
- **外部引用需要更新**：如果有外部网站引用了文档中的图片，需要更新链接

## 回滚方案

如果在迁移过程中出现问题，可以按照以下步骤回滚：

### 方案一：从 Git 备份恢复

```bash
# 恢复文档到备份分支
git checkout backup-before-migration
git checkout -b rollback-$(date +%Y%m%d)
git checkout main
git merge rollback-$(date +%Y%m%d)
```

### 方案二：从 File Browser 备份恢复

1. 登录 File Browser
2. 删除新上传的 `/img/` 目录
3. 从之前导出的备份中恢复 `/img/` 目录
4. 恢复本地文档的备份版本

### 方案三：重新上传旧版本图片

1. 恢复本地文档到旧版本（从 Git 备份）
2. 在 File Browser 中清理 `/img/` 目录
3. 使用旧版本的上传脚本重新上传（如果需要保留旧版本）

## 故障排除

### 问题 1：上传失败

**症状**：上传脚本报错，部分图片上传失败

**解决方案**：
1. 检查网络连接
2. 检查 File Browser 服务状态
3. 检查 `.upload-config.json` 配置是否正确
4. 使用 `--force` 参数重试

### 问题 2：验证失败

**症状**：验证脚本报告图片无法访问

**解决方案**：
1. 检查 File Browser 中的图片是否存在
2. 检查 `.upload-config.json` 中的 `publicBaseUrl` 是否正确
3. 确认图片文件格式正确
4. 重新上传失败的图片

### 问题 3：链接未更新

**症状**：文档中的图片链接仍然是旧路径

**解决方案**：
1. 确认上传脚本成功执行
2. 检查 Markdown 文件是否已被修改
3. 使用 `git diff` 查看文件变更
4. 手动替换或重新运行上传脚本

### 问题 4：缓存问题

**症状**：本地预览显示图片 404

**解决方案**：
1. 清理 Docusaurus 构建缓存：
   ```bash
   yarn clear
   ```
2. 清理浏览器缓存
3. 清理 CDN 缓存（如果使用 CDN）
4. 重新构建站点：
   ```bash
   yarn build
   ```

## 迁移检查清单

完成迁移后，请确认以下事项：

- [ ] 已备份所有文档和图片
- [ ] 已清理 File Browser 中的旧图片
- [ ] 已使用新脚本重新上传所有图片
- [ ] 所有图片验证通过（无 404 错误）
- [ ] 文档中的图片链接已更新
- [ ] 本地预览正常显示图片
- [ ] 多语言文档图片链接已同步
- [ ] 已清理构建缓存和浏览器缓存
- [ ] 已部署到生产环境并验证

## 技术支持

如果遇到问题无法解决，请联系技术支持团队并提供以下信息：

1. 错误信息截图或日志
2. 使用的命令和参数
3. `.upload-config.json` 配置文件（隐藏敏感信息）
4. 验证脚本的输出结果

## 相关文档

- [路径映射算法文档](./path-mapping-optimization-proposal.md)
- [图片上传使用指南](../README.md)
- [测试文档](../test/README.md)