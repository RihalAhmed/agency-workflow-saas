import * as cheerio from "cheerio";
import type { CheckResult, PageSpeedResult, RawHtmlResult } from "../types";

/**
 * Module 2 — Performance
 * Combines Google PageSpeed Insights data (mobile + desktop) with
 * raw HTML checks for deprecated HTML and inline styles.
 */
export function runPerformanceChecks(
  psi: PageSpeedResult,
  raw: RawHtmlResult
): CheckResult[] {
  const results: CheckResult[] = [];
  const mAudits = psi.mobile.lighthouseResult?.audits || {};
  const dAudits = psi.desktop.lighthouseResult?.audits || {};
  const mCats = psi.mobile.lighthouseResult?.categories || {};
  const dCats = psi.desktop.lighthouseResult?.categories || {};

  // Helper: extract numeric value in ms
  const ms = (audits: Record<string, any>, key: string) =>
    audits[key]?.numericValue ?? null;

  // Helper: extract score 0-1
  const score = (audits: Record<string, any>, key: string) =>
    audits[key]?.score ?? null;

  // -----------------------------------------------------------------------
  // 1. Server Response Time
  // -----------------------------------------------------------------------
  const srtMobile = ms(mAudits, "server-response-time");
  const srtDesktop = ms(dAudits, "server-response-time");
  const srt = srtMobile ?? srtDesktop ?? 0;
  results.push({
    key: "server_response_time",
    label: "Server Response Time",
    category: "performance",
    status: srt <= 200 ? "pass" : srt <= 600 ? "warning" : "fail",
    value: srt ? `${Math.round(srt)}ms` : null,
    detail: srt ? `${Math.round(srt)}ms (target: under 200ms)` : "Not measured",
    data: { mobile: srtMobile, desktop: srtDesktop },
  });

  // -----------------------------------------------------------------------
  // 2. First Contentful Paint
  // -----------------------------------------------------------------------
  const fcpMobile = ms(mAudits, "first-contentful-paint");
  const fcpDesktop = ms(dAudits, "first-contentful-paint");
  const fcpSec = fcpMobile ? fcpMobile / 1000 : null;
  results.push({
    key: "fcp",
    label: "First Contentful Paint",
    category: "performance",
    status:
      fcpSec === null ? "info" : fcpSec <= 1.8 ? "pass" : fcpSec <= 3 ? "warning" : "fail",
    value: fcpSec !== null ? `${fcpSec.toFixed(2)}s` : null,
    detail: fcpSec !== null ? `Mobile: ${fcpSec.toFixed(2)}s` : "Not measured",
    data: { mobile: fcpMobile, desktop: fcpDesktop },
  });

  // -----------------------------------------------------------------------
  // 3. Time to Interactive
  // -----------------------------------------------------------------------
  const ttiMobile = ms(mAudits, "interactive");
  const ttiDesktop = ms(dAudits, "interactive");
  const ttiSec = ttiMobile ? ttiMobile / 1000 : null;
  results.push({
    key: "tti",
    label: "Time to Interactive",
    category: "performance",
    status:
      ttiSec === null ? "info" : ttiSec <= 3.8 ? "pass" : ttiSec <= 7.3 ? "warning" : "fail",
    value: ttiSec !== null ? `${ttiSec.toFixed(2)}s` : null,
    detail: ttiSec !== null ? `Mobile: ${ttiSec.toFixed(2)}s` : "Not measured",
    data: { mobile: ttiMobile, desktop: ttiDesktop },
  });

  // -----------------------------------------------------------------------
  // 4. Total Page Size + Breakdown
  // -----------------------------------------------------------------------
  const totalByteWeight = mAudits["total-byte-weight"]?.numericValue ?? dAudits["total-byte-weight"]?.numericValue ?? 0;
  const totalKB = Math.round(totalByteWeight / 1024);
  const totalMB = (totalByteWeight / (1024 * 1024)).toFixed(2);

  // Group resources by type
  const networkItems = (mAudits["network-requests"]?.details?.items || dAudits["network-requests"]?.details?.items || []) as any[];
  const breakdown: Record<string, { count: number; bytes: number }> = {};
  for (const item of networkItems) {
    const type = item.resourceType || "other";
    if (!breakdown[type]) breakdown[type] = { count: 0, bytes: 0 };
    breakdown[type].count++;
    breakdown[type].bytes += item.transferSize || 0;
  }

  results.push({
    key: "page_size",
    label: "Page Size",
    category: "performance",
    status: totalKB <= 2048 ? "pass" : totalKB <= 5120 ? "warning" : "fail",
    value: `${totalMB} MB`,
    detail: `${totalMB} MB total (${totalKB} KB)`,
    data: { totalBytes: totalByteWeight, breakdown },
  });

  // -----------------------------------------------------------------------
  // 5. Text Compression
  // -----------------------------------------------------------------------
  const compressionAudit = mAudits["uses-text-compression"] || dAudits["uses-text-compression"];
  const compressionScore = compressionAudit?.score ?? null;
  results.push({
    key: "text_compression",
    label: "Text Compression (Gzip/Brotli)",
    category: "performance",
    status: compressionScore === 1 ? "pass" : compressionScore === null ? "info" : "warning",
    value: compressionScore,
    detail:
      compressionScore === 1
        ? "Text resources are compressed"
        : compressionScore !== null
          ? "Some text resources could benefit from compression"
          : "Not measured",
    data: { savings: compressionAudit?.details?.overallSavingsBytes || 0 },
  });

  // -----------------------------------------------------------------------
  // 6. Resource Counts
  // -----------------------------------------------------------------------
  results.push({
    key: "resource_counts",
    label: "Resource Breakdown",
    category: "performance",
    status: "info",
    value: networkItems.length,
    detail: `${networkItems.length} total requests`,
    data: { breakdown },
  });

  // -----------------------------------------------------------------------
  // 7. JavaScript Errors
  // -----------------------------------------------------------------------
  const consoleErrors = mAudits["errors-in-console"] || dAudits["errors-in-console"];
  const errorCount = consoleErrors?.details?.items?.length || 0;
  results.push({
    key: "js_errors",
    label: "JavaScript Console Errors",
    category: "performance",
    status: errorCount === 0 ? "pass" : errorCount <= 3 ? "warning" : "fail",
    value: errorCount,
    detail:
      errorCount === 0
        ? "No console errors"
        : `${errorCount} console error(s) detected`,
    data: {
      errors: (consoleErrors?.details?.items || [])
        .slice(0, 5)
        .map((e: any) => e.description || e.source),
    },
  });

  // -----------------------------------------------------------------------
  // 8. HTTP/2 Usage
  // -----------------------------------------------------------------------
  const http2Audit = mAudits["uses-http2"] || dAudits["uses-http2"];
  const http2Score = http2Audit?.score ?? null;
  results.push({
    key: "http2",
    label: "HTTP/2 Usage",
    category: "performance",
    status: http2Score === 1 ? "pass" : http2Score === null ? "info" : "warning",
    value: http2Score,
    detail:
      http2Score === 1
        ? "All resources served over HTTP/2"
        : http2Score !== null
          ? "Some resources not served over HTTP/2"
          : "Not measured",
  });

  // -----------------------------------------------------------------------
  // 9. Core Web Vitals (LCP, CLS, FCP, TBT, Speed Index)
  // -----------------------------------------------------------------------
  // LCP
  const lcpMobile = ms(mAudits, "largest-contentful-paint");
  const lcpDesktop = ms(dAudits, "largest-contentful-paint");
  const lcpSec = lcpMobile ? lcpMobile / 1000 : null;
  results.push({
    key: "lcp",
    label: "Largest Contentful Paint (LCP)",
    category: "performance",
    status:
      lcpSec === null ? "info" : lcpSec <= 2.5 ? "pass" : lcpSec <= 4 ? "warning" : "fail",
    value: lcpSec !== null ? `${lcpSec.toFixed(2)}s` : null,
    detail: lcpSec !== null ? `Mobile: ${lcpSec.toFixed(2)}s (target: ≤2.5s)` : "Not measured",
    data: { mobile: lcpMobile, desktop: lcpDesktop },
  });

  // CLS
  const clsMobile = mAudits["cumulative-layout-shift"]?.numericValue ?? null;
  const clsDesktop = dAudits["cumulative-layout-shift"]?.numericValue ?? null;
  const cls = clsMobile ?? clsDesktop ?? null;
  results.push({
    key: "cls",
    label: "Cumulative Layout Shift (CLS)",
    category: "performance",
    status:
      cls === null ? "info" : cls <= 0.1 ? "pass" : cls <= 0.25 ? "warning" : "fail",
    value: cls !== null ? cls.toFixed(3) : null,
    detail: cls !== null ? `${cls.toFixed(3)} (target: ≤0.1)` : "Not measured",
    data: { mobile: clsMobile, desktop: clsDesktop },
  });

  // TBT
  const tbtMobile = ms(mAudits, "total-blocking-time");
  const tbtDesktop = ms(dAudits, "total-blocking-time");
  const tbt = tbtMobile ?? tbtDesktop ?? null;
  results.push({
    key: "tbt",
    label: "Total Blocking Time (TBT)",
    category: "performance",
    status:
      tbt === null ? "info" : tbt <= 200 ? "pass" : tbt <= 600 ? "warning" : "fail",
    value: tbt !== null ? `${Math.round(tbt)}ms` : null,
    detail: tbt !== null ? `${Math.round(tbt)}ms (target: ≤200ms)` : "Not measured",
    data: { mobile: tbtMobile, desktop: tbtDesktop },
  });

  // Speed Index
  const siMobile = ms(mAudits, "speed-index");
  const siDesktop = ms(dAudits, "speed-index");
  const siSec = siMobile ? siMobile / 1000 : null;
  results.push({
    key: "speed_index",
    label: "Speed Index",
    category: "performance",
    status:
      siSec === null ? "info" : siSec <= 3.4 ? "pass" : siSec <= 5.8 ? "warning" : "fail",
    value: siSec !== null ? `${siSec.toFixed(2)}s` : null,
    detail: siSec !== null ? `Mobile: ${siSec.toFixed(2)}s` : "Not measured",
    data: { mobile: siMobile, desktop: siDesktop },
  });

  // -----------------------------------------------------------------------
  // 10. Overall Performance Score (mobile + desktop)
  // -----------------------------------------------------------------------
  const perfMobile = (mCats.performance?.score ?? 0) * 100;
  const perfDesktop = (dCats.performance?.score ?? 0) * 100;
  results.push({
    key: "performance_score",
    label: "Performance Score",
    category: "performance",
    status:
      perfMobile >= 90 ? "pass" : perfMobile >= 50 ? "warning" : "fail",
    value: `${Math.round(perfMobile)}/100`,
    detail: `Mobile: ${Math.round(perfMobile)}/100 — Desktop: ${Math.round(perfDesktop)}/100`,
    data: { mobile: perfMobile, desktop: perfDesktop },
  });

  // -----------------------------------------------------------------------
  // 11. Deprecated HTML Tags
  // -----------------------------------------------------------------------
  const $ = cheerio.load(raw.rawHtml);
  const deprecatedTags = ["center", "font", "marquee", "blink", "big", "strike", "tt", "acronym"];
  const foundDeprecated: string[] = [];
  for (const tag of deprecatedTags) {
    if ($(tag).length > 0) {
      foundDeprecated.push(`<${tag}> (${$(tag).length})`);
    }
  }
  results.push({
    key: "deprecated_html",
    label: "Deprecated HTML Tags",
    category: "performance",
    status: foundDeprecated.length === 0 ? "pass" : "warning",
    value: foundDeprecated.length,
    detail:
      foundDeprecated.length === 0
        ? "No deprecated HTML tags found"
        : `Found: ${foundDeprecated.join(", ")}`,
    data: { tags: foundDeprecated },
  });

  // -----------------------------------------------------------------------
  // 12. Inline Styles
  // -----------------------------------------------------------------------
  const inlineStyleCount = $("[style]").length;
  results.push({
    key: "inline_styles",
    label: "Inline Styles",
    category: "performance",
    status:
      inlineStyleCount === 0
        ? "pass"
        : inlineStyleCount <= 10
          ? "warning"
          : "fail",
    value: inlineStyleCount,
    detail:
      inlineStyleCount === 0
        ? "No inline styles found"
        : `${inlineStyleCount} elements with inline style attributes`,
  });

  return results;
}
