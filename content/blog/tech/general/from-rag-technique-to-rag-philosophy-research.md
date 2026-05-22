# RAG 技术演化调研笔记

## 调研目标

为「从 RAG 技术到 RAG 思想」一文提供时间线与节点依据，支撑从两条主线（自然语言生成 + 知识管理）推导出 RAG 必然性的论述。

---

## 一、自然语言生成发展线（NLG Evolution）

这条线的核心问题是：机器如何生成像人一样的自然语言？

| 时间 | 节点 | 标志事件 / 论文 | 关键意义 |
|------|------|----------------|---------|
| 2013 | **Word2Vec** | Mikolov et al. "Efficient Estimation of Word Representations in Vector Space" (Google) | 词语从离散符号变为连续向量，语义可以用空间距离度量。NLP 从"规则工程"进入"表示学习"时代。 |
| 2017 | **Transformer** | Vaswani et al. "Attention Is All You Need" (Google) | 自注意力机制 + 并行化训练，彻底取代 RNN/LSTM 成为 NLP 基础设施。为后来的大模型奠定了架构基础。 |
| 2018.6 | **GPT-1** | Radford et al. "Improving Language Understanding by Generative Pre-Training" (OpenAI) | 证明了"生成式预训练 + 判别式微调"（GPT）路线的可行性。 |
| 2018.10 | **BERT** | Devlin et al. "BERT: Pre-training of Deep Bidirectional Transformers" (Google) | 双向编码器表示，开启"预训练-微调"范式。与 GPT 的生成路线形成对照。 |
| 2019.2 | **GPT-2** | Radford et al. "Language Models are Unsupervised Multitask Learners" (OpenAI) | 15 亿参数，展示了无监督语言模型的零样本能力。OpenAI 因"过于危险"为由延迟完整发布，引发伦理争议。 |
| **2020.5** | **GPT-3** | Brown et al. "Language Models are Few-Shot Learners" (OpenAI) | **1750 亿参数**。上下文学习（In-Context Learning）能力的涌现：不需要微调，只需在 prompt 中给几个示例就能完成新任务。这是 RAG 出现的直接技术前提——大模型能"读"和理解大量上下文。 |
| 2021 | **Scaling Laws** | Kaplan et al. / Hoffmann et al. (Chinchilla) | 模型性能随参数、数据、算力可预测地提升，验证了"大力出奇迹"路线的科学性。 |
| 2022.11 | **ChatGPT** | OpenAI 发布基于 GPT-3.5 的对话系统 | 大模型从实验室走向大众。用户通过对话（prompt）与模型交互，prompt engineering 成为显学。 |
| 2023 | **GPT-4 / Claude / Llama** | 多模态、长上下文（32K→128K）竞争 | 上下文窗口从 4K 迅速扩展到 128K、1M。Context Engineering 成为独立议题。 |

**关键洞察：**
- GPT-3 之前的 NLP 是"训练出一个好模型，然后微调部署"。
- GPT-3 之后变成了"模型已经训练好了，问题是如何**输入**（prompt）让它做正确的事"。
- **Prompt 是大模型时代的 API**——这是从大模型工程技术线分出来的根本原因。

---

## 二、知识管理发展线（Knowledge Management）

用户明确：不追溯到上世纪，以"文档"为载体，聚焦"谁来写、谁来读、怎么写、怎么读"。

这条线的核心问题是：人类积累的知识以文档形式存在，如何让大模型有效利用这些知识？

