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
    containerBg: "bg-[#F0EEE7]",
    containerStyle: undefined,
    prose:
      "prose-headings:text-[#141413] prose-p:text-[#141413] prose-li:text-[#141413] prose-a:text-[#141413] hover:prose-a:text-[#68645d] prose-strong:text-[#141413] prose-blockquote:border-l-[#141413] prose-blockquote:text-[#68645d]",
    headerTitle: "text-[#141413]",
    headerMeta: "text-[#68645d]",
    tagBg: "bg-[#E2DBCE] hover:bg-[#D8D0C3] text-[#141413]",
  },
  life: {
    containerBg: "bg-[#F0EEE7]",
    containerStyle: undefined,
    prose:
      "prose-headings:text-[#141413] prose-p:text-[#141413] prose-li:text-[#141413] prose-a:text-[#141413] hover:prose-a:text-[#68645d] prose-strong:text-[#141413] prose-blockquote:border-l-[#141413] prose-blockquote:text-[#68645d]",
    headerTitle: "text-[#141413]",
    headerMeta: "text-[#68645d]",
    tagBg: "bg-[#E2DBCE] hover:bg-[#D8D0C3] text-[#141413]",
  },
  creative: {
    containerBg: "",
    containerStyle: { backgroundColor: SITE_WARM_BACKGROUND },
    prose:
      "prose-headings:text-[#141413] prose-a:text-purple-700 hover:prose-a:text-purple-900 prose-strong:text-[#141413] prose-blockquote:border-l-purple-500/60 prose-blockquote:text-[#68645d] prose-p:text-[#141413] prose-li:text-[#141413]",
    headerTitle: "text-[#141413]",
    headerMeta: "text-[#68645d]",
    tagBg: "bg-[#E2DBCE] hover:bg-[#D8D0C3] text-[#141413] border border-[#D8D0C3]",
  },
  finance: {
    containerBg: "bg-[#F0EEE7]",
    containerStyle: undefined,
    prose:
      "prose-headings:text-[#1a1c19] prose-a:text-[#506354] hover:prose-a:text-[#1a1c19] prose-strong:text-[#1a1c19] prose-blockquote:border-l-[#506354] prose-blockquote:text-[#444748] prose-p:text-[#444748]",
    headerTitle: "text-[#1a1c19]",
    headerMeta: "text-[#747878]",
    tagBg: "bg-[#f4f4ef] hover:bg-[#e3e3de] text-[#444748]",
  },
  default: {
    containerBg: "bg-white dark:bg-neutral-950",
    containerStyle: undefined,
    prose:
      "prose-headings:text-neutral-800 dark:prose-headings:text-sky-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300 prose-strong:text-neutral-900 dark:prose-strong:text-neutral-100 prose-blockquote:border-l-sky-500 prose-blockquote:text-neutral-600 dark:prose-blockquote:text-neutral-300",
    headerTitle: "text-neutral-900 dark:text-white",
    headerMeta: "text-neutral-400",
    tagBg: "bg-sky-700/70 hover:bg-sky-600/70 text-sky-200",
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
