"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import { useSketchySvg } from "./SketchySvg";
import { appendRoughElements, mergeOptions } from "./utils";

export function SketchyCircle({
  cx,
  cy,
  diameter,
  radius,
  roughness,
  bowing,
  stroke,
  strokeWidth,
  fill,
  fillStyle,
  hachureAngle,
  hachureGap,
  fillWeight,
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

  const r = radius ?? (diameter ? diameter / 2 : 20);
  const x = cx - r;
  const y = cy - r;
  const size = r * 2;

  useEffect(() => {
    if (!svgRef?.current || !groupRef.current) return;

    const rc = rough.svg(svgRef.current);
    const opts = mergeOptions(defaultOptions, {
      roughness, bowing, stroke, strokeWidth, fill, fillStyle,
      hachureAngle, hachureGap, fillWeight, seed,
      hoverStroke, hoverStrokeWidthMultiplier,
    }, isHovered);

    const circle = rc.circle(cx, cy, size, opts);
    appendRoughElements(groupRef.current, circle);

    return () => {
      if (groupRef.current) {
        while (groupRef.current.firstChild) {
          groupRef.current.removeChild(groupRef.current.firstChild);
        }
      }
    };
  }, [svgRef, cx, cy, size, roughness, bowing, stroke, strokeWidth, fill, fillStyle, hachureAngle, hachureGap, fillWeight, seed, isHovered, defaultOptions, hoverStroke, hoverStrokeWidthMultiplier]);

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
      className={`sketchy-circle ${className}`}
      style={{ cursor: onClick ? "pointer" : "default", ...style }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
