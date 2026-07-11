"use client";

import { useEffect, useRef } from "react";
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { SITE_WARM_BACKGROUND } from "@/lib/site-theme";

type NodeKind = "index" | "path" | "artifact" | "research" | "initiative" | "information";
type PathKind = "straight" | "angled" | "wavy";

type ExpressNode = SimulationNodeDatum & {
  id: string;
  label: string;
  sublabel?: string;
  kind: NodeKind;
  level: number;
  ordinal?: number;
  anchor?: { x: number; y: number };
};

type ExpressLink = SimulationLinkDatum<ExpressNode> & {
  source: string | ExpressNode;
  target: string | ExpressNode;
  level: number;
  pathKind?: PathKind;
  dashed?: boolean;
  curveDirection?: number;
};

const WIDTH = 1000;
const HEIGHT = 650;
const NODE_SIZE = 36;
const CENTER = { x: 505, y: 315 };

const rawNodes: ExpressNode[] = [
  {
    id: "expression",
    label: "秩序外部化",
    sublabel: "internal order, externalized",
    kind: "index",
    level: 0,
    x: CENTER.x,
    y: CENTER.y,
    fx: CENTER.x,
    fy: CENTER.y,
  },
  // 一级路径：文章 / 策展 / 系统
  { id: "essays", label: "文章", sublabel: "thinking in text", kind: "path", level: 1, ordinal: 1, anchor: { x: 320, y: 260 } },
  { id: "curation", label: "策展", sublabel: "collected interests", kind: "path", level: 1, ordinal: 2, anchor: { x: 720, y: 290 } },
  { id: "systems", label: "系统", sublabel: "repeatable structures", kind: "path", level: 1, ordinal: 3, anchor: { x: 430, y: 430 } },
  // 文章下
  { id: "rag", label: "RAG 思想", kind: "research", level: 2, anchor: { x: 155, y: 220 } },
  { id: "agent", label: "Agent 简史", kind: "research", level: 2, anchor: { x: 290, y: 160 } },
  { id: "japan", label: "日本行纪", kind: "information", level: 2, anchor: { x: 470, y: 185 } },
  { id: "review", label: "年度总结", kind: "information", level: 2, anchor: { x: 145, y: 330 } },
  // 策展下
  { id: "books", label: "书单", kind: "artifact", level: 2, anchor: { x: 860, y: 205 } },
  { id: "stamps", label: "印章收集", kind: "artifact", level: 2, anchor: { x: 865, y: 370 } },
  // 系统下
  { id: "investment", label: "投资方法论", kind: "research", level: 2, anchor: { x: 235, y: 465 } },
  { id: "notion", label: "Notion 与禅", kind: "initiative", level: 2, anchor: { x: 540, y: 530 } },
  { id: "map", label: "地图绘制", kind: "artifact", level: 2, anchor: { x: 660, y: 440 } },
  { id: "proraw", label: "ProRAW 工作流", kind: "artifact", level: 2, anchor: { x: 360, y: 540 } },
];

const rawLinks: ExpressLink[] = [
  // 中心到一级路径
  { source: "expression", target: "essays", level: 1, pathKind: "angled" },
  { source: "expression", target: "curation", level: 1, pathKind: "angled" },
  { source: "expression", target: "systems", level: 1, pathKind: "angled" },
  // 文章下
  { source: "essays", target: "rag", level: 2, pathKind: "straight" },
  { source: "essays", target: "agent", level: 2, pathKind: "angled" },
  { source: "essays", target: "japan", level: 2, pathKind: "angled" },
  { source: "essays", target: "review", level: 2, pathKind: "wavy" },
  // 策展下
  { source: "curation", target: "books", level: 2, pathKind: "straight" },
  { source: "curation", target: "stamps", level: 2, pathKind: "angled" },
  // 系统下
  { source: "systems", target: "investment", level: 2, pathKind: "straight" },
  { source: "systems", target: "notion", level: 2, pathKind: "angled" },
  { source: "systems", target: "map", level: 2, pathKind: "angled" },
  { source: "systems", target: "proraw", level: 2, pathKind: "wavy" },
];

const rawNodeById = new Map(rawNodes.map((node) => [node.id, node]));

function resolvedNode(node: string | ExpressNode) {
  return typeof node === "string" ? rawNodeById.get(node)! : node;
}

function point(node: ExpressNode) {
  return {
    x: (node.x ?? 0) + NODE_SIZE / 2,
    y: (node.y ?? 0) + NODE_SIZE / 2,
  };
}

