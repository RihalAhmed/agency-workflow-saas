"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  BarChart3, 
  Layout, 
  MessageSquare, 
  Settings, 
  Users, 
  BookOpen, 
  Search, 
  Video,
  LogOut
} from "lucide-react";

const NavItem = ({ icon: Icon, label, isActive, href, isPlaceholder }: any) => {
  const content = (
    <div 
      className={`w-full h-[76px] flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
        isActive ? "bg-[#3d21f8]" : "hover:bg-white/10"
      } ${isPlaceholder ? "opacity-50" : ""}`}
    >
      <Icon size={24} className="text-white" />
      <span className="text-white text-[13px] font-medium tracking-tight">
        {label}
      </span>
    </div>
  );
  
  if (isPlaceholder) {
    return <div data-status="placeholder" className="w-full">{content}</div>;
  }
  return <Link href={href} className="w-full">{content}</Link>;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAudit = pathname?.startsWith("/audit");
  const isApp = pathname?.startsWith("/app");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-[#f5f6fa] text-slate-900 font-body overflow-hidden">
      {/* Figma Pixel-Perfect Floating Sidebar */}
      <aside className="w-[95px] flex-shrink-0 bg-gradient-to-b from-[#533afd] to-[#312297] flex flex-col items-center py-8 rounded-[25px] m-[12px] relative z-10 shadow-xl overflow-hidden">
        {/* Brand Mark */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-[53px] h-[49px]">
            <Image src="/logo-icon.svg" alt="Prosflow Icon" width={53} height={49} className="w-full h-full" />
          </div>
          <Image src="/logo-text.svg" alt="Prosflow" width={51} height={11} className="mt-2" />
        </div>

        {/* Separator */}
        <div className="w-5 h-[1px] bg-white/20 mb-4" />

        {/* Sidebar Nav */}
        <nav className="flex flex-col w-full flex-1 gap-2 mt-2">
          <NavItem icon={BarChart3} label="Site Audit" isActive={isAudit} href="/audit" />
          <NavItem icon={Layout} label="Website" isActive={isApp} href="/app" />
          <NavItem icon={MessageSquare} label="Follow-ups" isPlaceholder />
          <NavItem icon={BookOpen} label="Onboarding" isPlaceholder />
        </nav>

        {/* Bottom Nav */}
        <div className="flex flex-col w-full gap-4 pb-2">
          {/* Leads Floating Action */}
          <Link href="#" className="w-full flex justify-center hover:opacity-80 transition-opacity">
            <div className="w-[66px] h-[66px] rounded-full bg-[#533afd] border-[2px] border-white/10 flex flex-col items-center justify-center shadow-lg">
              <Users size={22} className="text-white mb-0.5" />
              <span className="text-white text-[9px] font-bold tracking-wider uppercase">Leads</span>
            </div>
          </Link>
          
          <NavItem icon={Settings} label="Settings" isPlaceholder />
          <button 
            onClick={handleLogout}
            className="w-full h-[76px] flex flex-col items-center justify-center gap-2 transition-colors hover:bg-white/10 text-white cursor-pointer opacity-80 hover:opacity-100"
          >
            <LogOut size={24} className="text-white" />
            <span className="text-[13px] font-medium tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

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
