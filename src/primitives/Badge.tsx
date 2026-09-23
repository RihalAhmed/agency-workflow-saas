import React from "react";

export interface PrimitiveBadgeProps {
  children: React.ReactNode;
  /** Visual variant */
  variant?: "accent" | "brand" | "subtle";
  /** Additional Tailwind classes */
  className?: string;
}

/**
 * PrimitiveBadge — pill-shaped label used for emergency badges,
 * trust indicators, and status tags across designs.
 */
export function PrimitiveBadge({
  children,
  variant = "accent",
  className = "",
}: PrimitiveBadgeProps) {
  const variantClasses = {
    accent: "bg-accent text-accent-fg",
    brand: "bg-brand text-brand-fg",
    subtle: "bg-surface-alt text-ink-muted border border-border",
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-[5px] text-xs font-medium leading-none whitespace-nowrap ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
}
