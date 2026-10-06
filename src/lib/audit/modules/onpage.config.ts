export const ONPAGE_CONFIG = {
  TITLE_MIN: 50,
  TITLE_MAX: 60,
  META_MIN: 120,
  META_MAX: 160,
  CONTENT_MIN: 300,
  VAGUE_ANCHORS: [
    "click here", "here", "read more", "more", "learn more",
    "link", "this", "click", "details", "info", "continue", "go"
  ],
  COMPLEX_URL_MAX_LENGTH: 100,
  COMPLEX_URL_MAX_PARAMS: 2,
  COMPLEX_URL_BAD_PARAMS: ["sessionid", "sid", "phpsessid"],
  IDENTITY_TYPES: [
    "Organization", "LocalBusiness", "Corporation", "ProfessionalService",
    "HomeAndConstructionBusiness", "Store", "Restaurant", "Dentist",
    "LegalService", "RealEstateAgent", "AutoRepair"
  ]
};

export const HOW_TO: Record<string, { why: string; steps: string[]; wordpress?: string[] }> = {
  indexability: {
    why: "A noindex instruction tells Google to keep this page out of search results.",
    steps: [
      "Check 'What we found' to see whether noindex comes from the meta robots tag or the X-Robots-Tag header.",
      "Meta tag: remove 'noindex' (and 'nofollow' if shown) from the robots meta tag in your page head (theme template or SEO plugin).",
      "Header: remove the X-Robots-Tag rule from your server config (.htaccess, nginx) or CDN settings.",
      "Re-run the audit, then in Google Search Console use URL Inspection > Request indexing."
    ],
    wordpress: [
      "Settings > Reading: untick 'Discourage search engines from indexing this site'.",
      "Yoast: page > Advanced > 'Allow search engines to show this page in search results' = Yes. Rank Math: page > Advanced > Robots Meta > Index.",
      "Re-run the audit."
    ]
  },
  canonical: {
    why: "The canonical tag tells Google which URL is the main version of this page and prevents duplicate-content confusion.",
    steps: [
      "Add <link rel=\"canonical\" href=\"https://yourdomain.com/this-page/\"> inside <head>, using the full absolute URL of this exact page.",
      "Use one canonical tag per page. It must match the page's final https address (same www or non-www, same trailing slash).",
      "If it points to another URL on purpose, confirm the target is right; otherwise change it to this page's own URL.",
      "Re-run the audit."
    ],
    wordpress: [
      "Yoast or Rank Math add a self-referencing canonical automatically. If it is missing or wrong, check page SEO > Advanced > Canonical URL (leave blank for the default) and look for a theme or second plugin that removes or overrides it."
    ]
  },
  title_tag: {
    why: "The title is the main headline shown in Google results and browser tabs, and one of the strongest on-page signals.",
    steps: [
      "Write a unique title for this page, 50-60 characters.",
      "Lead with the main service and location, brand last (format: Primary Service in City | Brand).",
      "Make it read naturally; no keyword stuffing.",
      "If more than one title tag was found, disable title output from your theme or the second SEO plugin.",
      "Re-run the audit."
    ],
    wordpress: [
      "Yoast or Rank Math > page > SEO title (Edit snippet)."
    ]
  },
  meta_description: {
    why: "The meta description is the summary Google often shows under your title; a clear one improves clicks.",
    steps: [
      "Write a unique description for this page, 120-160 characters.",
      "Say what the page offers and give a reason to click (service, area, call to action).",
      "Do not copy the first paragraph.",
      "If more than one tag was found, disable the duplicate from your theme or second SEO plugin.",
      "Re-run the audit."
    ],
    wordpress: [
      "Yoast or Rank Math > page > Meta description (snippet editor)."
    ]
  },
  h1_usage: {
    why: "The H1 is the page's main heading; it tells visitors and search engines what the page is about.",
    steps: [
      "Make sure the page has exactly one H1 describing its topic.",
      "If none: set the main heading to Heading 1. If several: keep the main one and change the others to H2 or H3.",
      "In page builders (Elementor, Divi, Gutenberg) set the heading's 'HTML tag' or level to H1; do not just enlarge the text.",
      "Re-run the audit."
    ]
  },
  headings: {
    why: "Heading levels form the outline of the page. Skipping a level (like H2 -> H4) breaks that outline for screen readers and makes the structure harder to parse.",
    steps: [
      "Open 'What we found' to see which headings skip a level.",
      "Change the skipped heading to the next level (H4 -> H3), or add the missing level above it.",
      "Choose heading levels by structure, not by size; use CSS to change size.",
      "In page builders change the heading's 'HTML tag'.",
      "Re-run the audit."
    ]
  },
  content_amount: {
    why: "Pages with very little text give search engines little to understand. There is no official minimum; under about 300 words is commonly treated as thin.",
    steps: [
      "Add real information visitors need: services, process, pricing factors, areas served, FAQs.",
      "Aim to fully answer the search intent rather than hit a word count.",
      "Organize new sections with headings.",
      "Re-run the audit."
    ]
  },
  image_alt: {
    why: "Alt text describes an image to screen readers and Google Images. Missing alt text is an accessibility and image-search gap.",
    steps: [
      "Open the list in 'What we found'.",
      "Add a short, descriptive alt text to each image describing what is in it (not a keyword list).",
      "For purely decorative images set an empty alt (alt=\"\") so screen readers skip them.",
      "Re-run the audit."
    ],
    wordpress: [
      "Media Library > click the image > Alt Text field; or in the block editor select the image > Alt text."
    ]
  },
  schema: {
    why: "Structured data (schema.org) tells search engines who the business is, where it is and how to contact it, and can make results richer.",
    steps: [
      "Add JSON-LD in the page head with at least an Organization or LocalBusiness: name, url, logo, address, telephone.",
      "If a block is reported invalid, fix its syntax (usually a missing comma or quote).",
      "Test it in Google's Rich Results Test and validator.schema.org.",
      "Re-run the audit."
    ],
    wordpress: [
      "Rank Math > Titles & Meta > Local SEO. Yoast > Settings > Site representation (Organization), or Yoast Local SEO. Check that your theme and plugins do not output duplicate blocks."
    ]
  },
  links: {
    why: "Descriptive anchor text and clean URLs help visitors and search engines understand where a link leads.",
    steps: [
      "Open the lists in 'What we found'.",
      "Replace vague anchor text ('click here', 'read more') with text describing the destination, e.g. 'view our pricing'.",
      "Replace long query-string URLs with clean, readable ones.",
      "Re-run the audit."
    ],
    wordpress: [
      "Settings > Permalinks > Post name. Edit link text by selecting it in the editor and editing the link."
    ]
  }
};
