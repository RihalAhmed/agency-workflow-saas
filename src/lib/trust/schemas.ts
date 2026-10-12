import { z } from "zod";
import {
  NICHES,
  REGIONS,
  ROW_KEYS,
  SCREENSHOT_SOURCES,
  SLOT_STATES,
  type BBox,
  type Blueprint,
  type BlueprintRegion,
  type BlueprintSlot,
  type FaceResult,
  type LayoutImage,
  type LayoutMap,
  type LayoutReviewWidget,
  type LayoutSection,
  type RegionMatch,
  type RegionSlices,
  type RenderedTrustPage,
  type SlotFinding,
  type TrustAuditRow,
  type TrustRow,
  type TrustSignals,
} from "./types";

/**
 * Zod schemas for the Trust Segment.
 *
 * Every domain schema is checked against its interface in ./types.ts with
 * `satisfies z.ZodType<T>`, so a mismatch is a compile error.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const RegionSchema = z.enum(REGIONS);
export const SlotStateSchema = z.enum(SLOT_STATES);
export const NicheSchema = z.enum(NICHES);
export const RowKeySchema = z.enum(ROW_KEYS);
export const ScreenshotSourceSchema = z.enum(SCREENSHOT_SOURCES);

const nonNegative = z.number().finite().min(0);

export const BBoxSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  w: nonNegative,
  h: nonNegative,
}) satisfies z.ZodType<BBox>;

// ---------------------------------------------------------------------------
// Render pipeline
// ---------------------------------------------------------------------------

export const LayoutImageSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
  isBackground: z.boolean(),
  bbox: BBoxSchema,
  sectionGuess: RegionSchema.optional(),
}) satisfies z.ZodType<LayoutImage>;

export const LayoutSectionSchema = z.object({
  selectorPath: z.string(),
  headingText: z.string().optional(),
  bbox: BBoxSchema,
}) satisfies z.ZodType<LayoutSection>;

export const LayoutReviewWidgetSchema = z.object({
  provider: z.string(),
  bbox: BBoxSchema,
}) satisfies z.ZodType<LayoutReviewWidget>;

export const LayoutMapSchema = z.object({
  h1: BBoxSchema.optional(),
  firstForm: BBoxSchema.optional(),
  images: z.array(LayoutImageSchema),
  sections: z.array(LayoutSectionSchema),
  reviewWidgets: z.array(LayoutReviewWidgetSchema),
}) satisfies z.ZodType<LayoutMap>;

export const FaceResultSchema = z.object({
  imageSrc: z.string(),
  count: z.number().int().min(0),
  largestAreaRatio: z.number().min(0).max(1),
}) satisfies z.ZodType<FaceResult>;

export const RenderedTrustPageSchema = z.object({
  html: z.string(),
  layout: LayoutMapSchema,
  screenshotPath: z.string().optional(),
  screenshotSource: z.union([ScreenshotSourceSchema, z.literal("none")]),
  faces: z.array(FaceResultSchema),
  screenshotBuffer: z.instanceof(Buffer).optional(),
}) satisfies z.ZodType<RenderedTrustPage>;

// ---------------------------------------------------------------------------
// TrustSignals
// ---------------------------------------------------------------------------

export const SlotFindingSchema = z.object({
  slot: z.string().min(1),
  state: SlotStateSchema,
  evidence: z.array(z.string()),
  htmlSnippet: z.string().optional(),
  bbox: BBoxSchema.optional(),
  confidence: z.number().min(0).max(1),
}) satisfies z.ZodType<SlotFinding>;

export const RegionMatchSchema = z.object({
  region: RegionSchema,
  found: z.boolean(),
  scrollDepth: nonNegative,
  scrollIndex: z.number().int().min(0),
  isOffHomepage: z.boolean().optional(),
  slots: z.array(SlotFindingSchema),
}) satisfies z.ZodType<RegionMatch>;

/** z.record with an enum key is exhaustive in zod v4 — all four regions required. */
export const TrustSignalsSchema = z
  .object({
    url: z.string(),
    capturedAt: z.iso.datetime(),
    regions: z.record(RegionSchema, RegionMatchSchema),
  })
  .refine(
    (s) => REGIONS.every((r) => s.regions[r].region === r),
    { message: "regions[key].region must equal its key", path: ["regions"] }
  ) satisfies z.ZodType<TrustSignals>;

// ---------------------------------------------------------------------------
// TrustRow
// ---------------------------------------------------------------------------

