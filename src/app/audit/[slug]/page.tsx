"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
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
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ArrowUp,
  Search,
  Settings,
  Users,
  ArrowLeft,
  Home,
  Link2,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { 
  IconCameraStar, 
  IconClipboardCheck, 
  IconCalendar, 
  IconChevronBlack, 
  IconChevronWhite, 
  IconSopStar
} from "@/components/icons/AuditIcons";
import { OnPageSeoResults } from "@/components/audit/OnPageSeoResults";
import { GeoResults } from "@/components/audit/GeoResults";
import { UsabilityResults } from "@/components/audit/UsabilityResults";
import { LocalSeoResults } from "@/components/audit/LocalSeoResults";
import { PageSpeedResults } from "@/components/audit/PageSpeedResults";
import { PerformanceResults } from "@/components/audit/PerformanceResults";
import { TechnologyResults } from "@/components/audit/TechnologyResults";
import { SocialResults } from "@/components/audit/SocialResults";
import { RecommendationsList } from "@/components/audit/RecommendationsList";
import { AuditHeader } from "@/components/audit/AuditHeader";
import { AuditBlueprint } from "@/components/audit/loading/AuditBlueprint";
import { RECOMMENDATION_TITLES, RECOMMENDATION_DESCRIPTIONS } from "@/lib/audit/recommendations";

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
  checkKey?: string;
}

