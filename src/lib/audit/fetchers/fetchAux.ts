import type { AuxFilesResult } from "../types";

/**
 * Parallel fetch of auxiliary files: robots.txt, sitemap.xml, llms.txt
 */
export async function fetchAux(url: string): Promise<AuxFilesResult> {
  const base = new URL(url);
  base.pathname = "/";
  base.search = "";
  base.hash = "";
  const origin = base.origin;

  const grab = async (
    path: string
  ): Promise<{ status: number; body: string | null }> => {
    try {
      const res = await fetch(`${origin}${path}`, {
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; ProseflowAuditBot/1.0)",
        },
      });
      const body = res.ok ? await res.text() : null;
      return { status: res.status, body };
    } catch {
      return { status: 0, body: null };
    }
  };

  const [robotsTxt, sitemapXml, sitemapIndex, llmsTxt] = await Promise.all([
    grab("/robots.txt"),
    grab("/sitemap.xml"),
    grab("/sitemap_index.xml"),
    grab("/llms.txt"),
  ]);

  // Use whichever sitemap variant returned 200
  const sitemap =
    sitemapXml.status === 200
      ? { status: 200, url: `${origin}/sitemap.xml`, body: sitemapXml.body }
      : sitemapIndex.status === 200
        ? {
            status: 200,
            url: `${origin}/sitemap_index.xml`,
            body: sitemapIndex.body,
          }
        : { status: sitemapXml.status || sitemapIndex.status, url: "", body: null };

  return {
    robotsTxt,
    sitemap,
    llmsTxt,
  };
}
