import { describe, expect, test } from "vitest";
import {
  BBoxSchema,
  BlueprintActivateInput,
  BlueprintRegionSchema,
  BlueprintSchema,
  BlueprintSlotSchema,
  FaceResultSchema,
  ImageFileMetaSchema,
  LayoutImageSchema,
  LayoutMapSchema,
  LayoutReviewWidgetSchema,
  LayoutSectionSchema,
  NicheSchema,
  PortfolioListQuery,
  PortfolioUploadInput,
  RegionMatchSchema,
  RegionSchema,
  RegionSlicesSchema,
  RenderedTrustPageSchema,
  RowKeySchema,
  ScreenshotSourceSchema,
  SlotFindingSchema,
  SlotStateSchema,
  TrustAuditRowSchema,
  TrustComputeInput,
  TrustGetParams,
  TrustOverrideInput,
  TrustPinInput,
  TrustRescoreInput,
  TrustRowSchema,
  TrustRowsSchema,
  TrustScreenshotUploadInput,
  TrustSignalsSchema,
  TrustUnpinInput,
} from "./schemas";
import { REGIONS, ROW_KEYS, type Region, type RegionMatch, type TrustRow } from "./types";

// ---------------------------------------------------------------------------
// Fixture builders
// ---------------------------------------------------------------------------

const uuid = () => crypto.randomUUID();
const bbox = { x: 0, y: 120, w: 1440, h: 600 };

const regionMatch = (region: Region, found = true): RegionMatch => ({
  region,
  found,
  scrollDepth: found ? 120 : 0,
  scrollIndex: found ? 1 : 0,
  slots: [
    { slot: "owner_face", state: found ? "found" : "missing", evidence: ["face in hero"], confidence: 0.9, bbox },
  ],
});

const signals = () => ({
  url: "https://example.com",
  capturedAt: new Date().toISOString(),
  regions: Object.fromEntries(REGIONS.map((r) => [r, regionMatch(r)])) as Record<Region, RegionMatch>,
});

const row = (key: TrustRow["key"], score = 5): TrustRow => ({
  key,
  label: key,
  score,
  state: "partial",
  fix: "Add an owner photo to the hero.",
  evidence: ["hero.owner_face"],
});

const rows = () => ROW_KEYS.map((k) => row(k));

const blueprint = () => ({
  id: uuid(),
  niche: "pest" as const,
  sourcePortfolioPieceId: uuid(),
  regions: Object.fromEntries(
    REGIONS.map((r) => [r, { present: true, slots: [{ slot: "logo_present", state: "present", evidence: [] }] }])
  ),
});

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) =>
  expect(schema.safeParse(v).success).toBe(true);
const bad = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) =>
  expect(schema.safeParse(v).success).toBe(false);

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

describe("enums", () => {
  test("RegionSchema", () => { ok(RegionSchema, "hero"); bad(RegionSchema, "footer"); });
  test("SlotStateSchema", () => { ok(SlotStateSchema, "partial"); bad(SlotStateSchema, "present"); });
  test("NicheSchema", () => { ok(NicheSchema, "hvac"); bad(NicheSchema, "dentist"); });
  test("RowKeySchema", () => { ok(RowKeySchema, "personality_face"); bad(RowKeySchema, "seo"); });
  test("ScreenshotSourceSchema", () => { ok(ScreenshotSourceSchema, "playwright"); bad(ScreenshotSourceSchema, "none"); });
});

describe("BBoxSchema", () => {
  test("accepts a box", () => ok(BBoxSchema, bbox));
  test("rejects negative width", () => bad(BBoxSchema, { ...bbox, w: -1 }));
  test("rejects NaN", () => bad(BBoxSchema, { ...bbox, y: NaN }));
});

// ---------------------------------------------------------------------------
// Render pipeline
// ---------------------------------------------------------------------------

describe("LayoutImageSchema", () => {
  test("accepts background image with section guess", () =>
    ok(LayoutImageSchema, { src: "/hero.jpg", isBackground: true, bbox, sectionGuess: "hero" }));
  test("rejects unknown sectionGuess", () =>
    bad(LayoutImageSchema, { src: "/x.jpg", isBackground: false, bbox, sectionGuess: "footer" }));
});

describe("LayoutSectionSchema", () => {
  test("accepts", () => ok(LayoutSectionSchema, { selectorPath: "body>section:nth-of-type(2)", bbox }));
  test("rejects missing bbox", () => bad(LayoutSectionSchema, { selectorPath: "section" }));
});

