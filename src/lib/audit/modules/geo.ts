import * as cheerio from "cheerio";
import type { CheckResult, RawHtmlResult, AuxFilesResult, RenderedDomResult } from "../types";

/**
 * Module 7 — GEO (Generative Engine Optimization)
 */
export async function runGeoChecks(
  raw: RawHtmlResult,
  aux: AuxFilesResult,
  rendered: RenderedDomResult | null
): Promise<CheckResult[]> {
  const $ = cheerio.load(raw.rawHtml);
  const results: CheckResult[] = [];

  // -----------------------------------------------------------------------
  // 1. Rendered Content % (LLM readability)
  // Compare visible text length from raw HTML vs Playwright-rendered DOM
  // -----------------------------------------------------------------------
  const stripToText = (html: string) => {
    const c = cheerio.load(html);
    c("script, style, noscript, svg").remove();
    return c.text().replace(/\s+/g, " ").trim();
  };

  const rawText = stripToText(raw.rawHtml);
  const renderedText = rendered ? stripToText(rendered.renderedHtml) : null;

  if (renderedText !== null && rawText.length > 0) {
    const ratio = renderedText.length / rawText.length;
    const pct = Math.round(ratio * 100);
    const isClientHeavy = ratio > 2; // rendered >> raw means heavy client-side rendering

    results.push({
      key: "rendered_content_ratio",
      label: "Rendered Content Ratio",
      category: "geo",
      status: isClientHeavy ? "warning" : "pass",
      value: `${pct}%`,
      detail: isClientHeavy
        ? `${pct}% — heavy client-side rendering may hurt AI crawler readability`
        : `${pct}% — good server-side content coverage`,
      data: { rawLength: rawText.length, renderedLength: renderedText.length, ratio },
    });
  } else {
    results.push({
      key: "rendered_content_ratio",
      label: "Rendered Content Ratio",
      category: "geo",
      status: "info",
      detail: "Could not compare raw vs rendered DOM (Playwright unavailable)",
    });
  }

  // -----------------------------------------------------------------------
  // 2. llms.txt
  // -----------------------------------------------------------------------
  results.push({
    key: "llms_txt",
    label: "llms.txt",
    category: "geo",
    status: aux.llmsTxt.status === 200 ? "pass" : "fail",
    value: aux.llmsTxt.status === 200,
    detail:
      aux.llmsTxt.status === 200
        ? "Found and accessible — declares LLM crawling preferences"
        : "Not found — consider adding /llms.txt for AI crawler guidance",
  });

  // -----------------------------------------------------------------------
  // 3. AI Crawlers Blocked by Robots.txt
  // -----------------------------------------------------------------------
  const aiCrawlers = [
    "gptbot",
    "google-extended",
    "ccbot",
    "anthropic-ai",
    "claudebot",
    "bytespider",
    "cohere-ai",
    "perplexitybot",
  ];

  const blockedCrawlers: string[] = [];
  if (aux.robotsTxt.body) {
    const lines = aux.robotsTxt.body.toLowerCase().split("\n");
    let currentAgent = "";
    for (const line of lines) {
      const stripped = line.trim();
      if (stripped.startsWith("user-agent:")) {
        currentAgent = stripped.replace("user-agent:", "").trim();
      } else if (
        stripped.startsWith("disallow: /") &&
        stripped === "disallow: /"
      ) {
        if (currentAgent === "*") {
          // Blocking everything blocks AI crawlers too
          blockedCrawlers.push("* (all)");
          break;
        }
        if (aiCrawlers.includes(currentAgent)) {
          blockedCrawlers.push(currentAgent);
        }
      }
    }
  }

  results.push({
    key: "ai_crawlers_blocked",
    label: "AI Crawlers Blocked",
    category: "geo",
    status:
      blockedCrawlers.length === 0
        ? "pass"
        : blockedCrawlers.length <= 2
          ? "info"
          : "warning",
    value: blockedCrawlers.length,
    detail:
      blockedCrawlers.length === 0
        ? "No AI crawlers explicitly blocked"
        : `Blocked: ${blockedCrawlers.join(", ")}`,
    data: { blocked: blockedCrawlers },
  });

  // -----------------------------------------------------------------------
  // 4. Identity Schema (Organization / Person)
  // -----------------------------------------------------------------------
  let identityType: string | null = null;
  let identityName: string | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: any) => {
        const type = obj["@type"];
        if (type === "Organization" || type === "Person") {
          identityType = type;
          identityName = obj.name || null;
        }
        if (obj["@graph"]) obj["@graph"].forEach(check);
      };
      check(json);
    } catch {}
  });

  results.push({
    key: "identity_schema",
    label: "Identity Schema",
    category: "geo",
    status: identityType ? "pass" : "warning",
    value: identityType,
    detail: identityType
      ? `Found: ${identityType}${identityName ? ` — "${identityName}"` : ""}`
      : "No Organization or Person schema found — limits entity recognition by AI",
    data: { type: identityType, name: identityName },
  });

  // -----------------------------------------------------------------------
  // 5. LLM Content Analysis (Gemini API)
  // Sends page content to Gemini for AI-search-readiness assessment
  // -----------------------------------------------------------------------
  try {
    const { GoogleGenAI } = await import("@google/genai");
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      // Prepare condensed content (limit to ~8000 chars to stay within context)
      const pageContent = rawText.substring(0, 8000);

      const prompt = `You are an AI search readiness auditor. Analyze this webpage content and rate it on these dimensions for AI search engines (like Google AI Overviews, ChatGPT, Perplexity):

1. **Clarity**: Is the content clearly structured with definitive answers?
2. **Authority Signals**: Does it establish expertise/credentials?
3. **Citability**: Are there specific facts, stats, or unique insights an AI could cite?
4. **Entity Coverage**: Are key entities (people, places, products) well-defined?
5. **Freshness Signals**: Are there dates, updates, or temporal indicators?

Content:
${pageContent}

Respond ONLY with valid JSON (no markdown fences):
{
  "overallScore": <number 0-100>,
  "clarity": <number 0-100>,
  "authority": <number 0-100>,
  "citability": <number 0-100>,
  "entityCoverage": <number 0-100>,
  "freshness": <number 0-100>,
  "summary": "<1-2 sentence assessment>",
  "topRecommendation": "<most impactful suggestion>"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });
      const text = response.text?.trim() || "";

      // Parse the JSON response
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const analysis = JSON.parse(cleaned);

      results.push({
        key: "llm_content_analysis",
        label: "AI Search Readiness",
        category: "geo",
        status:
          analysis.overallScore >= 70
            ? "pass"
            : analysis.overallScore >= 40
              ? "warning"
              : "fail",
        value: `${analysis.overallScore}/100`,
        detail: analysis.summary || `AI readiness score: ${analysis.overallScore}/100`,
        data: analysis,
      });
    } else {
      results.push({
        key: "llm_content_analysis",
        label: "AI Search Readiness",
        category: "geo",
        status: "info",
        detail: "Skipped — no Gemini API key configured",
      });
    }
  } catch (err: any) {
    results.push({
      key: "llm_content_analysis",
      label: "AI Search Readiness",
      category: "geo",
      status: "info",
      detail: `AI analysis unavailable: ${err.message?.substring(0, 80) || "unknown error"}`,
    });
  }

  return results;
}
