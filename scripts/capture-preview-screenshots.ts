import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function main() {
  const screenshotsDir = path.resolve(process.cwd(), "data/screenshots");
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Screenshot (1440px width matching Figma frame)
  console.log("Capturing desktop (1440px) screenshot...");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto("http://localhost:3000/preview/crown-pest-control", {
    waitUntil: "networkidle",
  });
  await desktopPage.waitForTimeout(1000);

  const desktopPath = path.join(screenshotsDir, "desktop-1440px.png");
  await desktopPage.screenshot({ path: desktopPath, fullPage: true });
  console.log(`Saved desktop screenshot: ${desktopPath}`);
  await desktopContext.close();

  // 1b. Widescreen Desktop Screenshot (1920px width)
  console.log("Capturing widescreen (1920px) screenshot...");
  const wideContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const widePage = await wideContext.newPage();
  await widePage.goto("http://localhost:3000/preview/crown-pest-control", {
    waitUntil: "networkidle",
  });
  await widePage.waitForTimeout(1000);

  const widePath = path.join(screenshotsDir, "widescreen-1920px.png");
  await widePage.screenshot({ path: widePath, fullPage: true });
  console.log(`Saved widescreen screenshot: ${widePath}`);
  await wideContext.close();

  // 2. Mobile Screenshot (390px width - iPhone standard)
  console.log("Capturing mobile (390px) screenshot...");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000/preview/crown-pest-control", {
    waitUntil: "networkidle",
  });
  await mobilePage.waitForTimeout(1000);

  const mobilePath = path.join(screenshotsDir, "mobile-390px.png");
  await mobilePage.screenshot({ path: mobilePath, fullPage: true });
  console.log(`Saved mobile screenshot: ${mobilePath}`);

  // 2b. Mobile Menu Open Screenshot
  try {
    await mobilePage.click('button[aria-label="Open navigation menu"]');
    await mobilePage.waitForTimeout(500);
    const menuPath = path.join(screenshotsDir, "mobile-menu-open.png");
    await mobilePage.screenshot({ path: menuPath });
    console.log(`Saved mobile menu open screenshot: ${menuPath}`);
  } catch (err) {
    console.warn("Could not capture open mobile menu:", err);
  }

  await mobileContext.close();

  await browser.close();
  console.log("All visual check screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
