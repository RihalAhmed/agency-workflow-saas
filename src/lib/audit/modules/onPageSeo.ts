import * as cheerio from "cheerio";
import type { CheckResult, RawHtmlResult, AuxFilesResult, RenderedDomResult } from "../types";
import { ONPAGE_CONFIG } from "./onpage.config";

// --- HELPERS ---
function cleanText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function charLength(s: string): number {
  return Array.from(s).length;
}

function normalizeUrl(u: string, base: string): string {
  try {
    const url = new URL(u, base);
    url.hash = "";
    if (url.port === "80" || url.port === "443") url.port = "";
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return `${url.protocol.toLowerCase()}//${url.host.toLowerCase()}${url.pathname}${url.search}`;
  } catch {
    return u;
  }
}

function hostKey(u: string, base: string): string {
  try {
    const host = new URL(u, base).hostname.toLowerCase();
    return host.startsWith("www.") ? host.substring(4) : host;
  } catch {
    return "";
  }
}

function getWordpressState(html: string): boolean {
  return html.includes("/wp-content/") || html.includes("/wp-includes/") || /<meta name="generator" content="WordPress/i.test(html);
}

// --- CONTEXT ---
interface AuditContext {
  requestedUrl: string;
  finalUrl: string;
  statusCode: number;
  responseHeaders: Record<string, string>;
  rawHtml: string;
  $: cheerio.CheerioAPI;
  source: string;
  isWordPress: boolean;
}

// --- CHECKS ---

function runIndexability(ctx: AuditContext): CheckResult {
  const metaRobots = ctx.$('meta[name="robots" i]').attr("content") || "not set";
  const metaGooglebot = ctx.$('meta[name="googlebot" i]').attr("content") || "not set";
  const xRobots = ctx.responseHeaders["x-robots-tag"] || "not available";

  const isNoindex = (s: string) => {
    const tokens = s.toLowerCase().split(",").map(t => t.trim());
    return tokens.includes("noindex") || tokens.includes("none");
  };
  const isNofollow = (s: string) => {
    const tokens = s.toLowerCase().split(",").map(t => t.trim());
    return tokens.includes("nofollow") || tokens.includes("none");
  };

  const parseXRobots = (header: string) => {
    if (header === "not available" || header === "not set") return { noi: false, nof: false };
    const parts = header.split(",");
    let noi = false;
    let nof = false;
    for (const part of parts) {
      const p = part.trim().toLowerCase();
      if (p.includes(":")) {
         const agent = p.split(":")[0].trim();
         if (agent !== "googlebot") continue;
      }
      if (p.includes("noindex") || p.includes("none")) noi = true;
      if (p.includes("nofollow") || p.includes("none")) nof = true;
    }
    return { noi, nof };
  };

  const xParsed = parseXRobots(xRobots);
  const noindexFound = isNoindex(metaRobots) || isNoindex(metaGooglebot) || xParsed.noi;
  const nofollowFound = isNofollow(metaRobots) || isNofollow(metaGooglebot) || xParsed.nof;

  let status: any = "pass";
  let gap: string | undefined;

  if (noindexFound) {
    status = "fail";
    const sources = [];
    if (isNoindex(metaRobots) || isNoindex(metaGooglebot)) sources.push("meta robots tag");
    if (xParsed.noi) sources.push("X-Robots-Tag header");
    if (sources.length === 2) gap = "noindex found in both";
    else gap = `noindex found in ${sources.join(" | ")}`;
  } else if (nofollowFound) {
    status = "warning";
    gap = "nofollow instruction found";
  }

  return {
    key: "indexability",
    label: "Indexability",
    category: "onPageSeo",
    status,
    detail: noindexFound ? "Page is blocked from indexing" : nofollowFound ? "Page is indexed but links are not followed" : "Page can be indexed and followed",
    evidence: {
      source: ctx.source,
      rule: "no noindex or nofollow instruction",
      gap,
      rows: [
        { label: "Meta robots", value: metaRobots },
        { label: "Googlebot meta", value: metaGooglebot },
        { label: "X-Robots-Tag header", value: xRobots },
        { label: "Page can be indexed", value: !noindexFound ? "Yes" : "No" },
        { label: "Page links can be followed", value: !nofollowFound ? "Yes" : "No" },
      ]
    },
    data: { isWordPress: ctx.isWordPress }
  };
}

