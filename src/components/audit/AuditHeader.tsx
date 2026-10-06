import React from "react";
import { Search, ShieldCheck, TrendingUp } from "lucide-react";
import { 
  IconCameraStar, 
  IconClipboardCheck, 
  IconCalendar, 
  IconChevronBlack, 
  IconChevronWhite, 
  IconSopStar 
} from "@/components/icons/AuditIcons";

export function AuditHeader({ activeTab, companyName, url }: { activeTab: string; companyName?: string; url?: string }) {
  const displayTitle = companyName || (url ? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : "Start an audit for");

  return (
    <header className="relative w-full shrink-0 flex flex-col justify-between pt-5 h-[113px] bg-gradient-to-br from-[#000000] via-[#533afd] to-[#000000] z-50">
      {/* Top Row: Start Recording, Search, Profile */}
      <div className="flex items-center justify-between px-6">
        {/* Left: Start Recording */}
        <button className="flex items-center gap-2 text-white font-medium text-[14px]">
          <IconCameraStar />
          <span>Start Recording</span>
        </button>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center max-w-[600px] mx-auto px-4">
          <div className="flex items-center justify-between w-full max-w-[440px] h-[36px] pl-3 pr-1.5 bg-[#F4F6FF] rounded-full text-[13px] font-medium transition-all hover:bg-[#EEF2FF] cursor-text">
            <div className="flex items-center gap-2.5 text-[#6366F1]">
              <Search size={16} strokeWidth={2.5} className="opacity-80" />
              <span className="opacity-70 font-medium">Search or enter a domain...</span>
            </div>
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[#6366F1] font-semibold text-[11px] tracking-wide border border-white/40">
              <span className="text-[12px]">⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Icons & Profile */}
        <div className="flex items-center gap-4 text-white">
          <IconClipboardCheck />
          <IconCalendar />
          <div className="flex items-center ml-2 relative">
            <img src="/profile.png" alt="Profile" className="w-[36px] h-[36px] rounded-full object-cover relative z-10" />
            <div className="flex items-center justify-end bg-white/[0.95] rounded-r-[20px] h-[36px] w-[43px] -ml-[19px] pr-[8px]">
              <IconChevronBlack />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Title, Tabs, Blueprint button */}
      <div className="flex items-end justify-between pl-6 w-full relative">
        {/* Left: Company Name + Chevron */}
        <div className="flex items-center gap-1 mb-[10px] cursor-pointer">
          <h1 className="text-white text-[18px] font-semibold">
            {displayTitle}
          </h1>
          <IconChevronWhite />
        </div>

        {/* Center: Tabs */}
        <div className="flex items-end h-[30px] gap-[5px] absolute left-1/2 -translate-x-1/2 bottom-0">
          <style>{`
            @keyframes drawIconStroke {
              0% { stroke-dasharray: 100; stroke-dashoffset: 100; }
              100% { stroke-dasharray: 100; stroke-dashoffset: 0; }
            }
            .tab-btn:hover .tab-icon path,
            .tab-btn:hover .tab-icon circle,
            .tab-btn:hover .tab-icon rect,
            .tab-btn:hover .tab-icon polyline,
            .tab-btn:hover .tab-icon line,
            .tab-btn.active-tab .tab-icon path,
            .tab-btn.active-tab .tab-icon circle,
            .tab-btn.active-tab .tab-icon rect,
            .tab-btn.active-tab .tab-icon polyline,
            .tab-btn.active-tab .tab-icon line {
              stroke-dasharray: 100;
              stroke-dashoffset: 100;
              animation: drawIconStroke 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
          `}</style>
          {[
            { id: "SEO Audit", icon: <Search size={14} className="tab-icon" /> },
            { id: "Trust", icon: <ShieldCheck size={14} className="tab-icon" /> },
            { id: "Conversion", icon: <TrendingUp size={14} className="tab-icon" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn w-[170px] h-[30px] flex items-center justify-center gap-2 text-[14px] font-bold rounded-t-[20px] transition-all group ${
                activeTab === tab.id
                  ? "bg-white text-black opacity-100 active-tab"
                  : "bg-white text-black opacity-80 hover:opacity-100"
              }`}
            >
              <div className={activeTab === tab.id ? "text-blue-600" : "text-gray-500 group-hover:text-blue-500"}>
                {tab.icon}
              </div>
              {tab.id}
            </button>
          ))}
        </div>

        {/* Right: Blueprint */}
        <button className="flex items-center justify-center w-[265px] h-[35px] bg-white rounded-l-[20px] text-[14px] font-bold text-black hover:bg-gray-100 transition-all mb-[10px]">
          <span className="mr-2"><IconSopStar /></span>
          My SOP/Blueprint
        </button>
      </div>
    </header>
  );
}
