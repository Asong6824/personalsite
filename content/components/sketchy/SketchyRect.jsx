"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import { useSketchySvg } from "./SketchySvg";
import { appendRoughElements, mergeOptions } from "./utils";

export function SketchyRect({
  x,
  y,
  width,
  height,
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

  useEffect(() => {
    if (!svgRef?.current || !groupRef.current) return;

    const rc = rough.svg(svgRef.current);
    const opts = mergeOptions(defaultOptions, {
      roughness, bowing, stroke, strokeWidth, fill, fillStyle,
      hachureAngle, hachureGap, fillWeight, seed,
      hoverStroke, hoverStrokeWidthMultiplier,
    }, isHovered);

    const rect = rc.rectangle(x, y, width, height, opts);
    appendRoughElements(groupRef.current, rect);

    return () => {
      if (groupRef.current) {
        while (groupRef.current.firstChild) {
          groupRef.current.removeChild(groupRef.current.firstChild);
        }
      }
    };
  }, [svgRef, x, y, width, height, roughness, bowing, stroke, strokeWidth, fill, fillStyle, hachureAngle, hachureGap, fillWeight, seed, isHovered, defaultOptions, hoverStroke, hoverStrokeWidthMultiplier]);

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
      className={`sketchy-rect ${className}`}
      style={{ cursor: onClick ? "pointer" : "default", ...style }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