function runCanonical(ctx: AuditContext): CheckResult {
  const tags = ctx.$('link[rel~="canonical" i]');
  const n = tags.length;
  let href = "";
  if (n > 0) {
    href = tags.first().attr("href")?.trim() || "";
  }
  
  const resolved = href ? normalizeUrl(href, ctx.finalUrl) : "none";
  const audited = normalizeUrl(ctx.finalUrl, ctx.finalUrl);
  
  let conflict = false;
  if (n > 1) {
    const firstResolved = resolved;
    tags.each((_, el) => {
      const h = ctx.$(el).attr("href")?.trim();
      if (h && normalizeUrl(h, ctx.finalUrl) !== firstResolved) conflict = true;
    });
  }

  let status: any = "pass";
  let gap: string | undefined;
  let summary = "";

  if (n === 0 || !href) {
    status = "warning";
    summary = "No canonical tag found";
    gap = "No canonical tag found";
  } else if (conflict) {
    status = "warning";
    summary = `${n} canonical tags point to different URLs`;
    gap = summary;
  } else if (resolved !== audited) {
    status = "warning";
    summary = "Canonical points to a different URL";
    try {
      const rUrl = new URL(resolved);
      const aUrl = new URL(audited);
      if (rUrl.protocol !== aUrl.protocol) {
        gap = "uses http:// while the page is https://";
      } else if (rUrl.host !== aUrl.host) {
        gap = "uses a different www/non-www host";
      } else {
        gap = "points to a different page";
      }
    } catch {
      gap = "points to a different page";
    }
  } else {
    summary = "Canonical tag is set correctly";
  }

  return {
    key: "canonical",
    label: "Canonical Tag",
    category: "onPageSeo",
    status,
    detail: summary,
    evidence: {
      source: ctx.source,
      rule: "one canonical tag pointing to this page's own URL",
      gap,
      rows: [
        { label: "Canonical tags found", value: n },
        { label: "Canonical URL", value: resolved },
        { label: "Audited URL", value: audited },
        { label: "Matches audited URL", value: resolved === audited ? "Yes" : "No" },
      ]
    },
    data: { isWordPress: ctx.isWordPress }
  };
}

function runTitle(ctx: AuditContext): CheckResult {
  const titles = ctx.$("head > title");
  const n = titles.length;
  const text = n > 0 ? cleanText(titles.first().text()) : "";
  const length = charLength(text);
  
  let status: any = "pass";
  let gap: string | undefined;
  let summary = "";

  if (n === 0 || !text) {
    status = "fail";
    summary = "No title tag found";
    gap = n === 0 ? "No title tag" : "Title is empty";
  } else if (n > 1) {
    status = "warning";
    summary = `${n} title tags found; only the first is counted`;
    gap = summary;
  } else if (length < ONPAGE_CONFIG.TITLE_MIN) {
    status = "warning";
    summary = `${length} chars (recommended ${ONPAGE_CONFIG.TITLE_MIN}-${ONPAGE_CONFIG.TITLE_MAX})`;
    gap = `${ONPAGE_CONFIG.TITLE_MIN - length} characters below the ${ONPAGE_CONFIG.TITLE_MIN} minimum`;
  } else if (length > ONPAGE_CONFIG.TITLE_MAX) {
    status = "warning";
    summary = `${length} chars (recommended ${ONPAGE_CONFIG.TITLE_MIN}-${ONPAGE_CONFIG.TITLE_MAX})`;
    gap = `${length - ONPAGE_CONFIG.TITLE_MAX} characters above the ${ONPAGE_CONFIG.TITLE_MAX} maximum; may be cut off in results`;
  } else {
    summary = `${length} chars (recommended ${ONPAGE_CONFIG.TITLE_MIN}-${ONPAGE_CONFIG.TITLE_MAX})`;
  }

  return {
    key: "title_tag",
    label: "Title Tag",
    category: "onPageSeo",
    status,
    detail: summary,
    evidence: {
      source: ctx.source,
      rule: `${ONPAGE_CONFIG.TITLE_MIN}-${ONPAGE_CONFIG.TITLE_MAX} characters`,
      gap,
      rows: [
        { label: "Title", value: text || "(empty)" },
        { label: "Length", value: `${length} characters` },
        { label: "Recommended", value: `${ONPAGE_CONFIG.TITLE_MIN}-${ONPAGE_CONFIG.TITLE_MAX} characters` },
        { label: "Title tags found", value: n },
      ]
    },
    data: { isWordPress: ctx.isWordPress, serpPreview: true, url: ctx.finalUrl }
  };
}

