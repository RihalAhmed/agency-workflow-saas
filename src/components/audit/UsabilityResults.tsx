"use client";

import React, { useState } from "react";
import { CheckCard } from "./CheckCard";
import { Smartphone, ChevronRight, ChevronDown, CheckCircle2, Monitor, Tablet, Settings, Zap, LayoutPanelTop, EyeOff, KeyRound } from "lucide-react";

function DeviceRenderingVisualizer({ data, index, globalScreenshots }: { data: any, index: number, globalScreenshots?: any }) {
  if (!data) return null;

  const desktopSrc = data.screenshots?.desktop || globalScreenshots?.desktop;
  const tabletSrc = data.screenshots?.tablet || globalScreenshots?.tablet;
  const mobileSrc = data.screenshots?.mobile || globalScreenshots?.mobile;

  return (
    <div className="flex flex-col bg-white border border-[#E2E8F0] rounded-[20px] p-6 hover:border-[#CBD5E1] transition-all group col-span-1 md:col-span-2 xl:col-span-3">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center border border-[#DCFCE7] shrink-0">
            <Smartphone size={20} strokeWidth={2} />
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#1E293B] flex items-center gap-2">
              <span className="text-[#94A3B8] text-[13px] font-bold">{index}.</span> 
              Device Rendering
            </h4>
            <p className="text-[13px] text-[#64748B] mt-0.5">This check visually demonstrates how your page renders on different devices.</p>
          </div>
        </div>
        <div className="bg-[#ECFDF5] text-[#059669] px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 hidden md:flex">
          <CheckCircle2 size={14} strokeWidth={2.5} /> Passed
        </div>
      </div>

      {/* Mockups Container */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-8 py-8 bg-[#F8FAFC] rounded-[16px] border border-[#F1F5F9] relative overflow-hidden">
        
        {/* Desktop Mockup */}
        <div className="flex flex-col items-center gap-3 z-10">
          <div className="relative w-[320px] h-[200px] bg-[#1E293B] rounded-t-[12px] rounded-b-[4px] border-[6px] border-[#1E293B] shadow-xl overflow-hidden flex flex-col">
            <div className="w-full h-4 bg-[#0F172A] flex items-center gap-1.5 px-2 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            </div>
            <div className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center">
              {desktopSrc ? (
                <img 
                  src={desktopSrc} 
                  alt="Desktop Preview" 
                  className="w-full h-full object-cover object-top" 
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/10 to-blue-500/10" />
                  <div className="w-full h-6 bg-[#16A34A] absolute top-0 flex items-center px-2">
                     <div className="w-16 h-2 bg-white/20 rounded-full" />
                  </div>
                  <div className="p-4 space-y-3 mt-6 w-full">
                    <div className="w-3/4 h-6 bg-slate-200 rounded-md" />
                    <div className="w-full h-2 bg-slate-100 rounded-full" />
                    <div className="w-5/6 h-2 bg-slate-100 rounded-full" />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="w-16 h-2 bg-[#94A3B8] rounded-b-md" />
          <div className="w-24 h-1 bg-[#CBD5E1] rounded-full" />
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
            <Monitor size={14} /> Desktop
          </div>
        </div>

        {/* Tablet Mockup */}
        <div className="flex flex-col items-center gap-3 z-10 hidden sm:flex">
          <div className="relative w-[180px] h-[240px] bg-black rounded-[16px] border-[8px] border-black shadow-2xl overflow-hidden flex flex-col">
             <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full z-20" />
             <div className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center">
                {tabletSrc ? (
                  <img 
                    src={tabletSrc} 
                    alt="Tablet Preview" 
                    className="w-full h-full object-cover object-top" 
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/10 to-blue-500/10" />
                    <div className="w-full h-8 bg-[#16A34A] absolute top-0 flex items-center px-2">
                     <div className="w-8 h-2 bg-white/20 rounded-full" />
                    </div>
                    <div className="p-3 space-y-2 mt-8 w-full">
                      <div className="w-full h-5 bg-slate-200 rounded-md" />
                      <div className="w-full h-2 bg-slate-100 rounded-full" />
                    </div>
                  </>
                )}
             </div>
             <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full z-20" />
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
            <Tablet size={14} /> Tablet
          </div>
        </div>

        {/* Mobile Mockup */}
        <div className="flex flex-col items-center gap-3 z-20 md:absolute md:bottom-8 md:right-8 lg:static">
          <div className="relative w-[120px] h-[240px] bg-black rounded-[20px] border-[6px] border-black shadow-2xl overflow-hidden flex flex-col">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-black rounded-b-xl z-20" />
             <div className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center">
                {mobileSrc ? (
                  <img 
                    src={mobileSrc} 
                    alt="Mobile Preview" 
                    className="w-full h-full object-cover object-top" 
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A]/10 to-blue-500/10" />
                    <div className="w-full h-10 bg-[#16A34A] absolute top-0 flex items-center justify-center">
                     <div className="w-6 h-1.5 bg-white/20 rounded-full" />
                    </div>
                    <div className="p-2 space-y-2 mt-10 w-full">
                      <div className="w-full h-4 bg-slate-200 rounded-md" />
                      <div className="w-full h-2 bg-slate-100 rounded-full" />
                    </div>
                  </>
                )}
             </div>
             <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full z-20" />
          </div>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
            <Smartphone size={14} /> Mobile
          </div>
        </div>

      </div>
    </div>
  );
}

function PageSpeedVisualizer({ data, index, detail }: { data: any, index: number, detail: string }) {
  if (!data) return null;

  const score = data.score || 0;
  
  let scoreColor = "#EF4444";
  let scoreBg = "#FEF2F2";
  if (score >= 90) { scoreColor = "#22C55E"; scoreBg = "#F0FDF4"; }
  else if (score >= 50) { scoreColor = "#F59E0B"; scoreBg = "#FFFBEB"; }

  const metrics = [
    { label: "First Contentful Paint", value: data.fcp },
    { label: "Speed Index", value: data.speedIndex },
    { label: "Largest Contentful Paint", value: data.lcp },
    { label: "Time to Interactive", value: data.tti },
    { label: "Total Blocking Time", value: data.tbt },
    { label: "Cumulative Layout Shift", value: data.cls },
  ];

  return (
    <div className="flex flex-col bg-white border border-[#E2E8F0] rounded-[20px] p-6 hover:border-[#CBD5E1] transition-all group col-span-1 md:col-span-2 xl:col-span-3">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center border border-[#DBEAFE] shrink-0">
            <Zap size={20} strokeWidth={2} />
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#1E293B] flex items-center gap-2">
              <span className="text-[#94A3B8] text-[13px] font-bold">{index}.</span> 
              Google's PageSpeed Insights - Mobile
            </h4>
            <p className="text-[13px] text-[#64748B] mt-0.5 max-w-2xl">{detail}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center bg-[#F8FAFC] rounded-[16px] border border-[#F1F5F9] p-6">
        {/* Score Circle */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full" style={{ backgroundColor: scoreBg }}>
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="opacity-10" style={{ color: scoreColor }} />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 283} 283`}
                className="transition-all duration-1000 ease-out"
                style={{ color: scoreColor }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-[32px] font-black" style={{ color: scoreColor }}>{score}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-[12px] font-medium text-[#64748B]">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#EF4444]" /> 0-49</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#F59E0B]" /> 50-89</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#22C55E]" /> 90-100</div>
          </div>
        </div>

        {/* Lab Data Grid */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1 sm:col-span-2 mb-2 border-b border-[#E2E8F0] pb-2">
            <h5 className="text-[14px] font-bold text-[#1E293B]">Lab Data</h5>
          </div>
          {metrics.map((m, i) => (
            <div key={i} className="flex items-center justify-between bg-white px-4 py-3 rounded-[10px] border border-[#E2E8F0] shadow-sm">
              <span className="text-[13px] font-medium text-[#64748B]">{m.label}</span>
              <span className="text-[14px] font-bold text-[#1E293B]">{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export function UsabilityResults({ scores, globalScreenshots, defaultOpen = false }: { scores: any[], globalScreenshots?: any, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  React.useEffect(() => { setIsOpen(defaultOpen); }, [defaultOpen]);
  const [filter, setFilter] = useState<'all' | 'passed' | 'warning' | 'critical'>('all');

  if (!scores || scores.length === 0) return null;

  const validScores = scores.filter(s => s.score !== -1);
  const issuesCount = validScores.filter(s => s.score < 2).length;
  const isGood = issuesCount <= 2;

  const passedCount = validScores.filter(s => s.score === 2 || s.score === 3).length;
  const warningCount = validScores.filter(s => s.score === 1).length;
  const criticalCount = validScores.filter(s => s.score === 0 || s.score === undefined).length;

  const SORT_ORDER = [
    "mobile_viewport",
    "core_web_vitals",
    "device_rendering",
    "mobile_performance",
    "image_dimensions",
    "render_blocking",
    "flash_usage",
    "iframes",
    "favicon",
    "email_privacy"
  ];

  const filteredScores = scores
    .filter(s => {
      if (filter === 'all') return true;
      if (filter === 'passed') return s.score === 2 || s.score === 3;
      if (filter === 'warning') return s.score === 1;
      if (filter === 'critical') return s.score === 0 || s.score === undefined;
      return true;
    })
    .sort((a, b) => {
      const aKey = a.check_key || a.key;
      const bKey = b.check_key || b.key;
      let aIndex = SORT_ORDER.indexOf(aKey);
      let bIndex = SORT_ORDER.indexOf(bKey);
      if (aIndex === -1) aIndex = 999;
      if (bIndex === -1) bIndex = 999;
      return aIndex - bIndex;
    });

  return (
    <div className={`w-full flex flex-col bg-white border border-slate-200 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[5000px]' : 'max-h-[92px]'}`}>
      <div 
        className="flex justify-between items-center p-6 bg-transparent rounded-t-[20px] z-10 shrink-0 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[12px] bg-[#FFFBEB] flex items-center justify-center text-[#F59E0B] shrink-0">
            <Smartphone size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#1E293B]">Usability</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">Your usability could be better</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {issuesCount > 0 ? (
            <div className="bg-[#FFFBEB] border border-[#FEF3C7] text-[#D97706] text-[13px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Settings size={14} strokeWidth={2} />
              {issuesCount} issues found <ChevronRight size={14} className="ml-0.5" strokeWidth={2} />
            </div>
          ) : (
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] text-[#22C55E] text-[13px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <CheckCircle2 size={14} strokeWidth={2} />
              All good <ChevronRight size={14} className="ml-0.5" strokeWidth={2} />
            </div>
          )}
          
          <button className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
      
      <div className={`px-6 pb-6 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Intro Text */}
        <div className="mb-6 p-4 rounded-[16px] bg-[#F8FAFC] border border-[#F1F5F9]">
          <h3 className="text-[14px] font-semibold text-[#1E293B] mb-1">
            {isGood ? "Your usability is great!" : "Your usability could be better"}
          </h3>
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            Your page is OK but could be more usable across devices. Usability is important to maximize your available audience and minimize user bounce rates (which can indirectly affect your search engine rankings).
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5 border-b border-[#F1F5F9] pb-5">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${filter === 'all' ? 'bg-[#1E293B] text-white' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            All Checks ({scores.length})
          </button>
          <button 
            onClick={() => setFilter('passed')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${filter === 'passed' ? 'bg-[#ECFDF5] text-[#059669] border border-[#10B981]' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${filter === 'passed' ? 'bg-[#059669]' : 'bg-[#22C55E]'}`} />
            Good ({passedCount})
          </button>
          <button 
            onClick={() => setFilter('warning')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${filter === 'warning' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${filter === 'warning' ? 'bg-[#D97706]' : 'bg-[#F59E0B]'}`} />
            To Improve ({warningCount})
          </button>
          <button 
            onClick={() => setFilter('critical')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${filter === 'critical' ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#EF4444]' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${filter === 'critical' ? 'bg-[#DC2626]' : 'bg-[#EF4444]'}`} />
            Critical ({criticalCount})
          </button>
        </div>

        {/* Custom Visualizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
           {filteredScores.map((scoreItem, index) => {
              if (scoreItem.check_key === "device_rendering" || scoreItem.key === "device_rendering") {
                return <DeviceRenderingVisualizer key={scoreItem.check_key || scoreItem.key} data={scoreItem.data} index={index + 1} />;
              }
              if (scoreItem.check_key === "mobile_performance" || scoreItem.key === "mobile_performance") {
                return <PageSpeedVisualizer key={scoreItem.check_key || scoreItem.key} data={scoreItem.data} detail={scoreItem.detail} index={index + 1} />;
              }
              
              // Standard Checks
              return (
                <div key={scoreItem.check_key || scoreItem.key} className="col-span-1 md:col-span-2 xl:col-span-3">
                  <CheckCard
                    checkKey={scoreItem.check_key || scoreItem.key}
                    title={scoreItem.label}
                    index={index + 1}
                    score={scoreItem.score}
                    data={scoreItem.data}
                    evidence={scoreItem.evidence || scoreItem.data?.evidence}
                    detail={scoreItem.detail}
                  />
                </div>
              );
           })}
        </div>
      </div>
    </div>
  );
}
