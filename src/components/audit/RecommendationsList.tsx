import React, { useEffect, useState } from "react";
import { 
  Lightbulb, FileText, MessageSquare, ImageIcon, Zap, Link, ChevronRight,
  Type, Heading, EyeOff, Bot, Lock, ListTree, Search, Map, FileCode,
  Globe, Activity, FileJson, Globe2, Server, HardDrive, Shrink, Bug,
  Monitor, Mail, Layout, Share2, Phone, MapPin, ShieldAlert, CheckCircle2
} from "lucide-react";

export function RecommendationsList({ recommendations }: { recommendations: any[] }) {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash);
    const handleHash = () => setActiveHash(window.location.hash);
    const handleHighlight = (e: any) => setActiveHash(`#check-${e.detail.checkKey}`);
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("highlight-check", handleHighlight);
    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("highlight-check", handleHighlight);
    };
  }, []);

  if (recommendations.length === 0) {
    return (
      <div className="w-full max-h-full min-h-[400px] flex flex-col bg-white border border-slate-200 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-[12px] bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] shrink-0">
            <Lightbulb size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-[20px] font-bold text-[#111630]">Recommendations</h3>
            <p className="text-[12px] text-[#64748B]">Audit improvement actions</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="text-[15px] font-semibold text-slate-800">No issues found</h4>
          <p className="text-[13px] text-slate-500 max-w-[240px] mt-1">
            All checks passed for this category. No critical improvements needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-h-full min-h-[400px] flex flex-col bg-white border border-slate-200 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="flex justify-between items-center p-6 pb-4 bg-transparent rounded-t-[20px] z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[12px] bg-[#EEF2FF] flex items-center justify-center text-[#6366F1] shrink-0">
            <Lightbulb size={22} strokeWidth={1.5} />
          </div>
          <h3 className="text-[20px] font-bold text-[#111630]">Recommendations</h3>
        </div>
        
        <div className="text-[#8b8383] text-[13px] font-normal whitespace-nowrap">
          {recommendations.length} recommendations
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#E2E8F0] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-[#CBD5E1]">
        <div className="flex flex-col gap-3">
        {recommendations.map((rec, i) => {
          let badgeClass = "bg-[#EEF2FF] text-[#6366F1]";
          
          if (rec.priority === "High") {
            badgeClass = "bg-[#FEF2F2] text-[#EF4444]";
          } else if (rec.priority === "Medium") {
            badgeClass = "bg-[#FFFBEB] text-[#F59E0B]";
          }

          const getIcon = (key: string) => {
            switch (key) {
              case 'title_tag': return Type;
              case 'meta_description': return MessageSquare;
              case 'h1_usage': return Heading;
              case 'noindex_meta': 
              case 'noindex_header': return EyeOff;
              case 'robots_blocking': return Bot;
              case 'ssl_enabled': 
              case 'https_redirect': return Lock;
              case 'canonical':
              case 'canonical_tag': return Link;
              case 'headings':
              case 'heading_structure': return ListTree;
              case 'keyword_consistency': return Search;
              case 'content_amount': return FileText;
              case 'image_alt': return ImageIcon;
              case 'xml_sitemap': return Map;
              case 'robots_txt': return FileCode;
              case 'html_lang': return Globe;
              case 'analytics': return Activity;
              case 'schema':
              case 'structured_data': return FileJson;
              case 'hreflang': return Globe2;
              case 'serp_preview': return Search;
              case 'pagespeed_insights':
              case 'performance_score':
              case 'render_blocking':
              case 'lcp':
              case 'fcp':
              case 'tti':
              case 'cls':
              case 'tbt':
              case 'speed_index': return Zap;
              case 'server_response_time':
              case 'browser_caching': return Server;
              case 'page_size': return HardDrive;
              case 'minification':
              case 'text_compression': return Shrink;
              case 'http2': return Globe;
              case 'js_errors': return Bug;
              case 'deprecated_html':
              case 'inline_styles': return FileCode;
              case 'mobile_viewport': return Monitor;
              case 'favicon':
              case 'image_optimization': return ImageIcon;
              case 'email_privacy': return Mail;
              case 'flash_usage':
              case 'iframes': return Layout;
              case 'device_rendering': return Monitor;
              case 'desktop_performance': return Zap;
              case 'social_links':
              case 'open_graph':
              case 'twitter_cards':
              case 'facebook_pixel': return Share2;
              case 'nap_phone':
              case 'nap_name':
              case 'nap_address':
              case 'address_phone': return Phone;
              case 'local_schema':
              case 'local_business_schema':
              case 'google_business_profile': return MapPin;
              case 'dmarc':
              case 'spf': return ShieldAlert;
              case 'charset': return Type;
              case 'llm_content_analysis': return Bot;
              case 'identity_schema': return FileJson;
              case 'rendered_content_ratio': return FileText;
              case 'llms_txt': return FileCode;
              case 'ai_crawlers_blocked': return Bot;
              case 'links': return Link;
              default: return FileText;
            }
          };

          const Icon = getIcon(rec.checkKey || '');

          const isActive = rec.checkKey && activeHash === `#check-${rec.checkKey}`;
          const itemClass = isActive 
            ? "flex items-start gap-3 bg-[#EEF2FF] border border-[#6366F1] rounded-[16px] px-4 py-3 shadow-sm transition-all cursor-pointer group"
            : "flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-[16px] px-4 py-3 hover:shadow-sm hover:border-[#CBD5E1] transition-all cursor-pointer group";

          return (
            <div 
              key={i} 
              onClick={() => {
                if (rec.checkKey) {
                  window.dispatchEvent(new CustomEvent('open-category', { detail: { category: rec.category } }));
                  setTimeout(() => {
                    window.location.hash = `check-${rec.checkKey}`;
                    window.dispatchEvent(new CustomEvent('highlight-check', { detail: { checkKey: rec.checkKey } }));
                  }, 50);
                }
              }}
              className={itemClass}
            >
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-[#F8FAFC] text-[#6366F1] group-hover:bg-[#EEF2FF] transition-colors border border-[#F1F5F9] ${isActive ? 'mt-0.5' : ''}`}>
                <Icon size={18} strokeWidth={1.5} />
              </div>
              
              <div className="flex-1 min-w-0 pr-1">
                <h4 className={`text-[14px] font-semibold text-[#1E293B] ${isActive ? '' : 'truncate'}`}>
                  {rec.title}
                </h4>
                <p className={`text-[13px] text-[#64748B] mt-0.5 ${isActive ? 'leading-relaxed' : 'line-clamp-1'}`}>
                  {rec.description || rec.detail || "Review this recommendation to improve your site's SEO performance."}
                </p>
              </div>

              <div className={`flex items-center gap-2 shrink-0 ${isActive ? 'mt-0.5' : ''}`}>
                <div className={`text-[12px] font-medium px-3 py-1 rounded-full ${badgeClass}`}>
                  {rec.priority || "Low"}
                </div>
                <ChevronRight className={`transition-all duration-300 ${isActive ? 'text-[#6366F1] rotate-90' : 'text-[#CBD5E1] group-hover:text-[#6366F1]'}`} size={16} strokeWidth={2} />
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

