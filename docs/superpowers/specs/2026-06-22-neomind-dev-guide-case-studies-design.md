# NeoMind 开发指南·工程实践案例集 设计文档

- **状态**：已通过 brainstorming，待 spec review
- **作者**：shenmingming + Claude
- **日期**：2026-06-22
- **目标读者**：二次开发者（ NeoMind-Extensions / NeoMind-Dashboard-Components 的贡献者和使用者）
- **关联仓库**：
  - `CamThink Project/NeoMind-Extensions`（17 个扩展）
  - `CamThink Project/NeoMind-Dashboard-Components`（6 个组件）
  - `Marketing/wiki-documents`（本文档所在地）

---

## 1. 背景与动机

### 1.1 现状

`docs/0-neomind/developer-guide/` 下已有 9 篇通用参考文档（架构、Extension SDK、REST API、扩展开发、仪表板组件开发等），总计约 3000 行。问题：

1. **内容深度不足** — 偏 API 概览，缺少"真实工程里怎么用、为什么这么写"的实战剖析
2. **质量一致性弱** — 不同章节作者/时期不同，风格、深度、颗粒度不统一
3. **缺少读者路径** — 没有面向"我想做一个具体东西"的 task-oriented 入口

### 1.2 目标

新增**工程实践案例集**子目录，从两个源仓库的 17 个扩展 + 6 个组件中**精选 7 个代表性案例**，做完整工程剖析。重点不在"API 是什么"（已有通用参考），而在**"真实代码里为什么这样设计、踩过哪些坑、标准如何落地"**。

### 1.3 非目标

- 不重写已有的通用 API 参考（`7-extension-development.md`、`8-dashboard-component-dev.md` 等）
- 不覆盖全量 17+6 = 23 个扩展/组件（只选 7 个）
- 不做自动化 CI 校验链接有效性（人工 audit 即可）

---

## 2. 整体设计

### 2.1 目录结构

在 `docs/0-neomind/developer-guide/` 下新增 `case-studies/` 子目录：

```
docs/0-neomind/developer-guide/
  case-studies/
    _category_.json
    0-overview.md                         # 索引 + 4 条阅读路径
    appendix-standards.md                 # 共享附录：工程标准一览
    1-weather-forecast.md                 # 入门 · 数据型扩展
    2-yolo-device-inference.md            # 进阶 · AI 推理扩展
    3-yolo-video-v2.md                    # 进阶 · 流式扩展
    4-onvif-bridge.md                     # 进阶 · 标准协议桥接
    5-uink-rms-bridge.md                  # 进阶 · 生产验证桥接
    6-metric-card-component.md            # 入门 · 仪表板组件
    7-ne101-camera-component/             # ★ 旗舰案例（子目录）
      _category_.json
      index.md                            # 案例总览 + 学习路径
      1-background.md                     # 业务背景：NE101 设备能力 + 用户痛点
      2-architecture.md                   # 端到端架构
      3-extension-side.md                 # 扩展侧：产出结构化数据
      4-data-contract.md                  # ★ 数据契约：扩展与前端如何对账
      5-frontend-consume.md               # ★ 前端侧：消费扩展数据流
      6-component-build.md                # ★ 组件封装：原始数据 → 可复用组件
      7-integration-test.md               # 集成测试与发布
      8-deep-dive.md                      # 高级话题
```

中英文完全镜像，路径：

```
i18n/en/docusaurus-plugin-content-docs/current/0-neomind/developer-guide/case-studies/
```

### 2.2 案例选型

