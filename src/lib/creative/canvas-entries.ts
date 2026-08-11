import {
  createCreativeCanvasLayout,
  stableCreativeHash,
  type CreativeCanvasSize,
  type CreativeCanvasTone,
} from "./canvas-layout";

export type CreativeCardLevel = "xl" | "large" | "medium" | "small";
export type CreativeEntryKind = "column" | "article" | "gallery";

export const CREATIVE_CARD_SIZES: Readonly<Record<CreativeCardLevel | "unit", CreativeCanvasSize>> = {
  xl: { columns: 5, rows: 3 },
  large: { columns: 4, rows: 2 },
  medium: { columns: 3, rows: 2 },
  small: { columns: 2, rows: 1 },
  unit: { columns: 1, rows: 1 },
};

export interface CreativeSizingEntry {
  id: string;
  kind: CreativeEntryKind;
  group: string;
  title: string;
  description: string;
  image: string;
  date?: string;
  featured?: boolean;
}

export interface CreativeCardQuotas {
  xl: number;
  large: number;
  medium: number;
  small: number;
}

export interface CreativeSizedEntry<T extends CreativeSizingEntry> {
  entry: T;
  level: CreativeCardLevel;
  size: CreativeCanvasSize;
  matchScore: number;
}

const TONES: readonly CreativeCanvasTone[] = [
  "image",
  "light",
  "dark",
  "accent",
  "neutral",
] as const;

const LEVELS: readonly CreativeCardLevel[] = ["xl", "large", "medium", "small"];

/**
 * Selects a balanced atomic-size inventory before content is assigned. The
 * search minimizes the 4-row canvas remainder first, then keeps the intended
 * editorial ratio. It never creates a size variant within one level.
 */
export function calculateCreativeCardQuotas(
  entryCount: number,
  featuredCount = 0,
): CreativeCardQuotas {
  if (entryCount <= 0) {
    return { xl: 0, large: 0, medium: 0, small: 0 };
  }

  const minimumXl = Math.min(entryCount, featuredCount);
  const maximumXl = Math.min(entryCount, Math.max(minimumXl, Math.ceil(entryCount / 8)));
  const minimumLarge = entryCount >= 4 ? 1 : 0;
  const minimumMedium = entryCount >= 6 ? 2 : entryCount >= 3 ? 1 : 0;
  const minimumSmall = entryCount >= 4 ? 1 : 0;
  let best: {
    quotas: CreativeCardQuotas;
    filler: number;
    columns: number;
    ratioPenalty: number;
  } | null = null;

  for (let xl = minimumXl; xl <= maximumXl; xl += 1) {
    for (let large = minimumLarge; large <= entryCount - xl; large += 1) {
      for (let medium = minimumMedium; medium <= entryCount - xl - large; medium += 1) {
        const small = entryCount - xl - large - medium;
        if (small < minimumSmall) continue;

        const quotas = { xl, large, medium, small };
        const quotaItems = [
          {
            id: "quota-intro",
            sizes: [{ columns: 5, rows: 2 }],
            anchor: { column: 0, row: 0 },
          },
          ...LEVELS.flatMap((level) => Array.from({ length: quotas[level] }, (_, index) => ({
            id: `quota-${level}-${index}`,
            sizes: [{ ...CREATIVE_CARD_SIZES[level] }],
          }))),
        ];
        const packed = createCreativeCanvasLayout(quotaItems, {
          fillEmpty: true,
          fillerIdPrefix: "quota-unit",
          seed: "creative-quota-v1",
        });
        const filler = packed.placements.filter((item) => item.id.startsWith("quota-unit-")).length;
        const ratioPenalty = (
          Math.abs(xl / entryCount - 0.12) * 28
          + Math.abs(large / entryCount - 0.2) * 20
          + Math.abs(medium / entryCount - 0.3) * 16
        );

        if (
          !best
          || filler < best.filler
          || (filler === best.filler && packed.columns < best.columns)
          || (
            filler === best.filler
            && packed.columns === best.columns
            && ratioPenalty < best.ratioPenalty
          )
        ) {
          best = { quotas, filler, columns: packed.columns, ratioPenalty };
        }
      }
    }
  }

  return best?.quotas ?? { xl: 0, large: 0, medium: 0, small: entryCount };
}

function dateScore(date?: string) {
  if (!date) return 0;
  const year = Number(date.slice(0, 4));
  if (!Number.isFinite(year)) return 0;
  return Math.max(0, Math.min(6, year - 2020));
}

function suitabilityScore<T extends CreativeSizingEntry>(
  entry: T,
  level: CreativeCardLevel,
  selected: CreativeSizedEntry<T>[],
) {
  const titleLength = Array.from(entry.title).length;
  const hasImage = Boolean(entry.image);
  const sameGroupCount = selected.filter((item) => item.entry.group === entry.group).length;
  const sameKindCount = selected.filter((item) => item.entry.kind === entry.kind).length;
  let score = dateScore(entry.date) - sameGroupCount * 7 - sameKindCount * 1.5;

  if (entry.featured) {
    score += level === "xl" ? 500 : -240;
  }

  if (hasImage) {
    score += { xl: 24, large: 16, medium: 9, small: 1 }[level];
  }

  if (titleLength >= 24) {
    score += { xl: 14, large: 18, medium: 8, small: -28 }[level];
  } else if (titleLength <= 13) {
    score += { xl: 2, large: 4, medium: 8, small: 16 }[level];
  } else {
    score += { xl: 7, large: 11, medium: 12, small: 5 }[level];
  }

  if (entry.description) {
    score += { xl: 8, large: 7, medium: 4, small: -2 }[level];
  }

  score += (stableCreativeHash(`match:${level}:${entry.id}`) % 1000) / 1000;
  return score;
}

/**
 * Geometry owns the number of slots; content competes for those slots. Kind is
 * deliberately not mapped to a size, so a column, article, or image can win
 * any content-card level.
 */
export function assignCreativeCardLevels<T extends CreativeSizingEntry>(
  entries: T[],
): CreativeSizedEntry<T>[] {
  const quotas = calculateCreativeCardQuotas(
    entries.length,
    entries.filter((entry) => entry.featured).length,
  );
  const slots = LEVELS.flatMap((level) => Array.from({ length: quotas[level] }, () => level));
  const remaining = entries.slice();
  const selected: CreativeSizedEntry<T>[] = [];

  for (const level of slots) {
    const ranked = remaining
      .map((entry) => ({ entry, score: suitabilityScore(entry, level, selected) }))
      .sort((left, right) => right.score - left.score);
    const winner = ranked[0];
    if (!winner) break;

    selected.push({
      entry: winner.entry,
      level,
      size: { ...CREATIVE_CARD_SIZES[level] },
      matchScore: winner.score,
    });
    remaining.splice(remaining.findIndex((entry) => entry.id === winner.entry.id), 1);
  }

  return selected;
}

export function creativeEntryTone(id: string): CreativeCanvasTone {
  return TONES[stableCreativeHash(`tone:${id}`) % TONES.length];
}

export function creativeEntryVariant(id: string) {
  return stableCreativeHash(`variant:${id}`) % 6;
}
