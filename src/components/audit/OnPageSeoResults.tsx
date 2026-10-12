"use client";

import React, { useState } from "react";
import { CheckCard } from "./CheckCard";
import { FileSearch, ChevronRight, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

export function OnPageSeoResults({ scores, url, defaultOpen = false }: { scores: any[], url?: string, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  React.useEffect(() => { setIsOpen(defaultOpen); }, [defaultOpen]);
  const [filter, setFilter] = useState<'all' | 'passed' | 'warning' | 'critical'>('all');

  if (!scores || scores.length === 0) return null;

  const validScores = scores.filter(s => s.score !== -1);
  const issuesCount = validScores.filter(s => s.score < 2).length;
  const isGood = issuesCount <= 1;

  const passedCount = validScores.filter(s => s.score === 2).length;
  const warningCount = validScores.filter(s => s.score === 1).length;
  const criticalCount = validScores.filter(s => s.score === 0 || s.score === undefined).length;

  const filteredScores = validScores.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'passed') return s.score === 2;
    if (filter === 'warning') return s.score === 1;
    if (filter === 'critical') return s.score === 0 || s.score === undefined;
    return true;
  });

  return (
    <div className={`w-full flex flex-col bg-white border border-slate-200 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[8000px]' : 'max-h-[92px]'}`}>
      <div 
        className="flex justify-between items-center p-6 bg-transparent rounded-t-[20px] z-10 shrink-0 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] shrink-0">
            <FileSearch size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#1E293B]">On-Page SEO</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">How well search engines can read and rank your page</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {issuesCount > 0 ? (
            <div className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#EF4444] text-[13px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertCircle size={14} strokeWidth={2} />
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
            {isGood ? "Your On-Page SEO is very good!" : "On-Page SEO Needs Attention"}
          </h3>
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            {isGood ? "Congratulations, your On-Page SEO is well optimized. " : "Your page has some On-Page SEO issues to resolve. "}
            On-Page SEO covers the titles, meta descriptions, headings, content and technical signals that help search engines understand{url ? ` ${url.replace(/^https?:\/\//, '').replace(/\/$/, '')}` : " your page"} and rank it for relevant searches.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5 border-b border-[#F1F5F9] pb-5">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${filter === 'all' ? 'bg-[#1E293B] text-white' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'}`}
          >
            All Checks ({validScores.length})
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

        <div className="flex flex-col gap-3">
          {filteredScores.map((scoreItem, index) => (
            <CheckCard
              key={scoreItem.check_key}
              checkKey={scoreItem.check_key}
              title={scoreItem.label}
              index={index + 1}
              score={scoreItem.score}
              data={scoreItem.data}
              evidence={scoreItem.evidence || scoreItem.data?.evidence}
              detail={scoreItem.detail}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
