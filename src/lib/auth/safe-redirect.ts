export function getSafeRedirect(nextUrl?: string | null, fallback = "/audit") {
  if (!nextUrl) return fallback;
  
  // Must start with a single slash, not double slash (//evil.com) or scheme (https://)
  // Also block backslash escapes (/\evil.com)
  if (nextUrl.startsWith("/") && !nextUrl.startsWith("//") && !nextUrl.startsWith("/\\")) {
    return nextUrl;
  }
  
  return fallback;
}
