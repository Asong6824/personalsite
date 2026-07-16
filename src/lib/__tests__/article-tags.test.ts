import { describe, expect, it } from "vitest";
import {
  MAX_RECOMMENDED_ARTICLE_TAGS,
  validateArticleTags,
} from "../article-tags";

describe("validateArticleTags", () => {
  it("accepts focused article tags", () => {
    const result = validateArticleTags(["AI", "Agent", "RAG"]);

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("rejects missing and empty tags", () => {
    expect(validateArticleTags(undefined).errors).not.toHaveLength(0);
    expect(validateArticleTags([]).errors).toContain("at least one tag is required");
    expect(validateArticleTags([""]).errors).not.toHaveLength(0);
  });

  it("rejects duplicate and deprecated tags", () => {
    const result = validateArticleTags(["Agent", "agent", "智能体"]);

    expect(result.errors.some((error) => error.includes("duplicate tag"))).toBe(true);
    expect(result.errors.some((error) => error.includes("use 'Agent'"))).toBe(true);
  });

  it("warns when tags become unfocused", () => {
    const tags = Array.from(
      { length: MAX_RECOMMENDED_ARTICLE_TAGS + 1 },
      (_, index) => `tag-${index}`
    );

    expect(validateArticleTags(tags).warnings).toHaveLength(1);
  });
});
