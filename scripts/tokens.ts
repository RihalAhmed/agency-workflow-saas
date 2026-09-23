import fs from "fs";
import path from "path";
import { logoToTokens } from "../src/lib/tokens";

async function main() {
  const logoArg = process.argv[2] || "./public/assets/logo.png";
  const logoPath = path.resolve(process.cwd(), logoArg);

  if (!fs.existsSync(logoPath)) {
    console.error(`Error: Logo file not found at ${logoPath}`);
    process.exit(1);
  }

  console.log(`Extracting tokens from ${logoPath}...`);
  const tokens = await logoToTokens(logoPath);

  console.log("\n--- DERIVED BRAND TOKENS ---");
  console.log(JSON.stringify(tokens, null, 2));

  // Generate HTML Swatch Sheet
  const swatchHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Token Swatch Sheet - ${path.basename(logoPath)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #f8fafc; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; max-width: 1000px; margin-top: 1.5rem; }
    .card { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; background: white; }
    .color-block { height: 100px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .info { padding: 1rem; }
    .name { font-size: 0.875rem; font-weight: 600; color: #1e293b; }
    .hex { font-size: 0.875rem; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <h1>Brand Token Swatches</h1>
  <p>Derived from: <code>${logoArg}</code></p>
  <div class="grid">
    <div class="card">
      <div class="color-block" style="background: ${tokens.brand}; color: ${tokens.brandFg};">Aa</div>
      <div class="info"><div class="name">brand</div><div class="hex">${tokens.brand}</div></div>
    </div>
    <div class="card">
      <div class="color-block" style="background: ${tokens.brandFg}; color: ${tokens.brand}; border: 1px solid #ddd;">Aa</div>
      <div class="info"><div class="name">brandFg</div><div class="hex">${tokens.brandFg}</div></div>
    </div>
    <div class="card">
      <div class="color-block" style="background: ${tokens.accent}; color: ${tokens.accentFg};">Aa</div>
      <div class="info"><div class="name">accent</div><div class="hex">${tokens.accent}</div></div>
    </div>
    <div class="card">
      <div class="color-block" style="background: ${tokens.accentFg}; color: ${tokens.accent};">Aa</div>
      <div class="info"><div class="name">accentFg</div><div class="hex">${tokens.accentFg}</div></div>
    </div>
    <div class="card">
      <div class="color-block" style="background: ${tokens.surface}; color: ${tokens.ink}; border: 1px solid #ddd;">Aa</div>
      <div class="info"><div class="name">surface</div><div class="hex">${tokens.surface}</div></div>
    </div>
    <div class="card">
      <div class="color-block" style="background: ${tokens.surfaceAlt}; color: ${tokens.ink};">Aa</div>
      <div class="info"><div class="name">surfaceAlt</div><div class="hex">${tokens.surfaceAlt}</div></div>
    </div>
    <div class="card">
      <div class="color-block" style="background: ${tokens.ink}; color: #ffffff;">Aa</div>
      <div class="info"><div class="name">ink</div><div class="hex">${tokens.ink}</div></div>
    </div>
    <div class="card">
      <div class="color-block" style="background: ${tokens.inkMuted}; color: #ffffff;">Aa</div>
      <div class="info"><div class="name">inkMuted</div><div class="hex">${tokens.inkMuted}</div></div>
    </div>
    <div class="card">
      <div class="color-block" style="background: ${tokens.border}; color: ${tokens.ink};">Aa</div>
      <div class="info"><div class="name">border</div><div class="hex">${tokens.border}</div></div>
    </div>
  </div>
</body>
</html>`;

  const swatchFile = path.resolve(process.cwd(), "data/swatch-sheet.html");
  fs.writeFileSync(swatchFile, swatchHtml, "utf8");
  console.log(`\nSwatch sheet generated at: ${swatchFile}`);
}

main().catch((err) => {
  console.error("Token generation failed:", err);
  process.exit(1);
});
