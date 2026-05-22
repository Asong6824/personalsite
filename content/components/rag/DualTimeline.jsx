"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHASES = [
  {
    id: "foundation",
    name: "基础奠基",
    period: "2017 – 2020",
    context:
      "GPT-3 的上下文窗口只有 2048 tokens。面对海量企业文档，模型既读不下也记不住——这正是 RAG 被发明出来的直接动机。",
    events: [
      {
        id: "e1",
        date: "2017.06",
        llm: {
          title: "Transformer",
          desc: "论文 *Attention Is All You Need* 发表，奠定现代 LLM 基础。",
          highlight: true,
        },
        rag: null,
      },
      {
        id: "e2",
        date: "2018",
        llm: {
          title: "BERT & GPT-1",
          desc: "BERT 开启预训练+微调范式；GPT-1 证明生成式预训练可行。",
          highlight: true,
        },
        rag: {
          title: "传统检索",
          desc: "NLP 检索仍依赖关键词匹配（BM25）、Elasticsearch。",
          highlight: false,
        },
      },
      {
        id: "e3",
        date: "2019",
        llm: {
          title: "GPT-2",
          desc: "1.5B 参数展示长文本生成能力，引发 AI 伦理讨论。",
          highlight: false,
        },
        rag: null,
      },
      {
        id: "e4",
        date: "2020.05",
        llm: {
          title: "GPT-3",
          desc: "175B 参数，Few-shot 学习能力惊人，上下文学习概念诞生。",
          highlight: true,
        },
        rag: {
          title: "RAG 架构诞生",
          desc: "Meta AI 提出 RAG：BART + Dense Passage Retrieval（DPR）端到端检索增强生成。",
          highlight: true,
        },
      },
    ],
  },
  {
    id: "explosion",
    name: "爆发与对齐",
    period: "2021 – 2022",
    context:
      `ChatGPT 的爆火让所有人意识到「让模型回答企业私有知识」是刚需，但模型本身不能实时访问内部文档。RAG 从学术概念迅速工程化。`,
    events: [
      {
        id: "e5",
        date: "2021",
        llm: {
          title: "专用模型涌现",
          desc: "Codex（代码生成）、DALL-E（文生图）等任务专用模型出现。",
          highlight: false,
        },
        rag: {
          title: "Google REALM",
          desc: "将可微检索器集成进预训练模型，用于开放域问答；RAG 概念正式确立。",
          highlight: true,
        },
      },
      {
        id: "e6",
        date: "2022.03",
        llm: {
          title: "InstructGPT",
          desc: "RLHF（人类反馈强化学习）技术成熟。",
          highlight: true,
        },
        rag: null,
      },
      {
        id: "e7",
        date: "2022.04",
        llm: {
          title: "PaLM",
          desc: "Google 540B 参数大模型发布。",
          highlight: false,
        },
        rag: null,
      },
      {
        id: "e8",
        date: "2022.11",
        llm: {
          title: "ChatGPT",
          desc: "11 月 30 日发布，LLM 首次进入大众视野；BLOOM 开源大模型发布。",
          highlight: true,
        },
        rag: {
          title: "RAG Pipeline 化",
          desc: "Hugging Face Transformers 官方支持 RAG，开发者可自定义检索器+生成器。",
          highlight: true,
        },
      },
    ],
  },
  {
    id: "engineering",
    name: "RAG 工程化与长上下文竞赛",
    period: "2023 – 2024",
    context:
      `2024 年是「矛盾之年」——向量数据库和 RAG Pipeline 在企业里大规模部署，但 Gemini 1.5 Pro 的 1M 上下文和 Claude 3 的 200K 上下文开始让从业者质疑：我们是否真的需要维护一套 Chunking + Embedding + Vector DB 的重型基础设施？`,
    events: [
      {
        id: "e9",
        date: "2023.02",
        llm: {
          title: "LLaMA",
          desc: "Meta 开源，催生大量私有化部署。",
          highlight: true,
        },
        rag: null,
      },
      {
        id: "e10",
        date: "2023.03",
        llm: {
          title: "GPT-4 & Claude 1",
          desc: "3 月 14/15 日发布，推理能力跃升。",
          highlight: true,
        },
        rag: null,
      },
      {
        id: "e11",
        date: "2023.07",
        llm: {
          title: "Claude 2 & Llama 2",
          desc: "Claude 2 上下文窗口达到 100K tokens。",
          highlight: true,
        },
        rag: {
          title: "向量数据库主流化",
          desc: "Pinecone、Milvus、Weaviate、Qdrant 进入主流，RAG 成为企业落地 LLM 的标配架构。",
          highlight: true,
        },
      },
      {
        id: "e12",
        date: "2023.11",
        llm: {
          title: "GPT-4-Turbo",
          desc: "上下文窗口扩展至 128K tokens。",
          highlight: true,
        },
        rag: {
          title: "RAG 生产化",
          desc: "LangChain、Haystack、LlamaIndex 成熟；OpenAI 推出 ChatGPT 插件/检索功能。",
          highlight: true,
        },
      },
      {
        id: "e13",
        date: "2024.02",
        llm: {
          title: "Gemini 1.5 Pro",
          desc: "上下文窗口达到 1M tokens，首次进入百万 token 时代。",
          highlight: true,
        },
        rag: {
          title: "长上下文挑战 RAG",
          desc: '"既然能装下整本书，为什么还要切分检索？"',
          highlight: false,
        },
      },
      {
        id: "e14",
        date: "2024.03",
        llm: {
          title: "Claude 3 Opus",
          desc: "上下文 200K tokens。",
          highlight: false,
        },
        rag: null,
      },
      {
        id: "e15",
        date: "2024.04",
        llm: {
          title: "Llama 3",
          desc: "Meta 新一代开源模型发布。",
          highlight: false,
        },
        rag: null,
      },
      {
        id: "e16",
        date: "2024.05",
        llm: {
          title: "GPT-4o",
          desc: "原生多模态大模型发布。",
          highlight: true,
        },
        rag: {
          title: "混合检索标配",
          desc: "向量 + 关键词 BM25 成为 RAG 标配。",
          highlight: false,
        },
      },
      {
        id: "e17",
        date: "2024.06",
        llm: {
          title: "Claude 3.5 Sonnet",
          desc: "Anthropic 发布 Claude 3.5 系列。",
          highlight: false,
        },
        rag: null,
      },
      {
        id: "e18",
        date: "2024.12",
        llm: {
          title: "Gemini 2.0",
          desc: "Google 发布 Gemini 2.0。",
          highlight: false,
        },
        rag: {
          title: "下一代 RAG",
          desc: "长上下文 RAG、GraphRAG、Agentic RAG 概念兴起。",
          highlight: true,
        },
      },
    ],
  },
  {
    id: "agent",
    name: "Agent 内化与 Context Engineering",
    period: "2025 – 2026",
    context:
      `到 2026 年 3 月，1M 上下文窗口在三家主流厂商中全面可用。但社区共识不再是「用更大的窗口装下所有东西」，而是「长上下文是 Agent 的工作台，按需精确读取是新的检索范式」。RAG 的五个核心思想被完整地内化到了 Agent 架构中。`,
    events: [
      {
        id: "e19",
        date: "2025.03",
        llm: {
          title: "Gemini 2.5 Pro",
          desc: "上下文 1M tokens。",
          highlight: false,
        },
        rag: null,
      },
      {
        id: "e20",
        date: "2025.04",
        llm: {
          title: "GPT-4.1",
          desc: "上下文 1M tokens，900K+ 长度下保持 100% NIAH 准确率。",
          highlight: true,
        },
        rag: {
          title: "RAG 范式反思",
          desc: 'RAG 的"重型 Pipeline"开始被社区反思为"几年前的解决方案"；Skill-as-Index、文件系统直读等新范式出现。',
          highlight: true,
        },
      },
      {
        id: "e21",
        date: "2025.05",
        llm: {
          title: "Claude 4",
          desc: "Anthropic 发布 Claude 4 系列。",
          highlight: true,
        },
        rag: null,
      },
      {
        id: "e22",
        date: "2025.08",
        llm: {
          title: "GPT-5 & Claude 4.1",
          desc: "GPT-5 发布；Claude Sonnet 4 开放 1M token beta。",
          highlight: true,
        },
        rag: {
          title: "Agent 工具普及",
          desc: "Claude Code 等 Agent 工具通过 read_file、grep、search_files 直接操作文件系统，按需加载而非向量检索。",
          highlight: true,
        },
      },
      {
        id: "e23",
        date: "2025.09",
        llm: null,
        rag: {
          title: "OpenClaw",
          desc: "Hub-Spoke 架构，SKILL.md 作为模块化、可共享的 Agent 能力单元。",
          highlight: true,
        },
      },
      {
        id: "e24",
        date: "2025.11",
        llm: null,
        rag: {
          title: "Hermes Agent",
          desc: "Nous Research 发布：能自主从任务经验中抽象 Skill 文档，实现动态能力累积。",
          highlight: true,
        },
      },
      {
        id: "e25",
        date: "2025.12",
        llm: {
          title: "GPT-5.2",
          desc: "上下文窗口 256K。",
          highlight: false,
        },
        rag: {
          title: "MCP 生态成熟",
          desc: "Model Context Protocol 生态成熟，Agent 通过标准化协议挂载外部知识源。",
          highlight: true,
        },
      },
      {
        id: "e26",
        date: "2026.02",
        llm: {
          title: "Claude Opus 4.6 & Grok 4.20",
          desc: "Claude 1M 窗口 beta，MRCR 8-needle 76% 准确率；Grok 4.20 上下文 2M tokens。",
          highlight: true,
        },
        rag: {
          title: "Context Engineering",
          desc: 'Zep 等公司从 "Memory" 全面 rebranded 为 "Context Engineering"。',
          highlight: true,
        },
      },
      {
        id: "e27",
        date: "2026.03",
        llm: {
          title: "1M 上下文 GA",
          desc: "Claude Opus/Sonnet 4.6 的 1M 上下文正式 GA；GPT-5.4 发布。",
          highlight: true,
        },
        rag: {
          title: "10M 上下文 & 范式转移",
          desc: 'Llama 4 Scout 支持 10M tokens；向量数据库厂商公开承认"markdown 文件才是知识的主人，向量数据库只是下游访问层"。',
          highlight: true,
        },
      },
    ],
  },
];

