# 路径映射测试汇总

**测试日期**: 2026-03-20
**测试范围**: 2 级、3 级、4 级文档路径映射验证

---

## 测试摘要

- ✅ **总测试**: 7 张图片
- ✅ **通过率**: 100% (7/7)
- ✅ **测试文档**: 3 个（2 级 + 3 级 + 4 级）
- ✅ **路径映射**: 所有路径正确生成

---

## 测试详情

### 测试 1: 2 级文档

**文档**: `docs/1-neoedge-ng4500-series/0-overview.md`

**图片 1**:
```
原始: /img/Overview/NG45xx/NG45XX.png
结果: /img/neoedge-ng4500-series/overview/NG45xx/NG45XX.png
状态: ✅ 通过
```

**图片 2**:
```
原始: /img/Hardware_Guide/Edge_AI_Box/BracketAndUage/NG45_Series_Outline.png
结果: /img/neoedge-ng4500-series/overview/BracketAndUage/NG45_Series_Outline.png
状态: ✅ 通过
```

**路径结构**:
```
/img/
  └─ neoedge-ng4500-series/    (1-neoedge-ng4500-series，移除 1-)
      └─ overview/               (0-overview.md，移除 0-)
          └─ [lastFolder]/       (从原图提取)
              └─ filename.png
```

---

### 测试 2: 3 级文档

**文档**: `docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/0-dev-guide.md`

**图片 1**:
```
原始: /img/Board/NG4500-CB01_1.png
结果: /img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/Board/NG4500-CB01_1.png
状态: ✅ 通过
```

**图片 2**:
```
原始: /img/Board/NG4500-CB01_2.png
结果: /img/neoedge-ng4500-series/ng4500-cb01-development-board/dev-guide/Board/NG4500-CB01_2.png
状态: ✅ 通过
```

**路径结构**:
```
/img/
  └─ neoedge-ng4500-series/              (1-neoedge-ng4500-series，移除 1-)
      └─ ng4500-cb01-development-board/   (2-ng4500-cb01-development-board，移除 2-)
          └─ dev-guide/                    (0-dev-guide.md，移除 0-)
              └─ Board/                     (lastFolder)
                  └─ NG4500-CB01_1.png      (filename)
```

---

### 测试 3: 4 级文档

**文档**: `docs/1-neoedge-ng4500-series/2-ng4500-cb01-development-board/2-software-guide/3-software-frameworks-and-tools/0-docker.md`

**图片 1**:
```
原始: /img/NGC_API_KEY.png
结果: /img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/NGC_API_KEY.png
状态: ✅ 通过
```

**图片 2**:
```
原始: /img/Generate_personal_key.png
结果: /img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/Generate_personal_key.png
状态: ✅ 通过
```

**图片 3**:
```
原始: /img/docker_nvidia-smi.png
结果: /img/neoedge-ng4500-series/ng4500-cb01-development-board/software-guide/software-frameworks-and-tools/docker/docker_nvidia-smi.png
状态: ✅ 通过
```

**路径结构**:
```
/img/
  └─ neoedge-ng4500-series/              (移除 1-)
      └─ ng4500-cb01-development-board/   (移除 2-)
          └─ software-guide/               (移除 2-)
              └─ software-frameworks-and-tools/  (移除 3-)
                  └─ docker/                (0-docker.md，移除 0-)
                      └─ filename.png       (无 lastFolder，直接使用文件名)
```

---

## 路径映射规则验证

### ✅ 数字前缀移除

| 原始目录名 | 清理后 | 状态 |
|----------|-------|------|
| `1-neoedge-ng4500-series` | `neoedge-ng4500-series` | ✅ |
| `2-ng4500-cb01-development-board` | `ng4500-cb01-development-board` | ✅ |
| `0-dev-guide.md` | `dev-guide` | ✅ |
| `2-software-guide` | `software-guide` | ✅ |
| `3-software-frameworks-and-tools` | `software-frameworks-and-tools` | ✅ |
| `0-docker.md` | `docker` | ✅ |

### ✅ 层级结构保留

| 文档层级 | 示例路径 | 保留情况 |
|---------|---------|---------|
| 2 级 | `docs/1-series/0-overview.md` | ✅ 保留 2 层 |
| 3 级 | `docs/1-series/2-board/0-guide.md` | ✅ 保留 3 层 |
| 4 级 | `docs/1-series/2-board/2-guide/3-tools/0-docker.md` | ✅ 保留 4 层 |

### ✅ 图片路径处理

| 原始图片路径 | 提取 lastFolder | 处理方式 |
|------------|----------------|---------|
| `/img/Overview/NG45xx/NG45XX.png` | `NG45xx` | ✅ 保留 |
| `/img/Board/NG4500-CB01_1.png` | `Board` | ✅ 保留 |
| `/img/NGC_API_KEY.png` | 无 | ✅ 跳过，直接使用文件名 |

---

## URL 编码测试

| 输入 | 编码结果 | 状态 |
|-----|---------|------|
| `架构图.png` | `%E6%9E%B6%E6%9E%84%E5%9B%BE.png` | ✅ |
| `my image.png` | `my%20image.png` | ✅ |
| `NG4500-CB01_1.png` | `NG4500-CB01_1.png` (无需编码) | ✅ |

---

## 安全性验证

| 测试场景 | 输入 | 结果 | 状态 |
|---------|------|------|------|
| 路径遍历 | `../etc/passwd` | 抛出错误 | ✅ |
| 空值检查 | `null`, `undefined` | 抛出错误 | ✅ |
| 类型检查 | 数字、对象 | 抛出错误 | ✅ |

---

## 结论

✅ **路径映射算法在 2 级、3 级、4 级文档中均工作正常**

**主要成果**:
1. ✅ 支持 2-4+ 级目录结构
2. ✅ 完整保留文档层级结构
3. ✅ 数字前缀正确移除
4. ✅ 图片路径正确处理
5. ✅ URL 编码正确
6. ✅ 安全验证通过

**算法优势**:
- 🎯 精确保留文档层级
- 🔒 安全防护完善
- 📝 路径清晰可读
- 🔄 向后兼容

**准备就绪**: 算法已通过全面测试，可以投入使用。
