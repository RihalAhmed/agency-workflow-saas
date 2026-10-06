import React from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto relative bg-slate-950">
        {children}
      </div>
    </AppShell>
  );
}
