import { describe, expect, it } from "vitest";

import { bookshelfBooks, getBookshelfOpenHref } from "@/data/bookshelf-books";
import {
  getTravelSketchbookVolume,
  travelSketchbookVolumes,
} from "@/data/travel-sketchbook";

describe("travel library configuration", () => {
  it("keeps volume and page identifiers unique with a valid default spread", () => {
    const volumeIds = travelSketchbookVolumes.map((volume) => volume.id);
    expect(new Set(volumeIds).size).toBe(volumeIds.length);

    for (const volume of travelSketchbookVolumes) {
      const pageIds = volume.pages.map((page) => page.id);
      expect(volume.id).not.toBe("");
      expect(volume.pages.length).toBeGreaterThan(0);
      expect(new Set(pageIds).size).toBe(pageIds.length);
      expect(pageIds).toContain(volume.defaultPageId);
    }
  });

  it("resolves every sketchbook shelf target to a registered volume and spread", () => {
    const sketchbookBooks = bookshelfBooks.filter(
      (book) => book.open.type === "sketchbook",
    );

    expect(sketchbookBooks.length).toBeGreaterThan(0);

    for (const book of sketchbookBooks) {
      if (book.open.type !== "sketchbook") continue;
      const openTarget = book.open;

      const volume = getTravelSketchbookVolume(openTarget.sketchbookId);
      expect(volume, `${book.id} references a missing sketchbook volume`).toBeDefined();
      expect(getBookshelfOpenHref(book)).toContain(
        `/blog/life/sketchbook/${encodeURIComponent(openTarget.sketchbookId)}`,
      );

      if (openTarget.initialSpreadId) {
        expect(
          volume?.pages.some((page) => page.id === openTarget.initialSpreadId),
          `${book.id} references a missing initial spread`,
        ).toBe(true);
      }
    }
  });
});
