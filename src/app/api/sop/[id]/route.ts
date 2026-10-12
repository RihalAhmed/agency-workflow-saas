import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createAuthClient, createServiceRoleClient } from "@/lib/auth/supabase-server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sopId } = await params;
  const { errorResponse, user } = await requireApiUser();
  if (errorResponse) return errorResponse;

  const supabaseUser = await createAuthClient();

  // Load row to get storage_path (RLS ensures we can only load our own row)
  const { data: row, error: rowErr } = await supabaseUser
    .from("sops")
    .select("storage_path")
    .eq("id", sopId)
    .single();

  if (rowErr || !row) {
    return NextResponse.json({ error: "SOP not found" }, { status: 404 });
  }

  const supabaseAdmin = await createServiceRoleClient();

  // Remove from storage
  const { error: storageErr } = await supabaseAdmin.storage
    .from("sops")
    .remove([row.storage_path]);

  if (storageErr) {
    return NextResponse.json({ error: "Failed to delete file from storage" }, { status: 500 });
  }

  const { data: success, error: deleteErr } = await supabaseAdmin.rpc("delete_sop", {
    p_user_id: user.id,
    p_sop_id: sopId,
  });

  if (deleteErr) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!success) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

import { z } from "zod";
import { TITLE_MAX } from "@/lib/sop/constants";
import { normalizeTitle } from "@/lib/sop/title";

const RenameSchema = z.object({
  title: z.string()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sopId } = await params;
  const { errorResponse, user } = await requireApiUser();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = RenameSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const newTitle = normalizeTitle(result.data.title);
  if (!newTitle) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  const supabaseAdmin = await createServiceRoleClient();
  const { data: success, error } = await supabaseAdmin.rpc("rename_sop", {
    p_user_id: user.id,
    p_sop_id: sopId,
    p_title: newTitle,
  });

  if (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  if (!success) {
    return NextResponse.json({ error: "SOP not found or not ready" }, { status: 404 });
  }

  return NextResponse.json({ title: newTitle });
}
