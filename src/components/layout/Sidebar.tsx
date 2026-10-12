"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Layout,
  MessageSquare,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import "@/styles/sidebar-tokens.css";

interface SidebarProps {
  className?: string;
  trialDaysRemaining?: number;
  onUpgrade?: () => void;
  onLogout?: () => Promise<void> | void;
}

interface NavRowItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href?: string;
  isActive?: boolean;
  isPlaceholder?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

function NavRowItem({
  icon: Icon,
  label,
  href,
  isActive,
  isPlaceholder,
  collapsed,
  onClick,
}: NavRowItemProps) {
  const content = (
    <div
      title={collapsed ? label : undefined}
      className={`group flex items-center gap-3 px-3 h-[38px] rounded-[8px] text-[13.5px] font-medium transition-all select-none cursor-pointer ${
        collapsed ? "justify-center px-0 w-full" : "w-full"
      } ${
        isActive
          ? "bg-white text-[#0f172a] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] font-semibold"
          : "text-[#475569] hover:text-[#0f172a] hover:bg-black/[0.03]"
      } ${isPlaceholder ? "opacity-75" : ""}`}
    >
      <Icon
        size={18}
        className={`shrink-0 transition-colors ${
          isActive
            ? "text-[#0f172a]"
            : "text-[#64748b] group-hover:text-[#0f172a]"
        }`}
      />
      {!collapsed && (
        <span className="truncate tracking-[-0.01em]">{label}</span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left cursor-pointer border-none bg-transparent p-0"
        aria-label={label}
      >
        {content}
      </button>
    );
  }

  if (isPlaceholder || !href) {
    return (
      <div data-status="placeholder" className="w-full">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className="w-full block" aria-current={isActive ? "page" : undefined}>
      {content}
    </Link>
  );
}

export function Sidebar({
  className = "",
  trialDaysRemaining = 5,
  onUpgrade,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isAudit = pathname?.startsWith("/audit");
  const isApp = pathname?.startsWith("/app");

  const handleDefaultLogout = async () => {
    if (onLogout) {
      await onLogout();
      return;
    }
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <aside
      className={`h-full flex flex-col justify-between bg-[#f6f8fa] border-r border-[#e2e8f0]/80 transition-all duration-200 select-none z-20 ${
        collapsed ? "w-[72px] px-2.5 py-4" : "w-[240px] px-3.5 py-4"
      } ${className}`}
      aria-label="Application Sidebar"
    >
      {/* Top Half: Brand Mark + Primary Navigation + Section Groups */}
      <div className="flex flex-col w-full min-w-0">
        {/* Brand Area */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-2.5 mb-6">
            <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
              <Image
                src="/prosflow-icon.svg"
                alt="Prosflow"
                width={30}
                height={30}
                className="w-[30px] h-[30px] object-contain"
                priority
              />
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="p-1.5 rounded-[6px] text-[#64748b] hover:text-[#0f172a] hover:bg-black/[0.04] transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1 mb-6 h-9">
            <div className="flex items-center min-w-0">
              <Image
                src="/prosflow-logo.svg"
                alt="Prosflow"
                width={116}
                height={30}
                className="h-[28px] w-auto object-contain"
                priority
              />
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-[6px] text-[#64748b] hover:text-[#0f172a] hover:bg-black/[0.04] transition-colors cursor-pointer shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        )}

        {/* Primary Nav List */}
        <nav className="flex flex-col gap-1 w-full" aria-label="Main Navigation">
          <NavRowItem
            icon={BarChart3}
            label="Site Audit"
            href="/audit"
            isActive={isAudit}
            collapsed={collapsed}
          />
          <NavRowItem
            icon={Layout}
            label="Website"
            href="/app"
            isActive={isApp}
            collapsed={collapsed}
          />
          <NavRowItem
            icon={MessageSquare}
            label="Follow-ups"
            isPlaceholder
            collapsed={collapsed}
          />
          <NavRowItem
            icon={Users}
            label="Leads"
            href="#"
            collapsed={collapsed}
          />
        </nav>

        {/* "Client Closed" Grouping */}
        <div className="mt-5 w-full">
          {!collapsed ? (
            <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
              Client Closed
            </div>
          ) : (
            <div className="w-8 h-[1px] bg-[#e2e8f0] mx-auto my-2" />
          )}

          <div className="flex flex-col gap-1 w-full">
            <NavRowItem
              icon={BookOpen}
              label="Onboarding"
              isPlaceholder
              collapsed={collapsed}
            />
          </div>
        </div>
      </div>

      {/* Bottom Half: Trial Card + Settings + Logout */}
      <div className="flex flex-col gap-3 w-full pt-3">
        {/* Trial Card */}
        {!collapsed ? (
          <div className="w-full p-3.5 bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-1.5 text-[#0f172a] font-bold text-[12.5px]">
              <Sun size={15} className="text-amber-500 fill-amber-500/20 shrink-0" />
              <span>Trial Left {trialDaysRemaining} days</span>
            </div>
            <p className="text-[10.5px] text-[#64748b] leading-snug mt-1 mb-2.5">
              AI-powered solutions, tag insights, and tools that save hours
            </p>
            <button
              type="button"
              onClick={onUpgrade}
              className="w-full py-1.5 px-3 rounded-[8px] bg-gradient-to-r from-[#e5a824] to-[#d99706] hover:from-[#d99706] hover:to-[#c58404] text-white font-bold text-[11.5px] transition-all shadow-xs cursor-pointer flex items-center justify-center tracking-wide"
            >
              Upgrade to Pro
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onUpgrade}
            title={`Trial Left ${trialDaysRemaining} days - Upgrade to Pro`}
            className="w-10 h-10 mx-auto rounded-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Sun size={18} className="fill-amber-500/30" />
          </button>
        )}

        {/* Settings & Logout Controls */}
        <div className="flex flex-col gap-0.5 w-full border-t border-[#e2e8f0]/80 pt-2">
          <NavRowItem
            icon={Settings}
            label="Settings"
            isPlaceholder
            collapsed={collapsed}
          />
          <NavRowItem
            icon={LogOut}
            label="Logout"
            collapsed={collapsed}
            onClick={handleDefaultLogout}
          />
        </div>
      </div>
    </aside>
  );
}
