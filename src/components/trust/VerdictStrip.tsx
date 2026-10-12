"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle, Flame } from "lucide-react";
import type { ScoreBand, TrustAuditRow } from "@/lib/trust/types";
import { getScoreBand } from "@/lib/trust/score";

interface VerdictStripProps {
  trustAudit: TrustAuditRow;
}

export function VerdictStrip({ trustAudit }: VerdictStripProps) {
  const { overall_score, sections_present, scores, signals } = trustAudit;
  const band: ScoreBand = getScoreBand(Math.round(overall_score / 10));

  // Find weakest score row for targeted pitch
  const sortedScores = [...scores].sort((a, b) => a.score - b.score);
  const weakestRow = sortedScores[0];

  const getBadgeStyle = () => {
    switch (band) {
      case "danger":
        return {
          bg: "bg-red-500/10 text-red-500 border-red-500/30",
          text: "Critical Gaps",
          icon: <XCircle size={16} className="text-red-500" />,
        };
      case "warning":
        return {
          bg: "bg-amber-500/10 text-amber-500 border-amber-500/30",
          text: "Needs Work",
          icon: <AlertTriangle size={16} className="text-amber-500" />,
        };
      case "ok":
        return {
          bg: "bg-blue-500/10 text-blue-500 border-blue-500/30",
          text: "Solid Foundation",
          icon: <ShieldCheck size={16} className="text-blue-500" />,
        };
      case "strong":
        return {
          bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
          text: "Strong Trust",
          icon: <CheckCircle size={16} className="text-emerald-500" />,
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
      {/* 1. Overall Trust Score Card */}
      <div className="flex flex-col justify-between p-4 bg-white dark:bg-[#12131A] rounded-[12px] border border-gray-200/60 dark:border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Overall Trust Score
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-semibold border ${badge.bg}`}
          >
            {badge.icon}
            {badge.text}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-[36px] font-extrabold tracking-tight text-gray-900 dark:text-white leading-none">
            {overall_score}
          </span>
          <span className="text-[14px] font-semibold text-gray-400">/ 100</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden mt-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overall_score >= 80
                ? "bg-emerald-500"
                : overall_score >= 50
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.max(5, overall_score)}%` }}
          />
        </div>
      </div>

      {/* 2. Core Sections Present Card */}
      <div className="flex flex-col justify-between p-4 bg-white dark:bg-[#12131A] rounded-[12px] border border-gray-200/60 dark:border-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Structural Coverage
          </span>
          <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">
            {sections_present} of 4 Regions
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {(["header", "hero", "reviews", "about"] as const).map((reg) => {
            const isFound = signals?.regions?.[reg]?.found;
            return (
              <div
                key={reg}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-[6px] text-center border ${
                  isFound
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/5 border-dashed border-red-500/30 text-red-500 dark:text-red-400"
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{reg}</span>
                <span className="text-[11px] font-medium mt-0.5">
                  {isFound ? "✓" : "Missing"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
          {sections_present === 4
            ? "All 4 primary conversion sections present on page."
            : `${4 - sections_present} essential trust region(s) absent or detached.`}
        </p>
      </div>

      {/* 3. Pitch Verdict Card */}
      <div className="flex flex-col justify-between p-4 bg-white dark:bg-[#12131A] rounded-[12px] border border-gray-200/60 dark:border-white/[0.08]">
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <Flame size={14} className="text-amber-500" />
          <span className="text-[12px] font-semibold uppercase tracking-wider">
            Primary Pitch Angle
          </span>
        </div>
        <div className="mt-2">
          <p className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 leading-snug">
            {weakestRow ? weakestRow.label : "Trust Blueprint"}
          </p>
          <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {weakestRow?.fix}
          </p>
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-white/5">
          <span>Priority Fix</span>
          <span className="font-semibold text-red-500">
            {weakestRow ? `${weakestRow.score}/10 Score` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
