"use client";

import rough from "roughjs";

// 辅助函数：将 rough.js 生成的元素添加到 DOM
export function appendRoughElements(group, elements) {
  if (!group) return;
  // 清空之前的元素
  while (group.firstChild) {
    group.removeChild(group.firstChild);
  }
  // rough.js 可能返回单个元素或数组
  const els = Array.isArray(elements) ? elements : [elements];
  els.forEach((el) => {
    if (el) group.appendChild(el);
  });
}

// 辅助函数：合并选项
export function mergeOptions(defaultOpts, props, isHovered) {
  const opts = {
    ...defaultOpts,
    roughness: props.roughness ?? defaultOpts.roughness,
    bowing: props.bowing ?? defaultOpts.bowing,
    stroke: props.stroke ?? defaultOpts.stroke,
    strokeWidth: props.strokeWidth ?? defaultOpts.strokeWidth,
    fill: props.fill ?? defaultOpts.fill,
    fillStyle: props.fillStyle ?? defaultOpts.fillStyle,
    hachureAngle: props.hachureAngle ?? defaultOpts.hachureAngle,
    hachureGap: props.hachureGap ?? defaultOpts.hachureGap,
    fillWeight: props.fillWeight ?? defaultOpts.fillWeight,
    curveStepCount: props.curveStepCount ?? defaultOpts.curveStepCount,
    simplification: props.simplification ?? defaultOpts.simplification,
    seed: props.seed ?? defaultOpts.seed,
  };

  if (isHovered) {
    opts.stroke = props.hoverStroke || "#3b82f6";
    opts.strokeWidth = (opts.strokeWidth || 1.5) * (props.hoverStrokeWidthMultiplier || 1.5);
  }

  return opts;
}

// 辅助函数：计算箭头两端点
export function calculateArrowHead(x1, y1, x2, y2, arrowSize = 12) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowAngle = Math.PI / 6; // 30度

  return {
    left: {
      x: x2 - arrowSize * Math.cos(angle - arrowAngle),
      y: y2 - arrowSize * Math.sin(angle - arrowAngle),
    },
    right: {
      x: x2 - arrowSize * Math.cos(angle + arrowAngle),
      y: y2 - arrowSize * Math.sin(angle + arrowAngle),
    },
  };
}
