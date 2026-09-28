import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { runFullAudit } from "@/lib/audit/orchestrator";

export const maxDuration = 120; // Allow up to 120s for full audit execution

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    const supabase = createServerClient();

    // Fetch audit record
    const { data: audit, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("slug", slug)
      .single();

    if (auditError || !audit) {
      return NextResponse.json(
        { success: false, error: "Audit not found" },
        { status: 404 }
      );
    }

    if (audit.status === "complete") {
      return NextResponse.json({
        success: true,
        message: "Audit already complete",
      });
    }

    // Update status to running
    await supabase
      .from("audits")
      .update({ status: "running" })
      .eq("id", audit.id);

    // Run the full 7-module audit
    console.log(`[Audit] Starting full audit for ${audit.url} (slug: ${slug})`);

    const auditResult = await runFullAudit(
      audit.url,
      audit.target_keyword || undefined,
      (stage, detail) => {
        console.log(`[Audit:${slug}] ${stage}: ${detail || ""}`);
      }
    );

    // Collect all check results for audit_scores table
    const allCheckResults: Array<{
      audit_id: string;
      category: string;
      check_key: string;
      label: string;
      score: number;
      detail?: string;
      data?: Record<string, unknown>;
    }> = [];

    const statusToScore = (status: string) => {
      switch (status) {
        case "pass": return 2;
        case "warning": case "info": return 1;
        case "fail": return 0;
        default: return 1;
      }
    };

    // Iterate over all module results
    const modules = [
      { key: "onPageSeo", data: auditResult.onPageSeo },
      { key: "performance", data: auditResult.performance },
      { key: "usability", data: auditResult.usability },
      { key: "social", data: auditResult.social },
      { key: "localSeo", data: auditResult.localSeo },
      { key: "technology", data: auditResult.technology },
      { key: "geo", data: auditResult.geo },
    ];

    for (const mod of modules) {
      for (const [checkKey, check] of Object.entries(mod.data as Record<string, any>)) {
        allCheckResults.push({
          audit_id: audit.id,
          category: mod.key,
          check_key: checkKey,
          label: check.label || checkKey,
          score: statusToScore(check.status),
          detail: check.detail,
          data: check.data,
        });
      }
    }

    // Upsert check results into audit_scores
    if (allCheckResults.length > 0) {
      const { error: scoresError } = await supabase
        .from("audit_scores")
        .upsert(allCheckResults, { onConflict: "audit_id,check_key" });

      if (scoresError) {
        console.error("[Audit] Failed to upsert scores:", scoresError);
      }
    }

    // Update the audit record with results
    const updatePayload: Record<string, any> = {
      status: "complete",
      overall_score: Math.round(
        Object.values(auditResult.categoryScores).filter(
          (v) => !["Info only", "All checks passed", "Not applicable"].includes(v)
        ).length > 0
          ? (() => {
              // Compute numeric overall from the scoring module's output
              // The overallGrade is a letter, we need the numeric for the DB
              const gradeToNum: Record<string, number> = {
                "A+": 98, A: 95, "A-": 92,
                "B+": 88, B: 85, "B-": 82,
                "C+": 78, C: 75, "C-": 72,
                "D+": 68, D: 65, "D-": 62,
                F: 50,
              };
              return gradeToNum[auditResult.overallGrade] || 50;
            })()
          : 0
      ),
    };

    // Try to store the full result and category scores
    // These columns may not exist yet if the migration hasn't been run
    try {
      // Strip screenshots from the stored result to keep JSONB manageable
      const storedResult = { ...auditResult };
      delete (storedResult as any).screenshots;

      updatePayload.audit_result = storedResult;
      updatePayload.category_scores = auditResult.categoryScores;
    } catch (e) {
      console.warn("[Audit] Could not prepare audit_result for storage:", e);
    }

    const { error: updateError } = await supabase
      .from("audits")
      .update(updatePayload)
      .eq("id", audit.id);

    if (updateError) {
      // If audit_result/category_scores columns don't exist, retry without them
      console.warn("[Audit] Update with full result failed, retrying minimal:", updateError.message);
      await supabase
        .from("audits")
        .update({
          status: "complete",
          overall_score: updatePayload.overall_score,
        })
        .eq("id", audit.id);
    }

    console.log(`[Audit] Complete: ${audit.url} — Grade: ${auditResult.overallGrade}`);

    return NextResponse.json({
      success: true,
      overallGrade: auditResult.overallGrade,
      categoryScores: auditResult.categoryScores,
      recommendations: auditResult.recommendations,
      checksRun: allCheckResults.length,
    });
  } catch (error: any) {
    console.error("[Audit] Execution error:", error);

    // Mark as error
    try {
      const slug = (await params).slug;
      const supabase = createServerClient();
      await supabase
        .from("audits")
        .update({ status: "error" })
        .eq("slug", slug);
    } catch {}

    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute audit" },
      { status: 500 }
    );
  }
}
