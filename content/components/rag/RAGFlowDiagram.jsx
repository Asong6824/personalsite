"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SketchySvg,
  SketchyRect,
  SketchyArrow,
  SketchyLine,
  SketchyDashedLine,
} from "../sketchy";

// ===================== 节点尺寸 =====================
const NW = 130;
const NH = 50;
const HW = NW / 2;
const HH = NH / 2;

// ===================== 节点定义 =====================
const INDEXING_NODES = [
  { id: "raw",    label: "原始文档",   sub: "PDF / HTML / Word",    x: 140, y: 90 },
  { id: "clean",  label: "数据清洗",   sub: "Cleaning",             x: 350, y: 90 },
  { id: "chunk",  label: "文档分块",   sub: "Chunking",             x: 560, y: 90 },
  { id: "chunks", label: "块集合",     sub: "Chunks",               x: 560, y: 200 },
  { id: "embed",  label: "向量嵌入",   sub: "Embedding",            x: 350, y: 200 },
  { id: "vdb",    label: "向量数据库", sub: "Vector DB",            x: 140, y: 200 },
];

const RETRIEVAL_NODES = [
  { id: "query",  label: "用户问题",   sub: "User Query",           x: 740, y: 370 },
  { id: "qproc",  label: "查询处理",   sub: "Query Processing",     x: 530, y: 370 },
  { id: "retr",   label: "检索",       sub: "Retrieval",            x: 350, y: 370 },
  { id: "rerank", label: "重排序",     sub: "Reranking",            x: 160, y: 370 },
  { id: "ctx",    label: "上下文组装", sub: "Context Build",        x: 160, y: 480 },
  { id: "aug",    label: "生成增强",   sub: "Augmentation",         x: 360, y: 480 },
  { id: "llm",    label: "LLM 生成",   sub: "Generation",           x: 560, y: 480 },
  { id: "out",    label: "最终回答",   sub: "含引用来源",           x: 740, y: 480 },
];

