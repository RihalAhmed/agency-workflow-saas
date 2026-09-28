import type { RenderedDomResult } from "../types";

/**
 * Uses Playwright (headless Chromium) to render the page, extract the
 * post-JS DOM, and take screenshots at three viewport sizes.
 */
export async function fetchRenderedDom(
  url: string
): Promise<RenderedDomResult> {
  // Dynamic import — Playwright is a devDependency, so we import lazily
  // to avoid breaking builds if it's not installed in prod
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ignoreHTTPSErrors: true,
  });

  try {
    const page = await context.newPage();

    // Desktop viewport (capture rendered HTML from the desktop view)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

    // Wait a bit more for lazy-loaded content
    await page.waitForTimeout(2000);

    const renderedHtml = await page.content();

    // Desktop screenshot
    const desktopBuffer = await page.screenshot({
      fullPage: false,
      type: "png",
    });
    const desktop = `data:image/png;base64,${desktopBuffer.toString("base64")}`;

    // Tablet screenshot (768 × 1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    const tabletBuffer = await page.screenshot({
      fullPage: false,
      type: "png",
    });
    const tablet = `data:image/png;base64,${tabletBuffer.toString("base64")}`;

    // Mobile screenshot (375 × 812)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    const mobileBuffer = await page.screenshot({
      fullPage: false,
      type: "png",
    });
    const mobile = `data:image/png;base64,${mobileBuffer.toString("base64")}`;

    return {
      renderedHtml,
      screenshots: { desktop, tablet, mobile },
    };
  } finally {
    await context.close();
    await browser.close();
  }
}
