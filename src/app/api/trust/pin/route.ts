import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { TrustPinInput, TrustUnpinInput } from "@/lib/trust/schemas";

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

    const parsed = TrustPinInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { trustAuditId, rowKey, portfolioPieceId } = parsed.data;
    const supabase = createServerClient();

    // 1. Verify trust audit belongs to caller
    const { data: audit, error: auditErr } = await supabase
      .from("trust_audits")
      .select("id")
      .eq("id", trustAuditId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (auditErr || !audit) {
      return NextResponse.json(
        { error: "Trust audit not found or access denied" },
        { status: 404 }
      );
    }

    // 2. Verify portfolio piece belongs to caller
    const { data: piece, error: pieceErr } = await supabase
      .from("portfolio_pieces")
      .select("id, title, niche, screenshot_url")
      .eq("id", portfolioPieceId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (pieceErr || !piece) {
      return NextResponse.json(
        { error: "Portfolio piece not found or access denied" },
        { status: 404 }
      );
    }

    // 3. Upsert pin
    const { error: pinErr } = await supabase.from("trust_row_pins").upsert(
      {
        trust_audit_id: trustAuditId,
        row_key: rowKey,
        portfolio_piece_id: portfolioPieceId,
        pinned_at: new Date().toISOString(),
      },
      { onConflict: "trust_audit_id,row_key" }
    );

    if (pinErr) {
      console.error("[TrustPin] Upsert error:", pinErr);
      return NextResponse.json({ error: pinErr.message }, { status: 500 });
    }

    // Generate signed screenshot URL for the pinned piece
    let signedScreenshotUrl: string | null = null;
    if (piece.screenshot_url) {
      const { data: signData } = await supabase.storage
        .from("portfolio-screenshots")
        .createSignedUrl(piece.screenshot_url, 3600);
      signedScreenshotUrl = signData?.signedUrl || null;
    }

    return NextResponse.json({
      success: true,
      pin: {
        row_key: rowKey,
        portfolio_piece_id: portfolioPieceId,
        portfolio_piece: {
          ...piece,
          signedScreenshotUrl,
        },
      },
    });
  } catch (err: any) {
    console.error("[TrustPin] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { errorResponse, user } = await requireApiUser();
    if (errorResponse) return errorResponse;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = TrustUnpinInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { trustAuditId, rowKey } = parsed.data;
    const supabase = createServerClient();

    // Verify ownership via trust_audits
    const { data: audit, error: auditErr } = await supabase
      .from("trust_audits")
      .select("id")
      .eq("id", trustAuditId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (auditErr || !audit) {
      return NextResponse.json(
        { error: "Trust audit not found or access denied" },
        { status: 404 }
      );
    }

    // Delete pin
    const { error: delErr } = await supabase
      .from("trust_row_pins")
      .delete()
      .eq("trust_audit_id", trustAuditId)
      .eq("row_key", rowKey);

    if (delErr) {
      console.error("[TrustUnpin] Delete error:", delErr);
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      row_key: rowKey,
    });
  } catch (err: any) {
    console.error("[TrustUnpin] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
