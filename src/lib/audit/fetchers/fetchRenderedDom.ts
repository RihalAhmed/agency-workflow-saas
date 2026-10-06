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

  try {
    // 1. Create contexts in parallel with device-specific settings
    const [desktopCtx, tabletCtx, mobileCtx] = await Promise.all([
      browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ignoreHTTPSErrors: true,
      }),
      browser.newContext({
        viewport: { width: 768, height: 1024 },
        userAgent: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
        isMobile: true,
        hasTouch: true,
        ignoreHTTPSErrors: true,
      }),
      browser.newContext({
        viewport: { width: 375, height: 812 },
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
        isMobile: true,
        hasTouch: true,
        ignoreHTTPSErrors: true,
      }),
    ]);

    // 2. Open pages
    const desktopPage = await desktopCtx.newPage();
    const tabletPage = await tabletCtx.newPage();
    const mobilePage = await mobileCtx.newPage();

    // 3. Navigate in parallel
    await Promise.allSettled([
      desktopPage.goto(url, { waitUntil: "networkidle", timeout: 30_000 }),
      tabletPage.goto(url, { waitUntil: "networkidle", timeout: 30_000 }),
      mobilePage.goto(url, { waitUntil: "networkidle", timeout: 30_000 })
    ]);

    // Wait a bit more for animations/lazy-loaded content
    await new Promise(r => setTimeout(r, 2000));

    // 4. Capture rendered HTML (from desktop)
    const renderedHtml = await desktopPage.content();

    // 5. Take screenshots in parallel
    const [desktopBuffer, tabletBuffer, mobileBuffer] = await Promise.all([
      desktopPage.screenshot({ fullPage: false, type: "jpeg", quality: 80 }),
      tabletPage.screenshot({ fullPage: false, type: "jpeg", quality: 80 }),
      mobilePage.screenshot({ fullPage: false, type: "jpeg", quality: 80 })
    ]);

    const desktop = `data:image/jpeg;base64,${desktopBuffer.toString("base64")}`;
    const tablet = `data:image/jpeg;base64,${tabletBuffer.toString("base64")}`;
    const mobile = `data:image/jpeg;base64,${mobileBuffer.toString("base64")}`;

    return {
      renderedHtml,
      screenshots: { desktop, tablet, mobile },
    };
  } finally {
    await browser.close();
  }
}
