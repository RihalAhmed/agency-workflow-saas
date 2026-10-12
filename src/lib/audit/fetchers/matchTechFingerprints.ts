import type { TechFingerprintResult, DetectedTech } from "../types";

// ---------------------------------------------------------------------------
// Embedded fingerprint database (Wappalyzer-style)
// A curated subset covering the most common CMS, JS frameworks, analytics,
// CDNs, and server-side tech. Each entry defines match patterns against
// HTML, headers, meta tags, and script sources.
// ---------------------------------------------------------------------------

interface Fingerprint {
  name: string;
  category: string;
  website?: string;
  html?: RegExp[];
  headers?: Record<string, RegExp>;
  meta?: Record<string, RegExp>;
  scripts?: RegExp[];
  implies?: string[];
}

const FINGERPRINTS: Fingerprint[] = [
  // ---------- CMS ----------
  {
    name: "WordPress",
    category: "CMS",
    website: "https://wordpress.org",
    html: [/wp-content/i, /wp-includes/i, /<meta\s+name="generator"\s+content="WordPress/i],
    headers: { "x-powered-by": /WordPress/i, link: /wp-json/i },
    meta: { generator: /WordPress/i },
  },
  {
    name: "Shopify",
    category: "CMS",
    website: "https://shopify.com",
    html: [/cdn\.shopify\.com/i, /Shopify\.theme/i],
    headers: { "x-shopify-stage": /.+/ },
    meta: { generator: /Shopify/i },
  },
  {
    name: "Wix",
    category: "CMS",
    website: "https://wix.com",
    html: [/wix\.com/i, /X-Wix-/i, /_wixCIDX/i],
    headers: { "x-wix-request-id": /.+/ },
    meta: { generator: /Wix/i },
  },
  {
    name: "Squarespace",
    category: "CMS",
    website: "https://squarespace.com",
    html: [/squarespace\.com/i, /static\.squarespace\.com/i],
    meta: { generator: /Squarespace/i },
  },
  {
    name: "Webflow",
    category: "CMS",
    website: "https://webflow.com",
    html: [/webflow\.com/i, /class="w-/i],
    meta: { generator: /Webflow/i },
  },
  {
    name: "Drupal",
    category: "CMS",
    website: "https://drupal.org",
    html: [/Drupal\.settings/i, /sites\/default\/files/i],
    headers: { "x-drupal-cache": /.+/, "x-generator": /Drupal/i },
    meta: { generator: /Drupal/i },
  },
  {
    name: "Joomla",
    category: "CMS",
    website: "https://joomla.org",
    html: [/\/media\/jui\//i, /\/components\/com_/i],
    meta: { generator: /Joomla/i },
  },
  {
    name: "Ghost",
    category: "CMS",
    website: "https://ghost.org",
    html: [/ghost-/i],
    meta: { generator: /Ghost/i },
  },
  {
    name: "HubSpot",
    category: "CMS",
    website: "https://hubspot.com",
    html: [/hs-scripts\.com/i, /hubspot\.com/i, /hbspt\./i],
    meta: { generator: /HubSpot/i },
  },

  // ---------- JS Frameworks ----------
  {
    name: "React",
    category: "JavaScript Framework",
    website: "https://reactjs.org",
    html: [/data-reactroot/i, /data-reactid/i, /__NEXT_DATA__/i, /react\.production/i],
    scripts: [/react(?:\.production|\.development)?\.min\.js/i],
  },
  {
    name: "Next.js",
    category: "JavaScript Framework",
    website: "https://nextjs.org",
    html: [/__NEXT_DATA__/i, /_next\/static/i],
    headers: { "x-powered-by": /Next\.js/i },
  },
  {
    name: "Vue.js",
    category: "JavaScript Framework",
    website: "https://vuejs.org",
    html: [/data-v-[a-f0-9]/i, /Vue\.config/i, /__vue__/i],
    scripts: [/vue(?:\.min)?\.js/i],
  },
  {
    name: "Nuxt.js",
    category: "JavaScript Framework",
    website: "https://nuxtjs.org",
    html: [/__NUXT__/i, /_nuxt\//i],
  },
  {
    name: "Angular",
    category: "JavaScript Framework",
    website: "https://angular.io",
    html: [/ng-version/i, /ng-app/i, /angular\.min\.js/i],
    scripts: [/angular(?:\.min)?\.js/i],
  },
  {
    name: "Svelte",
    category: "JavaScript Framework",
    website: "https://svelte.dev",
    html: [/svelte-[a-z0-9]/i, /__svelte/i],
  },
  {
    name: "jQuery",
    category: "JavaScript Library",
    website: "https://jquery.com",
    scripts: [/jquery[.-]?\d?(?:\.min)?\.js/i],
    html: [/jquery/i],
  },
  {
    name: "Bootstrap",
    category: "CSS Framework",
    website: "https://getbootstrap.com",
    html: [/bootstrap(?:\.min)?\.css/i, /class="[^"]*\b(?:container|row|col-)/i],
    scripts: [/bootstrap(?:\.min)?\.js/i],
  },
  {
    name: "Tailwind CSS",
    category: "CSS Framework",
    website: "https://tailwindcss.com",
    html: [/class="[^"]*\b(?:flex|grid|text-|bg-|p-|m-|w-|h-)\b/i],
  },

  // ---------- Analytics ----------
  {
    name: "Google Analytics",
    category: "Analytics",
    website: "https://analytics.google.com",
    html: [/google-analytics\.com\/analytics/i, /gtag\(/i, /googletagmanager\.com/i],
    scripts: [/google-analytics\.com/i, /googletagmanager\.com\/gtag/i],
  },
  {
    name: "Google Tag Manager",
    category: "Tag Manager",
    website: "https://tagmanager.google.com",
    html: [/googletagmanager\.com\/gtm\.js/i, /GTM-[A-Z0-9]+/i],
  },
  {
    name: "Facebook Pixel",
    category: "Analytics",
    website: "https://facebook.com/business",
    html: [/fbq\s*\(/i, /connect\.facebook\.net\/.*\/fbevents\.js/i],
  },
  {
    name: "Hotjar",
    category: "Analytics",
    website: "https://hotjar.com",
    html: [/hotjar\.com/i, /hj\(/i],
    scripts: [/static\.hotjar\.com/i],
  },
  {
    name: "Plausible",
    category: "Analytics",
    website: "https://plausible.io",
    scripts: [/plausible\.io\/js/i],
  },

  // ---------- CDN / Hosting ----------
  {
    name: "Cloudflare",
    category: "CDN",
    website: "https://cloudflare.com",
    headers: { server: /cloudflare/i, "cf-ray": /.+/ },
  },
  {
    name: "Vercel",
    category: "PaaS",
    website: "https://vercel.com",
    headers: { server: /Vercel/i, "x-vercel-id": /.+/ },
  },
  {
    name: "Netlify",
    category: "PaaS",
    website: "https://netlify.com",
    headers: { server: /Netlify/i, "x-nf-request-id": /.+/ },
  },
  {
    name: "Amazon CloudFront",
    category: "CDN",
    website: "https://aws.amazon.com/cloudfront",
    headers: { "x-amz-cf-id": /.+/, via: /CloudFront/i },
  },
  {
    name: "Fastly",
    category: "CDN",
    website: "https://fastly.com",
    headers: { "x-served-by": /cache-/i, via: /varnish/i },
  },

  // ---------- Server ----------
  {
    name: "Nginx",
    category: "Web Server",
    website: "https://nginx.org",
    headers: { server: /nginx/i },
  },
  {
    name: "Apache",
    category: "Web Server",
    website: "https://httpd.apache.org",
    headers: { server: /Apache/i },
  },
  {
    name: "LiteSpeed",
    category: "Web Server",
    website: "https://litespeedtech.com",
    headers: { server: /LiteSpeed/i },
  },
  {
    name: "IIS",
    category: "Web Server",
    website: "https://iis.net",
    headers: { server: /Microsoft-IIS/i },
  },

  // ---------- E-commerce ----------
  {
    name: "WooCommerce",
    category: "E-commerce",
    website: "https://woocommerce.com",
    html: [/woocommerce/i, /wc-/i],
    meta: { generator: /WooCommerce/i },
  },
  {
    name: "Magento",
    category: "E-commerce",
    website: "https://magento.com",
    html: [/Mage\.Cookies/i, /\/skin\/frontend/i],
    headers: { "x-magento-vary": /.+/ },
  },
  {
    name: "BigCommerce",
    category: "E-commerce",
    website: "https://bigcommerce.com",
    html: [/bigcommerce\.com/i],
    headers: { "x-bc-rendered-by": /.+/ },
  },

  // ---------- Marketing / CRM ----------
  {
    name: "Mailchimp",
    category: "Marketing",
    website: "https://mailchimp.com",
    html: [/list-manage\.com/i, /mc\.us\d+\.list-manage/i],
  },
  {
    name: "Intercom",
    category: "Customer Support",
    website: "https://intercom.io",
    html: [/intercomSettings/i, /widget\.intercom\.io/i],
  },
  {
    name: "Crisp",
    category: "Customer Support",
    website: "https://crisp.chat",
    html: [/client\.crisp\.chat/i, /\$crisp/i],
  },
  {
    name: "Drift",
    category: "Customer Support",
    website: "https://drift.com",
    html: [/js\.driftt\.com/i, /drift\.com/i],
  },
  {
    name: "Zendesk",
    category: "Customer Support",
    website: "https://zendesk.com",
    html: [/static\.zdassets\.com/i, /zendesk/i],
  },

  // ---------- Security / Performance ----------
  {
    name: "reCAPTCHA",
    category: "Security",
    website: "https://www.google.com/recaptcha",
    html: [/recaptcha/i, /google\.com\/recaptcha/i],
    scripts: [/google\.com\/recaptcha/i],
  },
  {
    name: "Cloudflare Turnstile",
    category: "Security",
    website: "https://cloudflare.com",
    html: [/challenges\.cloudflare\.com\/turnstile/i],
  },
];

/**
 * Match raw HTML + response headers against a Wappalyzer-style fingerprint
 * database. Returns all detected technologies.
 */
export function matchTechFingerprints(
  rawHtml: string,
  headers: Record<string, string>
): TechFingerprintResult {
  const detected: DetectedTech[] = [];
  const seen = new Set<string>();

  // Extract all <script src="..."> URLs for script matching
  const scriptSrcs: string[] = [];
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(rawHtml)) !== null) {
    scriptSrcs.push(match[1]);
  }

  // Extract <meta> tags for meta matching
  const metas: Record<string, string> = {};
  const metaRegex =
    /<meta\s+(?:name|property)=["']([^"']+)["']\s+content=["']([^"']+)["']/gi;
  while ((match = metaRegex.exec(rawHtml)) !== null) {
    metas[match[1].toLowerCase()] = match[2];
  }
  // Also catch reversed attribute order
  const metaRegex2 =
    /<meta\s+content=["']([^"']+)["']\s+(?:name|property)=["']([^"']+)["']/gi;
  while ((match = metaRegex2.exec(rawHtml)) !== null) {
    metas[match[2].toLowerCase()] = match[1];
  }

  for (const fp of FINGERPRINTS) {
    if (seen.has(fp.name)) continue;
    let matched = false;

    // Check HTML patterns
    if (fp.html) {
      for (const pattern of fp.html) {
        if (pattern.test(rawHtml)) {
          matched = true;
          break;
        }
      }
    }

    // Check headers
    if (!matched && fp.headers) {
      for (const [headerKey, pattern] of Object.entries(fp.headers)) {
        const headerVal = headers[headerKey];
        if (headerVal && pattern.test(headerVal)) {
          matched = true;
          break;
        }
      }
    }

    // Check meta tags
    if (!matched && fp.meta) {
      for (const [metaKey, pattern] of Object.entries(fp.meta)) {
        const metaVal = metas[metaKey];
        if (metaVal && pattern.test(metaVal)) {
          matched = true;
          break;
        }
      }
    }

    // Check script sources
    if (!matched && fp.scripts) {
      for (const pattern of fp.scripts) {
        for (const src of scriptSrcs) {
          if (pattern.test(src)) {
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }

    if (matched) {
      seen.add(fp.name);
      detected.push({
        name: fp.name,
        category: fp.category,
        website: fp.website,
      });
    }
  }

  return { detectedTech: detected };
}