| 时间 | 阶段 | 特征 | 谁来写 | 谁来读 | 怎么写 | 怎么读 |
|------|------|------|--------|--------|--------|--------|
| ~2010s | **传统信息检索** | 搜索引擎（Google、ElasticSearch） | 人 | 人 | 网页/文档，结构化/半结构化 | 关键词查询 + 人脑筛选 |
| 2019 | **密集检索觉醒** | 向量语义检索起步 | 人 | 机器辅助人 | 文档被编码为稠密向量 | 语义相似度匹配 |
| 2020 | **DPR (Dense Passage Retrieval)** | Karpukhin et al. (Facebook) | 人写文档，机器建索引 | 机器检索，人生成答案 | 段落级向量化 | 双编码器检索 |
| 2020 | **REALM** | Guu et al. (Google) | 人 | 机器 | 端到端预训练+检索 | 检索增强预训练 |
| **2020.12** | **RAG 论文诞生** | Lewis et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (Meta/Facebook) | 人写文档 | **大模型来读 + 生成** | 文档被切片、编码进向量库 | **检索器召回 + 生成器综合** |
| 2022-2023 | **Vector DB 爆发** | Pinecone、Weaviate、Milvus、Chroma、pgvector | 人/机器 | 大模型 | 自动化切片、嵌入、索引 | 近似最近邻(ANN)检索 |
| 2023-2024 | **Advanced RAG** | 查询改写、重排序、混合检索、GraphRAG | 人/机器 | 大模型 | 多路召回、知识图谱构建 | 检索链(Retrieval Chain) |
| 2024-2025 | **MCP / Agent** | Anthropic MCP、Agentic RAG | 人/机器/API | 大模型/Agent | 任意数据源暴露为标准化上下文 | 工具调用 + 上下文协议 |

**关键洞察：**
- 知识管理线的核心张力：**知识以文档形态存在（人写），但大模型需要上下文形态消费（模型读）**。
- RAG 本质上是这个张力的一种工程解法：**把文档变成上下文**。
- 最初的 RAG（2020 论文）确实接近于一种"高级 prompt 工程"：把检索到的文档片段塞进 prompt context 里，让模型生成答案。

---

## 三、大模型工程技术线（从 GPT-3 分出的子线）

这条线回答：有了 GPT-3 的强大生成能力后，工程师们如何把它"用起来"？

| 时间 | 阶段 | 核心问题 | 代表技术/概念 |
|------|------|---------|--------------|
| 2020-2021 | **Prompt Engineering** | 如何设计输入文本，让大模型输出期望结果？ | Few-shot prompting、Zero-shot、Chain-of-Thought (CoT, 2022.1) |
| 2022-2023 | **Context Engineering** | 如何组织、筛选、排序提供给模型的上下文？ | 长上下文窗口（32K→128K→1M）、RAG（检索即上下文组织）、HyDE、Re-ranking |
| 2023-2025 | **Harness Engineering** | 如何编排多个模型/工具/数据源，构建可靠系统？ | LangChain/LlamaIndex (2022-2023)、Agent (ReAct, 2022.10)、Function Calling、MCP (2024.11) |

**三个阶段的递进关系：**

```
Prompt Engineering ──→ Context Engineering ──→ Harness Engineering
   （怎么问）            （给什么材料）            （怎么搭系统）
        │                     │                      │
        └─────────────────────┴──────────────────────┘
                    复杂度递增，抽象层级提升
```

**关键洞察：**
- RAG 横跨 Context Engineering 和 Harness Engineering 两个阶段。
- 早期 RAG（2020-2022）主要是 Context Engineering：解决"给模型什么材料"。
- 后期 RAG（2023-2025）向 Harness Engineering 演进：RAG 不再是单次检索+生成，而是多轮检索、工具调用、Agent 决策的复杂系统。

---

## 四、RAG 技术发展线（合成线）

RAG 是**自然语言生成能力**与**知识管理需求**的交汇产物。

| 时间 | 节点 | 说明 |
|------|------|------|
| 2019 | 向量检索基础 | DPR、REALM 等密集检索技术成熟，为"机器读文档"提供了技术基础 |
| 2020.5 | GPT-3 发布 | 大模型展现出强大的上下文理解和生成能力，"机器读+写"成为可能 |
| **2020.12** | **RAG 诞生** | Lewis et al. 将检索器与 seq2seq 生成器结合，正式提出 Retrieval-Augmented Generation |
| 2021-2022 | RAG 从研究到应用 | 从论文中的端到端训练，转向工程实践中的"检索+prompt"模式 |
| 2022 | Vector DB 独立品类 | Pinecone 等向量数据库让非大厂也能搭建 RAG 系统 |
| 2023 | RAG 工程化爆发 | LangChain、LlamaIndex 等框架降低门槛；查询改写、重排序、混合检索等优化出现 |
| 2023-2024 | GraphRAG / Agentic RAG | 从"平面文档检索"进化到"结构化知识推理"和"自主检索决策" |
| 2024.11 | MCP (Model Context Protocol) | Anthropic 发布，试图标准化大模型与外部数据/工具的上下文交互协议 |

