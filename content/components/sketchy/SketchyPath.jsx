"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs";
import { useSketchySvg } from "./SketchySvg";
import { appendRoughElements, mergeOptions } from "./utils";

export function SketchyPath({
  points,
  closed = false,
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
    if (!svgRef?.current || !groupRef.current || !points || points.length < 2) return;

    const rc = rough.svg(svgRef.current);
    const opts = mergeOptions(defaultOptions, {
      roughness, bowing, stroke, strokeWidth, fill, fillStyle,
      hachureAngle, hachureGap, fillWeight, seed,
      hoverStroke, hoverStrokeWidthMultiplier,
    }, isHovered);

    let pathEl;
    if (closed && points.length >= 3) {
      pathEl = rc.polygon(points, opts);
    } else {
      pathEl = rc.linearPath(points, opts);
    }
    appendRoughElements(groupRef.current, pathEl);

    return () => {
      if (groupRef.current) {
        while (groupRef.current.firstChild) {
          groupRef.current.removeChild(groupRef.current.firstChild);
        }
      }
    };
  }, [svgRef, points, closed, roughness, bowing, stroke, strokeWidth, fill, fillStyle, hachureAngle, hachureGap, fillWeight, seed, isHovered, defaultOptions, hoverStroke, hoverStrokeWidthMultiplier]);

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
      className={`sketchy-path ${className}`}
      style={{ cursor: onClick ? "pointer" : "default", ...style }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}
