import type { RegionMatch, SlotFinding } from "../types";
import { type DetectorContext } from "./context";
import { extractTrustLinksFromDom } from "../scrape-signals";
import * as cheerio from "cheerio";

const STAR_CHARS = /[★⭐]|&#9733;|&starf;/;
const RATING_VAL_REGEX = /\b(?:[45]\.\d(?:\s*\/\s*5)?|5(?:\.0)?\s*stars?)\b/i;
const REVIEW_COUNT_REGEX = /\b(?:\(\s*\d{1,4}\s*(?:reviews?|ratings?)?\s*\)|\d{1,4}\+?\s*(?:five[- ]star\s*)?(?:google\s*|customer\s*)?reviews?)\b/i;

/**
 * Reviews region detector:
 * Identifies the social proof & reviews section on the page (or embedded widgets)
 * and audits platform logos, star ratings, review counts, source links, card counts, and fold position.
 */
export function detectReviews(ctx: DetectorContext): RegionMatch {
  const { $, layout } = ctx;
  const slots: SlotFinding[] = [];

  // Find reviews section:
  // 1. Check layout review widgets
  const hasWidget = layout.reviewWidgets.length > 0;
  const widgetBox = layout.reviewWidgets[0]?.bbox;

  // 2. Check DOM sections
  let reviewSectionEl: cheerio.Cheerio<any> = $(
    "section[class*='review'], section[class*='testimonial'], div[class*='review'], div[id*='review'], div[class*='testimonial'], div[id*='testimonial']"
  ).first();

  if (reviewSectionEl.length === 0) {
    // Check headings
    $("h2, h3, h4").each((_, el) => {
      if (reviewSectionEl.length > 0) return;
      const text = $(el).text().toLowerCase();
      if (text.includes("reviews") || text.includes("testimonials") || text.includes("what our customers say") || text.includes("reputation")) {
        reviewSectionEl = $(el).closest("section, div[class*='section'], main > div");
      }
    });
  }

  const reviewLayout = layout.sections.find(
    (s) =>
      s.selectorPath.includes("review") ||
      s.selectorPath.includes("testimonial") ||
      s.headingText?.toLowerCase().includes("review")
  );

  const found = hasWidget || reviewSectionEl.length > 0 || Boolean(reviewLayout);
  const scrollDepth = widgetBox?.y ?? reviewLayout?.bbox.y ?? 1200;
  const scrollIndex = Math.max(1, Math.ceil(scrollDepth / 900));

  const sectionText = (reviewSectionEl.text() || $("body").text().slice(0, 5000)).toLowerCase();

  // 1. Slot: platform_logo_on_cards
  let hasPlatformLogo = false;
  let logoName = "";

  reviewSectionEl.find("img, svg, [class*='logo'], [class*='badge']").each((_: number, el: any) => {
    if (hasPlatformLogo) return;
    const src = $(el).attr("src")?.toLowerCase() || "";
    const alt = $(el).attr("alt")?.toLowerCase() || "";
    const cls = $(el).attr("class")?.toLowerCase() || "";
    const combined = `${src} ${alt} ${cls}`;

    if (combined.includes("google")) {
      hasPlatformLogo = true;
      logoName = "Google";
    } else if (combined.includes("facebook") || combined.includes("meta")) {
      hasPlatformLogo = true;
      logoName = "Facebook";
    } else if (combined.includes("yelp")) {
      hasPlatformLogo = true;
      logoName = "Yelp";
    } else if (combined.includes("bbb")) {
      hasPlatformLogo = true;
      logoName = "BBB";
    }
  });

  if (hasWidget && !hasPlatformLogo) {
    hasPlatformLogo = true;
    logoName = layout.reviewWidgets[0].provider;
  }

  slots.push({
    slot: "platform_logo_on_cards",
    state: hasPlatformLogo ? "found" : "missing",
    evidence: hasPlatformLogo
      ? [`Recognizable review platform branding present (${logoName})`]
      : ["No third-party review platform logo (Google, Yelp, Facebook) shown on testimonials"],
    confidence: hasPlatformLogo ? 0.95 : 0.85,
  });

  // 2. Slot: star_rating_shown
  const hasStarChar = STAR_CHARS.test(reviewSectionEl.html() || "");
  const hasStarClass = reviewSectionEl.find("[class*='star'], [class*='rating'], svg[class*='star']").length > 0;
  const hasRatingValue = RATING_VAL_REGEX.test(sectionText);
  const starsShown = hasStarChar || hasStarClass || hasRatingValue || hasWidget;

  slots.push({
    slot: "star_rating_shown",
    state: starsShown ? "found" : "missing",
    evidence: starsShown
      ? ["Visual star rating or numeric rating score prominently displayed"]
      : ["Missing visual star ratings (5-star icons or score)"],
    confidence: starsShown ? 0.95 : 0.9,
  });

  // 3. Slot: review_count_shown
  const countMatch = REVIEW_COUNT_REGEX.exec(sectionText);
  let reviewCountFound = Boolean(countMatch);

  // Also check JSON-LD
  if (!reviewCountFound) {
    $("script[type='application/ld+json']").each((_, el) => {
      if (reviewCountFound) return;
      try {
        const data = JSON.parse($(el).html() || "");
        if (data.aggregateRating?.reviewCount || data.aggregateRating?.ratingCount) {
          reviewCountFound = true;
        }
      } catch {}
    });
  }

  slots.push({
    slot: "review_count_shown",
    state: reviewCountFound ? "found" : "missing",
    evidence: reviewCountFound
      ? [`Total volume of verified customer reviews stated (${countMatch ? countMatch[0] : "JSON-LD schema"})`]
      : ["Total review count / volume is not mentioned"],
    confidence: reviewCountFound ? 0.9 : 0.85,
  });

  // 4. Slot: link_back_to_source
  const trustLinks = extractTrustLinksFromDom($);
  const hasExternalLink = Object.values(trustLinks).some((l) => l.found);
  const activePlatforms = Object.entries(trustLinks)
    .filter(([_, val]) => val.found)
    .map(([key]) => key);

  slots.push({
    slot: "link_back_to_source",
    state: hasExternalLink ? "found" : "missing",
    evidence: hasExternalLink
      ? [`Direct links back to verified third-party profiles: ${activePlatforms.join(", ")}`]
      : ["Testimonials are not linked back to verifiable third-party review platforms"],
    confidence: hasExternalLink ? 1.0 : 0.9,
  });

  // 5. Slot: card_count
  const cardElements = reviewSectionEl.find(
    "[class*='card'], [class*='item'], blockquote, [class*='slide'], [class*='testimonial']"
  );
  const cardCount = cardElements.length;

  if (cardCount >= 3 || hasWidget) {
    slots.push({
      slot: "card_count",
      state: "found",
      evidence: [`Strong social proof volume with ${cardCount >= 3 ? cardCount : "widget-fed"} customer review cards`],
      confidence: 0.9,
    });
  } else if (cardCount >= 1) {
    slots.push({
      slot: "card_count",
      state: "partial",
      evidence: [`Limited customer proof cards displayed (${cardCount})`],
      confidence: 0.85,
    });
  } else {
    slots.push({
      slot: "card_count",
      state: "missing",
      evidence: ["No distinct customer testimonial cards or quotes found"],
      confidence: 0.85,
    });
  }

  // 6. Slot: position_above_fold
  const isAboveFold = scrollDepth <= 900;
  slots.push({
    slot: "position_above_fold",
    state: isAboveFold ? "found" : "missing",
    evidence: isAboveFold
      ? [`Social proof or reviews widget situated above the fold (${scrollDepth}px)`]
      : [`Reviews section placed deep down the page (${scrollDepth}px from top)`],
    confidence: 0.95,
  });

  return {
    region: "reviews",
    found,
    scrollDepth,
    scrollIndex,
    slots,
  };
}
