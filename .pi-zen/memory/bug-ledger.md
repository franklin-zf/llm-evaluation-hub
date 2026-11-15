# 工程研发错题本 (Bug Ledger)

> 自动沉淀每次 QA/Fix 循环中的真实缺陷根因与修复配方。新需求与切片启动前自动检索召回。

| ID | Status | Tags | Symptom | Root Cause | Fix Recipe | Commit/Slice | Updated At |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 | resolved | content-omission | 页面缺少实质课程内容与基准百科，成了大纲打卡器 | PRD与Schema误伤内容实体，仅定义了标题短文本，未为16节核心课建立深度讲义Schema | 扩展Lean Schema引入lessonContent与benchmarks数据模型，构建交互式课程阅读器与基准百科 | SLC-001 | 2026-11-15 |
