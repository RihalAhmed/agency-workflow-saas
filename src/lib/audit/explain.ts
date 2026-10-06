import { HOW_TO } from "./modules/onpage.config";

export function explain(check: any): string {
  const ev = check.data?.evidence || check.evidence;
  if (!ev) {
    return "";
  }

  // Handle new Evidence structure (rule, rows, items, gap)
  if (ev.rule || (ev.rows && ev.rows.length > 0)) {
    const lines: string[] = [];
    
    // What we found (rows + items)
    lines.push("**What we found:**");
    if (ev.rows && ev.rows.length > 0) {
      ev.rows.forEach((r: any) => {
        lines.push(`- ${r.label}: ${r.value}`);
      });
    }

    if (ev.items && ev.items.length > 0) {
      // Group items
      const groups: Record<string, any[]> = {};
      const noGroup: any[] = [];
      ev.items.forEach((item: any) => {
        if (item.group) {
          if (!groups[item.group]) groups[item.group] = [];
          groups[item.group].push(item);
        } else {
          noGroup.push(item);
        }
      });

      const renderList = (list: any[]) => {
        const toShow = list.slice(0, 10);
        toShow.forEach((item) => {
          let str = `- ${item.label}`;
          if (item.detail) str += ` (${item.detail})`;
          lines.push(str);
        });
        if (list.length > 10) {
          lines.push(`- +${list.length - 10} more`);
        }
      };

      if (noGroup.length > 0) {
        lines.push("");
        renderList(noGroup);
      }
      for (const [groupName, groupItems] of Object.entries(groups)) {
        lines.push("");
        lines.push(`**${groupName}:**`);
        renderList(groupItems);
      }
    }

    lines.push(""); // spacing

    if (check.status === "skipped" || check.status === "info") {
       lines.push(`**Could not be measured:** ${check.data?.reason || "Not measured"}`);
       return lines.join("\n");
    }

    if (check.status === "pass" || check.status === "good") {
      lines.push("**Why this is fine:**");
      lines.push(`${check.title} meets the rule: ${ev.rule}.`);
      return lines.join("\n");
    }

    // Improve / Critical
    if (ev.gap) {
      lines.push("**Gap:**");
      lines.push(ev.gap);
      lines.push("");
    }

    const howTo = HOW_TO[check.checkKey];
    if (howTo) {
      lines.push("**Why it matters:**");
      lines.push(howTo.why);
      lines.push("");

      lines.push("**How to fix:**");
      const steps = check.data?.isWordPress && howTo.wordpress ? howTo.wordpress : howTo.steps;
      steps.forEach((step: string, idx: number) => {
        lines.push(`${idx + 1}. ${step}`);
      });
    }

    return lines.join("\n");
  }

  // --- Fallback for old modules (geo, usability, etc) ---
  const lines: string[] = [];
  const add = (label: string, text: string) => {
    if (text !== undefined && text !== null && text !== "") {
      lines.push(`**${label}:** ${text}`);
    }
  };

  const valStr = ev.value !== undefined && ev.value !== null ? String(ev.value) : "";
  const unitStr = ev.unit ? ` ${ev.unit}` : "";
  add("Your Result", valStr ? `${valStr}${unitStr} (Status: ${check.status})` : `Status: ${check.status}`);

  let gap = "";
  let fix = "";
  if (ev.target !== undefined && ev.target !== null && typeof ev.target === "object") {
    const min = ev.target.min;
    const max = ev.target.max;
    if (typeof ev.value === "number") {
      if (min !== undefined && ev.value < min) {
        gap = `${min - ev.value}${unitStr} below the ${min} minimum`;
        fix = `Increase by at least ${min - ev.value}${unitStr} to reach ${min}`;
      } else if (max !== undefined && ev.value > max) {
        gap = `${ev.value - max}${unitStr} above the ${max} maximum`;
        fix = `Decrease by at least ${ev.value - max}${unitStr} to reach ${max}`;
      } else if (min !== undefined || max !== undefined) {
        gap = `Within recommended range${min !== undefined ? ` (${min}` : ""}${max !== undefined ? ` - ${max})` : ")"}`;
        fix = "No action needed (value is within target range).";
      }
    }
  } else if (ev.target !== undefined && ev.target !== null) {
    if (ev.value !== ev.target) {
       gap = `Expected ${ev.target}, but got ${ev.value}`;
       if (typeof ev.target === "boolean") {
         fix = `Change value to ${ev.target ? "true (enable)" : "false (disable)"}`;
       } else {
         fix = `Match target value of ${ev.target}`;
       }
    } else {
       gap = `Matches target value of ${ev.target}`;
       fix = "No action needed.";
    }
  }

  add("Gap/Details", gap);

  if (ev.found && ev.found.length > 0) add("Found Items", ev.found.join(", "));
  if (ev.missing && ev.missing.length > 0) {
    add("Missing Items", ev.missing.join(", "));
    if (!fix) fix = `Add missing items: ${ev.missing.join(", ")}`;
  }
  add("How to fix", fix);
  add("Data source", ev.source);

  return lines.join("\n\n");
}

