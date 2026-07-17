# 全站文章重审计划

更新日期：2026-07-17

## 范围与目标

本轮初始盘点覆盖 `content/blog/` 中进入站点索引的全部 27 篇 MDX 文章。#01 至 #04 已按作者决定删除，当前剩余 23 篇正式文章。另有 1 份未索引的 RAG 研究笔记，作为资料单独跟踪，不计入正式文章总数。

重审目标：

- 恢复清晰、具体的个人表达，删除模板化、空泛或疑似由 AI 扩写的段落。
- 为每篇文章确定一个中心问题，使章节和段落围绕同一条论述主线推进。
- 核对技术、历史、投资等可验证陈述，补充来源、时间边界或不确定性说明。
- 修正标题、摘要、标签、频道、专栏、图片、链接等发布信息。
- 对不值得继续保留的内容明确选择合并、归档或删除，而不是强行润色成完整长文。

不使用所谓“AI 生成概率”作为判断依据。审阅时只检查可落到文本上的问题，例如套话、重复结论、过度对称的结构、缺少事实或个人经验、段落之间没有因果关系。

## 单篇审阅流程

每次只处理一篇，按以下步骤推进：

1. **诊断**：概括写作意图、中心论点和现有结构，标出事实风险、逻辑断点、空泛表达与值得保留的个人材料。
2. **定方向**：在“保留微调、删减重组、整体重写、合并、归档”中选一种；涉及个人经历或观点时，由作者确认取舍。
3. **修订**：先调整结构，再修改段落和句子；不凭空补写个人经历、感受、数据或引用。
4. **校对**：检查标题、摘要、标签、frontmatter、链接、图片说明、术语和中英文标点。
5. **验证**：运行内容索引与组织检查，必要时在浏览器检查文章页面。
6. **归档结果**：更新本文中的状态、完成日期和主要处理说明。

完成一篇文章至少应满足：能够用一句话说明文章要回答的问题；各章节都服务于该问题；重要事实可核查；删除后不影响含义的套话已经删去；文章仍保留作者自己的经验、判断和语气。

## 状态说明

| 状态 | 含义 |
| --- | --- |
| 待审 | 尚未开始 |
| 审阅中 | 正在诊断，尚未确定修订方向 |
| 待确认 | 已给出诊断，需要作者补充信息或确认取舍 |
| 修订中 | 方向已确认，正在修改正文 |
| 已完成 | 修订、校对和验证均完成 |
| 搁置 | 已决定暂不修改，保留原因需写入备注 |
| 归档 | 不再作为正式文章发布 |

## 审阅队列

顺序优先处理已发布的空稿、占位稿和明显未完成稿；随后用生活类文章校准作者的真实语气，再审技术、金融和创意类长文。

### 第一阶段：空稿、未完成稿与原始随笔

| # | 状态 | 日期 | 文章 | 文件 | 初步备注 |
| --- | --- | --- | --- | --- | --- |
| 01 | 归档 | 2025-08-08 | 日本生活总集篇 | `content/blog/life/japan/japan-live.mdx`（已删除） | 只有 frontmatter，没有正文；按作者决定删除 |
| 02 | 归档 | 2025-05-01 | 日本纪行 散策篇：北国札幌的春日风光 | `content/blog/life/japan/japan-travel-sapporo.mdx`（已删除） | 正文只有一个空标题；按作者决定删除 |
| 03 | 归档 | 2025-12-31 | 2025 年终总结 | `content/blog/life/thoughts/2025-year-end-summary.mdx`（已删除） | 原计划于 2025 年末完成；半年后心态变化较大，无法忠实回到当时的写作情境 |
| 04 | 归档 | 2025-11-30 | 投资观与人生观 | `content/blog/life/thoughts/investment-and-life.mdx`（已删除） | 原始想法较集中，但论述在展开前中断；按作者决定删除 |
| 05 | 待审 | 2026-07-08 | Harness Engineering | `content/blog/tech/ai-engineering/harness-engineering.mdx` | 当前接近提纲，需要补齐定义、边界与论证 |
| 06 | 待审 | 2026-07-01 | 2026-07-01 半年有感 | `content/blog/life/misc/2026-07-01-half-year-reflection.mdx` | 有鲜明个人语气；先确定保留日记式原貌还是重组为完整随笔 |

### 第二阶段：旅行与年度记录

| # | 状态 | 日期 | 文章 | 文件 | 初步备注 |
| --- | --- | --- | --- | --- | --- |
| 07 | 待审 | 2024-11-17 | 日本纪行 北陆篇：海风与雪的旅途 | `content/blog/life/japan/japan-hokuriku.mdx` | 重点检查叙事线、现场细节与图片配合 |
| 08 | 待审 | 2025-06-15 | 日本纪行 铁道篇：连接梦想的铁道线 | `content/blog/life/japan/japan-train-generality.mdx` | 重点检查主题聚焦和段落衔接 |
| 09 | 待审 | 2025-08-08 | 日本纪行 祭典篇：千年之约，京都祇园祭 | `content/blog/life/japan/japan-gion-matsuri.mdx` | 重点区分亲历叙事与资料性介绍 |
| 10 | 待审 | 2025-06-25 | 2025 年中总结：拥抱变化，主动变化，用变化创造价值 | `content/blog/life/thoughts/2025-mid-review.mdx` | 作为个人写作语气的重要样本审阅 |

### 第三阶段：技术与金融文章

