"use client";

import {
  SketchySvg,
  SketchyArrow,
  SketchyLine,
  SketchyCircle,
  SketchyDashedLine,
  SketchyText,
} from "../sketchy";

// 颜色定义
const C_NLG = "#60a5fa";      // 蓝色 - 自然语言生成
const C_ENG = "#fbbf24";      // 琥珀色 - 大模型系统工程
const C_RAG = "#fb923c";      // 橙色 - RAG
const C_KM = "#4ade80";       // 绿色 - 知识管理
const C_MUTED = "#6b7280";    // 辅助文字

export function SketchyRAGOverview() {
  return (
    <div className="my-8 not-prose overflow-hidden">
      <div className="w-full">
        <SketchySvg width={1000} height={380} viewBox="0 0 1000 380" className="w-full h-auto">
          {/* ===== 时代背景分区 ===== */}
          <SketchyDashedLine x1={50} y1={16} x2={260} y2={16} dashArray={[6, 4]} />
          <SketchyDashedLine x1={260} y1={16} x2={410} y2={16} dashArray={[6, 4]} />
          <SketchyDashedLine x1={410} y1={16} x2={640} y2={16} dashArray={[6, 4]} />
          <SketchyDashedLine x1={640} y1={16} x2={950} y2={16} dashArray={[6, 4]} />

          <SketchyText x={120} y={13} text="语义奠基期" fontSize={11} color={C_MUTED} />
          <SketchyText x={300} y={13} text="能力涌现期" fontSize={11} color={C_MUTED} />
          <SketchyText x={490} y={13} text="上下文工程期" fontSize={11} color={C_MUTED} />
          <SketchyText x={760} y={13} text="系统 Harness 期" fontSize={11} color={C_MUTED} />

          {/* ===== 四条水平时间线 ===== */}
          <SketchyArrow x1={60} y1={50} x2={950} y2={50} />
          <SketchyArrow x1={450} y1={135} x2={950} y2={135} />
          <SketchyArrow x1={560} y1={220} x2={950} y2={220} />
          <SketchyArrow x1={60} y1={305} x2={520} y2={305} />

          {/* ===== 左侧标签 ===== */}
          <SketchyText x={8} y={55} text="自然语言生成" fontSize={13} />
          <SketchyText x={8} y={140} text="大模型系统工程" fontSize={13} />
          <SketchyText x={8} y={225} text="RAG 工程发展" fontSize={13} />
          <SketchyText x={8} y={310} text="知识管理" fontSize={13} />

          {/* ===== 时间刻度（底部） ===== */}
          <SketchyText x={170} y={365} text="2013" fontSize={10} color={C_MUTED} />
          <SketchyText x={330} y={365} text="2017" fontSize={10} color={C_MUTED} />
          <SketchyText x={470} y={365} text="2020" fontSize={10} color={C_MUTED} />
          <SketchyText x={770} y={365} text="2023" fontSize={10} color={C_MUTED} />
          <SketchyText x={910} y={365} text="2026" fontSize={10} color={C_MUTED} />

          {/* ===== 垂直虚线：阶段分隔 ===== */}
          <SketchyDashedLine x1={260} y1={28} x2={260} y2={350} dashArray={[8, 6]} />
          <SketchyDashedLine x1={410} y1={28} x2={410} y2={350} dashArray={[8, 6]} />
          <SketchyDashedLine x1={640} y1={28} x2={640} y2={350} dashArray={[8, 6]} />

          {/* ========================================== */
          /* 自然语言生成线节点 */
          /* ========================================== */}

          {/* Word2Vec */}
          <SketchyCircle cx={180} cy={50} diameter={10} fill={C_NLG} stroke={C_NLG} strokeWidth={1} />
          <SketchyText x={155} y={35} text="Word2Vec" fontSize={11} />

          {/* Transformer */}
          <SketchyCircle cx={340} cy={50} diameter={10} fill={C_NLG} stroke={C_NLG} strokeWidth={1} />
          <SketchyText x={315} y={35} text="Transformer" fontSize={11} />

          {/* GPT-3 */}
          <SketchyCircle cx={480} cy={50} diameter={12} fill={C_NLG} stroke={C_NLG} strokeWidth={1.5} />
          <SketchyText x={505} y={47} text="GPT-3" fontSize={13} />

          {/* 1M Context */}
          <SketchyCircle cx={780} cy={50} diameter={10} fill={C_NLG} stroke={C_NLG} strokeWidth={1} />
          <SketchyText x={800} y={47} text="1M Context" fontSize={11} />

          {/* ========================================== */
          /* 知识管理线节点 */
          /* ========================================== */}

          {/* 传统搜索 */}
          <SketchyCircle cx={80} cy={305} diameter={8} fill={C_KM} stroke={C_KM} strokeWidth={1} />
          <SketchyText x={50} y={325} text="传统搜索" fontSize={10} />

          {/* DPR / REALM */}
          <SketchyCircle cx={480} cy={305} diameter={10} fill={C_KM} stroke={C_KM} strokeWidth={1} />
          <SketchyText x={455} y={325} text="DPR/REALM" fontSize={11} />

          {/* ========================================== */
          /* 大模型系统工程线节点 */
          /* ========================================== */}

          {/* Prompt Engineering */}
          <SketchyCircle cx={480} cy={135} diameter={10} fill={C_ENG} stroke={C_ENG} strokeWidth={1} />
          <SketchyText x={425} y={155} text="Prompt Engineering" fontSize={10} />

          {/* Context Engineering */}
          <SketchyCircle cx={780} cy={135} diameter={10} fill={C_ENG} stroke={C_ENG} strokeWidth={1} />
          <SketchyText x={725} y={155} text="Context Engineering" fontSize={10} />

          {/* Harness Engineering */}
          <SketchyCircle cx={920} cy={135} diameter={10} fill={C_ENG} stroke={C_ENG} strokeWidth={1} />
          <SketchyText x={865} y={155} text="Harness Engineering" fontSize={10} />

          {/* ========================================== */
          /* RAG 工程发展线节点 */
          /* ========================================== */}

          {/* RAG 诞生 */}
          <SketchyCircle cx={600} cy={220} diameter={12} fill={C_RAG} stroke={C_RAG} strokeWidth={1.5} />
          <SketchyText x={620} y={217} text="RAG" fontSize={13} />
          <SketchyText x={620} y={233} text="诞生" fontSize={10} color={C_MUTED} />

          {/* Advanced RAG */}
          <SketchyCircle cx={780} cy={220} diameter={10} fill={C_RAG} stroke={C_RAG} strokeWidth={1} />
          <SketchyText x={800} y={217} text="Advanced RAG" fontSize={11} />

          {/* Agentic RAG */}
          <SketchyCircle cx={920} cy={220} diameter={10} fill={C_RAG} stroke={C_RAG} strokeWidth={1} />
          <SketchyText x={935} y={217} text="Agentic RAG" fontSize={11} />

          {/* ========================================== */
          /* 关键连接线：表达分叉与合成关系 */
          /* ========================================== */}

          {/* GPT-3 ↓ Prompt Engineering：分叉 */}
          <SketchyLine x1={480} y1={56} x2={480} y2={130} />

          {/* Prompt Engineering ↘ RAG：合成输入 1 */}
          <SketchyLine x1={485} y1={140} x2={595} y2={214} />

          {/* DPR/REALM ↗ RAG：合成输入 2 */}
          <SketchyLine x1={485} y1={300} x2={595} y2={226} />

          {/* Context Engineering ↓ Advanced RAG */}
          <SketchyLine x1={780} y1={140} x2={780} y2={215} />

          {/* Harness Engineering ↓ Agentic RAG */}
          <SketchyLine x1={920} y1={140} x2={920} y2={215} />
        </SketchySvg>

        <div className="text-center mt-2 text-xs space-y-1" style={{ color: "var(--channel-muted, #6b7280)" }}>
          <p>鼠标悬停在线条、节点上查看交互效果</p>
          <p style={{ color: "var(--channel-muted, #9ca3af)", opacity: 0.72 }}>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />自然语言生成
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mx-1 ml-3" />大模型系统工程
            <span className="inline-block w-2 h-2 rounded-full bg-orange-400 mx-1 ml-3" />RAG 工程
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mx-1 ml-3" />知识管理
          </p>
        </div>
      </div>
    </div>
  );
}
