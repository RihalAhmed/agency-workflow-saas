"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  FileText,
  Monitor,
  Tablet,
  Smartphone,
  Play,
  Pause,
  Video,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ArrowUp,
} from "lucide-react";
import { OnPageSeoResults } from "@/components/audit/OnPageSeoResults";
import { RecommendationsList } from "@/components/audit/RecommendationsList";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryScore {
  key: string;
  label: string;
  grade: string;
  numericScore: number;
}

interface Recommendation {
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
}

interface CheckItem {
  check_key: string;
  label: string;
  category: string;
  score: number;
  value?: any;
  detail?: string;
  data?: any;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEGMENT_TABS = ["Traffic", "SEO Audit", "Trust", "Conversion"] as const;

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

const GRADE_COLORS: Record<string, string> = {
  "A+": "#22c55e",
  A: "#22c55e",
  "A-": "#4ade80",
  "B+": "#84cc16",
  B: "#a3e635",
  "B-": "#facc15",
  "C+": "#fbbf24",
  C: "#f59e0b",
  "C-": "#f97316",
  "D+": "#fb923c",
  D: "#ef4444",
  "D-": "#dc2626",
  F: "#b91c1c",
};

// ---------------------------------------------------------------------------
// Score Circle Component
// ---------------------------------------------------------------------------

function ScoreCircle({
  grade,
  label,
  color,
  size = 90,
  isActive,
  onClick,
}: {
  grade: string;
  label: string;
  color: string;
  size?: number;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const gradeColor = GRADE_COLORS[grade] || color;
  // For non-graded categories, show a simple info display
  const isGraded = /^[A-F][+-]?$/.test(grade);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 ${
        isActive
          ? "bg-white/[0.06] border border-white/[0.1]"
          : "hover:bg-white/[0.03] border border-transparent"
      }`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background ring */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          {isGraded && (
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={gradeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - gradeToPercent(grade) / 100)}`}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 6px ${gradeColor}40)` }}
            />
          )}
        </svg>
        {/* Grade text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold text-lg"
            style={{ color: isGraded ? gradeColor : "rgb(148 163 184)" }}
          >
            {isGraded ? grade : "—"}
          </span>
        </div>
      </div>
      <span className="text-[11px] text-slate-400 font-medium text-center leading-tight max-w-[80px]">
        {label}
      </span>
    </button>
  );
}

function gradeToPercent(grade: string): number {
  const map: Record<string, number> = {
    "A+": 98,
    A: 95,
    "A-": 92,
    "B+": 88,
    B: 85,
    "B-": 82,
    "C+": 78,
    C: 75,
    "C-": 72,
    "D+": 68,
    D: 65,
    "D-": 62,
    F: 40,
  };
  return map[grade] || 50;
}

// ---------------------------------------------------------------------------
// Status icon helper
// ---------------------------------------------------------------------------

function StatusIcon({ score }: { score: number }) {
  if (score === 2)
    return <CheckCircle size={16} className="text-emerald-400 shrink-0" />;
  if (score === 1)
    return <AlertTriangle size={16} className="text-amber-400 shrink-0" />;
  return <XCircle size={16} className="text-red-400 shrink-0" />;
}

// ---------------------------------------------------------------------------
// Priority badge helper
// ---------------------------------------------------------------------------

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: "bg-red-500/10 text-red-400 border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors[priority] || colors.Low}`}
    >
      {priority}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function AuditResults({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [audit, setAudit] = useState<any>(null);
  const [scores, setScores] = useState<CheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [activeTab] = useState<string>("SEO Audit");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    let pollInterval: NodeJS.Timeout;
    let executionStarted = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/audit/${slug}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error);
          setLoading(false);
          return;
        }

        setAudit(data.audit);
        setScores(data.scores || []);

        if (data.audit.status === "running") {
          setProcessingStatus("Analyzing across 7 modules...");

          if (!executionStarted) {
            executionStarted = true;
            fetch(`/api/audit/${slug}/execute`, { method: "POST" })
              .then((r) => r.json())
              .then((execData) => {
                if (!execData.success) {
                  setError(execData.error);
                }
              })
              .catch((e) => {
                setError("Execution failed: " + e.message);
              });
          }
        } else if (
          data.audit.status === "complete" ||
          data.audit.status === "error"
        ) {
          setLoading(false);
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStatus();
    pollInterval = setInterval(fetchStatus, 4000);
    return () => clearInterval(pollInterval);
  }, [slug]);

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------

  const categoryScoresData = useMemo((): CategoryScore[] => {
    // Prefer the pre-computed category_scores from the DB
    const cs = audit?.category_scores;
    if (cs) {
      return Object.entries(cs).map(([key, grade]) => ({
        key,
        label: CATEGORY_META[key]?.label || key,
        grade: grade as string,
        numericScore: gradeToPercent(grade as string),
      }));
    }

    // Fallback: compute from individual scores
    const cats = new Map<string, { total: number; max: number }>();
    for (const s of scores) {
      const cat = s.category;
      if (!cats.has(cat)) cats.set(cat, { total: 0, max: 0 });
      const c = cats.get(cat)!;
      c.total += s.score;
      c.max += 2;
    }

    return Array.from(cats.entries()).map(([key, { total, max }]) => {
      const pct = max > 0 ? Math.round((total / max) * 100) : 0;
      const grade = percentToGrade(pct);
      return {
        key,
        label: CATEGORY_META[key]?.label || key,
        grade,
        numericScore: pct,
      };
    });
  }, [audit, scores]);

  const recommendations = useMemo((): Recommendation[] => {
    return audit?.audit_result?.recommendations || [];
  }, [audit]);

  const filteredScores = useMemo(() => {
    if (!activeCategory) return scores;
    return scores.filter((s) => s.category === activeCategory);
  }, [scores, activeCategory]);

  // Screenshot from the audit result
  const screenshot = useMemo(() => {
    const result = audit?.audit_result;
    if (!result?.screenshots) {
      // Fallback to PSI screenshot
      const psiScreenshot =
        audit?.pagespeed_raw?.lighthouseResult?.audits?.["final-screenshot"]
          ?.details?.data;
      return psiScreenshot || null;
    }
    return result.screenshots[viewport] || result.screenshots.desktop || null;
  }, [audit, viewport]);

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <>
        <TopBar activeTab={activeTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
              <Loader2
                className="absolute inset-0 m-auto text-blue-400 animate-pulse"
                size={28}
              />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Running Full Audit
            </h2>
            <p className="text-slate-400 text-sm mb-1">
              {processingStatus || "Initializing..."}
            </p>
            <p className="text-[12px] text-slate-600 max-w-sm mx-auto mt-3">
              Analyzing On-Page SEO, Performance, Usability, Social, Local SEO,
              Technology, and GEO modules. This takes 30–60 seconds.
            </p>
          </div>
        </div>
      </>
    );
  }

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------
  if (error || audit?.status === "error") {
    return (
      <>
        <TopBar activeTab={activeTab} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 max-w-lg text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={36} />
            <h2 className="text-xl font-semibold text-white mb-2">
              Audit Failed
            </h2>
            <p className="text-red-300/80 text-sm">
              {error || "An error occurred while processing this website."}
            </p>
          </div>
        </div>
      </>
    );
  }

  // -----------------------------------------------------------------------
  // Results view
  // -----------------------------------------------------------------------
  const overallGrade = audit?.audit_result?.overallGrade || percentToGrade(audit?.overall_score || 0);
  const overallColor = GRADE_COLORS[overallGrade] || "#94a3b8";

  return (
    <>
      <TopBar activeTab={activeTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
          {/* ——— Header with URL + overall grade ——— */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-slate-500 uppercase tracking-widest font-semibold mb-1">
                SEO Audit Results
              </p>
              <h1 className="text-xl font-semibold text-white truncate max-w-xl">
                {audit.url}
              </h1>
            </div>
            <div className="flex items-center gap-3 bg-[#111630] border border-white/[0.06] rounded-2xl px-5 py-3">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Overall
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: overallColor }}
                >
                  {overallGrade}
                </p>
              </div>
            </div>
          </div>

          {/* ——— Website Preview Panel ——— */}
          <div className="bg-[#111630] border border-white/[0.06] rounded-2xl overflow-hidden">
            {/* Viewport toggle bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
              <span className="text-[12px] text-slate-500 font-medium">
                Website Preview
              </span>
              <div className="flex items-center gap-1 bg-[#0a0e1a] rounded-lg p-0.5">
                {(
                  [
                    { key: "desktop", icon: Monitor, label: "Desktop" },
                    { key: "tablet", icon: Tablet, label: "Tablet" },
                    { key: "mobile", icon: Smartphone, label: "Mobile" },
                  ] as const
                ).map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setViewport(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                      viewport === key
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Screenshot area */}
            <div
              className="relative flex items-center justify-center bg-[#0a0e1a] overflow-hidden"
              style={{
                height:
                  viewport === "mobile"
                    ? 500
                    : viewport === "tablet"
                      ? 420
                      : 360,
              }}
            >
              {screenshot ? (
                <img
                  src={screenshot}
                  alt={`${viewport} preview of ${audit.url}`}
                  className={`object-contain object-top h-full transition-all duration-300 ${
                    viewport === "mobile"
                      ? "max-w-[280px] rounded-2xl border border-white/[0.06] shadow-2xl"
                      : viewport === "tablet"
                        ? "max-w-[520px] rounded-xl border border-white/[0.06] shadow-xl"
                        : "w-full"
                  }`}
                />
              ) : (
                <div className="text-slate-600 text-sm flex flex-col items-center gap-2">
                  <Monitor size={32} className="text-slate-700" />
                  <span>Preview unavailable</span>
                </div>
              )}
            </div>
          </div>

          {/* ——— Hero Summary (Phase 1 Redesign) ——— */}
          <div className="bg-[#111630] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {/* Overall circle */}
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 ${
                  !activeCategory
                    ? "bg-white/[0.06] border border-white/[0.1]"
                    : "hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <div
                  className="w-[90px] h-[90px] rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(${overallColor} ${gradeToPercent(overallGrade)}%, rgba(255,255,255,0.06) 0)`,
                  }}
                >
                  <div className="w-[74px] h-[74px] rounded-full bg-[#111630] flex items-center justify-center">
                    <span
                      className="font-bold text-lg"
                      style={{ color: overallColor }}
                    >
                      {overallGrade}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Overall
                </span>
              </button>

              {/* The 4 Category circles explicitly from the brief */}
              {["onPageSeo", "usability", "geo", "performance"].map((catKey) => {
                const catData = categoryScoresData.find((c) => c.key === catKey);
                const grade = catData?.grade || "—";
                const label = CATEGORY_META[catKey]?.label || catKey;
                const color = CATEGORY_META[catKey]?.color || "#94a3b8";
                
                return (
                  <ScoreCircle
                    key={catKey}
                    grade={grade}
                    label={label}
                    color={color}
                    isActive={activeCategory === catKey}
                    onClick={() => setActiveCategory(activeCategory === catKey ? null : catKey)}
                  />
                );
              })}
            </div>
          </div>

          {/* ——— New SEO Audit Layout (Phase 1) ——— */}
          {(!activeCategory || activeCategory === "onPageSeo") && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: On-Page SEO Results */}
              <div className="lg:col-span-8">
                <OnPageSeoResults scores={scores.filter(s => s.category === "onPageSeo")} />
              </div>
              
              {/* Right Column: Recommendations */}
              <div className="lg:col-span-4">
                <RecommendationsList recommendations={recommendations} />
              </div>
            </div>
          )}

          {/* ——— Detailed Check Results (Fallback for other categories) ——— */}
          {(() => {
             const genericScores = activeCategory === "onPageSeo" 
               ? [] 
               : filteredScores.filter(s => s.category !== "onPageSeo");
               
             return genericScores.length > 0 && (
              <div className="bg-[#111630] border border-white/[0.06] rounded-2xl overflow-hidden mt-6">
                <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-white">
                    {activeCategory
                      ? `${CATEGORY_META[activeCategory]?.label || activeCategory} Checks`
                      : "Other Checks"}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {genericScores.length} check
                    {genericScores.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {genericScores.map((item) => (
                    <div
                      key={item.check_key}
                      className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <StatusIcon score={item.score} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-[13px] font-medium text-slate-200">
                            {item.label}
                          </h4>
                          {!activeCategory && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: `${CATEGORY_META[item.category]?.color || "#666"}15`,
                                color: CATEGORY_META[item.category]?.color || "#999",
                              }}
                            >
                              {CATEGORY_META[item.category]?.label || item.category}
                            </span>
                          )}
                        </div>
                        {item.detail && (
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
             );
          })()}

          {/* ——— Improving Section — fallback for other categories ——— */}
          {(() => {
            const showGenericRecommendations = activeCategory && activeCategory !== "onPageSeo";
            return showGenericRecommendations && recommendations.length > 0 && (
              <div className="flex gap-6 mt-6">
                <div className="w-[3px] bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUp size={16} className="text-blue-400" />
                    <h3 className="text-[14px] font-semibold text-white">
                      Improving
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      {recommendations.length} recommendation
                      {recommendations.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="bg-[#111630] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.1] hover:bg-[#131838] transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${CATEGORY_META[rec.category]?.color || "#666"}15`,
                              color: CATEGORY_META[rec.category]?.color || "#999",
                            }}
                          >
                            {CATEGORY_META[rec.category]?.label || rec.category}
                          </span>
                          <PriorityBadge priority={rec.priority} />
                        </div>
                        <p className="text-[13px] text-slate-300 font-medium leading-snug">
                          {rec.title}
                        </p>
                        <div className="flex items-center gap-1 mt-3 text-[11px] text-slate-500 group-hover:text-blue-400 transition-colors">
                          <span>View details</span>
                          <ChevronRight size={12} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ——— Play/Pause + Loom — static placeholder ——— */}
          <div className="flex items-center justify-end gap-2 pb-6">
            <button className="w-10 h-10 rounded-full bg-[#111630] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-300 hover:border-white/[0.1] transition-all">
              <Play size={16} />
            </button>
            <button className="w-10 h-10 rounded-full bg-[#111630] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-300 hover:border-white/[0.1] transition-all">
              <Pause size={16} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#111630] border border-white/[0.06] rounded-full text-[12px] font-medium text-slate-500 hover:text-slate-300 hover:border-white/[0.1] transition-all">
              <Video size={14} />
              Loom
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

// ---------------------------------------------------------------------------
// Top Bar Component (shared between loading / error / results states)
// ---------------------------------------------------------------------------

function TopBar({ activeTab }: { activeTab: string }) {
  return (
    <header className="flex items-center justify-between border-b border-white/[0.06] bg-[#0c1022]/80 backdrop-blur-sm px-6 h-14 shrink-0">
      <div className="flex items-center gap-1">
        {SEGMENT_TABS.map((tab) => (
          <button
            key={tab}
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
      <button className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-slate-400 hover:text-slate-200 rounded-lg border border-white/[0.08] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04] transition-all">
        <FileText size={15} />
        My SOP/Blueprint
      </button>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function percentToGrade(pct: number): string {
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 67) return "D+";
  if (pct >= 63) return "D";
  if (pct >= 60) return "D-";
  return "F";
}
