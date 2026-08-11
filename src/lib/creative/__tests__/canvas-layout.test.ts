import { describe, expect, it } from "vitest";
import {
  createCreativeCanvasLayout,
  creativePlacementsOverlap,
  type CreativeCanvasLayoutItem,
} from "../canvas-layout";

const anchoredItems: CreativeCanvasLayoutItem[] = [
  {
    id: "intro",
    sizes: [{ columns: 5, rows: 2 }],
    anchor: { column: 0, row: 0 },
    priority: 100,
  },
  {
    id: "design",
    sizes: [{ columns: 5, rows: 3 }],
    anchor: { column: 5, row: 0 },
    tone: "dark",
    priority: 90,
  },
  {
    id: "notes",
    sizes: [{ columns: 3, rows: 2 }],
    anchor: { column: 0, row: 2 },
    tone: "image",
    priority: 80,
  },
];

function expectNoOverlap(items: ReturnType<typeof createCreativeCanvasLayout>["placements"]) {
  for (let left = 0; left < items.length; left += 1) {
    for (let right = left + 1; right < items.length; right += 1) {
      expect(creativePlacementsOverlap(items[left], items[right])).toBe(false);
    }
  }
}

describe("createCreativeCanvasLayout", () => {
  it("keeps valid editorial anchors stable", () => {
    const layout = createCreativeCanvasLayout(anchoredItems);

    expect(layout.byId.intro).toMatchObject({ column: 0, row: 0, columns: 5, rows: 2 });
    expect(layout.byId.design).toMatchObject({ column: 5, row: 0, columns: 5, rows: 3 });
    expect(layout.byId.notes).toMatchObject({ column: 0, row: 2, columns: 3, rows: 2 });
    expectNoOverlap(layout.placements);
  });

  it("keeps a dense mixed-level canvas collision-free", () => {
    const mixedItems: CreativeCanvasLayoutItem[] = [
      { id: "intro", sizes: [{ columns: 5, rows: 2 }], anchor: { column: 0, row: 0 }, priority: 100 },
      ...Array.from({ length: 18 }, (_, index) => ({
        id: ["column", "article", "gallery"][index % 3] + `-${index}`,
        sizes: index % 3 === 0
          ? [{ columns: 5, rows: 3 }]
          : index % 3 === 1
            ? [{ columns: 2, rows: 1 }]
            : [{ columns: 3, rows: 2 }],
        tone: ["dark", "light", "image"][index % 3] as "dark" | "light" | "image",
        priority: 20,
        order: index * 17,
      })),
    ];
    const layout = createCreativeCanvasLayout(mixedItems, {
      seed: "mixed-levels",
      fillEmpty: true,
      fillerIdPrefix: "unit",
    });

    expect(layout.columns).toBeGreaterThan(15);
    expect(layout.placements.length).toBeGreaterThanOrEqual(mixedItems.length);
    expect(new Set(layout.placements.map((item) => `${item.columns}x${item.rows}`)).size).toBeGreaterThan(2);
    expect(layout.placements.reduce((area, item) => area + item.columns * item.rows, 0)).toBe(
      layout.columns * layout.rows,
    );
    expect(
      layout.placements
        .filter((item) => item.id.startsWith("unit-"))
        .every((item) => item.columns === 1 && item.rows === 1),
    ).toBe(true);
    expect(layout.placements.some((item) => item.id.startsWith("unit-"))).toBe(true);
    expectNoOverlap(layout.placements);
  });

  it("returns the same layout for the same content and seed", () => {
    const items = [
      ...anchoredItems,
      ...Array.from({ length: 8 }, (_, index) => ({
        id: `article-${index}`,
        sizes: [
          { columns: 3, rows: 2 },
          { columns: 2, rows: 1 },
        ],
        tone: index % 2 === 0 ? "light" as const : "accent" as const,
        order: index,
      })),
    ];

    const first = createCreativeCanvasLayout(items, { seed: "stable-test" });
    const second = createCreativeCanvasLayout(items, { seed: "stable-test" });

    expect(second).toEqual(first);
  });

  it("grows the canvas in fixed column steps as content increases", () => {
    const items: CreativeCanvasLayoutItem[] = [
      ...anchoredItems,
      ...Array.from({ length: 24 }, (_, index) => ({
        id: `growing-${index}`,
        sizes: [{ columns: 3, rows: 2 }],
        tone: "light" as const,
        order: index,
      })),
    ];

    const layout = createCreativeCanvasLayout(items, {
      minColumns: 15,
      columnStep: 5,
    });

    expect(layout.columns).toBeGreaterThan(15);
    expect(layout.columns % 5).toBe(0);
    expect(layout.placements).toHaveLength(items.length);
    expectNoOverlap(layout.placements);
  });

  it("moves a conflicting anchor to the nearest valid scored position", () => {
    const layout = createCreativeCanvasLayout([
      {
        id: "first",
        sizes: [{ columns: 4, rows: 2 }],
        anchor: { column: 0, row: 0 },
        priority: 10,
      },
      {
        id: "conflict",
        sizes: [{ columns: 4, rows: 2 }],
        anchor: { column: 0, row: 0 },
        priority: 1,
      },
    ]);

    expect(layout.byId.first).toMatchObject({ column: 0, row: 0 });
    expect(layout.byId.conflict).not.toMatchObject({ column: 0, row: 0 });
    expectNoOverlap(layout.placements);
  });

  it("ignores invalid size variants without dropping a valid item", () => {
    const layout = createCreativeCanvasLayout([
      {
        id: "mixed-sizes",
        sizes: [
          { columns: 2, rows: 5 },
          { columns: 2, rows: 1 },
          { columns: 2, rows: 1 },
        ],
      },
    ]);

    expect(layout.placements).toHaveLength(1);
    expect(layout.byId["mixed-sizes"]).toMatchObject({ columns: 2, rows: 1 });
  });
});
