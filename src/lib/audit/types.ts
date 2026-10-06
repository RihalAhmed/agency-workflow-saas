import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums & primitives
// ---------------------------------------------------------------------------

export const AuditCategoryEnum = z.enum([
  "onPageSeo",
  "performance",
  "usability",
  "social",
  "localSeo",
  "technology",
  "geo",
]);
export type AuditCategory = z.infer<typeof AuditCategoryEnum>;

export const CheckStatus = z.enum(["pass", "fail", "warning", "info", "skipped"]);
export type CheckStatus = z.infer<typeof CheckStatus>;

export const Priority = z.enum(["High", "Medium", "Low"]);
export type Priority = z.infer<typeof Priority>;

export const LetterGrade = z.enum([
  "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D+", "D", "D-",
  "F",
]);
export type LetterGrade = z.infer<typeof LetterGrade>;

// ---------------------------------------------------------------------------
// Per-check result (stored in audit_scores)
// ---------------------------------------------------------------------------

export const Evidence = z.object({
  metric: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  unit: z.string().optional(),
  target: z.union([
    z.object({ min: z.number().optional(), max: z.number().optional() }),
    z.string(),
    z.number(),
    z.boolean()
  ]).optional(),
  score: z.number().optional(),
  found: z.array(z.string()).optional(),
  missing: z.array(z.string()).optional(),
  source: z.string().optional(),
  rows: z.array(z.object({ label: z.string(), value: z.any() })).optional(),
  items: z.array(z.object({ group: z.string().optional(), label: z.string(), detail: z.string().optional() })).optional(),
  rule: z.string().optional(),
  gap: z.string().optional(),
});
export type Evidence = z.infer<typeof Evidence>;

export const CheckResult = z.object({
  key: z.string(),
  label: z.string(),
  category: AuditCategoryEnum,
  status: CheckStatus,
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  detail: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  evidence: Evidence.optional(),
});
export type CheckResult = z.infer<typeof CheckResult>;

// ---------------------------------------------------------------------------
// Recommendation
// ---------------------------------------------------------------------------

export const Recommendation = z.object({
  title: z.string(),
  category: AuditCategoryEnum,
  priority: Priority,
  checkKey: z.string().optional(),
});
export type Recommendation = z.infer<typeof Recommendation>;

// ---------------------------------------------------------------------------
// Category scores
// ---------------------------------------------------------------------------

export const CategoryScores = z.object({
  onPageSeo: z.string(),
  performance: z.string(),
  usability: z.string(),
  social: z.string(),        // pass/fail summary — not graded
  localSeo: z.string(),      // pass/fail summary
  technology: z.string(),    // info only — not graded
  geo: z.string(),
});
export type CategoryScores = z.infer<typeof CategoryScores>;

// ---------------------------------------------------------------------------
// Screenshots
// ---------------------------------------------------------------------------

export const Screenshots = z.object({
  desktop: z.string().optional(),   // base64 data URI
  tablet: z.string().optional(),
  mobile: z.string().optional(),
});
export type Screenshots = z.infer<typeof Screenshots>;

// ---------------------------------------------------------------------------
// Full audit output (top-level JSON stored in audits.audit_result)
// ---------------------------------------------------------------------------

export const AuditOutput = z.object({
  url: z.string(),
  auditedAt: z.string(),           // ISO timestamp
  overallGrade: z.string(),
  overallScore: z.number().optional(),
  categoryScores: CategoryScores,
  categoryNumeric: z.record(z.string(), z.number()).optional(),
  screenshots: Screenshots.optional(),
  onPageSeo: z.record(z.string(), z.unknown()),
  performance: z.record(z.string(), z.unknown()),
  usability: z.record(z.string(), z.unknown()),
  social: z.record(z.string(), z.unknown()),
  localSeo: z.record(z.string(), z.unknown()),
  technology: z.record(z.string(), z.unknown()),
  geo: z.record(z.string(), z.unknown()),
  recommendations: z.array(Recommendation),
});
export type AuditOutput = z.infer<typeof AuditOutput>;

// ---------------------------------------------------------------------------
// Orchestrator input
// ---------------------------------------------------------------------------

export const AuditInput = z.object({
  url: z.string().url(),
  targetKeyword: z.string().optional(),
});
export type AuditInput = z.infer<typeof AuditInput>;

// ---------------------------------------------------------------------------
// Fetcher return types (not Zod — plain TS interfaces for internal use)
// ---------------------------------------------------------------------------

export interface RawHtmlResult {
  statusCode: number;
  headers: Record<string, string>;
  rawHtml: string;
  responseUrl: string;  // final URL after redirects
}

export interface RenderedDomResult {
  renderedHtml: string;
  screenshots: {
    desktop: string;   // base64
    tablet: string;
    mobile: string;
  };
}

export interface AuxFilesResult {
  robotsTxt: { status: number; body: string | null };
  sitemap: { status: number; url: string; body: string | null };
  llmsTxt: { status: number; body: string | null };
}

export interface PsiResponse {
  lighthouseResult: {
    audits: Record<string, any>;
    categories: Record<string, any>;
  };
  loadingExperience?: Record<string, any>;
  [key: string]: any;
}

export interface PageSpeedResult {
  mobile: PsiResponse;
  desktop: PsiResponse;
}

export interface DnsResult {
  nameservers: string[];
  txtRecords: string[][];
  spfRecord: string | null;
  dmarcRecord: string | null;
  ipAddresses: string[];
}

export interface DetectedTech {
  name: string;
  category: string;
  version?: string;
  website?: string;
}

export interface TechFingerprintResult {
  detectedTech: DetectedTech[];
}
