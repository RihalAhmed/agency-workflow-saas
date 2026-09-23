import React from "react";
import { PrimitiveTrustBadge } from "@/primitives";

export interface ReviewLogosProps {
  trustBadges?: string[];
}

export function ReviewLogos({
  trustBadges = ["google", "facebook", "bbb", "home-advisor"],
}: ReviewLogosProps) {
  return (
    <section className="w-full py-12 px-4 sm:px-6 bg-surfaceAlt border-y border-border/50">
      <div className="max-w-[1200px] w-full mx-auto flex items-center justify-center opacity-90">
        <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16 md:gap-24">
          {trustBadges.map((badgeId) => (
            <PrimitiveTrustBadge key={badgeId} id={badgeId} />
          ))}
        </div>
      </div>
    </section>
  );
}
