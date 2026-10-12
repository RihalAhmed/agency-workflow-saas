import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { TrustComputeInput } from "@/lib/trust/schemas";
import { renderTrustPage } from "@/lib/trust/render";
import { detectTrust } from "@/lib/trust/detect";
import {
  calculateOverallTrustScore,
  countSectionsPresent,
  scoreTrust,
} from "@/lib/trust/score";
import type { Blueprint } from "@/lib/trust/types";
import { sliceRegionImages, captureScreenshotFromPageSpeed } from "@/lib/trust/screenshot";

export const maxDuration = 120; // Allow sufficient time for Playwright navigation + face detection

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

    const parsed = TrustComputeInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { auditId, force } = parsed.data;
    const supabase = createServerClient();

    // 1. Check if trust audit is already computed
    if (!force) {
      const { data: existing, error: fetchErr } = await supabase
        .from("trust_audits")
        .select("*")
        .eq("audit_id", auditId)
        .maybeSingle();

      if (existing && !fetchErr) {
        return NextResponse.json({
          success: true,
          cached: true,
          trustAudit: existing,
        });
      }
    }

    // 2. Fetch the parent audit
    const { data: audit, error: auditErr } = await supabase
      .from("audits")
      .select("id, url, user_id, audit_result")
      .eq("id", auditId)
      .single();

    if (auditErr || !audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    // 3. Render page in Playwright (captures layout, faces, WebP screenshot)
    const storageKey = `${audit.id}/fullpage.webp`;
    console.log(`[TrustCompute] Rendering ${audit.url} for audit ${audit.id}...`);

    const rendered = await renderTrustPage(audit.url, {
      storageKey,
      timeoutMs: 30000,
    });

    // 4. Run pure detectors (Header, Hero, Reviews, About)
    console.log(`[TrustCompute] Running detectors on ${audit.url}...`);
    const signals = await detectTrust(rendered, audit.url);

    // 4b. Slice region screenshots
    let regionSlices: any = null;
    let finalScreenshotPath = rendered.screenshotPath || null;
    let finalScreenshotSource = rendered.screenshotSource !== "none" ? rendered.screenshotSource : null;

    if (rendered.screenshotBuffer) {
      console.log(`[TrustCompute] Slicing regions for ${audit.id}...`);
      regionSlices = await sliceRegionImages(rendered.screenshotBuffer, signals.regions, {
        auditId: audit.id,
      });
    } else if (audit.audit_result) {
      // Fallback: check cached PageSpeed screenshot
      const psiCapture = await captureScreenshotFromPageSpeed(audit.audit_result, audit.id);
      if (psiCapture) {
        finalScreenshotPath = psiCapture.path;
        finalScreenshotSource = "pagespeed";
        regionSlices = await sliceRegionImages(psiCapture.buffer, signals.regions, {
          auditId: audit.id,
        });
      }
    }

    // 5. Check if user has an active Blueprint for this niche
    let activeBlueprint: Blueprint | undefined;
    try {
      const { data: activeBpRow } = await supabase
        .from("active_blueprints")
        .select("blueprint_id, blueprints(id, niche, regions, source_portfolio_piece_id)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (activeBpRow?.blueprints) {
        const bp = activeBpRow.blueprints as any;
        activeBlueprint = {
          id: bp.id,
          niche: bp.niche,
          regions: bp.regions,
          sourcePortfolioPieceId: bp.source_portfolio_piece_id || bp.portfolio_piece_id,
        };
      }
    } catch (bpErr) {
      console.warn("[TrustCompute] Active blueprint query warning:", bpErr);
    }

    // 6. Score trust signals
    const scores = scoreTrust(signals, activeBlueprint);
    const overallScore = calculateOverallTrustScore(scores);
    const sectionsPresent = countSectionsPresent(signals);

    // 7. Upsert trust_audits record
    const payload = {
      user_id: user.id,
      audit_id: audit.id,
      prospect_url: audit.url,
      niche: activeBlueprint?.niche || "general",
      screenshot_url: finalScreenshotPath,
      screenshot_source: finalScreenshotSource,
      region_slices: regionSlices && Object.keys(regionSlices).length > 0 ? regionSlices : null,
      active_blueprint_id: activeBlueprint?.id || null,
      signals,
      scores,
      overall_score: overallScore,
      sections_present: sectionsPresent,
      computed_at: new Date().toISOString(),
    };

    const { data: savedRow, error: saveErr } = await supabase
      .from("trust_audits")
      .upsert(payload, { onConflict: "audit_id" })
      .select("*")
      .single();

    if (saveErr) {
      console.error("[TrustCompute] Failed to save trust_audits row:", saveErr);
      return NextResponse.json(
        { error: `Database error: ${saveErr.message}` },
        { status: 500 }
      );
    }

    console.log(
      `[TrustCompute] Complete for ${audit.url} — Score: ${overallScore}/100, Sections: ${sectionsPresent}/4`
    );

    return NextResponse.json({
      success: true,
      cached: false,
      trustAudit: savedRow,
    });
  } catch (err: any) {
    console.error("[TrustCompute] Execution error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during trust computation" },
      { status: 500 }
    );
  }
}