function createStraightPath(source: ExpressNode, target: ExpressNode) {
  const from = point(source);
  const to = point(target);
  return `M${from.x},${from.y} L${to.x},${to.y}`;
}

function createAngledPath(source: ExpressNode, target: ExpressNode, curveDirection: number) {
  const from = point(source);
  const to = point(target);
  const firstX = from.x + (to.x - from.x) / 3;
  const firstY = from.y + (to.y - from.y) / 3 + curveDirection;
  const secondX = from.x + (2 * (to.x - from.x)) / 3;
  const secondY = from.y + (to.y - from.y) / 3 + curveDirection;
  return `M${from.x},${from.y} L${firstX},${firstY} L${secondX},${secondY} L${to.x},${to.y}`;
}

function createWavyPath(source: ExpressNode, target: ExpressNode, curveDirection: number) {
  const from = point(source);
  const to = point(target);
  const firstX = from.x + (to.x - from.x) / 3;
  const firstY = from.y + (to.y - from.y) / 3 + curveDirection;
  const secondX = from.x + (2 * (to.x - from.x)) / 3;
  const secondY = from.y + (2 * (to.y - from.y)) / 3 - curveDirection;
  return `M${from.x},${from.y} C${firstX},${firstY} ${secondX},${secondY} ${to.x},${to.y}`;
}

function createPath(link: ExpressLink) {
  const source = resolvedNode(link.source);
  const target = resolvedNode(link.target);
  const curveDirection = link.curveDirection ?? ((source.y ?? 0) > (target.y ?? 0) ? -30 : 30);
  const kind = link.pathKind ?? (target.kind === "path" ? "angled" : "straight");

  if (kind === "angled") return createAngledPath(source, target, curveDirection);
  if (kind === "wavy") return createWavyPath(source, target, curveDirection);
  return createStraightPath(source, target);
}

function markerPath(node: ExpressNode) {
  const x = NODE_SIZE / 2;
  const y = NODE_SIZE / 2;

  if (node.kind === "research") {
    return (
      <g>
        <rect x={x - 8} y={y - 8} width={16} height={16} fill="none" stroke="#0a0c20" strokeWidth="1.6" />
        <circle cx={x} cy={y} r={2.4} fill="#0a0c20" />
      </g>
    );
  }
  if (node.kind === "initiative") {
    return <path d={`M ${x} ${y - 11} L ${x + 10} ${y + 8} L ${x - 10} ${y + 8} Z`} fill="none" stroke="#0a0c20" strokeWidth="1.8" />;
  }
  if (node.kind === "artifact") {
    return <rect x={x - 9} y={y - 9} width={18} height={18} fill="white" stroke="#0a0c20" strokeWidth="1.5" />;
  }
  if (node.kind === "information") {
    return (
      <g>
        <circle cx={x} cy={y} r={10} fill="#0a0c20" />
        <circle cx={x} cy={y} r={2.3} fill="white" />
      </g>
    );
  }
  if (node.kind === "path") {
    return (
      <g>
        <path
          d={`M ${x - 12} ${y - 2} L ${x - 5} ${y - 14} L ${x + 8} ${y - 12} L ${x + 14} ${y} L ${x + 6} ${y + 12} L ${x - 8} ${y + 10} Z`}
          fill="white"
          stroke="#0a0c20"
          strokeWidth="1.8"
        />
        <text x={x} y={y + 4} textAnchor="middle" className="fill-[#0a0c20] text-[10px] font-medium">
          {node.ordinal}
        </text>
      </g>
    );
  }
  return null;
}

function centerMarker() {
  const x = NODE_SIZE / 2;
  const y = NODE_SIZE / 2;

  return (
    <g>
      {Array.from({ length: 9 }).map((_, index) => {
        const angle = (index / 9) * Math.PI * 2;
        const px = x + Math.cos(angle) * 10;
        const py = y + Math.sin(angle) * 10;
        return <circle key={index} cx={px} cy={py} r={5.4} fill="#ff5a1f" />;
      })}
      <circle cx={x} cy={y} r={7.6} fill="#ff5a1f" />
    </g>
  );
}

function labelOffset(node: ExpressNode) {
  if (node.id === "expression") return { x: 0, y: 58, anchor: "middle" as const };

  const x = node.anchor?.x ?? node.x ?? 0;
  const y = node.anchor?.y ?? node.y ?? 0;

  // 顶部节点 label 放下方
  if (y < 190) return { x: 0, y: 46, anchor: "middle" as const };
  // 底部节点 label 放上方
  if (y > 500) return { x: 0, y: -22, anchor: "middle" as const };
  // 左侧节点 label 放左侧
  if (x < 300) return { x: -14, y: 38, anchor: "end" as const };
  // 右侧节点 label 放右侧
  if (x > 700) return { x: 14, y: 38, anchor: "start" as const };

  return { x: 0, y: 46, anchor: "middle" as const };
}

