const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const cheerio = require("cheerio");

const BADGES_DIR = path.join(process.cwd(), "public/assets/badges");

async function main() {
  const files = fs.readdirSync(BADGES_DIR).filter((f: string) => f.endsWith(".svg"));
  if (files.length === 0) {
    console.log("No SVGs found in", BADGES_DIR);
    return;
  }

  console.log(`Found ${files.length} badges to normalize.`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const file of files) {
    const filePath = path.join(BADGES_DIR, file);
    const rawSvg = fs.readFileSync(filePath, "utf8");

    // Load SVG into headless browser to get its true visual bounding box
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; overflow:hidden;">
        ${rawSvg}
      </body>
      </html>
    `);

    const bbox = await page.evaluate(() => {
      const svg = document.querySelector("svg");
      if (!svg) return null;
      // getBBox returns the exact bounding box of the drawn SVG contents
      const box = svg.getBBox();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    });

    if (!bbox) {
      console.warn(`Could not calculate bbox for ${file}`);
      continue;
    }

    if (bbox.width === 0 || bbox.height === 0) {
      console.warn(`Skipping ${file}: empty bounding box (${bbox.width}x${bbox.height})`);
      continue;
    }

    // Add 8% uniform padding on all sides relative to the max dimension
    const maxDim = Math.max(bbox.width, bbox.height);
    const padding = maxDim * 0.08;

    const newX = bbox.x - padding;
    const newY = bbox.y - padding;
    const newWidth = bbox.width + padding * 2;
    const newHeight = bbox.height + padding * 2;

    const newViewBox = `${newX} ${newY} ${newWidth} ${newHeight}`;
    console.log(`${file}: updated viewBox to "${newViewBox}"`);

    // Rewrite the SVG file using cheerio
    const $ = cheerio.load(rawSvg, {
      xmlMode: true,
      decodeEntities: false,
    });

    const $svg = $("svg").first();
    $svg.attr("viewBox", newViewBox);
    // Remove fixed width/height attributes so it flows properly in containers
    $svg.removeAttr("width");
    $svg.removeAttr("height");

    fs.writeFileSync(filePath, $.xml(), "utf8");
  }

  await browser.close();
  console.log("Normalization complete.");
}

main().catch((err) => {
  console.error("Error normalizing SVGs:", err);
  process.exit(1);
});
