import React from "react";
import { ChevronRight } from "lucide-react";

export interface PrimitiveButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  /** Visual variant */
  variant?: "accent" | "brand";
  /** Show a chevron arrow icon on the right */
  showChevron?: boolean;
  /** Additional Tailwind classes */
  className?: string;
  /** HTML type for <button> usage */
  type?: "button" | "submit";
}

/**
 * PrimitiveButton — CTA button used across all designs.
 * Features the signature solid shadow offset and hover animation.
 * Renders as <a> when href is provided, <button> otherwise.
 */
export function PrimitiveButton({
  children,
  href,
  onClick,
  variant = "accent",
  showChevron = false,
  className = "",
  type = "button",
}: PrimitiveButtonProps) {
  const variantClasses =
    variant === "accent"
      ? "bg-accent text-accent-fg shadow-[4px_4px_0px_var(--surface)]"
      : "bg-brand text-brand-fg shadow-[4px_4px_0px_var(--accent)]";

  const baseClasses = `
    group relative inline-flex items-center justify-center gap-3
    font-nav text-sm sm:text-base uppercase tracking-wider font-semibold
    px-6 py-3 rounded-[5px]
    hover:translate-x-[1px] hover:translate-y-[1px]
    active:translate-x-[2px] active:translate-y-[2px]
    transition-all cursor-pointer whitespace-nowrap
    ${variantClasses} ${className}
  `.trim();

  const chevronIcon = showChevron ? (
    <span className="w-6 h-6 rounded bg-surface text-ink flex items-center justify-center transition-transform group-hover:translate-x-0.5 shrink-0">
      <ChevronRight className="w-4 h-4 stroke-[3]" aria-hidden="true" />
    </span>
  ) : null;

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick}>
        <span>{children}</span>
        {chevronIcon}
      </a>
    );
  }

  return (
    <button type={type} className={baseClasses} onClick={onClick}>
      <span>{children}</span>
      {chevronIcon}
    </button>
  );
}
