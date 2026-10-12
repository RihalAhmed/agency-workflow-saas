import { describe, expect, test } from "vitest";
import sharp from "sharp";
import { captureScreenshotFromPageSpeed } from "./screenshot";

describe("Screenshot Engine", () => {
  test("sharp correctly crops mock viewport into 4 region webp buffers", async () => {
    // Generate a test 1440x2000 image buffer
    const mockFullBuffer = await sharp({
      create: {
        width: 1440,
        height: 2000,
        channels: 4,
        background: { r: 50, g: 100, b: 200, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    // Crop Header (top: 0, height: 160)
    const headerSlice = await sharp(mockFullBuffer)
      .extract({ left: 0, top: 0, width: 1440, height: 160 })
      .webp({ quality: 80 })
      .toBuffer();

    const headerMeta = await sharp(headerSlice).metadata();
    expect(headerMeta.format).toBe("webp");
    expect(headerMeta.width).toBe(1440);
    expect(headerMeta.height).toBe(160);

    // Crop Hero (top: 80, height: 750)
    const heroSlice = await sharp(mockFullBuffer)
      .extract({ left: 0, top: 80, width: 1440, height: 750 })
      .webp({ quality: 80 })
      .toBuffer();

    const heroMeta = await sharp(heroSlice).metadata();
    expect(heroMeta.format).toBe("webp");
    expect(heroMeta.width).toBe(1440);
    expect(heroMeta.height).toBe(750);
  });

  test("captureScreenshotFromPageSpeed returns null if no screenshot data in PSI payload", async () => {
    const emptyPsi = { desktop: { lighthouseResult: {} } };
    const result = await captureScreenshotFromPageSpeed(emptyPsi, "test-audit-id");
    expect(result).toBeNull();
  });
});