| # | 案例 | 类型 | 难度 | 体量（行/篇） | 价值点 |
|---|------|------|------|--------------|--------|
| 1 | weather-forecast-v2 | 数据型扩展 | 入门 | ~400 | 第一个扩展范本（HTTP 拉取 + 周期指标 + React 前端） |
| 2 | yolo-device-inference | AI 推理 | 进阶 | ~700 | 模型懒加载 / 跨 session 复用 / 设备相机集成 |
| 3 | yolo-video-v2 | 流式扩展 | 进阶 | ~700 | stream session + 视频帧处理 + VLM 仪表板联动 |
| 4 | onvif-bridge | 协议桥接 | 进阶 | ~700 | IP 摄像头 / 标准协议接入（呼应 NeoEyes） |
| 5 | uink-rms-bridge | 协议桥接 | 进阶 | ~700 | **真实生产验证**的桥接 |
| 6 | metric_card | 仪表板组件 | 入门 | ~400 | 组件范本（数值卡 + 阈值/趋势/单位） |
| 7 | **ne101_camera** | 扩展-组件联动 | **旗舰** | ~2500-3500（拆 8 子页） | 端到端深度教程 |

### 2.3 阅读路径（在 `0-overview.md` 显式声明）

- **路径 1（新手）**：#1 → #6 → #7
- **路径 2（AI 工程师）**：#2 → #3 → #7
- **路径 3（工业集成商）**：#4 → #5 → #7
- **路径 4（组件开发者）**：#6 → #7 → 任意扩展案例

### 2.4 组件源码格式说明（重要）

NeoMind Dashboard Components 采用**手写 IIFE JavaScript**作为分发格式（文件名 `bundle.js` 但**不是编译产物**）：

- 使用 `var React = window.React` + `var jsx = window.jsxRuntime.jsx` 注入运行时依赖
- 完整注释、合理分行、可读性接近源码
- 无需打包工具链即可分发（Docusaurus 直接挂载）
- 352 行（metric_card）/ 1972 行（ne101_camera）

**因此案例集 #6 / #7 的"关键代码走读"和"深链接"直接指向 `bundle.js` 的具体行号**，与扩展案例指向 `src/*.rs` 的处理方式一致。所有质量门槛（代码片段 < 30 行、git log 工程演进、标注式注释）均适用。

### 2.5 与现有文档的关系

- 现有 `7-extension-development.md` / `8-dashboard-component-dev.md` 保留为**API 通用参考**
- 案例集在合适处**交叉引用**通用参考（避免重复）
- 案例集开头明确声明："通用 API 见 X，本篇只讲工程实战"

---

## 3. 案例模板

### 3.1 标准模板（适用于 #1-#6）

```
1. 案例背景
   - 解决什么问题
   - 适用场景与读者画像
   - 在 NeoMind 生态中的定位

2. 架构总览
   - mermaid 架构图（组件分层 + 数据流）
   - 涉及的核心抽象（Extension trait / Stream / Component manifest）

3. 实现剖析（占全文 50%）
   - 目录结构逐项说明
   - 关键文件走读（含源码链接到源仓库具体行）
   - 关键 API 调用链

4. 设计权衡（Why）
   - 至少 2-3 个核心决策
   - 每个决策：可选方案 / 选择理由 / 代价

5. 技术栈拆解
   - Rust crates / React libs / 构建工具
   - 为什么选这些（替代方案对比）

6. 标准落地（show, don't tell）
   - metadata.json 实例解读
   - capability 申请策略
   - 版本号三段一致性
   - 跨平台构建目标
   - 测试覆盖要求

7. 常见坑与最佳实践
   - 已知陷阱
   - 调试技巧
   - 性能/安全注意事项

8. 延伸阅读
   - 通用 API 参考（链接现有 dev-guide）
   - 源码仓库链接
   - 相关案例
```

### 3.2 旗舰模板（#7 ne101-camera，子页面拆分）

由于"扩展 + 前端 + 设备"三者融合的特殊性，旗舰案例采用**子页面**形式：

