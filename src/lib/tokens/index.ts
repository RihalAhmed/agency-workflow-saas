import type { BrandTokens } from "../spec/site-spec";
import { extractPalette } from "./extract";
import { deriveBrandTokens } from "./derive";

/**
 * logoToTokens: The single public entry point for extracting and deriving BrandTokens from a logo.
 */
export async function logoToTokens(imagePath: string): Promise<BrandTokens> {
  const candidates = await extractPalette(imagePath);
  return deriveBrandTokens(candidates);
}

export * from "./extract";
export * from "./derive";
export * from "./contrast";
