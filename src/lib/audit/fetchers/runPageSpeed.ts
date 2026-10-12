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

  // Google runs a full Lighthouse pass server-side; for heavier sites this
  // routinely takes 60–90s+ (measured 85s for a real site). A short timeout
  // aborts a request that would have succeeded, so keep this generous.
  const PSI_TIMEOUT_MS = 150_000;

  const callPsiOnce = async (strategy: "mobile" | "desktop"): Promise<PsiResponse> => {
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
      signal: AbortSignal.timeout(PSI_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const err: any = new Error(
        `PageSpeed API (${strategy}) failed: ${res.status} ${res.statusText} — ${body.slice(0, 200)}`
      );
      err.status = res.status;
      throw err;
    }

    const json = (await res.json()) as PsiResponse;
    if (typeof json?.lighthouseResult?.categories?.performance?.score !== "number") {
      throw new Error(`PageSpeed API (${strategy}) returned no performance score`);
    }
    return json;
  };

  // Retry once on transient failures (rate limit / Google-side 5xx / empty result).
  // Timeouts are not retried — a second 150s wait would exceed the route budget.
  const callPsi = async (strategy: "mobile" | "desktop"): Promise<PsiResponse> => {
    try {
      return await callPsiOnce(strategy);
    } catch (err: any) {
      const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
      const retryable = !isTimeout && (err?.status === undefined || err.status === 429 || err.status >= 500);
      if (!retryable) throw err;
      console.warn(`[Audit] PageSpeed ${strategy} failed, retrying once:`, err.message);
      await new Promise((r) => setTimeout(r, 3000));
      return callPsiOnce(strategy);
    }
  };

  // Mark failures explicitly so the UI can show "unavailable" instead of a fake 0.
  const fallbackPsi = (error: string) =>
    ({
      lighthouseResult: { audits: {}, categories: {} },
      error,
    }) as unknown as PsiResponse;

  const describe = (err: any) =>
    err?.name === "TimeoutError" || err?.name === "AbortError"
      ? `Google PageSpeed did not respond within ${PSI_TIMEOUT_MS / 1000}s`
      : err?.message || "Unknown error";

  const [mobile, desktop] = await Promise.all([
    callPsi("mobile").catch(err => {
      console.warn("[Audit] PageSpeed mobile failed:", describe(err));
      return fallbackPsi(describe(err));
    }),
    callPsi("desktop").catch(err => {
      console.warn("[Audit] PageSpeed desktop failed:", describe(err));
      return fallbackPsi(describe(err));
    }),
  ]);

  return { mobile, desktop };
}
