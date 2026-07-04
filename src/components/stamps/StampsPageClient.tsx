"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { Stamp } from "@/data/stamps";

interface StampsPageClientProps {
  stamps: Stamp[];
  navLinks: { label: string; href: string }[];
  socialLinks: { label: string; href: string }[];
}

const CANVAS_SIZE = 3600;
const UNIT = 280;
const GAP = 6;
const EXPANDED_COLS = 3;
const EXPANDED_ROWS = 2;
const MARGIN = 180;
const GROUP_MODES = [
  { key: "line", label: "线路" },
  { key: "region", label: "地域" },
  { key: "operator", label: "铁路公司" },
] as const;

type GroupMode = (typeof GROUP_MODES)[number]["key"];
type GeoPoint = { lng: number; lat: number };
type LayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
};
type StampLayout = {
  stampPositions: Array<{ x: number; y: number }>;
  stampRects: LayoutRect[];
  heroRect: LayoutRect;
  cols: number;
  rows: number;
};
type ResolvedConnection = {
  stationId: string;
  routeType?: string;
  line?: string;
  duration?: string;
  label?: string;
  geometry?: Array<[number, number]>;
  target: Stamp;
};

function getSpanSize(span: number) {
  return span * UNIT + (span - 1) * GAP;
}

function getGridSize(count: number, hasActive = false) {
  const totalCells = count + 2 + (hasActive ? EXPANDED_COLS * EXPANDED_ROWS - 1 : 0);
  const targetAspect = 1.35;
  const minCols = Math.max(2, hasActive ? EXPANDED_COLS : 2);
  let best = { cols: minCols, rows: Math.ceil(totalCells / minCols), score: Number.POSITIVE_INFINITY };

  for (let rows = 2; rows <= totalCells; rows += 1) {
    const cols = Math.max(minCols, Math.ceil(totalCells / rows));
    const emptyCells = cols * rows - totalCells;
    const aspectPenalty = Math.abs(cols / rows - targetAspect);
    const score = emptyCells * 8 + aspectPenalty;

    if (score < best.score) {
      best = { cols, rows, score };
    }
  }

  return best;
}

function createOccupancy(rows: number, cols: number) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
}

function canPlace(occupied: boolean[][], col: number, row: number, colSpan: number, rowSpan: number) {
  const rows = occupied.length;
  const cols = occupied[0]?.length ?? 0;
  if (col + colSpan > cols || row + rowSpan > rows) return false;

  for (let y = row; y < row + rowSpan; y += 1) {
    for (let x = col; x < col + colSpan; x += 1) {
      if (occupied[y][x]) return false;
    }
  }

  return true;
}

function reserveCells(occupied: boolean[][], col: number, row: number, colSpan: number, rowSpan: number) {
  for (let y = row; y < row + rowSpan; y += 1) {
    for (let x = col; x < col + colSpan; x += 1) {
      if (occupied[y]?.[x] !== undefined) {
        occupied[y][x] = true;
      }
    }
  }
}

function findOpenSlot(occupied: boolean[][], colSpan: number, rowSpan: number) {
  for (let row = 0; row < occupied.length; row += 1) {
    for (let col = 0; col < occupied[row].length; col += 1) {
      if (canPlace(occupied, col, row, colSpan, rowSpan)) {
        return { col, row };
      }
    }
  }

  return null;
}

function findOpenSlotFrom(
  occupied: boolean[][],
  colSpan: number,
  rowSpan: number,
  startCol: number,
  startRow: number
) {
  for (let row = startRow; row < occupied.length; row += 1) {
    const colStart = row === startRow ? startCol : 0;
    for (let col = colStart; col < occupied[row].length; col += 1) {
      if (canPlace(occupied, col, row, colSpan, rowSpan)) {
        return { col, row };
      }
    }
  }

  return null;
}

function toLayoutRect(col: number, row: number, colSpan: number, rowSpan: number, cols: number, rows: number): LayoutRect {
  const stepX = UNIT + GAP;
  const stepY = UNIT + GAP;

  return {
    x: (col + colSpan / 2 - cols / 2) * stepX,
    y: (row + rowSpan / 2 - rows / 2) * stepY,
    width: getSpanSize(colSpan),
    height: getSpanSize(rowSpan),
    col,
    row,
    colSpan,
    rowSpan,
  };
}

