import postsIndex from "../../../src/data/posts/index.json";
import { CHANNELS_CONFIG } from "../../../src/lib/channels";
import { readFileSync } from "node:fs";
import path from "node:path";

export type ResponsiveRouteKind =
  | "home"
  | "overview"
  | "channel"
  | "column"
  | "article"
  | "canvas"
  | "data";

export interface ResponsiveRoute {
  path: string;
  kind: ResponsiveRouteKind;
  label: string;
}

const fixedRoutes: ResponsiveRoute[] = [
  { path: "/", kind: "home", label: "home" },
  { path: "/blog", kind: "overview", label: "blog" },
  { path: "/blog/columns", kind: "overview", label: "columns" },
  {
    path: "/blog/life/japan/stamps",
    kind: "canvas",
    label: "station-stamps",
  },
  { path: "/dev/datasets-demo", kind: "data", label: "datasets-demo" },
];

function readPublishedStudyIds(): string[] {
  try {
    const catalogPath = path.resolve(process.cwd(), ".generated/finance/catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    return catalog.studies.map(({ id }: { id: string }) => id);
  } catch {
    return [];
  }
}

export const marketStudyRoutes: ResponsiveRoute[] = readPublishedStudyIds().map((id) => ({
  path: `/blog/finance/market-studies/${id}`,
  kind: "data",
  label: `market-study-${id}`,
}));

const channelRoutes: ResponsiveRoute[] = Object.keys(CHANNELS_CONFIG).map(
  (channel) => ({
    path: `/blog/${channel}`,
    kind: "channel",
    label: `channel-${channel}`,
  }),
);

const columnRoutes: ResponsiveRoute[] = Object.entries(CHANNELS_CONFIG).flatMap(
  ([channel, config]) =>
    Object.keys(config.columns).map((column) => ({
      path: `/blog/${channel}/${column}`,
      kind: "column" as const,
      label: `column-${channel}-${column}`,
    })),
);

const articleRoutes: ResponsiveRoute[] = postsIndex.items.map((post) => ({
  path: `/blog/${post.slug}`,
  kind: "article" as const,
  label: `article-${post.slug.replaceAll("/", "-")}`,
}));

export const responsiveRoutes = [
  ...fixedRoutes,
  ...marketStudyRoutes,
  ...channelRoutes,
  ...columnRoutes,
  ...articleRoutes,
].sort((left, right) => left.path.localeCompare(right.path));

const uniquePaths = new Set(responsiveRoutes.map((route) => route.path));

if (uniquePaths.size !== responsiveRoutes.length) {
  throw new Error("Responsive route inventory contains duplicate paths.");
}
