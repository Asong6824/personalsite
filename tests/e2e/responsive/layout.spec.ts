import { expect, test, type Page } from "@playwright/test";
import { responsiveRoutes } from "./routes";

const redirectProjects = new Set([
  "mobile-small",
  "mobile-standard",
  "tablet-portrait",
  "tablet-landscape",
]);

async function settleResponsivePage(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const maximumScroll = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
    );
    const step = Math.max(window.innerHeight * 0.9, 480);
    const positions: number[] = [];

    for (let position = 0; position < maximumScroll; position += step) {
      positions.push(position);
    }

    for (const position of positions.slice(0, 36)) {
      window.scrollTo(0, position);
      await new Promise((resolve) => window.setTimeout(resolve, 20));
    }

    window.scrollTo(0, maximumScroll);
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    window.scrollTo(0, 0);
  });
}

test.describe("responsive route inventory", () => {
  test("contains unique routable pages", () => {
    expect(responsiveRoutes.length).toBeGreaterThanOrEqual(43);
    expect(new Set(responsiveRoutes.map((route) => route.path)).size).toBe(
      responsiveRoutes.length,
    );
  });
});

test.describe("all visual routes", () => {
  for (const route of responsiveRoutes) {
    test(`${route.kind}: ${route.path}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));

      const response = await page.goto(route.path, {
        waitUntil: "domcontentloaded",
      });

      expect(response, "navigation should return a response").not.toBeNull();
      expect(response?.status(), "route should not return an error status").toBeLessThan(
        400,
      );

      if (route.path === "/" && redirectProjects.has(testInfo.project.name)) {
        expect(new URL(page.url()).pathname).toBe("/blog");
      } else {
        expect(new URL(page.url()).pathname).toBe(route.path);
      }

      await expect(page.locator("body")).toBeVisible();
      await page.waitForTimeout(1_000);
      await settleResponsivePage(page);

      const metrics = await page.evaluate(() => {
        const viewportWidth = window.innerWidth;
        const documentWidth = document.documentElement.scrollWidth;
        const brokenImages = Array.from(document.images)
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src)
          .slice(0, 8);
        const invalidCanvases = Array.from(document.querySelectorAll("canvas"))
          .filter((canvas) => {
            const rect = canvas.getBoundingClientRect();
            const style = window.getComputedStyle(canvas);
            return style.display !== "none" && (rect.width < 1 || rect.height < 1);
          })
          .length;
        const uncontainedOverflow = Array.from(
          document.querySelectorAll("a, button, h1, h2, h3, h4, p, li, table, img, svg, canvas"),
        )
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              rect.width < 1 ||
              (rect.left >= -1 && rect.right <= viewportWidth + 1)
            ) {
              return false;
            }

            let ancestor = element.parentElement;
            while (ancestor && ancestor !== document.body) {
              const ancestorStyle = window.getComputedStyle(ancestor);
              if (
                ["auto", "scroll", "hidden", "clip"].includes(ancestorStyle.overflowX) ||
                ancestorStyle.transform !== "none"
              ) {
                return false;
              }
              ancestor = ancestor.parentElement;
            }

            return true;
          })
          .map((element) => ({
            tag: element.tagName.toLowerCase(),
            text: element.textContent?.trim().replace(/\s+/g, " ").slice(0, 100),
          }))
          .slice(0, 8);

        return {
          viewportWidth,
          documentWidth,
          overflow: documentWidth - viewportWidth,
          brokenImages,
          invalidCanvases,
          uncontainedOverflow,
        };
      });

      expect(
        metrics.overflow,
        `document is ${metrics.overflow}px wider than its viewport`,
      ).toBeLessThanOrEqual(1);
      expect(metrics.brokenImages, "all rendered images should load").toEqual([]);
      expect(metrics.invalidCanvases, "visible canvases need stable dimensions").toBe(0);
      expect(
        metrics.uncontainedOverflow,
        "text or media outside the viewport needs wrapping or a local scroll container",
      ).toEqual([]);
      expect(pageErrors, "page should not throw runtime errors").toEqual([]);
      expect(consoleErrors, "page should not emit console errors").toEqual([]);
    });
  }
});
