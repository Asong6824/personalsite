import type { NextReadConfig } from "@/types";

export function normalizeRecommendationEntry(
  entry: unknown,
): NextReadConfig | null {
  if (typeof entry === "string") {
    const slug = entry.trim().replace(/^\/?blog\//, "").replace(/^\/+/, "");
    return slug ? { slug } : null;
  }

  if (entry && typeof entry === "object" && "slug" in entry) {
    const slugValue = (entry as { slug?: unknown }).slug;
    if (typeof slugValue !== "string") return null;

    const slug = slugValue
      .trim()
      .replace(/^\/?blog\//, "")
      .replace(/^\/+/, "");
    if (!slug) return null;

    const reasonValue = (entry as { reason?: unknown }).reason;
    const reason =
      typeof reasonValue === "string" && reasonValue.trim()
        ? reasonValue.trim()
        : undefined;

    return { slug, reason };
  }

  return null;
}
