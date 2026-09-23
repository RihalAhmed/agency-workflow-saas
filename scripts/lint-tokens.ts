import fs from "fs";
import path from "path";

const TEMPLATES_DIR = path.resolve(process.cwd(), "src/templates");

if (!fs.existsSync(TEMPLATES_DIR)) {
  console.log("No src/templates directory found yet. Skipping token lint.");
  process.exit(0);
}

const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g;
const RGB_REGEX = /\b(rgb|rgba|hsl|hsla)\s*\(/g;
const TW_COLOR_REGEX = /\b(bg|text|border|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/g;

let violations = 0;

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      return;
    }

    const hexMatches = line.match(HEX_REGEX);
    if (hexMatches) {
      console.error(`[TOKEN VIOLATION] Hex color found at ${path.relative(process.cwd(), filePath)}:${idx + 1}: ${hexMatches.join(", ")}`);
      violations++;
    }

    const rgbMatches = line.match(RGB_REGEX);
    if (rgbMatches) {
      console.error(`[TOKEN VIOLATION] Literal rgb/hsl found at ${path.relative(process.cwd(), filePath)}:${idx + 1}: ${rgbMatches.join(", ")}`);
      violations++;
    }

    const twMatches = line.match(TW_COLOR_REGEX);
    if (twMatches) {
      console.error(`[TOKEN VIOLATION] Tailwind color utility found at ${path.relative(process.cwd(), filePath)}:${idx + 1}: ${twMatches.join(", ")}`);
      violations++;
    }
  });
}

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (file.endsWith(".tsx") || (file.endsWith(".ts") && !file.includes("config"))) {
      checkFile(full);
    }
  }
}

walk(TEMPLATES_DIR);

if (violations > 0) {
  console.error(`\nFound ${violations} token rule violation(s) under src/templates/!`);
  console.error("Templates must only use design tokens: var(--brand), var(--accent), bg-brand, text-ink, etc.");
  process.exit(1);
} else {
  console.log("Token lint passed: 0 literal colors found in src/templates/.");
}
