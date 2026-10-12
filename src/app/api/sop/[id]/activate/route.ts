import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/auth/supabase-server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sopId } = await params;
  const { errorResponse, user } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const supabase = await createServiceRoleClient();
  const { data: success, error } = await supabase.rpc("set_active_sop", {
    p_user_id: user.id,
    p_sop_id: sopId,
  });

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!success) {
    return NextResponse.json({ error: "SOP not found or not ready" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
