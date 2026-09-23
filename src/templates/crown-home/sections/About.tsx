import React from "react";
import Image from "next/image";
import { PrimitiveButton, PrimitiveCard } from "@/primitives";

export interface AboutProps {
  businessName: string;
  city?: string;
  headline?: string;
  badgeLabel?: string;
  imagePath?: string;
  paragraphs?: string[];
  ctaText?: string;
}

export function About({
  businessName,
  city = "Jacksonville",
  headline,
  badgeLabel = "About The Company",
  imagePath = "/assets/about-house.jpg",
  paragraphs,
  ctaText = "LEARN MORE",
}: AboutProps) {
  const displayHeadline =
    headline || `FAMILY-OWNED PROTECTION FOR ${city.toUpperCase()} HOMES.`;

  const defaultParagraphs = [
    `${businessName} has been protecting ${city} homes since 1979 — long before 'pest control' meant anything more than a family showing up, doing the job right, and treating your home like it was their own. Four decades later, that hasn't changed. We're still family-owned. We still send real technicians, not scripts. And we still believe a home should feel like a home — not a battleground.`,
    `Every treatment we run comes with a simple promise: if pests come back between visits, so do we, free of charge. No fine print, no upsells, no excuses. Just honest work from a team that's been earning ${city}'s trust one home at a time for over 45 years.`,
    `That's what wearing the crown means to us — not standing above our customers, but standing behind them.`,
  ];

  const bodyParagraphs = paragraphs || defaultParagraphs;

  return (
    <section id="about" className="relative w-full py-12 sm:py-16 px-3 sm:px-4 lg:px-[13px] bg-surface">
      {/* Outer wrapper: width 1486px on 1512px canvas in Figma */}
      <div className="w-full max-w-[1486px] 2xl:max-w-[1680px] mx-auto relative pt-7">
        {/* About The Company Top Tab (Figma Rectangle 55: w: 164px, h: 26px, rounded-t-[5px], no crown!) */}
        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 z-20">
          <div className="w-[164px] h-[26px] bg-brand text-brand-fg border-t border-x border-border/40 rounded-t-[5px] rounded-b-none flex items-center justify-center font-body text-[13px] sm:text-[14px] font-normal tracking-normal text-center shadow-xs">
            {badgeLabel}
          </div>
        </div>

        {/* Dark Navy Section Card — using PrimitiveCard */}
        <PrimitiveCard
          variant="brand"
          radius="lg"
          className="p-6 sm:p-10 lg:p-14 xl:p-[70px]"
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-16">
            {/* Left: House Photo (Figma Group-497 1 / Rectangle 58: w: 538px, h: 569px) */}
            <div className="w-full lg:w-[480px] xl:w-[538px] aspect-[538/569] shrink-0 rounded-[10px] overflow-hidden shadow-lg border border-border/30 relative">
              <Image
                src={imagePath}
                alt={`${businessName} residential service area`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 538px"
                priority
              />
            </div>

            {/* Right: Content (Figma: Text at x: 684, w: 744px) */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Headline (Figma: Alfa Slab One, 40px, uppercase) */}
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-[38px] xl:text-[40px] uppercase tracking-tight text-brand-fg leading-tight mb-6">
                {displayHeadline.includes(city.toUpperCase()) ? (
                  <>
                    {displayHeadline.split(city.toUpperCase())[0]}
                    <span className="text-accent">{city.toUpperCase()}</span>
                    {displayHeadline.split(city.toUpperCase())[1]}
                  </>
                ) : (
                  displayHeadline
                )}
              </h2>

              {/* Body Paragraphs (Figma: 18px text) */}
              <div className="space-y-4 text-sm sm:text-base lg:text-[17px] xl:text-[18px] font-body text-brand-fg/85 leading-relaxed mb-8">
                {bodyParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* CTA Button — using PrimitiveButton */}
              <div className="pt-2">
                <PrimitiveButton
                  href="#quote"
                  variant="accent"
                  showChevron
                  className="w-[240px] sm:w-[272px] h-[39px] sm:h-[41px] py-0 text-sm sm:text-[17px] shadow-[6px_4px_0px_var(--surface)]"
                >
                  {ctaText}
                </PrimitiveButton>
              </div>
            </div>
          </div>
        </PrimitiveCard>
      </div>
    </section>
  );
}
