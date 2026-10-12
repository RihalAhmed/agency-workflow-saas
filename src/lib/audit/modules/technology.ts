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
    evidence: {
      source: "Fingerprint matching",
      rule: "Detect underlying technologies used to build the website",
      gap: techs.length === 0 ? "No technologies could be identified" : undefined,
      rows: [
        { label: "Total Technologies Detected", value: techs.length }
      ],
      items: techs.map(t => ({ label: t.name, group: t.category, detail: t.version || "" }))
    },
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
    evidence: {
      source: "DNS Resolution",
      rule: "Resolve the domain to its IP addresses",
      gap: dns.ipAddresses.length === 0 ? "No IP addresses found" : undefined,
      rows: dns.ipAddresses.map((ip, i) => ({ label: `IP Address ${i + 1}`, value: ip }))
    }
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
    evidence: {
      source: "DNS Resolution",
      rule: "Identify authoritative nameservers",
      gap: dns.nameservers.length === 0 ? "No nameservers found" : undefined,
      rows: dns.nameservers.map((ns, i) => ({ label: `Nameserver ${i + 1}`, value: ns }))
    },
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
    evidence: {
      source: "HTTP Headers",
      rule: "Check the Server HTTP header",
      gap: !serverHeader ? "No server header found" : undefined,
      rows: [
        { label: "Server Header", value: serverHeader || "(none)" }
      ]
    }
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
    evidence: {
      source: "HTTP Headers & HTML Meta",
      rule: "Verify character encoding is specified",
      gap: !charset ? "No charset specified in headers or meta tags" : undefined,
      rows: [
        { label: "Content-Type Header", value: charsetFromHeader || "(none)" },
        { label: "Meta Charset", value: charsetFromMeta || "(none)" },
        { label: "Resolved Charset", value: charset || "(none)" }
      ]
    }
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
    evidence: {
      source: "DNS TXT Records",
      rule: "Verify DMARC record exists for email security",
      gap: !dns.dmarcRecord ? "Missing DMARC record" : undefined,
      rows: [
        { label: "DMARC Record", value: dns.dmarcRecord || "(none)" }
      ]
    }
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
    evidence: {
      source: "DNS TXT Records",
      rule: "Verify SPF record exists for email deliverability",
      gap: !dns.spfRecord ? "Missing SPF record" : undefined,
      rows: [
        { label: "SPF Record", value: dns.spfRecord || "(none)" }
      ]
    }
  });

  return results;
}
