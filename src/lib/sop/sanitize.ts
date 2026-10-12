import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  // If not running in a browser environment, return empty (for safety/SSR)
  if (typeof window === 'undefined') return '';

  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'ul', 'ol', 'li', 'strong', 'em', 'u', 's', 
      'sub', 'sup', 'blockquote', 'table', 'thead', 
      'tbody', 'tr', 'td', 'th', 'img', 'a', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'form', 'input', 'link', 'meta'],
    FORBID_ATTR: ['style'],
    ALLOW_DATA_ATTR: false, // Forbid arbitrary data-* attributes
    USE_PROFILES: { html: true }, // Standard HTML only, no SVG/MathML
  };

  // Run initial DOMPurify
  const purified = DOMPurify.sanitize(html, config);

  // Post-process to enforce target="_blank" on links and validate image sources
  // We use DOMPurify's afterSanitizeAttributes hook for deeper attribute control,
  // but since we want to keep it simple and stateless per call, we can parse it locally.
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = purified as string;

  // Enforce Link Security
  const links = tempDiv.getElementsByTagName('a');
  for (let i = 0; i < links.length; i++) {
    const a = links[i];
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:')) {
      a.removeAttribute('href'); // Strip dangerous protocols like javascript:
    }
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  }

  // Enforce Image Security
  const imgs = tempDiv.getElementsByTagName('img');
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    const src = img.getAttribute('src') || '';
    // Only allow specific data URIs
    if (!src.match(/^data:image\/(png|jpeg|gif);base64,/)) {
      img.removeAttribute('src'); // Remove remote images or svgs
    }
  }

  return tempDiv.innerHTML;
}
