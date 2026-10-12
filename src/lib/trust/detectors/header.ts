import type { RegionMatch, SlotFinding } from "../types";
import { type DetectorContext, sanitizeSnippet } from "./context";

const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?[2-9]\d{2}[-.\s]?\d{4}/;
const CTA_TEXT_REGEX = /\b(?:quote|free estimate|estimate|contact us|contact|book online|book now|schedule|call now|request service|get started)\b/i;

/**
 * Header detector:
 * Identifies the top header/navigation region and inspects for essential trust anchors:
 * - logo_present
 * - phone_link
 * - nav_items_count
 * - cta_button_top_right
 */
export function detectHeader(ctx: DetectorContext): RegionMatch {
  const { $, layout } = ctx;
  const slots: SlotFinding[] = [];

  // Find header element: <header>, first <nav>, or container before first <h1>
  let headerEl = $("header").first();
  if (headerEl.length === 0) {
    headerEl = $("nav").first().parent();
  }
  if (headerEl.length === 0) {
    headerEl = $("div[class*='header'], div[id*='header'], div[class*='nav']").first();
  }

  const found = headerEl.length > 0;
  const headerLayout = layout.sections.find(
    (s) => s.selectorPath.includes("header") || s.selectorPath.includes("nav")
  );
  const scrollDepth = headerLayout?.bbox.y ?? 0;

  // 1. Slot: logo_present
  let logoFound = false;
  let logoSnippet = "";
  const logoImgs = headerEl.find("img, svg");

  logoImgs.each((_, el) => {
    if (logoFound) return;
    const src = $(el).attr("src")?.toLowerCase() || "";
    const alt = $(el).attr("alt")?.toLowerCase() || "";
    const cls = $(el).attr("class")?.toLowerCase() || "";
    const id = $(el).attr("id")?.toLowerCase() || "";

    if (
      src.includes("logo") ||
      alt.includes("logo") ||
      cls.includes("logo") ||
      id.includes("logo") ||
      $(el).closest("a[href='/'], a[href=''], a[class*='logo']").length > 0
    ) {
      logoFound = true;
      logoSnippet = sanitizeSnippet($.html(el)) || "";
    }
  });

  // Also check layout images guess
  if (!logoFound) {
    const layoutLogo = layout.images.find(
      (img) => img.sectionGuess === "header" && (img.src.includes("logo") || img.alt?.toLowerCase().includes("logo"))
    );
    if (layoutLogo) {
      logoFound = true;
      logoSnippet = layoutLogo.src;
    }
  }

  slots.push({
    slot: "logo_present",
    state: logoFound ? "found" : "missing",
    evidence: logoFound ? ["Brand logo detected in header"] : ["No brand logo detected in header navigation"],
    htmlSnippet: logoSnippet,
    confidence: logoFound ? 0.95 : 0.8,
  });

  // 2. Slot: phone_link
  const telLink = headerEl.find("a[href^='tel:']").first();
  const headerText = headerEl.text() || "";
  const phoneMatch = PHONE_REGEX.exec(headerText);

  if (telLink.length > 0) {
    const rawTel = telLink.attr("href") || "";
    slots.push({
      slot: "phone_link",
      state: "found",
      evidence: [`Clickable phone link in header (${telLink.text().trim() || rawTel})`],
      htmlSnippet: sanitizeSnippet($.html(telLink)),
      confidence: 1.0,
    });
  } else if (phoneMatch) {
    slots.push({
      slot: "phone_link",
      state: "partial",
      evidence: [`Phone number displayed as plain text (${phoneMatch[0]}), but not wrapped in clickable tel: link`],
      confidence: 0.85,
    });
  } else {
    slots.push({
      slot: "phone_link",
      state: "missing",
      evidence: ["No phone number detected in header"],
      confidence: 0.9,
    });
  }

  // 3. Slot: nav_items_count
  const navLinks = headerEl.find("nav a, ul li a").filter((_, el) => {
    const href = $(el).attr("href");
    return Boolean(href && !href.startsWith("tel:") && !href.startsWith("mailto:"));
  });
  const navCount = navLinks.length;

  if (navCount >= 3) {
    slots.push({
      slot: "nav_items_count",
      state: "found",
      evidence: [`Clear navigation menu with ${navCount} items`],
      confidence: 0.95,
    });
  } else if (navCount >= 1) {
    slots.push({
      slot: "nav_items_count",
      state: "partial",
      evidence: [`Minimal navigation menu with only ${navCount} item(s)`],
      confidence: 0.85,
    });
  } else {
    slots.push({
      slot: "nav_items_count",
      state: "missing",
      evidence: ["No navigation links detected in header"],
      confidence: 0.9,
    });
  }

  // 4. Slot: cta_button_top_right
  let ctaFound = false;
  let ctaSnippet = "";

  headerEl.find("a, button, .btn, [role='button']").each((_, el) => {
    if (ctaFound) return;
    const text = $(el).text().trim();
    if (CTA_TEXT_REGEX.test(text)) {
      ctaFound = true;
      ctaSnippet = sanitizeSnippet($.html(el)) || "";
    }
  });

  slots.push({
    slot: "cta_button_top_right",
    state: ctaFound ? "found" : "missing",
    evidence: ctaFound
      ? ["High-contrast call-to-action button in header"]
      : ["Missing prominent call-to-action button in header"],
    htmlSnippet: ctaSnippet,
    confidence: ctaFound ? 0.9 : 0.85,
  });

  return {
    region: "header",
    found,
    scrollDepth,
    scrollIndex: 1,
    slots,
  };
}
