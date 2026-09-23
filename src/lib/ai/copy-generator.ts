import { GoogleGenAI } from "@google/genai";

export interface GenerateCopyInput {
  businessName: string;
  category: string;
  city: string;
  companyContext?: string;
  apiKey?: string;
  designId?: string;
}

export interface GeneratedCopyOutput {
  tagline: string;
  emergencyBadge: string;
  heroPrefix: string;
  heroHighlight: string;
  heroSuffix: string;
  subBadges: Array<{ icon: string; text: string }>;
  heroCtaText: string;
  formTitle: string;
  formSubmitText?: string;
  services: string[];
  aboutBadgeLabel: string;
  aboutHeadline: string;
  aboutParagraphs: string[];
  aboutCtaText: string;
}

import { getContentBounds } from "./content-bounds";

/**
 * Generates custom, high-converting website copy for a business based on
 * the operator's company context and details.
 * Uses Google Gemini API if a key is provided (or in process.env.GEMINI_API_KEY).
 * Falls back to an intelligent contextual synthesis engine if no key is present.
 */
export async function generateCompanyCopy(
  input: GenerateCopyInput
): Promise<GeneratedCopyOutput> {
  const apiKey = input.apiKey || process.env.GEMINI_API_KEY;
  const bounds = getContentBounds(input.designId || "crown-home");

  if (apiKey && input.companyContext && input.companyContext.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a world-class direct response copywriter for local home service businesses.
Your task is to write high-converting, punchy, active-voice landing page copy for the following company based on the details provided.

COMPANY DETAILS:
- Business Name: ${input.businessName}
- Niche/Category: ${input.category}
- Target City: ${input.city}
- Context & Notes from the owner:
"""
${input.companyContext}
"""

Return a JSON object with EXACTLY this structure:
{
  "tagline": "Short top-bar trust tagline, e.g. 'Austin\\'s Trusted Eco-Friendly Pest Control Since 1998.'",
  "emergencyBadge": "Short urgency badge, e.g. '24/7 Emergency Support' or 'Same-Day Dispatch'",
  "heroPrefix": "1 to 3 uppercase words before highlighted word, e.g. 'PROTECT WITH'",
  "heroHighlight": "1 to 3 uppercase punchy words highlighted in accent color, e.g. 'AUSTIN\\'S FINEST'",
  "heroSuffix": "1 to 4 uppercase words completing the heading, e.g. 'ORGANIC PEST DEFENSE'",
  "subBadges": [
    // Provide EXACTLY ${bounds.subBadges.max} sub-badges
    { "icon": "emoji like 🛡️ or 🌿", "text": "Short badge 1 (e.g. State Licensed & Insured)" },
    { "icon": "emoji like 🐾 or 👨‍👩‍👧", "text": "Short badge 2 (e.g. 100% Pet & Child Safe)" },
    { "icon": "emoji like ⭐ or 👑", "text": "Short badge 3 (e.g. 30+ Years of Local Trust)" }
  ],
  "heroCtaText": "Action-oriented button text, e.g. 'Get Pest Control Help' or 'Request Free Inspection'",
  "formTitle": "Uppercase quote form header, e.g. 'REQUEST A FREE PEST CONTROL QUOTE'",
  "services": [
    "Provide BETWEEN ${bounds.services.min} and ${bounds.services.max} specific services offered based on context or niche"
  ],
  "aboutBadgeLabel": "e.g. 'About The Company'",
  "aboutHeadline": "Uppercase headline, e.g. 'FAMILY-OWNED PROTECTION FOR AUSTIN HOMES.'",
  "aboutParagraphs": [
    "Provide BETWEEN ${bounds.aboutParagraphs.min} and ${bounds.aboutParagraphs.max} paragraphs of about story."
  ],
  "aboutCtaText": "e.g. 'LEARN MORE' or 'EXPLORE OUR SERVICES'"
}

Rules:
- Strictly NO placeholder lorem ipsum.
- Keep the tone confident, warm, authoritative, and local.
- Adhere strictly to the facts provided in the company context.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText) as GeneratedCopyOutput;
        if (
          parsed.heroHighlight &&
          parsed.aboutParagraphs &&
          Array.isArray(parsed.aboutParagraphs) &&
          parsed.aboutParagraphs.length >= 2
        ) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini API copy generation error, falling back to smart engine:", err);
    }
  }

  // Smart Contextual Engine Fallback
  return generateSmartContextualCopy(input);
}

/**
 * Intelligent rule-based contextual generator that parses the user's description
 * for years in business, specialty claims, and city references to craft authored copy.
 */
