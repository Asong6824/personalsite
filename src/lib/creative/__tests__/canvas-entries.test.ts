import { describe, expect, it } from "vitest";
import {
  CREATIVE_GALLERY_ITEMS,
  getCreativeGalleryItems,
} from "@/data/creative-gallery";
import {
  CREATIVE_CARD_SIZES,
  assignCreativeCardLevels,
  calculateCreativeCardQuotas,
  creativeEntryTone,
  creativeEntryVariant,
  type CreativeSizingEntry,
} from "../canvas-entries";

const sampleEntries: CreativeSizingEntry[] = Array.from({ length: 13 }, (_, index) => ({
  id: index === 0 ? "gallery-3d-print" : `entry-${index}`,
  kind: (["gallery", "column", "article"] as const)[index % 3],
  group: `group-${index % 4}`,
  title: index % 3 === 0 ? "一个长度更长的内容标题，用来测试卡片匹配" : `标题 ${index}`,
  description: index % 2 === 0 ? "用于尺寸匹配的内容摘要。" : "",
  image: index % 2 === 0 ? `/image-${index}.png` : "",
  date: `202${index % 6}-01-01`,
  featured: index === 0,
}));

describe("creative canvas entry sizing", () => {
  it("defines one atomic horizontal size for every level", () => {
    expect(CREATIVE_CARD_SIZES).toEqual({
      xl: { columns: 5, rows: 3 },
      large: { columns: 4, rows: 2 },
      medium: { columns: 3, rows: 2 },
      small: { columns: 2, rows: 1 },
      unit: { columns: 1, rows: 1 },
    });
    expect(Object.values(CREATIVE_CARD_SIZES)).not.toContainEqual({ columns: 1, rows: 2 });
  });

  it("creates a complete size quota and assigns content deterministically", () => {
    const quotas = calculateCreativeCardQuotas(sampleEntries.length, 1);
    const first = assignCreativeCardLevels(sampleEntries);
    const second = assignCreativeCardLevels(sampleEntries);

    expect(Object.values(quotas).reduce((total, count) => total + count, 0)).toBe(sampleEntries.length);
    expect(second).toEqual(first);
    expect(first).toHaveLength(sampleEntries.length);
    expect(first.find((item) => item.entry.featured)?.level).toBe("xl");
    expect(new Set(first.map((item) => item.level)).size).toBe(4);
    for (const item of first) {
      expect(item.size).toEqual(CREATIVE_CARD_SIZES[item.level]);
    }
  });

  it("keeps visual variants stable without using them to choose size", () => {
    const ids = Array.from({ length: 24 }, (_, index) => `entry-${index}`);
    const first = ids.map((id) => ({ tone: creativeEntryTone(id), variant: creativeEntryVariant(id) }));
    const second = ids.map((id) => ({ tone: creativeEntryTone(id), variant: creativeEntryVariant(id) }));

    expect(second).toEqual(first);
    expect(new Set(first.map((item) => item.tone)).size).toBeGreaterThan(3);
    expect(new Set(first.map((item) => item.variant)).size).toBeGreaterThan(3);
  });

  it("keeps eight homepage objects but exposes only 3D printing to the channel", () => {
    expect(CREATIVE_GALLERY_ITEMS).toHaveLength(8);
    expect(getCreativeGalleryItems("home")).toHaveLength(8);
    expect(getCreativeGalleryItems("creative").map((item) => item.id)).toEqual(["3d-print"]);
  });
});
