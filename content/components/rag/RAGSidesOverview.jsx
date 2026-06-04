"use client";

import {
  SketchySvg,
  SketchyArrow,
  SketchyDashedLine,
} from "../sketchy";

const sides = [
  {
    id: "indexing",
    index: "01",
    title: "索引侧",
    english: "Indexing",
    mode: "离线 / 写入",
    description: "把原始知识整理成机器可检索、可维护的条目。",
    steps: ["原始文档", "数据清洗", "文档分块", "向量嵌入", "向量数据库"],
    focus: ["嵌入质量", "分块策略", "存储效率"],
  },
  {
    id: "retrieval",
    index: "02",
    title: "检索侧",
    english: "Retrieval / Query",
    mode: "在线 / 读取",
    description: "在用户提问时找到相关信息，并组织成 LLM 可用的上下文。",
    steps: ["用户问题", "查询处理", "混合检索", "重排序", "增强生成"],
    focus: ["查询改写", "召回率", "生成效果"],
  },
];

function SidePanel({ side }) {
  return (
    <div
      className="group relative min-h-[18rem] w-full overflow-hidden rounded-lg bg-[var(--channel-card,#E2DBCE)] p-5 text-left transition duration-200 hover:bg-[var(--channel-card-hover,#D8D0C3)] md:p-6"
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M1.5 2.2 C22 0.8 49 1.8 98 1.4 M98 1.4 C99.2 25 98.3 64 98.6 98 M98.6 98 C76 99 38 98.2 1.8 98.7 M1.8 98.7 C0.8 73 1.2 37 1.5 2.2"
          fill="none"
          stroke="var(--channel-ink,#141413)"
          strokeWidth="0.48"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
        <path
          d="M2.4 3.4 C31 2.6 63 2.4 97.2 2.8 M97.2 2.8 C97.8 31 97.4 66 97.1 97.2 M97.1 97.2 C66 97.6 31 97.3 2.4 97.8 M2.4 97.8 C1.9 67 2 33 2.4 3.4"
          fill="none"
          stroke="var(--channel-ink,#141413)"
          strokeWidth="0.28"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--channel-muted,#68645d)]">
              {side.mode}
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl font-bold leading-none text-[var(--channel-ink,#141413)]">
                {side.title}
              </span>
              <span className="text-sm font-semibold text-[var(--channel-muted,#68645d)]">
                {side.english}
              </span>
            </div>
          </div>
          <span className="font-mono text-3xl font-semibold leading-none text-[color-mix(in_srgb,var(--channel-ink,#141413)_24%,transparent)]">
            {side.index}
          </span>
        </div>

        <p className="mb-5 text-sm leading-7 text-[var(--channel-muted,#68645d)]">
          {side.description}
        </p>

        <div className="space-y-2">
          {side.steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--channel-ink,#141413)] text-[11px] font-semibold text-[var(--channel-ink,#141413)]">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-[var(--channel-ink,#141413)]">
                {step}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {side.focus.map((item) => (
            <span
              key={item}
              className="rounded-md bg-[color-mix(in_srgb,var(--channel-bg,#F0EEE7)_72%,white)] px-2 py-1 text-xs font-medium text-[var(--channel-muted,#68645d)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RAGSidesOverview() {
  return (
    <div className="not-prose my-9">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--channel-muted,#68645d)]">
            RAG system split
          </div>
          <h4 className="mt-2 text-xl font-bold leading-snug text-[var(--channel-ink,#141413)]">
            两条链路，一套系统
          </h4>
        </div>
        <p className="max-w-sm text-sm leading-6 text-[var(--channel-muted,#68645d)]">
          索引侧负责把知识写成可检索对象，检索侧负责在提问时读出并生成答案。
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] md:items-center">
        <SidePanel
          side={sides[0]}
        />

        <div className="relative hidden h-56 md:block">
          <SketchySvg width={64} height={224} viewBox="0 0 64 224" className="h-full w-full">
            <SketchyDashedLine
              x1={32}
              y1={12}
              x2={32}
              y2={212}
              stroke="var(--channel-muted,#68645d)"
              strokeWidth={1.2}
              dashArray={[8, 8]}
            />
            <SketchyArrow
              x1={14}
              y1={112}
              x2={50}
              y2={112}
              stroke="var(--channel-ink,#141413)"
              strokeWidth={1.5}
            />
          </SketchySvg>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-5 rounded-md bg-[var(--channel-bg,#F0EEE7)] px-2 py-1 text-xs font-semibold text-[var(--channel-muted,#68645d)]">
            解耦
          </div>
        </div>

        <div className="grid place-items-center md:hidden">
          <div className="rounded-md border border-[var(--channel-border,#D8D0C3)] px-3 py-1 text-xs font-semibold text-[var(--channel-muted,#68645d)]">
            解耦，各自优化
          </div>
        </div>

        <SidePanel
          side={sides[1]}
        />
      </div>
    </div>
  );
}
