"use client";

import React, { useState } from "react";
import { CheckCard } from "./CheckCard";
import { Zap, ChevronRight, ChevronDown, CheckCircle2, AlertTriangle, XCircle, Info, PieChart, HardDrive, Cpu } from "lucide-react";

// --- Custom Visualizer Components ---

function HalfDoughnut({ label, value, unit, color, max, target }: any) {
  const percentage = Math.min(100, Math.max(0, (parseFloat(value) / max) * 100));
  const r = 50;
  const c = Math.PI * r; 
  const offset = c - (percentage / 100) * c;
  const targetAngle = (target / max) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="text-[14px] font-semibold text-[#64748B] mb-6">{label}</div>
      <div className="relative w-[160px] h-[80px]">
        <svg viewBox="0 0 120 60" className="w-full h-full overflow-visible">
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#F1F5F9" strokeWidth="14" strokeLinecap="round" />
          <path 
            d="M 10 60 A 50 50 0 0 1 110 60" 
            fill="none" 
            stroke={color} 
            strokeWidth="14" 
            strokeLinecap="round" 
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          {/* Target marker */}
          <line 
            x1="60" y1="3" x2="60" y2="-5" 
            stroke="#1E293B" strokeWidth="2" 
            transform={`rotate(${targetAngle} 60 60)`}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center translate-y-2">
          <div className="text-[24px] font-bold text-[#1E293B] leading-none">{value}<span className="text-[16px] text-[#94A3B8] ml-0.5">{unit}</span></div>
        </div>
      </div>
    </div>
  );
}

