import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { generateSignedRegionSlices } from "@/lib/trust/screenshot";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ auditId: string }> }
) {
  try {
    const { errorResponse, user } = await requireApiUser();
    if (errorResponse) return errorResponse;

    const { auditId } = await params;
    const supabase = createServerClient();

    // Fetch trust audit record
    const { data: trustAudit, error } = await supabase
      .from("trust_audits")
      .select("*")
      .eq("audit_id", auditId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!trustAudit) {
      return NextResponse.json(
        { error: "Trust audit not yet computed", notFound: true },
        { status: 404 }
      );
    }

    // Generate signed URL for screenshot if stored
    let signedScreenshotUrl: string | null = null;
    if (trustAudit.screenshot_url) {
      const { data: signData } = await supabase.storage
        .from("trust-screenshots")
        .createSignedUrl(trustAudit.screenshot_url, 3600); // 1 hour

      signedScreenshotUrl = signData?.signedUrl || null;
    }

    // Generate signed URLs for region slices
    const signedRegionSlices = await generateSignedRegionSlices(trustAudit.region_slices);

    // Fetch any pinned portfolio pieces for this audit and sign their thumbnails
    const { data: pins } = await supabase
      .from("trust_row_pins")
      .select("row_key, portfolio_pieces(*)")
      .eq("trust_audit_id", trustAudit.id);

    const pinsWithSignedUrls = await Promise.all(
      (pins || []).map(async (pin: any) => {
        let pieceSignedUrl: string | null = null;
        if (pin.portfolio_pieces?.screenshot_url) {
          const { data: sData } = await supabase.storage
            .from("portfolio-screenshots")
            .createSignedUrl(pin.portfolio_pieces.screenshot_url, 3600);
          pieceSignedUrl = sData?.signedUrl || null;
        }

        return {
          row_key: pin.row_key,
          portfolio_piece: {
            ...pin.portfolio_pieces,
            signedScreenshotUrl: pieceSignedUrl,
          },
        };
      })
    );

    // Fetch active blueprint for this user and niche
    let activeBlueprintInfo: { id: string; niche: string; title: string } | null = null;
    const { data: activeBpRow } = await supabase
      .from("active_blueprints")
      .select("blueprint_id, blueprints(id, niche, portfolio_pieces(title))")
      .eq("user_id", user.id)
      .eq("niche", trustAudit.niche || "general")
      .maybeSingle();

    if (activeBpRow?.blueprints) {
      const bp = activeBpRow.blueprints as any;
      activeBlueprintInfo = {
        id: bp.id,
        niche: bp.niche,
        title: bp.portfolio_pieces?.title || "Active Blueprint",
      };
    }

    // Fetch current blueprint title if scored against one
    let currentBlueprintTitle: string | null = null;
    if (trustAudit.active_blueprint_id) {
      const { data: curBp } = await supabase
        .from("blueprints")
        .select("id, portfolio_pieces(title)")
        .eq("id", trustAudit.active_blueprint_id)
        .maybeSingle();
      currentBlueprintTitle = (curBp as any)?.portfolio_pieces?.title || null;
    }

    return NextResponse.json({
      success: true,
      trustAudit: {
        ...trustAudit,
        signedScreenshotUrl,
        signedRegionSlices,
        currentBlueprintTitle,
      },
      activeBlueprint: activeBlueprintInfo,
      pins: pinsWithSignedUrls,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
