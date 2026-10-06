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
  const metrics = psi.mobile.lighthouseResult?.audits || {};

  // -----------------------------------------------------------------------
  // 1. Mobile Viewport Meta Tag
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
  // 2. Device Rendering (screenshots available)
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
          screenshots: {
             desktop: rendered.screenshots.desktop || null,
             tablet: rendered.screenshots.tablet || null,
             mobile: rendered.screenshots.mobile || null,
          }
        }
      : {},
  });

  // -----------------------------------------------------------------------
  // 5. Render-Blocking Resources
  // -----------------------------------------------------------------------
  const renderBlocking = metrics['render-blocking-resources'];
  const hasRenderBlocking = renderBlocking && renderBlocking.details?.items?.length > 0;
  results.push({
    key: "render_blocking",
    label: "Render-Blocking Resources",
    category: "usability",
    status: hasRenderBlocking ? "warning" : "pass",
    detail: hasRenderBlocking 
      ? "Your page has render-blocking resources that may impact load times."
      : "Your page does not appear to have any significant render-blocking resources.",
  });

  // 6. Flash Content
  const flashEmbeds = $('embed[src*=".swf"], object[data*=".swf"]').length;
  const flashParams = $('param[value*=".swf"]').length;
  const flashCount = flashEmbeds + flashParams;
  results.push({
    key: "flash_usage",
    label: "Flash Used?",
    category: "usability",
    status: flashCount === 0 ? "pass" : "fail",
    value: flashCount,
    detail: flashCount === 0
        ? "No Flash content has been identified on your page."
        : `${flashCount} Flash element(s) found — Flash is deprecated`,
    evidence: {
      metric: "Flash Elements",
      value: flashCount,
      unit: "elements",
      target: { max: 0 },
      source: "<embed> and <object> tags"
    }
  });

  // 7. iFrames
  const iframeCount = $("iframe").length;
  const iframeSrcs = $("iframe")
    .map((_, el) => $(el).attr("src") || "unknown")
    .get()
    .slice(0, 5);
  results.push({
    key: "iframes",
    label: "iFrames Used?",
    category: "usability",
    status: iframeCount === 0 ? "pass" : iframeCount <= 3 ? "info" : "warning",
    value: iframeCount,
    detail: iframeCount === 0
        ? "No iframes found"
        : `Your page appears to be using iFrames. iFrames are discouraged as they can complicate navigation of content in mobile.`,
    data: { count: iframeCount, sources: iframeSrcs },
    evidence: {
      metric: "iFrames",
      value: iframeCount,
      unit: "iframes",
      target: { max: 3 },
      found: iframeSrcs,
      source: "<iframe> tags"
    }
  });

  // 8. Favicon
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
    detail: faviconLink ? "Your page has specified a Favicon." : "No favicon link found",
    evidence: {
      metric: "Favicon Link",
      value: faviconLink ? true : false,
      target: true,
      found: faviconLink ? [faviconLink] : undefined,
      source: "<link rel='icon'>"
    }
  });

  // 9. Email Privacy
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
    detail: exposedEmails.length === 0
        ? "No plain-text email addresses found"
        : "Email addresses have been found in plain text. We recommend removing any plain text email addresses and replacing them with contact forms.",
    data: { emails: exposedEmails.slice(0, 5) },
    evidence: {
      metric: "Exposed Emails",
      value: exposedEmails.length,
      unit: "emails",
      target: { max: 0 },
      found: exposedEmails.slice(0, 5),
      source: "Body Text"
    }
  });

  return results;
}
