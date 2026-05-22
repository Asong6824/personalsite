"use client";

import {
  SketchySvg,
  SketchyPath,
  SketchyLine,
  SketchyDashedLine,
  SketchyText,
} from "../sketchy";

const C_175B = "#3b82f6";       // 蓝色
const C_175B_LIGHT = "#93c5fd";  // 浅蓝（No Prompt）
const C_13B = "#f59e0b";         // 橙色
const C_1_3B = "#22c55e";        // 绿色
const C_AXIS = "#9ca3af";        // 灰色
const C_TEXT = "#4b5563";        // 深灰文字

export function InContextLearningChart() {
  return (
    <div className="my-6 not-prose flex justify-center">
      <div className="relative">
        <SketchySvg width={1040} height={720} viewBox="0 0 520 360">
          {/* 坐标轴 */}
          <SketchyLine x1={60} y1={280} x2={460} y2={280} stroke={C_AXIS} strokeWidth={0.8} />
          <SketchyLine x1={60} y1={280} x2={60} y2={50} stroke={C_AXIS} strokeWidth={0.8} />

          {/* X轴刻度线 */}
          <SketchyLine x1={90} y1={280} x2={90} y2={285} stroke={C_AXIS} strokeWidth={0.6} />
          <SketchyLine x1={260} y1={280} x2={260} y2={285} stroke={C_AXIS} strokeWidth={0.6} />
          <SketchyLine x1={440} y1={280} x2={440} y2={285} stroke={C_AXIS} strokeWidth={0.6} />

          {/* Y轴刻度线 */}
          <SketchyLine x1={55} y1={280} x2={60} y2={280} stroke={C_AXIS} strokeWidth={0.6} />
          <SketchyLine x1={55} y1={203} x2={60} y2={203} stroke={C_AXIS} strokeWidth={0.6} />
          <SketchyLine x1={55} y1={127} x2={60} y2={127} stroke={C_AXIS} strokeWidth={0.6} />
          <SketchyLine x1={55} y1={50} x2={60} y2={50} stroke={C_AXIS} strokeWidth={0.6} />

          {/* X轴标签 */}
          <SketchyText x={80} y={298} text="10⁰" fontSize={10} color={C_TEXT} />
          <SketchyText x={250} y={298} text="10¹" fontSize={10} color={C_TEXT} />
          <SketchyText x={432} y={298} text="50" fontSize={10} color={C_TEXT} />
          <SketchyText x={215} y={318} text="Context 中的示例数" fontSize={11} color={C_TEXT} />

          {/* Y轴标签 */}
          <SketchyText x={38} y={284} text="0" fontSize={10} color={C_TEXT} />
          <SketchyText x={32} y={207} text="20" fontSize={10} color={C_TEXT} />
          <SketchyText x={32} y={131} text="40" fontSize={10} color={C_TEXT} />
          <SketchyText x={32} y={54} text="60" fontSize={10} color={C_TEXT} />
          <SketchyText x={14} y={170} text="准确率(%)" fontSize={11} color={C_TEXT} />

          {/* 顶部分隔标注 */}
          <SketchyDashedLine x1={90} y1={35} x2={90} y2={42} dashArray={[3, 2]} stroke={C_AXIS} />
          <SketchyDashedLine x1={155} y1={35} x2={155} y2={42} dashArray={[3, 2]} stroke={C_AXIS} />
          <SketchyDashedLine x1={260} y1={35} x2={260} y2={42} dashArray={[3, 2]} stroke={C_AXIS} />
          <SketchyText x={60} y={28} text="Zero-shot" fontSize={9} color={C_TEXT} />
          <SketchyText x={125} y={28} text="One-shot" fontSize={9} color={C_TEXT} />
          <SketchyText x={300} y={28} text="Few-shot" fontSize={9} color={C_TEXT} />

          {/* 175B Natural Language Prompt */}
          <SketchyPath
            points={[[90, 108], [130, 88], [180, 69], [260, 58], [350, 46], [440, 42]]}
            stroke={C_175B}
            strokeWidth={1.5}
          />

          {/* 175B No Prompt */}
          <SketchyPath
            points={[[90, 249], [130, 220], [180, 200], [260, 184], [350, 168], [440, 157]]}
            stroke={C_175B_LIGHT}
            strokeWidth={0.8}
          />

          {/* 13B Natural Language Prompt */}
          <SketchyPath
            points={[[90, 249], [130, 235], [180, 220], [260, 203], [350, 188], [440, 173]]}
            stroke={C_13B}
            strokeWidth={1.2}
          />

          {/* 1.3B Natural Language Prompt */}
          <SketchyPath
            points={[[90, 272], [260, 268], [440, 261]]}
            stroke={C_1_3B}
            strokeWidth={1.2}
          />

          {/* 右侧标签 */}
          <SketchyText x={465} y={42} text="175B" fontSize={11} color={C_175B} />
          <SketchyText x={465} y={173} text="13B" fontSize={11} color={C_13B} />
          <SketchyText x={465} y={261} text="1.3B" fontSize={11} color={C_1_3B} />
        </SketchySvg>
        <p className="text-center text-gray-400 text-xs mt-1">
          GPT-3 的上下文学习能力：模型规模越大，从示例中学习的效果越显著
        </p>
      </div>
    </div>
  );
}
