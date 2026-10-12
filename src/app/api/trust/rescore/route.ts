import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { TrustRescoreInput } from "@/lib/trust/schemas";
import { calculateOverallTrustScore, scoreTrust } from "@/lib/trust/score";
import type { Blueprint } from "@/lib/trust/types";

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

    const parsed = TrustRescoreInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { trustAuditId } = parsed.data;
    const supabase = createServerClient();

    // 1. Fetch trust audit
    const { data: trustAudit, error: auditErr } = await supabase
      .from("trust_audits")
      .select("*")
      .eq("id", trustAuditId)
      .eq("user_id", user.id)
      .single();

    if (auditErr || !trustAudit) {
      return NextResponse.json({ error: "Trust audit not found" }, { status: 404 });
    }

    // 2. Fetch the user's active blueprint for this niche
    let activeBlueprint: Blueprint | undefined;
    const { data: activeRow } = await supabase
      .from("active_blueprints")
      .select("blueprint_id, blueprints(id, niche, regions, portfolio_piece_id)")
      .eq("user_id", user.id)
      .eq("niche", trustAudit.niche || "general")
      .maybeSingle();

    if (activeRow?.blueprints) {
      const bp = activeRow.blueprints as any;
      activeBlueprint = {
        id: bp.id,
        niche: bp.niche,
        regions: bp.regions,
        sourcePortfolioPieceId: bp.portfolio_piece_id,
      };
    }

    // 3. Re-score signals against active blueprint
    const newScores = scoreTrust(trustAudit.signals, activeBlueprint);
    const newOverallScore = calculateOverallTrustScore(newScores);

    // 4. Update trust_audits record
    const { data: updated, error: updateErr } = await supabase
      .from("trust_audits")
      .update({
        scores: newScores,
        overall_score: newOverallScore,
        active_blueprint_id: activeBlueprint?.id || null,
      })
      .eq("id", trustAudit.id)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      trustAudit: updated,
    });
  } catch (err: any) {
    console.error("[TrustRescore] Error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