| # | 状态 | 日期 | 文章 | 文件 | 初步备注 |
| --- | --- | --- | --- | --- | --- |
| 11 | 待审 | 2025-01-17 | 投资、人类文明与个人发展 | `content/blog/finance/investment-methodology/value-investing-first-principles.mdx` | 核对概念跨度、论据与投资表述边界 |
| 12 | 待审 | 2025-05-30 | Efficient Go \| Go如何使用CPU资源（宏观视角：从CPU到Go Runtime调度器） | `content/blog/tech/go/efficient-go-cpu-macro.mdx` | 技术事实、术语和代码示例深审 |
| 13 | 待审 | 2025-11-25 | iOS 云真机平台实现指南（Host–Device 侧） | `content/blog/tech/general/ios-cloud-platform-guide.mdx` | 长文；重点核对架构完整性与时效性 |
| 14 | 待审 | 2025-05-01 | 大模型 Agent 简史：从 AutoGPT 到自主工作流 | `content/blog/tech/general/agent.mdx` | 核对时间线、来源与是否存在事后概括 |
| 15 | 待审 | 2026-07-04 | Agent Tool：Function Calling 如何连接大模型与外部世界 | `content/blog/tech/ai-engineering/agent-tool.mdx` | 检查核心概念、示例和段落重复 |
| 16 | 待审 | 2026-04-26 | 从 RAG 技术到 RAG 思想 | `content/blog/tech/ai-engineering/from-rag-technique-to-rag-philosophy.mdx` | 超长文章；结合研究笔记核对时间线和主论点 |
| 17 | 待审 | 2026-07-05 | PI Agent | `content/blog/tech/ai-engineering/pi-agent.mdx` | 检查术语解释、项目事实与作者判断的区分 |
| 18 | 待审 | 2026-07-13 | skill 的演化与评估 | `content/blog/tech/ai-engineering/skill-evaluation.mdx` | 检查评估框架是否可执行、结论是否有依据 |

### 第四阶段：设计、产品与创意文章

| # | 状态 | 日期 | 文章 | 文件 | 初步备注 |
| --- | --- | --- | --- | --- | --- |
| 19 | 待审 | 2025-06-19 | 如何绘制旅行地图 | `content/blog/creative/notes/map-drawing-guide.mdx` | 检查步骤完整性、工具时效性与作品示例 |
| 20 | 待审 | 2025-06-22 | 解锁 iPhone 摄影新视界：ProRAW 拍摄与 Lightroom 修图全攻略 | `content/blog/creative/notes/iphone-proraw-lightroom-guide.mdx` | 检查标题风格、教程冗余与软件时效性 |
| 21 | 待审 | 2025-07-03 | Notion 与禅与我 | `content/blog/creative/product/notion-zen.mdx` | 重点保留个人体验，压缩抽象产品话语 |
| 22 | 待审 | 2025-08-01 | Figma：重新定义创造 | `content/blog/creative/product/figma-redefining-creation.mdx` | 检查产品叙事、事实来源与泛化结论 |
| 23 | 待审 | 2025-11-26 | 四大基本设计原则 | `content/blog/creative/design/design-principles-basic.mdx` | 超长文章；检查教程结构、重复内容与示例归属 |
| 24 | 待审 | 2025-12-10 | 颜色基础知识 | `content/blog/creative/design/color-basics.mdx` | 检查概念准确性、层级和图例支撑 |
| 25 | 待审 | 2025-12-14 | Typography排版基础 | `content/blog/creative/design/typography-basics.mdx` | 检查中英文术语、标题格式与教程连贯性 |
| 26 | 待审 | 2026-07-12 | 个人主页设计札记 | `content/blog/creative/notes/personal-homepage-design-notes.mdx` | 作为近期创作记录，检查是否形成清晰设计判断 |
| 27 | 待审 | 2026-07-16 | Obsidian：面向未来的笔记工具 | `content/blog/creative/product/obsidian-future-note-making.mdx` | 最新文章；用于最后校准修订后的整体写作标准 |

## 未索引资料

| 状态 | 文件 | 处理方式 |
| --- | --- | --- |
| 待处理 | `content/blog/tech/general/from-rag-technique-to-rag-philosophy-research.md` | 当前是正式 RAG 文章的调研笔记，不进入站点索引；审完第 16 篇后决定保留原处、移入资料目录或删除 |

## 每轮记录格式

每完成一篇，在对应表格中更新状态，并在表格下追加一条简短记录：

```text
YYYY-MM-DD · #编号 · 处理方式 · 核心改动 · 验证结果
```

2026-07-17 · #01 · 归档 · 删除只有 frontmatter、没有正文的置顶空稿 · 文章索引重建与内容审计通过

2026-07-17 · #02 · 归档 · 删除正文只有空标题的文章 · 文章索引重建与内容审计通过

2026-07-17 · #03 · 归档 · 删除未完成的年终总结，避免用当前心态重构当时的感受 · 文章索引重建与内容审计通过

2026-07-17 · #04 · 归档 · 删除论述未展开的投资与人生随笔 · 文章索引重建与内容审计通过

## 基线盘点

- 正式文章：23 篇，全部为 `.mdx`，当前均未设置 `hidden: true`。
- 未索引研究资料：1 份 `.md`。
- `npm run audit:content`：目录、重复正文、重复标题、标签与专栏配置均无错误；唯一提示为上述 `.md` 不进入索引。