function rectsOverlap(a: Pick<LayoutRect, "col" | "row" | "colSpan" | "rowSpan">, b: Pick<LayoutRect, "col" | "row" | "colSpan" | "rowSpan">) {
  return (
    a.col < b.col + b.colSpan &&
    a.col + a.colSpan > b.col &&
    a.row < b.row + b.rowSpan &&
    a.row + a.rowSpan > b.row
  );
}

function expandLayoutInPlace(baseLayout: StampLayout, activeIndex: number): StampLayout {
  const activeBaseRect = baseLayout.stampRects[activeIndex];
  if (!activeBaseRect) return baseLayout;

  const { cols, rows } = baseLayout;
  const expandedRect = toLayoutRect(
    activeBaseRect.col,
    activeBaseRect.row,
    EXPANDED_COLS,
    EXPANDED_ROWS,
    cols,
    rows
  );
  const occupiedRows = Math.max(rows, expandedRect.row + expandedRect.rowSpan);
  const occupied = createOccupancy(occupiedRows, cols);
  const nextRects = [...baseLayout.stampRects];
  let nextHeroRect = baseLayout.heroRect;

  reserveCells(occupied, expandedRect.col, expandedRect.row, expandedRect.colSpan, expandedRect.rowSpan);
  nextRects[activeIndex] = expandedRect;

  if (rectsOverlap(baseLayout.heroRect, expandedRect)) {
    let heroSlot = findOpenSlotFrom(
      occupied,
      baseLayout.heroRect.colSpan,
      baseLayout.heroRect.rowSpan,
      baseLayout.heroRect.col,
      baseLayout.heroRect.row
    );

    while (!heroSlot) {
      occupied.push(Array.from({ length: cols }, () => false));
      heroSlot = findOpenSlotFrom(
        occupied,
        baseLayout.heroRect.colSpan,
        baseLayout.heroRect.rowSpan,
        baseLayout.heroRect.col,
        baseLayout.heroRect.row
      );
    }

    nextHeroRect = toLayoutRect(
      heroSlot.col,
      heroSlot.row,
      baseLayout.heroRect.colSpan,
      baseLayout.heroRect.rowSpan,
      cols,
      rows
    );
  }

  reserveCells(occupied, nextHeroRect.col, nextHeroRect.row, nextHeroRect.colSpan, nextHeroRect.rowSpan);

  baseLayout.stampRects.forEach((rect, index) => {
    if (index === activeIndex) return;

    if (index < activeIndex && !rectsOverlap(rect, expandedRect)) {
      reserveCells(occupied, rect.col, rect.row, rect.colSpan, rect.rowSpan);
      return;
    }

    let slot = findOpenSlotFrom(occupied, 1, 1, rect.col, rect.row);

    while (!slot) {
      occupied.push(Array.from({ length: cols }, () => false));
      slot = findOpenSlotFrom(occupied, 1, 1, rect.col, rect.row);
    }

    reserveCells(occupied, slot.col, slot.row, 1, 1);
    nextRects[index] = toLayoutRect(slot.col, slot.row, 1, 1, cols, rows);
  });

  return {
    ...baseLayout,
    stampPositions: nextRects.map((rect) => ({ x: rect.x, y: rect.y })),
    stampRects: nextRects,
    heroRect: nextHeroRect,
  };
}

/** 根据印章数量动态计算紧凑矩形布局，展开态只做局部避让 */
function getStampLayout(count: number, activeIndex: number | null = null): StampLayout {
  let { cols, rows } = getGridSize(count, false);
  const heroCol = Math.max(0, Math.min(cols - 2, Math.floor((cols - 2) / 2)));
  const heroRow = Math.min(rows - 1, Math.floor(rows * 0.58));
  let occupied = createOccupancy(rows, cols);
  reserveCells(occupied, heroCol, heroRow, 2, 1);

  const placements: Array<{ col: number; row: number; colSpan: number; rowSpan: number }> = [];
  for (let index = 0; index < count; index += 1) {
    const colSpan = 1;
    const rowSpan = 1;
    let slot = findOpenSlot(occupied, colSpan, rowSpan);

    while (!slot) {
      rows += 1;
      occupied = [...occupied, Array.from({ length: cols }, () => false)];
      slot = findOpenSlot(occupied, colSpan, rowSpan);
    }

    reserveCells(occupied, slot.col, slot.row, colSpan, rowSpan);
    placements.push({ col: slot.col, row: slot.row, colSpan, rowSpan });
  }
  const stampRects = placements.map((placement) =>
    toLayoutRect(placement.col, placement.row, placement.colSpan, placement.rowSpan, cols, rows)
  );

  const baseLayout = {
    stampPositions: stampRects.map((rect) => ({ x: rect.x, y: rect.y })),
    stampRects,
    heroRect: toLayoutRect(heroCol, heroRow, 2, 1, cols, rows),
    cols,
    rows,
  };

  return activeIndex === null ? baseLayout : expandLayoutInPlace(baseLayout, activeIndex);
}

