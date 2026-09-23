import React from "react";

export interface PrimitiveCardProps {
  children: React.ReactNode;
  /** Background variant */
  variant?: "surface" | "brand";
  /** Corner radius size */
  radius?: "sm" | "md" | "lg";
  /** Whether to show border */
  bordered?: boolean;
  /** Whether to show shadow */
  shadow?: boolean;
  /** Additional Tailwind classes */
  className?: string;
}

/**
 * PrimitiveCard — rounded container with border, shadow, and
 * brand/surface background variants. Used for form containers,
 * about cards, and content panels across designs.
 */
export function PrimitiveCard({
  children,
  variant = "surface",
  radius = "lg",
  bordered = true,
  shadow = true,
  className = "",
}: PrimitiveCardProps) {
  const bgClasses =
    variant === "brand"
      ? "bg-brand text-brand-fg"
      : "bg-surface text-ink";

  const radiusClasses = {
    sm: "rounded-[5px]",
    md: "rounded-[10px]",
    lg: "rounded-[20px]",
  }[radius];

  const borderClass = bordered ? "border border-border/30" : "";
  const shadowClass = shadow ? "shadow-2xl" : "";

  return (
    <div
      className={`${bgClasses} ${radiusClasses} ${borderClass} ${shadowClass} ${className}`}
    >
      {children}
    </div>
  );
}
