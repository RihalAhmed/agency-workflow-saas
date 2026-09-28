import { z } from "zod";

// ---------------------------------------------------------------------------
// Re-export the canonical types from types.ts
// ---------------------------------------------------------------------------
export {
  AuditCategoryEnum,
  CheckStatus,
  CheckResult,
  AuditOutput,
  AuditInput,
  type CheckResult as AuditCheckResult,
} from "./types";

// Legacy aliases kept so the existing execute route doesn't break during migration
export const AuditCategory = z.enum([
  "onPageSeo",
  "performance",
  "usability",
  "social",
  "localSeo",
  "technology",
  "geo",
]);

export const AuditStatus = z.enum(["pending", "running", "complete", "error"]);
export type AuditStatus = z.infer<typeof AuditStatus>;

export const ScoreValue = z.number().int().min(0).max(2);
// 0 = poor (🔴), 1 = needs work (🟡), 2 = good (🟢)

export const AuditRunInput = z.object({
  url: z.string().url(),
  targetKeyword: z.string().optional(),
});

export const TalkingPoint = z.object({
  category: AuditCategory,
  issue: z.string(),
  script_line: z.string(),
});

export const GeneratedScript = z.object({
  talking_points: z.array(TalkingPoint),
  full_script: z.string(),
});
