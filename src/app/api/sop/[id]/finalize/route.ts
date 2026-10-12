import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/auth/supabase-server";
import { checkMagicBytes } from "@/lib/sop/validate";
import { scanFile } from "@/lib/sop/scan";
import { z } from "zod";
import { checkPdf } from "@/lib/sop/pdf-guard";
import { checkDocx } from "@/lib/sop/docx-guard";

const FinalizeSchema = z.object({
  path: z.string().min(1),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sopId } = await params;
  const { errorResponse, user } = await requireApiUser();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = FinalizeSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const supabase = await createServiceRoleClient();

  // Load the pending row
  const { data: row, error: rowErr } = await supabase
    .from("sops")
    .select("id, size_bytes, mime_type, storage_path, status")
    .eq("id", sopId)
    .eq("user_id", user.id)
    .single();

  if (rowErr || !row) {
    return NextResponse.json({ error: "SOP not found" }, { status: 404 });
  }

  if (row.status !== "pending") {
    return NextResponse.json({ error: "SOP is already finalized" }, { status: 400 });
  }

  if (row.storage_path !== result.data.path) {
    return NextResponse.json({ error: "Path mismatch" }, { status: 400 });
  }

  // Download object to check size and magic bytes
  const { data: fileData, error: downloadErr } = await supabase.storage
    .from("sops")
    .download(row.storage_path);

  if (downloadErr || !fileData) {
    return NextResponse.json({ error: "Failed to read file from storage" }, { status: 500 });
  }

  const buffer = new Uint8Array(await fileData.arrayBuffer());

  if (buffer.length > row.size_bytes || buffer.length > 5242880) {
    await cleanupAndFail("File size exceeds declared limits");
    return NextResponse.json({ error: "File size mismatch" }, { status: 422 });
  }

  if (!checkMagicBytes(buffer, row.mime_type)) {
    await cleanupAndFail("File content does not match its extension");
    return NextResponse.json({ error: "File content mismatch" }, { status: 422 });
  }

  const isClean = await scanFile(buffer);
  if (!isClean) {
    await cleanupAndFail("Malware detected");
    return NextResponse.json({ error: "Malware detected" }, { status: 422 });
  }

  // 2.0 Document Guards
  let pageCount: number | null = null;
  if (row.mime_type === "application/pdf") {
    const res = await checkPdf(buffer);
    if (!res.ok) {
      await cleanupAndFail(res.error!);
      return NextResponse.json({ error: res.error }, { status: 422 });
    }
    pageCount = res.pageCount!;
  } else if (row.mime_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const res = await checkDocx(buffer);
    if (!res.ok) {
      await cleanupAndFail(res.error!);
      return NextResponse.json({ error: res.error }, { status: 422 });
    }
  }

  // Mark ready
  const { data: finalData, error: finalErr } = await supabase.rpc("finalize_sop", {
    p_user_id: user.id,
    p_sop_id: sopId,
    p_page_count: pageCount,
  });

  if (finalErr || !finalData?.ok) {
    return NextResponse.json({ error: "Failed to finalize" }, { status: 500 });
  }

  return NextResponse.json({ success: true });

  async function cleanupAndFail(reason: string) {
    console.error(`Finalize failed: ${reason}`);
    if (row) {
      await supabase.storage.from("sops").remove([row.storage_path]);
    }
    await supabase.from("sops").delete().eq("id", sopId);
  }
}
