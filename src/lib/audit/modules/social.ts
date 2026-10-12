import * as cheerio from "cheerio";
import type { CheckResult, RawHtmlResult } from "../types";

/**
 * Module 4 — Social
 */
export function runSocialChecks(raw: RawHtmlResult): CheckResult[] {
  const $ = cheerio.load(raw.rawHtml);
  const results: CheckResult[] = [];

  // -----------------------------------------------------------------------
  // 1. Social Profile Links
  // -----------------------------------------------------------------------
  const socialPatterns: { name: string; pattern: RegExp }[] = [
    { name: "Facebook", pattern: /facebook\.com\//i },
    { name: "Instagram", pattern: /instagram\.com\//i },
    { name: "X (Twitter)", pattern: /(?:twitter\.com|x\.com)\//i },
    { name: "LinkedIn", pattern: /linkedin\.com\//i },
    { name: "YouTube", pattern: /youtube\.com\//i },
    { name: "TikTok", pattern: /tiktok\.com\//i },
    { name: "Pinterest", pattern: /pinterest\.com\//i },
  ];

  const detectedSocials: { name: string; url: string }[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    for (const sp of socialPatterns) {
      if (sp.pattern.test(href)) {
        // Avoid duplicates per platform
        if (!detectedSocials.find((d) => d.name === sp.name)) {
          detectedSocials.push({ name: sp.name, url: href });
        }
      }
    }
  });

  results.push({
    key: "social_links",
    label: "Social Media Links",
    category: "social",
    status: detectedSocials.length >= 2 ? "pass" : detectedSocials.length === 1 ? "warning" : "fail",
    value: detectedSocials.length,
    detail:
      detectedSocials.length > 0
        ? `Found: ${detectedSocials.map((s) => s.name).join(", ")}`
        : "No social media links found on the page",
    data: { profiles: detectedSocials },
  });

  // -----------------------------------------------------------------------
  // 2. Open Graph Tags
  // -----------------------------------------------------------------------
  const ogTags: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr("property") || "";
    const content = $(el).attr("content") || "";
    ogTags[prop] = content;
  });

  const essentialOg = ["og:title", "og:description", "og:image", "og:url"];
  const missingOg = essentialOg.filter((tag) => !ogTags[tag]);
  results.push({
    key: "open_graph",
    label: "Facebook Open Graph Tags",
    category: "social",
    status:
      missingOg.length === 0
        ? "pass"
        : missingOg.length <= 2
          ? "warning"
          : "fail",
    value: Object.keys(ogTags).length,
    detail:
      missingOg.length === 0
        ? `All essential OG tags present (${Object.keys(ogTags).length} total)`
        : `Missing: ${missingOg.join(", ")}`,
    data: { tags: ogTags, missing: missingOg },
  });

  // -----------------------------------------------------------------------
  // 3. X (Twitter) Cards
  // -----------------------------------------------------------------------
  const twitterTags: Record<string, string> = {};
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr("name") || "";
    const content = $(el).attr("content") || "";
    twitterTags[name] = content;
  });

  const hasTwitterCard = !!twitterTags["twitter:card"];
  results.push({
    key: "twitter_cards",
    label: "X (Twitter) Cards",
    category: "social",
    status: hasTwitterCard ? "pass" : "fail",
    value: Object.keys(twitterTags).length,
    detail: hasTwitterCard
      ? `Card type: ${twitterTags["twitter:card"]} (${Object.keys(twitterTags).length} tags)`
      : "No Twitter card meta tags found",
    data: { tags: twitterTags },
  });

  // -----------------------------------------------------------------------
  // 4. Facebook Pixel
  // -----------------------------------------------------------------------
  const hasFbPixel = /fbq\s*\(/i.test(raw.rawHtml);
  results.push({
    key: "facebook_pixel",
    label: "Facebook Pixel",
    category: "social",
    status: hasFbPixel ? "pass" : "info",
    value: hasFbPixel,
    detail: hasFbPixel
      ? "Facebook Pixel detected"
      : "No Facebook Pixel found",
  });

  return results;
}
