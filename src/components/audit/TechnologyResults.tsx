"use client";

import React, { useState } from "react";
import { CheckCard } from "./CheckCard";
import { Cpu, ChevronRight, ChevronDown, CheckCircle2, AlertTriangle } from "lucide-react";

// Helper to map popular tech to domains for favicon fetching
const TECH_DOMAIN_MAP: Record<string, string> = {
  "wordpress": "wordpress.org",
  "next.js": "nextjs.org",
  "react": "reactjs.org",
  "vue.js": "vuejs.org",
  "angular": "angular.io",
  "node.js": "nodejs.org",
  "php": "php.net",
  "mysql": "mysql.com",
  "nginx": "nginx.com",
  "apache": "apache.org",
  "cloudflare": "cloudflare.com",
  "google analytics": "analytics.google.com",
  "google tag manager": "tagmanager.google.com",
  "facebook pixel": "facebook.com",
  "shopify": "shopify.com",
  "webflow": "webflow.com",
  "wix": "wix.com",
  "squarespace": "squarespace.com",
  "bootstrap": "getbootstrap.com",
  "tailwind css": "tailwindcss.com",
  "jquery": "jquery.com",
  "aws": "aws.amazon.com",
  "stripe": "stripe.com",
};

function getTechDomain(name: string) {
  const lower = name.toLowerCase();
  if (TECH_DOMAIN_MAP[lower]) return TECH_DOMAIN_MAP[lower];
  // Guess the domain
  const guessed = lower.replace(/[^a-z0-9]/g, '');
  return `${guessed}.com`;
}

function TechStackVisualizer({ data, index }: { data: any, index: number }) {
  const techs = data?.technologies || [];
  const grouped = data?.grouped || {};
  
  if (techs.length === 0) return null;

  return (
    <div className="flex flex-col bg-white border border-[#E2E8F0] rounded-[20px] p-6 hover:border-[#CBD5E1] transition-all group mb-3">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-[42px] h-[42px] rounded-full bg-[#F8FAFC] text-[#334155] flex items-center justify-center border border-[#E2E8F0] shrink-0">
          <Cpu size={20} strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-[16px] font-bold text-[#1E293B] flex items-center gap-2">
            <span className="text-[#94A3B8] text-[13px] font-bold">{index}.</span> 
            Detected Technology Stack
          </h4>
          <p className="text-[13px] text-[#64748B] mt-0.5">We found {techs.length} technologies running on this website.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(grouped).map(([category, names]: [string, any]) => (
          <div key={category} className="bg-[#F8FAFC] rounded-[12px] p-4 border border-[#F1F5F9]">
            <h5 className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-3">{category}</h5>
            <div className="flex flex-col gap-2.5">
              {names.map((name: string) => {
                const domain = getTechDomain(name);
                return (
                  <div key={name} className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-lg p-2.5 shadow-sm hover:shadow transition-shadow">
                    <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} 
                        alt={name} 
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          // Fallback if favicon fails to load
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=64&bold=true`;
                        }}
                      />
                    </div>
                    <span className="text-[14px] font-semibold text-[#1E293B]">{name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechnologyResults({ scores, defaultOpen = false }: { scores: any[], defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  React.useEffect(() => { setIsOpen(defaultOpen); }, [defaultOpen]);
  const [filter, setFilter] = useState<'all' | 'passed' | 'warning' | 'critical'>('all');

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
          <div className="w-11 h-11 rounded-[12px] bg-[#F1F5F9] flex items-center justify-center text-[#475569] shrink-0">
            <Cpu size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#1E293B]">Technology Stack</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">Underlying tech, server details, and security headers</p>
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
            {isGood ? "Your technology stack looks solid" : "There are some technology issues to review"}
          </h3>
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            Understanding the underlying technology of a website is important for identifying potential security vulnerabilities, performance bottlenecks, and compatibility issues.
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
          {filteredScores.map((scoreItem) => {
            if (scoreItem.check_key === "tech_stack" || scoreItem.key === "tech_stack") {
              return <TechStackVisualizer key={scoreItem.check_key || scoreItem.key} data={scoreItem.data} index={listIndex++} />;
            }
            return (
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
