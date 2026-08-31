"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
import type { ArticleRecommendation } from "@/lib/article/recommendations";

// ---------------------------------------------------------------------------
// 文章关系图：把「接下来阅读」从卡片改造成 express 风格的手绘力导向图。
// 以当前文章为中心节点，推荐文章为卫星节点，连线表示阅读关联。
// ---------------------------------------------------------------------------

const WIDTH = 960;
const HEIGHT = 460;
const NODE_SIZE = 36;
const CENTER = { x: 340, y: 230 };

type NodeKind = "index" | "article";

interface RelationNode extends SimulationNodeDatum {
  id: string;
  label: string;
  kind: NodeKind;
  href?: string;
  level: number;
  ordinal?: number;
  anchor?: { x: number; y: number };
  isCurrent?: boolean;
}

interface RelationLink extends SimulationLinkDatum<RelationNode> {
  pathKind?: "straight" | "angled" | "wavy";
  dashed?: boolean;
  curveDirection?: number;
}

function nodeMarkerPath(node: RelationNode) {
  const x = NODE_SIZE / 2;
  const y = NODE_SIZE / 2;

  if (node.kind === "article") {
    // 文章节点：圆环 + 中心点
    return (
      <g>
        <circle cx={x} cy={y} r={12} fill="none" stroke="#0a0c20" strokeWidth="1.6" />
        <circle cx={x} cy={y} r={3} fill="#0a0c20" />
      </g>
    );
  }
  return null;
}

// 中心标记的外围 9 个点（相对圆心偏移），预计算避免 SSR/CSR 浮点不一致
const CENTER_DOT_OFFSETS = [
  [10, 0], [7.660444, 6.427876], [1.736482, 9.848078], [-5, 8.660254],
  [-9.396926, 3.420201], [-9.396926, -3.420201], [-5, -8.660254],
  [1.736482, -9.848078], [7.660444, -6.427876],
] as const;

function centerMarker() {
  const x = NODE_SIZE / 2;
  const y = NODE_SIZE / 2;
  return (
    <g>
      {CENTER_DOT_OFFSETS.map(([dx, dy], index) => (
        <circle key={index} cx={x + dx} cy={y + dy} r={5.4} fill="#ff5a1f" />
      ))}
      <circle cx={x} cy={y} r={7.6} fill="#ff5a1f" />
    </g>
  );
}

function point(node: RelationNode) {
  return {
    x: (node.x ?? 0) + NODE_SIZE / 2,
    y: (node.y ?? 0) + NODE_SIZE / 2,
  };
}

function createStraightPath(source: RelationNode, target: RelationNode) {
  const from = point(source);
  const to = point(target);
  return `M${from.x},${from.y} L${to.x},${to.y}`;
}

function createAngledPath(source: RelationNode, target: RelationNode, curveDirection: number) {
  const from = point(source);
  const to = point(target);
  const firstX = from.x + (to.x - from.x) / 3;
  const firstY = from.y + (to.y - from.y) / 3 + curveDirection;
  const secondX = from.x + (2 * (to.x - from.x)) / 3;
  const secondY = from.y + (to.y - from.y) / 3 + curveDirection;
  return `M${from.x},${from.y} L${firstX},${firstY} L${secondX},${secondY} L${to.x},${to.y}`;
}

function createWavyPath(source: RelationNode, target: RelationNode, curveDirection: number) {
  const from = point(source);
  const to = point(target);
  const firstX = from.x + (to.x - from.x) / 3;
  const firstY = from.y + (to.y - from.y) / 3 + curveDirection;
  const secondX = from.x + (2 * (to.x - from.x)) / 3;
  const secondY = from.y + (2 * (to.y - from.y)) / 3 - curveDirection;
  return `M${from.x},${from.y} C${firstX},${firstY} ${secondX},${secondY} ${to.x},${to.y}`;
}

function createPath(link: RelationLink) {
  const source = link.source as RelationNode;
  const target = link.target as RelationNode;
  const curveDirection =
    link.curveDirection ?? ((source.y ?? 0) > (target.y ?? 0) ? -30 : 30);
  const kind = link.pathKind ?? "straight";

  if (kind === "angled") return createAngledPath(source, target, curveDirection);
  if (kind === "wavy") return createWavyPath(source, target, curveDirection);
  return createStraightPath(source, target);
}

