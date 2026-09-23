import sharp from "sharp";
import { converter, formatHex } from "culori";

const toOklch = converter("oklch");

export interface ColorCandidate {
  hex: string;
  r: number;
  g: number;
  b: number;
  population: number;
  l: number;
  c: number;
  h?: number;
  score: number;
}

interface Pixel {
  r: number;
  g: number;
  b: number;
  l: number;
  c: number;
  h?: number;
}

/**
 * Extracts candidate brand colors from a logo image using median-cut quantization.
 */
export async function extractPalette(imagePath: string): Promise<ColorCandidate[]> {
  const { data, info } = await sharp(imagePath)
    .resize(64, 64, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels: Pixel[] = [];
  const allOpaquePixels: Pixel[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue; // Skip transparent pixels

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const oklch = toOklch({ mode: "rgb", r: r / 255, g: g / 255, b: b / 255 });
    const l = oklch?.l ?? 0;
    const c = oklch?.c ?? 0;
    const h = oklch?.h;

    const pixel: Pixel = { r, g, b, l, c, h };
    allOpaquePixels.push(pixel);

    // Filter out near-white, near-black, and near-grey pixels
    if (l <= 0.95 && l >= 0.08 && c >= 0.02) {
      pixels.push(pixel);
    }
  }

  // Edge case: single-color black, white, or monotone logo
  const workingPool = pixels.length >= 10 ? pixels : allOpaquePixels;
  if (workingPool.length === 0) {
    // Ultimate fallback if image was completely transparent
    return [
      {
        hex: "#132152",
        r: 19,
        g: 33,
        b: 82,
        population: 1,
        l: 0.27,
        c: 0.09,
        h: 268,
        score: 1,
      },
    ];
  }

  // Median-cut quantization into up to 8 buckets
  const buckets = medianCut(workingPool, 8);

  const candidates: ColorCandidate[] = buckets.map((bucket) => {
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;

    for (const p of bucket) {
      sumR += p.r;
      sumG += p.g;
      sumB += p.b;
    }

    const avgR = Math.round(sumR / bucket.length);
    const avgG = Math.round(sumG / bucket.length);
    const avgB = Math.round(sumB / bucket.length);

    const oklch = toOklch({ mode: "rgb", r: avgR / 255, g: avgG / 255, b: avgB / 255 });
    const l = oklch?.l ?? 0;
    const c = oklch?.c ?? 0;
    const h = oklch?.h;

    const hex = formatHex({ mode: "rgb", r: avgR / 255, g: avgG / 255, b: avgB / 255 }) || "#000000";
    const score = bucket.length * (c + 0.01);

    return {
      hex,
      r: avgR,
      g: avgG,
      b: avgB,
      population: bucket.length,
      l,
      c,
      h,
      score,
    };
  });

  // Rank by score = population * chroma
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

function medianCut(pixels: Pixel[], targetBuckets: number): Pixel[][] {
  let buckets: Pixel[][] = [pixels];

  while (buckets.length < targetBuckets) {
    // Find bucket with largest range along any color channel
    let maxRange = -1;
    let splitIdx = -1;
    let splitChannel: "r" | "g" | "b" = "r";

    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i];
      if (b.length < 2) continue;

      let minR = 255, maxR = 0;
      let minG = 255, maxG = 0;
      let minB = 255, maxB = 0;

      for (const p of b) {
        if (p.r < minR) minR = p.r;
        if (p.r > maxR) maxR = p.r;
        if (p.g < minG) minG = p.g;
        if (p.g > maxG) maxG = p.g;
        if (p.b < minB) minB = p.b;
        if (p.b > maxB) maxB = p.b;
      }

      const rangeR = maxR - minR;
      const rangeG = maxG - minG;
      const rangeB = maxB - minB;
      const currentMax = Math.max(rangeR, rangeG, rangeB);

      if (currentMax > maxRange) {
        maxRange = currentMax;
        splitIdx = i;
        if (currentMax === rangeR) splitChannel = "r";
        else if (currentMax === rangeG) splitChannel = "g";
        else splitChannel = "b";
      }
    }

    if (splitIdx === -1 || maxRange <= 0) break;

    const toSplit = buckets[splitIdx];
    toSplit.sort((a, b) => a[splitChannel] - b[splitChannel]);
    const mid = Math.floor(toSplit.length / 2);
    const b1 = toSplit.slice(0, mid);
    const b2 = toSplit.slice(mid);

    buckets.splice(splitIdx, 1, b1, b2);
  }

  return buckets;
}
