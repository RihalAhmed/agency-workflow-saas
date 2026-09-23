import React from "react";
import { Star, StarHalf } from "lucide-react";

export interface PrimitiveReviewStarsProps {
  /** Rating value (0-5, supports halves e.g. 4.5) */
  rating?: number;
  /** Star size in pixels */
  size?: number;
  /** Additional Tailwind classes */
  className?: string;
}

/**
 * PrimitiveReviewStars — displays a 1-5 star rating with half-star support.
 * Uses Lucide Star/StarHalf icons colored with the accent token.
 */
export function PrimitiveReviewStars({
  rating = 5,
  size = 16,
  className = "",
}: PrimitiveReviewStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${rating} out of 5 stars`}
      role="img"
    >
      {Array.from({ length: fullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          className="text-accent fill-accent"
          style={{ width: size, height: size }}
          aria-hidden="true"
        />
      ))}
      {hasHalf && (
        <StarHalf
          key="half"
          className="text-accent fill-accent"
          style={{ width: size, height: size }}
          aria-hidden="true"
        />
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star
          key={`empty-${i}`}
          className="text-border"
          style={{ width: size, height: size }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
