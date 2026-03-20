# 路径映射算法详解

## 算法概述

路径映射算法将本地文档路径和图片路径映射为云端存储路径，确保图片与文档结构保持一致。

**核心函数**: `generateRemotePath(docPath, imagePath)`

**文件位置**: `.image-upload/lib/path-mapper.js`

---

## 算法流程

### 1. 输入验证

首先对输入参数进行严格验证，确保安全性：

```javascript
// 必需性检查
if (!docPath || !imagePath) {
  throw new Error('Both docPath and imagePath are required');
}

// 类型检查
if (typeof docPath !== 'string' || typeof imagePath !== 'string') {
  throw new Error('docPath and imagePath must be strings');
}

// 路径遍历攻击防护
if (docPath.includes('..') || imagePath.includes('..')) {
  throw new Error('Path traversal detected');
}
```

### 2. 远程 URL 检测

如果图片路径是远程 URL，直接返回原路径，不做处理：

```javascript
if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
  return imagePath;
}
```

**示例**:
- 输入: `/img/test.png` → 进入后续处理
- 输入: `https://example.com/image.png` → 直接返回原 URL

### 3. 提取文档层级

提取文档路径中的目录结构和文件名：

**步骤**:

1. **标准化路径分隔符**
   - Windows 路径: `docs\1-series\2-guide\0-overview.md`
   - 转换为: `docs/1-series/2-guide/0-overview.md`

2. **移除 'docs' 前缀**
   - 输入: `docs/1-neoedge-ng4500-series/2-user-guide/1-quick-start.md`
   - 输出: `1-neoedge-ng4500-series/2-user-guide/1-quick-start.md`

3. **识别文件和目录**
   - 检查最后部分是否以 `.md` 结尾
   - 如果是文件，提取文件名（移除 `.md` 后缀）
   - 如果没有文件，所有部分都是目录

4. **移除数字前缀**
   - 规则: `^\d+-(.+)$`
   - 示例: `1-neoedge-ng4500-series` → `neoedge-ng4500-series`
   - 示例: `0-overview.md` → `overview`

**示例**:

| 输入 | directories | filename |
|------|-------------|----------|
| `docs/1-neoedge-ng4500-series/0-overview.md` | `['neoedge-ng4500-series']` | `overview` |
| `docs/overview.md` | `[]` | `overview` |
| `docs/1-series/2-guide/3-topic/0-detail.md` | `['series', 'guide', 'topic']` | `detail` |

### 4. 提取图片文件名

提取图片路径中的文件名，只处理以 `/img/` 开头的路径：

**步骤**:

1. **验证路径前缀**
   - 只处理以 `/img/` 开头的路径
   - 其他路径（如 `/static/img/test.png`）返回 `null`

2. **提取文件名**
   - 获取 `/img/` 之后的部分
   - 分割路径，取最后一个部分作为文件名

3. **URL 编码**
   - 对文件名进行 URL 编码，支持中文、空格等特殊字符

**示例**:

| 输入 | 输出 |
|------|------|
| `/img/NG45XX_GPIO.png` | `{ filename: 'NG45XX_GPIO.png' }` |
| `/img/test/架构图.png` | `{ filename: '%E6%9E%B6%E6%9E%84%E5%9B%BE.png' }` |
| `/img/test/my image.png` | `{ filename: 'my%20image.png' }` |
| `/static/img/test.png` | `null` |

### 5. 构建远程路径

根据文档层级和图片文件名构建最终的云端存储路径：

**路径结构**:
```
/img/ + [directories] + [filename] + image_filename
```

**决策逻辑**:

- 如果文档有文件名（`docHierarchy.filename` 存在），则包含文件名作为中间路径
- 这样可以为每个文档创建独立的图片目录，避免图片冲突

**示例**:

| 文档路径 | 图片路径 | 输出 |
|----------|----------|------|
| `docs/1-neoedge-ng4500-series/0-overview.md` | `/img/test/diagram.png` | `/img/neoedge-ng4500-series/overview/diagram.png` |
| `docs/overview.md` | `/img/test/diagram.png` | `/img/overview/diagram.png` |
| `docs/1-series/2-guide/3-topic/0-detail.md` | `/img/app/image.png` | `/img/series/guide/topic/detail/image.png` |

