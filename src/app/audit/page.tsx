"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  FileText,
  ChevronDown,
} from "lucide-react";

/**
 * Audit Dashboard — SEO Audit segment entry page.
 *
 * Per spec "Frontend Structure Guide":
 * - Top bar: segment tabs (Traffic | SEO Audit | Trust | Conversion) + "My SOP/Blueprint" button
 * - Input row: "Existing Lead" dropdown + "Website URL" text field
 */

const SEGMENT_TABS = ["Traffic", "SEO Audit", "Trust", "Conversion"] as const;

export default function AuditDashboard() {
  const [url, setUrl] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("SEO Audit");
  const [leadType, setLeadType] = useState("New Lead");

  const router = useRouter();

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          targetKeyword: targetKeyword || undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/audit/${data.slug}`);
      } else {
        alert("Error: " + data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start audit.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* ——— Top Bar ——— */}
      <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c1022]/80 backdrop-blur-sm px-6 h-14 shrink-0">
        {/* Segment Tabs — left aligned */}
        <div className="flex items-center gap-1">
          {SEGMENT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[13px] font-medium rounded-md transition-all ${
                activeTab === tab
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/15"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* My SOP/Blueprint — right aligned */}
        <button className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-slate-200 rounded-lg border border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all">
          <FileText size={15} />
          My SOP/Blueprint
        </button>
      </header>

      {/* ——— Main Panel ——— */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Input Row */}
          <form onSubmit={handleRunAudit} className="mb-10">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Existing Lead Dropdown */}
              <div className="relative sm:w-52 shrink-0">
                <select
                  value={leadType}
                  onChange={(e) => setLeadType(e.target.value)}
                  className="w-full appearance-none bg-[#111630] border border-white/[0.08] rounded-xl pl-4 pr-10 py-3.5 text-[13px] text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all cursor-pointer"
                >
                  <option>New Lead</option>
                  <option>Existing Lead</option>
                  <option>Referral</option>
                  <option>Cold Outreach</option>
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>

              {/* Website URL */}
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="https://prospect-website.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full bg-[#111630] border border-white/[0.08] rounded-xl py-3.5 pl-12 pr-36 text-[14px] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium text-[13px] rounded-lg px-6 flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    "Run Audit"
                  )}
                </button>
              </div>
            </div>

            {/* Optional keyword input */}
            <div className="mt-3 flex items-center gap-3">
              <label className="text-[12px] text-slate-500 shrink-0">
                Target keyword (optional):
              </label>
              <input
                type="text"
                placeholder="e.g. pest control melbourne"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                className="flex-1 max-w-sm bg-[#111630] border border-white/[0.06] rounded-lg py-2 px-3 text-[12px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </form>

          {/* Empty state when no audit results to show */}
          <div className="bg-[#111630]/50 border border-white/[0.06] border-dashed rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111630] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
              <Search className="text-slate-600" size={28} />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              Run your first SEO audit
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Enter a prospect&apos;s website URL above to generate a comprehensive
              7-module SEO analysis with actionable recommendations.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
