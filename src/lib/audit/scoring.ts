import type { CheckResult, CategoryScores, LetterGrade, AuditCategory } from "./types";

// ---------------------------------------------------------------------------
// Category weights for overall grade computation
// ---------------------------------------------------------------------------
const CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  onPageSeo: 0.25,
  performance: 0.20,
  usability: 0.15,
  social: 0.08,
  localSeo: 0.10,
  technology: 0.07,
  geo: 0.15,
};

// Categories that get letter grades vs pass/fail or info-only
const GRADED_CATEGORIES: AuditCategory[] = [
  "onPageSeo",
  "performance",
  "usability",
  "geo",
];

const PASSFAIL_CATEGORIES: AuditCategory[] = ["social", "localSeo"];
const INFO_CATEGORIES: AuditCategory[] = ["technology"];

// ---------------------------------------------------------------------------
// Status → numeric score mapping for grade calculation
// ---------------------------------------------------------------------------
function statusToScore(status: string): number {
  switch (status) {
    case "pass":
      return 2;
    case "warning":
    case "info":
      return 1;
    case "fail":
      return 0;
    default:
      return 1;
  }
}

// ---------------------------------------------------------------------------
// Numeric score (0-100) → letter grade
// ---------------------------------------------------------------------------
export function numericToGrade(score: number): LetterGrade {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}

// ---------------------------------------------------------------------------
// Calculate category + overall scores
// ---------------------------------------------------------------------------
export function calculateScores(results: CheckResult[]): {
  overall: number;
  overallGrade: LetterGrade;
  categoryScores: CategoryScores;
  categoryNumeric: Record<string, number>;
} {
  // Group results by category
  const byCategory: Partial<Record<AuditCategory, CheckResult[]>> = {};
  for (const r of results) {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category]!.push(r);
  }

  // Calculate numeric score per category
  const categoryNumeric: Record<string, number> = {};
  for (const [cat, checks] of Object.entries(byCategory)) {
    if (!checks || checks.length === 0) {
      categoryNumeric[cat] = 0;
      continue;
    }

    if (cat === "performance") {
      // For performance, the pagespeed_insights score should be the main driver.
      // If it exists, let's use a weighted average where PSI is 80% and the rest is 20%.
      // Alternatively, if it has a direct numeric score in data.desktop/mobile, average them.
      const psiCheck = checks.find(c => c.key === "pagespeed_insights");
      const psiData = psiCheck?.data as any;
      // New audits carry an explicit `available` flag; older saved audits stored a failed call as 0.
      const isKnown = (d: any) =>
        typeof d?.score === "number" && (d.available !== undefined ? d.available : d.score > 0);
      const knownPsi = [psiData?.mobile, psiData?.desktop].filter(isKnown).map((d: any) => d.score as number);
      const otherChecks = checks.filter(c => c.key !== "pagespeed_insights");
      if (knownPsi.length > 0) {
        const avgPsiScore = Math.round(knownPsi.reduce((a, b) => a + b, 0) / knownPsi.length);
        
        // Calculate score of other checks
        let otherScore = 100;
        if (otherChecks.length > 0) {
          const totalOther = otherChecks.reduce((sum, c) => sum + statusToScore(c.status), 0);
          const maxOther = otherChecks.length * 2;
          otherScore = (totalOther / maxOther) * 100;
        }

        // Weight: 70% PSI, 30% others
        categoryNumeric[cat] = Math.round((avgPsiScore * 0.7) + (otherScore * 0.3));
      } else {
        const scored = otherChecks.length > 0 ? otherChecks : checks;
        const total = scored.reduce((sum, c) => sum + statusToScore(c.status), 0);
        const max = scored.length * 2;
        categoryNumeric[cat] = Math.round((total / max) * 100);
      }
    } else {
      const total = checks.reduce((sum, c) => sum + statusToScore(c.status), 0);
      const max = checks.length * 2;
      categoryNumeric[cat] = Math.round((total / max) * 100);
    }
  }

  // Build categoryScores with grades or pass/fail summaries
  const categoryScores: CategoryScores = {
    onPageSeo: "",
    performance: "",
    usability: "",
    social: "",
    localSeo: "",
    technology: "",
    geo: "",
  };

  for (const cat of GRADED_CATEGORIES) {
    const score = categoryNumeric[cat] ?? 0;
    categoryScores[cat] = numericToGrade(score);
  }

  for (const cat of PASSFAIL_CATEGORIES) {
    const checks = byCategory[cat] || [];
    const failures = checks.filter((c) => c.status === "fail").length;
    const passes = checks.filter((c) => c.status === "pass").length;
    if (failures > 0) {
      categoryScores[cat] = `${failures} issue${failures > 1 ? "s" : ""} found`;
    } else if (passes > 0) {
      categoryScores[cat] = "All checks passed";
    } else {
      categoryScores[cat] = "Not applicable";
    }
  }

  for (const cat of INFO_CATEGORIES) {
    categoryScores[cat] = "Info only";
  }

  // Calculate weighted overall score
  let weightedSum = 0;
  let weightTotal = 0;
  for (const [cat, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const score = categoryNumeric[cat];
    if (score !== undefined) {
      weightedSum += score * weight;
      weightTotal += weight;
    }
  }

  const overall = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
  const overallGrade = numericToGrade(overall);

  return { overall, overallGrade, categoryScores, categoryNumeric };
}