function LoadSpeedVisualizer({ scores, index }: { scores: any[], index: number }) {
  const srt = scores.find(s => s.check_key === "server_response_time");
  const fcp = scores.find(s => s.check_key === "fcp");
  const tti = scores.find(s => s.check_key === "tti");

  if (!srt && !fcp && !tti) return null;

  const getMsData = (checkItem: any) => {
    if (!checkItem || !checkItem.data) return 0;
    return checkItem.data.mobile || checkItem.data.desktop || 0;
  };

  const srtVal = getMsData(srt) / 1000;
  const fcpVal = getMsData(fcp) / 1000;
  const ttiVal = getMsData(tti) / 1000;

  const getColor = (val: number, good: number, ok: number) => val <= good ? "#22C55E" : val <= ok ? "#F59E0B" : "#EF4444";

  const [isActive, setIsActive] = useState(false);
  
  React.useEffect(() => {
    const keys = ["server_response_time", "fcp", "tti"];
    const checkHash = (keyToCheck?: string) => {
      const hashKey = window.location.hash.replace('#check-', '');
      const active = keyToCheck ? keys.includes(keyToCheck) : keys.includes(hashKey);
      setIsActive(active);
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
  }, []);

  const cardClass = isActive
    ? "flex flex-col bg-white border-2 border-[#6366F1] shadow-md rounded-[20px] p-6 transition-all col-span-1 lg:col-span-2"
    : "flex flex-col bg-white border border-[#E2E8F0] rounded-[20px] p-6 hover:border-[#CBD5E1] transition-all col-span-1 lg:col-span-2";

  const statusColors = {
    pass: "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]",
    warning: "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]",
    fail: "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]",
    info: "bg-[#F0F9FF] text-[#0EA5E9] border-[#E0F2FE]",
    skipped: "bg-slate-100 text-slate-500 border-slate-200"
  };

  const getWorstStatus = (statuses: string[]) => {
    if (statuses.includes('fail')) return 'fail';
    if (statuses.includes('warning')) return 'warning';
    return 'pass';
  };
  
  const overallStatus = getWorstStatus([srt?.status, fcp?.status, tti?.status].filter(Boolean));
  const iconClass = `w-[42px] h-[42px] rounded-full flex items-center justify-center border shrink-0 ${statusColors[overallStatus as keyof typeof statusColors] || statusColors.info}`;

  return (
    <div id="check-server_response_time" className={cardClass}>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={iconClass}>
            <Zap size={20} strokeWidth={2} />
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#1E293B] flex items-center gap-2">
              <span className="text-[#94A3B8] text-[13px] font-bold">{index}.</span> 
              Website Load Speed
            </h4>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              {overallStatus === 'fail' 
                ? "Critical issues found with your page load speed. This negatively impacts SEO and user experience." 
                : overallStatus === 'warning'
                ? "Some load speed metrics need improvement for better performance."
                : "Your page load speed is fast, which is excellent for SEO and user experience."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 py-6 px-4 bg-[#F8FAFC] rounded-[16px] border border-[#F1F5F9]">
        <HalfDoughnut 
          label="Server Response" 
          value={srtVal.toFixed(3)} unit="s" 
          color={getColor(srtVal, 0.2, 0.6)} 
          max={1.0} target={0.2} 
        />
        <HalfDoughnut 
          label="All Page Content Loaded" 
          value={fcpVal.toFixed(1)} unit="s" 
          color={getColor(fcpVal, 1.8, 3.0)} 
          max={5.0} target={1.8} 
        />
        <HalfDoughnut 
          label="All Page Scripts Complete" 
          value={ttiVal.toFixed(1)} unit="s" 
          color={getColor(ttiVal, 3.8, 7.3)} 
          max={10.0} target={3.8} 
        />
      </div>
    </div>
  );
}

function DownloadSizeVisualizer({ score, index }: { score: any, index: number }) {
  if (!score || !score.data?.breakdown) return null;

  const { breakdown } = score.data;
  const colors: any = { script: "#F59E0B", document: "#EF4444", stylesheet: "#0EA5E9", image: "#22C55E", font: "#8B5CF6", media: "#EC4899", other: "#94A3B8" };
  const labels: any = { script: "Script", document: "Document", stylesheet: "Stylesheet", image: "Image", font: "Font", media: "Media", other: "Other" };

  let totalBytes = 0;
  const items = Object.keys(breakdown).map(type => {
    totalBytes += breakdown[type].bytes;
    const typeLower = type.toLowerCase();
    return { type, bytes: breakdown[type].bytes, color: colors[typeLower] || colors.other, label: labels[typeLower] || type };
  }).sort((a, b) => b.bytes - a.bytes);

  let currentOffset = 0;

  const [isActive, setIsActive] = useState(false);
  
  React.useEffect(() => {
    const checkHash = (keyToCheck?: string) => {
      const active = keyToCheck ? keyToCheck === "page_size" : window.location.hash === `#check-page_size`;
      setIsActive(active);
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
  }, []);

  const cardClass = isActive
    ? "flex flex-col bg-white border-2 border-[#6366F1] shadow-md rounded-[20px] p-6 transition-all col-span-1 lg:col-span-2"
    : "flex flex-col bg-white border border-[#E2E8F0] rounded-[20px] p-6 hover:border-[#CBD5E1] transition-all col-span-1 lg:col-span-2";

  const statusColors = {
    pass: "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]",
    warning: "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]",
    fail: "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]",
    info: "bg-[#F0F9FF] text-[#0EA5E9] border-[#E0F2FE]",
    skipped: "bg-slate-100 text-slate-500 border-slate-200"
  };
  const iconClass = `w-[42px] h-[42px] rounded-full flex items-center justify-center border shrink-0 ${statusColors[score.status as keyof typeof statusColors] || statusColors.info}`;

  return (
    <div id="check-page_size" className={cardClass}>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={iconClass}>
            <HardDrive size={20} strokeWidth={2} />
          </div>
          <div>
            <h4 className="text-[16px] font-bold text-[#1E293B] flex items-center gap-2">
              <span className="text-[#94A3B8] text-[13px] font-bold">{index}.</span> 
              Website Download Size
            </h4>
            <p className="text-[13px] text-[#64748B] mt-0.5">{score.detail || "Total size of all resources requested by the page."}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-8 bg-[#F8FAFC] rounded-[16px] border border-[#F1F5F9]">
        {/* Full Doughnut */}
        <div className="relative w-[180px] h-[180px] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {items.map((item, i) => {
              const percentage = item.bytes / Math.max(1, totalBytes);
              const dashArray = `${percentage * 2 * Math.PI * 40} ${2 * Math.PI * 40}`;
              const dashOffset = -(currentOffset * 2 * Math.PI * 40);
              currentOffset += percentage;
              return (
                <circle
                  key={i} cx="50" cy="50" r="40"
                  fill="none" stroke={item.color} strokeWidth="12"
                  strokeDasharray={dashArray} strokeDashoffset={dashOffset}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-bold text-[#1E293B]">{(totalBytes / (1024 * 1024)).toFixed(2)}MB</span>
            <span className="text-[11px] font-semibold text-[#64748B]">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between group hover:scale-105 transition-transform duration-300 cursor-default">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-150" style={{ backgroundColor: item.color }} />
                <span className="text-[13px] font-semibold text-[#64748B] uppercase group-hover:text-[#1E293B] transition-colors">{item.label}</span>
              </div>
              <span className="text-[13px] font-bold text-[#1E293B]">{(item.bytes / (1024 * 1024)).toFixed(2)}MB</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Module ---

export function PerformanceResults({ scores, defaultOpen = false }: { scores: any[], defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  React.useEffect(() => { setIsOpen(defaultOpen); }, [defaultOpen]);
  const [filter, setFilter] = useState<'all' | 'passed' | 'issues'>('all');

  // Hardcode the order of performance checks
  const SORT_ORDER = [
    "server_response_time", // visually merged into Load Speed
    "fcp", // merged
    "tti", // merged
    "page_size", // Website Download Size
    "text_compression", // Compression Usage
    "resource_counts", // Resources Breakdown
    "image_optimization",
    "browser_caching",
    "js_errors",
    "http2",
    "minification",
    "deprecated_html",
    "inline_styles"
  ];

  // Map backend keys to 2026 standard UI titles
  const ITEM_TITLES: Record<string, string> = {
    image_optimization: "Image Optimization",
    browser_caching: "Browser Caching",
    js_errors: "JavaScript Errors",
    http2: "HTTP/2 Usage",
    minification: "Minification",
    deprecated_html: "Deprecated HTML",
    inline_styles: "Inline Styles",
    text_compression: "Compression Usage (Gzip, Deflate, Brotli)",
    resource_counts: "Resources Breakdown"
  };

  const filteredScores = scores
    .filter(s => s.score !== -1)
    .filter(s => SORT_ORDER.includes(s.check_key))
    .sort((a, b) => SORT_ORDER.indexOf(a.check_key) - SORT_ORDER.indexOf(b.check_key));

  const itemsToDisplay = filteredScores.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'passed') return s.score === 2 || s.score === 3; // pass or info
    if (filter === 'issues') return s.score === 0 || s.score === 1; // fail or warning
    return true;
  });

  const warningCount = filteredScores.filter(s => s.score === 1).length;
  const criticalCount = filteredScores.filter(s => s.score === 0).length;

  const passedCount = filteredScores.filter(s => s.score === 2 || s.score === 3).length;
  const issuesCount = filteredScores.filter(s => s.score === 0 || s.score === 1).length;
  
  let visualizerIndex = 1;

  return (
    <div className={`w-full flex flex-col bg-white border border-slate-200 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[5000px]' : 'max-h-[92px]'}`}>
      <div 
        className="flex justify-between items-center p-6 bg-transparent rounded-t-[20px] z-10 shrink-0 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[12px] bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] shrink-0">
            <Zap size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#1E293B]">Performance Results</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">Your page's performance has some issues and room for improvement</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {issuesCount > 0 && (
            <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444] text-[13px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertTriangle size={14} strokeWidth={2} />
              {issuesCount} issues found <ChevronRight size={14} className="ml-0.5" strokeWidth={2} />
            </div>
          )}
          
          <button className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className={`px-6 pb-6 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5 border-b border-[#F1F5F9] pb-5">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${filter === 'all' ? 'bg-[#1E293B] text-white' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            All Checks ({filteredScores.length})
          </button>
          <button 
            onClick={() => setFilter('passed')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${filter === 'passed' ? 'bg-[#ECFDF5] text-[#059669] border border-[#10B981]' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${filter === 'passed' ? 'bg-[#059669]' : 'bg-[#22C55E]'}`} />
            Good ({passedCount})
          </button>
          <button 
            onClick={() => setFilter('issues')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${filter === 'issues' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${filter === 'issues' ? 'bg-[#D97706]' : 'bg-[#F59E0B]'}`} />
            Issues ({issuesCount})
          </button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Custom Visualizers */}
          {filter === 'all' && <LoadSpeedVisualizer scores={scores} index={visualizerIndex++} />}
          {filter === 'all' && <DownloadSizeVisualizer score={scores.find(s => s.check_key === "page_size")} index={visualizerIndex++} />}

          {/* Standard Checks */}
          {itemsToDisplay.map((item) => {
            // Skip items rendered in custom visualizers if viewing "all"
            if (filter === 'all' && ["server_response_time", "fcp", "tti", "page_size"].includes(item.check_key)) return null;

            const title = ITEM_TITLES[item.check_key] || item.label;
            return <CheckCard key={item.check_key} score={item.score} checkKey={item.check_key} data={item.data} evidence={item.evidence || item.data?.evidence} detail={item.detail} title={title} index={visualizerIndex++} />;
          })}
        </div>
      </div>
    </div>
  );
}
