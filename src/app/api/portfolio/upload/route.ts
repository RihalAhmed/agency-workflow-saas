import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { ImageFileMetaSchema, NicheSchema } from "@/lib/trust/schemas";
import { renderTrustPage } from "@/lib/trust/render";
import { detectTrust } from "@/lib/trust/detect";
import { extractBlueprint } from "@/lib/trust/blueprint";
import sharp from "sharp";
import type { Niche, RenderedTrustPage } from "@/lib/trust/types";

export const maxDuration = 120; // Rendering live site with Playwright

export async function POST(req: Request) {
  try {
    const { errorResponse, user } = await requireApiUser();
    if (errorResponse) return errorResponse;

    const formData = await req.formData();
    const title = (formData.get("title") as string)?.trim();
    const rawNiche = formData.get("niche") as string;
    const sourceUrl = (formData.get("sourceUrl") as string)?.trim() || undefined;
    const file = formData.get("file") as File | null;

    if (!title || title.length < 1 || title.length > 120) {
      return NextResponse.json({ error: "Title must be between 1 and 120 characters" }, { status: 400 });
    }

    const nicheParsed = NicheSchema.safeParse(rawNiche);
    if (!nicheParsed.success) {
      return NextResponse.json({ error: "Invalid niche" }, { status: 400 });
    }
    const niche: Niche = nicheParsed.data;

    if (!sourceUrl && !file) {
      return NextResponse.json({ error: "Either sourceUrl or an image file upload is required" }, { status: 400 });
    }

    const pieceId = crypto.randomUUID();
    const storagePath = `${pieceId}/preview.webp`;
    const supabase = createServerClient();

    let rendered: RenderedTrustPage;
    let screenshotBuffer: Buffer | undefined;

    if (sourceUrl) {
      // 1. Live site provided: run full Playwright render + face detection
      console.log(`[PortfolioUpload] Crawling live portfolio site: ${sourceUrl}`);
      rendered = await renderTrustPage(sourceUrl, {
        storageKey: storagePath,
        timeoutMs: 30000,
      });
      screenshotBuffer = rendered.screenshotBuffer;
    } else if (file) {
      // 2. Image upload only: process with sharp
      const metaCheck = ImageFileMetaSchema.safeParse({
        mimeType: file.type,
        size: file.size,
      });
      if (!metaCheck.success) {
        return NextResponse.json({ error: "Invalid image file. PNG, JPEG, or WebP under 5 MB required." }, { status: 400 });
      }

      const rawBuffer = Buffer.from(await file.arrayBuffer());
      const image = sharp(rawBuffer);
      const meta = await image.metadata();
      const width = meta.width || 1440;
      const targetHeight = Math.min(meta.height || 900, 8000);

      screenshotBuffer = await sharp(rawBuffer)
        .extract({ left: 0, top: 0, width, height: targetHeight })
        .webp({ quality: 80 })
        .toBuffer();

      // Upload to portfolio-screenshots
      const { error: uploadErr } = await supabase.storage
        .from("portfolio-screenshots")
        .upload(storagePath, screenshotBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadErr) {
        return NextResponse.json({ error: `Storage upload error: ${uploadErr.message}` }, { status: 500 });
      }

      // Minimal rendered page structure for uploaded screenshots
      rendered = {
        html: `<html><body><div id="portfolio-upload">${title}</div></body></html>`,
        layout: { images: [], sections: [], reviewWidgets: [] },
        screenshotPath: storagePath,
        screenshotSource: "manual",
        faces: [],
      };
    } else {
      return NextResponse.json({ error: "Missing source" }, { status: 400 });
    }

    // 3. Extract detected signals
    const signals = await detectTrust(rendered, sourceUrl || "");

    // 4. Extract standardized Blueprint
    const blueprint = extractBlueprint(signals, niche, pieceId);

    // 5. Calculate slot tags from Blueprint's present slots
    const slotTags: string[] = [];
    for (const reg of Object.values(blueprint.regions)) {
      if (reg.present) {
        for (const s of reg.slots) {
          if (!slotTags.includes(s.slot)) {
            slotTags.push(s.slot);
          }
        }
      }
    }

    // 6. Insert portfolio_pieces record first (with blueprint_id: null to satisfy FK constraint)
    const { error: pieceErr } = await supabase.from("portfolio_pieces").insert({
      id: pieceId,
      user_id: user.id,
      title,
      source_url: sourceUrl || null,
      niche,
      screenshot_url: storagePath,
      slot_tags: slotTags,
      blueprint_id: null,
    });

    if (pieceErr) {
      console.error("[PortfolioUpload] Insert piece error:", pieceErr);
      return NextResponse.json({ error: `Database error: ${pieceErr.message}` }, { status: 500 });
    }

    // 7. Insert blueprints record referencing pieceId
    const { error: bpErr } = await supabase.from("blueprints").insert({
      id: blueprint.id,
      user_id: user.id,
      portfolio_piece_id: pieceId,
      niche,
      regions: blueprint.regions,
    });

    if (bpErr) {
      console.error("[PortfolioUpload] Insert blueprint error:", bpErr);
      return NextResponse.json({ error: `Database error: ${bpErr.message}` }, { status: 500 });
    }

    // 8. Update portfolio_pieces record with blueprint_id
    await supabase
      .from("portfolio_pieces")
      .update({ blueprint_id: blueprint.id })
      .eq("id", pieceId);

    console.log(`[PortfolioUpload] Successfully created portfolio piece ${pieceId} and blueprint ${blueprint.id}`);

    return NextResponse.json({
      success: true,
      portfolioPiece: {
        id: pieceId,
        title,
        source_url: sourceUrl || null,
        niche,
        screenshot_url: storagePath,
        slot_tags: slotTags,
        blueprint_id: blueprint.id,
      },
      blueprint,
    });
  } catch (err: any) {
    console.error("[PortfolioUpload] Unexpected error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
