import type {
  Blueprint,
  Region,
  RowKey,
  ScoreBand,
  SlotFinding,
  SlotState,
  TrustRow,
  TrustSignals,
} from "./types";
import { ROW_KEYS } from "./types";
import { getRowFix, ROW_LABELS } from "./fixes";

interface SlotWeightConfig {
  region: Region;
  slot: string;
  weight: number;
  partialWeight: number;
}

/**
 * Hard-coded contributing slot mapping and weights per row (baseline SOP).
 * Total weight per row sums to 10.
 */
export const ROW_SLOT_WEIGHTS: Record<RowKey, SlotWeightConfig[]> = {
  risk_reversal_usp: [
    { region: "hero", slot: "risk_reversal_phrase", weight: 6, partialWeight: 2 },
    { region: "hero", slot: "credential_chips", weight: 4, partialWeight: 2 },
  ],
  reviews_social_proof: [
    { region: "reviews", slot: "card_count", weight: 3, partialWeight: 1 },
    { region: "reviews", slot: "platform_logo_on_cards", weight: 3, partialWeight: 1 },
    { region: "reviews", slot: "link_back_to_source", weight: 2, partialWeight: 0 },
    { region: "reviews", slot: "position_above_fold", weight: 2, partialWeight: 0 },
  ],
  trust_badges_reputation: [
    { region: "hero", slot: "credential_chips", weight: 4, partialWeight: 2 },
    { region: "reviews", slot: "platform_logo_on_cards", weight: 3, partialWeight: 1 },
    { region: "header", slot: "cta_button_top_right", weight: 3, partialWeight: 1 },
  ],
  personality_face: [
    { region: "hero", slot: "owner_face", weight: 5, partialWeight: 2 },
    { region: "hero", slot: "branded_truck", weight: 3, partialWeight: 1 },
    { region: "about", slot: "owner_photo", weight: 2, partialWeight: 1 },
  ],
  like_know_trust: [
    { region: "about", slot: "first_person_bio", weight: 4, partialWeight: 2 },
    { region: "about", slot: "owner_photo", weight: 3, partialWeight: 1 },
    { region: "about", slot: "signature_image", weight: 3, partialWeight: 0 },
  ],
  emotional_backstory: [
    // 'about_present' acts as a special virtual slot handled below
    { region: "about", slot: "first_person_bio", weight: 3, partialWeight: 1 },
    { region: "about", slot: "signature_image", weight: 2, partialWeight: 0 },
    { region: "about", slot: "on_homepage", weight: 2, partialWeight: 0 },
  ],
};

/**
 * Maps a numeric 0..10 score to a qualitative score band.
 */
export function getScoreBand(score: number): ScoreBand {
  if (score <= 2) return "danger";
  if (score <= 5) return "warning";
  if (score <= 8) return "ok";
  return "strong";
}

/**
 * Maps a score band to a visual SlotState ('missing' | 'partial' | 'found').
 */
export function scoreToSlotState(score: number): SlotState {
  if (score <= 2) return "missing";
  if (score <= 5) return "partial";
  return "found";
}

/**
 * Helper to check if a specific slot is present in a blueprint.
 */
function isSlotInBlueprint(blueprint: Blueprint, region: Region, slot: string): boolean {
  const reg = blueprint.regions[region];
  if (!reg || !reg.present) return false;
  return reg.slots.some((s) => s.slot === slot);
}

/**
 * Deterministic scoring engine:
 * Evaluates TrustSignals against baseline weights (or active Blueprint overrides),
 * returning exactly 6 scored TrustRows.
 */
export function scoreTrust(signals: TrustSignals, blueprint?: Blueprint): TrustRow[] {
  return ROW_KEYS.map((key): TrustRow => {
    const configs = ROW_SLOT_WEIGHTS[key];
    let earnedPoints = 0;
    let maxPossibleWeight = 0;
    const evidenceList: string[] = [];
    const missingSlotIdentifiers: string[] = [];

    // Special case for emotional_backstory: 3 points if about section exists at all
    if (key === "emotional_backstory") {
      const aboutPresent = signals.regions.about.found;
      const baseWeight = 3;
      maxPossibleWeight += baseWeight;
      if (aboutPresent) {
        earnedPoints += baseWeight;
        evidenceList.push("About section exists on prospect website");
      } else {
        missingSlotIdentifiers.push("about.found");
      }
    }

    for (const cfg of configs) {
      // If a blueprint is active, check if this slot is active in the blueprint
      const isAllowedByBlueprint = blueprint
        ? isSlotInBlueprint(blueprint, cfg.region, cfg.slot)
        : true;

      // If slot is not in the active blueprint, drop weight to 0
      if (!isAllowedByBlueprint) {
        continue;
      }

      maxPossibleWeight += cfg.weight;

      const regionMatch = signals.regions[cfg.region];
      const slotFinding = regionMatch?.slots.find((s) => s.slot === cfg.slot);

      if (slotFinding) {
        if (slotFinding.state === "found") {
          earnedPoints += cfg.weight;
          evidenceList.push(...slotFinding.evidence);
        } else if (slotFinding.state === "partial") {
          earnedPoints += cfg.partialWeight;
          evidenceList.push(...slotFinding.evidence);
          missingSlotIdentifiers.push(`${cfg.region}.${cfg.slot}`);
        } else {
          missingSlotIdentifiers.push(`${cfg.region}.${cfg.slot}`);
        }
      } else {
        missingSlotIdentifiers.push(`${cfg.region}.${cfg.slot}`);
      }
    }

    // Scale earned points to 0..10 integer
    let finalScore = 0;
    if (maxPossibleWeight > 0) {
      finalScore = Math.min(10, Math.max(0, Math.round((earnedPoints / maxPossibleWeight) * 10)));
    }

    const state = scoreToSlotState(finalScore);
    const fix = getRowFix(key, missingSlotIdentifiers);

    return {
      key,
      label: ROW_LABELS[key],
      score: finalScore,
      state,
      fix,
      evidence: evidenceList.slice(0, 4),
    };
  });
}

/**
 * Calculates overall trust score on a 0..100 scale from the 6 row scores.
 */
export function calculateOverallTrustScore(rows: TrustRow[]): number {
  if (rows.length === 0) return 0;
  const sum = rows.reduce((acc, r) => acc + r.score, 0);
  const maxPossible = rows.length * 10;
  return Math.min(100, Math.max(0, Math.round((sum / maxPossible) * 100)));
}

/**
 * Counts how many of the 4 key regions (header, hero, reviews, about) are present.
 */
export function countSectionsPresent(signals: TrustSignals): number {
  return Object.values(signals.regions).filter((r) => r.found).length;
}
