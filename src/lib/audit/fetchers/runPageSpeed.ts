import type { PageSpeedResult, PsiResponse } from "../types";

/**
 * Calls Google PageSpeed Insights API twice — once for mobile, once for
 * desktop. Uses the PAGESPEED_API_KEY env var.
 */
export async function runPageSpeed(url: string): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error("PAGESPEED_API_KEY is not configured.");
  }

  const callPsi = async (strategy: "mobile" | "desktop"): Promise<PsiResponse> => {
    const endpoint = new URL(
      "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    );
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("key", apiKey);
    endpoint.searchParams.set("strategy", strategy);
    endpoint.searchParams.set("category", "performance");
    // We add multiple category params
    endpoint.searchParams.append("category", "accessibility");
    endpoint.searchParams.append("category", "seo");
    endpoint.searchParams.append("category", "best-practices");

    const res = await fetch(endpoint.toString(), {
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `PageSpeed API (${strategy}) failed: ${res.status} ${res.statusText} — ${body.slice(0, 200)}`
      );
    }

    return res.json();
  };

  const [mobile, desktop] = await Promise.all([
    callPsi("mobile"),
    callPsi("desktop"),
  ]);

  return { mobile, desktop };
}
