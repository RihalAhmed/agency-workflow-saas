import type {
  AuditOutput,
  CheckResult,
  RawHtmlResult,
  RenderedDomResult,
  AuxFilesResult,
  PageSpeedResult,
  DnsResult,
  TechFingerprintResult,
} from "./types";

// Fetchers
import { fetchRawHtml } from "./fetchers/fetchRawHtml";
import { fetchRenderedDom } from "./fetchers/fetchRenderedDom";
import { fetchAux } from "./fetchers/fetchAux";
import { runPageSpeed } from "./fetchers/runPageSpeed";
import { runDnsLookups } from "./fetchers/runDnsLookups";
import { matchTechFingerprints } from "./fetchers/matchTechFingerprints";

// Modules
import { runOnPageSeoChecks } from "./modules/onPageSeo";
import { runPerformanceChecks } from "./modules/performance";
import { runUsabilityChecks } from "./modules/usability";
import { runSocialChecks } from "./modules/social";
import { runLocalSeoChecks } from "./modules/localSeo";
import { runTechnologyChecks } from "./modules/technology";
import { runGeoChecks } from "./modules/geo";

// Scoring & Recommendations
import { calculateScores } from "./scoring";
import { generateRecommendations } from "./recommendations";

// ---------------------------------------------------------------------------
// Progress callback for real-time status updates
// ---------------------------------------------------------------------------
export type ProgressCallback = (stage: string, detail?: string) => void;

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------
export async function runFullAudit(
  url: string,
  targetKeyword?: string,
  onProgress?: ProgressCallback
): Promise<AuditOutput> {
  const log = onProgress || (() => {});

  // Normalize URL
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  const urlObj = new URL(url);
  const domain = urlObj.hostname;

  // -----------------------------------------------------------------------
  // Step 1: Run all fetchers (maximize parallelism)
  // -----------------------------------------------------------------------
  log("fetching", "Fetching page data and running analyses...");

  // These can all run in parallel
  const [rawHtmlResult, auxResult, psiResult, dnsResult] = await Promise.all([
    fetchRawHtml(url).then((r) => {
      log("fetching", "Raw HTML fetched");
      return r;
    }),
    fetchAux(url).then((r) => {
      log("fetching", "Auxiliary files checked");
      return r;
    }),
    runPageSpeed(url).then((r) => {
      log("fetching", "PageSpeed analysis complete");
      return r;
    }),
    runDnsLookups(domain).then((r) => {
      log("fetching", "DNS lookups complete");
      return r;
    }),
  ]);

  // Playwright rendered DOM — run separately (heavy, needs its own browser)
  log("rendering", "Capturing screenshots...");
  let renderedResult: RenderedDomResult | null = null;
  try {
    renderedResult = await fetchRenderedDom(url);
    log("rendering", "Screenshots captured");
  } catch (err: any) {
    console.warn("Playwright rendering failed (continuing without):", err.message);
    log("rendering", "Screenshots unavailable (Playwright error)");
  }

  // Tech fingerprints (sync, runs on already-fetched data)
  log("analyzing", "Detecting technologies...");
  const techResult = matchTechFingerprints(rawHtmlResult.rawHtml, rawHtmlResult.headers);

  // -----------------------------------------------------------------------
  // Step 2: Run all module checks
  // -----------------------------------------------------------------------
  log("analyzing", "Running SEO checks...");

  const allResults: CheckResult[] = [];

  // Module 1: On-Page SEO (sync)
  const onPageResults = runOnPageSeoChecks(rawHtmlResult, auxResult, targetKeyword, renderedResult);
  allResults.push(...onPageResults);
  log("analyzing", "On-Page SEO checks complete");

  // Module 2: Performance (sync)
  const perfResults = runPerformanceChecks(psiResult, rawHtmlResult);
  allResults.push(...perfResults);
  log("analyzing", "Performance checks complete");

  // Module 3: Usability (sync)
  const usabilityResults = runUsabilityChecks(rawHtmlResult, psiResult, renderedResult);
  allResults.push(...usabilityResults);
  log("analyzing", "Usability checks complete");

  // Module 4: Social (sync)
  const socialResults = runSocialChecks(rawHtmlResult);
  allResults.push(...socialResults);
  log("analyzing", "Social checks complete");

  // Module 5: Local SEO (async — Google Places API)
  const localResults = await runLocalSeoChecks(rawHtmlResult, domain);
  allResults.push(...localResults);
  log("analyzing", "Local SEO checks complete");

  // Module 6: Technology (sync)
  const techResults = runTechnologyChecks(rawHtmlResult, dnsResult, techResult);
  allResults.push(...techResults);
  log("analyzing", "Technology checks complete");

  // Module 7: GEO (async — Gemini API)
  const geoResults = await runGeoChecks(rawHtmlResult, auxResult, renderedResult);
  allResults.push(...geoResults);
  log("analyzing", "GEO checks complete");

  // -----------------------------------------------------------------------
  // Step 3: Calculate scores
  // -----------------------------------------------------------------------
  log("scoring", "Calculating scores...");
  const { overall, overallGrade, categoryScores, categoryNumeric } =
    calculateScores(allResults);

  // -----------------------------------------------------------------------
  // Step 4: Generate recommendations
  // -----------------------------------------------------------------------
  log("recommendations", "Generating recommendations...");
  const recommendations = generateRecommendations(allResults);

  // -----------------------------------------------------------------------
  // Step 5: Assemble output
  // -----------------------------------------------------------------------
  log("complete", "Audit complete!");

  // Group results by category into per-module objects
  const groupByCategory = (cat: string) => {
    const checks = allResults.filter((r) => r.category === cat);
    const obj: Record<string, any> = {};
    for (const c of checks) {
      obj[c.key] = {
        label: c.label,
        status: c.status,
        value: c.value,
        detail: c.detail,
        data: c.data,
        evidence: c.evidence,
      };
    }
    return obj;
  };

  const output: AuditOutput = {
    url,
    auditedAt: new Date().toISOString(),
    overallGrade,
    overallScore: overall,
    categoryScores,
    categoryNumeric,
    screenshots: renderedResult
      ? {
          desktop: renderedResult.screenshots.desktop,
          tablet: renderedResult.screenshots.tablet,
          mobile: renderedResult.screenshots.mobile,
        }
      : undefined,
    onPageSeo: groupByCategory("onPageSeo"),
    performance: groupByCategory("performance"),
    usability: groupByCategory("usability"),
    social: groupByCategory("social"),
    localSeo: groupByCategory("localSeo"),
    technology: groupByCategory("technology"),
    geo: groupByCategory("geo"),
    recommendations,
  };

  return output;
}
