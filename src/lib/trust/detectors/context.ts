import type * as cheerio from "cheerio";
import type { FaceResult, LayoutMap } from "../types";

export interface DetectorContext {
  $: cheerio.CheerioAPI;
  layout: LayoutMap;
  faces: FaceResult[];
  baseUrl: string;
}

/**
 * Sanitizes an HTML or text snippet for safe storage and presentation
 * (strips scripts, styles, event handlers, and truncates).
 */
export function sanitizeSnippet(snippet?: string): string | undefined {
  if (!snippet) return undefined;
  return snippet
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .trim()
    .slice(0, 300);
}
