import React from "react";
import Image from "next/image";
import { PrimitiveTrustBadge } from "@/primitives";

export interface ReviewLogosProps {
  imagePath?: string;
  trustBadges?: string[];
}

export function ReviewLogos({
  imagePath = "/assets/review-row.png",
  trustBadges,
}: ReviewLogosProps) {
  return (
    <section className="w-full py-10 px-4 sm:px-6 bg-surface">
      <div className="max-w-[1180px] w-full mx-auto flex items-center justify-center opacity-90">
        {trustBadges && trustBadges.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 md:gap-16">
            {trustBadges.map((badgeId) => (
              <PrimitiveTrustBadge key={badgeId} id={badgeId} />
            ))}
          </div>
        ) : (
          <Image
            src={imagePath}
            alt="Customer reviews and trusted platforms"
            width={854}
            height={81}
            className="w-full max-w-[854px] h-auto object-contain drop-shadow-sm"
          />
        )}
      </div>
    </section>
  );
}
