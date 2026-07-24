import { expect, test } from "@playwright/test";
import { marketStudyRoutes } from "./routes";

const focusedProjects = new Set([
  "mobile-standard",
  "desktop-standard",
]);
const mobileInteractionProjects = new Set(["mobile-standard"]);

test("desktop home renders a sized WebGL scene", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-standard");

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect
    .poll(async () => page.locator("canvas").count(), { timeout: 30_000 })
    .toBeGreaterThan(0);

  const dimensions = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("canvas")).map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
  });

  expect(
    dimensions.some(({ width, height }) => width > 100 && height > 100),
  ).toBe(true);
});

test("station stamp canvas controls remain usable", async ({ page }, testInfo) => {
  test.skip(!focusedProjects.has(testInfo.project.name));

  await page.goto("/blog/life/japan/stamps", {
    waitUntil: "domcontentloaded",
  });

  const controls = page.getByRole("group", { name: "画布缩放" });
  await expect(controls).toBeVisible({ timeout: 20_000 });

  const percentage = page.getByRole("button", { name: "恢复百分之百缩放" });
  const zoomIn = page.getByRole("button", { name: "放大画布" });
  const before = await percentage.innerText();
  await zoomIn.click();
  await expect(percentage).not.toHaveText(before);

  const regionMode = page.getByRole("button", { name: "地域", exact: true });
  await regionMode.click();
  await expect(regionMode).toBeVisible();
});

test("dataset chart keeps its canvas inside the viewport", async ({ page }, testInfo) => {
  test.skip(!focusedProjects.has(testInfo.project.name));

  await page.goto("/dev/datasets-demo", { waitUntil: "domcontentloaded" });
  await expect
    .poll(async () => page.locator("canvas").count(), { timeout: 20_000 })
    .toBeGreaterThan(0);

  const bounds = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("canvas")).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        viewportWidth: window.innerWidth,
      };
    });
  });

  for (const canvas of bounds) {
    expect(canvas.left).toBeGreaterThanOrEqual(0);
    expect(canvas.right).toBeLessThanOrEqual(canvas.viewportWidth + 1);
  }
});

test("published market study chart switches views without overflow", async ({ page }, testInfo) => {
  test.skip(!focusedProjects.has(testInfo.project.name));
  test.skip(marketStudyRoutes.length === 0, "No published market study is configured");

  await page.goto(marketStudyRoutes[0].path, { waitUntil: "domcontentloaded" });
  const chart = page.getByTestId("market-study-chart");
  await expect(chart).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => chart.locator("canvas").count()).toBeGreaterThan(0);

  const drawdown = page.getByRole("button", { name: "回撤", exact: true });
  await drawdown.click();
  await expect(drawdown).toHaveAttribute("aria-pressed", "true");

  const bounds = await chart.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, viewportWidth: window.innerWidth };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth + 1);
});

test("mobile navigation opens without changing page width", async ({ page }, testInfo) => {
  test.skip(!mobileInteractionProjects.has(testInfo.project.name));

  await page.goto("/blog", { waitUntil: "domcontentloaded" });
  const menuButton = page.getByRole("button", { name: "Open main menu" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  const menu = page.locator("#mobile-menu");
  await expect(menu).toBeVisible();
  const widths = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);

  await menuButton.click();
  await expect(menu).toBeHidden();
});

test("article recommendations combine editorial and graph relationships", async ({ page }, testInfo) => {
  test.skip(!focusedProjects.has(testInfo.project.name));

  await page.goto("/blog/creative/product/obsidian-future-note-making", {
    waitUntil: "domcontentloaded",
  });

  const recommendations = page.getByRole("region", { name: "接下来阅读" });
  await expect(recommendations).toBeVisible();

  const links = recommendations.getByRole("link");
  await expect(links).toHaveCount(2);
  await expect(links.first()).toHaveAttribute(
    "href",
    "/blog/creative/product/notion-zen",
  );
  await expect(
    recommendations.getByRole("link", { name: /从 RAG 技术到 RAG 思想/ }),
  ).toBeVisible();
});