**RAG 本质的演进：**

| 阶段 | 本质 | 形式 |
|------|------|------|
| 最初 (2020) | **高级 Prompt Engineering** | 把检索结果塞进 prompt context |
| 早期 (2021-2022) | **Context Engineering** | 如何组织、筛选、排序上下文 |
| 中期 (2023) | **检索-生成系统** | 向量库 + 重排序 + 生成，工程pipeline |
| 现在 (2024-2025) | **Harness Engineering 的子集** | Agent 工具、MCP 协议、多轮决策 |

---

## 五、对完善图中节点的建议

基于以上调研，建议对原图做以下调整：

## 五、图的最终设计（基于用户反馈修正）

### 用户反馈要点

1. **时间节点修正**：RAG 诞生于 **2020 年**；Harness Engineering 标注为 **2026 年**（当下）。
2. **阶段划分重新命名**：按技术范式重新划分，避免模糊的"harness/agent 阶段"。
3. **节点归属修正**：Vector DB 和 MCP **不放入图中**（不属于知识管理范畴，而是工程基础设施）。

### 最终节点设计

| 线 | 节点（从左到右） |
|---|---|
| **自然语言生成** | Word2Vec(2013) → Transformer(2017) → GPT-3(2020) → 1M Context(2023) |
| **大模型系统工程** | Prompt Engineering(2020) → Context Engineering(2023) → Harness Engineering(2026) |
| **RAG 工程发展** | RAG 诞生(2020) → Advanced RAG(2023) → Agentic RAG(2026) |
| **知识管理** | 传统搜索(~2010) → DPR/REALM(2020) |

### 四个阶段的划分依据（按技术范式）

| 阶段 | 时间 | 核心特征 | 标志事件 |
|------|------|---------|---------|
| **语义奠基期** | 2013-2017 | 语言被编码为连续向量，语义可用空间距离度量 | Word2Vec(2013), Transformer(2017) |
| **能力涌现期** | 2017-2020 | 大模型展现出上下文学习和生成能力的涌现 | GPT-3(2020), DPR/REALM(2020) |
| **上下文工程期** | 2020-2023 | 焦点从"训练好模型"转向"给模型正确的上下文" | Prompt Engineering, RAG, Context Engineering, Advanced RAG |
| **系统 Harness 期** | 2023-2026+ | RAG 从单一技术演化为系统编排范式的一部分 | Harness Engineering, Agentic RAG |

### 合成关系表达

```
自然语言生成线:     Word2Vec ── Transformer ── GPT-3 ────────────→ 1M Context
                                          ↓
大模型系统工程线:                      Prompt Eng ──→ Context Eng ──→ Harness Eng
                                          ↘              ↓              ↓
RAG 工程发展线:                          RAG 诞生 ──→ Advanced RAG ──→ Agentic RAG
                                          ↗
知识管理线:          传统搜索 ──────────────→ DPR/REALM
```

**视觉关键：**
- GPT-3 向下垂直分叉出 Prompt Engineering
- Prompt Engineering 和 DPR/REALM 同时斜向汇入 RAG 诞生节点
- Context Engineering → Advanced RAG（垂直）
- Harness Engineering → Agentic RAG（垂直）

---

## 六、参考来源

1. Lewis, P., et al. (2020). "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." NeurIPS.
2. Brown, T., et al. (2020). "Language Models are Few-Shot Learners." NeurIPS. (GPT-3)
3. Karpukhin, V., et al. (2020). "Dense Passage Retrieval for Open-Domain Question Answering." EMNLP. (DPR)
4. Guu, K., et al. (2020). "REALM: Retrieval-Augmented Language Model Pre-Training." ICML.
5. Vaswani, A., et al. (2017). "Attention Is All You Need." NeurIPS. (Transformer)
6. Mikolov, T., et al. (2013). "Efficient Estimation of Word Representations in Vector Space." ICLR. (Word2Vec)
7. Yao, S., et al. (2022). "ReAct: Synergizing Reasoning and Acting in Language Models." ICLR.
8. Anthropic (2024). "Model Context Protocol" specification.
