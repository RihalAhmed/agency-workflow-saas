import React from "react";
import Image from "next/image";

export interface AboutProps {
  headline?: string;
  imagePath?: string;
  subhead?: string;
  paragraph1?: string;
  paragraph2?: string;
}

export function About({
  headline = "About Us – Guardians of Your Home. Stewards of the Environment.",
  imagePath = "/assets/about-placeholder.jpg",
  subhead = "Founded 2007 · Enfield, Connecticut",
  paragraph1 = "One technician. One truck. A relentless standard for doing things right. Nukingstreet began as a sole proprietor focused on multifamily properties — and grew into a full-service pest and wildlife control company because of one simple conviction: this industry could be done better.",
  paragraph2 = "Most companies lead with chemicals, react instead of prevent, and treat customers like account numbers. We believe pest control should be targeted, proactive, health-conscious, and environmentally responsible.",
}: AboutProps) {
  return (
    <section className="w-full py-24 bg-surface relative" id="about">
      <div className="max-w-[1728px] mx-auto px-4 sm:px-6 lg:px-[51px]">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* Left: Image Container */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl z-10 border-4 border-surface bg-surfaceAlt">
              <Image
                src={imagePath}
                alt="About us"
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-8 -left-8 w-2/3 h-2/3 bg-brand rounded-[40px] z-0 opacity-20 hidden md:block" />
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center text-left">
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-ink uppercase tracking-tight leading-none mb-6">
              {headline}
            </h2>
            
            {subhead && (
              <div className="text-accent font-bold uppercase tracking-wider mb-8 text-sm md:text-base">
                {subhead}
              </div>
            )}

            <div className="space-y-6 text-inkMuted text-lg md:text-xl font-body leading-relaxed max-w-2xl">
              {paragraph1 && <p>{paragraph1}</p>}
              {paragraph2 && <p>{paragraph2}</p>}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
