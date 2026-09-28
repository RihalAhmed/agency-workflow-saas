/**
 * @deprecated — This file is superseded by src/lib/audit/modules/performance.ts
 * Kept for backward compatibility with any code that still references it.
 */

interface LegacyAuditCheckResult {
  check_key: string;
  label: string;
  category: string;
  score: number;
  detail?: string;
  data?: Record<string, unknown>;
}

type AuditCheckResult = LegacyAuditCheckResult;

/**
 * Runs technical checks against the Google PageSpeed Insights API.
 */
export async function runTechnicalChecks(url: string): Promise<{
  results: AuditCheckResult[];
  screenshotBase64: string | null;
  rawResponse: any;
}> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error("PAGESPEED_API_KEY is not configured.");
  }

  // We request desktop strategy to get a desktop screenshot, but we'll also get CWV which are usually aggregated or mobile-first.
  // Ideally, you run two requests (mobile + desktop) for full accuracy, but for v1 we do one.
  const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&key=${apiKey}&category=performance&category=accessibility&category=seo&strategy=desktop`;

  const response = await fetch(apiEndpoint);
  if (!response.ok) {
    throw new Error(`PageSpeed API failed: ${response.statusText}`);
  }

  const data = await response.json();
  const lighthouse = data.lighthouseResult;
  const audits = lighthouse?.audits || {};
  const categories = lighthouse?.categories || {};

  const results: AuditCheckResult[] = [];

  // 1. Performance Score
  const perfScore = (categories.performance?.score || 0) * 100;
  results.push({
    category: "performance",
    check_key: "page_speed",
    label: "Page Speed Score",
    score: perfScore >= 90 ? 2 : perfScore >= 50 ? 1 : 0,
    detail: `Score: ${Math.round(perfScore)}/100`,
    data: { score: perfScore },
  });

  // 2. Largest Contentful Paint (LCP)
  const lcpValue = audits["largest-contentful-paint"]?.numericValue || 0;
  const lcpSec = lcpValue / 1000;
  results.push({
    category: "performance",
    check_key: "lcp",
    label: "Largest Contentful Paint (LCP)",
    score: lcpSec <= 2.5 && lcpSec > 0 ? 2 : lcpSec <= 4.0 && lcpSec > 0 ? 1 : 0,
    detail: lcpSec > 0 ? `${lcpSec.toFixed(2)}s` : "Unknown",
    data: { ms: lcpValue },
  });

  // 3. Cumulative Layout Shift (CLS)
  const clsValue = audits["cumulative-layout-shift"]?.numericValue || 0;
  results.push({
    category: "performance",
    check_key: "cls",
    label: "Cumulative Layout Shift (CLS)",
    score: clsValue <= 0.1 ? 2 : clsValue <= 0.25 ? 1 : 0,
    detail: clsValue.toFixed(3),
    data: { cls: clsValue },
  });

  // 4. Mobile Friendly (Viewport)
  const viewport = audits["meta-viewport"] || audits["viewport"];
  results.push({
    category: "performance",
    check_key: "mobile_friendly",
    label: "Mobile Responsiveness (Viewport)",
    score: viewport?.score === 1 ? 2 : 0,
    detail: viewport?.score === 1 ? "Viewport configured" : "Missing viewport tag",
  });

  // 5. SSL / HTTPS
  const isHttps = url.startsWith("https://");
  results.push({
    category: "performance",
    check_key: "ssl_https",
    label: "SSL Security",
    score: isHttps ? 2 : 0,
    detail: isHttps ? "Secure (HTTPS)" : "Insecure (HTTP)",
  });

  // Extract Screenshot
  let screenshotBase64 = null;
  const finalScreenshot = audits["final-screenshot"]?.details?.data;
  if (finalScreenshot) {
    // The data string is already a base64 encoded data URI (data:image/jpeg;base64,...)
    screenshotBase64 = finalScreenshot;
  }

  return {
    results,
    screenshotBase64,
    rawResponse: data,
  };
}