// ===================== 技术选型数据（富内容） =====================
const TECH_OPTIONS = {
  clean: {
    title: "数据清洗",
    phase: "索引侧",
    content: [
      { type: "paragraph", text: "数据清洗是 RAG 系统中最重要但最容易被忽视的环节。未经处理的数据直接灌入向量数据库，会导致检索质量下降和幻觉率飙升。" },
      { type: "heading", text: "噪音的三个层次" },
      { type: "list", items: [
        "格式噪音：HTML 标签、Markdown 标记、特殊 Unicode 字符、编码不一致",
        "内容噪音：页眉页脚、页码、导航元素、版权声明等重复内容",
        "语义噪音：语义重复、未登录词（OOV）、多义词混淆",
      ]},
      { type: "heading", text: "文档解析工具链对比" },
      { type: "table", headers: ["工具", "定位", "优势", "适用场景"], rows: [
        ["Unstructured", "企业级端到端", "64+ 文件类型，自动布局分析", "多种格式文档处理"],
        ["Marker", "PDF 转 Markdown", "开源免费，表格公式精度高", "高质量 Markdown 输出"],
        ["PDFPlumber", "表格提取专家", "字符级提取，可视化调试", "表格密集型文档"],
        ["PaddleOCR", "中文 OCR", "百度开源，中文支持优秀", "扫描版 PDF"],
      ]},
    ],
  },
  chunk: {
    title: "文档分块",
    phase: "索引侧",
    content: [
      { type: "paragraph", text: "文档分块（Chunking）将长文档切分为较小段落，以提高检索精度并避免超出 LLM 长度限制。复旦大学 2024 年研究显示，GPT-3.5 在分块大小为 256~512 tokens 时整体表现最好。" },
      { type: "heading", text: "分块粒度与策略" },
      { type: "list", items: [
        "Token 级：最简单直接，但可能硬性切断句子",
        "语义级：LLM 判断断句点，保留上下文但计算耗时",
        "句子级：在语义与效率之间取得较好平衡",
      ]},
      { type: "heading", text: "进阶策略" },
      { type: "list", items: [
        "元数据增强：保留标题层级信息，提升检索上下文",
        "重叠分块：相邻块保留重叠区域以保持语义连续性",
        "层级分块：同时保留细粒度和粗粒度块，兼顾精度与召回",
      ]},
    ],
  },
  embed: {
    title: "向量嵌入",
    phase: "索引侧",
    content: [
      { type: "paragraph", text: "分块后的文本通过嵌入模型转换为高维向量，才能进行语义相似度匹配。技术路线经历了从稀疏统计到静态词嵌入，再到动态上下文嵌入的演进。" },
      { type: "heading", text: "技术路线演进" },
      { type: "list", items: [
        "稀疏统计（TF-IDF / BM25）：基于关键词频率的精确匹配，擅长专业术语",
        "静态词嵌入（Word2Vec / GloVe / FastText）：基于分布假设，一词一码",
        "动态上下文嵌入（BERT / SimCSE / E5 / BGE）：同一词在不同句子中生成不同向量",
      ]},
      { type: "heading", text: "主流嵌入模型对比" },
      { type: "table", headers: ["模型", "出品方", "核心特点"], rows: [
        ["BGE-M3", "北京智源 BAAI", "多语言（100+）、混合检索、稠密+稀疏+多向量"],
        ["GTE-Qwen2-7B", "阿里巴巴", "超长上下文（32k+），大模型底座"],
        ["E5-Mistral-7B", "微软", "指令微调先驱，query/passage 前缀范式"],
        ["Multilingual-E5-Large", "微软", "稳健的多语言模型"],
      ]},
    ],
  },
  vdb: {
    title: "向量数据库",
    phase: "索引侧",
    content: [
      { type: "paragraph", text: "RAG 存储层需要同时满足三个目标：存储原始文档、存储向量、支持高效检索。索引算法和数据库选型直接决定了系统的扩展性和查询延迟。" },
      { type: "heading", text: "索引算法" },
      { type: "list", items: [
        "HNSW（分层可导航小世界图）：查询速度极快，Milvus 等默认算法，缺点是构建索引慢且耗内存",
        "IVF（倒排文件索引）：通过 K-Means 聚类划分区域，适合搭配 PQ 压缩",
        "PQ（乘积量化）：数据压缩技术，将高维向量压缩为聚类中心 ID，节省内存但有精度损失",
      ]},
      { type: "heading", text: "向量数据库选型对比" },
      { type: "table", headers: ["数据库", "定位", "优势", "劣势", "适用场景"], rows: [
        ["Milvus", "云原生企业级", "极高弹性，存储计算分离", "部署运维复杂", "十亿级向量"],
        ["Qdrant", "单机性能极致", "Rust 编写，mmap 技术，内存效率高", "分布式管理不如 Milvus", "中等规模，注重成本"],
        ["Pinecone", "Serverless 云服务", "零运维，按需计费", "供应商锁定", "快速上线，流量波动大"],
        ["Chroma", "本地开发首选", "开箱即用，API 友好", "无企业级特性", "本地测试，原型开发"],
        ["pgvector", "PG 扩展", "ACID 事务，复用 PG 生态", "单机性能天花板", "已有 PG 基础设施"],
        ["Elasticsearch", "搜索引擎扩展", "混合搜索（BM25+HNSW）", "内存开销极大", "已有 ES 基础设施"],
      ]},
    ],
  },
  qproc: {
    title: "查询处理",
    phase: "检索侧",
    content: [
      { type: "paragraph", text: "用户查询进入 RAG 系统的第一道工序，负责弥合用户表达与知识库文档间的语义鸿沟。" },
      { type: "heading", text: "查询改写策略" },
      { type: "list", items: [
        "同义词扩展：将口语化表达转为标准术语",
        "分解扩展：将复合查询拆分为多个子查询",
        "上下文压缩：提取多轮对话中的核心意图",
      ]},
      { type: "heading", text: "高级策略" },
      { type: "list", items: [
        "HyDE（假设文档嵌入）：让 LLM 先生成一个假设答案文档，再用假设文档的向量去检索真实知识库",
        "子查询分解：将复杂查询拆分为简单子查询分别检索后合并结果，适用于多意图和比较查询",
      ]},
    ],
  },
  retr: {
    title: "检索",
    phase: "检索侧",
    content: [
      { type: "paragraph", text: "从预先构建的知识库中找到与查询最相关的文档片段。检索质量直接决定 RAG 系统最终效果——如果召回的文档本身不相关，再强大的 LLM 也无法生成正确答案。" },
      { type: "heading", text: "检索模式与策略" },
      { type: "list", items: [
        "单阶段检索：直接 top-k 召回，延迟低，实现简单，适合简单场景",
        "两阶段检索：召回（Recall）→ 重排（Rank），精度高但延迟略增，适合高精度场景",
        "混合检索（Hybrid Search）：BM25（稀疏）+ 向量（稠密），兼顾精确匹配与语义理解",
        "RRF（倒数排名融合）：多路召回结果的融合算法，无需调参，k 通常设为 60",
      ]},
      { type: "heading", text: "检索评估指标" },
      { type: "list", items: [
        "Recall@K：前 K 个结果中包含相关文档的比例",
        "MRR（Mean Reciprocal Rank）：首个相关文档排名的倒数均值",
        "NDCG@K：前 K 个结果的归一化折扣累积增益",
      ]},
    ],
  },
  rerank: {
    title: "重排序",
    phase: "检索侧",
    content: [
      { type: "paragraph", text: "在初步召回的候选文档基础上，使用更精确的排序模型进行二次排序。典型流程：向量检索 top-100 → Cross-Encoder 重排 top-20 → LLM 生成。" },
      { type: "heading", text: "Cross-Encoder vs Bi-Encoder" },
      { type: "table", headers: ["特性", "Bi-Encoder", "Cross-Encoder"], rows: [
        ["处理方式", "文档独立编码再计算相似度", "查询文档联合编码"],
        ["速度", "快（可预计算向量）", "慢（需实时推理）"],
        ["精度", "中等", "高"],
        ["适用场景", "大规模召回", "精确排序"],
      ]},
      { type: "heading", text: "推荐模型与策略" },
      { type: "list", items: [
        "BGE-Reranker-v2-m3：多语言，0.6B 参数",
        "Cohere Rerank 3：商用 API，效果稳定",
        "LLM-as-Judge：直接用 GPT-4 判断相关性，成本高但灵活",
        "MMR（最大边际相关性）：在相关性与多样性之间取得平衡，λ 参数控制权衡",
      ]},
    ],
  },
  ctx: {
    title: "上下文组装",
    phase: "检索侧",
    content: [
      { type: "paragraph", text: "将检索到的上下文与用户问题组合为 LLM 的输入，优化检索结果的理解和利用效率。检索结果往往包含大量冗余，直接填入 context window 会浪费 tokens。" },
      { type: "heading", text: "关键技术" },
      { type: "list", items: [
        "上下文压缩（LLMLingua）：通过 LLM 识别并保留关键信息，降低 tokens 用量同时保持语义完整性",
        "动态 Few-shot 示例选择：选择与当前问题最相似的示例，而非使用固定示例",
        "提示词模板设计：角色定义 + 上下文注入 + 约束条件（如仅根据参考文档回答）",
        "CoT（Chain-of-Thought）：引导 LLM 先推理再回答，提升复杂问题处理质量",
      ]},
    ],
  },
  llm: {
    title: "LLM 生成",
    phase: "检索侧",
    content: [
      { type: "paragraph", text: "将增强后的提示词输入 LLM 生成最终回答。流式输出（SSE / WebSocket）逐步返回 token，是现代 LLM 应用的标准配置。" },
      { type: "heading", text: "幻觉缓解方案" },
      { type: "list", items: [
        "Self-RAG（自我反思 RAG）：通过特殊 token（[Retrieve]、[Relevant]、[Supported]、[Contradict]）让模型学会自我判断是否需要检索、评估检索相关性、评估生成忠实度",
        "CRITIC（批评驱动）：让 LLM 主动调用外部工具验证和修正自身生成内容，迭代式提升质量",
        "引用标注（Citation / Grounding）：将答案片段与原文建立对应关系，用户可追溯验证",
      ]},
    ],
  },
};