| 子页面 | 重点 | 体量 |
|--------|------|------|
| `index.md` | 案例总览 + 学习路径 | ~150 行 |
| `1-background.md` | NE101 设备能力 + 用户痛点 + 在生态中的定位 | ~300 行 |
| `2-architecture.md` | 端到端架构图（扩展 ↔ 数据契约 ↔ 前端组件） | ~400 行 |
| `3-extension-side.md` | 通用契约机制（`processingExtensionId`）+ yolo-device-inference 具体演示（交叉引用 #2） | ~400 行 |
| `4-data-contract.md` ★ | 扩展 `metadata.json` ↔ 前端 TS 类型 ↔ 运行时数据流的对应关系 + 契约版本演进 | ~500 行 |
| `5-frontend-consume.md` ★ | React 组件订阅扩展数据 / 生命周期 / 错误边界 / 断连重连 | ~500 行 |
| `6-component-build.md` ★ | 原始数据 → 可复用组件：props / manifest schema / 默认值 / 主题适配 | ~500 行 |
| `7-integration-test.md` | 集成测试策略 + 发布流程 | ~300 行 |
| `8-deep-dive.md` | 高级话题：性能 / 错误处理 / 可扩展性边界 | ~400 行 |

**3 个带 ★ 的子页面是核心**，直接回答用户提出的"前端如何用数据整合扩展，开发可复用高级组件"。

> **关于 `3-extension-side.md`**：ne101_camera 的 `manifest.json` 通过 `processingExtensionId`（可配置）消费**任意** AI 处理扩展的输出（如 `yolo-device-inference` / `ocr-device-inference` 等），不是和单一扩展绑定。因此该子页面采用**通用契约 + 具体演示**结构：先讲清"任何处理扩展如何接入 ne101_camera"的契约，再用 yolo-device-inference 做端到端实例。

---

## 4. 工程解读的质量门槛

### 4.1 反模式（必须避免）

| 反模式 | 表现 | 危害 |
|--------|------|------|
| **API 流水账** | "先调 X，再调 Y，参数是 Z" | 读者看完不知道为什么这么写 |
| **源码贴满** | 把整段 Rust/TS 代码贴进来 | 等于让读者读两遍源码 |
| **理由空洞** | "这样设计更好" "符合最佳实践" | 没说清楚好在哪里、和什么对比 |
| **只讲 What 不讲 Why/Trade-off** | 只描述现状，回避替代方案 | 读者无法迁移到自己的场景 |
| **隐藏踩坑** | 只讲成功路径 | 读者复现时被坑 |

### 4.2 五条硬标准（每段"实现剖析"和"设计权衡"必须满足）

**标准 1：每个关键决策必须有 ≥2 个被否决的替代方案**
- ✅ "我们选 `lazy_load` 而非 `preload`，替代方案 A（启动加载）的代价是冷启动慢 3s，替代方案 B（每次推理后卸载）的代价是首帧延迟高 800ms"
- ❌ "我们使用 lazy_load 加载模型"

**标准 2：每个数据结构/接口必须回答"为什么是这个形状"**
- ✅ "metric 用 `(name, unit, value)` 三元组而非 `Map<String, f64>`，是为了让规则引擎无需查表就能做单位换算和阈值判断"
- ❌ "metric 结构包含 name、unit、value 三个字段"

**标准 3：代码片段不超过 30 行，且必须有"标注式注释"**
- 贴的不是"完整源码"，而是**关键决策点**的浓缩片段
- 每个片段至少 1-2 行"为什么这样写"的注释
- 完整代码用深链接指向源仓库

**标准 4：每个"标准落地"必须包含一个反例**
- ✅ "如果我们不在 metadata.json 里声明 `camera:read` capability，运行时会 panic（而非降级）——这是有意为之，强制开发者显式申请权限"
- ❌ "metadata.json 需要 capabilities 字段"

**标准 5：每个案例必须包含至少 1 个"工程演进解读"**
- 来源：源仓库的 `git log`
- 形式：症状 → 根因 → 修复 → 教训
- 不编造，只解读真实 commit

### 4.3 验收清单（每篇案例落盘前自查）

