# 需求分析报告与产品需求规格说明书 (PRD)

Confirmation: confirmed

> 权威契约 1/3：由 CEO 内核（第一性原理）与 Product & Design 内核（奥卡姆剃刀 + Design v4.0）联合产出。`[]` 内为稳定机器校验标识。

## 一句话产品承诺 [Product Promise]

为大模型算法工程师、AI 应用开发者与技术决策者提供一个包含“16 讲体系化图文讲义、6 大类 18+ 学术与工业基准百科、四大工业级工程代码脚手架、先学后测闭环小测验”的高信息密度、零依赖、纯前端自包含交互式学习工作站，彻底终结“有大纲无正文”与“体感盲目评测”，打通从理论推导到 CI/CD 质量门禁的全链路闭环。

## 第一性原理问题拆解 [First-Principles Decomposition]

- **本质输入 (Fundamental Inputs)**：
  - 学习者的学习与选型目标（理解评测原理、掌握前沿基准、构建业务测试集、实施 RAG 质量度量、配置 CI/CD 门禁）。
  - 2.4 万字结构化权威评测知识库（评测金字塔、三大范式对比、三偏置数学/工程机理、18+ 核心基准数据集解析、工业界实战代码）。
- **核心状态流转 (State Transition)**：
  - 学习者浏览 4 周 16 节路线 -> 点击任意课时展开沉浸式深度图文讲义（原理、公式、图解与案例） -> 检索对应基准数据集百科与工具 -> 在代码实验室复制运行脚手架 -> 答题自测并在错题中一键回跳讲义复习 -> 学习打卡自动持久化到 `localStorage`。
- **控制性瓶颈 (Controlling Bottleneck)**：
  - 传统资料将评测简化为刷榜数字或抽象口号，缺乏自包含的系统化讲义。用户虽然知道了名字（如“冗长度偏置”），但不知道其数学成因、控制对策与代码落地方式，无法构建闭环工程认知。
