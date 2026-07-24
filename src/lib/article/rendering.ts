import type { PostFrontmatter } from "@/types";

export type ArticleMediaType = "interactive" | "video" | "image" | null;

export function estimateReadingMinutes(content: string): number {
  const compact = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "");

  return Math.max(1, Math.ceil(compact.length / 550));
}

export function getArticleMediaType(slug: string, frontmatter: PostFrontmatter): ArticleMediaType {
  if (slug === "tech/ai-engineering/from-rag-technique-to-rag-philosophy") {
    return "interactive";
  }

  if (frontmatter.heroVideo || frontmatter.videoUrl) {
    return "video";
  }

  if (frontmatter.coverImage) {
    return "image";
  }

  return null;
}

export function getArticleMediaLabel(mediaType: ArticleMediaType): string | null {
  if (mediaType === "interactive") return "交互全文地图";
  if (mediaType === "video") return "视频";
  if (mediaType === "image") return "图片";
  return null;
}
