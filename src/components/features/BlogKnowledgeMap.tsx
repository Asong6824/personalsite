"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

import {
  CONTENT_GRAPH_RELATIONS,
  CONTENT_GRAPH_TRAILS,
  type ContentGraphRelation,
} from "@/data/content-graph";

interface KnowledgeMapPost {
  slug: string;
  title: string;
  date: string;
  channel: string;
  column: string;
  tags: string[];
  excerpt?: string;
}

interface BlogKnowledgeMapProps {
  posts: KnowledgeMapPost[];
}

interface PositionedNode extends KnowledgeMapPost, SimulationNodeDatum {
  degree: number;
  trailIds: string[];
}

interface PositionedLink
  extends SimulationLinkDatum<PositionedNode>,
    ContentGraphRelation {}

const GRAPH_WIDTH = 940;
const GRAPH_HEIGHT = 620;

const CHANNEL_STYLES: Record<
  string,
  { name: string; fill: string; active: string; dotClassName: string }
> = {
  tech: {
    name: "技术",
    fill: "#A68A7D",
    active: "#76584C",
    dotClassName: "bg-[#A68A7D]",
  },
  creative: {
    name: "创意",
    fill: "#9A849D",
    active: "#6E5972",
    dotClassName: "bg-[#9A849D]",
  },
  life: {
    name: "生活",
    fill: "#82917B",
    active: "#566650",
    dotClassName: "bg-[#82917B]",
  },
  finance: {
    name: "金融",
    fill: "#A08A62",
    active: "#755F39",
    dotClassName: "bg-[#A08A62]",
  },
};

const RELATION_LABELS: Record<ContentGraphRelation["type"], string> = {
  sequence: "继续阅读",
  related: "相关讨论",
  "applied-in": "实践延伸",
  reflection: "相互映照",
};

function getNodeSlug(
  endpoint: string | number | PositionedNode,
): string {
  return typeof endpoint === "object" ? endpoint.slug : String(endpoint);
}

function splitTitle(title: string) {
  const compact = title.replace(/\s+/g, " ");
  const first = compact.slice(0, 11);
  const second = compact.length > 11 ? compact.slice(11, 22) : "";
  return [first, second ? `${second}${compact.length > 22 ? "…" : ""}` : ""];
}

function buildGraph(posts: KnowledgeMapPost[]) {
  const availableSlugs = new Set(posts.map((post) => post.slug));
  const relations = CONTENT_GRAPH_RELATIONS.filter(
    (relation) =>
      availableSlugs.has(relation.from) && availableSlugs.has(relation.to),
  );
  const degrees = new Map<string, number>();

  relations.forEach((relation) => {
    degrees.set(relation.from, (degrees.get(relation.from) ?? 0) + 1);
    degrees.set(relation.to, (degrees.get(relation.to) ?? 0) + 1);
  });

  const trailCenters = [
    [250, 170],
    [470, 120],
    [720, 190],
    [710, 430],
    [440, 500],
    [190, 410],
  ];

  const nodes: PositionedNode[] = posts.map((post, index) => {
    const trailIds = CONTENT_GRAPH_TRAILS.filter((trail) =>
      trail.articles.includes(post.slug),
    ).map((trail) => trail.id);
    const primaryTrailIndex = Math.max(
      0,
      CONTENT_GRAPH_TRAILS.findIndex((trail) =>
        trail.articles.includes(post.slug),
      ),
    );
    const [centerX, centerY] =
      trailCenters[primaryTrailIndex % trailCenters.length];
    const angle = index * 2.399963;
    const offset = 38 + (index % 4) * 18;

    return {
      ...post,
      degree: degrees.get(post.slug) ?? 0,
      trailIds,
      x: centerX + Math.cos(angle) * offset,
      y: centerY + Math.sin(angle) * offset,
    };
  });

  const links: PositionedLink[] = relations.map((relation) => ({
    ...relation,
    source: relation.from,
    target: relation.to,
  }));

  const simulation = forceSimulation(nodes)
    .force(
      "link",
      forceLink<PositionedNode, PositionedLink>(links)
        .id((node) => node.slug)
        .distance((link) => (link.type === "related" ? 128 : 108))
        .strength(0.36),
    )
    .force("charge", forceManyBody().strength(-235))
    .force("center", forceCenter(GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2))
    .force("collision", forceCollide<PositionedNode>().radius(44).strength(0.9))
    .force("x", forceX(GRAPH_WIDTH / 2).strength(0.025))
    .force("y", forceY(GRAPH_HEIGHT / 2).strength(0.035))
    .stop();

  for (let index = 0; index < 320; index += 1) {
    simulation.tick();
  }

  return { nodes, links };
}

