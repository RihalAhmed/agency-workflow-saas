import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createServerClient } from "@/lib/supabase/server";
import type {
  BBox,
  FaceResult,
  LayoutImage,
  LayoutMap,
  LayoutReviewWidget,
  LayoutSection,
  Region,
  RenderedTrustPage,
  ScreenshotSource,
} from "./types";

export interface RenderTrustOptions {
  /** Maximum navigation and render time in ms (default: 30000) */
  timeoutMs?: number;
  /** If provided, uploaded to trust-screenshots bucket at this key */
  storageKey?: string;
  /** Set true to skip taking/uploading full-page screenshot */
  skipScreenshot?: boolean;
  /** Set true to skip running in-browser face-api */
  skipFaceDetection?: boolean;
}

/**
 * Loads face-api and model assets lazily from local filesystem.
 */
let faceApiScriptCache: string | null = null;
let modelManifestCache: Buffer | null = null;
let modelShardCache: Buffer | null = null;

function getFaceApiAssets() {
  if (!faceApiScriptCache) {
    const scriptPath = path.join(
      process.cwd(),
      "node_modules",
      "face-api.js",
      "dist",
      "face-api.min.js"
    );
    faceApiScriptCache = fs.readFileSync(scriptPath, "utf-8");
  }

  if (!modelManifestCache) {
    const manifestPath = path.join(
      process.cwd(),
      "public",
      "models",
      "tiny_face_detector_model-weights_manifest.json"
    );
    modelManifestCache = fs.readFileSync(manifestPath);
  }

  if (!modelShardCache) {
    const shardPath = path.join(
      process.cwd(),
      "public",
      "models",
      "tiny_face_detector_model-shard1"
    );
    modelShardCache = fs.readFileSync(shardPath);
  }

  return {
    script: faceApiScriptCache,
    manifest: modelManifestCache,
    shard: modelShardCache,
  };
}

/**
 * Renders a target URL in headless Playwright Chromium (1440px desktop viewport).
 * - Extracts rendered DOM and LayoutMap (coordinates of H1, form, images, sections, widgets).
 * - Injects face-api.js locally into the page context to test candidate hero and about images.
 * - Captures a full-page screenshot capped at 8,000px tall and encoded as WebP q80.
 * - Uploads screenshot to Supabase 'trust-screenshots' if storageKey is supplied.
 */
