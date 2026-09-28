import React from "react";
import { ChevronRight } from "lucide-react";

interface Recommendation {
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low" | string;
}

const CATEGORY_META: Record<
  string,
  { label: string; color: string; gradient: string }
> = {
  onPageSeo: {
    label: "On-Page SEO",
    color: "#3b82f6",
    gradient: "from-blue-500 to-blue-600",
  },
  performance: {
    label: "Performance",
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-600",
  },
  usability: {
    label: "Usability",
    color: "#06b6d4",
    gradient: "from-cyan-500 to-teal-600",
  },
  social: {
    label: "Social",
    color: "#ec4899",
    gradient: "from-pink-500 to-rose-600",
  },
  localSeo: {
    label: "Local SEO",
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-600",
  },
  technology: {
    label: "Technology",
    color: "#10b981",
    gradient: "from-emerald-500 to-green-600",
  },
  geo: {
    label: "GEO",
    color: "#6366f1",
    gradient: "from-indigo-500 to-blue-600",
  },
};

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: "bg-red-500/10 text-red-400 border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors[priority] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}
    >
      {colors[priority] ? priority : "Unrated"}
    </span>
  );
}

export function RecommendationsList({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-white">Recommendations</h3>
        <span className="text-[12px] text-slate-500 font-medium">
          {recommendations.length} recommendations
        </span>
      </div>

      {/* Placeholder Filter */}
      <div
        className="flex gap-2 mb-4 opacity-50 cursor-not-allowed"
        aria-disabled="true"
        data-status="placeholder"
      >
        <button
          disabled
          className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/[0.06] text-slate-400 border border-white/[0.1] cursor-not-allowed"
        >
          High
        </button>
        <button
          disabled
          className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/[0.06] text-slate-400 border border-white/[0.1] cursor-not-allowed"
        >
          Medium
        </button>
        <button
          disabled
          className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/[0.06] text-slate-400 border border-white/[0.1] cursor-not-allowed"
        >
          Low
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="bg-[#111630] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] hover:bg-[#131838] transition-all group flex items-start justify-between gap-4"
          >
            <div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mb-2"
                style={{
                  backgroundColor: `${CATEGORY_META[rec.category]?.color || "#666"}15`,
                  color: CATEGORY_META[rec.category]?.color || "#999",
                }}
              >
                {CATEGORY_META[rec.category]?.label || rec.category}
              </span>
              <p className="text-[13px] text-slate-300 font-medium leading-snug">
                {rec.title}
              </p>
              <div className="flex items-center gap-1 mt-3 text-[11px] text-slate-500 group-hover:text-blue-400 transition-colors">
                <span>View details</span>
                <ChevronRight size={12} />
              </div>
            </div>
            <div className="shrink-0">
              <PriorityBadge priority={rec.priority} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