export const fallbackTips: Record<string, string> = {
  "html_lang": "Ensure the <html> tag has a valid lang attribute to help search engines and screen readers.",
  "ssl_enabled": "Obtain and install an SSL certificate to secure connections to your site.",
  "https_redirect": "Configure your server to automatically redirect all HTTP traffic to HTTPS.",
  "robots_txt": "Create a robots.txt file at the root of your domain to guide search engine crawlers.",
  "noindex_meta": "Remove the noindex meta tag if you want this page to appear in search results.",
  "noindex_header": "Remove the X-Robots-Tag noindex header if you want this page to appear in search results.",
  "xml_sitemap": "Generate an XML sitemap and submit it to search engines like Google Search Console.",
  "canonical_tag": "Add a canonical tag to prevent duplicate content issues.",
  "dmarc": "**What it is:** A DMARC record protects your domain from unauthorized use, preventing spoofing and phishing emails from being sent on your behalf.\n\n**How to fix:** Add a TXT record to your DNS settings for `_dmarc.yourdomain.com` with a value like `v=DMARC1; p=none; rua=mailto:admin@yourdomain.com`.",
  "spf": "**What it is:** An SPF record helps mail servers verify that incoming emails from your domain were sent from authorized IP addresses.\n\n**How to fix:** Add a TXT record to your DNS settings (e.g., `v=spf1 include:_spf.google.com ~all`) authorizing your email providers.",
  "server_ip": "**What it is:** The IP address your domain resolves to. Keeping track of this is useful for DNS migrations and server diagnostics.\n\n**How to fix:** No action needed unless this is pointing to an incorrect server.",
  "dns_servers": "**What it is:** Nameservers are the authoritative servers that store your domain's DNS records and direct traffic to the right place.\n\n**How to fix:** Typically provided by your domain registrar or hosting provider (e.g., Cloudflare, AWS Route 53).",
  "web_server": "**What it is:** The software running your website on the server (e.g., Apache, Nginx, or Cloudflare).\n\n**How to fix:** While hiding your server signature (e.g., hiding exact versions like `nginx/1.18.0`) is a good security practice, the server type is generally public.",
  "charset": "**What it is:** Character encoding tells the browser how to interpret the text characters on your page.\n\n**How to fix:** Always include `<meta charset=\"utf-8\">` in the `<head>` of your HTML document.",
  "mobile_viewport": "Add <meta name='viewport' content='width=device-width, initial-scale=1'> to your <head>.",
  "favicon": "Add a favicon link in the <head> to display an icon in browser tabs.",
  "llms_txt": "Add an llms.txt file to instruct AI models and crawlers on how to use your site's content.",

  // Performance Checks
  "image_optimization": "**What it is:** Images that are too large or not in modern formats slow down your page.\n\n**How to fix:** Compress your images using tools like TinyPNG, serve them in modern formats like WebP or AVIF, and use responsive image sizes (srcset).",
  "browser_caching": "**What it is:** Browser caching stores static files locally in the user's browser so they don't have to be downloaded again on subsequent visits.\n\n**How to fix:** Configure your web server (Apache, Nginx, etc.) to set long cache-control headers (e.g., max-age=31536000) for static assets like images, CSS, and JS.",
  "js_errors": "**What it is:** Uncaught JavaScript errors can break interactivity and negatively impact user experience.\n\n**How to fix:** Open your browser's developer console to identify the exact scripts causing errors, and debug the code to resolve the exceptions.",
  "http2": "**What it is:** HTTP/2 is a major revision of the HTTP network protocol that allows multiplexing multiple requests over a single connection.\n\n**How to fix:** Ensure your hosting provider supports HTTP/2 and that you have an active SSL certificate, as HTTP/2 requires HTTPS.",
  "minification": "**What it is:** Unminified CSS and JavaScript files contain unnecessary whitespace and comments, increasing file size.\n\n**How to fix:** Use a build tool or plugin (like Terser, CSSNano, or WP Rocket) to minify your HTML, CSS, and JS files before deploying them to production.",
  "deprecated_html": "**What it is:** Deprecated HTML tags (like <font>, <center>, or <marquee>) are obsolete and may not render correctly in modern browsers.\n\n**How to fix:** Replace deprecated tags with modern semantic HTML and use CSS for styling instead.",
  "inline_styles": "**What it is:** Extensive use of inline CSS (`style=\"...\"`) prevents the browser from caching the styles efficiently and makes maintenance harder.\n\n**How to fix:** Move your inline styles into an external CSS stylesheet class and link it to your HTML documents.",
  "text_compression": "**What it is:** Uncompressed text files (HTML, CSS, JS) increase the amount of data transferred over the network.\n\n**How to fix:** Enable Gzip or Brotli compression on your web server (via .htaccess for Apache, or nginx.conf for Nginx).",
  "resource_counts": "**What it is:** Making too many HTTP requests for external scripts, stylesheets, or fonts can drastically slow down the page.\n\n**How to fix:** Combine files where possible, lazy-load non-critical resources, and remove unused plugins or scripts.",

  // Usability Checks
  "flash_usage": "**What it is:** Adobe Flash is deprecated, unsupported by modern browsers, and poses major security risks.\n\n**How to fix:** Remove all `<object>` and `<embed>` tags loading `.swf` files, and replace them with modern HTML5 `<video>` or `<canvas>` elements.",
  "render_blocking": "**What it is:** Render-blocking resources (like synchronous CSS or JS in the <head>) delay the browser from painting the page.\n\n**How to fix:** Move non-critical JavaScript to the bottom of the `<body>`, use the `defer` or `async` attributes on script tags, and inline critical CSS.",
  "device_rendering": "**What it is:** Your website needs to look good and be usable on desktop, tablet, and mobile viewports.\n\n**How to fix:** Use responsive design principles: CSS media queries, relative units (%, vh, vw), and ensure touch targets are appropriately sized.",

  // Local SEO Checks
  "address_phone": "**What it is:** Search engines scan your site for a valid Name, Address, and Phone number (NAP) to rank your business locally.\n\n**How to fix:** Add your complete, formatted address and a click-to-call phone number visibly in your website's footer and contact page.",
  "local_business_schema": "**What it is:** LocalBusiness Schema is structured JSON-LD data that explicitly tells search engines about your business type, address, hours, and coordinates.\n\n**How to fix:** Generate LocalBusiness JSON-LD schema using a free schema generator and inject it into the `<head>` of your website.",
  "map_embeds": "**What it is:** Embedding a Google Map on your contact page increases local relevance and helps users find physical directions.\n\n**How to fix:** Search for your business on Google Maps, click 'Share', select 'Embed a map', and copy the `<iframe>` code into your contact page HTML.",
  "domain_age": "**What it is:** Older domains inherently carry more trust and authority with search engines compared to brand new domains.\n\n**How to fix:** You cannot instantly fake domain age. If you are starting a new business, consider purchasing an aged domain relevant to your niche instead of a completely new one.",
};
