import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { runFullAudit } from "@/lib/audit/orchestrator";

export const maxDuration = 300; // PSI alone can take 90s+ (up to 150s timeout), plus Playwright rendering

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
        case "warning": return 1;
        case "info": return 3;
        case "fail": return 0;
        case "skipped": return -1;
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
          data: check.evidence ? { ...check.data, evidence: check.evidence } : check.data,
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

    const updatePayload: Record<string, any> = {
      status: "complete",
      overall_score: auditResult.overallScore ?? 0,
    };

    // Try to store the full result and category scores
    // These columns may not exist yet if the migration hasn't been run
    let existingAuditResult: any = audit.audit_result;
    if (typeof existingAuditResult === "string") {
      try {
        existingAuditResult = JSON.parse(existingAuditResult);
      } catch (_) {
        existingAuditResult = {};
      }
    }

    try {
      // Keep screenshots in the stored result (they are now compressed JPEGs, much lighter)
      const storedResult = { ...auditResult };

      // Preserve existing fields like companyName from the initial run
      updatePayload.audit_result = { 
        ...(existingAuditResult || {}), 
        ...storedResult 
      };
      updatePayload.category_scores = auditResult.categoryScores;
    } catch (e) {
      console.warn("[Audit] Could not prepare audit_result for storage:", e);
    }

    const { error: updateError } = await supabase
      .from("audits")
      .update(updatePayload)
      .eq("id", audit.id);

    if (updateError) {
      // If full result failed (e.g. payload too large due to screenshots), retry without screenshots first
      console.warn("[Audit] Update with full result failed, retrying without heavy screenshots:", updateError.message);
      const { screenshots, ...storedWithoutScreenshots } = auditResult;
      const retryResult = await supabase
        .from("audits")
        .update({
          status: "complete",
          overall_score: updatePayload.overall_score,
          category_scores: auditResult.categoryScores,
          audit_result: {
            ...(existingAuditResult || {}),
            ...storedWithoutScreenshots,
          },
        })
        .eq("id", audit.id);

      if (retryResult.error) {
        console.warn("[Audit] Fallback update failed, retrying minimal:", retryResult.error.message);
        await supabase
          .from("audits")
          .update({
            status: "complete",
            overall_score: updatePayload.overall_score,
          })
          .eq("id", audit.id);
      }
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
