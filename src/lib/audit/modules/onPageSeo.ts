import * as cheerio from "cheerio";
import type { CheckResult, RawHtmlResult, AuxFilesResult } from "../types";

/**
 * Module 1 — On-Page SEO (20 checks)
 */
export function runOnPageSeoChecks(
  raw: RawHtmlResult,
  aux: AuxFilesResult,
  targetKeyword?: string
): CheckResult[] {
  const $ = cheerio.load(raw.rawHtml);
  const results: CheckResult[] = [];

  // -----------------------------------------------------------------------
  // 1. Title Tag
  // -----------------------------------------------------------------------
  const title = $("title").first().text().trim();
  const titleLen = title.length;
  results.push({
    key: "title_tag",
    label: "Title Tag",
    category: "onPageSeo",
    status: !title
      ? "fail"
      : titleLen < 50 || titleLen > 60
        ? "warning"
        : "pass",
    value: title || null,
    detail: !title
      ? "Missing title tag"
      : `${titleLen} chars (recommended 50–60)`,
    data: { length: titleLen },
  });

  // -----------------------------------------------------------------------
  // 2. Meta Description
  // -----------------------------------------------------------------------
  const metaDesc =
    $('meta[name="description"]').attr("content")?.trim() || "";
  const metaLen = metaDesc.length;
  results.push({
    key: "meta_description",
    label: "Meta Description",
    category: "onPageSeo",
    status: !metaDesc
      ? "fail"
      : metaLen < 120 || metaLen > 160
        ? "warning"
        : "pass",
    value: metaDesc || null,
    detail: !metaDesc
      ? "Missing meta description"
      : `${metaLen} chars (recommended 120–160)`,
    data: { length: metaLen },
  });

  // -----------------------------------------------------------------------
  // 3. SERP Snippet Preview data (rendered in UI, no pass/fail)
  // -----------------------------------------------------------------------
  results.push({
    key: "serp_preview",
    label: "SERP Snippet Preview",
    category: "onPageSeo",
    status: "info",
    detail: "Preview data available",
    data: {
      title: title || "(no title)",
      description: metaDesc || "(no description)",
      url: raw.responseUrl,
    },
  });

  // -----------------------------------------------------------------------
  // 4. Hreflang Usage
  // -----------------------------------------------------------------------
  const hreflangs: string[] = [];
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const val = $(el).attr("hreflang");
    if (val) hreflangs.push(val);
  });
  results.push({
    key: "hreflang",
    label: "Hreflang Tags",
    category: "onPageSeo",
    status: hreflangs.length > 0 ? "pass" : "info",
    value: hreflangs.length,
    detail:
      hreflangs.length > 0
        ? `Found: ${hreflangs.join(", ")}`
        : "No hreflang tags (only needed for multi-region sites)",
    data: { values: hreflangs },
  });

  // -----------------------------------------------------------------------
  // 5. Language Attribute
  // -----------------------------------------------------------------------
  const lang = $("html").attr("lang")?.trim() || "";
  results.push({
    key: "html_lang",
    label: "HTML Language Attribute",
    category: "onPageSeo",
    status: lang ? "pass" : "fail",
    value: lang || null,
    detail: lang ? `lang="${lang}"` : "Missing lang attribute on <html>",
  });

  // -----------------------------------------------------------------------
  // 6. H1 Usage
  // -----------------------------------------------------------------------
  const h1Count = $("h1").length;
  const h1Text = $("h1").first().text().trim();
  results.push({
    key: "h1_usage",
    label: "H1 Tag",
    category: "onPageSeo",
    status: h1Count === 1 ? "pass" : h1Count === 0 ? "fail" : "warning",
    value: h1Count,
    detail:
      h1Count === 1
        ? `"${h1Text.substring(0, 80)}"`
        : h1Count === 0
          ? "No H1 tag found"
          : `${h1Count} H1 tags found (should be exactly 1)`,
    data: { count: h1Count, text: h1Text },
  });

  // -----------------------------------------------------------------------
  // 7. H2–H6 Usage & Frequency
  // -----------------------------------------------------------------------
  const headingCounts: Record<string, number> = {};
  for (let i = 2; i <= 6; i++) {
    headingCounts[`h${i}`] = $(`h${i}`).length;
  }
  results.push({
    key: "heading_frequency",
    label: "Heading Frequency (H2–H6)",
    category: "onPageSeo",
    status: "info",
    detail: Object.entries(headingCounts)
      .map(([tag, count]) => `${tag.toUpperCase()}: ${count}`)
      .join(", "),
    data: headingCounts,
  });

  // -----------------------------------------------------------------------
  // 8. Heading Structure
  // -----------------------------------------------------------------------
  const headingOrder: { level: number; text: string }[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    const tagName = (el as any).tagName?.toLowerCase() || "";
    const level = parseInt(tagName.replace("h", ""), 10);
    if (!isNaN(level)) {
      headingOrder.push({ level, text: $(el).text().trim().substring(0, 60) });
    }
  });

  let structureOk = true;
  let structureIssue = "";
  if (headingOrder.length > 0 && headingOrder[0].level !== 1) {
    structureOk = false;
    structureIssue = `First heading is H${headingOrder[0].level}, should be H1`;
  }
  for (let i = 1; i < headingOrder.length; i++) {
    if (headingOrder[i].level > headingOrder[i - 1].level + 1) {
      structureOk = false;
      structureIssue = `Level skipped: H${headingOrder[i - 1].level} → H${headingOrder[i].level}`;
      break;
    }
  }
  results.push({
    key: "heading_structure",
    label: "Heading Structure",
    category: "onPageSeo",
    status: structureOk ? "pass" : "fail",
    detail: structureOk
      ? "Proper hierarchy"
      : structureIssue,
    data: { headings: headingOrder },
  });

  // -----------------------------------------------------------------------
  // 9. Keyword Consistency
  // -----------------------------------------------------------------------
  const keyword = targetKeyword?.trim() || h1Text;
  if (keyword) {
    const kw = keyword.toLowerCase();
    const countIn = (text: string) => {
      const lower = text.toLowerCase();
      let count = 0;
      let idx = 0;
      while ((idx = lower.indexOf(kw, idx)) !== -1) {
        count++;
        idx += kw.length;
      }
      return count;
    };

    // Get body text stripping script/style/nav/footer
    const bodyClone = $.root().clone();
    bodyClone.find("script, style, nav, footer, header, noscript").remove();
    const bodyText = bodyClone.text();

    const kwData = {
      keyword: keyword,
      inTitle: countIn(title),
      inMetaDescription: countIn(metaDesc),
      inH1: countIn(h1Text),
      inHeadings: countIn(
        headingOrder.map((h) => h.text).join(" ")
      ),
      inBody: countIn(bodyText),
    };
    const total =
      kwData.inTitle +
      kwData.inMetaDescription +
      kwData.inH1 +
      kwData.inHeadings +
      kwData.inBody;

    results.push({
      key: "keyword_consistency",
      label: "Keyword Consistency",
      category: "onPageSeo",
      status: total >= 3 ? "pass" : total >= 1 ? "warning" : "fail",
      value: total,
      detail: `"${keyword}" found ${total} times across page elements`,
      data: kwData,
    });
  } else {
    results.push({
      key: "keyword_consistency",
      label: "Keyword Consistency",
      category: "onPageSeo",
      status: "warning",
      detail: "No H1 text or target keyword available for analysis",
    });
  }

  // -----------------------------------------------------------------------
  // 10. Amount of Content (word count)
  // -----------------------------------------------------------------------
  const contentClone = $.root().clone();
  contentClone
    .find("script, style, nav, footer, header, noscript, svg, [role='navigation']")
    .remove();
  const visibleText = contentClone.text().replace(/\s+/g, " ").trim();
  const wordCount = visibleText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  results.push({
    key: "content_amount",
    label: "Content Amount",
    category: "onPageSeo",
    status: wordCount >= 600 ? "pass" : wordCount >= 300 ? "warning" : "fail",
    value: wordCount,
    detail:
      wordCount < 300
        ? `${wordCount} words — very thin content`
        : wordCount < 600
          ? `${wordCount} words — below recommended 600+`
          : `${wordCount} words`,
  });

  // -----------------------------------------------------------------------
  // 11. Image Alt Attributes
  // -----------------------------------------------------------------------
  const images = $("img");
  const totalImages = images.length;
  let missingAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr("alt");
    if (alt === undefined || alt === null) missingAlt++;
  });
  results.push({
    key: "image_alt",
    label: "Image Alt Attributes",
    category: "onPageSeo",
    status:
      totalImages === 0
        ? "info"
        : missingAlt === 0
          ? "pass"
          : missingAlt <= 2
            ? "warning"
            : "fail",
    value: missingAlt,
    detail:
      totalImages === 0
        ? "No images found"
        : missingAlt === 0
          ? `All ${totalImages} images have alt text`
          : `${missingAlt} of ${totalImages} images missing alt text`,
    data: { total: totalImages, missing: missingAlt },
  });

  // -----------------------------------------------------------------------
  // 12. Canonical Tag
  // -----------------------------------------------------------------------
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() || "";
  results.push({
    key: "canonical_tag",
    label: "Canonical Tag",
    category: "onPageSeo",
    status: canonical ? "pass" : "fail",
    value: canonical || null,
    detail: canonical ? canonical : "Missing canonical tag",
  });

  // -----------------------------------------------------------------------
  // 13. SSL Enabled
  // -----------------------------------------------------------------------
  const isHttps = raw.responseUrl.startsWith("https://");
  results.push({
    key: "ssl_enabled",
    label: "SSL Enabled",
    category: "onPageSeo",
    status: isHttps ? "pass" : "fail",
    value: isHttps,
    detail: isHttps ? "HTTPS connection" : "Not using HTTPS",
  });

  // -----------------------------------------------------------------------
  // 14. HTTPS Redirect (checked async — see orchestrator, marked as info here)
  // We do a simple check here: if the original URL was http, it should have
  // redirected to https. We check the response URL.
  // -----------------------------------------------------------------------
  results.push({
    key: "https_redirect",
    label: "HTTPS Redirect",
    category: "onPageSeo",
    status: isHttps ? "pass" : "warning",
    value: isHttps,
    detail: isHttps
      ? "Site redirects to HTTPS"
      : "HTTP version may not redirect to HTTPS",
  });

  // -----------------------------------------------------------------------
  // 15. Robots.txt
  // -----------------------------------------------------------------------
  results.push({
    key: "robots_txt",
    label: "Robots.txt",
    category: "onPageSeo",
    status: aux.robotsTxt.status === 200 ? "pass" : "fail",
    value: aux.robotsTxt.status === 200,
    detail:
      aux.robotsTxt.status === 200
        ? "Found and accessible"
        : "Not found or inaccessible",
  });

  // -----------------------------------------------------------------------
  // 16. Search Engines Blocked by Robots.txt
  // -----------------------------------------------------------------------
  const majorBots = [
    "googlebot",
    "bingbot",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandexbot",
  ];
  let searchBlocked = false;
  if (aux.robotsTxt.body) {
    const lines = aux.robotsTxt.body.toLowerCase().split("\n");
    let currentAgent = "";
    for (const line of lines) {
      const stripped = line.trim();
      if (stripped.startsWith("user-agent:")) {
        currentAgent = stripped.replace("user-agent:", "").trim();
      } else if (stripped.startsWith("disallow: /") && stripped === "disallow: /") {
        if (
          currentAgent === "*" ||
          majorBots.includes(currentAgent)
        ) {
          searchBlocked = true;
          break;
        }
      }
    }
  }
  results.push({
    key: "robots_blocking",
    label: "Search Engine Access (Robots.txt)",
    category: "onPageSeo",
    status: searchBlocked ? "fail" : "pass",
    value: !searchBlocked,
    detail: searchBlocked
      ? "Robots.txt blocks major search engines!"
      : "No blocking rules for major search engines",
  });

  // -----------------------------------------------------------------------
  // 17. Noindex Meta Tag
  // -----------------------------------------------------------------------
  const robotsMeta =
    $('meta[name="robots"]').attr("content")?.toLowerCase() || "";
  const hasNoindex = robotsMeta.includes("noindex");
  results.push({
    key: "noindex_meta",
    label: "Noindex Meta Tag",
    category: "onPageSeo",
    status: hasNoindex ? "fail" : "pass",
    value: !hasNoindex,
    detail: hasNoindex
      ? "Page has noindex meta tag — will NOT be indexed"
      : "No noindex tag found",
  });

  // -----------------------------------------------------------------------
  // 18. Noindex Header
  // -----------------------------------------------------------------------
  const xRobotsTag = (raw.headers["x-robots-tag"] || "").toLowerCase();
  const headerNoindex = xRobotsTag.includes("noindex");
  results.push({
    key: "noindex_header",
    label: "Noindex Response Header",
    category: "onPageSeo",
    status: headerNoindex ? "fail" : "pass",
    value: !headerNoindex,
    detail: headerNoindex
      ? "X-Robots-Tag header contains noindex"
      : "No noindex header found",
  });

  // -----------------------------------------------------------------------
  // 19. XML Sitemap
  // -----------------------------------------------------------------------
  results.push({
    key: "xml_sitemap",
    label: "XML Sitemap",
    category: "onPageSeo",
    status: aux.sitemap.status === 200 ? "pass" : "fail",
    value: aux.sitemap.status === 200,
    detail:
      aux.sitemap.status === 200
        ? `Found at ${aux.sitemap.url}`
        : "No sitemap.xml or sitemap_index.xml found",
    data: { url: aux.sitemap.url },
  });

  // -----------------------------------------------------------------------
  // 20. Analytics Detection
  // -----------------------------------------------------------------------
  const analyticsPatterns: { name: string; pattern: RegExp }[] = [
    { name: "Google Analytics (gtag)", pattern: /gtag\s*\(/i },
    { name: "Google Analytics (ga.js)", pattern: /google-analytics\.com\/analytics/i },
    { name: "Google Tag Manager", pattern: /googletagmanager\.com/i },
    { name: "Facebook Pixel", pattern: /fbq\s*\(/i },
    { name: "Hotjar", pattern: /hotjar\.com/i },
    { name: "Plausible", pattern: /plausible\.io/i },
    { name: "Mixpanel", pattern: /mixpanel/i },
    { name: "Heap Analytics", pattern: /heap-/i },
    { name: "Amplitude", pattern: /amplitude\.com/i },
  ];
  const detectedAnalytics = analyticsPatterns
    .filter((p) => p.pattern.test(raw.rawHtml))
    .map((p) => p.name);
  results.push({
    key: "analytics",
    label: "Analytics Tools",
    category: "onPageSeo",
    status: detectedAnalytics.length > 0 ? "pass" : "warning",
    value: detectedAnalytics.length,
    detail:
      detectedAnalytics.length > 0
        ? `Detected: ${detectedAnalytics.join(", ")}`
        : "No analytics tools detected",
    data: { tools: detectedAnalytics },
  });

  // -----------------------------------------------------------------------
  // 21. Schema.org Structured Data
  // -----------------------------------------------------------------------
  const schemaTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const extractTypes = (obj: any) => {
        if (obj["@type"]) {
          const types = Array.isArray(obj["@type"])
            ? obj["@type"]
            : [obj["@type"]];
          schemaTypes.push(...types);
        }
        if (obj["@graph"] && Array.isArray(obj["@graph"])) {
          obj["@graph"].forEach(extractTypes);
        }
      };
      extractTypes(json);
    } catch {
      // Invalid JSON — skip
    }
  });
  results.push({
    key: "structured_data",
    label: "Schema.org Structured Data",
    category: "onPageSeo",
    status: schemaTypes.length > 0 ? "pass" : "warning",
    value: schemaTypes.length,
    detail:
      schemaTypes.length > 0
        ? `Types found: ${[...new Set(schemaTypes)].join(", ")}`
        : "No structured data found",
    data: { types: [...new Set(schemaTypes)] },
  });

  return results;
}
