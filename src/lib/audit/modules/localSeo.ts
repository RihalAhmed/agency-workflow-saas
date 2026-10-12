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

  // --- HTML Preparation ---
  const visibleClone = $.root().clone();
  visibleClone.find("script, style, noscript").remove();
  const visibleText = visibleClone.text();
  const visibleTextLower = visibleText.toLowerCase();

  // -----------------------------------------------------------------------
  // 1. Name (NAP "N")
  // -----------------------------------------------------------------------
  const title = $("title").text().trim();
  const ogSiteName = $('meta[property="og:site_name"]').attr("content")?.trim();
  let schemaName: string | null = null;
  
  // Also parse schema globally here
  const localBusinessTypes = [
    "LocalBusiness", "Restaurant", "Store", "Dentist", "Physician",
    "Attorney", "RealEstateAgent", "Plumber", "Electrician", "AutoRepair",
    "FinancialService", "LegalService", "MedicalBusiness",
    "HomeAndConstructionBusiness", "FoodEstablishment", "LodgingBusiness",
    "SportsActivityLocation", "EntertainmentBusiness", "HealthAndBeautyBusiness",
    "ProfessionalService", "Organization"
  ];

  let foundLocalType: string | null = null;
  let schemaAddress = false;
  let schemaPhone = false;
  let schemaDataStr: string = "";
  
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const rawHtml = $(el).html() || "{}";
      const json = JSON.parse(rawHtml);
      const check = (obj: any) => {
        const type = obj["@type"];
        const isLocalType = typeof type === "string" ? localBusinessTypes.includes(type) : (Array.isArray(type) ? type.some(t => localBusinessTypes.includes(t)) : false);
        
        if (isLocalType) {
          foundLocalType = Array.isArray(type) ? type.find(t => localBusinessTypes.includes(t)) || "LocalBusiness" : type;
          schemaDataStr = rawHtml.substring(0, 150) + "...";
          if (obj.name) schemaName = obj.name;
          if (obj.address || obj.location?.address) schemaAddress = true;
          if (obj.telephone || obj.phone) schemaPhone = true;
        } else if (obj["@type"] === "Organization") {
          // Fallback just to grab a name
          if (obj.name && !schemaName) schemaName = obj.name;
        }
        if (obj["@graph"]) obj["@graph"].forEach(check);
      };
      check(json);
    } catch {}
  });

  const businessName = ogSiteName || schemaName || title.split(/[-|]/)[0].trim() || domain;
  
  // Consistency check for Name
  const hasName = !!businessName;
  const nameConsistent = (ogSiteName && schemaName && ogSiteName === schemaName) || (!ogSiteName || !schemaName);

  let nameScore = 2;
  let nameStatus = "pass";
  if (!hasName) {
    nameScore = 0; nameStatus = "fail";
  } else if (!nameConsistent) {
    nameScore = 1; nameStatus = "warning";
  }

  results.push({
    key: "nap_name",
    label: "Business Name (NAP)",
    category: "localSeo",
    status: nameStatus as any,
    score: nameScore,
    detail: hasName ? `Found: ${businessName}` : "Missing business name",
    data: {
      found: hasName,
      mismatch: !nameConsistent,
      name: businessName,
      whatWeFound: hasName 
        ? (!nameConsistent ? "Business name found, but differs between tags and schema." : "Business name found and consistent.") 
        : "No clear business name in title, og:site_name, or schema.",
      whyItsHappening: !hasName ? "The site was built without basic metadata identifying the entity name." : (!nameConsistent ? "The name in the title tag or OG tags doesn't exactly match the structured data." : "Everything is aligned."),
      impactAndFix: !hasName 
        ? "Google needs a consistent Name to rank you. Add your exact DBA name to the title, footer, and schema."
        : (!nameConsistent ? "Inconsistencies confuse Google's Local graph. Ensure your name is identical everywhere." : "Consistent naming builds local trust.")
    }
  });

  // -----------------------------------------------------------------------
  // 2. Phone (NAP "P")
  // -----------------------------------------------------------------------
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const rawPhones = visibleText.match(phoneRegex) || [];
  const phones = [...new Set(rawPhones.filter(p => p.replace(/\D/g, "").length >= 7 && p.replace(/\D/g, "").length <= 15))];
  
  const clickablePhones = $('a[href^="tel:"]').length > 0;
  
  let phoneScore = 2;
  let phoneStatus = "pass";
  let phoneWhy = "A phone number was found and is a clickable link.";
  
  if (phones.length === 0) {
    phoneScore = 0; phoneStatus = "fail";
    phoneWhy = "No phone number was found in the visible text.";
  } else if (!clickablePhones) {
    phoneScore = 1; phoneStatus = "warning";
    phoneWhy = "A phone number was found, but it is not a clickable 'tel:' link.";
  } else if (phones.length > 2) {
    phoneScore = 1; phoneStatus = "warning";
    phoneWhy = "Multiple different phone numbers were found, which may confuse search engines.";
  }

  results.push({
    key: "nap_phone",
    label: "Phone Number (NAP)",
    category: "localSeo",
    status: phoneStatus as any,
    score: phoneScore,
    detail: phones.length > 0 ? `Found: ${phones[0]}` : "Missing phone number",
    data: {
      found: phones.length > 0,
      mismatch: phones.length > 2,
      number: phones[0] || null,
      whatWeFound: phoneWhy,
      whyItsHappening: phones.length === 0 ? "The phone number is missing, hidden in an image, or injected by JS we couldn't parse." : (!clickablePhones ? "The developer wrote the number as plain text instead of an HTML <a> tag." : "Multiple numbers exist (possibly call tracking)."),
      impactAndFix: phones.length === 0 
        ? "Missing phone numbers hurt local rankings. Add a text-based phone number." 
        : (!clickablePhones ? "Mobile visitors can't tap to call. Wrap it in <a href='tel:NUMBER'>." : "Ensure your primary local number is clearly marked in schema.")
    }
  });

  // -----------------------------------------------------------------------
  // 3. Address (NAP "A") & SAB Exception
  // -----------------------------------------------------------------------
  const addressIndicators = [
    /\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl)/i,
    /\b\d{5}(?:-\d{4})?\b/, // US zip
    /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b/i, // UK postcode
  ];
  
  const foundAddresses: string[] = [];
  for (const regex of addressIndicators) {
    const match = visibleText.match(regex);
    if (match && match[0]) foundAddresses.push(match[0].trim().substring(0, 50));
  }

  const hasAddressText = foundAddresses.length > 0;
  const isAddressInFooter = $("footer").text().match(addressIndicators[0]) !== null;

  // SAB (Service Area Business) Detection
  // If no address, look for "service area", "cities we serve", or lists of local cities
  const sabKeywords = ["service area", "areas we serve", "serving", "counties", "locations"];
  const isLikelySAB = !hasAddressText && sabKeywords.some(kw => visibleTextLower.includes(kw)) && phones.length > 0;

  let addressScore = 2;
  let addressStatus = "pass";
  let addressFoundStr = hasAddressText ? `Found: ${foundAddresses[0]}` : "No address text in the page HTML.";
  let addressWhy = "Address found in crawlable text.";
  let addressImpact = "Good consistent local signals.";

  if (!hasAddressText) {
    if (isLikelySAB) {
      addressScore = 1; addressStatus = "warning";
      addressWhy = "No address found, but we detected Service Area Business signals.";
      addressImpact = "Add service-area schema and dedicated city pages to rank in your target areas.";
    } else {
      addressScore = 0; addressStatus = "fail";
      addressWhy = "Address is missing, in an image/iframe, or on an uncrawled page.";
      addressImpact = "Google can't tie this site to a location. Add the full address to the footer as crawlable text.";
    }
  } else if (!isAddressInFooter) {
    addressScore = 1; addressStatus = "warning";
    addressWhy = "Address found, but not located in the site footer or global element.";
    addressImpact = "It's best practice to place the primary NAP details in the footer so they appear site-wide.";
  }

  results.push({
    key: "nap_address",
    label: "Address (NAP)",
    category: "localSeo",
    status: addressStatus as any,
    score: addressScore,
    detail: addressFoundStr,
    data: {
      found: hasAddressText,
      mismatch: hasAddressText && !isAddressInFooter,
      address: foundAddresses[0] || null,
      isSAB: isLikelySAB,
      whatWeFound: addressWhy,
      whyItsHappening: !hasAddressText ? "The address was likely omitted or baked into an image." : (!isAddressInFooter ? "The address is only on a specific page, not global." : "Address is globally visible."),
      impactAndFix: addressImpact
    }
  });

  // -----------------------------------------------------------------------
  // 4. LocalBusiness Schema
  // -----------------------------------------------------------------------
  let schemaScore = 2;
  let schemaStatus = "pass";
  let schemaWhy = "Valid LocalBusiness schema found.";
  let schemaImpact = "Perfect.";

  if (!foundLocalType) {
    if (hasAddressText || phones.length > 0) {
      schemaScore = 0; schemaStatus = "fail";
      schemaWhy = "No LocalBusiness schema found, but local NAP data exists on page.";
      schemaImpact = "Missing a major ranking signal. Add LocalBusiness JSON-LD markup.";
    } else {
      schemaScore = 3; schemaStatus = "info"; // Unknown / N/A
      schemaWhy = "No schema found, and no local indicators detected.";
      schemaImpact = "If this is a local business, you must add schema markup.";
    }
  } else if (!schemaAddress || !schemaPhone) {
    schemaScore = 1; schemaStatus = "warning";
    schemaWhy = `Found ${foundLocalType} schema, but missing required fields (address/phone).`;
    schemaImpact = "Schema is present but incomplete. Add the 'address' and 'telephone' properties.";
  }

  results.push({
    key: "local_schema",
    label: "LocalBusiness Schema",
    category: "localSeo",
    status: schemaStatus as any,
    score: schemaScore,
    detail: foundLocalType ? `Found: ${foundLocalType}` : "Missing",
    data: {
      found: !!foundLocalType,
      type: foundLocalType,
      whatWeFound: schemaWhy,
      whyItsHappening: !foundLocalType ? "The theme or builder doesn't automatically output structured data." : "The injected schema is missing critical properties.",
      impactAndFix: schemaImpact
    }
  });

  return results;
}