/** 根据印章数量计算内容边界 */
function getContentBounds(layout: StampLayout) {
  const horizontalEdges = [
    ...layout.stampRects.flatMap((rect) => [rect.x - rect.width / 2, rect.x + rect.width / 2]),
    layout.heroRect.x - layout.heroRect.width / 2,
    layout.heroRect.x + layout.heroRect.width / 2,
  ];
  const verticalEdges = [
    ...layout.stampRects.flatMap((rect) => [rect.y - rect.height / 2, rect.y + rect.height / 2]),
    layout.heroRect.y - layout.heroRect.height / 2,
    layout.heroRect.y + layout.heroRect.height / 2,
  ];

  return {
    left: CANVAS_SIZE / 2 + Math.min(...horizontalEdges) - MARGIN,
    right: CANVAS_SIZE / 2 + Math.max(...horizontalEdges) + MARGIN,
    top: CANVAS_SIZE / 2 + Math.min(...verticalEdges) - MARGIN,
    bottom: CANVAS_SIZE / 2 + Math.max(...verticalEdges) + MARGIN,
  };
}

function useTokyoTime() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const format = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      return new Intl.DateTimeFormat("ja-JP", options).format(now);
    };

    setTime(format());
    const interval = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

function getRouteType(line?: string) {
  if (!line) return "railway";
  if (line.includes("空路")) return "air";
  if (line.includes("新幹線")) return "shinkansen";
  if (line.includes("地下鉄")) return "subway";
  if (line.includes("モノレール")) return "monorail";
  return "railway";
}

function getRouteClass(routeType: string) {
  if (routeType === "shinkansen") return "text-sky-600 dark:text-sky-300";
  if (routeType === "air") return "text-amber-500 dark:text-amber-300";
  if (routeType === "subway") return "text-emerald-600 dark:text-emerald-300";
  if (routeType === "monorail") return "text-fuchsia-600 dark:text-fuchsia-300";
  return "text-neutral-600 dark:text-neutral-300";
}

function getStationPoint(stamp: Stamp): GeoPoint | null {
  if (typeof stamp.station.lng !== "number" || typeof stamp.station.lat !== "number") {
    return null;
  }
  return { lng: stamp.station.lng, lat: stamp.station.lat };
}

