import { describe, expect, it, vi, beforeEach } from "vitest";

const mockSummaries = new Map<string, Record<string, unknown>>();

vi.mock("@/lib/post", () => ({
  getPostSummary: (slug: string) => mockSummaries.get(slug) ?? null,
}));

import { getArticleRecommendations } from "../recommendations";

describe("getArticleRecommendations", () => {
  beforeEach(() => {
    mockSummaries.clear();
  });

  it("resolves string and object nextReads entries from full article slugs", () => {
    mockSummaries.set("tech/ai-engineering/pi-agent", {
      title: "Pi Agent",
      date: "2026-07-11",
      excerpt: "AI engineering note",
      channel: "tech",
      column: "ai-engineering",
    });
    mockSummaries.set("creative/product/notion-zen", {
      title: "Notion 与禅与我",
      brief: "Product reflection",
      channel: "creative",
      column: "product",
    });

    const recommendations = getArticleRecommendations(
      {
        title: "Current",
        date: "2026-07-11",
        nextReads: [
          "/blog/tech/ai-engineering/pi-agent",
          {
            slug: "creative/product/notion-zen",
            reason: "从产品体验角度延伸阅读",
          },
        ],
      },
      "tech/general/current"
    );

    expect(recommendations).toEqual([
      expect.objectContaining({
        slug: "tech/ai-engineering/pi-agent",
        title: "Pi Agent",
        excerpt: "AI engineering note",
      }),
      expect.objectContaining({
        slug: "creative/product/notion-zen",
        title: "Notion 与禅与我",
        excerpt: "Product reflection",
        reason: "从产品体验角度延伸阅读",
      }),
    ]);
  });

  it("skips the current article, duplicates, hidden posts, and missing slugs", () => {
    mockSummaries.set("tech/general/valid", {
      title: "Valid",
      date: "2026-07-11",
    });
    mockSummaries.set("tech/general/hidden", {
      title: "Hidden",
      hidden: true,
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const recommendations = getArticleRecommendations(
      {
        title: "Current",
        date: "2026-07-11",
        nextReads: [
          "tech/general/current",
          "tech/general/valid",
          "tech/general/valid",
          "tech/general/hidden",
          "tech/general/missing",
        ],
      },
      "tech/general/current"
    );

    expect(recommendations).toEqual([
      expect.objectContaining({
        slug: "tech/general/valid",
        title: "Valid",
      }),
    ]);
    expect(warnSpy).toHaveBeenCalledTimes(2);

    warnSpy.mockRestore();
  });

  it("uses editorial entries first and fills the remaining slots from the content graph", () => {
    mockSummaries.set("tech/ai-engineering/pi-agent", {
      title: "Pi Agent",
    });
    mockSummaries.set("tech/ai-engineering/from-rag-technique-to-rag-philosophy", {
      title: "RAG Philosophy",
    });
    mockSummaries.set("tech/general/ios-cloud-platform-guide", {
      title: "iOS Cloud Platform",
    });
    mockSummaries.set("tech/ai-engineering/harness-engineering", {
      title: "Harness Engineering",
    });

    const recommendations = getArticleRecommendations(
      {
        title: "Agent Tool",
        date: "2026-07-11",
        nextReads: [
          {
            slug: "tech/ai-engineering/pi-agent",
            reason: "编辑优先推荐",
          },
        ],
      },
      "tech/ai-engineering/agent-tool",
    );

    expect(recommendations).toHaveLength(3);
    expect(recommendations.map((recommendation) => recommendation.slug)).toEqual([
      "tech/ai-engineering/pi-agent",
      "tech/ai-engineering/from-rag-technique-to-rag-philosophy",
      "tech/general/ios-cloud-platform-guide",
    ]);
    expect(recommendations[0].reason).toBe("编辑优先推荐");
    expect(recommendations[1].reason).toMatch(/工具调用解决行动问题/);
  });
});
