import React from "react";
import Image from "next/image";
import { ShieldCheck, Crosshair, Leaf, Bot, ArrowRight } from "lucide-react";
import { PrimitiveButton } from "@/primitives";

export interface HeroProps {
  headlinePrefix?: string;
  headlineHighlight?: string;
  headlineSuffix?: string;
  ctaText?: string;
  backgroundImageUrl?: string;
  ownerImageUrl?: string;
  ownerName?: string;
  ownerTitle?: string;
  aiBadgeTitle?: string;
  aiBadgeDesc?: string;
  badges?: Array<{ title: string; desc?: string }>;
}

export function Hero({
  headlinePrefix = "Got Pests?",
  headlineHighlight = "Nuke 'Em.",
  headlineSuffix = "The Smart Way.",
  ctaText = "Get your Quote!",
  backgroundImageUrl = "/assets/hero-bg.jpg",
  ownerImageUrl = "/assets/owner-placeholder.jpg",
  ownerName = "Jeffrey Davis",
  ownerTitle = "Owner",
  aiBadgeTitle = "AI-Powered Remote Monitoring",
  aiBadgeDesc = "High-tech protection between visits — we're watching so you don't have to.",
  badges = [
    { title: "Eco-Certified" },
    { title: "BBB A+ Rated" },
  ],
}: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden bg-surface pb-12 pt-8 lg:pt-16 lg:pb-24">
      <div className="max-w-[1728px] mx-auto px-4 sm:px-6 lg:px-[51px]">
        
        {/* Main Hero Container */}
        <div className="relative w-full rounded-[40px] overflow-hidden bg-surfaceAlt shadow-xl">
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
            <Image
              src={backgroundImageUrl}
              alt="Pest control background"
              fill
              className="object-cover object-center opacity-70 mix-blend-multiply grayscale"
              priority
            />
            {/* Dark green overlay mimicking Figma's design */}
            <div className="absolute inset-0 bg-brand/80" />
          </div>

          <div className="relative z-10 w-full min-h-[600px] lg:min-h-[750px] flex flex-col lg:flex-row items-center p-8 lg:p-16">
            
            {/* Left Column: Text & Badges */}
            <div className="flex-1 w-full max-w-3xl text-left z-20">
              
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {badges.map((badge, idx) => (
                  <div key={idx} className="inline-flex items-center gap-2 bg-surface/10 border border-surface/20 rounded-full px-4 py-2 text-brandFg text-sm font-semibold backdrop-blur-sm">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <span>{badge.title}</span>
                  </div>
                ))}
              </div>

              {/* Big Bold Headline (Bebas Neue / font-heading) */}
              <h1 className="font-heading text-6xl sm:text-7xl lg:text-[110px] uppercase tracking-tight leading-[0.9] text-brandFg mb-10 drop-shadow-lg">
                {headlinePrefix} <br className="hidden md:block" />
                <span className="text-accent">{headlineHighlight}</span> <br className="hidden md:block" />
                {headlineSuffix}
              </h1>

              {/* AI Differentiator Badge */}
              {aiBadgeTitle && (
                <div className="mb-10 max-w-md bg-surface/10 border-l-4 border-accent p-4 rounded-r-lg backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <Bot className="w-6 h-6 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-brandFg text-lg">{aiBadgeTitle}</h3>
                      {aiBadgeDesc && (
                        <p className="text-brandFg/80 text-sm mt-1">{aiBadgeDesc}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="mt-8">
                <PrimitiveButton
                  href="#quote"
                  variant="accent"
                  className="px-8 py-4 text-lg lg:text-xl font-heading uppercase shadow-[4px_4px_0px_var(--surface)] hover:translate-x-[2px] hover:translate-y-[2px] transition-transform group"
                >
                  <span className="mr-2">{ctaText}</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </PrimitiveButton>
              </div>
            </div>

            {/* Right Column: Owner Overlay */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0 relative z-20">
              <div className="relative w-full max-w-[450px] aspect-[4/5]">
                {/* Decorative Accent Behind Image */}
                <div className="absolute -bottom-6 -right-6 w-full h-full bg-accent rounded-[32px] z-0" />
                
                {/* Main Image */}
                <div className="absolute inset-0 z-10 rounded-[32px] overflow-hidden border-4 border-surface shadow-2xl bg-surfaceAlt">
                  <Image
                    src={ownerImageUrl}
                    alt={`Portrait of ${ownerName}, ${ownerTitle}`}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                </div>

                {/* Owner Nameplate */}
                <div className="absolute bottom-6 left-6 z-20 bg-surface px-6 py-3 rounded-xl shadow-xl flex flex-col">
                  <span className="font-bold text-ink text-xl">{ownerName}</span>
                  <span className="text-sm font-semibold text-accent uppercase tracking-wider">{ownerTitle}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