---

## 边界情况处理

### 1. 远程 URL

| 情况 | 输入 | 输出 | 说明 |
|------|------|------|------|
| HTTPS URL | `https://example.com/img.png` | `https://example.com/img.png` | 不处理远程图片 |
| HTTP URL | `http://example.com/img.png` | `http://example.com/img.png` | 不处理远程图片 |

### 2. 非 /img/ 路径

| 情况 | 输入 | 输出 | 说明 |
|------|------|------|------|
| Static 路径 | `/static/img/test.png` | `/static/img/test.png` | 只处理 /img/ 开头 |
| 相对路径 | `./images/test.png` | `./images/test.png` | 不处理相对路径 |

### 3. 根文档

| 情况 | 输入 | 输出 | 说明 |
|------|------|------|------|
| 根级别文档 | `docs/overview.md` + `/img/test.png` | `/img/overview/test.png` | 使用文件名作为层级 |
| 无目录层级 | `docs/1-guide.md` + `/img/img.png` | `/img/guide/img.png` | 文件名成为唯一标识 |

### 4. 中文和特殊字符

| 情况 | 输入 | 输出 | 说明 |
|------|------|------|------|
| 中文文件名 | `/img/测试.png` | `/img/.../%E6%B5%8B%E8%AF%95.png` | URL 编码 |
| 空格文件名 | `/img/my image.png` | `/img/.../my%20image.png` | URL 编码 |

### 5. Windows 路径

| 情况 | 输入 | 输出 | 说明 |
|------|------|------|------|
| Windows 路径 | `docs\1-series\2-guide\0-overview.md` | `/img/series/guide/overview/...` | 自动转换为 Unix 路径 |

### 6. 深层目录

| 情况 | 输入 | 输出 | 说明 |
|------|------|------|------|
| 5+ 层级 | `docs/1-series/2-board/3-guide/4-topic/5-detail.md` | `/img/series/board/guide/topic/detail/...` | 支持任意层级 |

### 7. 安全性

| 情况 | 输入 | 输出 | 说明 |
|------|------|------|------|
| 路径遍历攻击 | `../etc/passwd` | **抛出异常** | 拒绝包含 `..` 的路径 |
| 空值输入 | `null` | **抛出异常** | 要求必需参数 |
| 非字符串输入 | `123` | **抛出异常** | 要求字符串类型 |

---

## 设计决策

### 为什么包含文档文件名？

**问题**: 如果只使用目录层级，不同文档的图片可能会冲突。

**示例**:
```
docs/1-hardware/2-guides/1-quick-start.md  → /img/hardware/guides/image.png
docs/1-hardware/2-guides/2-advanced.md      → /img/hardware/guides/image.png  (冲突！)
```

**解决方案**: 包含文档文件名作为中间路径。
```
docs/1-hardware/2-guides/1-quick-start.md  → /img/hardware/guides/quick-start/image.png
docs/1-hardware/2-guides/2-advanced.md      → /img/hardware/guides/advanced/image.png  (无冲突)
```

### 为什么移除数字前缀？

**问题**: 数字前缀用于排序，不应该出现在最终的云端路径中。

**示例**:
```
docs/1-neoedge-ng4500-series/0-overview.md  → /img/1-neoedge-ng4500-series/0-overview/image.png (冗余)
```

**解决方案**: 使用正则表达式移除数字前缀。
```
docs/1-neoedge-ng4500-series/0-overview.md  → /img/neoedge-ng4500-series/overview/image.png (简洁)
```

### 为什么只提取图片文件名？

**问题**: 图片路径可能包含深层目录结构，但这些结构与文档无关。

**示例**:
```
文档: docs/1-hardware/0-guide.md
图片: /img/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png
如果保留路径: /img/hardware/guide/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png (过长)
```

**解决方案**: 只提取文件名，将所有图片放在文档层级下。
```
输出: /img/hardware/guide/NG45XX_GPIO.png (简洁且组织清晰)
```

### 为什么进行 URL 编码？

**问题**: 文件名可能包含中文、空格等特殊字符，这些字符在 URL 中需要编码。

