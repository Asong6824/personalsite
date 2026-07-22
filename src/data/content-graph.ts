export type ContentGraphRelationType =
  | "sequence"
  | "related"
  | "applied-in"
  | "reflection";

export interface ContentGraphTrail {
  id: string;
  name: string;
  label: string;
  description: string;
  articles: string[];
}

export interface ContentGraphRelation {
  from: string;
  to: string;
  type: ContentGraphRelationType;
  reason: string;
}

export const CONTENT_GRAPH_TRAILS: ContentGraphTrail[] = [
  {
    id: "agent-engineering",
    name: "Agent 工程",
    label: "概念 · 工具 · 系统 · 评估",
    description: "从 Agent 的历史与工具调用出发，走向上下文、Harness、Coding Agent 与 Skill 评估。",
    articles: [
      "tech/general/agent",
      "tech/ai-engineering/agent-tool",
      "tech/ai-engineering/from-rag-technique-to-rag-philosophy",
      "tech/ai-engineering/harness-engineering",
      "tech/ai-engineering/pi-agent",
      "tech/ai-engineering/skill-evaluation",
    ],
  },
  {
    id: "knowledge-systems",
    name: "知识系统",
    label: "工具 · 知识 · 工作现场",
    description: "笔记工具不只是容器，它们也在决定知识如何被连接、调用和重新组织。",
    articles: [
      "creative/product/notion-zen",
      "creative/product/obsidian-future-note-making",
      "tech/ai-engineering/from-rag-technique-to-rag-philosophy",
    ],
  },
  {
    id: "design-practice",
    name: "设计到实践",
    label: "原则 · 工具 · 作品",
    description: "从色彩、排版和设计原则，到创造工具与个人主页的实际表达。",
    articles: [
      "creative/design/color-basics",
      "creative/design/typography-basics",
      "creative/design/design-principles-basic",
      "creative/product/figma-redefining-creation",
      "creative/notes/personal-homepage-design-notes",
    ],
  },
  {
    id: "travel-expression",
    name: "旅行与表达",
    label: "经历 · 地图 · 影像",
    description: "旅行文章记录现场，地图和摄影则把经历转换成可以被再次观看的表达。",
    articles: [
      "life/japan/japan-hokuriku",
      "life/japan/japan-train-generality",
      "life/japan/japan-gion-matsuri",
      "creative/notes/map-drawing-guide",
      "creative/notes/iphone-proraw-lightroom-guide",
    ],
  },
  {
    id: "personal-frameworks",
    name: "个人坐标",
    label: "变化 · 长期 · 自我表达",
    description: "在阶段性回顾、投资方法与创作记录中，寻找个人判断逐渐形成的过程。",
    articles: [
      "life/thoughts/2025-mid-review",
      "life/misc/2026-07-01-half-year-reflection",
      "finance/investment-methodology/value-investing-first-principles",
      "creative/notes/personal-homepage-design-notes",
    ],
  },
  {
    id: "engineering-systems",
    name: "系统如何运转",
    label: "资源 · 设备 · 调度",
    description: "越过表层 API，观察 CPU、设备连接、工具调用和运行环境内部的协作方式。",
    articles: [
      "tech/go/efficient-go-cpu-macro",
      "tech/general/ios-cloud-platform-guide",
      "tech/ai-engineering/agent-tool",
      "tech/ai-engineering/harness-engineering",
    ],
  },
];

