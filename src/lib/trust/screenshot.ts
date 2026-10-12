import sharp from "sharp";
import { createServerClient } from "@/lib/supabase/server";
import type { Region, RegionMatch, RegionSlices } from "./types";
import { REGIONS } from "./types";

export interface SliceOptions {
  auditId: string;
}

/**
 * Uses sharp to crop 4 region slices from a full-page screenshot buffer
 * based on detected scrollDepth coordinates, and uploads each to Supabase trust-screenshots.
 */
export async function sliceRegionImages(
  fullBuffer: Buffer,
  regions: Record<Region, RegionMatch>,
  options: SliceOptions
): Promise<RegionSlices> {
  const { auditId } = options;
  const image = sharp(fullBuffer);
  const metadata = await image.metadata();

  const totalWidth = metadata.width || 1440;
  const totalHeight = metadata.height || 900;
  const supabase = createServerClient();
  const slices: RegionSlices = {};

  for (const reg of REGIONS) {
    const match = regions[reg];
    let top = 0;
    let sliceHeight = 400;

    switch (reg) {
      case "header":
        top = 0;
        sliceHeight = Math.min(160, totalHeight);
        break;
      case "hero":
        top = Math.max(0, Math.min(match?.scrollDepth ?? 80, totalHeight - 200));
        sliceHeight = Math.min(750, totalHeight - top);
        break;
      case "reviews":
        top = Math.max(0, Math.min(match?.scrollDepth ?? 900, totalHeight - 200));
        sliceHeight = Math.min(650, totalHeight - top);
        break;
      case "about":
        top = Math.max(0, Math.min(match?.scrollDepth ?? 1500, totalHeight - 200));
        sliceHeight = Math.min(650, totalHeight - top);
        break;
    }

    if (sliceHeight <= 0) {
      sliceHeight = Math.min(200, totalHeight);
    }
    if (top + sliceHeight > totalHeight) {
      sliceHeight = totalHeight - top;
    }

    try {
      const sliceBuffer = await sharp(fullBuffer)
        .extract({ left: 0, top: Math.round(top), width: totalWidth, height: Math.round(sliceHeight) })
        .webp({ quality: 80 })
        .toBuffer();

      const storagePath = `${auditId}/slice_${reg}.webp`;
      const { error: uploadErr } = await supabase.storage
        .from("trust-screenshots")
        .upload(storagePath, sliceBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (!uploadErr) {
        slices[reg] = storagePath;
      } else {
        console.warn(`[Screenshot] Failed to upload ${reg} slice:`, uploadErr.message);
      }
    } catch (err: any) {
      console.warn(`[Screenshot] Failed to slice ${reg}:`, err.message);
    }
  }

  return slices;
}

/**
 * Decodes PageSpeed Lighthouse full-page screenshot data as a fallback
 * if Playwright capture was unavailable.
 */
export async function captureScreenshotFromPageSpeed(
  psiData: any,
  auditId: string
): Promise<{ buffer: Buffer; path: string } | null> {
  const base64Data =
    psiData?.desktop?.lighthouseResult?.fullPageScreenshot?.screenshot?.data ||
    psiData?.desktop?.lighthouseResult?.audits?.["final-screenshot"]?.details?.data;

  if (!base64Data) return null;

  try {
    const rawData = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");
    const rawBuffer = Buffer.from(rawData, "base64");

    const image = sharp(rawBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1440;
    const targetHeight = Math.min(metadata.height || 900, 8000);

    const webpBuffer = await sharp(rawBuffer)
      .extract({ left: 0, top: 0, width, height: targetHeight })
      .webp({ quality: 80 })
      .toBuffer();

    const storagePath = `${auditId}/fullpage.webp`;
    const supabase = createServerClient();
    const { error } = await supabase.storage
      .from("trust-screenshots")
      .upload(storagePath, webpBuffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) {
      console.warn("[Screenshot] PageSpeed fallback upload failed:", error.message);
      return null;
    }

    return { buffer: webpBuffer, path: storagePath };
  } catch (err: any) {
    console.warn("[Screenshot] Failed to process PageSpeed screenshot:", err.message);
    return null;
  }
}

/**
 * Generates secure temporary signed URLs for all present region slices.
 */
export async function generateSignedRegionSlices(
  slices: RegionSlices | null
): Promise<RegionSlices | null> {
  if (!slices) return null;
  const supabase = createServerClient();
  const signed: RegionSlices = {};

  for (const reg of REGIONS) {
    const path = slices[reg];
    if (path) {
      const { data } = await supabase.storage
        .from("trust-screenshots")
        .createSignedUrl(path, 3600); // 1 hour
      if (data?.signedUrl) {
        signed[reg] = data.signedUrl;
      }
    }
  }

  return signed;
}
