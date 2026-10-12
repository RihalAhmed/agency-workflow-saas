import * as cheerio from "cheerio";
import type { CheckResult, RawHtmlResult, AuxFilesResult, RenderedDomResult } from "../types";
import { ONPAGE_CONFIG } from "./onpage.config";

// --- HELPERS ---
function cleanText(s: string): string {
  // basic entity decode (Cheerio `.text()` usually does this, but we'll ensure whitespace is clean)
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
    
    // Normalize path trailing slash (treat /path and /path/ as equal except for root)
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

// --- CHECKS ---

function runIndexability(ctx: any): CheckResult {
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

  // Only check x-robots-tag if it doesn't have another bot prefix (basic assumption: if it's set, it applies, unless specifically not googlebot)
  // Spec says: "ignore values prefixed with an agent other than googlebot"
  const parseXRobots = (header: string) => {
    if (header === "not available" || header === "not set") return { noi: false, nof: false };
    // Very simplified parse for agent prefixes
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
    gap = `noindex found in ${sources.join(" | ")}`;
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

// Will continue writing other checks...