function buildGeoProjection(points: GeoPoint[], width = 220, height = 150, padding = 18) {
  const lngs = points.map((point) => point.lng);
  const lats = points.map((point) => point.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const lngSpan = Math.max(maxLng - minLng, 0.1);
  const latSpan = Math.max(maxLat - minLat, 0.1);

  return (point: GeoPoint) => {
    const x = padding + ((point.lng - minLng) / lngSpan) * (width - padding * 2);
    const y = height - padding - ((point.lat - minLat) / latSpan) * (height - padding * 2);
    return { x, y };
  };
}

function buildFallbackGeoPath(start: { x: number; y: number }, end: { x: number; y: number }, index: number) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const direction = index % 2 === 0 ? 1 : -1;
  const curve = Math.min(32, Math.max(12, length * 0.18));
  const cx = midX + (-dy / length) * curve * direction;
  const cy = midY + (dx / length) * curve * direction;
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function buildGeoPolyline(points: GeoPoint[], project: (point: GeoPoint) => { x: number; y: number }) {
  return points
    .map((point, index) => {
      const projected = project(point);
      const command = index === 0 ? "M" : "L";
      return `${command} ${projected.x.toFixed(1)} ${projected.y.toFixed(1)}`;
    })
    .join(" ");
}

function RailDiagramMap({
  stamp,
  connections,
}: {
  stamp: Stamp;
  connections: ResolvedConnection[];
}) {
  const diagram = stamp.station.railDiagram;
  if (!diagram) return null;

  return (
    <div className="flex h-full flex-col rounded-xl bg-neutral-100/55 px-3 py-2 dark:bg-neutral-900/55">
      <div className="mb-1 flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
        <span>rail diagram</span>
        <span>{connections.length} routes</span>
      </div>
      <svg viewBox={diagram.viewBox ?? "0 0 220 150"} className="h-32 w-full shrink-0 overflow-visible">
        <rect
          x="1"
          y="1"
          width="218"
          height="148"
          rx="14"
          fill="currentColor"
          className="text-white/35 dark:text-black/10"
        />
        {diagram.lines.map((line, index) => (
          <g key={line.label}>
            <path
              d={line.path}
              fill="none"
              stroke="currentColor"
              strokeWidth={(line.strokeWidth ?? 3) + 2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/85 dark:text-neutral-950/70"
            />
            <motion.path
              d={line.path}
              fill="none"
              stroke={line.color}
              strokeWidth={line.strokeWidth ?? 3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={line.dashArray}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.72, delay: index * 0.12, ease: "easeInOut" }}
            />
            {line.routeType === "shinkansen" && (
              <motion.path
                d={line.path}
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 7"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.72, delay: 0.1 + index * 0.12, ease: "easeInOut" }}
              />
            )}
          </g>
        ))}

        {diagram.nodes.map((node, index) => {
          const isCurrent = node.role === "current";
          const isCollected = node.role === "collected";
          const labelAnchor = node.x > 170 ? "end" : node.x < 55 ? "start" : "middle";
          const labelX = isCurrent
            ? node.x
            : labelAnchor === "start"
              ? node.x + 2
              : labelAnchor === "end"
                ? node.x - 2
                : node.x;
          const labelY = node.y + (isCurrent ? 20 : 0);

          return (
            <g key={`${node.label}-${index}`}>
              {(isCurrent || isCollected) && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isCurrent ? 6.5 : 4.6}
                  fill={isCurrent ? "currentColor" : "#ffffff"}
                  stroke="currentColor"
                  strokeWidth={isCollected ? 2 : 0}
                  className={isCurrent ? "text-neutral-950 dark:text-white" : "text-blue-600"}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.22, delay: 0.36 + index * 0.045 }}
                />
              )}
              <motion.text
                x={labelX}
                y={labelY}
                textAnchor={labelAnchor}
                className={isCurrent ? "fill-neutral-950 text-[12px] font-semibold dark:fill-white" : isCollected ? "fill-neutral-800 text-[10px] font-medium dark:fill-neutral-200" : "fill-neutral-500 text-[8.5px] font-medium dark:fill-neutral-400"}
                stroke={isCurrent ? "none" : "rgba(246,246,242,0.86)"}
                strokeWidth={isCurrent ? 0 : 3}
                paintOrder="stroke"
                initial={{ opacity: 0, y: labelY + 3 }}
                animate={{ opacity: 1, y: labelY }}
                transition={{ duration: 0.2, delay: 0.48 + index * 0.045 }}
              >
                {node.label}
              </motion.text>
            </g>
          );
        })}

        {diagram.badges && (
          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: 0.64 }}
          >
            {diagram.badges.map((badge, index) => {
              const width = 42;
              const x = 48 + index * width;
              return (
                <g key={badge.label}>
                  <rect
                    x={x}
                    y="62"
                    width={width}
                    height="28"
                    rx={index === 0 ? 9 : 0}
                    fill={badge.color}
                    opacity="0.96"
                  />
                  <text
                    x={x + width / 2}
                    y="80"
                    textAnchor="middle"
                    className="fill-white text-[9px] font-bold"
                  >
                    {badge.label}
                  </text>
                </g>
              );
            })}
            <rect
              x="48"
              y="62"
              width={(diagram.badges.length || 0) * 42}
              height="28"
              rx="9"
              fill="none"
              stroke="rgba(17,24,39,0.18)"
            />
          </motion.g>
        )}
      </svg>
      <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-hidden">
        {connections.map((connection) => {
          const routeType = connection.routeType ?? getRouteType(connection.line);
          return (
            <div
              key={connection.stationId}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/45 px-2 py-1 text-[10px] text-neutral-500 dark:bg-white/5 dark:text-neutral-400"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full bg-current ${getRouteClass(routeType)}`} />
                <span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
                  {connection.target.station.name}
                </span>
              </span>
              <span className="shrink-0 font-mono text-neutral-400 dark:text-neutral-500">
                {connection.duration ?? connection.line ?? "--"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StampRouteMap({ stamp, stamps }: { stamp: Stamp; stamps: Stamp[] }) {
  const connections: ResolvedConnection[] = (stamp.connections ?? [])
    .map((connection) => {
      const target = stamps.find((item) => item.id === connection.stationId);
      return target ? { ...connection, target } : null;
    })
    .filter(Boolean)
    .slice(0, 4) as ResolvedConnection[];

  if (stamp.station.railDiagram) {
    return <RailDiagramMap stamp={stamp} connections={connections} />;
  }

  const startPoint = getStationPoint(stamp);
  if (!startPoint) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-neutral-300/70 text-[11px] text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
        位置データ未配置
      </div>
    );
  }

  const drawableConnections = connections
    .map((connection) => {
      const targetPoint = getStationPoint(connection.target);
      if (!targetPoint) return null;
      return { ...connection, targetPoint };
    })
    .filter((connection): connection is (typeof connections)[number] & { targetPoint: GeoPoint } => Boolean(connection));

  if (drawableConnections.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-neutral-300/70 text-[11px] text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
        接続データ未配置
      </div>
    );
  }

  const routeGeometryPoints = drawableConnections.flatMap((connection) =>
    (connection.geometry ?? []).map(([lng, lat]) => ({ lng, lat }))
  );
  const allPoints = [
    startPoint,
    ...drawableConnections.map((connection) => connection.targetPoint),
    ...routeGeometryPoints,
  ];
  const project = buildGeoProjection(allPoints);
  const start = project(startPoint);
  const targets = drawableConnections.map((connection, index) => {
    const routeType = connection.routeType ?? getRouteType(connection.line);
    const geometry = connection.geometry?.map(([lng, lat]) => ({ lng, lat }));
    const projectedTarget = project(connection.targetPoint);
    return {
      ...connection,
      routeType,
      routeClass: getRouteClass(routeType),
      point: projectedTarget,
      path:
        geometry && geometry.length > 1
          ? buildGeoPolyline(geometry, project)
          : buildFallbackGeoPath(start, projectedTarget, index),
    };
  });

  return (
    <div className="flex h-full flex-col rounded-xl bg-neutral-100/55 px-3 py-2 dark:bg-neutral-900/55">
      <div className="mb-1 flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
        <span>geo routes</span>
        <span>{drawableConnections.length} routes</span>
      </div>
      <svg viewBox="0 0 220 150" className="h-32 w-full shrink-0 overflow-visible">
        <rect
          x="1"
          y="1"
          width="218"
          height="148"
          rx="14"
          fill="none"
          stroke="currentColor"
          strokeDasharray="1 7"
          className="text-neutral-300/80 dark:text-neutral-700/80"
        />
        {targets.map((target, index) => (
          <motion.path
            key={`${target.stationId}-route`}
            d={target.path}
            fill="none"
            stroke="currentColor"
            strokeWidth={target.routeType === "shinkansen" ? 2.2 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={target.routeType === "air" ? "4 5" : undefined}
            className={target.routeClass}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 0.8, delay: index * 0.14, ease: "easeInOut" }}
          />
        ))}
        <motion.circle
          cx={start.x}
          cy={start.y}
          r="6.5"
          fill="currentColor"
          className="text-neutral-900 dark:text-neutral-100"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        />
        <text
          x={Math.min(190, Math.max(30, start.x))}
          y={Math.min(144, start.y + 16)}
          textAnchor="middle"
          className="fill-neutral-700 text-[9px] dark:fill-neutral-300"
        >
          {stamp.station.name.replace("駅", "")}
        </text>
        {targets.map((target, index) => {
          return (
            <g key={target.stationId}>
              <motion.circle
                cx={target.point.x}
                cy={target.point.y}
                r="4.5"
                fill="currentColor"
                className={target.routeClass}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.22, delay: 0.32 + index * 0.14 }}
              />
              <motion.text
                x={Math.min(188, Math.max(28, target.point.x + 8))}
                y={Math.min(144, Math.max(10, target.point.y + 3))}
                className="fill-neutral-700 text-[9px] dark:fill-neutral-300"
                initial={{ opacity: 0, x: target.point.x + 4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.45 + index * 0.14 }}
              >
                {target.target.station.name}
              </motion.text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-hidden">
        {targets.map((connection) => (
          <div
            key={connection.stationId}
            className="flex items-center justify-between gap-2 rounded-lg bg-white/45 px-2 py-1 text-[10px] text-neutral-500 dark:bg-white/5 dark:text-neutral-400"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full bg-current ${connection.routeClass}`} />
              <span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
                {connection.target.station.name}
              </span>
            </span>
            <span className="shrink-0 font-mono text-neutral-400 dark:text-neutral-500">
              {connection.duration ?? connection.line ?? "--"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StampImage({
  stamp,
  imageFailed,
  onImageFailed,
  expanded = false,
}: {
  stamp: Stamp;
  imageFailed: boolean;
  onImageFailed: () => void;
  expanded?: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      {imageFailed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300/80 bg-neutral-100/45 text-center text-neutral-500 dark:border-neutral-700/80 dark:bg-neutral-900/45 dark:text-neutral-400">
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">画像未配置</span>
        </div>
      ) : (
        <Image
          src={stamp.images.stamp}
          alt={`${stamp.station.name} 駅スタンプ`}
          fill
          sizes={expanded ? "280px" : "280px"}
          draggable={false}
          onError={onImageFailed}
          className="object-contain group-hover:scale-[1.03] transition-transform duration-500 select-none"
        />
      )}
    </div>
  );
}

function StampCard({
  stamp,
  index,
  layoutRect,
  stamps,
  isActive,
  hasActive,
  isFilteredOut,
  onOpen,
  onClose,
}: {
  stamp: Stamp;
  index: number;
  layoutRect: LayoutRect;
  stamps: Stamp[];
  isActive: boolean;
  hasActive: boolean;
  isFilteredOut: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const story = stamp.story ?? "这枚印章还没有写下故事。等下一次整理旅途照片时，再把当时的天气、路线和心情补上。";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{
        opacity: isActive ? 1 : hasActive ? 0.38 : isFilteredOut ? 0.18 : 1,
        scale: hasActive && !isActive ? 0.985 : 1,
        width: layoutRect.width,
        height: layoutRect.height,
        left: `calc(50% + ${layoutRect.x}px - ${layoutRect.width / 2}px)`,
        top: `calc(50% + ${layoutRect.y}px - ${layoutRect.height / 2}px)`,
      }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="absolute"
      style={{
        zIndex: isActive ? 30 : hasActive ? 1 : 2,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        className="relative bg-white dark:bg-[#1e1e1c] rounded-2xl h-full w-full transition-all duration-300 hover:shadow-md overflow-hidden cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 dark:focus-visible:ring-white/40"
        onClick={(event) => {
          event.stopPropagation();
          if (!isActive) onOpen();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            if (!isActive) onOpen();
          }
        }}
      >
        <div className="pointer-events-none absolute left-4 right-4 top-3 z-10 flex items-center justify-between text-[10px] font-mono tracking-wide text-neutral-500/70 dark:text-neutral-400/65">
          <span>{stamp.date}</span>
          <span className="truncate text-[11px] font-medium text-neutral-500/80 dark:text-neutral-400/75">
            {stamp.station.name}
          </span>
        </div>
        {isActive ? (
          <div className="flex h-full flex-col px-5 pb-5 pt-10">
            <button
              type="button"
              aria-label="关闭车站详情"
              className="absolute right-3 top-9 z-20 flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-3 pr-9">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                {stamp.station.name}
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {stamp.station.line} · {stamp.station.prefecture} · {stamp.station.operator ?? stamp.station.city}
              </p>
              {stamp.collectedAt && (
                <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                  {stamp.collectedAt}
                </p>
              )}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-[0.75fr_1.25fr] gap-4">
              <div className="min-h-0 rounded-xl bg-neutral-100/55 p-4 dark:bg-neutral-900/55">
                <p className="mb-2 text-[10px] font-mono uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  story
                </p>
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {story}
                </p>
              </div>
              <div className="min-h-0">
                <StampRouteMap stamp={stamp} stamps={stamps} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 flex items-center justify-center px-4 pb-4 pt-8">
              <StampImage
                stamp={stamp}
                imageFailed={imageFailed}
                onImageFailed={() => setImageFailed(true)}
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/** 过滤出有效的导航链接 */
function getValidLinks(links: { label: string; href: string }[]) {
  return links.filter((link) => link.href && link.href !== "#");
}

function getStampGroupValue(stamp: Stamp, mode: GroupMode) {
  if (mode === "line") return stamp.station.line;
  if (mode === "region") return stamp.station.region;
  return stamp.station.operator ?? null;
}

function formatGroupLabel(mode: GroupMode, value: string) {
  if (mode === "operator") {
    return value
      .replace("JR", "")
      .replace("沖縄都市モノレール", "モノレール")
      .trim();
  }

  return value;
}

function getGroupOptions(stamps: Stamp[], mode: GroupMode) {
  const counts = new Map<string, number>();

  stamps.forEach((stamp) => {
    const value = getStampGroupValue(stamp, mode);
    if (!value) return;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      label: formatGroupLabel(mode, value),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ja"));
}

function reorderStampsByGroup(stamps: Stamp[], mode: GroupMode, selectedValue: string | null) {
  return stamps
    .map((stamp, index) => {
      const value = getStampGroupValue(stamp, mode) ?? "";
      return {
        stamp,
        index,
        value,
        sortValue: value || "\uffff",
        isMatch: selectedValue !== null && value === selectedValue,
      };
    })
    .sort((a, b) => {
      if (selectedValue !== null && a.isMatch !== b.isMatch) {
        return Number(b.isMatch) - Number(a.isMatch);
      }

      return a.sortValue.localeCompare(b.sortValue, "ja") || a.index - b.index;
    })
    .map(({ stamp }) => stamp);
}

export default function StampsPageClient({
  stamps,
  navLinks,
}: StampsPageClientProps) {
  const tokyoTime = useTokyoTime();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [activeStampId, setActiveStampId] = useState<string | null>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>("line");
  const [selectedGroupValue, setSelectedGroupValue] = useState<string | null>(null);

  const isTouching = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchStartOffset = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | undefined>(undefined);
  const offsetRef = useRef({ x: 0, y: 0 });
  const groupOptions = useMemo(() => getGroupOptions(stamps, groupMode), [groupMode, stamps]);
  const orderedStamps = useMemo(
    () => reorderStampsByGroup(stamps, groupMode, selectedGroupValue),
    [groupMode, selectedGroupValue, stamps]
  );
  const activeIndex = useMemo(
    () => (activeStampId ? orderedStamps.findIndex((stamp) => stamp.id === activeStampId) : null),
    [activeStampId, orderedStamps]
  );
  const activeLayoutIndex = activeIndex !== null && activeIndex >= 0 ? activeIndex : null;
  const layout = useMemo(
    () => getStampLayout(orderedStamps.length, activeLayoutIndex),
    [activeLayoutIndex, orderedStamps.length]
  );

  // 保持 offsetRef 与 offset 同步
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  // 限制偏移范围：视口不能滑出内容边界
  const clampOffset = useCallback((x: number, y: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bounds = getContentBounds(layout);
    const minX = vw - bounds.right;
    const maxX = -bounds.left;
    const minY = vh - bounds.bottom;
    const maxY = -bounds.top;
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  }, [layout]);

  useEffect(() => {
    if (ready) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setOffset(clampOffset(-(CANVAS_SIZE - vw) / 2, -(CANVAS_SIZE - vh) / 2));
    setReady(true);
  }, [clampOffset, ready]);

  useEffect(() => {
    if (!ready) return;
    setOffset((prev) => clampOffset(prev.x, prev.y));
  }, [clampOffset, ready]);

  // --- 桌面端：滚轮/触摸板滑动 ---
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setOffset((prev) => clampOffset(prev.x - e.deltaX, prev.y - e.deltaY));
    },
    [clampOffset]
  );

  // --- 移动端：触摸滑动 ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    isTouching.current = true;
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    touchStartOffset.current = { ...offsetRef.current };
    lastPos.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isTouching.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartPos.current.x;
      const dy = touch.clientY - touchStartPos.current.y;

      velocity.current = {
        x: touch.clientX - lastPos.current.x,
        y: touch.clientY - lastPos.current.y,
      };
      lastPos.current = { x: touch.clientX, y: touch.clientY };

      setOffset(clampOffset(touchStartOffset.current.x + dx, touchStartOffset.current.y + dy));
    },
    [clampOffset]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isTouching.current) return;
    isTouching.current = false;

    const vx = velocity.current.x;
    const vy = velocity.current.y;
    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) return;

    let currentX = offsetRef.current.x;
    let currentY = offsetRef.current.y;
    let velX = vx * 12;
    let velY = vy * 12;

    const animate = () => {
      velX *= 0.93;
      velY *= 0.93;
      currentX += velX;
      currentY += velY;

      const clamped = clampOffset(currentX, currentY);
      setOffset(clamped);

      if (Math.abs(velX) > 0.5 || Math.abs(velY) > 0.5) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    rafId.current = requestAnimationFrame(animate);
  }, [clampOffset]);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const validNavLinks = getValidLinks(navLinks);
  const heroRect = layout.heroRect;

  return (
    <div
      className="theme-muji relative h-screen w-screen select-none overflow-hidden dark:bg-neutral-950"
      style={{ backgroundColor: "var(--muji-bg)" }}
    >
      {!ready && (
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white animate-spin" />
        </div>
      )}

      {ready && (
        <div
          className="absolute touch-none"
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
          }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setActiveStampId(null)}
        >
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{
              backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div
            className="absolute"
            style={{
              width: heroRect.width,
              height: heroRect.height,
              left: `calc(50% + ${heroRect.x}px - ${heroRect.width / 2}px)`,
              top: `calc(50% + ${heroRect.y}px - ${heroRect.height / 2}px)`,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-[#1a1a18] rounded-2xl px-6 py-5 h-full w-full flex flex-col justify-between overflow-hidden shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  駅スタンプ <span className="inline-block animate-pulse">👋</span>
                </h1>
                {validNavLinks.length > 0 && (
                  <div className="flex items-center gap-4">
                    {validNavLinks.slice(0, 4).map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="flex items-center gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors group"
                      >
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[8px] group-hover:scale-110 transition-transform">
                          <Plus className="w-2.5 h-2.5" />
                        </span>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed max-w-md">
                这是我的日本车站印章收藏。每一次旅行，每一个车站，都留下了独特的印记。
              </p>
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    {GROUP_MODES.map((mode) => {
                      const isSelected = groupMode === mode.key;
                      return (
                        <button
                          key={mode.key}
                          type="button"
                          onClick={() => {
                            setGroupMode(mode.key);
                            setSelectedGroupValue(null);
                            setActiveStampId(null);
                          }}
                          className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                            isSelected
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                              : "bg-neutral-200/65 text-neutral-600 hover:bg-neutral-300/70 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {mode.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex max-h-[76px] max-w-[390px] flex-wrap items-center gap-1.5 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGroupValue(null);
                        setActiveStampId(null);
                      }}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        selectedGroupValue === null
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                          : "bg-neutral-200/65 text-neutral-600 hover:bg-neutral-300/70 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                      }`}
                    >
                      All
                    </button>
                    {groupOptions.map((option) => {
                      const isSelected = selectedGroupValue === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedGroupValue(isSelected ? null : option.value);
                            setActiveStampId(null);
                          }}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            isSelected
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                              : "bg-neutral-200/65 text-neutral-600 hover:bg-neutral-300/70 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          }`}
                          title={`${option.value} · ${option.count}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                  <span>東京 JST</span>
                  <span className="tabular-nums">{tokyoTime || "--:--:--"}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {orderedStamps.map((stamp, index) => (
            <StampCard
              key={stamp.id}
              stamp={stamp}
              index={index}
              layoutRect={layout.stampRects[index]}
              stamps={orderedStamps}
              isActive={activeStampId === stamp.id}
              hasActive={activeStampId !== null}
              isFilteredOut={
                selectedGroupValue !== null &&
                getStampGroupValue(stamp, groupMode) !== selectedGroupValue
              }
              onOpen={() => setActiveStampId(stamp.id)}
              onClose={() => setActiveStampId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