function runMetaDescription(ctx: AuditContext): CheckResult {
  const tags = ctx.$('head meta[name="description" i]');
  const n = tags.length;
  const text = n > 0 ? cleanText(tags.first().attr("content") || "") : "";
  const length = charLength(text);
  
  let status: any = "pass";
  let gap: string | undefined;
  let summary = "";

  if (n === 0 || !text) {
    status = "warning";
    summary = "No meta description found";
    gap = "No meta description";
  } else if (n > 1) {
    status = "warning";
    summary = `${n} meta description tags found; only the first is counted`;
    gap = summary;
  } else if (length < ONPAGE_CONFIG.META_MIN) {
    status = "warning";
    summary = `${length} chars (recommended ${ONPAGE_CONFIG.META_MIN}-${ONPAGE_CONFIG.META_MAX})`;
    gap = `${ONPAGE_CONFIG.META_MIN - length} characters below the ${ONPAGE_CONFIG.META_MIN} minimum`;
  } else if (length > ONPAGE_CONFIG.META_MAX) {
    status = "warning";
    summary = `${length} chars (recommended ${ONPAGE_CONFIG.META_MIN}-${ONPAGE_CONFIG.META_MAX})`;
    gap = `${length - ONPAGE_CONFIG.META_MAX} characters above the ${ONPAGE_CONFIG.META_MAX} maximum; may be shortened in results`;
  } else {
    summary = `${length} chars (recommended ${ONPAGE_CONFIG.META_MIN}-${ONPAGE_CONFIG.META_MAX})`;
  }

  return {
    key: "meta_description",
    label: "Meta Description",
    category: "onPageSeo",
    status,
    detail: summary,
    evidence: {
      source: ctx.source,
      rule: `${ONPAGE_CONFIG.META_MIN}-${ONPAGE_CONFIG.META_MAX} characters`,
      gap,
      rows: [
        { label: "Description", value: text || "(empty)" },
        { label: "Length", value: `${length} characters` },
        { label: "Recommended", value: `${ONPAGE_CONFIG.META_MIN}-${ONPAGE_CONFIG.META_MAX} characters` },
        { label: "Meta description tags found", value: n },
      ]
    },
    data: { isWordPress: ctx.isWordPress, serpPreview: true, url: ctx.finalUrl }
  };
}

function runH1(ctx: AuditContext): CheckResult {
  const h1s = ctx.$("body h1");
  const n = h1s.length;
  
  const items: any[] = [];
  h1s.each((_, el) => {
    let text = cleanText(ctx.$(el).text());
    if (!text) {
      const img = ctx.$(el).find("img").first();
      if (img.length) text = cleanText(img.attr("alt") || "");
    }
    items.push({ label: text || "(empty H1)" });
  });

  const nonEmpty = items.filter(i => i.label !== "(empty H1)").length;

  let status: any = "pass";
  let gap: string | undefined;
  let summary = "";

  if (nonEmpty === 0) {
    status = "fail";
    summary = n === 0 ? "No H1 found" : "H1 is empty";
    gap = summary;
  } else if (n >= 2) {
    status = "warning";
    summary = `${n} H1 tags found; use one`;
    gap = summary;
  } else {
    summary = `1 H1 tag found`;
  }

  return {
    key: "h1_usage",
    label: "H1 Tag",
    category: "onPageSeo",
    status,
    detail: summary,
    evidence: {
      source: ctx.source,
      rule: "exactly one H1",
      gap,
      rows: [{ label: "H1 tags found", value: n }],
      items
    },
    data: { isWordPress: ctx.isWordPress }
  };
}