describe("LayoutReviewWidgetSchema", () => {
  test("accepts", () => ok(LayoutReviewWidgetSchema, { provider: "elfsight", bbox }));
  test("rejects missing provider", () => bad(LayoutReviewWidgetSchema, { bbox }));
});

describe("LayoutMapSchema", () => {
  test("accepts empty page", () => ok(LayoutMapSchema, { images: [], sections: [], reviewWidgets: [] }));
  test("rejects missing arrays", () => bad(LayoutMapSchema, { h1: bbox }));
});

describe("FaceResultSchema", () => {
  test("accepts", () => ok(FaceResultSchema, { imageSrc: "/owner.jpg", count: 1, largestAreaRatio: 0.08 }));
  test("rejects ratio > 1", () => bad(FaceResultSchema, { imageSrc: "/a.jpg", count: 1, largestAreaRatio: 1.5 }));
  test("rejects fractional count", () => bad(FaceResultSchema, { imageSrc: "/a.jpg", count: 1.5, largestAreaRatio: 0.1 }));
});

describe("RenderedTrustPageSchema", () => {
  const page = { html: "<html></html>", layout: { images: [], sections: [], reviewWidgets: [] }, faces: [] };
  test("accepts 'none' source (schematic fallback)", () => ok(RenderedTrustPageSchema, { ...page, screenshotSource: "none" }));
  test("rejects unknown source", () => bad(RenderedTrustPageSchema, { ...page, screenshotSource: "puppeteer" }));
});

// ---------------------------------------------------------------------------
// TrustSignals
// ---------------------------------------------------------------------------

describe("SlotFindingSchema", () => {
  test("accepts", () => ok(SlotFindingSchema, regionMatch("hero").slots[0]));
  test("rejects confidence > 1", () => bad(SlotFindingSchema, { ...regionMatch("hero").slots[0], confidence: 2 }));
});

describe("RegionMatchSchema", () => {
  test("accepts found region", () => ok(RegionMatchSchema, regionMatch("reviews")));
  test("accepts missing region", () => ok(RegionMatchSchema, regionMatch("about", false)));
  test("rejects negative scrollIndex", () => bad(RegionMatchSchema, { ...regionMatch("hero"), scrollIndex: -1 }));
});

describe("TrustSignalsSchema", () => {
  test("accepts all four regions", () => ok(TrustSignalsSchema, signals()));
  test("rejects a missing region (exhaustive record)", () => {
    const s = signals();
    delete (s.regions as Partial<Record<Region, RegionMatch>>).about;
    bad(TrustSignalsSchema, s);
  });
  test("rejects region key/value mismatch", () => {
    const s = signals();
    s.regions.hero = regionMatch("header");
    bad(TrustSignalsSchema, s);
  });
  test("rejects non-ISO capturedAt", () => bad(TrustSignalsSchema, { ...signals(), capturedAt: "yesterday" }));
});

// ---------------------------------------------------------------------------
// TrustRow
// ---------------------------------------------------------------------------

describe("TrustRowSchema", () => {
  test("accepts", () => ok(TrustRowSchema, row("like_know_trust", 7)));
  test("accepts zero (all-missing)", () => ok(TrustRowSchema, row("emotional_backstory", 0)));
  test("rejects score > 10", () => bad(TrustRowSchema, row("personality_face", 11)));
  test("rejects non-integer score", () => bad(TrustRowSchema, row("personality_face", 6.5)));
});

describe("TrustRowsSchema", () => {
  test("accepts six unique rows", () => ok(TrustRowsSchema, rows()));
  test("rejects five rows", () => bad(TrustRowsSchema, rows().slice(0, 5)));
  test("rejects duplicate keys", () => {
    const r = rows();
    r[5] = row("risk_reversal_usp");
    bad(TrustRowsSchema, r);
  });
});

// ---------------------------------------------------------------------------
// Blueprint
// ---------------------------------------------------------------------------

describe("BlueprintSlotSchema", () => {
  test("accepts", () => ok(BlueprintSlotSchema, { slot: "owner_face", state: "present", evidence: [] }));
  test("rejects non-present state", () => bad(BlueprintSlotSchema, { slot: "owner_face", state: "found", evidence: [] }));
});

describe("BlueprintRegionSchema", () => {
  test("accepts empty region", () => ok(BlueprintRegionSchema, { present: false, slots: [] }));
  test("rejects missing slots", () => bad(BlueprintRegionSchema, { present: true }));
});

