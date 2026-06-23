"use client";

import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

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
const CENTER = { x: 500, y: 365 };

const rawNodes: ExpressNode[] = [
  {
    id: "expression",
    label: "Expression",
    sublabel: "connect what was observed",
    kind: "index",
    level: 0,
    x: CENTER.x,
    y: CENTER.y,
    fx: CENTER.x,
    fy: CENTER.y,
  },
  { id: "essays", label: "Essays", sublabel: "thinking in text", kind: "path", level: 1, ordinal: 1, anchor: { x: 350, y: 290 } },
  { id: "interfaces", label: "Interfaces", sublabel: "ideas as tools", kind: "path", level: 1, ordinal: 2, anchor: { x: 625, y: 300 } },
  { id: "images", label: "Images", sublabel: "visual notes", kind: "path", level: 1, ordinal: 3, anchor: { x: 360, y: 485 } },
  { id: "systems", label: "Systems", sublabel: "repeatable structures", kind: "path", level: 1, ordinal: 4, anchor: { x: 650, y: 490 } },
  { id: "rag", label: "RAG Philosophy", kind: "research", level: 2, anchor: { x: 210, y: 305 } },
  { id: "design", label: "Design Basics", kind: "artifact", level: 2, anchor: { x: 255, y: 405 } },
  { id: "notion", label: "Notion Zen", kind: "initiative", level: 2, anchor: { x: 765, y: 310 } },
  { id: "stamps", label: "Station Stamps", kind: "artifact", level: 2, anchor: { x: 820, y: 430 } },
  { id: "japan", label: "Japan Notes", kind: "information", level: 2, anchor: { x: 235, y: 560 } },
  { id: "market", label: "Market Method", kind: "research", level: 2, anchor: { x: 760, y: 575 } },
  { id: "map", label: "Map Drawing", kind: "artifact", level: 3, anchor: { x: 120, y: 430 } },
  { id: "proraw", label: "ProRAW Workflow", kind: "artifact", level: 3, anchor: { x: 430, y: 610 } },
  { id: "index", label: "Post Index", kind: "research", level: 3, anchor: { x: 885, y: 350 } },
];

const rawLinks: ExpressLink[] = [
  { source: "expression", target: "essays", level: 1, pathKind: "angled" },
  { source: "expression", target: "interfaces", level: 1, pathKind: "angled" },
  { source: "expression", target: "images", level: 1, pathKind: "angled" },
  { source: "expression", target: "systems", level: 1, pathKind: "angled" },
  { source: "essays", target: "rag", level: 2, pathKind: "straight" },
  { source: "essays", target: "design", level: 2, pathKind: "angled" },
  { source: "interfaces", target: "notion", level: 2, pathKind: "straight" },
  { source: "interfaces", target: "index", level: 3, pathKind: "angled", dashed: true },
  { source: "images", target: "japan", level: 2, pathKind: "angled" },
  { source: "images", target: "map", level: 3, pathKind: "straight", dashed: true },
  { source: "systems", target: "stamps", level: 2, pathKind: "wavy" },
  { source: "systems", target: "market", level: 2, pathKind: "angled" },
  { source: "japan", target: "proraw", level: 3, pathKind: "angled", dashed: true },
  { source: "notion", target: "index", level: 3, pathKind: "wavy", dashed: true },
  { source: "market", target: "index", level: 3, pathKind: "angled", dashed: true },
];

function createLayout() {
  const nodes = rawNodes.map((node) => ({
    ...node,
    x: node.x ?? node.anchor?.x,
    y: node.y ?? node.anchor?.y,
  }));
  const links = rawLinks.map((link) => ({ ...link }));

  forceSimulation<ExpressNode>(nodes)
    .force(
      "link",
      forceLink<ExpressNode, ExpressLink>(links)
        .id((node) => node.id)
        .distance((link) => (link.level === 1 ? 116 : link.level === 2 ? 96 : 84))
        .strength(0.1)
    )
    .force("charge", forceManyBody<ExpressNode>().strength(-400).distanceMax(300).distanceMin(10))
    .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
    .force("x", forceX<ExpressNode>((node) => node.anchor?.x ?? WIDTH / 2).strength(0.16))
    .force("y", forceY<ExpressNode>((node) => node.anchor?.y ?? HEIGHT / 2).strength(0.16))
    .stop()
    .tick(260);

  return { nodes, links };
}

const layout = createLayout();
const nodeById = new Map(layout.nodes.map((node) => [node.id, node]));

function resolvedNode(node: string | ExpressNode) {
  return typeof node === "string" ? nodeById.get(node)! : node;
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
  if (node.id === "expression") return { x: 0, y: 48, anchor: "middle" as const };
  if ((node.x ?? 0) < 280) return { x: -12, y: 44, anchor: "end" as const };
  if ((node.x ?? 0) > 720) return { x: 14, y: 38, anchor: "start" as const };
  return { x: 0, y: (node.y ?? 0) < CENTER.y ? -18 : 46, anchor: "middle" as const };
}

export default function ExpressConnectionField() {
  return (
    <div
      className="express-connection-field fixed inset-0 z-20 pointer-events-none overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <g className="express-network" transform="translate(90 98) scale(0.78)">
          {layout.links.map((link) => {
            const source = resolvedNode(link.source);
            const target = resolvedNode(link.target);
            return (
              <path
                key={`${source.id}-${target.id}`}
                className={`express-edge express-edge-level-${link.level}`}
                d={createPath(link)}
                fill="none"
                stroke="#0a0c20"
                strokeWidth={link.level === 1 ? 1.9 : 1.35}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={link.dashed ? "7 9" : undefined}
                opacity={link.level === 3 ? 0.72 : 1}
              />
            );
          })}

          {layout.nodes.map((node) => {
            const label = labelOffset(node);
            return (
              <g
                key={node.id}
                className={`express-node express-node-level-${node.level}`}
                transform={`translate(${node.x ?? 0} ${node.y ?? 0})`}
              >
                <g>{node.id === "expression" ? centerMarker() : markerPath(node)}</g>
                <text
                  x={NODE_SIZE / 2 + label.x}
                  y={label.y}
                  textAnchor={label.anchor}
                  className={`fill-[#0a0c20] ${node.id === "expression" ? "text-[18px]" : "text-[14px]"} font-medium`}
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    x={NODE_SIZE / 2 + label.x}
                    y={label.y + 19}
                    textAnchor={label.anchor}
                    className="fill-[#5b6375] text-[9px]"
                  >
                    {node.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="express-legend absolute right-[7vw] top-1/2 hidden w-[280px] -translate-y-1/2 rounded-lg bg-white/45 p-5 text-[#0a0c20] shadow-[0_18px_50px_rgba(10,12,32,0.08)] backdrop-blur-sm xl:block">
        {[
          ["INDEX", "✹"],
          ["PATHS", "1"],
          ["ARTIFACTS", "□"],
          ["RESEARCH", "▪"],
          ["INITIATIVES", "△"],
        ].map(([label, icon]) => (
          <div key={label} className="flex items-center justify-between border-b border-dashed border-[#0a0c20]/45 py-3 last:border-b-0">
            <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em]">
              <span className="inline-flex h-5 w-5 items-center justify-center text-sm">{icon}</span>
              {label}
            </span>
            <span className="text-lg leading-none">+</span>
          </div>
        ))}
      </div>
    </div>
  );
}
