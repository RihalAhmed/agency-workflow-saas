import dns from "node:dns/promises";
import type { DnsResult } from "../types";

/**
 * DNS lookups: NS records, TXT records (SPF/DMARC), and A records.
 */
export async function runDnsLookups(domain: string): Promise<DnsResult> {
  // Strip any www. prefix for root domain lookups
  const rootDomain = domain.replace(/^www\./i, "");

  const safeResolve = async <T>(
    fn: () => Promise<T>,
    fallback: T
  ): Promise<T> => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  };

  const [nameservers, txtRecords, dmarcRecords, ipAddresses] =
    await Promise.all([
      safeResolve(() => dns.resolveNs(rootDomain), []),
      safeResolve(() => dns.resolveTxt(rootDomain), []),
      safeResolve(() => dns.resolveTxt(`_dmarc.${rootDomain}`), []),
      safeResolve(() => dns.resolve4(rootDomain), []),
    ]);

  // Find SPF record from TXT records
  const spfRecord =
    txtRecords
      .flat()
      .find((txt) => txt.toLowerCase().startsWith("v=spf1")) || null;

  // Find DMARC record
  const dmarcRecord =
    dmarcRecords
      .flat()
      .find((txt) => txt.toLowerCase().startsWith("v=dmarc1")) || null;

  return {
    nameservers,
    txtRecords,
    spfRecord,
    dmarcRecord,
    ipAddresses,
  };
}
