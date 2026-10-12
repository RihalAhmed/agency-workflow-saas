import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { NicheSchema } from "@/lib/trust/schemas";

export async function GET(req: Request) {
  try {
    const { errorResponse, user } = await requireApiUser();
    if (errorResponse) return errorResponse;

    const url = new URL(req.url);
    const nicheParam = url.searchParams.get("niche");
    const niche = nicheParam ? NicheSchema.safeParse(nicheParam).data : undefined;

    const supabase = createServerClient();

    // 1. Fetch active blueprints for this user
    const { data: activeRows } = await supabase
      .from("active_blueprints")
      .select("niche, blueprint_id")
      .eq("user_id", user.id);

    const activeMap: Record<string, string> = {};
    if (activeRows) {
      for (const row of activeRows) {
        activeMap[row.niche] = row.blueprint_id;
      }
    }

    // 2. Fetch portfolio pieces
    let query = supabase
      .from("portfolio_pieces")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (niche) {
      query = query.eq("niche", niche);
    }

    const { data: pieces, error: piecesErr } = await query;
    if (piecesErr) {
      return NextResponse.json({ error: piecesErr.message }, { status: 500 });
    }

    // 3. Generate signed URLs for screenshots
    const items = await Promise.all(
      (pieces || []).map(async (piece) => {
        let signedScreenshotUrl: string | null = null;
        if (piece.screenshot_url) {
          const { data: signData } = await supabase.storage
            .from("portfolio-screenshots")
            .createSignedUrl(piece.screenshot_url, 3600);
          signedScreenshotUrl = signData?.signedUrl || null;
        }

        const isActive = Boolean(
          piece.blueprint_id && activeMap[piece.niche] === piece.blueprint_id
        );

        return {
          ...piece,
          signedScreenshotUrl,
          isActiveBlueprint: isActive,
        };
      })
    );

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (err: any) {
    console.error("[PortfolioList] Error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
