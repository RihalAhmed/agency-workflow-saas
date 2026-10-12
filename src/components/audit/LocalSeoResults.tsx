"use client";

import React, { useState } from "react";
import { CheckCard } from "./CheckCard";
import { MapPin, ChevronRight, ChevronDown, CheckCircle2, AlertTriangle, AlertCircle, Info, Phone, Map, Briefcase, Calendar, Check, X } from "lucide-react";

function NapStatus({ label, found, mismatch, value }: { label: string, found: boolean, mismatch: boolean, value?: string }) {
  if (!found) {
    return (
      <div className="flex flex-col gap-1 mb-4 last:mb-0">
        <div className="flex items-center gap-2">
          <div className="w-[22px] h-[22px] rounded-full bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shrink-0"><X size={12} strokeWidth={3}/></div>
          <span className="text-[13px] font-semibold text-red-600">{label}: Missing</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1 mb-4 last:mb-0">
      <div className="flex items-center gap-2">
        {mismatch ? (
          <div className="w-[22px] h-[22px] rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0"><AlertTriangle size={12} strokeWidth={2.5}/></div>
        ) : (
          <div className="w-[22px] h-[22px] rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0"><Check size={12} strokeWidth={3}/></div>
        )}
        <span className={`text-[13px] font-semibold ${mismatch ? "text-amber-600" : "text-green-700"}`}>
          {label}: {mismatch ? "Warning / Mismatch" : "Found"}
        </span>
      </div>
      {value && <span className="text-[14px] text-[#334155] ml-[30px] font-medium leading-tight">{value}</span>}
    </div>
  );
}

function LocalBusinessCard({ nameData, addressData, phoneData, schemaData }: any) {
  return (
    <div className="flex flex-col bg-white border border-[#E2E8F0] rounded-[20px] p-6 hover:border-[#CBD5E1] transition-all group mb-4 shadow-sm relative overflow-hidden">
      <div className="absolute right-[-40px] top-[-40px] opacity-5 pointer-events-none">
        <Map size={200} strokeWidth={1} />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-[42px] h-[42px] rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center border border-[#BFDBFE] shrink-0">
          <Briefcase size={20} strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-[16px] font-bold text-[#1E293B] flex items-center gap-2">
            Local Business Footprint
          </h4>
          <p className="text-[13px] text-[#64748B] mt-0.5">What search engines see about your physical business</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        
        {/* Left Column: NAP Core */}
        <div className="flex flex-col bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px] p-5">
           <h5 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">Core NAP Signals</h5>
           <NapStatus label="Business Name" found={nameData?.found} mismatch={nameData?.mismatch} value={nameData?.name} />
           <NapStatus label="Address" found={addressData?.found} mismatch={addressData?.mismatch} value={addressData?.address} />
           <NapStatus label="Phone Number" found={phoneData?.found} mismatch={phoneData?.mismatch} value={phoneData?.number} />
        </div>

        {/* Right Column: Other Local Signals */}
        <div className="flex flex-col bg-[#F8FAFC] border border-[#F1F5F9] rounded-[16px] p-5">
           <h5 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">Local Trust Factors</h5>
           
           <div className="flex flex-col mb-5">
             <span className="text-[13px] font-semibold text-[#475569] mb-1.5 flex items-center gap-1.5"><Briefcase size={14}/> Business Schema Type</span>
             {schemaData?.type ? (
               <span className="text-[14px] font-medium text-[#1E293B] bg-[#E0E7FF] text-[#4338CA] px-2.5 py-0.5 rounded-md inline-flex self-start border border-[#C7D2FE]">{schemaData.type}</span>
             ) : (
               <span className="text-[14px] font-medium text-[#DC2626] bg-[#FEF2F2] px-2.5 py-0.5 rounded-md inline-flex self-start border border-[#FEE2E2]">Missing JSON-LD Schema</span>
             )}
           </div>

        </div>
        
      </div>
    </div>
  );
}

export function LocalSeoResults({ scores, defaultOpen = false }: { scores: any[], defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  React.useEffect(() => { setIsOpen(defaultOpen); }, [defaultOpen]);
  const [filter, setFilter] = useState<'all' | 'passed' | 'warning' | 'critical'>('all');

  if (!scores || scores.length === 0) return null;

  const validScores = scores.filter(s => s.score !== -1);
  const passedCount = validScores.filter(s => s.score === 2).length;
  const warningCount = validScores.filter(s => s.score === 1).length;
  const criticalCount = validScores.filter(s => s.score === 0).length;
  const unknownCount = validScores.filter(s => s.score === 3 || s.score === undefined).length;

  let overallStatus = "good";
  if (criticalCount > 0) overallStatus = "critical";
  else if (warningCount > 0 || unknownCount > 0) overallStatus = "warning";

  const filteredScores = validScores.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'passed') return s.score === 2;
    if (filter === 'warning') return s.score === 1 || s.score === 3; // group unknown into warning visually in tabs
    if (filter === 'critical') return s.score === 0;
    return true;
  });

  const nameData = scores.find(s => s.key === "nap_name" || s.check_key === "nap_name")?.data;
  const addressData = scores.find(s => s.key === "nap_address" || s.check_key === "nap_address")?.data;
  const phoneData = scores.find(s => s.key === "nap_phone" || s.check_key === "nap_phone")?.data;
  const schemaData = scores.find(s => s.key === "local_schema" || s.check_key === "local_schema")?.data;

  let headlineText = "Local SEO signals are strong.";
  if (criticalCount > 0) {
    headlineText = `${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} ${criticalCount > 1 ? 'are' : 'is'} costing this site map-pack visibility.`;
  } else if (warningCount > 0) {
    headlineText = `${warningCount} warning${warningCount > 1 ? 's' : ''} could be holding back local rankings.`;
  } else if (unknownCount > 0) {
    headlineText = `Some checks couldn't be verified.`;
  }

  let listIndex = 1;

  return (
    <div className={`w-full flex flex-col bg-white border border-slate-200 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[5000px]' : 'max-h-[92px]'}`}>
      <div 
        className="flex justify-between items-center p-6 bg-transparent rounded-t-[20px] z-10 shrink-0 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] shrink-0">
            <MapPin size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#1E293B]">Local SEO</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">Optimize your presence for local map packs and nearby searchers</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {overallStatus === "critical" && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-[13px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertCircle size={14} strokeWidth={2} />
              {criticalCount} critical issues <ChevronRight size={14} className="ml-0.5" strokeWidth={2} />
            </div>
          )}
          {overallStatus === "warning" && (
            <div className="bg-[#FFFBEB] border border-[#FEF3C7] text-[#D97706] text-[13px] font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertTriangle size={14} strokeWidth={2} />
              Needs improvement <ChevronRight size={14} className="ml-0.5" strokeWidth={2} />
            </div>
          )}
          {overallStatus === "good" && (
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
          <h3 className={`text-[15px] font-semibold mb-1 ${overallStatus === 'critical' ? 'text-[#DC2626]' : overallStatus === 'warning' ? 'text-[#D97706]' : 'text-[#059669]'}`}>
            {headlineText}
          </h3>
          <p className="text-[13px] text-[#64748B] mt-2 flex gap-4">
            <span className="flex items-center gap-1.5"><AlertCircle size={14} className="text-[#DC2626]"/> {criticalCount} Critical</span>
            <span className="flex items-center gap-1.5"><AlertTriangle size={14} className="text-[#D97706]"/> {warningCount} To Improve</span>
            <span className="flex items-center gap-1.5"><Info size={14} className="text-[#94A3B8]"/> {unknownCount} Unknown</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#059669]"/> {passedCount} Passed</span>
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
            To Improve ({warningCount + unknownCount})
          </button>
          <button 
            onClick={() => setFilter('critical')}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${filter === 'critical' ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#EF4444]' : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${filter === 'critical' ? 'bg-[#DC2626]' : 'bg-[#EF4444]'}`} />
            Critical ({criticalCount})
          </button>
        </div>

        {filter === 'all' && (
          <LocalBusinessCard 
            nameData={nameData}
            addressData={addressData} 
            phoneData={phoneData}
            schemaData={schemaData} 
          />
        )}

        <div className="flex flex-col gap-3">
          {filteredScores.map((scoreItem) => {
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
