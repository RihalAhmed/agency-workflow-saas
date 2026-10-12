"use client";

import React, { useState } from "react";
import { CheckCard } from "./CheckCard";
import { Share2, ChevronRight, ChevronDown, CheckCircle2, AlertTriangle } from "lucide-react";

export function SocialResults({ scores, defaultOpen = false }: { scores: any[], defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [filter, setFilter] = useState<'all'|'passed'|'warning'|'critical'>('all');

  if (!scores || scores.length === 0) return null;

  const validScores = scores.filter(s => s.score !== -1);
  const issuesCount = validScores.filter(s => s.score < 2).length;
  const isGood = issuesCount === 0;

  const passedCount = validScores.filter(s => s.score === 2 || s.score === 3).length;
  const warningCount = validScores.filter(s => s.score === 1).length;
  const criticalCount = validScores.filter(s => s.score === 0 || s.score === undefined).length;

  const filteredScores = validScores.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'passed') return s.score === 2 || s.score === 3;
    if (filter === 'warning') return s.score === 1;
    if (filter === 'critical') return s.score === 0 || s.score === undefined;
    return true;
  });

  let listIndex = 1;

  return (
    <div className={`w-full flex flex-col bg-white border border-slate-200 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[5000px]' : 'max-h-[92px]'}`}>
      <div 
        className="flex justify-between items-center p-6 bg-transparent rounded-t-[20px] z-10 shrink-0 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[12px] bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] shrink-0 border border-[#E0E7FF]">
            <Share2 size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#1E293B]">Social Signals</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">Open Graph tags, Twitter cards, and social links</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {issuesCount > 0 ? (
            <div className="bg-[#FFFBEB] border border-[#FEF3C7] text-[#D97706] text-[13px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertTriangle size={14} strokeWidth={2} />
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
            {isGood ? "Your social presence is fully optimized" : "Optimize your social sharing properties"}
          </h3>
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            Social tags define how your content appears when shared on platforms like Facebook, Twitter, and LinkedIn. Proper tags significantly increase click-through rates.
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

        <div className="flex flex-col gap-3">
          {filteredScores.map((scoreItem) => (
            <CheckCard
              key={scoreItem.check_key || scoreItem.key}
              checkKey={scoreItem.check_key || scoreItem.key}
              title={scoreItem.label}
              index={listIndex++}
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