export function BlogKnowledgeMap({ posts }: BlogKnowledgeMapProps) {
  const { nodes, links } = useMemo(() => buildGraph(posts), [posts]);
  const [activeTrailId, setActiveTrailId] = useState<string>("all");
  const [selectedSlug, setSelectedSlug] = useState<string>(
    "creative/product/obsidian-future-note-making",
  );

  const selectedNode =
    nodes.find((node) => node.slug === selectedSlug) ?? nodes[0];
  const activeTrail = CONTENT_GRAPH_TRAILS.find(
    (trail) => trail.id === activeTrailId,
  );
  const visibleSlugs = useMemo(
    () =>
      new Set(
        activeTrail
          ? activeTrail.articles
          : nodes.map((node) => node.slug),
      ),
    [activeTrail, nodes],
  );
  const selectedNeighborSlugs = useMemo(() => {
    const neighbors = new Set<string>([selectedNode?.slug]);

    links.forEach((link) => {
      const source = getNodeSlug(link.source);
      const target = getNodeSlug(link.target);

      if (source === selectedNode?.slug) neighbors.add(target);
      if (target === selectedNode?.slug) neighbors.add(source);
    });

    return neighbors;
  }, [links, selectedNode]);
  const selectedRelations = links.filter((link) => {
    const source = getNodeSlug(link.source);
    const target = getNodeSlug(link.target);
    return source === selectedNode?.slug || target === selectedNode?.slug;
  });
  const mobilePosts = activeTrail
    ? activeTrail.articles
        .map((slug) => nodes.find((node) => node.slug === slug))
        .filter((node): node is PositionedNode => Boolean(node))
    : nodes;

  function selectTrail(trailId: string) {
    setActiveTrailId(trailId);
    const trail = CONTENT_GRAPH_TRAILS.find((item) => item.id === trailId);
    if (trail?.articles[0]) setSelectedSlug(trail.articles[0]);
  }

  if (!selectedNode) return null;

  return (
    <section
      aria-labelledby="knowledge-map-heading"
      className="border-b border-[#141413]/25 py-12 lg:py-16"
    >
      <div className="mb-9 grid gap-5 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#68645d]">
            Knowledge map / 内容地图
          </p>
          <h2
            id="knowledge-map-heading"
            className="font-serif text-4xl tracking-[-0.035em] sm:text-5xl"
          >
            沿着联系阅读
          </h2>
        </div>
        <div className="max-w-2xl lg:col-span-8 lg:pt-7">
          <p className="text-base leading-7 text-[#4f4b45] sm:text-lg sm:leading-8">
            频道是目录，连线是文章之间真实的思想脉络。选择一个主题，看看技术、创作与生活如何在不同地方相遇。
          </p>
        </div>
      </div>

      <div
        className="mb-6 flex gap-2 overflow-x-auto pb-2"
        aria-label="内容脉络筛选"
      >
        <button
          type="button"
          onClick={() => setActiveTrailId("all")}
          aria-pressed={activeTrailId === "all"}
          className={`shrink-0 border px-4 py-2 font-mono text-[11px] tracking-[0.08em] transition-colors ${
            activeTrailId === "all"
              ? "border-[#141413] bg-[#141413] text-[#F0EEE7]"
              : "border-[#141413]/25 text-[#4f4b45] hover:bg-[#E2DBCE]"
          }`}
        >
          全部关系
        </button>
        {CONTENT_GRAPH_TRAILS.map((trail) => (
          <button
            key={trail.id}
            type="button"
            onClick={() => selectTrail(trail.id)}
            aria-pressed={activeTrailId === trail.id}
            className={`shrink-0 border px-4 py-2 text-sm transition-colors ${
              activeTrailId === trail.id
                ? "border-[#141413] bg-[#141413] text-[#F0EEE7]"
                : "border-[#141413]/25 text-[#4f4b45] hover:bg-[#E2DBCE]"
            }`}
          >
            {trail.name}
          </button>
        ))}
      </div>

      <div className="hidden min-h-[640px] grid-cols-[minmax(0,1fr)_21rem] border border-[#141413]/20 bg-[#E9E5DC]/45 md:grid">
        <div className="relative min-w-0 overflow-hidden border-r border-[#141413]/20">
          <div className="pointer-events-none absolute left-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.14em] text-[#68645d]">
            {activeTrail ? activeTrail.label : `${nodes.length} 篇文章 · ${links.length} 条联系`}
          </div>
          <svg
            role="img"
            aria-label="文章知识关系图。点击节点可查看文章摘要和关联理由。"
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            className="h-full min-h-[640px] w-full"
          >
            <g>
              {links.map((link) => {
                const source = link.source as PositionedNode;
                const target = link.target as PositionedNode;
                const belongsToTrail =
                  visibleSlugs.has(source.slug) &&
                  visibleSlugs.has(target.slug);
                const touchesSelected =
                  source.slug === selectedNode.slug ||
                  target.slug === selectedNode.slug;
                const opacity = touchesSelected
                  ? 0.78
                  : activeTrail
                    ? belongsToTrail
                      ? 0.32
                      : 0.045
                    : 0.16;

                return (
                  <line
                    key={`${link.from}-${link.to}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#4F4B45"
                    strokeWidth={touchesSelected ? 1.7 : 1}
                    strokeDasharray={
                      link.type === "related" || link.type === "reflection"
                        ? "4 5"
                        : undefined
                    }
                    opacity={opacity}
                    className="transition-opacity duration-300"
                  />
                );
              })}
            </g>
            <g>
              {nodes.map((node) => {
                const radius = 7 + Math.min(node.degree, 5) * 1.35;
                const channelStyle =
                  CHANNEL_STYLES[node.channel] ?? CHANNEL_STYLES.tech;
                const isSelected = node.slug === selectedNode.slug;
                const isVisible = visibleSlugs.has(node.slug);
                const isNeighbor = selectedNeighborSlugs.has(node.slug);
                const opacity = isSelected
                  ? 1
                  : activeTrail
                    ? isVisible
                      ? 0.92
                      : 0.12
                    : isNeighbor
                      ? 0.9
                      : 0.48;
                const [firstLine, secondLine] = splitTitle(node.title);

                return (
                  <g
                    key={node.slug}
                    role="button"
                    tabIndex={0}
                    aria-label={`查看文章：${node.title}`}
                    onClick={() => setSelectedSlug(node.slug)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedSlug(node.slug);
                      }
                    }}
                    transform={`translate(${node.x}, ${node.y})`}
                    opacity={opacity}
                    className="cursor-pointer transition-opacity duration-300 focus:outline-none"
                  >
                    {isSelected && (
                      <circle
                        r={radius + 7}
                        fill="none"
                        stroke={channelStyle.active}
                        strokeWidth="1"
                        opacity="0.35"
                      />
                    )}
                    <circle
                      r={radius}
                      fill={isSelected ? channelStyle.active : channelStyle.fill}
                      stroke="#F0EEE7"
                      strokeWidth="2"
                    />
                    <text
                      x={radius + 7}
                      y={secondLine ? -2 : 4}
                      fill="#2B2925"
                      fontSize="11.5"
                      fontWeight={isSelected ? 650 : 500}
                    >
                      <tspan x={radius + 7}>{firstLine}</tspan>
                      {secondLine && (
                        <tspan x={radius + 7} dy="14">
                          {secondLine}
                        </tspan>
                      )}
                    </text>
                    <title>{node.title}</title>
                  </g>
                );
              })}
            </g>
          </svg>
          <div className="pointer-events-none absolute bottom-5 left-5 flex flex-wrap gap-x-4 gap-y-2">
            {Object.entries(CHANNEL_STYLES).map(([key, style]) => (
              <span
                key={key}
                className="flex items-center gap-1.5 text-[11px] text-[#68645d]"
              >
                <span
                  className={`h-2 w-2 rounded-full ${style.dotClassName}`}
                />
                {style.name}
              </span>
            ))}
          </div>
        </div>

        <aside className="flex flex-col p-6 lg:p-7" aria-live="polite">
          <div className="mb-auto">
            <div className="mb-5 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[#68645d]">
              <span>{CHANNEL_STYLES[selectedNode.channel]?.name}</span>
              <time dateTime={selectedNode.date}>
                {selectedNode.date.replaceAll("-", ".")}
              </time>
            </div>
            <h3 className="font-serif text-2xl leading-tight tracking-[-0.025em]">
              {selectedNode.title}
            </h3>
            {selectedNode.excerpt && (
              <p className="mt-4 text-sm leading-6 text-[#68645d]">
                {selectedNode.excerpt}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {selectedNode.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[#141413]/15 px-2 py-1 text-[11px] text-[#68645d]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {selectedRelations.length > 0 && (
              <div className="mt-8 border-t border-[#141413]/20 pt-5">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#68645d]">
                  为什么相连
                </p>
                <div className="space-y-4">
                  {selectedRelations.slice(0, 4).map((relation) => {
                    const sourceSlug = getNodeSlug(relation.source);
                    const targetSlug = getNodeSlug(relation.target);
                    const otherSlug =
                      sourceSlug === selectedNode.slug
                        ? targetSlug
                        : sourceSlug;
                    const otherNode = nodes.find(
                      (node) => node.slug === otherSlug,
                    );

                    if (!otherNode) return null;

                    return (
                      <button
                        key={`${relation.from}-${relation.to}`}
                        type="button"
                        onClick={() => setSelectedSlug(otherNode.slug)}
                        className="block w-full text-left"
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#7b746b]">
                          {RELATION_LABELS[relation.type]}
                        </span>
                        <span className="mt-1 block text-sm font-medium leading-5">
                          {otherNode.title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[#68645d]">
                          {relation.reason}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            href={`/blog/${selectedNode.slug}`}
            className="mt-8 flex items-center justify-between border-t border-[#141413] pt-4 text-sm font-medium transition-opacity hover:opacity-60"
          >
            阅读这篇文章
            <span aria-hidden="true">→</span>
          </Link>
        </aside>
      </div>

      <div className="border-t border-[#141413]/25 md:hidden">
        {activeTrail && (
          <p className="border-b border-[#141413]/20 py-4 text-sm leading-6 text-[#68645d]">
            {activeTrail.description}
          </p>
        )}
        {mobilePosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 border-b border-[#141413]/20 py-4"
          >
            <span className="pt-1 font-mono text-[10px] text-[#68645d]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="block font-serif text-lg leading-snug">
                {post.title}
              </span>
              <span className="mt-1 block text-xs text-[#68645d]">
                {CHANNEL_STYLES[post.channel]?.name}
              </span>
            </span>
            <span aria-hidden="true" className="pt-1 text-sm">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