```
[ ] 至少 3 个关键设计决策，每个都有 2+ 替代方案对比
[ ] 至少 1 个工程演进解读（从 git log 提取）
[ ] 至少 5 处"为什么这样写"的标注式注释（不是 what）
[ ] 所有代码片段 < 30 行，完整实现用深链接
[ ] 所有"标准落地"段都含 1 个反例
[ ] mermaid 图至少 2 张（架构图 + 数据流图）
[ ] 源码链接全部指向 main 分支具体行号
```

### 4.4 源仓库卫生约束

部分源仓库存在历史遗留的卫生问题，案例写作时遵守以下约束：

- **yolo-device-inference**：`src/` 下存在 18 个 `lib.rs.bak/final/backup` 备份文件（`lib.rs*` 共 19 个，减去 1 个真实 `lib.rs`）。**所有深链接只指向 `lib.rs` 主文件**，备份文件一律不引用。
- **反例化处理**：在案例 #2 的"常见坑与最佳实践"段，把"备份文件堆积"作为**反面教材**写出来，提醒社区贡献者维护源仓库卫生。
- **git log 解读**：解读 yolo-device-inference 演进时，过滤掉仅修改备份文件的噪声提交，只解读有实质工程意义的 commit。

### 4.5 旗舰案例 ne101-camera 的额外门槛

| 门槛 | 数据来源 |
|------|----------|
| 端到端时序图 | 从源码调用链推导 |
| 工程演进解读 | **git log 提取**（设计变更、bug 修复、重构的 commit message） |
| 错误处理链 | 从源码的 `Result`/`?`/`unwrap`/错误传播路径提取（不编造） |
| 可复用性边界 | 从代码的硬编码常量、配置项、`TODO`/`FIXME` 注释提取 |

**所有内容必须可从源码/commit 历史验证**，不依赖用户额外提供素材。

---

## 5. 横向机制与可维护性

### 5.1 共享"工程标准附录"

新增 `case-studies/appendix-standards.md`，内容：

- metadata.json schema 全字段表
- capability 类目全表
- 版本号三段一致性规则（VERSION / index.json / Cargo.toml）
- 6 个跨平台构建目标矩阵
- 测试覆盖率要求
- 发布 checklist
- 安全要求（unsafe / capability 申请）

每篇案例的"标准落地"章节**只讲本案例具体怎么用**这套标准，并链接回附录，避免重复。

### 5.2 源码引用规范

所有"关键代码走读"统一采用深链接格式：

```markdown
查看完整实现：[`src/metrics.rs`](https://github.com/<org>/NeoMind-Extensions/blob/main/extensions/weather-forecast-v2/src/metrics.rs#L42-L87) L42-87
```

> **注**：示例 URL 中的 `<org>` 在写作时替换为实际 GitHub 组织/用户（Extensions 仓库与 Dashboard-Components 仓库可能分属不同 org，落盘前需核实 canonical org）。

- 链接到 GitHub 源仓库的具体行号
- 行号区间便于读者快速跳转
- 源仓库改动时链接会指向最新 `main`（案例定期 audit）

### 5.3 图片与图床

- Mermaid 图直接内嵌（Docusaurus 原生支持，i18n 不影响）
- 截图/架构图统一上传到现有 CDN：`https://resources.camthink.ai/NeoMind/case-studies/`
- 文件命名规范：`<case-id>-<seq>-<desc>.png`，例如 `7-ne101-02-data-flow.png`

### 5.4 i18n 并行机制

每篇中文文档落盘后，**同步翻译**到：

```
i18n/en/docusaurus-plugin-content-docs/current/0-neomind/developer-guide/case-studies/
```

策略：
- 文件路径与中文**完全对应**
- 代码块/命令/字段名**不翻译**
- "Why" 类叙述句意译为主（不逐字）
- 每篇中文定稿 → 标记 `i18n: pending` → 翻译 → 移除标记

### 5.5 维护策略

在 `case-studies/0-overview.md` 顶部维护**版本对齐表**：

