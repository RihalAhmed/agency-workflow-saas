import React from "react";
import { ProsflowStar } from "@/components/brand/ProsflowStar";

interface AuditBlueprintProps {
  domain: string;
}

const CATEGORIES = [
  { label: "On-Page SEO", desc: "Analyzing title tags, headers, and keyword density." },
  { label: "Performance", desc: "Evaluating Core Web Vitals and loading speed." },
  { label: "Usability", desc: "Checking mobile responsiveness and tap targets." },
  { label: "Local SEO", desc: "Checking schema and NAP consistency." },
  { label: "Technology", desc: "Detecting frameworks, server security, and DNS." },
  { label: "GEO", desc: "AI search readiness and semantic structure." },
];

export function AuditBlueprint({ domain }: AuditBlueprintProps) {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-[30px] mx-1 mb-1 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference) {
          @keyframes armLight {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          #arm-1 { animation: armLight 1.5s infinite; animation-delay: 0s; }
          #arm-2 { animation: armLight 1.5s infinite; animation-delay: 0.25s; }
          #arm-3 { animation: armLight 1.5s infinite; animation-delay: 0.5s; }
          #arm-4 { animation: armLight 1.5s infinite; animation-delay: 0.75s; }
          #arm-5 { animation: armLight 1.5s infinite; animation-delay: 1.0s; }
          #arm-6 { animation: armLight 1.5s infinite; animation-delay: 1.25s; }

          @keyframes starPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .star-pulse {
            animation: starPulse 2s infinite ease-in-out;
          }

          @keyframes ringGlow {
            0%, 100% { border-color: transparent; background: rgba(255,255,255,0.3); box-shadow: none; }
            50% { border-color: rgba(59, 130, 246, 0.3); background: rgba(255,255,255,0.9); box-shadow: 0 0 15px rgba(59,130,246,0.15); }
          }
          .ring-glow-1 { animation: ringGlow 2.1s infinite; animation-delay: 0s; }
          .ring-glow-2 { animation: ringGlow 2.1s infinite; animation-delay: 0.3s; }
          .ring-glow-3 { animation: ringGlow 2.1s infinite; animation-delay: 0.6s; }
          .ring-glow-4 { animation: ringGlow 2.1s infinite; animation-delay: 0.9s; }
          .ring-glow-5 { animation: ringGlow 2.1s infinite; animation-delay: 1.2s; }
          .ring-glow-6 { animation: ringGlow 2.1s infinite; animation-delay: 1.5s; }
          .ring-glow-7 { animation: ringGlow 2.1s infinite; animation-delay: 1.8s; }

          @keyframes phaseGlow {
            0%, 100% { border-color: rgba(226, 232, 240, 1); background: white; }
            50% { border-color: rgba(99, 102, 241, 0.4); background: rgba(99, 102, 241, 0.02); }
          }
          .phase-glow-1 { animation: phaseGlow 3s infinite; animation-delay: 0s; }
          .phase-glow-2 { animation: phaseGlow 3s infinite; animation-delay: 1s; }
          .phase-glow-3 { animation: phaseGlow 3s infinite; animation-delay: 2s; }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .shimmer-bg {
            position: relative;
            overflow: hidden;
            background: #F1F5F9;
          }
          .shimmer-bg::after {
            content: '';
            position: absolute;
            top: 0; right: 0; bottom: 0; left: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.6) 20%, rgba(255, 255, 255, 0.6) 60%, rgba(255, 255, 255, 0) 100%);
            animation: shimmer 2s infinite;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer-bg { background: #E2E8F0; }
          .ring-glow-1, .ring-glow-2, .ring-glow-3, .ring-glow-4, .ring-glow-5, .ring-glow-6, .ring-glow-7 {
             border-color: rgba(226, 232, 240, 1); background: white;
          }
          .phase-glow-1, .phase-glow-2, .phase-glow-3 {
             border-color: rgba(226, 232, 240, 1); background: white;
          }
        }
      `}} />

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-[1549px] mx-auto px-10 py-10 space-y-12">
          
          {/* 1. Hero Card */}
          <div className="relative w-full rounded-[24px] bg-[#F7F9FF] overflow-hidden flex flex-col xl:flex-row items-center justify-between p-8 xl:p-10 gap-8 shadow-sm group/header">
            {/* Abstract background styling */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#E8EEFF] to-transparent" />
              <div className="absolute -right-[5%] -top-[20%] w-[40%] h-[150%] bg-gradient-to-b from-[#D4C6FF]/30 via-[#A4B5FF]/20 to-transparent rotate-12 blur-3xl rounded-full" />
              <div className="absolute -right-[2%] top-[10%] w-[35%] h-[120%] bg-gradient-to-tr from-[#A6C0FF]/30 to-[#C8B6FF]/30 -rotate-12 blur-[100px] rounded-full" />
            </div>

            {/* Left: Text Content */}
            <div className="flex flex-col max-w-md xl:max-w-[420px] relative z-10 shrink-0 text-center xl:text-left">
              <h1 className="text-[28px] xl:text-[36px] font-bold text-[#111630] mb-3 leading-tight tracking-tight">
                Building your audit for <span className="text-blue-600 inline-block max-w-full align-bottom truncate" title={domain}>{domain}</span>
              </h1>
              <p className="text-[14px] text-[#64748B] leading-relaxed font-medium">
                Usually 30-60 seconds. We're testing performance, SEO, AI-readiness, and rendering visual screenshots.
              </p>
            </div>

            {/* Center: Main Ring */}
            <div className="flex items-center justify-center relative z-10 flex-1 my-8 xl:my-0">
              <div className="relative w-[130px] h-[130px] flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite] motion-reduce:animate-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(241, 245, 249, 1)" strokeWidth="12" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gradient)" strokeWidth="12" strokeDasharray="60 200" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <ProsflowStar className="w-12 h-12 text-blue-600 star-pulse" />
              </div>
            </div>

            {/* Right: Small Rings */}
            <div className="grid grid-cols-4 md:flex md:items-center gap-5 relative z-10 shrink-0">
              {CATEGORIES.map((cat, i) => (
                <div key={cat.label} className="flex flex-col items-center">
                  <div className={`w-[60px] h-[60px] xl:w-[75px] xl:h-[75px] rounded-full border-[3px] xl:border-4 flex items-center justify-center ring-glow-${i + 1}`}>
                    <span className="text-lg xl:text-xl text-slate-300 font-bold">?</span>
                  </div>
                  <span className="text-[10px] xl:text-[11px] text-slate-400 font-medium text-center mt-3 max-w-[80px] leading-tight">
                    {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Phase Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="phase-glow-1 p-6 rounded-2xl border transition-colors flex flex-col gap-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</div>
                Collect
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                6 parallel sources including raw code, robots/sitemap/llms.txt, Google PageSpeed APIs, DNS/security records, and a live headless browser.
              </p>
            </div>
            <div className="phase-glow-2 p-6 rounded-2xl border transition-colors flex flex-col gap-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</div>
                Analyze
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Processing the data through 7 distinct SEO and Usability modules to discover hidden technical debt and conversion blockers.
              </p>
            </div>
            <div className="phase-glow-3 p-6 rounded-2xl border transition-colors flex flex-col gap-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">3</div>
                Deliver
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Calculating overall grade and prioritizing actionable High, Medium, and Low fixes for immediate deployment.
              </p>
            </div>
          </div>

          {/* 3. Module Rows */}
          <div className="flex flex-col lg:flex-row gap-8 pb-10">
            <div className="flex-1 space-y-4">
              {CATEGORIES.map(cat => (
                <div key={cat.label} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="w-10 h-10 rounded-full shimmer-bg shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-slate-800 text-[15px]">{cat.label}</div>
                      <div className="h-4 w-16 shimmer-bg rounded-full" />
                    </div>
                    <div className="text-sm text-slate-500 mb-3">{cat.desc}</div>
                    <div className="space-y-2">
                      <div className="h-2 w-[80%] shimmer-bg rounded-full" />
                      <div className="h-2 w-[60%] shimmer-bg rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column / Agency Strip */}
            <div className="w-full lg:w-[450px] shrink-0 sticky top-4 h-fit">
              <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
                <h3 className="text-[20px] font-bold text-[#111630] mb-6">Actionable Deliverables</h3>
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl shimmer-bg shrink-0" />
                      <div className="flex-1 pt-1 space-y-2.5">
                        <div className="h-3.5 w-[70%] shimmer-bg rounded-full" />
                        <div className="h-2.5 w-full shimmer-bg rounded-full" />
                        <div className="h-2.5 w-[40%] shimmer-bg rounded-full" />
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-xl text-center">
                    <div className="text-blue-700 font-semibold mb-1">Audit Blueprint Engine</div>
                    <p className="text-[13px] text-blue-600/80 font-medium">
                      Client-ready insights, white-label reports, and prioritized fixes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
