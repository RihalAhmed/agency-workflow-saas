import { runOnPageSeoChecks } from "./src/lib/audit/modules/onPageSeo";
import * as fs from "fs";
import * as cheerio from "cheerio";

async function main() {
  const url = "https://saltydogpestcontrol.com/";
  console.log(`Fetching ${url}...`);
  
  const res = await fetch(url);
  const html = await res.text();
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => { headers[k] = v; });
  
  const rawHtmlResult = {
    statusCode: res.status,
    headers,
    rawHtml: html,
    responseUrl: res.url
  };
  
  const auxResult = {
    robotsTxt: { status: 200, body: "" },
    sitemap: { status: 404, url: "", body: null },
    llmsTxt: { status: 404, body: null }
  };
  
  const results = runOnPageSeoChecks(rawHtmlResult, auxResult, undefined, null);
  
  fs.writeFileSync("audit_output.json", JSON.stringify(results, null, 2));
  console.log("Wrote audit_output.json");
}

main().catch(console.error);