export const TrustRowSchema = z.object({
  key: RowKeySchema,
  label: z.string().min(1),
  score: z.number().int().min(0).max(10),
  state: SlotStateSchema,
  fix: z.string(),
  evidence: z.array(z.string()),
  manuallyOverridden: z.boolean().optional(),
}) satisfies z.ZodType<TrustRow>;

/** Exactly six rows, one per RowKey, no duplicates. */
export const TrustRowsSchema = z
  .array(TrustRowSchema)
  .length(ROW_KEYS.length)
  .refine((rows) => new Set(rows.map((r) => r.key)).size === ROW_KEYS.length, {
    message: "each RowKey must appear exactly once",
  });

// ---------------------------------------------------------------------------
// Blueprint
// ---------------------------------------------------------------------------

export const BlueprintSlotSchema = z.object({
  slot: z.string().min(1),
  state: z.literal("present"),
  bbox: BBoxSchema.optional(),
  evidence: z.array(z.string()),
}) satisfies z.ZodType<BlueprintSlot>;

export const BlueprintRegionSchema = z.object({
  present: z.boolean(),
  slots: z.array(BlueprintSlotSchema),
}) satisfies z.ZodType<BlueprintRegion>;

export const BlueprintSchema = z.object({
  id: z.uuid(),
  niche: NicheSchema,
  regions: z.record(RegionSchema, BlueprintRegionSchema),
  sourcePortfolioPieceId: z.uuid(),
}) satisfies z.ZodType<Blueprint>;

// ---------------------------------------------------------------------------
// Persisted trust_audits row
// ---------------------------------------------------------------------------

export const RegionSlicesSchema = z.object({
  header: z.string().optional(),
  hero: z.string().optional(),
  reviews: z.string().optional(),
  about: z.string().optional(),
}) satisfies z.ZodType<RegionSlices>;

export const TrustAuditRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  audit_id: z.uuid(),
  prospect_url: z.string(),
  niche: NicheSchema.nullable(),
  screenshot_url: z.string().nullable(),
  screenshot_source: ScreenshotSourceSchema.nullable(),
  region_slices: RegionSlicesSchema.nullable(),
  active_blueprint_id: z.uuid().nullable(),
  signals: TrustSignalsSchema,
  scores: TrustRowsSchema,
  overall_score: z.number().int().min(0).max(100),
  sections_present: z.number().int().min(0).max(4),
  computed_at: z.string(),
}) satisfies z.ZodType<TrustAuditRow>;

// ---------------------------------------------------------------------------
// Uploads (manual screenshot + portfolio)
// ---------------------------------------------------------------------------

export const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ImageFileMetaSchema = z.object({
  mimeType: z.enum(IMAGE_MIME_TYPES),
  size: z.number().int().positive().max(MAX_IMAGE_BYTES),
});

const httpUrl = z.url({ protocol: /^https?$/ });

// ---------------------------------------------------------------------------
// Route inputs (section 9)
// ---------------------------------------------------------------------------

/** POST /api/trust/compute */
export const TrustComputeInput = z.object({
  auditId: z.uuid(),
  /** "Re-run" action — ignore the cached row */
  force: z.boolean().optional(),
});

/** GET /api/trust/[auditId] */
export const TrustGetParams = z.object({ auditId: z.uuid() });

/** POST /api/trust/screenshot/upload (multipart; file validated via ImageFileMetaSchema) */
export const TrustScreenshotUploadInput = z.object({ trustAuditId: z.uuid() });

/** POST /api/trust/pin */
export const TrustPinInput = z.object({
  trustAuditId: z.uuid(),
  rowKey: RowKeySchema,
  portfolioPieceId: z.uuid(),
});

/** DELETE /api/trust/pin */
export const TrustUnpinInput = z.object({
  trustAuditId: z.uuid(),
  rowKey: RowKeySchema,
});

/** POST /api/trust/override — score null clears the override */
export const TrustOverrideInput = z.object({
  trustAuditId: z.uuid(),
  rowKey: RowKeySchema,
  score: z.number().int().min(0).max(10).nullable(),
});

/** POST /api/trust/rescore */
export const TrustRescoreInput = z.object({ trustAuditId: z.uuid() });

/** POST /api/portfolio/upload (multipart; file optional when sourceUrl given) */
export const PortfolioUploadInput = z.object({
  title: z.string().trim().min(1).max(120),
  niche: NicheSchema,
  sourceUrl: httpUrl.optional(),
});

/** GET /api/portfolio/list */
export const PortfolioListQuery = z.object({ niche: NicheSchema.optional() });

/** POST /api/blueprints/activate */
export const BlueprintActivateInput = z.object({
  niche: NicheSchema,
  blueprintId: z.uuid(),
});