interface CheckItem {
  check_key: string;
  key?: string;
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

const SEGMENT_TABS = ["SEO Audit", "Trust", "Conversion"] as const;

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

const getGradeMessage = (grade: string) => {
  if (grade.startsWith("A")) return "Excellent work!";
  if (grade.startsWith("B")) return "Good, but could be improved";
  if (grade.startsWith("C")) return "Your page could be better";
  if (grade.startsWith("D")) return "Needs significant improvement";
  return "Critical issues detected";
};

function ProgressRing({ size, strokeWidth, percentage, color, grade, label }: { size: number, strokeWidth: number, percentage: number, color: string, grade: string, label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      {/* Background track */}
      <svg className="absolute top-0 left-0" width={size} height={size}>
        <circle
          stroke="#F1F5F9"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Progress stroke */}
      <svg className="absolute top-0 left-0 transform -rotate-90" width={size} height={size}>
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      {/* Grade text inside */}
      <span className="font-bold text-[#111630]" style={{ fontSize: size * 0.35 }}>
        {grade}
      </span>
    </div>
  );
}

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

  const parsedAuditResult = useMemo(() => {
    if (typeof audit?.audit_result === 'string') {
      try {
        return JSON.parse(audit.audit_result);
      } catch (e) {
        return null;
      }
    }
    return audit?.audit_result || null;
  }, [audit]);

  const categoryScoresData = useMemo((): CategoryScore[] => {
    // Prefer the pre-computed category_scores from the DB
    const cs = audit?.category_scores;
    const catNum = parsedAuditResult?.categoryNumeric;
    
    if (cs) {
      return Object.entries(cs).map(([key, grade]) => {
        const percentage = catNum?.[key] !== undefined ? catNum[key] : gradeToPercent(grade as string);
        return {
          key,
          label: CATEGORY_META[key]?.label || key,
          grade: grade as string,
          numericScore: percentage,
        };
      });
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
  }, [audit, scores, parsedAuditResult]);

  const recommendations = useMemo(() => {
    const recs: any[] = parsedAuditResult?.recommendations || [];
    return recs.map(rec => {
      let key = rec.checkKey;
      if (!key) {
        key = Object.entries(RECOMMENDATION_TITLES).find(
          ([_, title]) => title === rec.title
        )?.[0];
      }
      
      const actionableDescription = RECOMMENDATION_DESCRIPTIONS[key || ''];
      const scoreItem = scores.find(s => s.check_key === key || s.key === key);
      
      return { 
        ...rec, 
        checkKey: key,
        description: actionableDescription || scoreItem?.detail || rec.description 
      };
    });
  }, [parsedAuditResult, scores]);

  useEffect(() => {
    const handleOpenCategory = (e: any) => {
      if (e.detail?.category) setActiveCategory(e.detail.category);
    };
    window.addEventListener('open-category', handleOpenCategory);
    return () => window.removeEventListener('open-category', handleOpenCategory);
  }, []);

  const filteredScores = useMemo(() => {
    if (!activeCategory) return scores;
    return scores.filter((s) => s.category === activeCategory);
  }, [scores, activeCategory]);

  // Screenshot from the audit result
  const screenshot = useMemo(() => {
    // 1. Try to use the ultra-fast embedded Base64 screenshot from Playwright
    const embeddedScreenshot = parsedAuditResult?.screenshots?.[viewport] || parsedAuditResult?.screenshots?.desktop;
    if (embeddedScreenshot) {
      return embeddedScreenshot;
    }
    
    // 2. Fallback to API proxy (which is slightly slower) for older audits
    if (!audit?.url) return null;
    return `/api/screenshot?url=${encodeURIComponent(audit.url)}`;
  }, [parsedAuditResult, audit, viewport]);

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    const displayDomain = audit?.url 
      ? new URL(audit.url).hostname 
      : (slug || "").replace(/-[0-9]+$/, '').replace(/-/g, '.'); // Attempt to clean slug

    return (
      <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-[#000000] via-[#533afd] to-[#000000] rounded-[25px] overflow-hidden">
        <AuditHeader activeTab={activeTab} companyName={audit?.company_name || audit?.audit_result?.companyName} url={audit?.url} />
        <AuditBlueprint domain={displayDomain} />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------
  if (error || audit?.status === "error") {
    return (
      <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-[#000000] via-[#533afd] to-[#000000] rounded-[25px] overflow-hidden">
        <AuditHeader activeTab={activeTab} companyName={audit?.company_name || audit?.audit_result?.companyName} url={audit?.url} />
        <div className="flex-1 flex flex-col bg-white rounded-[30px] mx-1 mb-1 relative overflow-hidden">
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-lg text-center">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={36} />
              <h2 className="text-xl font-semibold text-red-700 mb-2">
                Audit Failed
              </h2>
              <p className="text-red-600 text-sm">
                {error || "An error occurred while processing this website."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Results view
  // -----------------------------------------------------------------------
  const overallGrade = audit?.audit_result?.overallGrade || percentToGrade(audit?.overall_score || 0);
  const overallColor = GRADE_COLORS[overallGrade] || "#94a3b8";

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-[#000000] via-[#533afd] to-[#000000] rounded-[25px] overflow-hidden">
      <AuditHeader activeTab={activeTab} companyName={audit?.company_name || audit?.audit_result?.companyName} url={audit?.url} />

      <main className="flex-1 flex flex-col bg-white rounded-[30px] mx-1 mb-1 relative overflow-hidden">
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-[1549px] mx-auto px-10 py-10 space-y-12">
          {/* ——— Header Section (Image and Summary) ——— */}
          <div className="relative w-full rounded-[24px] bg-[#F7F9FF] overflow-hidden flex flex-col xl:flex-row items-center justify-between p-8 xl:p-10 gap-8 shadow-sm group/header">
            {/* Abstract background styling */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#E8EEFF] to-transparent" />
              <div className="absolute -right-[5%] -top-[20%] w-[40%] h-[150%] bg-gradient-to-b from-[#D4C6FF]/30 via-[#A4B5FF]/20 to-transparent rotate-12 blur-3xl rounded-full" />
              <div className="absolute -right-[2%] top-[10%] w-[35%] h-[120%] bg-gradient-to-tr from-[#A6C0FF]/30 to-[#C8B6FF]/30 -rotate-12 blur-[100px] rounded-full" />
            </div>

            {/* Left: Text Content */}
            <div className="flex flex-col max-w-[340px] relative z-10 shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <Link href="/audit" className="flex items-center justify-center px-3.5 h-[30px] bg-white/40 border border-white/60 rounded-full text-[12px] font-semibold text-gray-500 hover:bg-white hover:text-black transition-all shadow-sm backdrop-blur-sm">
                  <ArrowLeft size={14} className="mr-1.5" />
                  Back
                </Link>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 border border-[#E2E8F0] rounded-full w-fit shadow-sm backdrop-blur-sm">
                  <IconSopStar className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[12px] font-semibold text-[#475569]">SEO Audit</span>
                </div>
              </div>
              <h1 className="text-[40px] font-bold text-[#111630] mb-3 leading-tight tracking-tight">
                Audit Results
              </h1>
              <p className="text-[14px] text-[#64748B] leading-relaxed font-medium">
                Here's how your website performs and where you can improve. We've analyzed key SEO factors to give you a clear picture of your site's health and opportunities.
              </p>
            </div>

            {/* Middle: Circles */}
            <div className="flex items-center gap-8 relative z-10 flex-1 justify-center">
              {/* Overall Grade */}
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex flex-col items-center pt-2 pb-2 px-4 rounded-xl cursor-pointer transition-all group ${activeCategory === null ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white hover:shadow-sm'}`}
              >
                <div className="group-hover:scale-105 transition-transform shrink-0">
                  <ProgressRing 
                    size={130} 
                    strokeWidth={12} 
                    percentage={audit?.overall_score || 0} 
                    color={overallColor} 
                    grade={overallGrade} 
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="text-[14px] font-bold text-[#111630]">Overall Grade</div>
                  <div className="text-[11px] text-[#64748B] mt-1 font-medium">{getGradeMessage(overallGrade)}</div>
                </div>
              </button>

              <div className="w-[1px] h-[100px] bg-[#E2E8F0] mx-1"></div>

              {/* Other Grades */}
              <div className="flex items-center gap-5">
                {["onPageSeo", "usability", "geo", "performance"].map((catKey) => {
                  const catData = categoryScoresData.find((c) => c.key === catKey);
                  const grade = catData?.grade || "—";
                  const percentage = catData?.numericScore || 0;
                  const label = CATEGORY_META[catKey]?.label || catKey;
                  const color = GRADE_COLORS[grade] || CATEGORY_META[catKey]?.color || "#94a3b8";
                  
                  return (
                    <button
                      key={catKey}
                      onClick={() => setActiveCategory(activeCategory === catKey ? null : catKey)}
                      className={`flex flex-col items-center group transition-all pt-2 pb-2 px-2 rounded-xl cursor-pointer ${activeCategory === catKey ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white hover:shadow-sm'}`}
                    >
                      <ProgressRing 
                        size={75} 
                        strokeWidth={7} 
                        percentage={percentage} 
                        color={color} 
                        grade={grade}
                      />
                      <div className="mt-3 text-center">
                        <div className="text-[12px] font-bold text-[#111630]">{label}</div>
                        <div className="text-[10px] text-[#64748B] mt-1 flex items-center justify-center gap-0.5 font-semibold group-hover:text-blue-500 transition-colors">
                          {percentage} / 100 <ChevronRight size={10} strokeWidth={3} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Screenshot Card */}
            <div className="bg-white p-3 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#F1F5F9] relative z-10 w-[290px] shrink-0">
              <div className="rounded-[12px] overflow-hidden bg-[#F8FAFC] aspect-[16/10] mb-3 relative">
                {screenshot ? (
                  <img src={screenshot} alt="Screenshot" className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <Monitor size={28} />
                  </div>
                )}
              </div>
              <div className="px-1.5 pb-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link2 size={12} className="text-[#94A3B8]" />
                  <span className="text-[12px] font-bold text-[#111630] truncate">
                    {audit?.url ? new URL(audit.url).hostname : "website.com"}
                  </span>
                </div>
                <div className="text-[10px] text-[#94A3B8] pl-5 font-medium">
                  Last analyzed: 2 hours ago
                </div>
              </div>
            </div>
          </div>

          {/* ——— New SEO Audit Layout (Phase 1) ——— */}
          {(!activeCategory || ["onPageSeo", "geo", "usability", "localSeo", "performance", "technology", "social"].includes(activeCategory)) && (
            <div className="flex flex-col lg:flex-row mt-10 relative gap-8 items-stretch">
              {/* Left Column: On-Page SEO & GEO Results */}
              <div className="flex-1 min-w-0 flex flex-col gap-[15px]">
                {(!activeCategory || activeCategory === "onPageSeo") && (
                  <OnPageSeoResults scores={scores.filter(s => s.category === "onPageSeo")} url={audit?.url} defaultOpen={activeCategory !== null} />
                )}
                {(!activeCategory || activeCategory === "geo") && (
                  <GeoResults scores={scores.filter(s => s.category === "geo")} url={audit?.url} defaultOpen={activeCategory !== null} />
                )}
                {(!activeCategory || activeCategory === "usability") && (
                  <UsabilityResults 
                    scores={scores.filter(s => s.category === "usability")} 
                    globalScreenshots={audit?.audit_result?.screenshots} 
                    defaultOpen={activeCategory !== null}
                  />
                )}
                {(!activeCategory || activeCategory === "localSeo") && (
                  <LocalSeoResults scores={scores.filter(s => s.category === "localSeo")} defaultOpen={activeCategory !== null} />
                )}
                {(!activeCategory || activeCategory === "performance") && (
                  <PerformanceResults scores={scores.filter(s => s.category === "performance")} defaultOpen={activeCategory !== null} />
                )}
                {(!activeCategory || activeCategory === "technology") && (
                  <TechnologyResults scores={scores.filter(s => s.category === "technology")} defaultOpen={activeCategory !== null} />
                )}
                {(!activeCategory || activeCategory === "social") && (
                  <SocialResults scores={scores.filter(s => s.category === "social")} defaultOpen={activeCategory !== null} />
                )}
              </div>
              
              {/* Right Column: Recommendations (Desktop) */}
              <div className="hidden lg:block w-[500px] shrink-0 relative">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="sticky top-4 w-full h-full max-h-[80vh] pointer-events-auto">
                    <RecommendationsList recommendations={recommendations} />
                  </div>
                </div>
              </div>

              {/* Right Column: Recommendations (Mobile Fallback) */}
              <div className="w-full lg:hidden shrink-0 h-[600px]">
                <RecommendationsList recommendations={recommendations} />
              </div>
            </div>
          )}

          {/* ——— Full Width: Google PageSpeed Insights ——— */}
          {(!activeCategory || activeCategory === "performance") && (
            <div className="w-full !mt-[15px] mb-10">
              <PageSpeedResults scoreItem={scores.find(s => s.check_key === "pagespeed_insights")} />
            </div>
          )}




        </div>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top Bar Component (shared between loading / error / results states)
// ---------------------------------------------------------------------------



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
