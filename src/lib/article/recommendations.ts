import { getPostSummary } from "@/lib/post";
import type { NextReadConfig, Post, PostFrontmatter } from "@/types";

export interface ArticleRecommendation {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
  coverImage?: string;
  channel?: string;
  column?: string;
  reason?: string;
}

function normalizeRecommendationEntry(
  entry: string | NextReadConfig
): NextReadConfig | null {
  if (typeof entry === "string") {
    const slug = entry.trim().replace(/^\/?blog\//, "").replace(/^\/+/, "");
    return slug ? { slug } : null;
  }

  if (entry && typeof entry.slug === "string") {
    const slug = entry.slug.trim().replace(/^\/?blog\//, "").replace(/^\/+/, "");
    return slug ? { slug, reason: entry.reason } : null;
  }

  return null;
}

export function getArticleRecommendations(
  frontmatter: PostFrontmatter,
  currentSlug: string
): ArticleRecommendation[] {
  const entries = Array.isArray(frontmatter.nextReads)
    ? frontmatter.nextReads
    : [];

  const seen = new Set<string>([currentSlug]);
  const recommendations: ArticleRecommendation[] = [];

  for (const entry of entries) {
    const normalized = normalizeRecommendationEntry(entry);
    if (!normalized || seen.has(normalized.slug)) continue;

    seen.add(normalized.slug);
    const post = getPostSummary(normalized.slug) as (Partial<Post> & {
      hidden?: boolean;
      description?: string;
      brief?: string;
    }) | null;

    if (!post || post.hidden) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[ArticleRecommendations] Cannot resolve nextReads slug "${normalized.slug}".`
        );
      }
      continue;
    }

    if (!post.title) continue;

    recommendations.push({
      slug: normalized.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt || post.description || post.brief,
      coverImage: post.coverImage,
      channel: post.channel,
      column: post.column,
      reason: normalized.reason,
    });
  }

  return recommendations;
}