export function generateSmartContextualCopy(
  input: GenerateCopyInput
): GeneratedCopyOutput {
  const { businessName, category, city, companyContext = "", designId = "crown-home" } = input;
  const ctx = companyContext.toLowerCase();
  const bounds = getContentBounds(designId);

  // 1. Detect years in business / founded year
  const yearMatch = ctx.match(/\b(19\d{2}|20\d{2})\b/);
  const foundedYear = yearMatch ? yearMatch[1] : "1988";

  const numYearsMatch = ctx.match(/(\d+)\+?\s*(years|yrs)/);
  const yearsActive = numYearsMatch ? numYearsMatch[1] : "35";

  // 2. Detect specialty / key attributes
  const isEco = ctx.includes("eco") || ctx.includes("green") || ctx.includes("organic") || ctx.includes("natural");
  const is247 = ctx.includes("24/7") || ctx.includes("emergency") || ctx.includes("same day") || ctx.includes("24 hours");
  const isFamily = ctx.includes("family") || ctx.includes("locally owned") || ctx.includes("veteran") || true;

  // 3. Craft Hero Heading
  let heroHighlight = "THE CROWN";
  let heroPrefix = "WEAR";
  let heroSuffix = `OF A ${city.toUpperCase()} PEST-FREE HOME`;

  if (isEco) {
    heroPrefix = "EXPERIENCE";
    heroHighlight = "NATURAL DEFENSE";
    heroSuffix = `FOR ${city.toUpperCase()} HOMES`;
  } else if (category === "roofing") {
    heroPrefix = "TOP-RATED";
    heroHighlight = "ROOFING PROTECTION";
    heroSuffix = `ACROSS ${city.toUpperCase()}`;
  } else if (category === "hvac") {
    heroPrefix = "TOTAL";
    heroHighlight = "CLIMATE COMFORT";
    heroSuffix = `FOR ${city.toUpperCase()} FAMILIES`;
  } else if (category === "plumbing") {
    heroPrefix = "FAST & RELIABLE";
    heroHighlight = "PLUMBING EXPERTS";
    heroSuffix = `IN ${city.toUpperCase()}`;
  }

  // 4. Craft Sub-badges
  const subBadges = [
    {
      icon: isEco ? "🌿" : "🛡️",
      text: isEco ? "100% Eco-Friendly & Safe" : "State Licensed & Fully Insured",
    },
    {
      icon: "👩‍👧",
      text: "Kid & Pet Safe Solutions",
    },
    {
      icon: "👑",
      text: `Family-Owned Since ${foundedYear}`,
    },
  ].slice(0, bounds.subBadges.max);

  // 5. Craft Form Title & Services
  const formTitle = `REQUEST A FREE ${category.toUpperCase().replace("-", " ")} QUOTE`;

  const services = [
    "Comprehensive Property Inspection",
    "Targeted Treatment & Elimination",
    "Preventative Perimeter Barrier",
    "Eco-Friendly Maintenance Plan",
    "Commercial & Residential Protection",
  ].slice(0, Math.max(bounds.services.min, Math.min(5, bounds.services.max)));

  // 6. Craft About Story
  const aboutHeadline = `FAMILY-OWNED PROTECTION FOR ${city.toUpperCase()} HOMES.`;

  const paragraph1 = `${businessName} has been safeguarding homes across ${city} since ${foundedYear} — established on the simple belief that reliable home service means treating every customer's home like our very own. Decades later, that foundational commitment remains unbroken. We are still proudly family-owned, still deploying vetted career technicians rather than scripted contractors, and dedicated to keeping your sanctuary secure.`;

  const paragraph2 =
    companyContext.trim().length > 30
      ? `Our team specializes in tailored solutions designed for our local climate and environment. As local residents themselves, our specialists understand the unique challenges properties face in ${city}. Every treatment comes backed by our ironclad guarantee: if issues resurface between scheduled visits, our crew returns immediately at zero additional charge.`
      : `Every treatment we run comes with a simple promise: if pests come back between visits, so do we, free of charge. No fine print, no upsells, no excuses. Just honest, diligent work from a team that has earned ${city}'s trust one family at a time for over ${yearsActive} years.`;

  const paragraph3 = `That is what wearing the crown of service means to everyone at ${businessName} — never standing above the communities we serve, but always standing firmly behind them.`;

  const aboutParagraphs = [paragraph1, paragraph2, paragraph3].slice(
    0,
    Math.max(bounds.aboutParagraphs.min, Math.min(3, bounds.aboutParagraphs.max))
  );

  return {
    tagline: `Family-Owned Since ${foundedYear}. Better Because We Care.`,
    emergencyBadge: is247 ? "24/7 Emergency Support" : "Same-Day Priority Service",
    heroPrefix,
    heroHighlight,
    heroSuffix,
    subBadges,
    heroCtaText: `Get ${category.replace("-", " ")} Help`,
    formTitle,
    services,
    aboutBadgeLabel: "About The Company",
    aboutHeadline,
    aboutParagraphs,
    aboutCtaText: "LEARN MORE",
  };
}
