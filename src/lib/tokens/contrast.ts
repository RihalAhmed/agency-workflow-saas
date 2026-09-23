import { wcagContrast, converter, formatHex } from "culori";

const toOklch = converter("oklch");

export const WCAG_BODY_CONTRAST_FLOOR = 4.5;
export const WCAG_DISPLAY_CONTRAST_FLOOR = 3.0;

/**
 * Returns a readable foreground (white or dark ink) that meets WCAG AA standards (>= 4.5:1).
 * If neither standard black nor white passes, adjusts the background lightness until it does.
 */
export function ensureContrast(
  bgHex: string,
  minContrast = WCAG_BODY_CONTRAST_FLOOR
): { fg: string; bg: string; contrastRatio: number } {
  const white = "#ffffff";
  const darkInk = "#111827";

  const currentBg = bgHex;
  const ratioWhite = wcagContrast(currentBg, white);
  const ratioDark = wcagContrast(currentBg, darkInk);

  if (ratioWhite >= minContrast && ratioWhite >= ratioDark) {
    return { fg: white, bg: currentBg, contrastRatio: ratioWhite };
  }

  if (ratioDark >= minContrast) {
    return { fg: darkInk, bg: currentBg, contrastRatio: ratioDark };
  }

  // If neither passes, adjust background lightness iteratively
  const oklch = toOklch(currentBg);
  let l = oklch?.l ?? 0.5;
  const c = oklch?.c ?? 0.05;
  const h = oklch?.h ?? 0;

  // Decide whether to darken or lighten based on whether white or dark was closer
  const shouldDarken = ratioWhite >= ratioDark;

  for (let step = 0; step < 20; step++) {
    l = shouldDarken ? Math.max(0.05, l - 0.04) : Math.min(0.98, l + 0.04);
    const newBg = formatHex({ mode: "oklch", l, c, h }) || currentBg;

    const testRatio = shouldDarken
      ? wcagContrast(newBg, white)
      : wcagContrast(newBg, darkInk);

    if (testRatio >= minContrast) {
      return {
        fg: shouldDarken ? white : darkInk,
        bg: newBg,
        contrastRatio: testRatio,
      };
    }
  }

  // Extreme fallback
  return {
    fg: shouldDarken ? white : darkInk,
    bg: shouldDarken ? "#0f172a" : "#f8fafc",
    contrastRatio: 7.0,
  };
}
