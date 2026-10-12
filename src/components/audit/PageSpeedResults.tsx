"use client";

import React, { useState } from "react";
import { Zap, Smartphone, Monitor, ChevronRight } from "lucide-react";

function MetricCard({ m }: { m: any }) {
  const [isActive, setIsActive] = useState(false);
  const checkKey = m.id;
  
  React.useEffect(() => {
    const checkHash = (keyToCheck?: string) => {
      const active = keyToCheck ? keyToCheck === checkKey : window.location.hash === `#check-${checkKey}`;
      setIsActive(active);
      if (active) {
        setTimeout(() => {
          document.getElementById(`check-${checkKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    };
    checkHash();
    const handleHash = () => checkHash();
    const handleHighlight = (e: any) => checkHash(e.detail.checkKey);
    
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('highlight-check', handleHighlight);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('highlight-check', handleHighlight);
    };
  }, [checkKey]);

  const cardClass = isActive
    ? "flex items-center justify-between bg-white px-5 py-4 rounded-[12px] border-2 border-[#6366F1] shadow-md transition-all"
    : "flex items-center justify-between bg-white px-5 py-4 rounded-[12px] border border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1] transition-colors";

  return (
    <div id={`check-${checkKey}`} className={cardClass}>
      <span className="text-[13px] font-semibold text-[#64748B]">{m.label}</span>
      <span className="text-[15px] font-bold text-[#1E293B]">{m.value}</span>
    </div>
  );
}

export function PageSpeedResults({ scoreItem }: { scoreItem: any }) {
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');

  if (!scoreItem || !scoreItem.data) return null;

  const data = scoreItem.data[activeTab];
  const { score: rawScore, hasFieldData, fcp, speedIndex, lcp, tti, tbt, cls, error } = data;

  // Unavailable = Google returned nothing. Older saved audits stored a failed call
  // as score 0 with every metric "N/A", so treat that pattern as unavailable too.
  const allMetricsMissing = [fcp, speedIndex, lcp, tti, tbt, cls].every((v) => !v || v === "N/A");
  const isUnavailable =
    data.available === false || rawScore === null || rawScore === undefined || (rawScore === 0 && allMetricsMissing);
  const score = isUnavailable ? 0 : rawScore;

  const scoreColor = isUnavailable ? "#94A3B8" : score >= 90 ? "#16A34A" : score >= 50 ? "#F59E0B" : "#EF4444";
  const scoreRingStroke = isUnavailable ? "rgba(148, 163, 184, 1)" : score >= 90 ? "rgba(22, 163, 74, 1)" : score >= 50 ? "rgba(245, 158, 11, 1)" : "rgba(239, 68, 68, 1)";
  const scoreRingBg = isUnavailable ? "rgba(148, 163, 184, 0.15)" : score >= 90 ? "rgba(22, 163, 74, 0.1)" : score >= 50 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)";

  const metrics = [
    { id: "fcp", label: "First Contentful Paint", value: fcp },
    { id: "speed_index", label: "Speed Index", value: speedIndex },
    { id: "lcp", label: "Largest Contentful Paint", value: lcp },
    { id: "tti", label: "Time to Interactive", value: tti },
    { id: "tbt", label: "Total Blocking Time", value: tbt },
    { id: "cls", label: "Cumulative Layout Shift", value: cls },
  ];

  return (
    <div className="w-full flex flex-col bg-white border border-[#E2E8F0] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-[#F1F5F9] bg-[#F8FAFC]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#E2E8F0]">
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-[#1E293B] tracking-tight">Google PageSpeed Insights</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5 font-medium">Real-world speed data and lab metrics directly from Google's API.</p>
          </div>
        </div>
        
        {/* Device Tabs */}
        <div className="flex items-center gap-1 bg-[#E2E8F0] p-1 rounded-xl mt-4 md:mt-0 w-fit">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              activeTab === 'mobile' 
                ? 'bg-white text-[#0F172A] shadow-sm' 
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Smartphone size={16} /> Mobile
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              activeTab === 'desktop' 
                ? 'bg-white text-[#0F172A] shadow-sm' 
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Monitor size={16} /> Desktop
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col lg:flex-row items-center lg:items-start gap-12">
        {/* Score Ring */}
        <div id="check-performance_score" className="flex flex-col items-center shrink-0">
          <div className="relative w-[180px] h-[180px] flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={scoreRingBg}
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={scoreRingStroke}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - Math.max(0, Math.min(100, score)) / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-[48px] font-black tracking-tighter" style={{ color: scoreColor }}>{isUnavailable ? "—" : Math.round(score)}</span>
              {isUnavailable && <span className="text-[12px] font-semibold text-[#94A3B8] -mt-1">Unavailable</span>}
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4 text-[13px] font-bold text-[#64748B] bg-[#F8FAFC] px-4 py-2 rounded-full border border-[#E2E8F0]">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> 0-49</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> 50-89</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" /> 90-100</div>
          </div>
        </div>

        {/* Metrics & Vitals */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {isUnavailable && (
            <div className="flex items-start gap-4 p-5 rounded-[16px] bg-amber-50/60 border border-amber-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5 font-bold">!</div>
              <div>
                <h4 className="text-[15px] font-bold text-[#1E293B]">Google PageSpeed data unavailable for {activeTab}</h4>
                <p className="text-[13px] text-[#64748B] mt-1 leading-relaxed">
                  Google's API didn't return results for this run{error ? ` (${error})` : ""}. This is not a score of 0 — re-run the audit to fetch the real result.
                </p>
              </div>
            </div>
          )}
          {/* Core Web Vitals Status */}
          <div className="flex items-start gap-4 p-5 rounded-[16px] bg-blue-50/50 border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <Zap size={16} className="fill-blue-600" />
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-[#1E293B]">Core Web Vitals Assessment: {hasFieldData ? <span className="text-emerald-600">Available</span> : <span className="text-amber-600">Not Enough Data</span>}</h4>
              <p className="text-[13px] text-[#64748B] mt-1 leading-relaxed">
                {hasFieldData 
                  ? "Google has collected enough real-world speed data for this page to make a Core Web Vitals assessment." 
                  : "Google is indicating that they do not have 'sufficient real-world speed data for this page' in order to make a Core Web Vitals assessment. The lab data below is simulated."}
              </p>
            </div>
          </div>

          {/* Lab Data Grid */}
          <div>
            <h3 className="text-[15px] font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              Lab Data Metrics <ChevronRight size={14} className="text-[#94A3B8]" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {metrics.map((m, i) => (
                <MetricCard key={i} m={m} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
