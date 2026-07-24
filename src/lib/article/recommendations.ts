import { getPostSummary } from "@/lib/post";
import { getContentGraphRecommendationCandidates } from "@/lib/content-graph";
import { normalizeRecommendationEntry } from "./recommendation-config";
import type { Post, PostFrontmatter } from "@/types";

export const MAX_ARTICLE_RECOMMENDATIONS = 3;

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

export function getArticleRecommendations(
  frontmatter: PostFrontmatter,
  currentSlug: string
): ArticleRecommendation[] {
  const editorialEntries = Array.isArray(frontmatter.nextReads)
    ? frontmatter.nextReads
    : [];
  const graphEntries = getContentGraphRecommendationCandidates(currentSlug);
  const entries = [...editorialEntries, ...graphEntries];

  const seen = new Set<string>([currentSlug]);
  const recommendations: ArticleRecommendation[] = [];

  for (const entry of entries) {
    if (recommendations.length >= MAX_ARTICLE_RECOMMENDATIONS) break;

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
          `[ArticleRecommendations] Cannot resolve recommendation slug "${normalized.slug}".`
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
