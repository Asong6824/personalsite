import { describe, expect, it } from "vitest";

import type {
  ContentGraphRelation,
  ContentGraphTrail,
} from "@/data/content-graph";
import { getContentGraphRecommendationCandidates } from "../content-graph";

const trails: ContentGraphTrail[] = [
  {
    id: "primary",
    name: "主脉络",
    label: "起点 · 中段 · 终点",
    description: "Test trail",
    articles: ["start", "middle", "end"],
  },
];

const relations: ContentGraphRelation[] = [
  {
    from: "middle",
    to: "end",
    type: "sequence",
    reason: "继续到终点",
  },
  {
    from: "related",
    to: "middle",
    type: "related",
    reason: "双向相关",
  },
  {
    from: "applied",
    to: "middle",
    type: "applied-in",
    reason: "反向的应用关系",
  },
];

describe("getContentGraphRecommendationCandidates", () => {
  it("prioritizes outgoing directional relations, then associative relations, then trail neighbors", () => {
    const candidates = getContentGraphRecommendationCandidates(
      "middle",
      trails,
      relations,
    );

    expect(candidates.map((candidate) => candidate.slug)).toEqual([
      "end",
      "related",
      "start",
    ]);
    expect(candidates[0]).toMatchObject({
      source: "sequence",
      reason: "继续到终点",
    });
  });

  it("does not reverse directional relations", () => {
    const candidates = getContentGraphRecommendationCandidates(
      "middle",
      [],
      relations,
    );

    expect(candidates.map((candidate) => candidate.slug)).not.toContain("applied");
  });
});