function linkKey(link: ExpressLink) {
  const sourceId = typeof link.source === "string" ? link.source : link.source.id;
  const targetId = typeof link.target === "string" ? link.target : link.target.id;
  return `${sourceId}-${targetId}`;
}

export default function ExpressConnectionField() {
  const nodePositionRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const simRef = useRef<Simulation<ExpressNode, ExpressLink> | null>(null);

  useEffect(() => {
    const nodes = rawNodes.map((node) => ({
      ...node,
      x: node.anchor?.x ?? node.x ?? WIDTH / 2,
      y: node.anchor?.y ?? node.y ?? HEIGHT / 2,
    }));
    const links = rawLinks.map((link) => ({ ...link }));

    const nodeEls = nodePositionRefs.current;
    const edgeEls = edgeRefs.current;

    const sim = forceSimulation<ExpressNode>(nodes)
      .alpha(1)
      .alphaDecay(0.02)
      .alphaMin(0.001)
      .velocityDecay(0.3)
      .force(
        "link",
        forceLink<ExpressNode, ExpressLink>(links)
          .id((node) => node.id)
          .distance((link) => (link.level === 1 ? 132 : 96))
          .strength(0.1)
      )
      .force("charge", forceManyBody<ExpressNode>().strength(-420).distanceMax(320).distanceMin(10))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("x", forceX<ExpressNode>((node) => node.anchor?.x ?? WIDTH / 2).strength(0.18))
      .force("y", forceY<ExpressNode>((node) => node.anchor?.y ?? HEIGHT / 2).strength(0.18))
      .on("tick", () => {
        for (const node of nodes) {
          const el = nodeEls.get(node.id);
          if (el) {
            el.setAttribute("transform", `translate(${node.x ?? 0} ${node.y ?? 0})`);
          }
        }
        for (const link of links) {
          const el = edgeEls.get(linkKey(link));
          if (el) {
            el.setAttribute("d", createPath(link));
          }
        }
      });

    simRef.current = sim;

    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, []);

  return (
    <div
      className="express-connection-field fixed inset-0 z-20 pointer-events-none overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <g className="express-network" transform="translate(90 128) scale(0.78)">
          {rawLinks.map((link) => {
            const key = linkKey(link);
            return (
              <path
                key={key}
                ref={(el) => {
                  if (el) edgeRefs.current.set(key, el);
                  else edgeRefs.current.delete(key);
                }}
                className={`express-edge express-edge-level-${link.level}`}
                d={createPath(link)}
                fill="none"
                stroke="#0a0c20"
                strokeWidth={link.level === 1 ? 1.9 : 1.35}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={link.dashed ? "7 9" : undefined}
                opacity={1}
              />
            );
          })}

          {rawNodes.map((node) => {
            const label = labelOffset(node);
            const initialX = node.anchor?.x ?? node.x ?? 0;
            const initialY = node.anchor?.y ?? node.y ?? 0;
            return (
              <g key={node.id} className={`express-node express-node-level-${node.level}`}>
                <g
                  ref={(el) => {
                    if (el) nodePositionRefs.current.set(node.id, el);
                    else nodePositionRefs.current.delete(node.id);
                  }}
                  transform={`translate(${initialX} ${initialY})`}
                >
                  <g>{node.id === "expression" ? centerMarker() : markerPath(node)}</g>
                  <text
                    x={NODE_SIZE / 2 + label.x}
                    y={label.y}
                    textAnchor={label.anchor}
                    stroke={SITE_WARM_BACKGROUND}
                    strokeWidth={7}
                    strokeLinejoin="round"
                    paintOrder="stroke"
                    className={`fill-[#0a0c20] ${node.id === "expression" ? "text-[17px]" : "text-[14px]"} font-medium`}
                  >
                    {node.label}
                  </text>
                  {node.sublabel && (
                    <text
                      x={NODE_SIZE / 2 + label.x}
                      y={label.y + 19}
                      textAnchor={label.anchor}
                      stroke={SITE_WARM_BACKGROUND}
                      strokeWidth={4}
                      strokeLinejoin="round"
                      paintOrder="stroke"
                      className="fill-[#5b6375] text-[9px]"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </g>
      </svg>

    </div>
  );
}
