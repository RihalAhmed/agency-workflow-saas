import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/auth/supabase-server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sopId } = await params;
  const { errorResponse, user } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const supabaseAdmin = await createServiceRoleClient();

  // Verify ownership and status
  const { data: row, error: fetchErr } = await supabaseAdmin
    .from("sops")
    .select("storage_path, mime_type")
    .eq("id", sopId)
    .eq("user_id", user.id)
    .eq("status", "ready")
    .single();

  if (fetchErr || !row) {
    return NextResponse.json(
      { error: "SOP not found or not ready" },
      { status: 404 }
    );
  }

  // Create short-lived signed URL for reading (60 seconds)
  const { data, error } = await supabaseAdmin.storage
    .from("sops")
    .createSignedUrl(row.storage_path, 60);

  if (error || !data) {
    console.error("Failed to create signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate access URL" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      url: data.signedUrl,
      mimeType: row.mime_type,
      expiresIn: 60,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