describe("BlueprintSchema", () => {
  test("accepts", () => ok(BlueprintSchema, blueprint()));
  test("rejects bad niche", () => bad(BlueprintSchema, { ...blueprint(), niche: "dentist" }));
  test("rejects non-uuid id", () => bad(BlueprintSchema, { ...blueprint(), id: "abc" }));
});

// ---------------------------------------------------------------------------
// Persisted row
// ---------------------------------------------------------------------------

describe("RegionSlicesSchema", () => {
  test("accepts partial slices", () => ok(RegionSlicesSchema, { hero: "id/hero.webp" }));
  test("rejects non-string path", () => bad(RegionSlicesSchema, { hero: 42 }));
});

describe("TrustAuditRowSchema", () => {
  const auditRow = () => ({
    id: uuid(),
    user_id: uuid(),
    audit_id: uuid(),
    prospect_url: "https://example.com",
    niche: "roofing",
    screenshot_url: null,
    screenshot_source: null,
    region_slices: null,
    active_blueprint_id: null,
    signals: signals(),
    scores: rows(),
    overall_score: 50,
    sections_present: 4,
    computed_at: new Date().toISOString(),
  });
  test("accepts schematic-only row", () => ok(TrustAuditRowSchema, auditRow()));
  test("rejects sections_present > 4", () => bad(TrustAuditRowSchema, { ...auditRow(), sections_present: 5 }));
  test("rejects overall_score > 100", () => bad(TrustAuditRowSchema, { ...auditRow(), overall_score: 101 }));
});

// ---------------------------------------------------------------------------
// Uploads and route inputs
// ---------------------------------------------------------------------------

describe("ImageFileMetaSchema", () => {
  test("accepts 5 MB webp", () => ok(ImageFileMetaSchema, { mimeType: "image/webp", size: 5 * 1024 * 1024 }));
  test("rejects > 5 MB", () => bad(ImageFileMetaSchema, { mimeType: "image/png", size: 5 * 1024 * 1024 + 1 }));
  test("rejects gif", () => bad(ImageFileMetaSchema, { mimeType: "image/gif", size: 100 }));
});

describe("route inputs", () => {
  test("TrustComputeInput", () => { ok(TrustComputeInput, { auditId: uuid() }); bad(TrustComputeInput, { auditId: "slug-123" }); });
  test("TrustGetParams", () => { ok(TrustGetParams, { auditId: uuid() }); bad(TrustGetParams, {}); });
  test("TrustScreenshotUploadInput", () => { ok(TrustScreenshotUploadInput, { trustAuditId: uuid() }); bad(TrustScreenshotUploadInput, { trustAuditId: 1 }); });
  test("TrustPinInput", () => {
    ok(TrustPinInput, { trustAuditId: uuid(), rowKey: "personality_face", portfolioPieceId: uuid() });
    bad(TrustPinInput, { trustAuditId: uuid(), rowKey: "nope", portfolioPieceId: uuid() });
  });
  test("TrustUnpinInput", () => { ok(TrustUnpinInput, { trustAuditId: uuid(), rowKey: "like_know_trust" }); bad(TrustUnpinInput, { trustAuditId: uuid() }); });
  test("TrustOverrideInput", () => {
    ok(TrustOverrideInput, { trustAuditId: uuid(), rowKey: "like_know_trust", score: 8 });
    ok(TrustOverrideInput, { trustAuditId: uuid(), rowKey: "like_know_trust", score: null });
    bad(TrustOverrideInput, { trustAuditId: uuid(), rowKey: "like_know_trust", score: 12 });
  });
  test("TrustRescoreInput", () => { ok(TrustRescoreInput, { trustAuditId: uuid() }); bad(TrustRescoreInput, {}); });
  test("PortfolioUploadInput", () => {
    ok(PortfolioUploadInput, { title: "Pacific Coast Gardens", niche: "landscaping", sourceUrl: "https://pcg.com" });
    ok(PortfolioUploadInput, { title: "Upload only", niche: "pest" });
    bad(PortfolioUploadInput, { title: "   ", niche: "pest" });
    bad(PortfolioUploadInput, { title: "X", niche: "pest", sourceUrl: "javascript:alert(1)" });
  });
  test("PortfolioListQuery", () => { ok(PortfolioListQuery, {}); bad(PortfolioListQuery, { niche: "dentist" }); });
  test("BlueprintActivateInput", () => {
    ok(BlueprintActivateInput, { niche: "roofing", blueprintId: uuid() });
    bad(BlueprintActivateInput, { niche: "roofing", blueprintId: "x" });
  });
});
