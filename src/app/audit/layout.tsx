import React from "react";
import { BarChart3, Globe, Users } from "lucide-react";

/**
 * Audit Layout — Left sidebar (persistent across all audit segments)
 *
 * Per spec "Frontend Structure Guide":
 * - Brand/logo mark at top
 * - Primary nav: "Website Audit" (active), "Website Demo", "Approached"
 */
export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0e1a] text-slate-50 font-body">
      {/* ——— Left Sidebar (persistent) ——— */}
      <aside className="hidden md:flex flex-col w-[240px] min-h-screen border-r border-white/[0.06] bg-[#0c1022]">
        {/* Brand Mark */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-sm tracking-tight">P</span>
          </div>
          <span className="font-nav text-[17px] tracking-tight text-white/90">
            Proseflow
          </span>
        </div>

        {/* Primary Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          <a
            href="/audit"
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10 transition-all"
          >
            <BarChart3 size={18} />
            Website Audit
          </a>
          <a
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <Globe size={18} />
            Website Demo
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <Users size={18} />
            Approached
          </a>
        </nav>

        {/* Bottom accent line */}
        <div className="h-[2px] bg-gradient-to-r from-blue-500/40 via-indigo-500/20 to-transparent" />
      </aside>

      {/* ——— Main Area ——— */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}
