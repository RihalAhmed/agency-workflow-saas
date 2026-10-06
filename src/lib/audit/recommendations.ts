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
export const RECOMMENDATION_TITLES: Record<string, string> = {
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

// Actionable solutions mapped directly to recommendations
export const RECOMMENDATION_DESCRIPTIONS: Record<string, string> = {
  title_tag: "Craft a compelling title tag between 50 and 60 characters containing your primary keyword. This is one of the strongest ranking signals.",
  meta_description: "Write an engaging meta description between 120-160 characters. While not a direct ranking factor, it heavily influences click-through rates.",
  h1_usage: "Structure your page with exactly one <h1> heading that clearly describes the content and includes your main keyword.",
  noindex_meta: "Search engines are explicitly instructed not to index this page via a meta tag. Remove it if you want this page to appear in search results.",
  noindex_header: "Your server is returning an X-Robots-Tag noindex header. Configure your web server to remove this header to allow indexing.",
  robots_blocking: "Your robots.txt file contains a Disallow rule that blocks major search engines. Remove it to allow crawlers to access the page.",
  ssl_enabled: "Your site is served over HTTP. Obtain and install an SSL certificate to encrypt traffic and avoid browser security warnings.",
  canonical_tag: "Specify a self-referencing canonical tag to prevent search engines from penalizing your site for duplicate content.",
  heading_structure: "Ensure your headings follow a logical hierarchy (H1 -> H2 -> H3) without skipping levels for better accessibility and SEO.",
  keyword_consistency: "Your target keyword is missing from critical page elements. Ensure it appears naturally in your Title, H1, Meta Description, and body text.",
  content_amount: "Pages with thin content struggle to rank. Add comprehensive, valuable text (ideally 600+ words) covering the topic in-depth.",
  image_alt: "Provide descriptive alt text for all images. This helps visually impaired users and gives search engines context about your media.",
  https_redirect: "Force all HTTP traffic to redirect to HTTPS to ensure users and search engines always access the secure version of your site.",
  xml_sitemap: "An XML sitemap helps search engines discover and crawl your pages efficiently. Generate one and submit it via Google Search Console.",
  robots_txt: "A robots.txt file tells search engines which pages they can and cannot crawl. Add one to the root of your domain to guide crawlers.",
  html_lang: "Specify the language of your content in the <html> tag (e.g. lang='en') to help search engines serve the page to the correct audience.",
  analytics: "Implement a tracking tool like Google Analytics to monitor traffic, user behavior, and measure the success of your SEO campaigns.",
  structured_data: "Implement Schema markup (JSON-LD) to help search engines understand your content and qualify for rich snippets in search results.",
  performance_score: "Your overall Core Web Vitals and lab data indicate poor performance. Review the speed metrics below and optimize accordingly.",
  lcp: "Largest Contentful Paint (LCP) measures loading performance. To improve it, optimize your largest images, use a CDN, and defer non-critical CSS.",
  server_response_time: "Time to First Byte (TTFB) is too slow. Upgrade your hosting, implement server-side caching, and optimize database queries.",
  fcp: "First Contentful Paint (FCP) measures how long it takes for the first text or image to appear. Eliminate render-blocking resources to speed this up.",
  tti: "Time to Interactive measures when the page becomes fully responsive. Defer offscreen JavaScript and minimize main-thread work.",
  cls: "Cumulative Layout Shift (CLS) measures visual stability. Ensure all images have width and height attributes to prevent layout jumping.",
  tbt: "Total Blocking Time (TBT) measures main-thread blocking. Break up long JavaScript tasks and remove unused scripts to improve interactivity.",
  page_size: "Large pages take longer to download and parse. Compress media, minify CSS/JS, and remove unnecessary third-party scripts to reduce size.",
  text_compression: "Enable Gzip or Brotli compression on your server to significantly reduce the transfer size of your HTML, CSS, and JavaScript files.",
  http2: "HTTP/2 allows browsers to download multiple files simultaneously over a single connection. Upgrade your server to support HTTP/2.",
  js_errors: "JavaScript errors in the browser console can break page functionality and stop search engine crawlers from indexing dynamic content.",
  deprecated_html: "Your code uses outdated HTML tags (like <font> or <center>). Replace them with modern CSS to ensure cross-browser compatibility.",
  inline_styles: "Inline styles bloat your HTML and block caching. Move CSS rules into an external stylesheet to improve performance.",
  mobile_viewport: "Include a <meta name='viewport' content='width=device-width, initial-scale=1'> tag to ensure your page scales correctly on mobile devices.",
  favicon: "A missing favicon results in an empty browser tab icon and causes unnecessary 404 errors when browsers automatically request it.",
  email_privacy: "Plaintext email addresses are easily scraped by spam bots. Use a contact form or encode/obfuscate the email address in your HTML.",
  social_links: "Link to your active social media profiles to build brand authority and trust with both users and search engines.",
  open_graph: "Open Graph (OG) tags dictate how your page looks when shared on Facebook and LinkedIn. Add them to ensure your shares have images and titles.",
  twitter_cards: "Twitter Card tags ensure your page displays a rich preview (image, title, and summary) when shared on X/Twitter.",
  dmarc: "DMARC policies protect your domain from being used in email spoofing and phishing attacks. Configure a DMARC DNS record.",
  spf: "An SPF record specifies which mail servers are authorized to send email on behalf of your domain, drastically improving deliverability.",
  charset: "Declare your character encoding (e.g. UTF-8) early in the <head> to prevent browsers from rendering text incorrectly.",
  identity_schema: "AI engines rely on Schema.org Organization or Person markup to understand your brand identity and populate knowledge panels.",
  rendered_content_ratio: "Heavy client-side rendering (SPA) can hide content from AI crawlers. Ensure critical text is available in the initial server HTML payload.",
  llms_txt: "Publishing a /llms.txt file allows you to provide clean, markdown-formatted context explicitly designed for consumption by AI agents and LLMs.",
  llm_content_analysis: "Your content lacks the dense, factual structure that AI engines (like ChatGPT or Perplexity) favor. Add clear headings, bullet points, and definitive answers.",
  address_phone: "Local businesses must clearly display their Name, Address, and Phone number (NAP) consistently to rank in local map packs.",
  local_business_schema: "Inject LocalBusiness JSON-LD markup to feed your exact operating hours, location, and reviews directly to Google Maps and Search.",
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
      checkKey: check.key,
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