function runHeadings(ctx: AuditContext): CheckResult {
  const headings = ctx.$("body h1, body h2, body h3, body h4, body h5, body h6");
  
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const order: { level: number; text: string }[] = [];
  
  headings.each((_, el) => {
    const text = cleanText(ctx.$(el).text());
    if (text) {
      const tagName = (el as any).tagName?.toLowerCase() || "";
      const level = parseInt(tagName.replace("h", ""), 10);
      counts[level]++;
      order.push({ level, text: text.substring(0, 80) });
    }
  });

  const skips: any[] = [];
  for (let i = 1; i < order.length; i++) {
    const prev = order[i - 1].level;
    const cur = order[i].level;
    if (cur > prev + 1) {
      skips.push({ label: `H${prev} -> H${cur}`, detail: order[i].text });
    }
  }

  const countsStr = `H1: ${counts[1]} | H2: ${counts[2]} | H3: ${counts[3]} | H4: ${counts[4]} | H5: ${counts[5]} | H6: ${counts[6]}`;
  
  let status: any = "pass";
  let gap: string | undefined;
  let summary = "";

  if (skips.length >= 1) {
    status = "warning";
    summary = `${skips.length} skipped heading level(s)`;
    gap = summary;
  } else {
    summary = "No skipped heading levels";
  }

  return {
    key: "headings",
    label: "Heading Structure",
    category: "onPageSeo",
    status,
    detail: summary,
    evidence: {
      source: ctx.source,
      rule: "no skipped heading levels",
      gap,
      rows: [
        { label: "Headings by level", value: countsStr },
        { label: "Skipped levels", value: skips.length },
      ],
      items: skips
    },
    data: { isWordPress: ctx.isWordPress }
  };
}

function runContentAmount(ctx: AuditContext): CheckResult {
  // Same counting logic as before
  const contentClone = ctx.$.root().clone();
  contentClone.find("script, style, nav, footer, header, noscript, svg, template, [role='navigation']").remove();
  const visibleText = cleanText(contentClone.text());
  const words = visibleText.split(/\s+/).filter((w) => w.length > 0);
  const n = words.length;

  let status: any = "pass";
  let gap: string | undefined;
  let summary = "";

  if (n < ONPAGE_CONFIG.CONTENT_MIN) {
    status = "warning";
    summary = `${ONPAGE_CONFIG.CONTENT_MIN - n} words below the ${ONPAGE_CONFIG.CONTENT_MIN} guideline`;
    gap = summary;
  } else {
    summary = `${n} words`;
  }

  return {
    key: "content_amount",
    label: "Content Amount",
    category: "onPageSeo",
    status,
    detail: summary,
    evidence: {
      source: ctx.source,
      rule: `at least ${ONPAGE_CONFIG.CONTENT_MIN} words`,
      gap,
      rows: [
        { label: "Word count", value: `${n} words` },
        { label: "Recommended", value: `at least ${ONPAGE_CONFIG.CONTENT_MIN} words` },
      ]
    },
    data: { isWordPress: ctx.isWordPress }
  };
}

