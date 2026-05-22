"use client";

import React, { createContext, useRef, useContext, useMemo } from "react";
import { DEFAULT_OPTIONS } from "./config";

const SketchyContext = createContext(null);

export function useSketchySvg() {
  const ctx = useContext(SketchyContext);
  if (!ctx) {
    throw new Error("Sketchy 图形组件必须在 <SketchySvg> 容器内使用");
  }
  return ctx;
}

export function SketchySvg({
  width = 800,
  height = 400,
  viewBox,
  className = "",
  style = {},
  children,
  options = {},
  onMouseMove,
  onClick,
}) {
  const svgRef = useRef(null);

  const mergedOptions = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [options]
  );

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={viewBox || `0 0 ${width} ${height}`}
      className={className}
      style={{ display: "block", maxWidth: "100%", height: "auto", ...style }}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      <SketchyContext.Provider value={{ svgRef, options: mergedOptions }}>
        {children}
      </SketchyContext.Provider>
    </svg>
  );
}
