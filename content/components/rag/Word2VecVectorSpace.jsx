"use client";

import {
  SketchySvg,
  SketchyCircle,
  SketchyDashedLine,
  SketchyText,
} from "../sketchy";

const C_MALE = "#2563eb";   // 蓝色
const C_FEMALE = "#dc2626"; // 红色

export function Word2VecVectorSpace() {
  return (
    <div className="my-6 not-prose flex justify-center">
      <div className="relative">
        <SketchySvg width={760} height={600} viewBox="0 0 380 300">
          {/* 坐标轴 */}
          <SketchyDashedLine x1={50} y1={250} x2={330} y2={250} dashArray={[4, 3]} />
          <SketchyDashedLine x1={50} y1={250} x2={50} y2={50} dashArray={[4, 3]} />

          {/* Man — 蓝色 */}
          <SketchyCircle cx={100} cy={200} diameter={14} fill={C_MALE} stroke={C_MALE} strokeWidth={1} />
          <SketchyText x={115} y={196} text="Man" fontSize={12} />

          {/* Woman — 红色 */}
          <SketchyCircle cx={230} cy={215} diameter={14} fill={C_FEMALE} stroke={C_FEMALE} strokeWidth={1} />
          <SketchyText x={245} y={211} text="Woman" fontSize={12} />

          {/* King — 蓝色 */}
          <SketchyCircle cx={150} cy={110} diameter={14} fill={C_MALE} stroke={C_MALE} strokeWidth={1} />
          <SketchyText x={165} y={106} text="King" fontSize={12} />

          {/* Queen — 红色 */}
          <SketchyCircle cx={280} cy={125} diameter={14} fill={C_FEMALE} stroke={C_FEMALE} strokeWidth={1} />
          <SketchyText x={295} y={121} text="Queen" fontSize={12} />

          {/* 虚线连接：Man → Woman */}
          <SketchyDashedLine x1={107} y1={203} x2={223} y2={212} dashArray={[5, 4]} />

          {/* 虚线连接：King → Queen */}
          <SketchyDashedLine x1={157} y1={113} x2={273} y2={122} dashArray={[5, 4]} />
        </SketchySvg>
        <p className="text-center text-gray-400 text-xs mt-1">
          向量空间中，king − man + woman ≈ queen 的几何示意
        </p>
      </div>
    </div>
  );
}
