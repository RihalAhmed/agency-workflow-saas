import { describe, expect, test } from "vitest";
import {
  calculateOverallTrustScore,
  countSectionsPresent,
  getScoreBand,
  scoreToSlotState,
  scoreTrust,
} from "./score";
import { TrustRowsSchema } from "./schemas";
import type { Blueprint, Region, RegionMatch, TrustSignals } from "./types";
import { REGIONS } from "./types";

const makeSignals = (state: "found" | "missing"): TrustSignals => {
  const isFound = state === "found";
  const regions: Record<Region, RegionMatch> = {
    header: {
      region: "header",
      found: isFound,
      scrollDepth: 0,
      scrollIndex: 1,
      slots: [
        { slot: "logo_present", state, evidence: ["logo"], confidence: 1 },
        { slot: "phone_link", state, evidence: ["phone"], confidence: 1 },
        { slot: "nav_items_count", state, evidence: ["nav"], confidence: 1 },
        { slot: "cta_button_top_right", state, evidence: ["cta"], confidence: 1 },
      ],
    },
    hero: {
      region: "hero",
      found: isFound,
      scrollDepth: 80,
      scrollIndex: 1,
      slots: [
        { slot: "h1_contains_town", state, evidence: ["town"], confidence: 1 },
        { slot: "owner_face", state, evidence: ["face"], confidence: 1 },
        { slot: "branded_truck", state, evidence: ["truck"], confidence: 1 },
        { slot: "credential_chips", state, evidence: ["chips"], confidence: 1 },
        { slot: "review_badges", state, evidence: ["badges"], confidence: 1 },
        { slot: "quote_form_above_fold", state, evidence: ["form"], confidence: 1 },
        { slot: "risk_reversal_phrase", state, evidence: ["guarantee"], confidence: 1 },
      ],
    },
    reviews: {
      region: "reviews",
      found: isFound,
      scrollDepth: 600,
      scrollIndex: 1,
      slots: [
        { slot: "platform_logo_on_cards", state, evidence: ["google"], confidence: 1 },
        { slot: "star_rating_shown", state, evidence: ["stars"], confidence: 1 },
        { slot: "review_count_shown", state, evidence: ["count"], confidence: 1 },
        { slot: "link_back_to_source", state, evidence: ["link"], confidence: 1 },
        { slot: "card_count", state, evidence: ["cards"], confidence: 1 },
        { slot: "position_above_fold", state, evidence: ["fold"], confidence: 1 },
      ],
    },
    about: {
      region: "about",
      found: isFound,
      scrollDepth: 1200,
      scrollIndex: 2,
      slots: [
        { slot: "owner_photo", state, evidence: ["photo"], confidence: 1 },
        { slot: "first_person_bio", state, evidence: ["bio"], confidence: 1 },
        { slot: "signature_image", state, evidence: ["signature"], confidence: 1 },
        { slot: "company_logo_in_section", state, evidence: ["logo"], confidence: 1 },
        { slot: "cta_button", state, evidence: ["cta"], confidence: 1 },
        { slot: "on_homepage", state, evidence: ["homepage"], confidence: 1 },
      ],
    },
  };

  return {
    url: "https://test.com",
    capturedAt: new Date().toISOString(),
    regions,
  };
};

describe("Scoring Engine", () => {
  test("all-missing input produces all-zero scores and 0 overall score", () => {
    const missingSignals = makeSignals("missing");
    const rows = scoreTrust(missingSignals);

    // Conforms to 6-row schema
    expect(TrustRowsSchema.safeParse(rows).success).toBe(true);
    expect(rows.length).toBe(6);

    for (const r of rows) {
      expect(r.score).toBe(0);
      expect(r.state).toBe("missing");
    }

    expect(calculateOverallTrustScore(rows)).toBe(0);
    expect(countSectionsPresent(missingSignals)).toBe(0);
  });

  test("all-found input produces full 10 scores and 100 overall score", () => {
    const foundSignals = makeSignals("found");
    const rows = scoreTrust(foundSignals);

    expect(TrustRowsSchema.safeParse(rows).success).toBe(true);

    for (const r of rows) {
      expect(r.score).toBe(10);
      expect(r.state).toBe("found");
    }

    expect(calculateOverallTrustScore(rows)).toBe(100);
    expect(countSectionsPresent(foundSignals)).toBe(4);
  });

  test("score is deterministic (identical inputs yield identical outputs)", () => {
    const s = makeSignals("found");
    const r1 = scoreTrust(s);
    const r2 = scoreTrust(s);
    expect(r1).toEqual(r2);
  });

  test("score bands and slot states map accurately", () => {
    expect(getScoreBand(0)).toBe("danger");
    expect(getScoreBand(2)).toBe("danger");
    expect(getScoreBand(3)).toBe("warning");
    expect(getScoreBand(5)).toBe("warning");
    expect(getScoreBand(6)).toBe("ok");
    expect(getScoreBand(8)).toBe("ok");
    expect(getScoreBand(9)).toBe("strong");
    expect(getScoreBand(10)).toBe("strong");

    expect(scoreToSlotState(2)).toBe("missing");
    expect(scoreToSlotState(4)).toBe("partial");
    expect(scoreToSlotState(7)).toBe("found");
  });

  test("active blueprint overrides missing slots without penalizing prospect", () => {
    const s = makeSignals("missing");
    // Prospect only has owner face in hero
    s.regions.hero.slots.find((x) => x.slot === "owner_face")!.state = "found";

    // Blueprint that does NOT require branded_truck or about.owner_photo
    const customBlueprint: Blueprint = {
      id: crypto.randomUUID(),
      niche: "pest",
      sourcePortfolioPieceId: crypto.randomUUID(),
      regions: {
        header: { present: true, slots: [] },
        hero: {
          present: true,
          slots: [{ slot: "owner_face", state: "present", evidence: [] }],
        },
        reviews: { present: true, slots: [] },
        about: { present: false, slots: [] },
      },
    };

    // Under baseline (all 3 slots active: owner_face=5, truck=3, about_photo=2 = max 10):
    // Earned: 5/10 = score 5
    const baselineRows = scoreTrust(s);
    const baselineFace = baselineRows.find((r) => r.key === "personality_face");
    expect(baselineFace?.score).toBe(5);

    // Under custom blueprint (only owner_face is in the blueprint, max 5):
    // Earned: 5/5 = score 10!
    const customRows = scoreTrust(s, customBlueprint);
    const customFace = customRows.find((r) => r.key === "personality_face");
    expect(customFace?.score).toBe(10);
    expect(customFace?.state).toBe("found");
  });
});
