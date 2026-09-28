import * as cheerio from "cheerio";
import type { CheckResult, RawHtmlResult } from "../types";

/**
 * Module 5 — Local SEO
 */
export async function runLocalSeoChecks(
  raw: RawHtmlResult,
  domain: string
): Promise<CheckResult[]> {
  const $ = cheerio.load(raw.rawHtml);
  const results: CheckResult[] = [];

  // -----------------------------------------------------------------------
  // 1. Address & Phone Detection
  // -----------------------------------------------------------------------
  const visibleClone = $.root().clone();
  visibleClone.find("script, style, noscript").remove();
  const visibleText = visibleClone.text();

  // Phone patterns (US, UK, international)
  const phoneRegex =
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const phones = [...new Set((visibleText.match(phoneRegex) || []).filter(
    (p) => p.replace(/\D/g, "").length >= 7 && p.replace(/\D/g, "").length <= 15
  ))];

  // Simple address pattern — look for common address indicators
  const addressIndicators = [
    /\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl)/i,
    /(?:suite|ste|unit|apt|#)\s*\d+/i,
    /\b\d{5}(?:-\d{4})?\b/, // US zip
    /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b/i, // UK postcode
  ];
  const hasAddress = addressIndicators.some((p) => p.test(visibleText));

  // Also check for LocalBusiness schema
  let schemaAddress = false;
  let schemaPhone = false;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: any) => {
        if (obj.address || obj.location?.address) schemaAddress = true;
        if (obj.telephone || obj.phone) schemaPhone = true;
        if (obj["@graph"]) obj["@graph"].forEach(check);
      };
      check(json);
    } catch {}
  });

  results.push({
    key: "address_phone",
    label: "Address & Phone Visibility",
    category: "localSeo",
    status:
      (hasAddress || schemaAddress) && (phones.length > 0 || schemaPhone)
        ? "pass"
        : hasAddress || schemaAddress || phones.length > 0 || schemaPhone
          ? "warning"
          : "info",
    detail: [
      hasAddress || schemaAddress ? "Address found" : "No address detected",
      phones.length > 0 || schemaPhone ? "Phone found" : "No phone detected",
    ].join(" · "),
    data: {
      hasAddress: hasAddress || schemaAddress,
      hasPhone: phones.length > 0 || schemaPhone,
      phones: phones.slice(0, 3),
    },
  });

  // -----------------------------------------------------------------------
  // 2. Local Business Schema
  // -----------------------------------------------------------------------
  const localBusinessTypes = [
    "LocalBusiness",
    "Restaurant",
    "Store",
    "Dentist",
    "Physician",
    "Attorney",
    "RealEstateAgent",
    "Plumber",
    "Electrician",
    "AutoRepair",
    "FinancialService",
    "LegalService",
    "MedicalBusiness",
    "HomeAndConstructionBusiness",
    "FoodEstablishment",
    "LodgingBusiness",
    "SportsActivityLocation",
    "EntertainmentBusiness",
    "HealthAndBeautyBusiness",
    "ProfessionalService",
  ];

  let foundLocalType: string | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      const check = (obj: any) => {
        const type = obj["@type"];
        if (typeof type === "string" && localBusinessTypes.includes(type)) {
          foundLocalType = type;
        }
        if (Array.isArray(type)) {
          for (const t of type) {
            if (localBusinessTypes.includes(t)) {
              foundLocalType = t;
            }
          }
        }
        if (obj["@graph"]) obj["@graph"].forEach(check);
      };
      check(json);
    } catch {}
  });

  results.push({
    key: "local_business_schema",
    label: "Local Business Schema",
    category: "localSeo",
    status: foundLocalType ? "pass" : "info",
    value: foundLocalType,
    detail: foundLocalType
      ? `Found schema type: ${foundLocalType}`
      : "No LocalBusiness schema found (may not apply to all sites)",
  });

  // -----------------------------------------------------------------------
  // 3. Google Business Profile Check
  // -----------------------------------------------------------------------
  const placesKey = process.env.GOOGLE_PLACES_API_KEY;
  if (placesKey) {
    try {
      // Use the domain to search for the business
      const searchQuery = domain.replace(/^www\./i, "");
      const endpoint = new URL(
        "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
      );
      endpoint.searchParams.set("input", searchQuery);
      endpoint.searchParams.set("inputtype", "textquery");
      endpoint.searchParams.set("fields", "name,formatted_address,rating,user_ratings_total,place_id");
      endpoint.searchParams.set("key", placesKey);

      const res = await fetch(endpoint.toString(), {
        signal: AbortSignal.timeout(10_000),
      });
      const data = await res.json();

      if (data.status === "OK" && data.candidates?.length > 0) {
        const place = data.candidates[0];
        results.push({
          key: "google_business_profile",
          label: "Google Business Profile",
          category: "localSeo",
          status: "pass",
          detail: `Found: ${place.name} — ${place.formatted_address || ""}${
            place.rating ? ` (${place.rating}★, ${place.user_ratings_total} reviews)` : ""
          }`,
          data: {
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            placeId: place.place_id,
          },
        });
      } else {
        results.push({
          key: "google_business_profile",
          label: "Google Business Profile",
          category: "localSeo",
          status: "info",
          detail: "No Google Business Profile found for this domain",
        });
      }
    } catch (err) {
      results.push({
        key: "google_business_profile",
        label: "Google Business Profile",
        category: "localSeo",
        status: "info",
        detail: "Could not check Google Business Profile (API error)",
      });
    }
  } else {
    results.push({
      key: "google_business_profile",
      label: "Google Business Profile",
      category: "localSeo",
      status: "info",
      detail: "Skipped — GOOGLE_PLACES_API_KEY not configured",
    });
  }

  return results;
}
