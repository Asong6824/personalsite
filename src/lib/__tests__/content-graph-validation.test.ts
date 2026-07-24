import { describe, expect, it } from "vitest";

import type {
  ContentGraphRelation,
  ContentGraphTrail,
} from "@/data/content-graph";
import { validateContentGraph } from "../content-graph-validation";

const validTrails: ContentGraphTrail[] = [
  {
    id: "trail",
    name: "阅读脉络",
    label: "A · B",
    description: "Test trail",
    articles: ["a", "b"],
  },
];

const validRelations: ContentGraphRelation[] = [
  {
    from: "a",
    to: "b",
    type: "sequence",
    reason: "从 A 继续阅读 B",
  },
];

describe("validateContentGraph", () => {
  it("accepts a complete graph and valid editorial recommendations", () => {
    const result = validateContentGraph(validTrails, validRelations, [
      { slug: "a", nextReads: ["/blog/b"] },
      { slug: "b" },
    ]);

    expect(result).toEqual({ errors: [], warnings: [] });
  });

  it("reports graph drift and invalid recommendation references", () => {
    const result = validateContentGraph(
      [
        ...validTrails,
        {
          ...validTrails[0],
          articles: ["a", "missing", "a"],
        },
      ],
      [
        ...validRelations,
        validRelations[0],
        {
          from: "b",
          to: "a",
          type: "related",
          reason: "反向重复的双向关系",
        },
        {
          from: "a",
          to: "a",
          type: "related",
          reason: "",
        },
      ],
      [
        {
          slug: "a",
          nextReads: ["a", "missing", "missing"],
        },
        { slug: "b" },
        { slug: "outside" },
      ],
    );

    expect(result.errors.join("\n")).toMatch(/Duplicate trail id/);
    expect(result.errors.join("\n")).toMatch(/Cannot resolve article "missing"/);
    expect(result.errors.join("\n")).toMatch(/Visible article "outside"/);
    expect(result.errors.join("\n")).toMatch(/Duplicate relation/);
    expect(result.errors.join("\n")).toMatch(/Self-relations/);
    expect(result.errors.join("\n")).toMatch(/Cannot recommend itself/);
    expect(result.errors.join("\n")).toMatch(/Duplicate recommendation/);
  });
});