// ===================== 颜色 =====================
const C_IDX_BG  = "#fefce8";  const C_IDX_BD  = "#fde68a";
const C_RET_BG  = "#eff6ff";  const C_RET_BD  = "#bfdbfe";
const C_IDX_ST  = "#f59e0b";  const C_IDX_TXT = "#92400e";  const C_IDX_SUB = "#b45309";
const C_RET_ST  = "#3b82f6";  const C_RET_TXT = "#1e40af";  const C_RET_SUB = "#3b82f6";
const C_LINE    = "#9ca3af";

// ===================== 富内容渲染 =====================
function renderBlock(block, isIndexing) {
  const textColor = isIndexing ? "text-amber-900" : "text-blue-900";
  const subColor = isIndexing ? "text-amber-800" : "text-blue-800";
  const mutedColor = isIndexing ? "text-amber-700" : "text-blue-700";
  const tableHeader = isIndexing ? "bg-amber-100/70" : "bg-blue-100/70";
  const tableBorder = isIndexing ? "border-amber-200" : "border-blue-200";
  const bulletColor = isIndexing ? "bg-amber-400" : "bg-blue-400";

  switch (block.type) {
    case "paragraph":
      return <p className={`text-sm leading-relaxed ${mutedColor}`}>{block.text}</p>;

    case "heading":
      return <h5 className={`text-sm font-bold mt-2 ${textColor}`}>{block.text}</h5>;

    case "list":
      return (
        <ul className="space-y-2">
          {block.items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
              <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${bulletColor}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className={tableHeader}>
                {block.headers.map((h, j) => (
                  <th key={j} className={`px-2 py-1.5 text-left font-semibold ${subColor} border-b ${tableBorder}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, j) => (
                <tr key={j} className="border-b border-gray-100 last:border-0">
                  {row.map((cell, k) => (
                    <td key={k} className={`px-2 py-1.5 text-gray-600 ${k < row.length - 1 ? `border-r ${tableBorder}` : ""}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

// ===================== 主组件 =====================
export function RAGFlowDiagram() {
  const [activeNode, setActiveNode] = useState(null);

  const techData = activeNode ? TECH_OPTIONS[activeNode] : null;
  const isIndexing = techData?.phase === "索引侧";

  const handleClick = (id) => {
    if (!TECH_OPTIONS[id]) return;
    setActiveNode((prev) => (prev === id ? null : id));
  };

  return (
    <div className="my-8 not-prose flex justify-center">
      <div className="relative w-full">
        <SketchySvg width={900} height={600} viewBox="0 0 900 600" className="mx-auto">

          {/* ---------- 背景区域（普通rect，禁用hover） ---------- */}
          <rect x={30} y={20} width={840} height={240} rx={14}
            fill={C_IDX_BG} stroke={C_IDX_BD} strokeWidth={1.5} />
          <rect x={30} y={300} width={840} height={280} rx={14}
            fill={C_RET_BG} stroke={C_RET_BD} strokeWidth={1.5} />

          {/* ---------- 分隔虚线 ---------- */}
          <SketchyDashedLine x1={50} y1={285} x2={850} y2={285}
            dashArray={[10, 6]} stroke={C_LINE} strokeWidth={1.2}
            roughness={0.8} seed={3} />

          {/* ---------- 侧标签 ---------- */}
          <SketchyRect x={50} y={4} width={125} height={24} rx={12}
            fill={C_IDX_BG} stroke={C_IDX_ST} strokeWidth={1.2}
            roughness={0.6} seed={4} />
          <text x={112} y={20} textAnchor="middle" fontSize={11} fontWeight={700}
            fill={C_IDX_TXT} fontFamily="system-ui, sans-serif">INDEXING SIDE · 索引侧</text>

          <SketchyRect x={50} y={556} width={138} height={24} rx={12}
            fill={C_RET_BG} stroke={C_RET_ST} strokeWidth={1.2}
            roughness={0.6} seed={5} />
          <text x={119} y={572} textAnchor="middle" fontSize={11} fontWeight={700}
            fill={C_RET_TXT} fontFamily="system-ui, sans-serif">RETRIEVAL SIDE · 检索侧</text>

          {/* ---------- 跨区域连接线 ---------- */}
          <SketchyLine x1={140} y1={225} x2={140} y2={300}
            stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={10} />
          <SketchyLine x1={140} y1={300} x2={350} y2={300}
            stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={11} />
          <SketchyArrow x1={350} y1={300} x2={350} y2={345} arrowSize={10}
            stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={12} />

          {/* ---------- 索引侧内部连接线 ---------- */}
          <SketchyArrow x1={205} y1={90}  x2={285} y2={90}  arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={20} />
          <SketchyArrow x1={415} y1={90}  x2={495} y2={90}  arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={21} />
          <SketchyArrow x1={560} y1={115} x2={560} y2={175} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={22} />
          <SketchyArrow x1={495} y1={200} x2={415} y2={200} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={23} />
          <SketchyArrow x1={285} y1={200} x2={205} y2={200} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={24} />

          {/* ---------- 检索侧内部连接线 ---------- */}
          <SketchyArrow x1={675} y1={370} x2={595} y2={370} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={30} />
          <SketchyArrow x1={465} y1={370} x2={415} y2={370} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={31} />
          <SketchyArrow x1={285} y1={370} x2={225} y2={370} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={32} />
          <SketchyArrow x1={160} y1={395} x2={160} y2={455} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={33} />
          <SketchyArrow x1={225} y1={480} x2={295} y2={480} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={34} />
          <SketchyArrow x1={425} y1={480} x2={495} y2={480} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={35} />
          <SketchyArrow x1={625} y1={480} x2={675} y2={480} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={36} />
          <SketchyArrow x1={805} y1={480} x2={850} y2={480} arrowSize={10} stroke={C_LINE} strokeWidth={1.5} roughness={1.0} seed={37} />

          {/* ---------- 索引侧节点框 ---------- */}
          {INDEXING_NODES.map((n, i) => {
            const active = activeNode === n.id;
            return (
              <SketchyRect key={n.id}
                x={n.x - HW} y={n.y - HH} width={NW} height={NH} rx={10}
                fill="#ffffff"
                stroke={active ? "#d97706" : C_IDX_ST}
                strokeWidth={active ? 2.2 : 1.6}
                roughness={1.5} bowing={1.2} seed={100 + i} />
            );
          })}

          {/* ---------- 检索侧节点框 ---------- */}
          {RETRIEVAL_NODES.map((n, i) => {
            const active = activeNode === n.id;
            return (
              <SketchyRect key={n.id}
                x={n.x - HW} y={n.y - HH} width={NW} height={NH} rx={10}
                fill="#ffffff"
                stroke={active ? "#2563eb" : C_RET_ST}
                strokeWidth={active ? 2.2 : 1.6}
                roughness={1.5} bowing={1.2} seed={200 + i} />
            );
          })}

          {/* ---------- 节点文字 ---------- */}
          {[...INDEXING_NODES, ...RETRIEVAL_NODES].map((n) => {
            const isIdx = INDEXING_NODES.find((x) => x.id === n.id);
            return (
              <g key={`t-${n.id}`}>
                <text x={n.x} y={n.y - 3} textAnchor="middle" fontSize={12} fontWeight={700}
                  fill={isIdx ? C_IDX_TXT : C_RET_TXT} fontFamily="system-ui, sans-serif"
                >{n.label}</text>
                <text x={n.x} y={n.y + 14} textAnchor="middle" fontSize={9}
                  fill={isIdx ? C_IDX_SUB : C_RET_SUB} fontFamily="system-ui, sans-serif"
                >{n.sub}</text>
              </g>
            );
          })}

          {/* ---------- 透明事件捕获层 ---------- */}
          {[...INDEXING_NODES, ...RETRIEVAL_NODES].map((n) => (
            <rect
              key={`hit-${n.id}`}
              x={n.x - HW} y={n.y - HH} width={NW} height={NH} rx={10}
              fill="transparent"
              style={{ cursor: TECH_OPTIONS[n.id] ? "pointer" : "default" }}
              onClick={() => handleClick(n.id)}
            />
          ))}

        </SketchySvg>

        {/* ---------- 可折叠技术选型面板 ---------- */}
        <AnimatePresence>
          {techData && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -8 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden mt-4"
            >
              <div className={`rounded-xl border p-5 ${
                isIndexing
                  ? "bg-amber-50/80 border-amber-200"
                  : "bg-blue-50/80 border-blue-200"
              }`}>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${
                    isIndexing ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {techData.phase}
                  </span>
                  <h4 className={`text-base font-bold ${
                    isIndexing ? "text-amber-900" : "text-blue-900"
                  }`}>
                    {techData.title}
                  </h4>
                </div>

                <div className="space-y-4">
                  {techData.content.map((block, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {renderBlock(block, isIndexing)}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-gray-400 text-xs mt-3">
          点击节点查看该阶段技术选型，再次点击收起 · 上方为离线索引侧，下方为在线检索侧
        </p>
      </div>
    </div>
  );
}
