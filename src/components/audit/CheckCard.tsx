import React, { useState } from "react";
import { CheckCircle, AlertTriangle, AlertCircle, ChevronRight, Info } from "lucide-react";
import { explain, fallbackTips } from "../../lib/audit/explain";

export function CheckCard({
  title,
  score,
  data,
  evidence,
  detail,
  checkKey,
  index,
}: {
  title: string;
  score: number;
  data: any;
  evidence?: any;
  detail?: string;
  checkKey: string;
  index?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  
  React.useEffect(() => {
    const checkHash = (keyToCheck?: string) => {
      const active = keyToCheck ? keyToCheck === checkKey : window.location.hash === `#check-${checkKey}`;
      setIsActive(active);
      if (active) {
        setIsOpen(true);
        // Fire scroll early if already open
        setTimeout(() => {
          document.getElementById(`check-${checkKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        // Fire scroll after the parent module's 500ms CSS height transition completes
        setTimeout(() => {
          document.getElementById(`check-${checkKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 550);
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

  // Skip skipped checks entirely
  if (score === -1) return null;

  const isPass = score === 2;
  const isWarning = score === 1;
  const isFail = score === 0;
  const isInfo = score === 3;

  let Icon = CheckCircle;
  let iconColor = "text-[#22C55E]";
  let badgeClass = "bg-[#F0FDF4] text-[#16A34A]";
  let badgeText = "Good";

  if (isWarning) {
    Icon = AlertTriangle;
    iconColor = "text-[#F59E0B]";
    badgeClass = "bg-[#FFFBEB] text-[#D97706]";
    badgeText = "Needs improvement";
  } else if (isFail) {
    Icon = AlertCircle;
    iconColor = "text-[#EF4444]";
    badgeClass = "bg-[#FEF2F2] text-[#DC2626]";
    badgeText = "Critical";
  } else if (isInfo) {
    Icon = Info;
    iconColor = "text-[#94A3B8]";
    badgeClass = "bg-[#F8FAFC] text-[#64748B]";
    badgeText = "Couldn't verify";
  }

  // Combine some specific text data if it exists
  let descriptionText = detail;
  if (data?.text && !detail) {
    descriptionText = data.text;
  }
  
  if (checkKey === "meta_description" || checkKey === "title_tag") {
      const textData = data?.text || "";
      if (!descriptionText) descriptionText = `Length: ${textData.length}. ${textData}`;
  }

  const checkObj = {
    checkKey,
    title,
    score,
    data,
    evidence,
    status: isFail ? "fail" : isWarning ? "warning" : isPass ? "pass" : "info"
  };
  const generatedExplanation = explain(checkObj);
  const fallback = fallbackTips[checkKey];
  
  // Custom structured data from audit checks
  const hasStructuredData = data?.whatWeFound || data?.whyItsHappening || data?.impactAndFix;
  
  // If the item is "Good" (passed), we do not need to show how to fix it
  // If it's a warning or fail, we MUST show a dropdown
  let hasExplanation = false;
  if (isPass) {
    hasExplanation = false;
  } else if (isWarning || isFail) {
    hasExplanation = true;
  } else {
    hasExplanation = !!generatedExplanation || !!fallback || !!hasStructuredData;
  }

  const renderExplanation = (text: string) => {
    return text.split('\n\n').map((block, i) => {
      const parts = block.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="mb-2 last:mb-0">
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-[#1E293B] font-semibold">{part}</strong> : part)}
        </p>
      );
    });
  };

  const cardClass = isActive
    ? "bg-white border-2 border-[#6366F1] shadow-md rounded-[16px] transition-all overflow-hidden group"
    : "bg-white border border-[#E2E8F0] rounded-[16px] hover:shadow-sm hover:border-[#CBD5E1] transition-all overflow-hidden group";

  return (
    <div id={`check-${checkKey}`} className={cardClass}>
      <div 
        className={`flex items-center gap-4 px-4 py-3 ${hasExplanation ? 'cursor-pointer' : ''}`}
        onClick={() => hasExplanation && setIsOpen(!isOpen)}
        aria-expanded={hasExplanation ? isOpen : undefined}
        role={hasExplanation ? "button" : undefined}
        tabIndex={hasExplanation ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasExplanation && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        {/* Status Icon */}
        <div className={`w-[26px] h-[26px] shrink-0 rounded-full flex items-center justify-center bg-white ${iconColor}`}>
          <Icon size={24} className="fill-current text-white stroke-2" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-[14px] font-medium text-[#1E293B] flex gap-2 items-baseline">
            {index && <span className="text-[#94A3B8] text-[13px] font-semibold">{index}.</span>}
            <span className="truncate">{title}</span>
          </h4>
          <p className="text-[13px] text-[#64748B] mt-0.5 line-clamp-1">{descriptionText || "Review this SEO factor."}</p>
        </div>
        
        {/* Badge & Chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`text-[12px] font-medium px-3 py-1 rounded-full ${badgeClass}`}>
            {badgeText}
          </div>
          {hasExplanation && (
            <ChevronRight 
              className={`text-[#CBD5E1] group-hover:text-[#6366F1] transition-all duration-300 ${isOpen ? "rotate-90" : ""}`} 
              size={16} 
              strokeWidth={2} 
            />
          )}
        </div>
      </div>
      
      {/* Detail Panel */}
      <div 
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 border-t border-[#E2E8F0]" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-4 ml-[42px]">
            {hasStructuredData ? (
              <div className="flex flex-col gap-4">
                {data.whatWeFound && (
                  <div>
                    <h5 className="text-[12px] font-semibold text-[#1E293B] uppercase tracking-wider mb-1">What We Found</h5>
                    <p className="text-[13px] text-[#64748B] leading-relaxed">{data.whatWeFound}</p>
                  </div>
                )}
                {data.whyItsHappening && (
                  <div>
                    <h5 className="text-[12px] font-semibold text-[#1E293B] uppercase tracking-wider mb-1">Why It's Happening</h5>
                    <p className="text-[13px] text-[#64748B] leading-relaxed">{data.whyItsHappening}</p>
                  </div>
                )}
                {data.impactAndFix && (
                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[12px] p-3 mt-1">
                    <h5 className="text-[12px] font-semibold text-[#1E40AF] uppercase tracking-wider mb-1 flex items-center gap-1.5"><Info size={14}/> Impact & Fix</h5>
                    <p className="text-[13px] text-[#1E3A8A] leading-relaxed">{data.impactAndFix}</p>
                  </div>
                )}
              </div>
            ) : generatedExplanation ? (
              <div className="text-[13px] text-[#64748B]">
                {renderExplanation(generatedExplanation)}
              </div>
            ) : fallback ? (
              <div className="text-[13px] text-[#64748B]">
                {renderExplanation(fallback)}
              </div>
            ) : (isWarning || isFail) ? (
              <p className="text-[13px] text-[#64748B]">
                Please review this item and make necessary improvements according to standard SEO best practices.
              </p>
            ) : (
              <p className="text-[13px] text-[#64748B]">No further details available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

