import type { RegionMatch, SlotFinding } from "../types";
import { type DetectorContext, sanitizeSnippet } from "./context";
import { matchTownOrState } from "../data/us-states";

const STOCK_HINTS = /unsplash|shutterstock|istock|pexels|adobestock|freepik|getty/i;
const CREDENTIAL_REGEX = /\b(licensed|insured|bonded|veteran[- ]owned|family[- ]owned|bbb accredited|certified|certified technicians|master certified)\b/i;
const RISK_REVERSAL_REGEX = /\b(guarantee|100% satisfaction|money[- ]back|no[- ]risk|free estimate|free quote|satisfaction guaranteed|zero risk)\b/i;
const REVIEW_BADGE_REGEX = /(?:google|facebook|yelp|bbb|angie|homeadvisor)/i;

/**
 * Hero region detector:
 * Identifies the first full-width viewport section containing the primary <h1>,
 * and analyzes trust anchors, personality markers, credentials, and forms.
 */
export function detectHero(ctx: DetectorContext): RegionMatch {
  const { $, layout, faces } = ctx;
  const slots: SlotFinding[] = [];

  const h1El = $("h1").first();
  const hasH1 = h1El.length > 0;
  let heroEl = h1El.closest("section, div[class*='hero'], div[id*='hero'], header + div, main > div:first-child");

  if (heroEl.length === 0 && hasH1) {
    heroEl = h1El.parent();
  }

  const found = hasH1 || Boolean(layout.h1);
  const heroBbox = layout.h1
    ? { x: 0, y: Math.max(0, layout.h1.y - 100), w: 1440, h: 800 }
    : { x: 0, y: 80, w: 1440, h: 700 };

  const heroText = (heroEl.text() || $("body").text().slice(0, 3000)).toLowerCase();

  // 1. Slot: h1_contains_town
  const h1Text = h1El.text().trim();
  const townMatch = matchTownOrState(h1Text);

  if (townMatch.matched && townMatch.token) {
    slots.push({
      slot: "h1_contains_town",
      state: "found",
      evidence: [`H1 headline explicitly localizes service area ("${townMatch.token}")`],
      htmlSnippet: sanitizeSnippet($.html(h1El)),
      bbox: layout.h1,
      confidence: 0.95,
    });
  } else if (matchTownOrState(heroText.slice(0, 1000)).matched) {
    slots.push({
      slot: "h1_contains_town",
      state: "partial",
      evidence: ["Location mentioned in hero subheadline, but missing from primary H1"],
      confidence: 0.8,
    });
  } else {
    slots.push({
      slot: "h1_contains_town",
      state: "missing",
      evidence: ["H1 headline lacks a city or state location cue"],
      confidence: 0.9,
    });
  }

  // 2. Slot: owner_face
  // Match faces found in images categorized as hero or near top
  const heroFaces = faces.filter((f) => {
    if (STOCK_HINTS.test(f.imageSrc)) return false;
    const imgLayout = layout.images.find((img) => img.src === f.imageSrc);
    if (!imgLayout) return false;
    return (
      (imgLayout.sectionGuess === "hero" || imgLayout.bbox.y <= 1100) &&
      f.count >= 1 &&
      f.largestAreaRatio >= 0.02
    );
  });

  if (heroFaces.length > 0) {
    const topFace = heroFaces[0];
    slots.push({
      slot: "owner_face",
      state: "found",
      evidence: [`Real human face detected in hero image (${topFace.count} face(s), area ratio ${(topFace.largestAreaRatio * 100).toFixed(1)}%)`],
      confidence: 0.9,
    });
  } else {
    slots.push({
      slot: "owner_face",
      state: "missing",
      evidence: ["No genuine human/owner face detected in hero banner"],
      confidence: 0.85,
    });
  }

  // 3. Slot: branded_truck
  const truckImg = layout.images.find((img) => {
    const altOrSrc = `${img.alt || ""} ${img.src}`.toLowerCase();
    const isTruck = /truck|van|fleet|vehicle|work[- ]truck/i.test(altOrSrc);
    return isTruck && (img.sectionGuess === "hero" || img.bbox.y <= 1200);
  });

  if (truckImg) {
    slots.push({
      slot: "branded_truck",
      state: "found",
      evidence: [`Branded fleet truck or service vehicle visual detected in hero (${truckImg.alt || "vehicle image"})`],
      bbox: truckImg.bbox,
      confidence: 0.85,
    });
  } else {
    slots.push({
      slot: "branded_truck",
      state: "missing",
      evidence: ["No branded service truck or physical work vehicle visual found in hero"],
      confidence: 0.8,
    });
  }

  // 4. Slot: credential_chips
  let credentialCount = 0;
  const credentialMatches: string[] = [];

  heroEl.find("p, span, div, li, strong").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 0 && text.length < 80) {
      const m = CREDENTIAL_REGEX.exec(text);
      if (m && !credentialMatches.includes(m[0].toLowerCase())) {
        credentialMatches.push(m[0].toLowerCase());
        credentialCount++;
      }
    }
  });

  if (credentialCount >= 2) {
    slots.push({
      slot: "credential_chips",
      state: "found",
      evidence: [`Multiple licensing and credential badges in hero: ${credentialMatches.join(", ")}`],
      confidence: 0.95,
    });
  } else if (credentialCount === 1) {
    slots.push({
      slot: "credential_chips",
      state: "partial",
      evidence: [`Single credential chip present in hero: ${credentialMatches[0]}`],
      confidence: 0.85,
    });
  } else {
    slots.push({
      slot: "credential_chips",
      state: "missing",
      evidence: ["No license, insurance, or BBB credential chips in hero"],
      confidence: 0.9,
    });
  }

  // 5. Slot: review_badges
  let reviewBadgeCount = 0;
  const foundBadges: string[] = [];

  heroEl.find("img, svg, [class*='badge'], [class*='rating']").each((_, el) => {
    const src = $(el).attr("src") || "";
    const alt = $(el).attr("alt") || "";
    const cls = $(el).attr("class") || "";
    const combined = `${src} ${alt} ${cls}`.toLowerCase();
    const m = REVIEW_BADGE_REGEX.exec(combined);
    if (m && !foundBadges.includes(m[0])) {
      foundBadges.push(m[0]);
      reviewBadgeCount++;
    }
  });

  if (reviewBadgeCount >= 1) {
    slots.push({
      slot: "review_badges",
      state: "found",
      evidence: [`Reputation platform badges highlighted in hero: ${foundBadges.join(", ")}`],
      confidence: 0.9,
    });
  } else {
    slots.push({
      slot: "review_badges",
      state: "missing",
      evidence: ["No review platform badges (Google, Facebook, Yelp) displayed in hero"],
      confidence: 0.85,
    });
  }

  // 6. Slot: quote_form_above_fold
  if (layout.firstForm) {
    const isAboveFold = layout.firstForm.y <= 900;
    if (isAboveFold) {
      slots.push({
        slot: "quote_form_above_fold",
        state: "found",
        evidence: [`Interactive quote/inquiry form situated above the fold (y: ${layout.firstForm.y}px)`],
        bbox: layout.firstForm,
        confidence: 1.0,
      });
    } else {
      slots.push({
        slot: "quote_form_above_fold",
        state: "partial",
        evidence: [`Quote form exists but requires scrolling below the fold (y: ${layout.firstForm.y}px)`],
        bbox: layout.firstForm,
        confidence: 0.9,
      });
    }
  } else {
    slots.push({
      slot: "quote_form_above_fold",
      state: "missing",
      evidence: ["No interactive estimate or quote form present above the fold"],
      confidence: 0.9,
    });
  }

  // 7. Slot: risk_reversal_phrase
  const riskMatch = RISK_REVERSAL_REGEX.exec(heroText);
  if (riskMatch) {
    slots.push({
      slot: "risk_reversal_phrase",
      state: "found",
      evidence: [`Prominent risk-reversal offer in hero ("${riskMatch[0]}")`],
      confidence: 0.95,
    });
  } else {
    slots.push({
      slot: "risk_reversal_phrase",
      state: "missing",
      evidence: ["No guarantee, warranty, or risk-reversal phrase in hero"],
      confidence: 0.9,
    });
  }

  return {
    region: "hero",
    found,
    scrollDepth: layout.h1 ? Math.max(0, layout.h1.y - 80) : 80,
    scrollIndex: 1,
    slots,
  };
}
