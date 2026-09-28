import React from "react";
import { CheckCard } from "./CheckCard";

interface CheckItem {
  check_key: string;
  label: string;
  category: string;
  score: number;
  value?: any;
  detail?: string;
  data?: any;
}

export function OnPageSeoResults({ scores }: { scores: CheckItem[] }) {
  const getCheck = (key: string) => scores.find((s) => s.check_key === key);

  const getMerged = (keys: string[]) => {
    const found = keys.map(getCheck).filter(Boolean) as CheckItem[];
    if (found.length === 0) return null;
    const score = Math.min(...found.map((c) => c.score)); // fail(0) < warning(1) < pass(2)
    const detail = found.map((c) => c.detail).filter(Boolean).join(" | ");
    return { score, detail, first: found[0] };
  };

  const titleTag = getCheck("title_tag");
  const metaDesc = getCheck("meta_description");
  const serpPreview = getCheck("serp_preview");
  const langHreflang = getMerged(["html_lang", "hreflang"]);

  const h1Usage = getCheck("h1_usage");
  const headingFreq = getCheck("heading_frequency");
  const headingStruct = getCheck("heading_structure");
  const keywordCons = getCheck("keyword_consistency");
  const contentAmount = getCheck("content_amount");

  const imageAlt = getCheck("image_alt");

  const canonicalTag = getCheck("canonical_tag");
  const sslEnabled = getCheck("ssl_enabled");
  const httpsRedirect = getCheck("https_redirect");
  const robotsMerged = getMerged(["robots_txt", "robots_blocking"]);
  const noindexMerged = getMerged(["noindex_meta", "noindex_header"]);
  const xmlSitemap = getCheck("xml_sitemap");

  const analytics = getCheck("analytics");
  const structuredData = getCheck("structured_data");

  return (
    <div className="space-y-8">
      {/* Group 1: Meta & Snippet */}
      <div>
        <h3 className="text-[15px] font-semibold text-white mb-4">1. Meta & Snippet</h3>
        <div className="bg-[#111630] border border-white/[0.06] rounded-2xl p-5">
          {titleTag && (
            <CheckCard
              label="Title Tag"
              score={titleTag.score}
              value={titleTag.value}
              secondaryDetail={titleTag.data?.length !== undefined ? `Length: ${titleTag.data.length}` : null}
              explanation={titleTag.detail}
            />
          )}
          {metaDesc && (
            <CheckCard
              label="Meta Description"
              score={metaDesc.score}
              value={metaDesc.value}
              secondaryDetail={metaDesc.data?.length !== undefined ? `Length: ${metaDesc.data.length}` : null}
              explanation={metaDesc.detail}
            />
          )}
          {serpPreview && (
            <CheckCard
              label="SERP Snippet Preview"
              score={serpPreview.score} // TODO: add info status for neutral icon
              value={serpPreview.data?.title}
              secondaryDetail={serpPreview.data?.url}
              explanation={serpPreview.detail}
            />
          )}
          {langHreflang && (
            <CheckCard
              label="Language / Hreflang"
              score={langHreflang.score}
              value={langHreflang.first?.value}
              secondaryDetail={getCheck("hreflang")?.data?.values?.join(", ")}
              explanation={langHreflang.detail}
            />
          )}
        </div>
      </div>

      {/* Group 2: Structure & Keywords */}
      <div>
        <h3 className="text-[15px] font-semibold text-white mb-4">2. Structure & Keywords</h3>
        <div className="bg-[#111630] border border-white/[0.06] rounded-2xl p-5">
          {h1Usage && (
            <CheckCard
              label="H1 Usage"
              score={h1Usage.score}
              value={h1Usage.value}
              secondaryDetail={h1Usage.data?.text}
              explanation={h1Usage.detail}
            />
          )}
          {headingFreq && (
            <CheckCard
              label="Heading Frequency (H2-H6)"
              score={headingFreq.score} // TODO: add info status for neutral icon
              value={headingFreq.value}
              explanation={headingFreq.detail}
            />
          )}
          {headingStruct && (
            <CheckCard
              label="Heading Structure"
              score={headingStruct.score}
              value={headingStruct.value}
              explanation={headingStruct.detail}
            />
          )}
          {keywordCons && (
            <CheckCard
              label="Keyword Consistency"
              score={keywordCons.score}
              value={keywordCons.value}
              explanation={keywordCons.detail}
            />
          )}
          {contentAmount && (
            <CheckCard
              label="Amount of Content"
              score={contentAmount.score}
              value={contentAmount.value}
              explanation={contentAmount.detail}
            />
          )}
        </div>
      </div>

      {/* Group 3: Images */}
      <div>
        <h3 className="text-[15px] font-semibold text-white mb-4">3. Images</h3>
        <div className="bg-[#111630] border border-white/[0.06] rounded-2xl p-5">
          {imageAlt && (
            <CheckCard
              label="Image Alt Attributes"
              score={imageAlt.score} // TODO: add info status for neutral icon
              value={imageAlt.value}
              explanation={imageAlt.detail}
            />
          )}
        </div>
      </div>

      {/* Group 4: Technical/Crawlability */}
      <div>
        <h3 className="text-[15px] font-semibold text-white mb-4">4. Technical / Crawlability</h3>
        <div className="bg-[#111630] border border-white/[0.06] rounded-2xl p-5">
          {canonicalTag && (
            <CheckCard
              label="Canonical Tag"
              score={canonicalTag.score}
              value={canonicalTag.value}
              explanation={canonicalTag.detail}
            />
          )}
          {sslEnabled && (
            <CheckCard
              label="SSL Enabled"
              score={sslEnabled.score}
              value={sslEnabled.value}
              explanation={sslEnabled.detail}
            />
          )}
          {httpsRedirect && (
            <CheckCard
              label="HTTPS Redirect"
              score={httpsRedirect.score}
              value={httpsRedirect.value}
              explanation={httpsRedirect.detail}
            />
          )}
          {robotsMerged && (
            <CheckCard
              label="Robots.txt & Blocking"
              score={robotsMerged.score}
              value={robotsMerged.first?.value}
              explanation={robotsMerged.detail}
            />
          )}
          {noindexMerged && (
            <CheckCard
              label="Noindex Checks"
              score={noindexMerged.score}
              value={noindexMerged.first?.value}
              explanation={noindexMerged.detail}
            />
          )}
          {xmlSitemap && (
            <CheckCard
              label="XML Sitemap"
              score={xmlSitemap.score}
              value={xmlSitemap.value}
              secondaryDetail={xmlSitemap.data?.url}
              explanation={xmlSitemap.detail}
            />
          )}
        </div>
      </div>

      {/* Group 5: Tracking & Structured Data */}
      <div>
        <h3 className="text-[15px] font-semibold text-white mb-4">5. Tracking & Structured Data</h3>
        <div className="bg-[#111630] border border-white/[0.06] rounded-2xl p-5">
          {analytics && (
            <CheckCard
              label="Analytics Tools"
              score={analytics.score}
              value={analytics.value}
              secondaryDetail={analytics.data?.tools?.join(", ")}
              explanation={analytics.detail}
            />
          )}
          {structuredData && (
            <CheckCard
              label="Schema.org Structured Data"
              score={structuredData.score}
              value={structuredData.value}
              secondaryDetail={structuredData.data?.types?.join(", ")}
              explanation={structuredData.detail}
            />
          )}
        </div>
      </div>
    </div>
  );
}
