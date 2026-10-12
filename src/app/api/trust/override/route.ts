import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { TrustOverrideInput } from "@/lib/trust/schemas";
import { calculateOverallTrustScore, scoreTrust } from "@/lib/trust/score";
import type { TrustRow } from "@/lib/trust/types";

export async function POST(req: Request) {
  try {
    const { errorResponse, user } = await requireApiUser();
    if (errorResponse) return errorResponse;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = TrustOverrideInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { trustAuditId, rowKey, score } = parsed.data;
    const supabase = createServerClient();

    // 1. Fetch trust audit
    const { data: trustAudit, error: auditErr } = await supabase
      .from("trust_audits")
      .select("*")
      .eq("id", trustAuditId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (auditErr || !trustAudit) {
      return NextResponse.json(
        { error: "Trust audit not found or access denied" },
        { status: 404 }
      );
    }

    const existingScores: TrustRow[] = (trustAudit.scores as TrustRow[]) || [];
    let updatedScores: TrustRow[];

    if (score !== null) {
      // Set manual override
      updatedScores = existingScores.map((r) =>
        r.key === rowKey
          ? { ...r, score, manuallyOverridden: true }
          : r
      );
    } else {
      // Reset override: re-score original row from signals
      const defaultRows = scoreTrust(trustAudit.signals);
      const defaultMatch = defaultRows.find((r) => r.key === rowKey);
      updatedScores = existingScores.map((r) =>
        r.key === rowKey && defaultMatch
          ? { ...r, score: defaultMatch.score, manuallyOverridden: false }
          : r
      );
    }

    const updatedOverall = calculateOverallTrustScore(updatedScores);

    // Update in database
    const { error: updateErr } = await supabase
      .from("trust_audits")
      .update({
        scores: updatedScores,
        overall_score: updatedOverall,
      })
      .eq("id", trustAuditId);

    if (updateErr) {
      console.error("[TrustOverride] Update error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      scores: updatedScores,
      overall_score: updatedOverall,
    });
  } catch (err: any) {
    console.error("[TrustOverride] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
