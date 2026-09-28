import * as cheerio from "cheerio";
import type {
  CheckResult,
  RawHtmlResult,
  DnsResult,
  TechFingerprintResult,
} from "../types";

/**
 * Module 6 — Technology
 */
export function runTechnologyChecks(
  raw: RawHtmlResult,
  dns: DnsResult,
  techFingerprints: TechFingerprintResult
): CheckResult[] {
  const $ = cheerio.load(raw.rawHtml);
  const results: CheckResult[] = [];

  // -----------------------------------------------------------------------
  // 1. Tech Stack (from fingerprint matcher)
  // -----------------------------------------------------------------------
  const techs = techFingerprints.detectedTech;
  // Group by category
  const grouped: Record<string, string[]> = {};
  for (const t of techs) {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t.name);
  }
  const summary = Object.entries(grouped)
    .map(([cat, names]) => `${cat}: ${names.join(", ")}`)
    .join(" · ");

  results.push({
    key: "tech_stack",
    label: "Technology Stack",
    category: "technology",
    status: "info",
    value: techs.length,
    detail: techs.length > 0 ? summary : "No technologies detected",
    data: { technologies: techs, grouped },
  });

  // -----------------------------------------------------------------------
  // 2. Server IP Address
  // -----------------------------------------------------------------------
  results.push({
    key: "server_ip",
    label: "Server IP Address",
    category: "technology",
    status: "info",
    value: dns.ipAddresses[0] || null,
    detail: dns.ipAddresses.length > 0
      ? dns.ipAddresses.join(", ")
      : "Could not resolve IP",
  });

  // -----------------------------------------------------------------------
  // 3. DNS Servers
  // -----------------------------------------------------------------------
  results.push({
    key: "dns_servers",
    label: "DNS Servers",
    category: "technology",
    status: "info",
    value: dns.nameservers.length,
    detail: dns.nameservers.length > 0
      ? dns.nameservers.join(", ")
      : "Could not resolve nameservers",
    data: { nameservers: dns.nameservers },
  });

  // -----------------------------------------------------------------------
  // 4. Web Server
  // -----------------------------------------------------------------------
  const serverHeader = raw.headers["server"] || "";
  results.push({
    key: "web_server",
    label: "Web Server",
    category: "technology",
    status: "info",
    value: serverHeader || null,
    detail: serverHeader
      ? `Server: ${serverHeader}`
      : "Server header not exposed",
  });

  // -----------------------------------------------------------------------
  // 5. Charset
  // -----------------------------------------------------------------------
  const contentType = raw.headers["content-type"] || "";
  const charsetFromHeader = contentType.match(/charset=([^\s;]+)/i)?.[1] || "";
  const charsetFromMeta =
    $("meta[charset]").attr("charset") ||
    $('meta[http-equiv="Content-Type"]')
      .attr("content")
      ?.match(/charset=([^\s;]+)/i)?.[1] ||
    "";
  const charset = charsetFromHeader || charsetFromMeta || "";

  results.push({
    key: "charset",
    label: "Character Encoding",
    category: "technology",
    status: charset ? "pass" : "warning",
    value: charset || null,
    detail: charset
      ? `Charset: ${charset.toUpperCase()}`
      : "No charset specified",
  });

  // -----------------------------------------------------------------------
  // 6. DMARC Record
  // -----------------------------------------------------------------------
  results.push({
    key: "dmarc",
    label: "DMARC Record",
    category: "technology",
    status: dns.dmarcRecord ? "pass" : "fail",
    value: !!dns.dmarcRecord,
    detail: dns.dmarcRecord
      ? `Found: ${dns.dmarcRecord.substring(0, 100)}`
      : "No DMARC record found — email spoofing risk",
  });

  // -----------------------------------------------------------------------
  // 7. SPF Record
  // -----------------------------------------------------------------------
  results.push({
    key: "spf",
    label: "SPF Record",
    category: "technology",
    status: dns.spfRecord ? "pass" : "fail",
    value: !!dns.spfRecord,
    detail: dns.spfRecord
      ? `Found: ${dns.spfRecord.substring(0, 100)}`
      : "No SPF record found — email deliverability risk",
  });

  return results;
}