**示例**:
```
输入: /img/架构图.png
如果不编码: /img/.../架构图.png (可能无法访问)
```

**解决方案**: 使用 `encodeURIComponent` 进行 URL 编码。
```
输出: /img/.../%E6%9E%B6%E6%9E%84%E5%9B%BE.png (可访问)
```

---

## API 参考

### generateRemotePath(docPath, imagePath)

生成远程路径的核心函数。

**参数**:
- `docPath` (string): 文档路径，如 `docs/1-neoedge-ng4500-series/0-overview.md`
- `imagePath` (string): 图片路径，如 `/img/test/image.png`

**返回值**: `string` - 映射后的云端路径

**异常**:
- `Error: Both docPath and imagePath are required` - 参数缺失
- `Error: docPath and imagePath must be strings` - 类型错误
- `Error: Path traversal detected` - 路径遍历攻击

### mapImagePath(localImagePath, docPath)

包装函数，保持与旧 API 的兼容性。

**参数**:
- `localImagePath` (string): 本地图片路径
- `docPath` (string): 文档路径

**返回值**: `string` - 映射后的路径

### mapImagePaths(localImagePaths, docPath)

批量映射图片路径。

**参数**:
- `localImagePaths` (string[]): 本地图片路径数组
- `docPath` (string): 文档路径

**返回值**: `Object` - 映射关系 `{ 原路径: 映射后路径 }`

### extractFolderName(docPath)

从文档名提取文件夹名（向后兼容）。

**参数**:
- `docPath` (string): 文档路径

**返回值**: `string` - 提取的文件夹名

---

## 测试覆盖

路径映射算法拥有 97%+ 的测试覆盖率，包括：

- **基础功能**: 2-5 级目录层级处理
- **边界情况**: 根文档、Windows 路径、非 /img/ 路径
- **安全性**: 输入验证、路径遍历防护、类型检查
- **URL 编码**: 中文、空格等特殊字符
- **向后兼容**: 包装函数和批量映射
- **错误处理**: 异常情况下的降级处理

测试文件位置: `.image-upload/test/path-mapper.test.js`

---

## 示例场景

### 场景 1: 产品文档

```
文档路径: docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/0-dev-guide.md
图片路径: /img/ne301/application-guide/architecture/overview.png
输出: /img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/overview.png
```

### 场景 2: 多语言文档

```
文档路径: docs/3-hardware-dev-resources/0-overview.md
图片路径: /img/硬件架构图.png
输出: /img/hardware-dev-resources/overview/%E7%A1%AC%E4%BB%B6%E6%9E%B6%E6%9E%84%E5%9B%BE.png
```

### 场景 3: 深层嵌套

```
文档路径: docs/1-series/2-board/3-guide/4-topic/5-detail/6-example.md
图片路径: /img/test/screenshot.png
输出: /img/series/board/guide/topic/detail/example/screenshot.png
```

---

## 性能考虑

- **时间复杂度**: O(n)，其中 n 是路径的深度
- **空间复杂度**: O(n)，存储分割后的路径组件
- **优化**: 使用简单的字符串操作，避免复杂的正则表达式
- **安全性**: 防止路径遍历攻击，确保输入验证

---

## 维护指南

### 添加新规则

如果需要修改路径映射逻辑：

1. 修改 `extractDocHierarchy` 函数处理文档路径
2. 修改 `extractImageComponents` 函数处理图片路径
3. 修改 `buildRemotePath` 函数构建最终路径
4. 添加对应的测试用例

### 添加新测试

在 `.image-upload/test/path-mapper.test.js` 中添加：

```javascript
describe('新场景', () => {
  it('should handle new case', () => {
    const docPath = 'docs/...';
    const imagePath = '/img/...';
    const result = generateRemotePath(docPath, imagePath);
    expect(result).toBe('/img/...');
  });
});
```

---

## 相关资源

- **实现文件**: `.image-upload/lib/path-mapper.js`
- **测试文件**: `.image-upload/test/path-mapper.test.js`
- **优化提案**: `.image-upload/docs/path-mapping-optimization-proposal.md`
- **集成测试**: `.image-upload/test/integration-test.js`