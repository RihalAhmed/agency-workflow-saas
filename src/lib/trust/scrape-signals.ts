import * as cheerio from "cheerio";

export type ScrapeResult = Record<string, { found: boolean; url?: string }>;

/**
 * Pure extractor: scans a parsed Cheerio DOM for outbound trust links and JSON-LD local business profiles.
 * Used directly by the trust reviews & badges detector without network requests.
 */
export function extractTrustLinksFromDom($: cheerio.CheerioAPI): ScrapeResult {
  const result: ScrapeResult = {
    google: { found: false },
    yelp: { found: false },
    bbb: { found: false },
    yellowpages: { found: false },
    facebook: { found: false },
  };

  // 1. Scan outbound links
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.toLowerCase() || "";

    if (
      !result.google.found &&
      (href.includes("google.com/maps") ||
        href.includes("g.page/") ||
        href.includes("search.google.com/local") ||
        href.includes("maps.google.com"))
    ) {
      result.google = { found: true, url: href };
    }
    if (!result.yelp.found && href.includes("yelp.com/biz/")) {
      result.yelp = { found: true, url: href };
    }
    if (!result.bbb.found && href.includes("bbb.org/")) {
      result.bbb = { found: true, url: href };
    }
    if (!result.yellowpages.found && href.includes("yellowpages.com/")) {
      result.yellowpages = { found: true, url: href };
    }
    if (!result.facebook.found && (href.includes("facebook.com/") || href.includes("fb.com/"))) {
      // Exclude generic share links
      if (!href.includes("/sharer") && !href.includes("/share") && !href.includes("dialog/share")) {
        result.facebook = { found: true, url: href };
      }
    }
  });

  // 2. Scan JSON-LD blocks
  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const text = $(el).html() || "";
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];

      for (const item of items) {
        if (
          item["@type"] &&
          (item["@type"] === "LocalBusiness" ||
            (typeof item["@type"] === "string" && item["@type"].includes("Business")) ||
            item["@type"] === "Organization")
        ) {
          if (item.sameAs) {
            const sameAs = Array.isArray(item.sameAs) ? item.sameAs : [item.sameAs];
            for (const link of sameAs) {
              const href = String(link).toLowerCase();
              if (
                !result.google.found &&
                (href.includes("google.com/maps") || href.includes("g.page/"))
              ) {
                result.google = { found: true, url: href };
              }
              if (!result.yelp.found && href.includes("yelp.com/biz/")) {
                result.yelp = { found: true, url: href };
              }
              if (!result.bbb.found && href.includes("bbb.org/")) {
                result.bbb = { found: true, url: href };
              }
              if (!result.yellowpages.found && href.includes("yellowpages.com/")) {
                result.yellowpages = { found: true, url: href };
              }
              if (
                !result.facebook.found &&
                (href.includes("facebook.com/") || href.includes("fb.com/"))
              ) {
                result.facebook = { found: true, url: href };
              }
            }
          }
        }
      }
    } catch {
      // Ignore JSON parse errors in specific blocks
    }
  });

  return result;
}

/**
 * Scrapes a prospect's website for trust signals (fetches URL and runs extractor).
 */
export async function scrapeTrustSignals(websiteUrl: string): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    google: { found: false },
    yelp: { found: false },
    bbb: { found: false },
    yellowpages: { found: false },
    facebook: { found: false },
  };

  if (!websiteUrl) {
    return result;
  }

  try {
    let url = websiteUrl;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.statusText}`);
      return result;
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    return extractTrustLinksFromDom($);
  } catch (error) {
    console.error("Error scraping trust signals:", error);
    return result;
  }
}
