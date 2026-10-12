import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { BlueprintActivateInput } from "@/lib/trust/schemas";

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

    const parsed = BlueprintActivateInput.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { niche, blueprintId } = parsed.data;
    const supabase = createServerClient();

    // Call secure RPC set_active_blueprint
    const { data: success, error: rpcErr } = await supabase.rpc(
      "set_active_blueprint",
      {
        p_user_id: user.id,
        p_niche: niche,
        p_blueprint_id: blueprintId,
      }
    );

    if (rpcErr) {
      console.error("[BlueprintActivate] RPC error:", rpcErr);
      return NextResponse.json(
        { error: `Activation failed: ${rpcErr.message}` },
        { status: 500 }
      );
    }

    if (!success) {
      return NextResponse.json(
        { error: "Blueprint not found, does not belong to you, or niche mismatch" },
        { status: 403 }
      );
    }

    console.log(`[BlueprintActivate] User ${user.id} activated blueprint ${blueprintId} for niche ${niche}`);

    return NextResponse.json({
      success: true,
      niche,
      blueprintId,
    });
  } catch (err: any) {
    console.error("[BlueprintActivate] Error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