| 案例 | 源仓库版本 | SDK 版本 | 最后 audit 日期 |
|------|-----------|----------|-----------------|
| #1 weather-forecast | v2.7.6 | SDK 0.6 | 2026-06-22 |
| #7 ne101-camera | v2.14.9 | SDK 0.6 | 2026-06-22 |

源仓库 release 时触发案例 audit（人工，非自动化）。

---

## 6. 实施分阶段

### Phase 1 — 基础设施（独立 PR）

- 新增 `case-studies/_category_.json` + `0-overview.md` + `appendix-standards.md`
- 现有 `7-extension-development.md` / `8-dashboard-component-dev.md` 添加"案例集交叉链接"
- 中英文目录同时建立

### Phase 2 — 2 个入门案例（验证模板）

- #1 weather-forecast-v2
- #6 metric_card
- 用这 2 篇**校准模板是否好用**，发现不顺手的地方先改模板再写后续

### Phase 3 — 4 个进阶案例（批量产出）

- #2 yolo-device-inference
- #3 yolo-video-v2
- #4 onvif-bridge
- #5 uink-rms-bridge

### Phase 4 — 旗舰案例 ne101-camera（最后）

- 8 个子页面
- 完成后写一篇"案例集发布说明"提交到 `7-release-notes/`

### 单篇工作流

1. 读源仓库代码 + `git log` 提取工程演进
2. 起草中文初稿（严格按模板 + 5 条硬标准）
3. 自查 7 项验收清单
4. 翻译英文版
5. 双语一起提交

---

## 7. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 源仓库代码演进导致链接失效 | 深链接指向 `main` 分支，定期 audit；版本对齐表记录最近 audit 日期 |
| 案例集与通用参考内容重复 | 案例集只讲"工程实战 + Why"，通用参考只讲"API 是什么"；交叉链接而非复述 |
| 旗舰案例体量大、周期长 | 拆 8 子页面，每子页面独立交付；先完成 `index.md` + 3 个 ★ 子页面（核心），其余子页面后续补 |
| 中英文双语维护成本 | 同 PR 提交双语；翻译在中文定稿后立即进行，避免堆积 |
| 工程解读流于表面 | 5 条硬标准 + 验收清单强制约束；spec review 时按清单逐项检查 |

---

## 8. 验收标准（整个案例集完成时）

- [ ] 7 个案例 + 1 个旗舰案例（8 子页）全部落盘
- [ ] 中英文双语完整
- [ ] `0-overview.md` 包含 4 条阅读路径
- [ ] `appendix-standards.md` 覆盖所有共享标准
- [ ] 每篇案例通过 4.3 节验收清单
- [ ] 旗舰案例满足 4.5 节额外门槛
- [ ] 版本对齐表填写完整
- [ ] 现有 `7-extension-development.md` / `8-dashboard-component-dev.md` 添加了交叉链接
- [ ] `7-release-notes/` 新增发布说明

---

## 附录：决策记录

| 决策 | 选项 | 选择 | 理由 |
|------|------|------|------|
| 案例覆盖策略 | 全量模板化 / 代表性精讲 / 分类模板 | 代表性精讲 | 7 个案例平衡覆盖度与可行性 |
| 案例叙述形态 | 独立目录 / 嵌入现有章节 / 模式目录 | 独立 case-studies 子目录 | 叙述完整、不割裂；便于横向对比 |
| 标准章节位置 | 每篇重复 / 共享附录 | 共享附录 + 每篇"标准落地"小节 | 避免重复，保留案例具体性 |
| 旗舰案例形态 | 单篇长文 / 子页面拆分 | 子页面拆分（8 页） | 单页 < 500 行便于阅读与维护 |
| i18n 策略 | 先中文后英文 / 中英并行 | 中英并行 | 已有 i18n 基础设施 |
| 工程演进数据来源 | 用户提供 / git log 提取 | git log 提取 | 用户无法提供素材，源码可验证 |
