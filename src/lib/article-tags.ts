export const MAX_RECOMMENDED_ARTICLE_TAGS = 5;

export const DEPRECATED_ARTICLE_TAGS: Readonly<Record<string, string>> = {
  tech: "技术",
  "智能体": "Agent",
  skill: "Skill",
  "Design Principles": "设计原则",
};

export interface ArticleTagsValidationResult {
  errors: string[];
  warnings: string[];
}

export function validateArticleTags(tags: unknown): ArticleTagsValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(tags)) {
    return { errors: ["tags must be a non-empty string array"], warnings };
  }

  const normalizedTags: string[] = [];
  for (const [index, value] of tags.entries()) {
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`tag at index ${index} must be a non-empty string`);
      continue;
    }

    const normalized = value.trim();
    if (normalized !== value) {
      errors.push(`tag '${value}' contains leading or trailing whitespace`);
    }
    normalizedTags.push(normalized);
  }

  if (normalizedTags.length === 0) {
    errors.push("at least one tag is required");
  }

  const seen = new Set<string>();
  for (const tag of normalizedTags) {
    const key = tag.toLocaleLowerCase();
    if (seen.has(key)) {
      errors.push(`duplicate tag '${tag}'`);
    }
    seen.add(key);

    const replacement = DEPRECATED_ARTICLE_TAGS[tag];
    if (replacement) {
      errors.push(`deprecated tag '${tag}', use '${replacement}' instead`);
    }
  }

  if (normalizedTags.length > MAX_RECOMMENDED_ARTICLE_TAGS) {
    warnings.push(
      `${normalizedTags.length} tags found; prefer no more than ${MAX_RECOMMENDED_ARTICLE_TAGS}`
    );
  }

  return { errors, warnings };
}