export async function renderTrustPage(
  url: string,
  options: RenderTrustOptions = {}
): Promise<RenderedTrustPage> {
  const timeoutMs = options.timeoutMs ?? 30000;
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl) && !normalizedUrl.startsWith("data:")) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-web-security",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      ignoreHTTPSErrors: true,
      bypassCSP: true,
    });

    const page = await context.newPage();

    // Intercept model requests so face-api loads models directly from memory
    // on the target site's origin, avoiding CORS / mixed-content restrictions
    const { script, manifest, shard } = getFaceApiAssets();

    await page.route("**/__trust_models/**", (route) => {
      const requestUrl = route.request().url();
      if (requestUrl.includes("tiny_face_detector_model-weights_manifest.json")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: manifest,
        });
      }
      if (requestUrl.includes("tiny_face_detector_model-shard1")) {
        return route.fulfill({
          status: 200,
          contentType: "application/octet-stream",
          body: shard,
        });
      }
      return route.continue();
    });

    // Navigate to prospect URL
    try {
      await page.goto(normalizedUrl, {
        waitUntil: "domcontentloaded",
        timeout: timeoutMs,
      });
      // Allow dynamic elements / lazy-loaded images to mount
      await Promise.race([
        page.waitForLoadState("networkidle"),
        new Promise((r) => setTimeout(r, 3000)),
      ]);
    } catch (navErr: any) {
      console.warn(`[TrustRender] Navigation warning for ${normalizedUrl}:`, navErr?.message);
    }

    // 1. Extract LayoutMap
    const layout = await page.evaluate((): LayoutMap => {
      const getBBox = (el: Element): BBox => {
        const rect = el.getBoundingClientRect();
        return {
          x: Math.round(rect.left + window.scrollX),
          y: Math.round(rect.top + window.scrollY),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        };
      };

      // 1a. H1 bbox
      let h1: BBox | undefined;
      const h1El = document.querySelector("h1");
      if (h1El) {
        h1 = getBBox(h1El);
      }

      // 1b. First quote/contact form with >= 2 inputs
      let firstForm: BBox | undefined;
      const forms = Array.from(document.querySelectorAll("form"));
      for (const f of forms) {
        const fieldCount = f.querySelectorAll("input:not([type=hidden]), textarea, select").length;
        if (fieldCount >= 2) {
          firstForm = getBBox(f);
          break;
        }
      }

      // 1c. Major sections
      const sections: LayoutSection[] = [];
      const sectionElements = Array.from(
        document.querySelectorAll("header, nav, section, main, footer, div[id], div[class*='hero'], div[class*='about']")
      );

      for (const el of sectionElements) {
        const box = getBBox(el);
        if (box.w > 100 && box.h > 50) {
          const heading = el.querySelector("h1, h2, h3, h4")?.textContent?.trim() || undefined;
          const selector = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : el.className ? `.${el.className.split(" ")[0]}` : "");
          sections.push({
            selectorPath: selector,
            headingText: heading,
            bbox: box,
          });
        }
      }

      // 1d. Images (img tags and background images)
      const images: LayoutImage[] = [];
      const imgElements = Array.from(document.querySelectorAll("img"));

      for (const img of imgElements) {
        const box = getBBox(img);
        if (box.w >= 30 && box.h >= 30) {
          const src = img.currentSrc || img.src || img.getAttribute("data-src") || "";
          if (src) {
            let guess: Region | undefined;
            const ancestorText = (img.closest("header, nav, section, div")?.textContent || "").toLowerCase();
            const parentClasses = (img.closest("header, nav, section, div")?.className || "").toLowerCase();

            if (box.y <= 150 || img.closest("header, nav")) {
              guess = "header";
            } else if (box.y <= 1100 || parentClasses.includes("hero") || ancestorText.includes("free estimate")) {
              guess = "hero";
            } else if (parentClasses.includes("review") || parentClasses.includes("testimonial") || ancestorText.includes("reviews")) {
              guess = "reviews";
            } else if (parentClasses.includes("about") || ancestorText.includes("our story") || ancestorText.includes("about us")) {
              guess = "about";
            }

            images.push({
              src,
              alt: img.alt || undefined,
              isBackground: false,
              bbox: box,
              sectionGuess: guess,
            });
          }
        }
      }

      // Also check background images on large hero/about containers
      const bgCandidates = Array.from(
        document.querySelectorAll("section, header, div[class*='hero'], div[class*='about'], div[class*='banner']")
      );

      for (const el of bgCandidates) {
        const style = window.getComputedStyle(el);
        const bgImg = style.backgroundImage;
        if (bgImg && bgImg.startsWith("url(") && !bgImg.includes("data:image")) {
          const cleanUrl = bgImg.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
          const box = getBBox(el);
          if (box.w >= 200 && box.h >= 150) {
            let guess: Region = "hero";
            if (box.y > 1100) guess = "about";
            images.push({
              src: cleanUrl,
              isBackground: true,
              bbox: box,
              sectionGuess: guess,
            });
          }
        }
      }

      // 1e. Review widgets
      const reviewWidgets: LayoutReviewWidget[] = [];
      const widgetSelectors = [
        { provider: "elfsight", selector: "[class*='elfsight-app'], [src*='elfsight']" },
        { provider: "trustindex", selector: "[class*='ti-widget'], [src*='trustindex']" },
        { provider: "embedreviews", selector: "[class*='embedsocial'], [src*='embedsocial']" },
        { provider: "birdeye", selector: "[class*='birdeye'], [src*='birdeye']" },
        { provider: "sociablekit", selector: "[class*='sk-reviews'], [src*='sociablekit']" },
        { provider: "podium", selector: "[class*='podium'], [src*='podium']" },
        { provider: "google", selector: "[class*='google-review'], iframe[src*='google.com/maps']" },
      ];

      for (const w of widgetSelectors) {
        const found = document.querySelector(w.selector);
        if (found) {
          reviewWidgets.push({
            provider: w.provider,
            bbox: getBBox(found),
          });
        }
      }

      return {
        h1,
        firstForm,
        images,
        sections,
        reviewWidgets,
      };
    });

    // 2. Face Detection in Playwright page context
    let faces: FaceResult[] = [];
    if (!options.skipFaceDetection) {
      try {
        // Select up to 3 candidate images: 1 hero, up to 2 about
        const heroCandidate = layout.images.find((img) => img.sectionGuess === "hero");
        const aboutCandidates = layout.images
          .filter((img) => img.sectionGuess === "about" && img.src !== heroCandidate?.src)
          .slice(0, 2);

        const candidates = [heroCandidate, ...aboutCandidates].filter(Boolean) as LayoutImage[];

        if (candidates.length > 0) {
          // Inject face-api script into the page
          await page.addScriptTag({ content: script });

          // Run face detection on candidate images inside page
          faces = await page.evaluate(async (imgList): Promise<FaceResult[]> => {
            const results: FaceResult[] = [];
            const w = window as any;
            if (!w.faceapi) return results;

            try {
              // Load weights from our intercepted route on the current page's origin
              await w.faceapi.nets.tinyFaceDetector.loadFromUri("/__trust_models");
            } catch (err) {
              console.warn("Failed to load tiny face detector in page:", err);
              return results;
            }

            for (const item of imgList) {
              try {
                // Create an image in DOM to inspect
                const testImg = new Image();
                testImg.crossOrigin = "anonymous";
                testImg.src = item.src;

                await new Promise((resolve, reject) => {
                  if (testImg.complete && testImg.naturalWidth > 0) return resolve(true);
                  testImg.onload = () => resolve(true);
                  testImg.onerror = reject;
                  setTimeout(() => resolve(false), 3000);
                });

                if (testImg.naturalWidth === 0 || testImg.naturalHeight === 0) continue;

                const detections = await w.faceapi.detectAllFaces(
                  testImg,
                  new w.faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
                );

                if (detections && detections.length > 0) {
                  const totalImgArea = testImg.naturalWidth * testImg.naturalHeight;
                  let maxRatio = 0;

                  for (const d of detections) {
                    const faceArea = d.box.width * d.box.height;
                    const ratio = totalImgArea > 0 ? faceArea / totalImgArea : 0;
                    if (ratio > maxRatio) maxRatio = ratio;
                  }

                  results.push({
                    imageSrc: item.src,
                    count: detections.length,
                    largestAreaRatio: Number(maxRatio.toFixed(4)),
                  });
                }
              } catch {
                // Ignore individual image load / face-api failure
              }
            }

            return results;
          }, candidates);
        }
      } catch (faceErr: any) {
        console.warn("[TrustRender] Face detection error:", faceErr?.message);
      }
    }

    // 3. Screenshot Capture & WebP Encoding
    let screenshotPath: string | undefined;
    let screenshotSource: ScreenshotSource | "none" = "none";
    let screenshotBuffer: Buffer | undefined;

    if (!options.skipScreenshot) {
      try {
        const rawBuffer = await page.screenshot({
          fullPage: true,
          type: "png",
        });

        // Cap height at 8,000px and encode to WebP q80
        const image = sharp(rawBuffer);
        const metadata = await image.metadata();
        const width = metadata.width || 1440;
        const targetHeight = Math.min(metadata.height || 900, 8000);

        const webpBuffer = await sharp(rawBuffer)
          .extract({ left: 0, top: 0, width, height: targetHeight })
          .webp({ quality: 80 })
          .toBuffer();

        screenshotBuffer = webpBuffer;

        if (options.storageKey) {
          const supabase = createServerClient();
          const { error: uploadErr } = await supabase.storage
            .from("trust-screenshots")
            .upload(options.storageKey, webpBuffer, {
              contentType: "image/webp",
              upsert: true,
            });

          if (!uploadErr) {
            screenshotPath = options.storageKey;
            screenshotSource = "playwright";
          } else {
            console.warn("[TrustRender] Screenshot upload failed:", uploadErr.message);
          }
        } else {
          // If no storage key was passed, mark that playwright successfully captured it
          screenshotSource = "playwright";
        }
      } catch (shotErr: any) {
        console.warn("[TrustRender] Screenshot capture failed:", shotErr?.message);
      }
    }

    // 4. Extract rendered HTML
    const html = await page.content();

    return {
      html,
      layout,
      screenshotPath,
      screenshotSource,
      faces,
      screenshotBuffer,
    };
  } finally {
    await browser.close().catch(() => {});
  }
}
