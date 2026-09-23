import { describe, it, expect } from "vitest";
import { wcagContrast } from "culori";
import { logoToTokens } from "./index";
import { deriveBrandTokens } from "./derive";
import { ensureContrast } from "./contrast";
import path from "path";

describe("Token Engine", () => {
  it("extracts and derives deterministic brand tokens from logo", async () => {
    const logoPath = path.resolve(process.cwd(), "public/assets/logo.png");
    const tokens1 = await logoToTokens(logoPath);
    const tokens2 = await logoToTokens(logoPath);

    // Determinism
    expect(tokens1).toEqual(tokens2);

    // Schema structure
    expect(tokens1).toHaveProperty("brand");
    expect(tokens1).toHaveProperty("brandFg");
    expect(tokens1).toHaveProperty("accent");
    expect(tokens1).toHaveProperty("accentFg");
    expect(tokens1).toHaveProperty("surface");
    expect(tokens1).toHaveProperty("surfaceAlt");
    expect(tokens1).toHaveProperty("ink");
    expect(tokens1).toHaveProperty("inkMuted");
    expect(tokens1).toHaveProperty("border");

    // Contrast floors
    const brandContrast = wcagContrast(tokens1.brand, tokens1.brandFg);
    expect(brandContrast).toBeGreaterThanOrEqual(4.5);

    const accentContrast = wcagContrast(tokens1.accent, tokens1.accentFg);
    expect(accentContrast).toBeGreaterThanOrEqual(4.5);

    const bodyContrast = wcagContrast(tokens1.surface, tokens1.ink);
    expect(bodyContrast).toBeGreaterThanOrEqual(4.5);
  });

  it("guarantees WCAG 4.5:1 contrast in ensureContrast", () => {
    const darkBg = "#0f172a";
    const lightBg = "#f8fafc";
    const midBg = "#7c3aed";

    const darkRes = ensureContrast(darkBg, 4.5);
    expect(darkRes.contrastRatio).toBeGreaterThanOrEqual(4.5);

    const lightRes = ensureContrast(lightBg, 4.5);
    expect(lightRes.contrastRatio).toBeGreaterThanOrEqual(4.5);

    const midRes = ensureContrast(midBg, 4.5);
    expect(midRes.contrastRatio).toBeGreaterThanOrEqual(4.5);
  });

  it("handles empty candidates gracefully with authorial fallbacks", () => {
    const tokens = deriveBrandTokens([]);
    expect(tokens.brand).toBe("#132152");
    expect(tokens.accent).toBe("#ecbb3e");
    expect(tokens.brandFg).toBe("#ffffff");
  });

  it("applies smart design ideology: light logo yields deep dark brand background and light accent", () => {
    // Light gold / yellow candidate
    const lightCandidates = [
      {
        hex: "#facc15",
        r: 250,
        g: 204,
        b: 21,
        population: 500,
        l: 0.82,
        c: 0.17,
        h: 98,
        score: 85,
      },
    ];

    const tokens = deriveBrandTokens(lightCandidates);
    // Primary was light -> brand background must be deep opposite color meeting 4.5:1 with white
    const brandWhiteContrast = wcagContrast(tokens.brand, "#ffffff");
    expect(brandWhiteContrast).toBeGreaterThanOrEqual(4.5);
    // Accent should preserve the bright logo color
    expect(tokens.accent).toBe("#facc15");
    // Accent foreground must be readable (dark text on light gold)
    const accentContrast = wcagContrast(tokens.accent, tokens.accentFg);
    expect(accentContrast).toBeGreaterThanOrEqual(4.5);
  });
});
