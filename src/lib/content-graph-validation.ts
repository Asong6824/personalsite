import type {
  ContentGraphRelation,
  ContentGraphRelationType,
  ContentGraphTrail,
} from "@/data/content-graph";
import { normalizeRecommendationEntry } from "@/lib/article/recommendation-config";

export interface ContentRelationshipPost {
  slug: string;
  hidden?: boolean;
  nextReads?: unknown;
}

export interface ContentGraphValidationResult {
  errors: string[];
  warnings: string[];
}

const RELATION_TYPES = new Set<ContentGraphRelationType>([
  "sequence",
  "related",
  "applied-in",
  "reflection",
]);

export function validateContentGraph(
  trails: ContentGraphTrail[],
  relations: ContentGraphRelation[],
  posts: ContentRelationshipPost[],
): ContentGraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]));
  const visiblePostSlugs = new Set(
    posts.filter((post) => !post.hidden).map((post) => post.slug),
  );
  const graphSlugs = new Set<string>();
  const trailIds = new Set<string>();

  for (const trail of trails) {
    const trailLabel = trail.id || "<missing-id>";

    if (!trail.id.trim()) {
      errors.push("[trail] A trail is missing its id.");
    } else if (trailIds.has(trail.id)) {
      errors.push(`[trail] Duplicate trail id "${trail.id}".`);
    }
    trailIds.add(trail.id);

    if (!trail.name.trim()) {
      errors.push(`[trail:${trailLabel}] Name cannot be empty.`);
    }
    if (trail.articles.length === 0) {
      errors.push(`[trail:${trailLabel}] Must contain at least one article.`);
    }

    const trailSlugs = new Set<string>();
    for (const slug of trail.articles) {
      if (!slug.trim()) {
        errors.push(`[trail:${trailLabel}] Contains an empty article slug.`);
        continue;
      }
      if (trailSlugs.has(slug)) {
        errors.push(`[trail:${trailLabel}] Duplicate article slug "${slug}".`);
      }
      trailSlugs.add(slug);
      graphSlugs.add(slug);

      const post = postsBySlug.get(slug);
      if (!post) {
        errors.push(`[trail:${trailLabel}] Cannot resolve article "${slug}".`);
      } else if (post.hidden) {
        errors.push(`[trail:${trailLabel}] Article "${slug}" is hidden.`);
      }
    }
  }

  for (const slug of visiblePostSlugs) {
    if (!graphSlugs.has(slug)) {
      errors.push(`[coverage] Visible article "${slug}" is not assigned to a trail.`);
    }
  }

  const relationKeys = new Set<string>();
  for (const relation of relations) {
    const relationLabel = `${relation.from} -> ${relation.to}`;

    if (!RELATION_TYPES.has(relation.type)) {
      errors.push(`[relation:${relationLabel}] Unknown type "${relation.type}".`);
    }
    if (relation.from === relation.to) {
      errors.push(`[relation:${relationLabel}] Self-relations are not allowed.`);
    }
    if (!relation.reason.trim()) {
      errors.push(`[relation:${relationLabel}] Reason cannot be empty.`);
    }

    for (const [endpointName, slug] of [
      ["from", relation.from],
      ["to", relation.to],
    ] as const) {
      const post = postsBySlug.get(slug);
      if (!post) {
        errors.push(
          `[relation:${relationLabel}] ${endpointName} article "${slug}" does not exist.`,
        );
      } else if (post.hidden) {
        errors.push(
          `[relation:${relationLabel}] ${endpointName} article "${slug}" is hidden.`,
        );
      }
      if (!graphSlugs.has(slug)) {
        errors.push(
          `[relation:${relationLabel}] ${endpointName} article "${slug}" is not in a trail.`,
        );
      }
    }

    const relationKey = `${relation.from}->${relation.to}`;
    const reverseRelationKey = `${relation.to}->${relation.from}`;
    const isAssociative =
      relation.type === "related" || relation.type === "reflection";
    if (
      relationKeys.has(relationKey) ||
      (isAssociative && relationKeys.has(reverseRelationKey))
    ) {
      errors.push(`[relation:${relationLabel}] Duplicate relation.`);
    }
    relationKeys.add(relationKey);
  }

  for (const post of posts) {
    if (post.nextReads === undefined) continue;
    if (!Array.isArray(post.nextReads)) {
      errors.push(`[nextReads:${post.slug}] Must be an array.`);
      continue;
    }

    const nextReadSlugs = new Set<string>();
    for (const entry of post.nextReads) {
      const normalized = normalizeRecommendationEntry(entry);
      if (!normalized) {
        errors.push(`[nextReads:${post.slug}] Contains an invalid entry.`);
        continue;
      }
      if (
        typeof entry === "object" &&
        entry !== null &&
        "reason" in entry &&
        (entry as { reason?: unknown }).reason !== undefined &&
        typeof (entry as { reason?: unknown }).reason !== "string"
      ) {
        errors.push(
          `[nextReads:${post.slug}] Reason for "${normalized.slug}" must be a string.`,
        );
      }
      if (normalized.slug === post.slug) {
        errors.push(`[nextReads:${post.slug}] Cannot recommend itself.`);
      }
      if (nextReadSlugs.has(normalized.slug)) {
        errors.push(
          `[nextReads:${post.slug}] Duplicate recommendation "${normalized.slug}".`,
        );
      }
      nextReadSlugs.add(normalized.slug);

      const target = postsBySlug.get(normalized.slug);
      if (!target) {
        errors.push(
          `[nextReads:${post.slug}] Cannot resolve article "${normalized.slug}".`,
        );
      } else if (target.hidden) {
        errors.push(
          `[nextReads:${post.slug}] Article "${normalized.slug}" is hidden.`,
        );
      }
    }
  }

  return { errors, warnings };
}