function TimelineNode({ side, data, eventId, isActive, onClick, hasPair }) {
  const isLeft = side === "left";
  const colorClass = isLeft
    ? "bg-indigo-500 ring-indigo-200 dark:ring-indigo-900"
    : "bg-amber-500 ring-amber-200 dark:ring-amber-900";
  const textClass = isLeft
    ? "text-indigo-700 dark:text-indigo-300"
    : "text-amber-700 dark:text-amber-300";
  const borderClass = isLeft
    ? "border-indigo-200 dark:border-indigo-800"
    : "border-amber-200 dark:border-amber-800";
  const bgClass = isLeft
    ? "bg-indigo-50/60 dark:bg-indigo-950/30"
    : "bg-amber-50/60 dark:bg-amber-950/30";

  if (!data) {
    return (
      <div className={`flex-1 ${isLeft ? "text-right pr-6" : "text-left pl-6"}`}>
        <span className="text-neutral-300 dark:text-neutral-700">—</span>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 ${isLeft ? "text-right pr-4 md:pr-6" : "text-left pl-4 md:pl-6"}`}
    >
      <motion.button
        onClick={() => onClick(isActive ? null : eventId)}
        className={`group relative inline-block text-left w-full ${
          isLeft ? "text-right" : "text-left"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className={`inline-block rounded-xl border px-3 py-2 md:px-4 md:py-3 transition-all duration-300 cursor-pointer ${
            isActive
              ? `${bgClass} ${borderClass} shadow-md`
              : "border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
          }`}
        >
          <div
            className={`text-[10px] md:text-xs font-mono tracking-tight text-neutral-400 dark:text-neutral-500 mb-0.5 ${
              isLeft ? "" : ""
            }`}
          >
            {data.title}
          </div>
          <div
            className={`text-xs md:text-sm font-semibold leading-snug ${textClass}`}
          >
            {data.desc.split("，")[0].split("。")[0].replace(/[\*\*]/g, "").slice(0, 28)}
            {data.desc.length > 28 ? "…" : ""}
          </div>
        </div>

        {/* connector dot */}
        <span
          className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${colorClass} ring-2 md:ring-4 transition-transform duration-300 ${
            isActive ? "scale-125" : "group-hover:scale-110"
          } ${isLeft ? "-right-[calc(0.625rem+1px)] md:-right-[calc(0.75rem+1px)]" : "-left-[calc(0.625rem+1px)] md:-left-[calc(0.75rem+1px)]"}`}
        />
      </motion.button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className={`overflow-hidden ${isLeft ? "text-right" : "text-left"}`}
          >
            <div
              className={`mt-2 inline-block rounded-lg ${bgClass} border ${borderClass} px-3 py-2 md:px-4 md:py-3 max-w-xs md:max-w-sm`}
            >
              <p className="text-xs md:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {data.desc}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhaseHeader({ phase, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex items-center justify-center my-8 md:my-10"
    >
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
      </div>
      <div className="relative bg-white dark:bg-[#1a1a1a] px-4 md:px-6 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h3 className="text-sm md:text-base font-bold text-neutral-800 dark:text-neutral-100">
          {phase.name}
        </h3>
        <span className="text-[10px] md:text-xs text-neutral-400 dark:text-neutral-500 ml-2 font-mono">
          {phase.period}
        </span>
      </div>
    </motion.div>
  );
}

function ContextBox({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="my-4 md:my-6 mx-auto max-w-2xl"
    >
      <div className="rounded-lg border-l-4 border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900/50 px-4 py-3 md:px-5 md:py-4">
        <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
          {text}
        </p>
      </div>
    </motion.div>
  );
}

export function DualTimeline() {
  const [activeEventId, setActiveEventId] = useState(null);

  return (
    <div className="my-6 md:my-10 not-prose">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-6 md:mb-8 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">
            大模型 / 基础设施
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">
            检索 / 知识挂载
          </span>
        </div>
      </div>

      {PHASES.map((phase, phaseIndex) => (
        <div key={phase.id} className="mb-4 md:mb-6">
          <PhaseHeader phase={phase} index={phaseIndex} />

          <div className="relative">
            {/* Central axis */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800 -translate-x-1/2" />

            {/* Events */}
            <div className="relative space-y-4 md:space-y-5">
              {phase.events.map((event, eventIndex) => {
                const hasBoth = event.llm && event.rag;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{
                      duration: 0.4,
                      delay: eventIndex * 0.05,
                    }}
                    className="flex items-start relative"
                  >
                    {/* Left: LLM */}
                    <TimelineNode
                      side="left"
                      data={event.llm}
                      eventId={`${event.id}-llm`}
                      isActive={activeEventId === `${event.id}-llm`}
                      onClick={setActiveEventId}
                      hasPair={hasBoth}
                    />

                    {/* Center: Date marker */}
                    <div className="relative z-10 flex flex-col items-center justify-start px-2 md:px-3 pt-3">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                      </div>
                      <span className="text-[10px] md:text-xs font-mono text-neutral-400 dark:text-neutral-500 mt-1 whitespace-nowrap">
                        {event.date}
                      </span>
                    </div>

                    {/* Right: RAG */}
                    <TimelineNode
                      side="right"
                      data={event.rag}
                      eventId={`${event.id}-rag`}
                      isActive={activeEventId === `${event.id}-rag`}
                      onClick={setActiveEventId}
                      hasPair={hasBoth}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          <ContextBox text={phase.context} />
        </div>
      ))}
    </div>
  );
}
