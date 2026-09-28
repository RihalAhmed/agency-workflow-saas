import * as cheerio from "cheerio";
import type { CheckResult, RawHtmlResult, PageSpeedResult, RenderedDomResult } from "../types";

/**
 * Module 3 — Usability
 */
export function runUsabilityChecks(
  raw: RawHtmlResult,
  psi: PageSpeedResult,
  rendered: RenderedDomResult | null
): CheckResult[] {
  const $ = cheerio.load(raw.rawHtml);
  const results: CheckResult[] = [];

  // -----------------------------------------------------------------------
  // 1. Device Rendering (screenshots available)
  // -----------------------------------------------------------------------
  results.push({
    key: "device_rendering",
    label: "Device Rendering",
    category: "usability",
    status: rendered ? "pass" : "warning",
    detail: rendered
      ? "Screenshots captured for desktop, tablet, and mobile viewports"
      : "Screenshots unavailable (Playwright may not be installed)",
    data: rendered
      ? {
          hasDesktop: !!rendered.screenshots.desktop,
          hasTablet: !!rendered.screenshots.tablet,
          hasMobile: !!rendered.screenshots.mobile,
        }
      : {},
  });

  // -----------------------------------------------------------------------
  // 2. Mobile Viewport Meta Tag
  // -----------------------------------------------------------------------
  const viewport = $('meta[name="viewport"]').attr("content") || "";
  const hasWidthDevice = viewport.toLowerCase().includes("width=device-width");
  results.push({
    key: "mobile_viewport",
    label: "Mobile Viewport",
    category: "usability",
    status: !viewport ? "fail" : hasWidthDevice ? "pass" : "warning",
    value: viewport || null,
    detail: !viewport
      ? "Missing viewport meta tag"
      : hasWidthDevice
        ? "Properly configured with width=device-width"
        : `Viewport set but missing width=device-width: "${viewport}"`,
  });

  // -----------------------------------------------------------------------
  // 3. Desktop Performance Score (from PSI)
  // -----------------------------------------------------------------------
  const desktopScore =
    (psi.desktop.lighthouseResult?.categories?.performance?.score ?? 0) * 100;
  results.push({
    key: "desktop_performance",
    label: "Desktop Performance Score",
    category: "usability",
    status:
      desktopScore >= 90 ? "pass" : desktopScore >= 50 ? "warning" : "fail",
    value: `${Math.round(desktopScore)}/100`,
    detail: `Desktop PageSpeed score: ${Math.round(desktopScore)}/100`,
    data: { score: desktopScore },
  });

  // -----------------------------------------------------------------------
  // 4. Flash Content
  // -----------------------------------------------------------------------
  const flashEmbeds = $('embed[src*=".swf"], object[data*=".swf"]').length;
  const flashParams = $('param[value*=".swf"]').length;
  const flashCount = flashEmbeds + flashParams;
  results.push({
    key: "flash_usage",
    label: "Flash Content",
    category: "usability",
    status: flashCount === 0 ? "pass" : "fail",
    value: flashCount,
    detail:
      flashCount === 0
        ? "No Flash content detected"
        : `${flashCount} Flash element(s) found — Flash is deprecated`,
  });

  // -----------------------------------------------------------------------
  // 5. iFrames
  // -----------------------------------------------------------------------
  const iframeCount = $("iframe").length;
  const iframeSrcs = $("iframe")
    .map((_, el) => $(el).attr("src") || "unknown")
    .get()
    .slice(0, 5);
  results.push({
    key: "iframes",
    label: "iFrames Used",
    category: "usability",
    status: iframeCount === 0 ? "pass" : iframeCount <= 3 ? "info" : "warning",
    value: iframeCount,
    detail:
      iframeCount === 0
        ? "No iframes found"
        : `${iframeCount} iframe(s) found`,
    data: { count: iframeCount, sources: iframeSrcs },
  });

  // -----------------------------------------------------------------------
  // 6. Favicon
  // -----------------------------------------------------------------------
  const faviconLink =
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    $('link[rel="apple-touch-icon"]').attr("href") ||
    "";
  results.push({
    key: "favicon",
    label: "Favicon",
    category: "usability",
    status: faviconLink ? "pass" : "fail",
    value: faviconLink || null,
    detail: faviconLink ? `Found: ${faviconLink}` : "No favicon link found",
  });

  // -----------------------------------------------------------------------
  // 7. Email Privacy
  // -----------------------------------------------------------------------
  // Strip scripts/styles to only scan visible text
  const visibleClone = $.root().clone();
  visibleClone.find("script, style, noscript").remove();
  const visibleText = visibleClone.text();

  const emailRegex = /[\w.+-]+@[\w.-]+\.\w{2,}/g;
  const exposedEmails = [...new Set(visibleText.match(emailRegex) || [])];
  results.push({
    key: "email_privacy",
    label: "Email Privacy",
    category: "usability",
    status: exposedEmails.length === 0 ? "pass" : "warning",
    value: exposedEmails.length,
    detail:
      exposedEmails.length === 0
        ? "No plain-text email addresses found"
        : `${exposedEmails.length} email(s) exposed in plain text (harvesting risk)`,
    data: { emails: exposedEmails.slice(0, 5) },
  });

  return results;
}
