import { describe, it, expect } from "vitest";
import { extractBlueprint, isWeakBlueprint } from "./blueprint";
import { scoreTrust } from "./score";
import type { TrustSignals, Region, RegionMatch } from "./types";

function createMockSignals(overrides?: Partial<TrustSignals>): TrustSignals {
  const regions: Record<Region, RegionMatch> = {
    header: {
      region: "header",
      found: true,
      scrollDepth: 0,
      scrollIndex: 1,
      slots: [
        { slot: "phone_link", state: "found", evidence: ["1-800-555-0199"], confidence: 1 },
        { slot: "logo_present", state: "found", evidence: ["ROC #123456"], confidence: 1 },
      ],
    },
    hero: {
      region: "hero",
      found: true,
      scrollDepth: 80,
      scrollIndex: 1,
      slots: [
        { slot: "owner_face", state: "found", evidence: ["Hero face detected"], confidence: 1 },
        { slot: "risk_reversal_phrase", state: "found", evidence: ["Lifetime Warranty"], confidence: 1 },
      ],
    },
    reviews: {
      region: "reviews",
      found: true,
      scrollDepth: 600,
      scrollIndex: 1,
      slots: [
        { slot: "star_rating_shown", state: "found", evidence: ["4.9 Stars"], confidence: 1 },
        { slot: "review_count_shown", state: "found", evidence: ["250+ Reviews"], confidence: 1 },
      ],
    },
    about: {
      region: "about",
      found: true,
      scrollDepth: 1200,
      scrollIndex: 2,
      slots: [
        { slot: "founder_photo", state: "found", evidence: ["Founder image"], confidence: 1 },
        { slot: "years_in_business", state: "found", evidence: ["25 Years Serving Area"], confidence: 1 },
      ],
    },
  };

  return {
    url: "https://example.com",
    capturedAt: new Date().toISOString(),
    regions,
    ...overrides,
  };
}

describe("Blueprint Extraction & Scoring", () => {
  it("extracts a complete blueprint from detected signals", () => {
    const signals = createMockSignals();
    const blueprint = extractBlueprint(signals, "roofing", "portfolio-piece-123");

    expect(blueprint.niche).toBe("roofing");
    expect(blueprint.sourcePortfolioPieceId).toBe("portfolio-piece-123");
    expect(blueprint.regions.header.present).toBe(true);
    expect(blueprint.regions.header.slots.length).toBe(2);
    expect(blueprint.regions.header.slots[0].slot).toBe("phone_link");
    expect(blueprint.regions.header.slots[0].state).toBe("present");
    expect(blueprint.regions.hero.slots.length).toBe(2);
  });

  it("identifies a weak blueprint with fewer than 3 regions", () => {
    const signals = createMockSignals({
      regions: {
        header: { region: "header", found: true, scrollDepth: 0, scrollIndex: 1, slots: [] },
        hero: { region: "hero", found: false, scrollDepth: 0, scrollIndex: 0, slots: [] },
        reviews: { region: "reviews", found: false, scrollDepth: 0, scrollIndex: 0, slots: [] },
        about: { region: "about", found: false, scrollDepth: 0, scrollIndex: 0, slots: [] },
      },
    });

    const bp = extractBlueprint(signals, "hvac", "piece-weak");
    expect(isWeakBlueprint(bp)).toBe(true);

    const fullBp = extractBlueprint(createMockSignals(), "hvac", "piece-strong");
    expect(isWeakBlueprint(fullBp)).toBe(false);
  });

  it("applies blueprint slot weights when scoring prospect signals", () => {
    // Prospect missing risk reversal and owner headshot
    const prospectSignals = createMockSignals({
      regions: {
        header: {
          region: "header",
          found: true,
          scrollDepth: 0,
          scrollIndex: 1,
          slots: [{ slot: "phone_link", state: "found", evidence: [], confidence: 1 }],
        },
        hero: {
          region: "hero",
          found: true,
          scrollDepth: 80,
          scrollIndex: 1,
          slots: [], // Missing risk_reversal_phrase
        },
        reviews: {
          region: "reviews",
          found: true,
          scrollDepth: 600,
          scrollIndex: 1,
          slots: [{ slot: "star_rating_shown", state: "found", evidence: [], confidence: 1 }],
        },
        about: {
          region: "about",
          found: false,
          scrollDepth: 0,
          scrollIndex: 0,
          slots: [],
        },
      },
    });

    // Score without blueprint (baseline)
    const baselineScores = scoreTrust(prospectSignals);
    const baselineRiskRow = baselineScores.find((r) => r.key === "risk_reversal_usp");

    // Portfolio piece where risk reversal was present
    const portfolioBp = extractBlueprint(createMockSignals(), "roofing", "standard-piece");

    // Score with blueprint
    const bpScores = scoreTrust(prospectSignals, portfolioBp);
    const bpRiskRow = bpScores.find((r) => r.key === "risk_reversal_usp");

    // With blueprint penalizing missing risk reversal when blueprint had it
    expect(baselineRiskRow).toBeDefined();
    expect(bpRiskRow).toBeDefined();
    expect(bpRiskRow?.state).toBe("missing");
  });
});
