import * as cheerio from "cheerio";
import type { Region, RegionMatch, RenderedTrustPage, TrustSignals } from "./types";
import { type DetectorContext } from "./detectors/context";
import { detectHeader } from "./detectors/header";
import { detectHero } from "./detectors/hero";
import { detectReviews } from "./detectors/reviews";
import { detectAbout } from "./detectors/about";

/**
 * Shared detection pipeline:
 * Takes rendered DOM, layout map, and detected faces, and executes
 * the 4 semantic region detectors (Header, Hero, Reviews, About).
 * Returns canonical TrustSignals validated against TrustSignalsSchema.
 */
export async function detectTrust(
  rendered: RenderedTrustPage,
  baseUrl: string
): Promise<TrustSignals> {
  const $ = cheerio.load(rendered.html || "");
  const ctx: DetectorContext = {
    $,
    layout: rendered.layout,
    faces: rendered.faces,
    baseUrl,
  };

  const [header, hero, reviews, about] = await Promise.all([
    Promise.resolve(detectHeader(ctx)),
    Promise.resolve(detectHero(ctx)),
    Promise.resolve(detectReviews(ctx)),
    detectAbout(ctx),
  ]);

  const regions: Record<Region, RegionMatch> = {
    header,
    hero,
    reviews,
    about,
  };

  return {
    url: baseUrl,
    capturedAt: new Date().toISOString(),
    regions,
  };
}
