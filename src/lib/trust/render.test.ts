import { describe, expect, test } from "vitest";
import { renderTrustPage } from "./render";
import { RenderedTrustPageSchema } from "./schemas";

describe("renderTrustPage", () => {
  test("renders HTML, extracts layout and bboxes for H1, form, and sections", async () => {
    const mockHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Dallas Roofing Masters</title></head>
        <body style="margin: 0; padding: 20px;">
          <header style="height: 80px; width: 100%;">
            <nav><a href="/">Home</a><a href="tel:5551234567">Call Us</a></nav>
          </header>
          <section id="hero" style="height: 600px; width: 100%;">
            <h1>Top Roofing Contractors in Dallas, TX</h1>
            <p>Get a 100% money back guarantee.</p>
            <form style="display: flex; flex-direction: column;">
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
              <button type="submit">Get Free Quote</button>
            </form>
          </section>
          <section id="about" style="height: 400px; width: 100%;">
            <h2>About Our Family Business</h2>
            <p>We have served the Dallas metro area for over 20 years.</p>
          </section>
        </body>
      </html>
    `;

    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(mockHtml)}`;

    const result = await renderTrustPage(dataUrl, {
      skipScreenshot: true,
      skipFaceDetection: true,
      timeoutMs: 15000,
    });

    // 1. Conforms to Zod schema
    const parsed = RenderedTrustPageSchema.safeParse(result);
    expect(parsed.success).toBe(true);

    // 2. Checks extracted layout
    expect(result.layout.h1).toBeDefined();
    expect(result.layout.h1?.w).toBeGreaterThan(0);
    expect(result.layout.firstForm).toBeDefined();
    expect(result.layout.firstForm?.h).toBeGreaterThan(0);

    // 3. Extracted sections
    expect(result.layout.sections.length).toBeGreaterThanOrEqual(2);
    const heroSection = result.layout.sections.find((s) => s.selectorPath.includes("hero") || s.headingText?.includes("Roofing"));
    expect(heroSection).toBeDefined();
  }, 30000);
});
