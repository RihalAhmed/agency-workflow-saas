import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createAuthClient } from "@/lib/auth/supabase-server";

export async function GET(request: Request) {
  const { errorResponse, user } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const supabase = await createAuthClient();
  const { data, error } = await supabase
    .from("sops")
    .select("id, title, mime_type, is_active, created_at, updated_at, page_count")
    .eq("status", "ready")
    // RLS ensures only the user's rows are returned
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: "Failed to list SOPs" }, { status: 500 });
  }

  return NextResponse.json({ sops: data || [] });
}
