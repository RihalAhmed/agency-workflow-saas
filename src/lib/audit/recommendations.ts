import type { CheckResult, Recommendation, AuditCategory, Priority } from "./types";

// ---------------------------------------------------------------------------
// Priority mapping for failed/warning checks
// High = critical SEO blockers, Medium = impactful but not urgent,
// Low = nice-to-have improvements
// ---------------------------------------------------------------------------

const PRIORITY_MAP: Record<string, Priority> = {
  // On-Page SEO — High
  title_tag: "High",
  meta_description: "High",
  h1_usage: "High",
  noindex_meta: "High",
  noindex_header: "High",
  robots_blocking: "High",
  ssl_enabled: "High",
  canonical_tag: "High",

  // On-Page SEO — Medium
  heading_structure: "Medium",
  keyword_consistency: "Medium",
  content_amount: "Medium",
  image_alt: "Medium",
  https_redirect: "Medium",
  xml_sitemap: "Medium",
  robots_txt: "Medium",
  html_lang: "Medium",
  analytics: "Medium",

  // On-Page SEO — Low
  structured_data: "Low",
  hreflang: "Low",
  serp_preview: "Low",

  // Performance — High
  performance_score: "High",
  lcp: "High",
  server_response_time: "High",

  // Performance — Medium
  fcp: "Medium",
  tti: "Medium",
  cls: "Medium",
  tbt: "Medium",
  page_size: "Medium",
  text_compression: "Medium",
  http2: "Medium",

  // Performance — Low
  js_errors: "Low",
  deprecated_html: "Low",
  inline_styles: "Low",
  speed_index: "Low",

  // Usability — High
  mobile_viewport: "High",

  // Usability — Medium
  favicon: "Medium",
  email_privacy: "Medium",

  // Usability — Low
  flash_usage: "Low",
  iframes: "Low",
  device_rendering: "Low",
  desktop_performance: "Low",

  // Social — Medium
  social_links: "Medium",
  open_graph: "Medium",
  twitter_cards: "Medium",

  // Social — Low
  facebook_pixel: "Low",

  // Local SEO — Medium
  address_phone: "Medium",
  local_business_schema: "Medium",
  google_business_profile: "Low",

  // Technology — Medium
  dmarc: "Medium",
  spf: "Medium",
  charset: "Low",

  // GEO — High
  llm_content_analysis: "High",
  identity_schema: "Medium",

  // GEO — Medium
  rendered_content_ratio: "Medium",
  llms_txt: "Medium",
  ai_crawlers_blocked: "Low",
};

// Human-readable recommendation titles
const RECOMMENDATION_TITLES: Record<string, string> = {
  title_tag: "Add or optimize your page title (50–60 chars)",
  meta_description: "Add or optimize your meta description (120–160 chars)",
  h1_usage: "Ensure exactly one H1 tag on the page",
  noindex_meta: "Remove the noindex meta tag to allow indexing",
  noindex_header: "Remove the X-Robots-Tag noindex header",
  robots_blocking: "Update robots.txt — major search engines are blocked",
  ssl_enabled: "Enable HTTPS/SSL for your website",
  canonical_tag: "Add a canonical tag to prevent duplicate content",
  heading_structure: "Fix heading hierarchy — avoid skipping levels",
  keyword_consistency: "Increase target keyword usage across page elements",
  content_amount: "Add more content — aim for 600+ words of quality text",
  image_alt: "Add alt text to all images for accessibility and SEO",
  https_redirect: "Set up HTTP → HTTPS redirect",
  xml_sitemap: "Create and submit an XML sitemap",
  robots_txt: "Add a robots.txt file",
  html_lang: "Add a lang attribute to the <html> tag",
  analytics: "Install an analytics tool (Google Analytics, etc.)",
  structured_data: "Add Schema.org structured data markup",
  performance_score: "Improve overall page performance score",
  lcp: "Optimize Largest Contentful Paint (target: ≤2.5s)",
  server_response_time: "Reduce server response time (target: ≤200ms)",
  fcp: "Improve First Contentful Paint time",
  tti: "Reduce Time to Interactive",
  cls: "Fix layout shifts (target CLS: ≤0.1)",
  tbt: "Reduce Total Blocking Time",
  page_size: "Reduce total page size",
  text_compression: "Enable text compression (Gzip/Brotli)",
  http2: "Serve resources over HTTP/2",
  js_errors: "Fix JavaScript console errors",
  deprecated_html: "Replace deprecated HTML tags with modern alternatives",
  inline_styles: "Move inline styles to external stylesheets",
  mobile_viewport: "Add a proper mobile viewport meta tag",
  favicon: "Add a favicon to your site",
  email_privacy: "Protect email addresses from harvesting (use obfuscation)",
  social_links: "Add links to your social media profiles",
  open_graph: "Add Open Graph meta tags for better social sharing",
  twitter_cards: "Add Twitter/X Card meta tags",
  dmarc: "Add a DMARC DNS record to protect against email spoofing",
  spf: "Add an SPF DNS record for email deliverability",
  charset: "Specify a character encoding",
  identity_schema: "Add Organization or Person schema for AI entity recognition",
  rendered_content_ratio: "Improve server-side rendering for AI crawler readability",
  llms_txt: "Add a /llms.txt file for AI crawler guidance",
  llm_content_analysis: "Improve content structure for AI search readiness",
  address_phone: "Display your business address and phone on the page",
  local_business_schema: "Add LocalBusiness schema markup",
};

/**
 * Generate prioritized recommendations from failed/warning checks.
 */
export function generateRecommendations(
  results: CheckResult[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const check of results) {
    // Only generate recommendations for fails and warnings
    if (check.status !== "fail" && check.status !== "warning") continue;

    const priority = PRIORITY_MAP[check.key] || "Low";
    const title =
      RECOMMENDATION_TITLES[check.key] ||
      `Fix: ${check.label}`;

    recs.push({
      title,
      category: check.category,
      priority,
    });
  }

  // Sort: High → Medium → Low
  const priorityOrder: Record<Priority, number> = {
    High: 0,
    Medium: 1,
    Low: 2,
  };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}
