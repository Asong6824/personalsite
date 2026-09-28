import type { CSSProperties } from "react";
import { SITE_WARM_BACKGROUND } from "@/lib/site-theme";

export type ArticleChannelKey = "tech" | "life" | "creative" | "finance" | "default";

export interface ArticleChannelStyle {
  containerBg: string;
  containerStyle?: CSSProperties;
  prose: string;
  headerTitle: string;
  headerMeta: string;
  tagBg: string;
}

export const ARTICLE_CHANNEL_STYLES: Record<ArticleChannelKey, ArticleChannelStyle> = {
  tech: {
    containerBg: "bg-site-canvas",
    containerStyle: undefined,
    prose:
      "prose-headings:text-site-ink prose-p:text-site-ink prose-li:text-site-ink prose-a:text-site-ink hover:prose-a:text-site-stone-600 prose-strong:text-site-ink prose-blockquote:border-l-site-ink prose-blockquote:text-site-stone-600",
    headerTitle: "text-site-ink",
    headerMeta: "text-site-stone-600",
    tagBg: "bg-site-stone-200 hover:bg-site-stone-300 text-site-ink",
  },
  life: {
    containerBg: "bg-site-canvas",
    containerStyle: undefined,
    prose:
      "prose-headings:text-site-ink prose-p:text-site-ink prose-li:text-site-ink prose-a:text-site-blue-700 hover:prose-a:text-site-blue-800 prose-strong:text-site-ink prose-blockquote:border-l-site-blue-500 prose-blockquote:text-site-stone-600",
    headerTitle: "text-site-ink",
    headerMeta: "text-site-stone-600",
    tagBg: "bg-site-stone-200 hover:bg-site-blue-200 text-site-ink",
  },
  creative: {
    containerBg: "",
    containerStyle: { backgroundColor: SITE_WARM_BACKGROUND },
    prose:
      "prose-headings:text-site-ink prose-a:text-site-purple-700 hover:prose-a:text-site-purple-800 prose-strong:text-site-ink prose-blockquote:border-l-site-violet-600 prose-blockquote:text-site-stone-600 prose-p:text-site-ink prose-li:text-site-ink",
    headerTitle: "text-site-ink",
    headerMeta: "text-site-stone-600",
    tagBg: "bg-site-stone-200 hover:bg-site-violet-200 text-site-ink border border-site-stone-300",
  },
  finance: {
    containerBg: "bg-site-canvas",
    containerStyle: undefined,
    prose:
      "prose-headings:text-site-neutral-900 prose-a:text-site-lime-700 hover:prose-a:text-site-lime-800 prose-strong:text-site-neutral-900 prose-blockquote:border-l-site-lime-600 prose-blockquote:text-site-neutral-700 prose-p:text-site-neutral-700",
    headerTitle: "text-site-neutral-900",
    headerMeta: "text-site-neutral-500",
    tagBg: "bg-site-lime-50 hover:bg-site-lime-100 text-site-neutral-700",
  },
  default: {
    containerBg: "bg-site-canvas dark:bg-site-slate-950",
    containerStyle: undefined,
    prose:
      "prose-headings:text-site-neutral-800 dark:prose-headings:text-site-sky-300 prose-a:text-site-blue-700 dark:prose-a:text-site-blue-400 hover:prose-a:text-site-blue-800 dark:hover:prose-a:text-site-blue-300 prose-strong:text-site-neutral-900 dark:prose-strong:text-site-neutral-100 prose-blockquote:border-l-site-sky-500 prose-blockquote:text-site-neutral-600 dark:prose-blockquote:text-site-neutral-300",
    headerTitle: "text-site-neutral-900 dark:text-site-stone-50",
    headerMeta: "text-site-neutral-500",
    tagBg: "bg-site-sky-700/70 hover:bg-site-sky-600/70 text-site-sky-100",
  },
};

export function getArticleChannelStyle(channel?: string | null): ArticleChannelStyle {
  if (
    channel === "tech" ||
    channel === "life" ||
    channel === "creative" ||
    channel === "finance"
  ) {
    return ARTICLE_CHANNEL_STYLES[channel];
  }

  return ARTICLE_CHANNEL_STYLES.default;
}
