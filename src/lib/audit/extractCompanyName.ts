import * as cheerio from "cheerio";

export function extractCompanyName(html: string, fallbackUrl: string): string {
  try {
    const $ = cheerio.load(html);
    let companyName = "";

    // 1. Try to find JSON-LD LocalBusiness or Organization schema
    const scripts = $("script[type='application/ld+json']").toArray();
    for (const script of scripts) {
      try {
        const text = $(script).html() || "";
        const json = JSON.parse(text);

        // Can be an array or object
        const items = Array.isArray(json) ? json : [json];
        for (const item of items) {
          if (
            item["@type"] === "LocalBusiness" ||
            item["@type"] === "Organization" ||
            (Array.isArray(item["@type"]) && (item["@type"].includes("LocalBusiness") || item["@type"].includes("Organization")))
          ) {
            if (item.name) {
              return item.name;
            }
          }
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }

    // 2. Try OpenGraph site_name
    const ogSiteName = $("meta[property='og:site_name']").attr("content");
    if (ogSiteName) {
      return ogSiteName.trim();
    }

    // 3. Fallback to Title parsing
    const title = $("title").first().text().trim() || "";
    if (title) {
      // Split by common separators and take the longest or specific part
      const parts = title.split(/[\-\|\:]/);
      if (parts.length > 1) {
        // Assume company name might be the shortest part that isn't too short, or just the first/last
        // A common pattern is "Page Title | Company Name LLC" or "Company Name LLC - Service"
        
        // As a heuristic, we can take the part that looks most like a company name.
        // Actually, let's just return the last part, as it's conventionally the site name.
        // E.g. "Pest Control Services in CT | Nukingstreet Pest & Wildlife Control LLC"
        const lastPart = parts[parts.length - 1].trim();
        const firstPart = parts[0].trim();
        
        // If the first part contains LLC, Inc, etc. it's probably the company
        if (/(LLC|Inc|Corp|Company|Services)/i.test(firstPart)) return firstPart;
        if (/(LLC|Inc|Corp|Company|Services)/i.test(lastPart)) return lastPart;
        
        return lastPart; // Fallback to last part
      }
      return title;
    }

    // 4. Ultimate fallback: format the hostname
    try {
      const urlObj = new URL(fallbackUrl.startsWith("http") ? fallbackUrl : "https://" + fallbackUrl);
      const host = urlObj.hostname.replace(/^www\./, "");
      // simple capitalization
      return host.split(".").slice(0, -1).join(" ")
        .replace(/\b\w/g, c => c.toUpperCase()) || host;
    } catch {
      return fallbackUrl;
    }
  } catch (error) {
    return fallbackUrl; // Safe fallback
  }
}
