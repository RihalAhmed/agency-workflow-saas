import type { RawHtmlResult } from "../types";

/**
 * Plain HTTP GET — returns status code, headers, raw HTML, and final URL
 * after any redirects.
 */
export async function fetchRawHtml(url: string): Promise<RawHtmlResult> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(30_000),
  });

  const rawHtml = await res.text();

  // Flatten headers into a plain Record
  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return {
    statusCode: res.status,
    headers,
    rawHtml,
    responseUrl: res.url,
  };
}
