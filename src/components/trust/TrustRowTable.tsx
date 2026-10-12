"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check, AlertCircle, Wrench, ExternalLink } from "lucide-react";
import type { RowKey, TrustRow } from "@/lib/trust/types";

export interface PinnedPieceSummary {
  id: string;
  title: string;
  source_url: string | null;
  niche: string;
  signedScreenshotUrl?: string | null;
}

interface TrustRowTableProps {
  rows: TrustRow[];
  pins?: Record<string, PinnedPieceSummary>;
  activeSlotHighlight?: string | null;
  onOverrideScore?: (rowKey: RowKey, newScore: number) => void;
  onOpenPortfolioDrawer?: (rowKey: RowKey) => void;
}

export function TrustRowTable({
  rows,
  pins,
  activeSlotHighlight,
  onOverrideScore,
  onOpenPortfolioDrawer,
}: TrustRowTableProps) {
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({
    // Expand the first row with lowest score by default
    [rows.reduce((lowest, curr) => (curr.score < lowest.score ? curr : lowest), rows[0])?.key || ""]: true,
  });

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col w-full bg-white dark:bg-[#12131A] rounded-[12px] border border-gray-200/60 dark:border-white/[0.08] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
        <span className="text-[13px] font-bold text-gray-900 dark:text-white">
          6-Point Conversion & Trust Audit
        </span>
        <span className="text-[11px] text-gray-500 dark:text-gray-400">
          Scored 0–10 with Plain-English Pitch Fixes
        </span>
      </div>

      {/* Row list */}
      <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
        {rows.map((row) => {
          const isExpanded = Boolean(expandedKeys[row.key]);
          const isLowScore = row.score <= 4;
          const isMidScore = row.score > 4 && row.score <= 7;
          const isHighScore = row.score > 7;

          const barColor = isHighScore
            ? "bg-emerald-500"
            : isMidScore
            ? "bg-amber-500"
            : "bg-red-500";

          const badgeStyle = isHighScore
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : isMidScore
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";

          return (
            <div
              key={row.key}
              id={`row-${row.key}`}
              className={`flex flex-col transition-all ${
                isExpanded ? "bg-gray-50/40 dark:bg-white/[0.02]" : "hover:bg-gray-50/30 dark:hover:bg-white/[0.01]"
              }`}
            >
              {/* Collapsed Row Header */}
              <div
                onClick={() => toggleExpand(row.key)}
                className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none gap-4"
              >
                {/* Title + Label */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-gray-900 dark:text-gray-100">
                      {row.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] border ${badgeStyle}`}>
                      {row.state === "found" ? "Strong" : row.state === "partial" ? "Partial" : "Critical Gap"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {row.fix}
                  </p>
                </div>

                {/* Score Bar + Number */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex flex-col items-end gap-1 w-[120px]">
                    <div className="flex justify-between w-full text-[10px] text-gray-400 font-semibold">
                      <span>Score</span>
                      <span>{row.score}/10</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${Math.max(10, row.score * 10)}%` }}
                      />
                    </div>
                  </div>

                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-[12px] font-bold text-gray-700 dark:text-gray-300">
                    {row.score}
                  </span>

                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded Panel */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-5">
                  {/* Left Column: Actionable Fix Pitch */}
                  <div className="flex-1 flex flex-col justify-between p-3.5 rounded-[8px] bg-white dark:bg-[#161822] border border-gray-200/60 dark:border-white/[0.06]">
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1.5">
                        <Wrench size={14} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Dean-Voice Actionable Fix
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                        "{row.fix}"
                      </p>
                    </div>

                    {/* Evidence summary */}
                    {row.evidence && row.evidence.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Detected Signals
                        </span>
                        <ul className="mt-1 space-y-1">
                          {row.evidence.map((ev, i) => (
                            <li key={i} className="text-[11px] text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>{ev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions (Score Override & Portfolio Pinning) */}
                  <div className="w-full md:w-[260px] shrink-0 flex flex-col justify-between p-3.5 rounded-[8px] bg-white dark:bg-[#161822] border border-gray-200/60 dark:border-white/[0.06]">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          Portfolio Proof
                        </span>
                        {pins?.[row.key] && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Show prospect how your agency resolved this for a past client.
                      </p>

                      {pins?.[row.key] ? (
                        <div className="mt-2.5 p-2 rounded-[6px] bg-gray-50 dark:bg-white/[0.03] border border-gray-200/70 dark:border-white/10 flex items-center gap-2.5">
                          {pins[row.key].signedScreenshotUrl ? (
                            <img
                              src={pins[row.key].signedScreenshotUrl!}
                              alt={pins[row.key].title}
                              className="w-12 h-10 object-cover object-top rounded border border-gray-200/50 dark:border-white/5 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-10 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                              Proof
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                              {pins[row.key].title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {pins[row.key].source_url && (
                                <a
                                  href={pins[row.key].source_url!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-gray-500 hover:text-blue-600 truncate max-w-[80px]"
                                >
                                  {pins[row.key].source_url}
                                </a>
                              )}
                              <button
                                onClick={() => onOpenPortfolioDrawer?.(row.key)}
                                className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer ml-auto"
                              >
                                Change
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenPortfolioDrawer?.(row.key)}
                          className="mt-3 w-full py-1.5 px-3 rounded-[6px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink size={12} />
                          Pin Portfolio Example
                        </button>
                      )}
                    </div>

                    {/* Manual Score Lock */}
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-medium">Manual override</span>
                      <div className="flex items-center gap-1">
                        {[0, 3, 5, 8, 10].map((val) => (
                          <button
                            key={val}
                            onClick={() => onOverrideScore?.(row.key, val)}
                            className={`w-5 h-5 rounded text-[10px] font-bold transition-all ${
                              row.score === val
                                ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                                : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