function runImageAlt(ctx: AuditContext): CheckResult {
  const images = ctx.$("body img").not("noscript img");
  
  let total = 0;
  let missing = 0;
  let decorative = 0;
  let described = 0;
  
  const missingItems: any[] = [];

  images.each((_, el) => {
    const $el = ctx.$(el);
    // exclude <= 1x1
    const w = parseInt($el.attr("width") || "10", 10);
    const h = parseInt($el.attr("height") || "10", 10);
    if (w <= 1 || h <= 1) return;
    
    total++;
    const alt = $el.attr("alt");
    
    if (alt === undefined) {
      missing++;
      let src = $el.attr("src") || "";
      if (src.startsWith("data:")) src = "inline image (data URI)";
      else if (src.length > 80) src = src.substring(0, 77) + "...";
      missingItems.push({ label: src });
    } else if (alt.trim() === "") {
      decorative++;
    } else {
      described++;
    }
  });

  let status: any = "pass";
  let gap: string | undefined;
  let summary = "";

  if (missing > 0) {
    status = "warning";
    summary = `${missing} of ${total} images have no alt attribute`;
    gap = summary;
  } else if (total === 0) {
    summary = "No images found";
  } else {
    summary = `All ${total} images have alt attributes`;
  }

  return {
    key: "image_alt",
    label: "Image Alt Attributes",
    category: "onPageSeo",
    status,
    detail: summary,
    evidence: {
      source: ctx.source,
      rule: "all images must have an alt attribute",
      gap,
      rows: [
        { label: "Images checked", value: total },
        { label: "With alt text", value: described },
        { label: "Decorative, empty alt", value: decorative },
        { label: "Missing alt", value: missing },
      ],
      items: missingItems
    },
    data: { isWordPress: ctx.isWordPress }
  };
}

function runSchema(ctx: AuditContext): CheckResult {
  const types: string[] = [];
  let valid = 0;
  let invalid = 0;
  let identityFound = false;
  let hasName = false;
  let hasAddress = false;
  let hasTelephone = false;

  ctx.$('script[type="application/ld+json" i]').each((_, el) => {
    try {
      const json = JSON.parse(ctx.$(el).html() || "{}");
      valid++;
      const extract = (obj: any) => {
        if (obj["@type"]) {
          const t = Array.isArray(obj["@type"]) ? obj["@type"] : [obj["@type"]];
          types.push(...t);
          
          if (!identityFound && t.some((type: string) => ONPAGE_CONFIG.IDENTITY_TYPES.includes(type))) {
            identityFound = true;
            if (obj.name) hasName = true;
            if (obj.address) hasAddress = true;
            if (obj.telephone) hasTelephone = true;
          }
        }
        if (obj["@graph"] && Array.isArray(obj["@graph"])) {
          obj["@graph"].forEach(extract);
        }
        // check nested objects
        for (const key in obj) {
          if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            extract(obj[key]);
          }
        }
      };
      extract(json);
    } catch {
      invalid++;
    }
  });

  // Microdata
  ctx.$("[itemtype]").each((_, el) => {
    const val = ctx.$(el).attr("itemtype") || "";
    const type = val.split("/").pop();
    if (type) types.push(type);
  });

  const uniqueTypes = [...new Set(types)];

  let status: any = "pass";
  const gaps: string[] = [];
  
  if (uniqueTypes.length === 0) {
    status = "warning";
    gaps.push("No structured data found");
  } else {
    if (invalid > 0) {
      status = "warning";
      gaps.push(`${invalid} JSON-LD block(s) could not be parsed`);
    }
    if (!identityFound) {
      status = "warning";
      gaps.push("No Organization or LocalBusiness type");
    } else {
      if (!hasName || !hasAddress) {
        status = "warning";
        gaps.push("Business entry is missing: name, address");
      }
    }
  }

  const gap = gaps.join("; ");
  const rows: any[] = [
    { label: "Structured data blocks", value: `${valid} valid, ${invalid} invalid` },
    { label: "Types found", value: uniqueTypes.length > 0 ? uniqueTypes.join(", ") : "None" },
    { label: "Business/organization type present", value: identityFound ? "Yes" : "No" }
  ];
  if (identityFound) {
    rows.push({ label: "Name", value: hasName ? "Yes" : "No" });
    rows.push({ label: "Address", value: hasAddress ? "Yes" : "No" });
    rows.push({ label: "Telephone", value: hasTelephone ? "Yes" : "No" });
  }

  return {
    key: "schema",
    label: "Schema.org",
    category: "onPageSeo",
    status,
    detail: gap || "Structured data is well-formed and contains business identity",
    evidence: {
      source: ctx.source,
      rule: "valid JSON-LD with Organization/LocalBusiness identity (name, address)",
      gap,
      rows
    },
    data: { isWordPress: ctx.isWordPress }
  };
}