export const CONTENT_GRAPH_RELATIONS: ContentGraphRelation[] = [
  {
    from: "tech/general/agent",
    to: "tech/ai-engineering/agent-tool",
    type: "sequence",
    reason: "从 Agent 的历史与概念，进入模型使用工具的具体机制。",
  },
  {
    from: "tech/ai-engineering/agent-tool",
    to: "tech/ai-engineering/from-rag-technique-to-rag-philosophy",
    type: "sequence",
    reason: "工具调用解决行动问题，RAG 与 Context Engineering 继续解决知识如何进入现场。",
  },
  {
    from: "tech/ai-engineering/from-rag-technique-to-rag-philosophy",
    to: "tech/ai-engineering/harness-engineering",
    type: "sequence",
    reason: "从上下文组织进一步进入 Agent 运行环境的系统性设计。",
  },
  {
    from: "tech/ai-engineering/harness-engineering",
    to: "tech/ai-engineering/pi-agent",
    type: "applied-in",
    reason: "PI Agent 展示了极简 Harness 如何落实为可观察、可扩展的 Coding Agent。",
  },
  {
    from: "tech/ai-engineering/pi-agent",
    to: "tech/ai-engineering/skill-evaluation",
    type: "sequence",
    reason: "从 Agent 的实现继续追问 Skill 如何演化，以及怎样判断它是否真正有效。",
  },
  {
    from: "creative/product/notion-zen",
    to: "creative/product/obsidian-future-note-making",
    type: "related",
    reason: "两篇文章从不同工具出发，讨论笔记产品背后的使用哲学。",
  },
  {
    from: "creative/product/obsidian-future-note-making",
    to: "tech/ai-engineering/from-rag-technique-to-rag-philosophy",
    type: "related",
    reason: "从本地知识库延伸到 Agent 时代知识如何在需要时回到工作现场。",
  },
  {
    from: "creative/product/notion-zen",
    to: "tech/ai-engineering/from-rag-technique-to-rag-philosophy",
    type: "related",
    reason: "从知识容器的产品体验，延伸到知识重组与调用的工程方式。",
  },
  {
    from: "creative/design/color-basics",
    to: "creative/design/design-principles-basic",
    type: "sequence",
    reason: "色彩知识与组织原则共同构成视觉表达的基础。",
  },
  {
    from: "creative/design/typography-basics",
    to: "creative/design/design-principles-basic",
    type: "sequence",
    reason: "排版细节可以在亲密性、对齐、重复和对比的框架下被重新理解。",
  },
  {
    from: "creative/design/design-principles-basic",
    to: "creative/product/figma-redefining-creation",
    type: "applied-in",
    reason: "从设计原则走向承载协作和创造过程的具体工具。",
  },
  {
    from: "creative/product/figma-redefining-creation",
    to: "creative/notes/personal-homepage-design-notes",
    type: "applied-in",
    reason: "设计工具与方法最终回到个人网站的真实迭代。",
  },
  {
    from: "life/japan/japan-hokuriku",
    to: "creative/notes/map-drawing-guide",
    type: "applied-in",
    reason: "把跨越城市与区域的旅行轨迹转换成地图表达。",
  },
  {
    from: "life/japan/japan-train-generality",
    to: "creative/notes/map-drawing-guide",
    type: "applied-in",
    reason: "铁路旅行天然对应线路、站点和空间关系的可视化。",
  },
  {
    from: "life/japan/japan-gion-matsuri",
    to: "creative/notes/iphone-proraw-lightroom-guide",
    type: "applied-in",
    reason: "现场记录与摄影方法共同决定旅行记忆如何被保留下来。",
  },
  {
    from: "creative/notes/map-drawing-guide",
    to: "creative/notes/iphone-proraw-lightroom-guide",
    type: "related",
    reason: "地图与影像是两种互补的旅行叙事媒介。",
  },
  {
    from: "life/thoughts/2025-mid-review",
    to: "life/misc/2026-07-01-half-year-reflection",
    type: "reflection",
    reason: "两个时间切片共同记录个人对变化和成长的判断。",
  },
  {
    from: "life/thoughts/2025-mid-review",
    to: "finance/investment-methodology/value-investing-first-principles",
    type: "reflection",
    reason: "个人发展与长期投资都在讨论如何面对变化并建立稳定判断。",
  },
  {
    from: "life/misc/2026-07-01-half-year-reflection",
    to: "creative/notes/personal-homepage-design-notes",
    type: "reflection",
    reason: "阶段性自省最终回到如何诚实地表达自己。",
  },
  {
    from: "tech/go/efficient-go-cpu-macro",
    to: "tech/ai-engineering/harness-engineering",
    type: "related",
    reason: "两篇文章都从系统视角观察资源、调度与运行环境。",
  },
  {
    from: "tech/general/ios-cloud-platform-guide",
    to: "tech/ai-engineering/agent-tool",
    type: "related",
    reason: "设备控制与 Agent Tool 都涉及把上层意图转换为可执行的外部操作。",
  },
];

export const CONTENT_GRAPH_SLUGS = Array.from(
  new Set(CONTENT_GRAPH_TRAILS.flatMap((trail) => trail.articles)),
);