- **已验证事实 [Verified Facts]**：
  - 本项目 [README.md](file:///Users/zhangfeng/Downloads/Personal-Code/GitHub/LLM测评/README.md) 具备完整的四层评测金字塔、三大方法对比、18 项基准全解、大模型裁判偏置消除理论与生产代码。
  - 静态单页应用通过内嵌自包含结构化讲义模型，可以在无网络依赖、无第三方数据库的情况下毫秒级瞬间渲染图文讲义与基准百科。
- **关键假设 [Assumptions]**：
  - 学习者在电脑端与移动端均需要“边看深度教材，边查对应数据集，边调代码，边做自测”的无缝一体化学习体验，无需频繁在外部页面间跳转。

## 产品奥卡姆剃刀与取舍 [Product Occam's Razor & Trade-offs]

- Single Primary Flow: 课程大纲 -> 点击任意课时卡片即刻在原位/右侧无缝展开完整深度讲义正文 -> 查阅对应基准数据集与代码脚手架 -> 答题验证认知（错题一键定位至对应课时讲义） -> 打卡标记进度。
- Zero-Config Preference: 所有深度课程讲义、图表、基准数据集百科全部自包含打包在纯前端单页中，零网络延迟、零额外加载等待，离线断网环境下依然提供 100% 完整的教材阅读与交互学习体验。
- Surface Minimization: 单一高集成工作台（Single-Page Hub），在 4 周进阶路线中深度集成“讲义抽屉/折叠阅读器”，无需跳出页面即可畅读万字深度讲义；在多维矩阵中同时收录“评测工具”与“基准数据集”，拒绝信息割裂。

### 非目标与故意不做的事 [Non-Goals]

- 不做重型账号系统与云端打卡排行榜（坚持隐私保护与纯本地 `localStorage`，零维护心智负担）。
- 不做云端沙箱远程模型推理 SaaS（聚焦于交付经得起推敲的技术原理、指标推导、避坑指南与本地可直接运行的标准脚手架）。
- 不保留任何无讲义内容的空壳打卡项（杜绝“只有标题没有正文”的形式主义）。
- 不捏造未经业界权威检验的非标准指标，严格对齐 EleutherAI, HuggingFace v2, Ragas, DeepEval, LMSYS, Princeton SWE-bench。

## 最小实体审计 [Minimal-Entity Audit]

| 引入实体 [Entity Introduced] | 模块编号 [Module ID] | 范围 [Scope] | 所属表面 [Owning Boundary] | 删除测试 [drop_test] | 合并测试 [merge_test] | 决策 [Decision] |
| --- | --- | --- | --- | --- | --- | --- |
| CurriculumEngine | MOD-001 | [Global: Host-level] | Primary Workspace | 删除后用户失去 4 周阶段性进阶导航与打卡进度闭环，退化为零散列表 | 生命周期横跨全局学习状态，无法合并入局部卡片 | approved |
| LessonReader | MOD-001 | [Global: Host-level] | Primary Workspace | 删除后用户只能看到课程标题，无法阅读实质性讲义正文与原理推导 | 具有独立的讲义正文展现与章节切换状态，无法合并入短标题 | approved |
| BenchmarkTaxonomy | MOD-002 | [Global: Host-level] | Primary Workspace | 删除后用户无法检索和学习 6 大类 18+ 核心基准数据集（MMLU-Pro, GPQA, IFEval 等） | 具有独立的多维数据模型与指标属性，无法合并入工具卡片 | approved |
| VideoVault | MOD-003 | [Asset: Data-level] | Primary Workspace | 删除后缺少业界权威专家（Hamel, Eugene, LMSYS）核心技术讲座的视听教学支撑 | 具有独立的视频元数据与核心要点列表，与工具矩阵区分清晰 | approved |
| CodePlayground | MOD-004 | [Asset: Data-level] | Primary Workspace | 删除后用户无法获得开箱即用的工程脚手架（lm-eval/deepeval/ragas/promptfoo），无法实操 | 承载复杂代码高亮、复制与参数调优说明，生命周期独立 | approved |
| KnowledgeQuiz | MOD-005 | [Asset: Data-level] | Primary Workspace | 删除后用户无法检测对评测偏置、古德哈特定律等核心概念的掌握情况，缺乏反馈 | 拥有交互式选答、即时算分与讲义回溯能力，生命周期独立 | approved |

## 需求规格与可观察验收 [Requirements]

| 需求编号 [ID] | 模块编号 [Module ID] | 优先级 [Priority] | 交互模式 [Interaction Mode] | 需求描述 [Requirement] | 可观察验收标准 [Observable Acceptance] | 验证级别 [Verification Level] |
| --- | --- | --- | --- | --- | --- | --- |
| REQ-001 | MOD-001 | P0 | ui | 4 周渐进式学习路线导航及阶段打卡持久化 | 页面展示 Week 1 到 Week 4 进阶路线卡片，点击复选框可打卡并自动保存到 localStorage，刷新页面状态不丢失 | real_canary |
| REQ-002 | MOD-002 | P0 | ui | 多维评测框架与 6 大类 18+ 学术/工业基准数据集交互式检索矩阵 | 提供按分类（学术基模型、应用单测、RAG专项目标、安全攻防、代码与智能体）及类型（工具库/基准数据集）筛选及关键词即时搜索，动态高亮匹配项 | real_canary |
| REQ-003 | MOD-003 | P1 | ui | YouTube 权威课程与工业界实战大师课专区与深度方法论提炼 | 展示 Hamel Husain, Eugene Yan, LMSYS 等大师视频精粹卡片，包含核心洞见要点、搜索关键词及直达链接 | real_canary |
| REQ-004 | MOD-004 | P0 | ui | 四大核心测评工程实战代码脚手架展示与一键复制及逐行参数避坑 | 提供 lm-eval, DeepEval, Ragas, Promptfoo 完整代码模版，带语法样式与一键复制按钮，提示复制成功状态 | real_canary |
| REQ-005 | MOD-005 | P1 | ui | 交互式大模型测评知识自测题库与一键跳回讲义复习闭环 | 提供不少于 5 道典型核心易错题（如评测者偏置、二元标签决策、古德哈特定律），支持单选点击、即时判分并支持一键定位到对应课时讲义复习 | real_canary |
| REQ-006 | MOD-001 | P0 | ui | 遵循 Design v4.0 的高级现代工业风响应式设计 | 布局自适应桌面与移动端，严格遵循同心圆角公式与无 AI 塑料感原则，支持深浅色模式切换 | real_canary |
| REQ-007 | MOD-001 | P0 | ui | 16 讲体系化深度图文讲义沉浸式阅读器 | 用户点击任意里程碑即可直接展开/阅读该课时包含定义、核心原理、图解/对比表、实战指南的完整深度讲义正文，彻底消除空壳目录 | real_canary |

## 全链路五态交互矩阵 [Five-State Matrix]

| 表面 [Surface / View] | 空态 [Empty State] | 加载态 [Loading State] | 成功态 [Populated State] | 错误态 [Error / Validation State] | 降级态 [Offline / Fallback State] |
| --- | --- | --- | --- | --- | --- |
| 学习路线与讲义阅读器 (Curriculum & Lesson Reader) | 显示“尚未开启学习，点击任意课时开始阅读讲义”引导卡片 | 纯 CSS 骨架占位，CLS=0 零布局抖动 | 清晰展示各周里程碑、一键展开阅读深度讲义、完成打卡联动进度条 | 存储读取异常时自动重置并恢复默认初始进度 | localStorage 不可用时退化为单次会话临时状态，讲义正文离线完整可读 |
| 工具与基准数据集矩阵 (Matrix & Benchmark Encyclopedia) | 搜索无结果时呈现友好清空筛选建议与“重置搜索”按钮 | 瞬时即时计算响应，无额外网络等待延迟 | Bento 布局卡片展示各工具与 18+ 基准数据集的核心能力、抗污染机制与场景 | 输入特殊字符进行正则转义处理，防止检索脚本崩溃 | 无 JS 运行时仍可完整降级阅读纯 HTML 结构化表格内容 |
| 代码实验室 (Playground) | 切换无选中时默认展示第一项常用脚手架 | 切换代码卡片时平滑过渡，无闪烁 | 代码语法色彩分明，参数含义清晰，复制反馈微动效明确 | 剪贴板权限受阻时优雅回退为选中文本供用户手动复制 | 离线环境下完整本地展示代码与运行指南 |
| 知识自测区 (Quiz) | 初始展示未答题状态与“开始答题”激励说明 | 题目切换淡入淡出动画过渡 | 即时呈现选择正确（翡翠绿）与错误（珊瑚红）标识、深度解析及跳转复习按钮 | 漏选即点击交卷时提示“请选择选项后查看解析” | 离线环境下题目与本地解析完全自包含可查 |

## UI 审美契约 [Taste Contract]

> 由 Design Skill v4.0 驱动，同步导出至 `docs/content-handoff.json`。

```json
{
  "visual_thesis": "一眼看清大模型测评全景与核心代码脚手架，极简克制，零视觉噪音与零 AI 塑料感",
  "content_tension": "严谨深邃的代码/架构技术密度与优雅通透的现代排版呼吸感之间的张力平衡",
  "signature_move": "非对称 Bento 网格系统搭配同心圆角光学层级与微触感状态指示器",
  "anti_reference": "严禁千篇一律等权重四宫格、严禁无意义紫青渐变背景、严禁 01 // LABEL 假装极客的编号印章",
  "restraint_rule": "严格遵循 Anti-Visual-Fill 原则，无多余凑数数据；次要元数据与扩展解析默认优雅折叠"
}
```
