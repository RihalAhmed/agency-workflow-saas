import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServiceRoleClient } from "@/lib/auth/supabase-server";
import { validateInitialFileInfo, sanitizeFilename } from "@/lib/sop/validate";
import { titleFromFilename } from "@/lib/sop/title";
import { z } from "zod";

const InitSchema = z.object({
  filename: z.string().min(1),
  size: z.number().int().positive(),
  mimeType: z.string().min(1),
});

export async function POST(request: Request) {
  const { errorResponse, user } = await requireApiUser();
  if (errorResponse) return errorResponse;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = InitSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { filename, size, mimeType } = result.data;

  // Validation
  const val = validateInitialFileInfo(filename, size, mimeType);
  if (!val.ok) {
    return NextResponse.json({ error: val.error }, { status: 400 });
  }

  const safeName = sanitizeFilename(filename);
  if (!safeName) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const initialTitle = titleFromFilename(safeName);
  const storagePath = `${user.id}/${crypto.randomUUID()}${val.ext}`;

  // Call create_pending_sop
  const supabase = await createServiceRoleClient();
  const { data: dbRes, error: dbErr } = await supabase.rpc("create_pending_sop", {
    p_user_id: user.id,
    p_title: initialTitle,
    p_original_filename: safeName,
    p_storage_path: storagePath,
    p_mime: mimeType,
    p_size: size,
  });

  if (dbErr) {
    console.error("RPC Error:", dbErr);
    return NextResponse.json({ error: `Database error: ${dbErr.message}` }, { status: 500 });
  }

  // Expect { ok, error, purged_paths, sop_id }
  if (!dbRes.ok) {
    if (dbRes.error === "rate_limit") {
      return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
    }
    if (dbRes.error === "limit_count") {
      return NextResponse.json({ error: "Maximum number of SOPs reached." }, { status: 409 });
    }
    if (dbRes.error === "limit_total") {
      return NextResponse.json({ error: "Maximum storage quota reached." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to initialize upload." }, { status: 400 });
  }

  // Remove purged abandoned files from storage
  if (dbRes.purged_paths && dbRes.purged_paths.length > 0) {
    await supabase.storage.from("sops").remove(dbRes.purged_paths);
  }

  // Create signed upload URL
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("sops")
    .createSignedUploadUrl(storagePath);

  if (uploadErr || !uploadData) {
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }

  return NextResponse.json({
    sopId: dbRes.sop_id,
    path: storagePath,
    token: uploadData.token,
  });
}
