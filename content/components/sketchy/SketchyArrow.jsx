"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import { useSketchySvg } from "./SketchySvg";
import { appendRoughElements, mergeOptions, calculateArrowHead } from "./utils";

export function SketchyArrow({
  x1,
  y1,
  x2,
  y2,
  arrowSize = 12,
  roughness,
  bowing,
  stroke,
  strokeWidth,
  seed,
  className = "",
  style = {},
  hoverStroke,
  hoverStrokeWidthMultiplier,
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
      roughness, bowing, stroke, strokeWidth, seed,
      hoverStroke, hoverStrokeWidthMultiplier,
    }, isHovered);

    // 主线
    const line = rc.line(x1, y1, x2, y2, opts);

    // 箭头两翼
    const head = calculateArrowHead(x1, y1, x2, y2, arrowSize);
    const left = rc.line(x2, y2, head.left.x, head.left.y, opts);
    const right = rc.line(x2, y2, head.right.x, head.right.y, opts);

    appendRoughElements(groupRef.current, [line, left, right]);

    return () => {
      if (groupRef.current) {
        while (groupRef.current.firstChild) {
          groupRef.current.removeChild(groupRef.current.firstChild);
        }
      }
    };
  }, [svgRef, x1, y1, x2, y2, arrowSize, roughness, bowing, stroke, strokeWidth, seed, isHovered, defaultOptions, hoverStroke, hoverStrokeWidthMultiplier]);

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
      className={`sketchy-arrow ${className}`}
      style={{ cursor: onClick ? "pointer" : "default", ...style }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
