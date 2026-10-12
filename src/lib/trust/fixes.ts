import type { RowKey, SlotFinding } from "./types";

/**
 * Hard-coded Dean-voice fix templates per row.
 * Written in direct, actionable, agency-pitch style.
 */
export const DEFAULT_ROW_FIXES: Record<RowKey, string> = {
  risk_reversal_usp:
    "Add a bold 100% satisfaction guarantee or free inspection promise directly below the main headline to remove prospect hesitation.",
  reviews_social_proof:
    "Feature at least 3 verified customer quotes with Google badges and clickable links to your public profile above the fold.",
  trust_badges_reputation:
    "Display licensing, insurance, bonded, and BBB accreditation badges prominently in the hero section.",
  personality_face:
    "Replace generic stock photography with a clear, authentic photo of the owner or crew beside a company service vehicle.",
  like_know_trust:
    "Write the company backstory in a personal first-person voice ('I founded this company...') accompanied by an owner portrait and signature.",
  emotional_backstory:
    "Move your founder's journey and family-owned mission directly onto the homepage so prospects immediately know who they are hiring.",
};

export const ROW_LABELS: Record<RowKey, string> = {
  risk_reversal_usp: "Risk Reversal & USP",
  reviews_social_proof: "Reviews & Social Proof",
  trust_badges_reputation: "Trust Badges & Accreditation",
  personality_face: "Personality & Human Face",
  like_know_trust: "Like, Know & Trust Signals",
  emotional_backstory: "Emotional Backstory & Mission",
};

/**
 * Resolves the most specific actionable fix for a row based on missing slot evidence.
 */
export function getRowFix(key: RowKey, missingSlots: string[]): string {
  // If specific slots are missing, return targeted guidance
  if (key === "personality_face") {
    if (missingSlots.includes("hero.owner_face") && missingSlots.includes("hero.branded_truck")) {
      return "Add a real photo of the business owner standing beside a branded company truck in the hero.";
    }
    if (missingSlots.includes("hero.owner_face")) {
      return "Put a genuine face on the business by featuring the owner or lead technician in the hero banner.";
    }
    if (missingSlots.includes("hero.branded_truck")) {
      return "Include a photo of your branded fleet truck or vehicle to prove local physical presence.";
    }
  }

  if (key === "risk_reversal_usp") {
    if (missingSlots.includes("hero.risk_reversal_phrase")) {
      return "State an explicit risk-reversal offer (e.g. '100% Satisfaction Guarantee' or 'No-Risk Estimate') in the hero.";
    }
  }

  if (key === "reviews_social_proof") {
    if (missingSlots.includes("reviews.link_back_to_source")) {
      return "Link your testimonial quotes directly to your Google Maps or Facebook reviews to verify authenticity.";
    }
    if (missingSlots.includes("reviews.position_above_fold")) {
      return "Move your Google star rating widget above the fold so visitors see proof before scrolling.";
    }
  }

  if (key === "like_know_trust") {
    if (missingSlots.includes("about.signature_image")) {
      return "Add an authentic founder signature graphic beneath your bio to personalize the promise.";
    }
  }

  if (key === "emotional_backstory") {
    if (missingSlots.includes("about.on_homepage")) {
      return "Bring your 'Our Story' section onto the homepage instead of hiding it on a separate /about page.";
    }
  }

  return DEFAULT_ROW_FIXES[key];
}
