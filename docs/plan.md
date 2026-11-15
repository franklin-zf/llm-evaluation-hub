# 工程架构与垂直切片研发计划 (Engineering Plan)

> 权威契约 2/3：由 Architect 内核遵循“代码之禅”与奥卡姆剃刀产出。`[]` 内为稳定机器校验标识。

## 当前仓库与依赖发现 [Current Repository Findings]

- **目录与技术栈**：
  - 项目根路径：`/Users/zhangfeng/Downloads/Personal-Code/GitHub/LLM测评`
  - 核心文档契约：`docs/prd.md`、`docs/content-handoff.json`、`README.md`（完整知识库资料）
  - 运行时与环境：Node.js (`/opt/homebrew/bin/node` v25.2.1，支持原生 ESM 与 `node --test` 测试运行器，零额外安装依赖），现代浏览器（Chrome / Safari / Firefox 原生支持 ES Modules 与 CSS 自定义属性）。
- **构建与测试命令**：
  - 静态单页应用，无需编译构建步骤，直接原生执行。
  - 单元测试命令：`/opt/homebrew/bin/node --test tests/*.test.js`
  - 质量门禁检查：`/opt/homebrew/bin/node /Users/zhangfeng/Downloads/Personal-Code/GitHub/LLM/mini-pi-agent/agent.ts check . --ui`
- **现有依赖审查 [Existing Dependency Review]**：
  - 坚持奥卡姆剃刀原则：前端采用标准原生 Web API（DOM, LocalStorage, Clipboard API, CSS Grid/Flexbox），测试采用 Node.js 原生测试模块（`node:test` 与 `node:assert`）。
  - 严禁引入庞大的前端框架脚手架（如 Webpack/Vite 捆绑包），实现零构建延迟、零脆弱依赖污染。

| 需求能力 [Need] | 已检查标准库/现有依赖 [Checked Stdlib / Existing Dep] | 决策 [Decision] | 理由 [Reason] |
| --- | --- | --- | --- |
| 学习状态存储与打卡 | 浏览器标准 Web Storage API (`localStorage`) | reuse | 纯前端本地持久化，无网络开销，隐私零泄露 |
| 交互式多维矩阵检索 | 原生 JavaScript 数组过滤与正则匹配 (`Array.filter`, `RegExp`) | reuse | 原生高性能数据检索，零外部第三方搜索库依赖 |
| 16 讲深度图文讲义渲染 | 原生 DOM 模块化渲染与 CSS 自适应排版 | reuse | 原生标准 HTML5 渲染，零外部 Markdown 解析器重量级依赖 |
| 代码高亮与剪贴板复制 | 原生 CSS 语法配色 + `navigator.clipboard.writeText` | reuse | 现代浏览器标准内置，支持平稳降级选中文本 |
| 模块化开发与隔离 | 原生 ES Modules (`import` / `export`) | reuse | 现代浏览器与 Node.js 均原生支持，无需打包工具 |
| 单元测试与断言 | Node.js 原生测试套件 (`node:test`, `node:assert/strict`) | reuse | 内置断言与测试套件，执行毫秒级，无 npm 安装风险 |

## 架构设计 [Architecture]

严格遵循奥卡姆剃刀与代码之禅，采用扁平两层架构：

```text
Layer 1: Entrypoint & UI Surface (index.html, styles.css, src/app.js)
  │      - DOM 渲染与事件分发、页面响应式布局
  │      - 深度讲义沉浸式展开/折叠抽屉、章节快速切换
  │      - 深浅色主题切换、输入安全清洗与防抖
  │      - 状态变更后的 DOM 同步更新与动画反馈
  ▼
Layer 2: Core Domain & State Logic (src/data.js, src/lessons.js, src/state.js, src/matrix.js, src/quiz.js)
         - 16 讲体系化图文讲义内容模型与章节检索函数
         - 18+ 学术与工业基准数据集全景百科与分类索引
         - 纯业务规则（学习打卡状态计算、多维筛选过滤、自测算分与错题定位）
         - LocalStorage 读写隔离与原子安全持久化
```

### 复杂度说明与扁平设计 [Complexity Justification & Flat Design]

- **两层扁平架构**：系统严密划分且仅设两层：展示层（Layer 1）与纯领域逻辑层（Layer 2）。展示层直接调用纯领域函数，禁止引入中间代理或过度分层。
- **反过度抽象承诺**：不到 3 处真实独立复用点，绝不引入 `Factory`、`Adapter`、`Strategy`、`Proxy`、`Facade` 或抽象基类等胶水类；所有逻辑采用极简纯函数（Pure Functions）组织。
- **函数嵌套与深度约束**：所有函数缩进层级 `<= 3`，全面使用卫语句（Guard Clauses）提前返回（Early Return），消灭回调地狱与深层 if-else 嵌套。
- **零静默异常**：严禁空的 `catch {}` 代码块；任何捕获的异常必须显式处理、记录或优雅降级并通知用户。

## 数据模型与精简 Schema [Database Design]

- **Lean Schema 声明**：所有数据模型仅定义当前 PRD 确定的 `REQ-001..007` 所需字段。严禁定义 `ext_json`、`extra_data`、`reserved_*` 或投机性备用字段，零预留扩展字段。
- **数据结构定义**：
  - `CurriculumWeek`: `{ id: string, weekNum: number, title: string, subtitle: string, milestones: Array<{ id: string, label: string }>, resources: string[] }`
  - `LessonChapter`: `{ id: string, weekNum: number, milestoneId: string, title: string, category: string, readingTimeMinutes: number, summary: string, deepDiveContent: { background: string, coreConcepts: Array<{ term: string, definition: string, formulaOrAscii?: string }>, methodologyComparison?: Array<{ method: string, pros: string, cons: string, scenario: string }>, practicalGuide: string[], pitfalls: string[] } }`
  - `BenchmarkDataset`: `{ id: string, name: string, category: string, categoryName: string, publisher: string, releaseYear: number, sampleType: string, keyMetrics: string, antiContaminationMechanism: string, description: string, benchmarkExample: string }`
  - `FrameworkItem`: `{ id: string, name: string, category: string, repo: string, stars: string, badge: string, highlight: string, scene: string, command: string }`
  - `VideoItem`: `{ id: string, title: string, speakers: string, channel: string, keyTakeaway: string, searchUrl: string }`
  - `CodeScaffold`: `{ id: string, title: string, subtitle: string, lang: string, filename: string, code: string, keyPoints: string[] }`
  - `QuizQuestion`: `{ id: string, milestoneId: string, prompt: string, options: string[], answerIndex: number, explanation: string }`
  - `UserLearningState`: `{ completedMilestones: string[], quizAnswers: Record<string, number>, theme: "dark" | "light" }`
- **并发与原子性策略**：对 `localStorage` 的写入通过 `StateStore` 封装，加入 try-catch 安全防护，并在写入前完成 JSON 序列化验证，避免存储被脏数据击穿。

## 七维业务规则防御矩阵 [Business Rule Matrix]

| 规则编号 [Rule ID] | 适用模块 [Applicable Modules] | 维度 [Dimension] | 场景与防御设计 [Description & Scenarios] | 是否适用 [Applicable] | 验证策略与测试接缝 [Verification Strategy & Test Reference] |
| --- | --- | --- | --- | --- | --- |
| BR-1 | MOD-001, MOD-002, MOD-004, MOD-005 | Normal Path | 正常输入与标准主流程闭环：讲义章节瞬时展开、打卡记录勾选、多维矩阵精准筛选、代码复制、测试题提交并一键跳转复习讲义 | Yes | `tests/state.test.js`, `tests/matrix.test.js`, `tests/quiz.test.js`, `tests/lessons.test.js` 覆盖标准正常输入路径 |
| BR-2 | MOD-001, MOD-002, MOD-005 | Invalid Input | 异常输入校验：搜索框输入非法特殊字符、JSON 解析损坏、非法课时 ID 查询时显式拒绝并回退到安全默认态 | Yes | 测试输入损坏的 JSON 字符串、非数字索引、不存在的课时 ID，验证均平稳抛出或返回空列表 |
| BR-3 | MOD-001, MOD-002, MOD-004 | Boundary Cases | 极值与边界处理：0 个打卡项、全部打卡完成 100%、无匹配搜索结果、50+ 字符超长关键词、长文本讲义排版防溢出抗挤压 | Yes | 测试边界值（全选/全不选/超长字符串输入），验证布局与状态计算稳定性 |
| BR-4 | MOD-001, MOD-004 | Permission Boundary | 作用域与安全边界：LocalStorage 禁用时的降级保护、剪贴板 Clipboard API 授权失败时的文本选中降级、XSS 文本转义 | Yes | 模拟 `localStorage` 抛出 QuotaExceededError 或 SecurityError，测试内存模式回退；HTML 渲染均使用安全的 `textContent` 或预先 HTML 转义 |
| BR-5 | MOD-001, MOD-005 | Idempotency & Retry | 幂等操作保护：对同一个打卡 Milestone 多次勾选、同一道题重复点击提交，状态机维持唯一性与幂等，不产生重复计数 | Yes | 连续多次调用 `toggleMilestone(id)` 与 `submitAnswer(id, idx)`，验证状态哈希与计数的确定性一致 |
| BR-6 | MOD-001, MOD-005 | Concurrency | 状态读写原子性：每次更新完整序列化并在内存保持 Single Source of Truth，防止并发 DOM 事件导致状态撕裂 | Yes | 快速并发触发状态变更事件，验证单一状态源最终一致性 |
| BR-7 | MOD-001, MOD-003, MOD-004 | Dependency Failure | 外部依赖失败降级：外部视频链接新窗口安全打开 (`rel="noopener noreferrer"`)，脱机离线状态下本地万字讲义与自测不受任何影响 | Yes | 验证离线断网环境下静态页面全功能可交互度为 100% |

## 垂直研发切片计划 [Vertical Slices]

| 切片编号 [Slice ID] | 模块编号 [Module ID] | 包含需求 [Included Requirements] | 允许修改路径 [Allowed Paths] | 最高稳定公共测试接缝 [Highest Stable Seam] | 验证命令与预期输出 [Verification Command] | 退出条件 [Exit Criteria] |
| --- | --- | --- | --- | --- | --- | --- |
| SLC-001 | MOD-001 | REQ-001 | `package.json`, `src/data.js`, `src/state.js`, `tests/state.test.js` | 纯状态引擎公共 API (`StateStore.toggleMilestone`, `StateStore.getProgress`) | `/opt/homebrew/bin/node --test tests/state.test.js` -> 100% PASS | 状态管理核心通过红绿测试，打卡进度计算与 LocalStorage 容错完备 |
| SLC-002 | MOD-002, MOD-003, MOD-004 | REQ-002, REQ-003, REQ-004 | `src/data.js`, `src/matrix.js`, `src/code-lab.js`, `tests/matrix.test.js` | 检索过滤公共函数 (`filterFrameworks`, `searchBenchmarks`, `getCodeScaffold`) | `/opt/homebrew/bin/node --test tests/matrix.test.js` -> 100% PASS | 多维分类/搜索过滤逻辑与 18+ 基准数据集及代码脚手架数据完全对齐，测试全绿 |
| SLC-003 | MOD-005, MOD-001 | REQ-005, REQ-006 | `src/quiz.js`, `tests/quiz.test.js` | 测验评分与错题定位 API (`evaluateQuizAnswer`, `computeQuizSummary`, `getMilestoneForQuestion`) | `/opt/homebrew/bin/node --test tests/quiz.test.js` -> 100% PASS | 自测题库判分与讲义回溯关联测试全绿 |
| SLC-004 | MOD-001 | REQ-007 | `src/lessons.js`, `src/app.js`, `index.html`, `styles.css`, `tests/lessons.test.js` | 讲义服务公共 API (`getLessonByMilestone`, `listAllLessons`) 与静态阅读器界面 | `/opt/homebrew/bin/node --test tests/lessons.test.js` -> 100% PASS | 16 讲深度图文讲义模型完备，沉浸式阅读器遵循 Design v4.0 光学规范并通过 sloplint 门禁 |
