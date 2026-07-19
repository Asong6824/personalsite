import { defineConfig, devices } from "@playwright/test";

const mobileUserAgent = devices["iPhone 13"].userAgent;
const tabletUserAgent = devices["iPad (gen 7)"].userAgent;
const desktopUserAgent = devices["Desktop Chrome"].userAgent;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results/playwright",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 1,
  workers: 2,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100",
    colorScheme: "light",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "mobile-small",
      use: {
        browserName: "chromium",
        viewport: { width: 320, height: 568 },
        userAgent: mobileUserAgent,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "mobile-standard",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        userAgent: mobileUserAgent,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "tablet-portrait",
      use: {
        browserName: "chromium",
        viewport: { width: 768, height: 1024 },
        userAgent: tabletUserAgent,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "tablet-landscape",
      use: {
        browserName: "chromium",
        viewport: { width: 1024, height: 768 },
        userAgent: tabletUserAgent,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: "desktop-standard",
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
        userAgent: desktopUserAgent,
      },
    },
    {
      name: "desktop-wide",
      use: {
        browserName: "chromium",
        viewport: { width: 1920, height: 1080 },
        userAgent: desktopUserAgent,
      },
    },
  ],
  webServer: {
    command:
      process.env.PLAYWRIGHT_USE_PRODUCTION === "1"
        ? "npm run start -- --hostname localhost --port 3100"
        : "npm run dev -- --hostname localhost --port 3100",
    url: "http://localhost:3100/blog",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
