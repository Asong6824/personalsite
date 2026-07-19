import { expect, test } from "@playwright/test";

const boundaryWidths = [
  479, 480, 481,
  639, 640, 641,
  767, 768, 769,
  1023, 1024, 1025,
  1279, 1280, 1281,
  1535, 1536, 1537,
];

const representativeRoutes = [
  "/blog",
  "/blog/tech",
  "/blog/life/japan",
  "/blog/finance/finance",
  "/blog/tech/ai-engineering/agent-tool",
  "/blog/life/japan/stamps",
  "/dev/datasets-demo",
];

test.describe("responsive breakpoint boundaries", () => {
  for (const route of representativeRoutes) {
    test(route, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop-standard");
      test.setTimeout(120_000);

      await page.goto(route, { waitUntil: "domcontentloaded" });
      for (const width of boundaryWidths) {
        await page.setViewportSize({
          width,
          height: width < 768 ? 844 : 900,
        });
        await page.waitForTimeout(100);

        const dimensions = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
        }));
        expect(
          dimensions.document,
          `${route} overflows at the ${width}px boundary`,
        ).toBeLessThanOrEqual(dimensions.viewport + 1);
      }
    });
  }
});
