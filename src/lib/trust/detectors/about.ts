import type { RegionMatch, SlotFinding } from "../types";
import { type DetectorContext, sanitizeSnippet } from "./context";
import * as cheerio from "cheerio";

const ABOUT_HEADING_REGEX = /\b(about us|our story|meet the (team|owner|founder)|who we are|about our company|family owned since|our mission)\b/i;
const FIRST_PERSON_REGEX = /\b(I|we|our|my|us)\b/gi;
const SIGNATURE_REGEX = /signature|signed|founder[- ]sign/i;

/**
 * Calculates pronoun density: count of (I, we, our, my, us) divided by total word count.
 */
function calculateFirstPersonDensity(text: string): { density: number; count: number } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { density: 0, count: 0 };
  const matches = text.match(FIRST_PERSON_REGEX) || [];
  return {
    density: Number((matches.length / words.length).toFixed(4)),
    count: matches.length,
  };
}

/**
 * About Us detector:
 * Identifies the founder/backstory/team section on the homepage,
 * or follows a single off-homepage /about link if absent on the homepage.
 */
export async function detectAbout(ctx: DetectorContext): Promise<RegionMatch> {
  const { $, layout, faces, baseUrl } = ctx;
  const slots: SlotFinding[] = [];

  let aboutEl: cheerio.Cheerio<any> = $("section[class*='about'], section[id*='about'], div[class*='about'], div[id*='about']").first();

  if (aboutEl.length === 0) {
    $("h2, h3, h4").each((_, el) => {
      if (aboutEl.length > 0) return;
      const text = $(el).text();
      if (ABOUT_HEADING_REGEX.test(text)) {
        aboutEl = $(el).closest("section, div[class*='section'], main > div");
      }
    });
  }

  let onHomepage = aboutEl.length > 0;
  let isOffHomepage = false;
  let activeCheerio = $;
  let activeSectionEl = aboutEl;

  // If not found on homepage, check for an outbound /about link
  if (!onHomepage && baseUrl) {
    let aboutHref: string | undefined;
    $("a[href]").each((_, el) => {
      if (aboutHref) return;
      const href = $(el).attr("href") || "";
      const text = $(el).text().toLowerCase();
      if (
        (href.includes("/about") || text.includes("about us") || text.includes("our story")) &&
        !href.startsWith("tel:") &&
        !href.startsWith("mailto:")
      ) {
        aboutHref = href;
      }
    });

    if (aboutHref) {
      try {
        const targetUrl = new URL(aboutHref, baseUrl).toString();
        const res = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const offHtml = await res.text();
          activeCheerio = cheerio.load(offHtml);
          activeSectionEl = activeCheerio("body");
          isOffHomepage = true;
          onHomepage = false;
        }
      } catch {
        // Off-homepage fetch failed gracefully
      }
    }
  }

  const found = onHomepage || isOffHomepage;
  const aboutLayout = layout.sections.find(
    (s) => s.selectorPath.includes("about") || s.headingText?.toLowerCase().includes("about")
  );
  const scrollDepth = onHomepage ? (aboutLayout?.bbox.y ?? 1800) : 0;
  const scrollIndex = Math.max(1, Math.ceil(scrollDepth / 900));

  const sectionText = activeSectionEl.text() || "";

  // 1. Slot: owner_photo
  const aboutFaces = faces.filter((f) => {
    const imgLayout = layout.images.find((img) => img.src === f.imageSrc);
    return (
      (imgLayout?.sectionGuess === "about" || (imgLayout && imgLayout.bbox.y > 1100)) &&
      f.count >= 1
    );
  });

  const hasOwnerPhoto = aboutFaces.length > 0 || (isOffHomepage && activeCheerio("img").length > 0);

  slots.push({
    slot: "owner_photo",
    state: hasOwnerPhoto ? "found" : "missing",
    evidence: hasOwnerPhoto
      ? ["Authentic photo of founder/team present in the About section"]
      : ["No founder or team photo found in the About section"],
    confidence: hasOwnerPhoto ? 0.9 : 0.85,
  });

  // 2. Slot: first_person_bio
  const { density, count } = calculateFirstPersonDensity(sectionText);
  const hasFirstPerson = density >= 0.015 || count >= 5;

  if (hasFirstPerson) {
    slots.push({
      slot: "first_person_bio",
      state: "found",
      evidence: [`Story written in authentic first-person voice (${count} personal pronouns, ${(density * 100).toFixed(1)}% density)`],
      confidence: 0.95,
    });
  } else if (count >= 2) {
    slots.push({
      slot: "first_person_bio",
      state: "partial",
      evidence: [`Light first-person pronoun usage (${count} pronouns), but reads mostly corporate`],
      confidence: 0.85,
    });
  } else {
    slots.push({
      slot: "first_person_bio",
      state: "missing",
      evidence: ["About copy lacks personal first-person voice ('I', 'we', 'our')"],
      confidence: 0.9,
    });
  }

  // 3. Slot: signature_image
  let signatureFound = false;
  activeSectionEl.find("img, svg").each((_, el) => {
    if (signatureFound) return;
    const src = activeCheerio(el).attr("src")?.toLowerCase() || "";
    const alt = activeCheerio(el).attr("alt")?.toLowerCase() || "";
    if (SIGNATURE_REGEX.test(src) || SIGNATURE_REGEX.test(alt)) {
      signatureFound = true;
    }
  });

  slots.push({
    slot: "signature_image",
    state: signatureFound ? "found" : "missing",
    evidence: signatureFound
      ? ["Personal founder signature graphic found below company bio"]
      : ["Missing personal founder handwritten signature graphic"],
    confidence: signatureFound ? 0.95 : 0.85,
  });

  // 4. Slot: company_logo_in_section
  const logoInSection = activeSectionEl.find("img[src*='logo'], [class*='logo']").length > 0;
  slots.push({
    slot: "company_logo_in_section",
    state: logoInSection ? "found" : "missing",
    evidence: logoInSection
      ? ["Company logo branding re-stated in About section"]
      : ["Company logo branding omitted from About section"],
    confidence: logoInSection ? 0.9 : 0.8,
  });

  // 5. Slot: cta_button
  const ctaInSection = activeSectionEl.find("a, button, [role='button']").filter((_, el) => {
    const text = activeCheerio(el).text().toLowerCase();
    return /quote|estimate|contact|call|schedule|get in touch/i.test(text);
  }).length > 0;

  slots.push({
    slot: "cta_button",
    state: ctaInSection ? "found" : "missing",
    evidence: ctaInSection
      ? ["Call-to-action button placed at conclusion of About story"]
      : ["Missing conversion call-to-action button after About story"],
    confidence: ctaInSection ? 0.9 : 0.85,
  });

  // 6. Slot: on_homepage
  slots.push({
    slot: "on_homepage",
    state: onHomepage ? "found" : "missing",
    evidence: onHomepage
      ? ["About/founder story featured directly on the main homepage"]
      : isOffHomepage
        ? ["About section is tucked away on a separate /about subpage"]
        : ["No About section found on homepage or navigation links"],
    confidence: 1.0,
  });

  return {
    region: "about",
    found,
    scrollDepth,
    scrollIndex,
    isOffHomepage,
    slots,
  };
}