function runLinks(ctx: AuditContext): CheckResult {
  let totalLinks = 0;
  let internalLinks = 0;
  let externalDofollow = 0;
  let externalNofollow = 0;
  let skipped = 0;
  let vague = 0;
  let complex = 0;

  const uniqueInternal = new Set<string>();
  const items: any[] = [];
  
  const baseHostKey = hostKey(ctx.finalUrl, ctx.finalUrl);

  ctx.$("body a[href]").each((_, el) => {
    const $el = ctx.$(el);
    const href = $el.attr("href") || "";
    
    if (href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
      skipped++;
      return;
    }
    
    totalLinks++;
    const rel = ($el.attr("rel") || "").toLowerCase();
    const isNofollow = rel.includes("nofollow") || rel.includes("sponsored") || rel.includes("ugc");
    
    const hKey = hostKey(href, ctx.finalUrl);
    const isInternal = hKey === baseHostKey;

    if (isInternal) {
      internalLinks++;
      const resolved = normalizeUrl(href, ctx.finalUrl);
      uniqueInternal.add(resolved);

      // Check anchor text
      let text = cleanText($el.text());
      if (!text) {
        const img = $el.find("img").first();
        if (img.length) text = cleanText(img.attr("alt") || "");
      }
      if (!text) text = cleanText($el.attr("aria-label") || "");
      if (!text) text = cleanText($el.attr("title") || "");
      
      const stripped = text.toLowerCase().replace(/[.,!?;:]/g, "").trim();
      if (!stripped || ONPAGE_CONFIG.VAGUE_ANCHORS.includes(stripped)) {
        vague++;
        items.push({ group: "Vague anchor text", label: text || "(empty)", detail: href });
      }

      // Check URL complexity
      try {
        const u = new URL(resolved);
        const pathQuery = u.pathname + u.search;
        let isComplex = false;
        if (pathQuery.length > ONPAGE_CONFIG.COMPLEX_URL_MAX_LENGTH) isComplex = true;
        const params = Array.from(u.searchParams.keys());
        if (params.length > ONPAGE_CONFIG.COMPLEX_URL_MAX_PARAMS) isComplex = true;
        if (params.some(p => ONPAGE_CONFIG.COMPLEX_URL_BAD_PARAMS.includes(p.toLowerCase()))) isComplex = true;
        
        if (isComplex) {
          complex++;
          items.push({ group: "Complex URL", label: resolved });
        }
      } catch {}
      
    } else {
      if (isNofollow) externalNofollow++;
      else externalDofollow++;
    }
  });

  let status: any = "pass";
  const gaps: string[] = [];

  if (internalLinks === 0) {
    status = "warning";
    gaps.push("No internal links found");
  } else {
    if (vague > 0) gaps.push(`${vague} vague anchor${vague === 1 ? "" : "s"}`);
    if (complex > 0) gaps.push(`${complex} complex URL${complex === 1 ? "" : "s"}`);
    if (gaps.length > 0) status = "warning";
  }

  const gap = gaps.join("; ");

  return {
    key: "links",
    label: "Link Structure",
    category: "onPageSeo",
    status,
    detail: gap || "Internal link structure looks good",
    evidence: {
      source: ctx.source,
      rule: "descriptive anchor text and clean URLs",
      gap,
      rows: [
        { label: "Total links", value: totalLinks },
        { label: "Internal", value: internalLinks },
        { label: "External (follow)", value: externalDofollow },
        { label: "External (nofollow/sponsored/ugc)", value: externalNofollow },
        { label: "Unique internal URLs", value: uniqueInternal.size },
        { label: "Skipped (mailto, tel, #anchor)", value: skipped },
        { label: "Internal links with missing or vague anchor text", value: vague },
        { label: "Overly complex internal URLs", value: complex },
      ],
      items
    },
    data: { isWordPress: ctx.isWordPress }
  };
}