function labelOffset(node: RelationNode) {
  if (node.isCurrent) return { x: 0, y: 62, anchor: "middle" as const };

  const y = node.anchor?.y ?? node.y ?? 0;
  if (y < 150) return { x: 0, y: 44, anchor: "middle" as const };
  if (y > 330) return { x: 0, y: -24, anchor: "middle" as const };
  return { x: 0, y: 44, anchor: "middle" as const };
}

function linkKey(link: RelationLink) {
  const sourceId =
    typeof link.source === "string" || typeof link.source === "number"
      ? String(link.source)
      : link.source.id;
  const targetId =
    typeof link.target === "string" || typeof link.target === "number"
      ? String(link.target)
      : link.target.id;
  return `${sourceId}-${targetId}`;
}

// 卫星节点锚点：围绕中心节点分布的三个位置
const SATELLITE_ANCHORS = [
  { x: 620, y: 120 },
  { x: 660, y: 250 },
  { x: 600, y: 385 },
];

interface ArticleRelationGraphProps {
  currentTitle: string;
  currentSlug: string;
  recommendations: ArticleRecommendation[];
  className?: string;
}

export function ArticleRelationGraph({
  currentTitle,
  currentSlug,
  recommendations,
  className,
}: ArticleRelationGraphProps) {
  const nodePositionRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const simRef = useRef<Simulation<RelationNode, RelationLink> | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const { nodes, links } = useMemo(() => {
    const visible = recommendations.filter((recommendation) => recommendation.slug);
    const graphNodes: RelationNode[] = [
      {
        id: "current",
        label: currentTitle,
        kind: "index",
        level: 0,
        isCurrent: true,
        x: CENTER.x,
        y: CENTER.y,
        fx: CENTER.x,
        fy: CENTER.y,
      },
      ...visible.map((recommendation, index) => ({
        id: recommendation.slug,
        label: recommendation.title ?? recommendation.slug,
        kind: "article" as NodeKind,
        href: `/blog/${recommendation.slug}`,
        level: 1,
        ordinal: index + 1,
        anchor: SATELLITE_ANCHORS[index % SATELLITE_ANCHORS.length],
      })),
    ];

    const pathKinds = ["straight", "angled", "wavy"] as const;
    const graphLinks: RelationLink[] = visible.map((recommendation, index) => ({
      source: "current",
      target: recommendation.slug,
      pathKind: pathKinds[index % pathKinds.length],
      dashed: false,
      curveDirection: index % 2 === 0 ? -26 : 26,
    }));

    return { nodes: graphNodes, links: graphLinks };
  }, [currentTitle, recommendations]);

  useEffect(() => {
    const simNodes = nodes.map((node) => ({
      ...node,
      x: node.anchor?.x ?? node.x ?? WIDTH / 2,
      y: node.anchor?.y ?? node.y ?? HEIGHT / 2,
    }));
    const simLinks = links.map((link) => ({ ...link }));

    const nodeEls = nodePositionRefs.current;
    const edgeEls = edgeRefs.current;

    const sim = forceSimulation<RelationNode>(simNodes)
      .alpha(1)
      .alphaDecay(0.02)
      .alphaMin(0.001)
      .velocityDecay(0.3)
      .force(
        "link",
        forceLink<RelationNode, RelationLink>(simLinks)
          .id((node) => node.id)
          .distance((link) => (link.pathKind === "straight" ? 170 : 150))
          .strength(0.06)
      )
      .force("charge", forceManyBody<RelationNode>().strength(-260).distanceMax(300).distanceMin(10))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("x", forceX<RelationNode>((node) => node.anchor?.x ?? WIDTH / 2).strength(0.12))
      .force("y", forceY<RelationNode>((node) => node.anchor?.y ?? HEIGHT / 2).strength(0.12))
      .on("tick", () => {
        for (const node of simNodes) {
          const el = nodeEls.get(node.id);
          if (el) {
            el.setAttribute("transform", `translate(${node.x ?? 0} ${node.y ?? 0})`);
          }
        }
        for (const link of simLinks) {
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
  }, [nodes, links]);

  if (recommendations.length === 0) return null;

  return (
    <section
      className={className}
      aria-labelledby="article-relation-graph-title"
    >
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--channel-muted,#68645d)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#ff5a1f]" aria-hidden="true" />
            Next Reads
          </p>
          <h2
            id="article-relation-graph-title"
            className="text-2xl font-semibold tracking-normal text-[var(--channel-ink,#141413)]"
          >
            接下来阅读
          </h2>
        </div>
      </div>

      {/* 桌面端：手绘关系图 */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden rounded-lg border border-[var(--channel-border,#D8D0C3)] bg-[color-mix(in_srgb,var(--channel-card,#E2DBCE)_48%,transparent)]">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block h-auto w-full"
            role="img"
            aria-label="接下来阅读文章关系图"
          >
            {links.map((link) => {
              const key = linkKey(link);
              const sourceId = (link.source as RelationNode).id;
              const targetId = (link.target as RelationNode).id;
              const isActive = hovered === sourceId || hovered === targetId;
              return (
                <path
                  key={key}
                  ref={(el) => {
                    if (el) edgeRefs.current.set(key, el);
                    else edgeRefs.current.delete(key);
                  }}
                  d={createPath(link)}
                  fill="none"
                  stroke={isActive ? "#0a0c20" : "#4f4b45"}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={link.dashed ? "7 9" : undefined}
                  className="transition-colors duration-300"
                />
              );
            })}

            {nodes.map((node) => {
              const label = labelOffset(node);
              const initialX = node.anchor?.x ?? node.x ?? 0;
              const initialY = node.anchor?.y ?? node.y ?? 0;
              const isHovered = hovered === node.id;

              return (
                <g
                  key={node.id}
                  className={`transition-opacity duration-300 ${hovered && !isHovered && !node.isCurrent ? "opacity-35" : ""}`}
                >
                  <g
                    ref={(el) => {
                      if (el) nodePositionRefs.current.set(node.id, el);
                      else nodePositionRefs.current.delete(node.id);
                    }}
                    transform={`translate(${initialX} ${initialY})`}
                  >
                    {node.isCurrent ? (
                      centerMarker()
                    ) : (
                      <g
                        role="link"
                        tabIndex={0}
                        aria-label={`阅读推荐：${node.label}`}
                        onClick={() => {
                          if (node.href) window.location.href = node.href;
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && node.href) {
                            window.location.href = node.href;
                          }
                        }}
                        onMouseEnter={() => setHovered(node.id)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(node.id)}
                        onBlur={() => setHovered(null)}
                        className="cursor-pointer focus:outline-none"
                      >
                        {nodeMarkerPath(node)}
                        <text
                          x={NODE_SIZE / 2}
                          y={NODE_SIZE / 2 + 34}
                          textAnchor="middle"
                          stroke={SITE_WARM_BACKGROUND}
                          strokeWidth={6}
                          strokeLinejoin="round"
                          paintOrder="stroke"
                          className="fill-[#0a0c20] text-[13px] font-medium"
                        >
                          {node.label.length > 18
                            ? node.label.slice(0, 18) + "…"
                            : node.label}
                        </text>
                      </g>
                    )}
                    {node.isCurrent && (
                      <text
                        x={NODE_SIZE / 2 + label.x}
                        y={label.y}
                        textAnchor={label.anchor}
                        stroke={SITE_WARM_BACKGROUND}
                        strokeWidth={7}
                        strokeLinejoin="round"
                        paintOrder="stroke"
                        className="fill-[#0a0c20] text-[15px] font-semibold"
                      >
                        {node.label}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>

          {/* 图例 */}
          <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-[var(--channel-muted,#68645d)]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#ff5a1f]" />
              当前文章
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full border border-[#0a0c20]" />
              推荐阅读
            </span>
          </div>
        </div>
      </div>

      {/* 移动端：列表降级 */}
      <div className="grid gap-3 md:hidden">
        {recommendations.map((recommendation) => (
          <Link
            key={recommendation.slug}
            href={`/blog/${recommendation.slug}`}
            className="group grid min-h-28 rounded-lg border border-[var(--channel-border,#D8D0C3)] bg-[color-mix(in_srgb,var(--channel-card,#E2DBCE)_48%,transparent)] p-5 transition-colors hover:bg-[color-mix(in_srgb,var(--channel-card,#E2DBCE)_68%,transparent)]"
          >
            <p className="text-xs font-medium text-[var(--channel-muted,#68645d)]">
              Next · {recommendation.title}
            </p>
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug tracking-normal text-[var(--channel-ink,#141413)]">
              {recommendation.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
