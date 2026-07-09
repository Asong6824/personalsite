"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import { useSketchySvg } from "./SketchySvg";
import { appendRoughElements, mergeOptions } from "./utils";

export function SketchyText({
  x,
  y,
  text,
  fontSize = 14,
  fontFamily = "'Excalifont', 'LXGW WenKai GB', 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif",
  color = "#1a1a1a",
  background,
  backgroundPadding = { x: 8, y: 4 },
  roughness,
  bowing,
  stroke,
  strokeWidth,
  fill,
  fillStyle,
  seed,
  className = "",
  style = {},
  hoverStroke,
  hoverStrokeWidthMultiplier,
  hoverColor,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const groupRef = useRef(null);
  const { svgRef, options: defaultOptions } = useSketchySvg();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!svgRef?.current || !groupRef.current) return;

    const rc = rough.svg(svgRef.current);
    const opts = mergeOptions(defaultOptions, {
      roughness, bowing, stroke, strokeWidth, fill, fillStyle, seed,
      hoverStroke, hoverStrokeWidthMultiplier,
    }, isHovered);

    // 清空
    while (groupRef.current.firstChild) {
      groupRef.current.removeChild(groupRef.current.firstChild);
    }

    // 估算文字尺寸（粗略）
    const charWidth = fontSize * 0.6;
    const textWidth = text.length * charWidth;
    const textHeight = fontSize * 1.2;

    // 如果有背景，先画背景框
    if (background) {
      const bgOpts = { ...opts, fill: background, stroke: opts.stroke };
      const bgRect = rc.rectangle(
        x - backgroundPadding.x,
        y - backgroundPadding.y - textHeight * 0.7,
        textWidth + backgroundPadding.x * 2,
        textHeight + backgroundPadding.y * 2,
        bgOpts
      );
      if (Array.isArray(bgRect)) {
        bgRect.forEach((el) => groupRef.current.appendChild(el));
      } else {
        groupRef.current.appendChild(bgRect);
      }
    }

    // 创建 SVG text 元素
    const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textEl.setAttribute("x", x);
    textEl.setAttribute("y", y);
    textEl.setAttribute("font-size", fontSize);
    textEl.setAttribute("font-family", fontFamily);
    textEl.setAttribute("fill", isHovered && hoverColor ? hoverColor : color);
    textEl.setAttribute("dominant-baseline", "middle");
    textEl.textContent = text;
    groupRef.current.appendChild(textEl);

    return () => {
      if (groupRef.current) {
        while (groupRef.current.firstChild) {
          groupRef.current.removeChild(groupRef.current.firstChild);
        }
      }
    };
  }, [svgRef, x, y, text, fontSize, fontFamily, color, background, backgroundPadding, roughness, bowing, stroke, strokeWidth, fill, fillStyle, seed, isHovered, defaultOptions, hoverStroke, hoverStrokeWidthMultiplier, hoverColor]);

  const handleMouseEnter = useCallback((e) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback((e) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  }, [onMouseLeave]);

  return (
    <g
      ref={groupRef}
      className={`sketchy-text ${className}`}
      style={{ cursor: onClick ? "pointer" : "default", ...style }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
