import { describe, it, expect } from "vitest";
import { runOnPageSeoChecks } from "../onPageSeo";
import type { RawHtmlResult, AuxFilesResult } from "../../types";

describe("On-Page SEO Checks", () => {
  const getMockCtx = (html: string): [RawHtmlResult, AuxFilesResult] => [
    {
      statusCode: 200,
      headers: {},
      rawHtml: html,
      responseUrl: "https://example.com/page/"
    },
    {
      robotsTxt: { status: 200, body: "" },
      sitemap: { status: 404, url: "", body: "" },
      llmsTxt: { status: 404, body: null }
    }
  ];

  it("canonical - good", () => {
    const [raw, aux] = getMockCtx(`<html><head><link rel="canonical" href="https://example.com/page/" /></head><body></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "canonical");
    expect(check?.status).toBe("pass");
    expect(check?.evidence?.gap).toBeUndefined();
  });

  it("canonical - missing", () => {
    const [raw, aux] = getMockCtx(`<html><head></head><body></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "canonical");
    expect(check?.status).toBe("warning");
    expect(check?.evidence?.gap).toBe("No canonical tag found");
  });

  it("canonical - wrong URL", () => {
    const [raw, aux] = getMockCtx(`<html><head><link rel="canonical" href="http://example.com/page/" /></head><body></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "canonical");
    expect(check?.status).toBe("warning");
    expect(check?.evidence?.gap).toBe("uses http:// while the page is https://");
  });

  it("title - good", () => {
    const [raw, aux] = getMockCtx(`<html><head><title>This is a perfectly sized title that is 54 characters.</title></head><body></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "title_tag");
    expect(check?.status).toBe("pass");
    expect(check?.evidence?.gap).toBeUndefined();
  });

  it("title - too short", () => {
    const [raw, aux] = getMockCtx(`<html><head><title>Short title</title></head><body></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "title_tag");
    expect(check?.status).toBe("warning");
    expect(check?.evidence?.gap).toBe("39 characters below the 50 minimum");
  });

  it("title - missing", () => {
    const [raw, aux] = getMockCtx(`<html><head></head><body></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "title_tag");
    expect(check?.status).toBe("fail"); // critical
    expect(check?.evidence?.gap).toBe("No title tag");
  });

  it("h1 - exactly one", () => {
    const [raw, aux] = getMockCtx(`<html><body><h1>My Main Heading</h1></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "h1_usage");
    expect(check?.status).toBe("pass");
  });

  it("h1 - multiple", () => {
    const [raw, aux] = getMockCtx(`<html><body><h1>Main</h1><h1>Secondary</h1></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "h1_usage");
    expect(check?.status).toBe("warning");
    expect(check?.evidence?.gap).toBe("2 H1 tags found; use one");
  });

  it("headings - skipped level", () => {
    const [raw, aux] = getMockCtx(`<html><body><h2>Sub</h2><h4>SubSub</h4></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "headings");
    expect(check?.status).toBe("warning");
    expect(check?.evidence?.gap).toBe("1 skipped heading level(s)");
    expect(check?.evidence?.items?.[0].label).toBe("H2 -> H4");
  });

  it("image_alt - missing", () => {
    const [raw, aux] = getMockCtx(`<html><body><img src="test.jpg" width="100" height="100" /><img src="ok.jpg" alt="ok" width="100" height="100" /></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "image_alt");
    expect(check?.status).toBe("warning");
    expect(check?.evidence?.gap).toBe("1 of 2 images have no alt attribute");
  });

  it("image_alt - decorative ignores empty alt", () => {
    const [raw, aux] = getMockCtx(`<html><body><img src="test.jpg" alt="" width="100" height="100" /></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "image_alt");
    expect(check?.status).toBe("pass");
    expect(check?.evidence?.gap).toBeUndefined();
  });

  it("indexability - blocked via meta", () => {
    const [raw, aux] = getMockCtx(`<html><head><meta name="robots" content="noindex, nofollow"></head><body></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "indexability");
    expect(check?.status).toBe("fail"); // critical
    expect(check?.evidence?.gap).toBe("noindex found in meta robots tag");
  });

  it("schema - no business identity", () => {
    const [raw, aux] = getMockCtx(`<html><head><script type="application/ld+json">{"@type": "Article", "name": "Test"}</script></head><body></body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "schema");
    expect(check?.status).toBe("warning");
    expect(check?.evidence?.gap).toBe("No Organization or LocalBusiness type");
  });

  it("links - vague and complex", () => {
    const [raw, aux] = getMockCtx(`<html><body>
      <a href="https://example.com/page/about">Good link</a>
      <a href="https://example.com/page/more">Click here</a>
      <a href="https://example.com/page/foo?sessionid=123">Bad param</a>
    </body></html>`);
    const res = runOnPageSeoChecks(raw, aux);
    const check = res.find((r) => r.key === "links");
    expect(check?.status).toBe("warning");
    expect(check?.evidence?.gap).toBe("1 vague anchor(s); 1 complex URL(s)");
  });
});
