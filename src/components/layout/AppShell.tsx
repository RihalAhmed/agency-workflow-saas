"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Video } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAudit = pathname?.startsWith("/audit");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-[#f5f6fa] text-slate-900 font-body overflow-hidden">
      {/* Redesigned Global Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden m-[12px] ml-0 rounded-[25px] shadow-sm border border-gray-100 ${isAudit ? 'bg-transparent border-none' : 'bg-[#ffffff]'}`}>
        {/* Global Top Bar (Figma Light Theme) */}
        {!isAudit && (
          <header className="h-16 bg-[#ffffff] flex items-center justify-between px-8 shrink-0 border-b border-gray-100">
            {/* Left side (Search) */}
            <div className="flex-1 max-w-[352px]">
              <div className="flex items-center justify-between h-[33px] px-3 bg-[#f8f9fa] border border-gray-200 rounded-md shadow-sm text-[14px] font-medium">
                <div className="flex items-center gap-2 text-[#8c8c8c99]">
                  <Search size={18} />
                  <span>Search</span>
                </div>
                <span className="text-[#8c8c8c99] font-normal bg-white px-1.5 py-0.5 rounded text-[11px] shadow-sm border border-gray-100">Ctrl+K</span>
              </div>
            </div>
            
            {/* Right side (Controls & Profile) */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-[#533afd] hover:bg-[#432ae3] text-white px-4 py-2 rounded-lg text-[14px] font-medium transition-colors shadow-md shadow-[#533afd]/20">
                <Video size={16} />
                Start Recording
              </button>
              <div className="flex items-center gap-3">
                {/* Profile picture placeholder */}
                <div className="w-[36px] h-[36px] rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 border-2 border-white shadow-sm" />
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
