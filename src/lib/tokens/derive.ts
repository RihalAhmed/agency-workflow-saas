import { converter, formatHex } from "culori";
import type { BrandTokens } from "../spec/site-spec";
import type { ColorCandidate } from "./extract";
import { ensureContrast } from "./contrast";

const toOklch = converter("oklch");

/**
 * Derives full BrandTokens from extracted logo color candidates.
 */
export function deriveBrandTokens(candidates: ColorCandidate[]): BrandTokens {
  if (candidates.length === 0) {
    return fallbackTokens();
  }

  const primaryCandidate = candidates[0];
  const primaryOklch = toOklch(primaryCandidate.hex) || { mode: "oklch", l: 0.27, c: 0.09, h: 268 };
  const primaryHue = primaryOklch.h ?? 268;

  let rawBrand = "#132152";
  let rawAccent = "#ecbb3e";

  // Smart design ideology:
  // If the extracted logo color is light-colored (OKLCH L >= 0.52):
  // Light colors cannot serve as dark hero/header backgrounds because white text and light elements fail contrast.
  // Therefore, the light logo color is preserved as the accent/highlight color,
  // and the background uses the authoritative darker opposite/complementary color (hue + 180° in OKLCH, deep lightness L ~ 0.24 - 0.28).
  if (primaryOklch.l >= 0.52) {
    // The primary color from the logo is light: keep it as the vibrant accent
    rawAccent = primaryCandidate.hex;

    // Check if the logo also has a darker secondary color we can use directly for the brand background
    const darkSecondary = candidates.find(
      (c) => (toOklch(c.hex)?.l ?? 1) < 0.45 && (toOklch(c.hex)?.c ?? 0) >= 0.02
    );

    if (darkSecondary) {
      const darkOklch = toOklch(darkSecondary.hex);
      const darkL = Math.min(0.38, Math.max(0.18, darkOklch?.l ?? 0.26));
      rawBrand = formatHex({
        mode: "oklch",
        l: darkL,
        c: Math.min(0.18, Math.max(0.04, darkOklch?.c ?? 0.08)),
        h: darkOklch?.h ?? ((primaryHue + 180) % 360),
      }) || darkSecondary.hex;
    } else {
      // Derive an authoritative deep opposite color using complementary hue (+180 deg, OKLCH L ~ 0.25, C ~ 0.09)
      const brandHue = (primaryHue + 180) % 360;
      rawBrand = formatHex({
        mode: "oklch",
        l: 0.25,
        c: 0.09,
        h: brandHue,
      }) || "#132152";
    }
  } else {
    // The logo mark is a darker or deep color: clamp into usable brand band
    const brandLightness = Math.min(0.40, Math.max(0.18, primaryOklch.l));
    const brandChroma = Math.min(0.18, Math.max(0.04, primaryOklch.c));
    rawBrand = formatHex({
      mode: "oklch",
      l: brandLightness,
      c: brandChroma,
      h: primaryHue,
    }) || primaryCandidate.hex;

    // Derive accent: check for strong secondary candidate or rotate hue
    let foundSecondary = false;
    for (let i = 1; i < candidates.length; i++) {
      const cand = candidates[i];
      const candOklch = toOklch(cand.hex);
      if (!candOklch || candOklch.h === undefined) continue;

      const hueDiff = Math.abs(candOklch.h - primaryHue);
      const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);

      if (normalizedDiff >= 30 && candOklch.l >= 0.50 && candOklch.c >= 0.04) {
        const accentL = Math.min(0.85, Math.max(0.65, candOklch.l));
        rawAccent = formatHex({
          mode: "oklch",
          l: accentL,
          c: Math.max(0.12, candOklch.c),
          h: candOklch.h,
        }) || cand.hex;
        foundSecondary = true;
        break;
      }
    }

    if (!foundSecondary) {
      const accentHue = (primaryHue + 160) % 360;
      rawAccent = formatHex({
        mode: "oklch",
        l: 0.78,
        c: 0.15,
        h: accentHue,
      }) || "#ecbb3e";
    }
  }

  // Ensure brand text contrast
  const brandResult = ensureContrast(rawBrand, 4.5);
  const brand = brandResult.bg;
  const brandFg = brandResult.fg;

  // Ensure accent text contrast
  const accentResult = ensureContrast(rawAccent, 4.5);
  const accent = accentResult.bg;
  const accentFg = accentResult.fg;

  // Derive authored neutrals sharing the brand hue
  const surface = formatHex({
    mode: "oklch",
    l: 0.995,
    c: 0.004,
    h: primaryHue,
  }) || "#ffffff";

  const surfaceAlt = formatHex({
    mode: "oklch",
    l: 0.955,
    c: 0.008,
    h: primaryHue,
  }) || "#f3f3f3";

  const ink = formatHex({
    mode: "oklch",
    l: 0.16,
    c: 0.035,
    h: primaryHue,
  }) || "#132152";

  const inkMuted = formatHex({
    mode: "oklch",
    l: 0.44,
    c: 0.02,
    h: primaryHue,
  }) || "#555c70";

  const border = formatHex({
    mode: "oklch",
    l: 0.86,
    c: 0.015,
    h: primaryHue,
  }) || "rgba(19, 33, 82, 0.16)";

  return {
    brand,
    brandFg,
    accent,
    accentFg,
    surface,
    surfaceAlt,
    ink,
    inkMuted,
    border,
  };
}

function fallbackTokens(): BrandTokens {
  return {
    brand: "#132152",
    brandFg: "#ffffff",
    accent: "#ecbb3e",
    accentFg: "#000000",
    surface: "#ffffff",
    surfaceAlt: "#f3f3f3",
    ink: "#132152",
    inkMuted: "#555c70",
    border: "rgba(19, 33, 82, 0.16)",
  };
}
