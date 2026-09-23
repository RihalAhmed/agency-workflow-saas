import React from "react";
import { PrimitiveReviewStars } from "./ReviewStars";

export interface PrimitiveTestimonialProps {
  /** Reviewer name */
  name: string;
  /** Star rating (1-5, supports halves e.g. 4.5) */
  rating?: number;
  /** Review quote text */
  quote: string;
  /** Optional reviewer role/title */
  role?: string;
  /** Additional Tailwind classes */
  className?: string;
}

/**
 * PrimitiveTestimonial — star rating + quote + attribution.
 * Used in review/testimonial sections across designs.
 */
export function PrimitiveTestimonial({
  name,
  rating = 5,
  quote,
  role,
  className = "",
}: PrimitiveTestimonialProps) {
  return (
    <div
      className={`bg-surface-alt rounded-[10px] border border-border p-5 sm:p-6 ${className}`}
    >
      <PrimitiveReviewStars rating={rating} className="mb-3" />
      <blockquote className="text-sm sm:text-base text-ink leading-relaxed mb-4 font-body">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-ink">{name}</span>
        {role && (
          <span className="text-xs text-ink-muted">&middot; {role}</span>
        )}
      </div>
    </div>
  );
}
