import postsIndex from "../../../src/data/posts/index.json";
import { CHANNELS_CONFIG } from "../../../src/lib/channels";

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
  ...channelRoutes,
  ...columnRoutes,
  ...articleRoutes,
].sort((left, right) => left.path.localeCompare(right.path));

const uniquePaths = new Set(responsiveRoutes.map((route) => route.path));

if (uniquePaths.size !== responsiveRoutes.length) {
  throw new Error("Responsive route inventory contains duplicate paths.");
}