export function runOnPageSeoChecks(
  raw: RawHtmlResult,
  aux: AuxFilesResult,
  targetKeyword?: string,
  renderedDom?: RenderedDomResult | null
): CheckResult[] {
  // Use Rendered DOM if available, fallback to Raw HTML
  const htmlToParse = renderedDom?.renderedHtml || raw.rawHtml;
  const source = renderedDom?.renderedHtml ? "Rendered DOM" : "Raw HTML";
  const $ = cheerio.load(htmlToParse);

  const ctx: AuditContext = {
    requestedUrl: raw.responseUrl, // close enough
    finalUrl: raw.responseUrl,
    statusCode: raw.statusCode,
    responseHeaders: raw.headers,
    rawHtml: raw.rawHtml,
    $,
    source,
    isWordPress: getWordpressState(raw.rawHtml)
  };

  const results: CheckResult[] = [];

  // 1. Indexability
  results.push(runIndexability(ctx));
  
  // (Robots.txt, XML Sitemap, HTTPS are kept from old file but inserted here to preserve order? The user said "LEAVE UNTOUCHED in Part 1... ROW ORDER: Indexability, Robots.txt, XML Sitemap, HTTPS, Canonical...")
  // I will append the untouched checks now.
  results.push({
    key: "robots_txt",
    label: "Robots.txt",
    category: "onPageSeo",
    status: aux.robotsTxt.status === 200 ? "pass" : "fail",
    value: aux.robotsTxt.status === 200,
    detail: aux.robotsTxt.status === 200 ? "Found and accessible" : "Not found or inaccessible",
  });
  results.push({
    key: "robots_blocking",
    label: "Search Engine Access",
    category: "onPageSeo",
    status: "pass",
    detail: "Preserved check",
  }); // Fake implementation just to keep it from failing, wait, I can just copy the old one
  const majorBots = ["googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider", "yandexbot"];
  let searchBlocked = false;
  if (aux.robotsTxt.body) {
    const lines = aux.robotsTxt.body.toLowerCase().split("\n");
    let currentAgent = "";
    for (const line of lines) {
      const stripped = line.trim();
      if (stripped.startsWith("user-agent:")) currentAgent = stripped.replace("user-agent:", "").trim();
      else if (stripped.startsWith("disallow: /") && stripped === "disallow: /") {
        if (currentAgent === "*" || majorBots.includes(currentAgent)) { searchBlocked = true; break; }
      }
    }
  }
  results[results.length-1].status = searchBlocked ? "fail" : "pass";
  results[results.length-1].detail = searchBlocked ? "Robots.txt blocks major search engines!" : "No blocking rules for major search engines";

  results.push({
    key: "xml_sitemap",
    label: "XML Sitemap",
    category: "onPageSeo",
    status: aux.sitemap.status === 200 ? "pass" : "fail",
    value: aux.sitemap.status === 200,
    detail: aux.sitemap.status === 200 ? `Found at ${aux.sitemap.url}` : "No sitemap.xml or sitemap_index.xml found",
    data: { url: aux.sitemap.url },
  });

  const isHttps = raw.responseUrl.startsWith("https://");
  results.push({
    key: "ssl_enabled",
    label: "SSL Enabled",
    category: "onPageSeo",
    status: isHttps ? "pass" : "fail",
    value: isHttps,
    detail: isHttps ? "HTTPS connection" : "Not using HTTPS",
  });
  results.push({
    key: "https_redirect",
    label: "HTTPS Redirect",
    category: "onPageSeo",
    status: isHttps ? "pass" : "warning",
    value: isHttps,
    detail: isHttps ? "Site redirects to HTTPS" : "HTTP version may not redirect to HTTPS",
  });

  // Now the rest of the new checks
  results.push(runCanonical(ctx));
  results.push(runTitle(ctx));
  results.push(runMetaDescription(ctx));
  results.push(runH1(ctx));
  results.push(runHeadings(ctx));
  results.push(runContentAmount(ctx));
  results.push(runImageAlt(ctx));
  results.push(runSchema(ctx));
  results.push(runLinks(ctx));

  return results;
}
