import {
  CONTENT_GRAPH_RELATIONS,
  CONTENT_GRAPH_TRAILS,
  type ContentGraphRelation,
  type ContentGraphRelationType,
  type ContentGraphTrail,
} from "@/data/content-graph";

export type ContentGraphRecommendationSource =
  | ContentGraphRelationType
  | "trail";

export interface ContentGraphRecommendationCandidate {
  slug: string;
  reason: string;
  source: ContentGraphRecommendationSource;
}

const DIRECTIONAL_RELATION_TYPES = new Set<ContentGraphRelationType>([
  "sequence",
  "applied-in",
]);

const ASSOCIATIVE_RELATION_TYPES = new Set<ContentGraphRelationType>([
  "related",
  "reflection",
]);

export function getContentGraphRecommendationCandidates(
  currentSlug: string,
  trails: ContentGraphTrail[] = CONTENT_GRAPH_TRAILS,
  relations: ContentGraphRelation[] = CONTENT_GRAPH_RELATIONS,
): ContentGraphRecommendationCandidate[] {
  const candidates: ContentGraphRecommendationCandidate[] = [];
  const seen = new Set<string>([currentSlug]);

  function addCandidate(candidate: ContentGraphRecommendationCandidate) {
    if (!candidate.slug || seen.has(candidate.slug)) return;
    seen.add(candidate.slug);
    candidates.push(candidate);
  }

  for (const relation of relations) {
    if (
      relation.from === currentSlug &&
      DIRECTIONAL_RELATION_TYPES.has(relation.type)
    ) {
      addCandidate({
        slug: relation.to,
        reason: relation.reason,
        source: relation.type,
      });
    }
  }

  for (const relation of relations) {
    if (!ASSOCIATIVE_RELATION_TYPES.has(relation.type)) continue;

    if (relation.from === currentSlug) {
      addCandidate({
        slug: relation.to,
        reason: relation.reason,
        source: relation.type,
      });
    } else if (relation.to === currentSlug) {
      addCandidate({
        slug: relation.from,
        reason: relation.reason,
        source: relation.type,
      });
    }
  }

  for (const trail of trails) {
    const currentIndex = trail.articles.indexOf(currentSlug);
    if (currentIndex === -1) continue;

    for (let distance = 1; distance < trail.articles.length; distance += 1) {
      const nextSlug = trail.articles[currentIndex + distance];
      if (nextSlug) {
        addCandidate({
          slug: nextSlug,
          reason: `沿着「${trail.name}」脉络继续阅读。`,
          source: "trail",
        });
      }

      const previousSlug = trail.articles[currentIndex - distance];
      if (previousSlug) {
        addCandidate({
          slug: previousSlug,
          reason: `从「${trail.name}」脉络的前置文章补充背景。`,
          source: "trail",
        });
      }
    }
  }

  return candidates;
}
