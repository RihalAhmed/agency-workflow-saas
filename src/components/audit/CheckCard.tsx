import React from "react";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

interface CheckCardProps {
  label: string;
  score: number; // 2=pass, 1=warning, 0=fail, -1=info (neutral)
  value?: string | number | null;
  secondaryDetail?: string | null;
  explanation?: string | null;
  isPlaceholder?: boolean;
}

export function CheckCard({
  label,
  score,
  value,
  secondaryDetail,
  explanation,
  isPlaceholder,
}: CheckCardProps) {
  return (
    <div
      className="bg-[#111630] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] hover:bg-[#131838] transition-all flex flex-col gap-3"
      data-status={isPlaceholder ? "placeholder" : undefined}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <p className="text-[14px] text-slate-200 leading-snug">
            <span className="font-bold">{label}</span>
            {value !== undefined && value !== null && (
              <span className="text-slate-300 ml-1">: {value}</span>
            )}
          </p>
          {secondaryDetail && (
            <p className="text-[12px] text-slate-500 mt-0.5">{secondaryDetail}</p>
          )}
        </div>
        <div className="shrink-0 mt-0.5">
          {score === 2 && <CheckCircle size={18} className="text-emerald-400" />}
          {score === 1 && <AlertTriangle size={18} className="text-amber-400" />}
          {score === 0 && <XCircle size={18} className="text-red-500" />}
          {score === -1 && <Info size={18} className="text-blue-400" />}
        </div>
      </div>
      {explanation && (
        <div className="bg-indigo-500/10 rounded-lg p-3 border border-indigo-500/20">
          <p className="text-[13px] text-indigo-200/90 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
