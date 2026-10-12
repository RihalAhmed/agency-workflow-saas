import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { ImageFileMetaSchema } from "@/lib/trust/schemas";
import { sliceRegionImages } from "@/lib/trust/screenshot";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const { errorResponse, user } = await requireApiUser();
    if (errorResponse) return errorResponse;

    const formData = await req.formData();
    const trustAuditId = formData.get("trustAuditId") as string;
    const file = formData.get("file") as File | null;

    if (!trustAuditId || !file) {
      return NextResponse.json(
        { error: "trustAuditId and image file are required" },
        { status: 400 }
      );
    }

    // Validate file metadata
    const metaCheck = ImageFileMetaSchema.safeParse({
      mimeType: file.type,
      size: file.size,
    });

    if (!metaCheck.success) {
      return NextResponse.json(
        { error: "Invalid file. Must be PNG, JPEG, or WebP under 5 MB." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify ownership
    const { data: trustAudit, error: fetchErr } = await supabase
      .from("trust_audits")
      .select("*")
      .eq("id", trustAuditId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !trustAudit) {
      return NextResponse.json(
        { error: "Trust audit record not found or unauthorized" },
        { status: 404 }
      );
    }

    // Process uploaded file with sharp
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    const image = sharp(rawBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1440;
    const targetHeight = Math.min(metadata.height || 900, 8000);

    const webpBuffer = await sharp(rawBuffer)
      .extract({ left: 0, top: 0, width, height: targetHeight })
      .webp({ quality: 80 })
      .toBuffer();

    const storagePath = `${trustAudit.audit_id}/fullpage.webp`;

    // Upload fullpage
    const { error: uploadErr } = await supabase.storage
      .from("trust-screenshots")
      .upload(storagePath, webpBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json(
        { error: `Upload error: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // Slice 4 regions
    const regionSlices = await sliceRegionImages(
      webpBuffer,
      trustAudit.signals?.regions || {},
      { auditId: trustAudit.audit_id }
    );

    // Update trust_audits record
    const { data: updated, error: updateErr } = await supabase
      .from("trust_audits")
      .update({
        screenshot_url: storagePath,
        screenshot_source: "manual",
        region_slices: regionSlices,
      })
      .eq("id", trustAudit.id)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: `Database update error: ${updateErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trustAudit: updated,
    });
  } catch (err: any) {
    console.error("[ScreenshotUpload] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
