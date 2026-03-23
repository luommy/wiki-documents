# 路径映射优化方案

**问题**: 当前算法会保留图片原始路径中的 lastFolder，导致路径冗余。

---

## 问题分析

### 示例文档

**文档路径**:
```
docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/1-driver-installation-and-updates/0-interface-and-modules-configure.md
```

**清理后的文档层级**:
```
neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/driver-installation-and-updates/interface-and-modules-configure
```

**图片原始路径**:
```
/img/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png
```

**当前生成的远程路径**:
```
/wiki/img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/driver-installation-and-updates/interface-and-modules-configure/Driver/NG45XX_GPIO.png
```

**问题**:
- 文档层级已经包含 `driver-installation-and-updates`
- 图片的 lastFolder 又添加了 `Driver`
- 导致语义重复：`driver-installation-and-updates/Driver`

---

## 解决方案

### 方案 A: 完全移除 lastFolder（推荐）

**规则**:
- 只使用文档层级 + 文件名
- 不再从图片原始路径提取 lastFolder

**路径生成**:
```
文档: docs/1-series/2-board/2-guide/1-driver/0-interface.md
图片: /img/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png
结果: /wiki/img/series/board/guide/driver/interface/NG45XX_GPIO.png
      └─ 文档层级──────────────────────────────┘ └─ 文件名
```

**优点**:
- ✅ 路径最简洁
- ✅ 无语义重复
- ✅ 完全基于文档结构
- ✅ 易于理解和维护

**缺点**:
- ❌ 如果同一文档有多个同名图片（不同文件夹），会冲突
  - 例如：`/img/folder1/image.png` 和 `/img/folder2/image.png`
  - 都会映射到：`/wiki/img/.../image.png`

---

### 方案 B: 智能跳过重复的 lastFolder

**规则**:
- 检查 lastFolder 是否与文档层级中的某个目录语义重复
- 如果重复，跳过 lastFolder
- 如果不重复，保留 lastFolder

**重复检测逻辑**:
```javascript
const lastFolder = 'Driver';
const docDirs = ['driver-installation-and-updates', 'interface-and-modules-configure'];

// 规范化比较（转小写，移除连字符）
const normalizedLastFolder = lastFolder.toLowerCase().replace(/-/g, '');
const normalizedDocDirs = docDirs.map(d => d.toLowerCase().replace(/-/g, ''));

// 如果 lastFolder 是某个文档目录的子串，认为重复
const isDuplicate = normalizedDocDirs.some(dir =>
  dir.includes(normalizedLastFolder) || normalizedLastFolder.includes(dir)
);

if (isDuplicate) {
  // 跳过 lastFolder
}
```

**示例**:
```
情况 1: 重复
文档层级: [..., 'driver-installation-and-updates', ...]
lastFolder: 'Driver'
结果: 跳过 'Driver'（因为 'driver' 包含在 'driverinstallationandupdates' 中）

情况 2: 不重复
文档层级: [..., 'software-guide', 'tools']
lastFolder: 'screenshots'
结果: 保留 'screenshots'（与文档目录无关）
```

**优点**:
- ✅ 避免语义重复
- ✅ 保留有意义的文件夹区分
- ✅ 处理同名图片冲突

**缺点**:
- ❌ 逻辑复杂
- ❌ 可能误判（例如 `driver` 和 `drive`）
- ❌ 不够直观

---

### 方案 C: 保留产品 ID 层级（折中）

**规则**:
- 保留图片原始路径中的产品 ID 层级（如 `NG45XX_SOFTWARE`）
- 移除其他文件夹

**路径生成**:
```
文档: docs/1-series/2-board/2-guide/1-driver/0-interface.md
图片: /img/NG45XX_SOFTWARE/Driver/NG45XX_GPIO.png
结果: /wiki/img/series/board/guide/driver/interface/NG45XX_SOFTWARE/NG45XX_GPIO.png
      └─ 文档层级──────────────────┘ └─ 产品ID └─ 文件名
```

**优点**:
- ✅ 保留产品分类信息
- ✅ 减少冲突（增加了产品 ID 层级）
- ✅ 路径仍然清晰

**缺点**:
- ❌ 可能仍然有冗余（如果文档层级已经包含产品信息）
- ❌ 需要识别哪些是产品 ID

---

### 方案 D: 配置化选择（灵活）

**规则**:
- 在配置文件中指定策略：`simple` | `smart` | `preserve-product`
- 默认使用 `simple`（方案 A）

**配置示例**:
```json
{
  "pathMapping": {
    "strategy": "simple",  // simple | smart | preserve-product
    "productIds": ["NG45XX_SOFTWARE", "NE301_SOFTWARE"]
  }
}
```

---

## 推荐方案

**推荐：方案 A（完全移除 lastFolder）**

**理由**:
1. **最简洁**：路径完全基于文档结构，无冗余
2. **最可预测**：用户可以根据文档路径直接推断图片 URL
3. **最易维护**：逻辑简单，不需要复杂的判断
4. **冲突风险低**：实际项目中，同一文档使用不同文件夹的同名图片的情况非常少见

**实施**:
1. 修改 `extractImageComponents()` 函数，移除 lastFolder 提取逻辑
2. 修改 `buildRemotePath()` 函数，不再添加 lastFolder
3. 更新测试用例
4. 重新上传文档

**示例对比**:

| 文档 | 图片原路径 | 新生成路径 |
|------|-----------|-----------|
| `docs/1-series/0-overview.md` | `/img/Overview/NG45xx/NG45XX.png` | `/wiki/img/series/overview/NG45XX.png` |
| `docs/1-series/2-board/0-guide.md` | `/img/Board/board1.png` | `/wiki/img/series/board/guide/board1.png` |
| `docs/1-series/2-board/1-driver/0-wifi.md` | `/img/RTL8821_wifi.png` | `/wiki/img/series/board/driver/wifi/RTL8821_wifi.png` |

---

## 实施步骤

1. **修改代码** (`.image-upload/lib/path-mapper.js`)
   - 移除 `lastFolder` 提取逻辑
   - 简化 `buildRemotePath()` 函数

2. **更新测试**
   - 修改所有测试用例的预期路径
   - 移除 lastFolder 相关测试

3. **重新上传**
   - 运行 `upload-images.sh` 重新上传 `docs/1-neoedge-ng4500-series`
   - 验证生成的路径符合预期

4. **文档更新**
   - 更新 README 中的路径映射示例

**预计时间**: 30 分钟

---

## 问题

请确认是否采用**方案 A（完全移除 lastFolder）**？

如果需要处理同名图片冲突的特殊情况，可以考虑：
- 在文件名前添加数字后缀（如 `image-1.png`, `image-2.png`）
- 或者保留原始的完整文件夹路径（方案未列出）
