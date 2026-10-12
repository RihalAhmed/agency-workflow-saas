/**
 * Trust Segment — TypeScript contracts.
 *
 * Matching zod schemas live in ./schemas.ts and are type-checked against
 * these interfaces with `satisfies`, so the two cannot drift silently.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export const REGIONS = ["header", "hero", "reviews", "about"] as const;
export type Region = (typeof REGIONS)[number];

export const SLOT_STATES = ["found", "partial", "missing"] as const;
export type SlotState = (typeof SLOT_STATES)[number];

export const NICHES = [
  "roofing",
  "pest",
  "hvac",
  "siding",
  "fencing",
  "landscaping",
  "plumbing",
  "general",
] as const;
export type Niche = (typeof NICHES)[number];

/** Bounding box in page pixels at the 1440 px render viewport. */
export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Render pipeline output (Phase 1)
// ---------------------------------------------------------------------------

export const SCREENSHOT_SOURCES = ["playwright", "pagespeed", "manual"] as const;
export type ScreenshotSource = (typeof SCREENSHOT_SOURCES)[number];

export interface LayoutImage {
  src: string;
  alt?: string;
  isBackground: boolean;
  bbox: BBox;
  sectionGuess?: Region;
}

export interface LayoutSection {
  selectorPath: string;
  headingText?: string;
  bbox: BBox;
}

export interface LayoutReviewWidget {
  provider: string;
  bbox: BBox;
}

export interface LayoutMap {
  h1?: BBox;
  firstForm?: BBox;
  images: LayoutImage[];
  sections: LayoutSection[];
  reviewWidgets: LayoutReviewWidget[];
}

export interface FaceResult {
  imageSrc: string;
  count: number;
  /** Largest face area / image area, 0..1 */
  largestAreaRatio: number;
}

export interface RenderedTrustPage {
  html: string;
  layout: LayoutMap;
  screenshotPath?: string;
  screenshotSource: ScreenshotSource | "none";
  faces: FaceResult[];
  screenshotBuffer?: Buffer;
}

// ---------------------------------------------------------------------------
// Detector output — TrustSignals
// ---------------------------------------------------------------------------

export interface SlotFinding {
  slot: string;
  state: SlotState;
  evidence: string[];
  /** DOMPurify-sanitized source fragment */
  htmlSnippet?: string;
  bbox?: BBox;
  /** 0..1 */
  confidence: number;
}

export interface RegionMatch {
  region: Region;
  found: boolean;
  /** Top of region in page pixels; 0 if not found */
  scrollDepth: number;
  /** 1-based viewport count where the region starts; 0 if not found */
  scrollIndex: number;
  isOffHomepage?: boolean;
  slots: SlotFinding[];
}

export interface TrustSignals {
  url: string;
  /** ISO timestamp */
  capturedAt: string;
  regions: Record<Region, RegionMatch>;
}

// ---------------------------------------------------------------------------
// Scoring output — TrustRow
// ---------------------------------------------------------------------------

export const ROW_KEYS = [
  "risk_reversal_usp",
  "reviews_social_proof",
  "trust_badges_reputation",
  "personality_face",
  "like_know_trust",
  "emotional_backstory",
] as const;
export type RowKey = (typeof ROW_KEYS)[number];

export interface TrustRow {
  key: RowKey;
  label: string;
  /** 0..10 integer */
  score: number;
  /** Mapped from score band */
  state: SlotState;
  fix: string;
  evidence: string[];
  manuallyOverridden?: boolean;
}

/** 0–2 danger, 3–5 warning, 6–8 ok, 9–10 strong */
export type ScoreBand = "danger" | "warning" | "ok" | "strong";

// ---------------------------------------------------------------------------
// Blueprint (reverse mode)
// ---------------------------------------------------------------------------

export interface BlueprintSlot {
  slot: string;
  state: "present";
  bbox?: BBox;
  evidence: string[];
}

export interface BlueprintRegion {
  present: boolean;
  slots: BlueprintSlot[];
}

export interface Blueprint {
  id: string;
  niche: Niche;
  regions: Record<Region, BlueprintRegion>;
  sourcePortfolioPieceId: string;
}

// ---------------------------------------------------------------------------
// Persisted rows (snake_case mirrors the Supabase columns)
// ---------------------------------------------------------------------------

export interface RegionSlices {
  header?: string;
  hero?: string;
  reviews?: string;
  about?: string;
}

export interface TrustAuditRow {
  id: string;
  user_id: string;
  audit_id: string;
  prospect_url: string;
  niche: Niche | null;
  screenshot_url: string | null;
  screenshot_source: ScreenshotSource | null;
  region_slices: RegionSlices | null;
  active_blueprint_id: string | null;
  signals: TrustSignals;
  scores: TrustRow[];
  /** 0..100 */
  overall_score: number;
  /** 0..4 */
  sections_present: number;
  computed_at: string;
  signedScreenshotUrl?: string | null;
  signedRegionSlices?: RegionSlices | null;
}

export interface PortfolioPieceRow {
  id: string;
  user_id: string;
  title: string;
  source_url: string | null;
  niche: Niche;
  screenshot_url: string;
  slot_tags: string[];
  blueprint_id: string | null;
  created_at: string;
}

export interface TrustRowPinRow {
  trust_audit_id: string;
  row_key: RowKey;
  portfolio_piece_id: string;
  pinned_at: string;
}
