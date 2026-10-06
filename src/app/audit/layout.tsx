import { AppShell } from "@/components/layout/AppShell";

/**
 * Audit Layout — Wraps audit pages in the global AppShell
 */
export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
