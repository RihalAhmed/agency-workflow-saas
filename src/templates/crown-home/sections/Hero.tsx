import React from "react";
import Image from "next/image";
import { ShieldCheck, Sparkles, Crown, Award } from "lucide-react";
import { PrimitiveButton } from "@/primitives";

export interface HeroProps {
  headlinePrefix?: string;
  headlineHighlight?: string;
  headlineSuffix?: string;
  subBadges?: Array<{ icon: string; text: string }>;
  ctaText?: string;
  backgroundImageUrl?: string;
  showTrustBadges?: boolean;
}

function renderSubBadgeIcon(icon: string) {
  const lower = icon.toLowerCase();
  if (icon.includes("🛡") || lower.includes("shield") || lower.includes("license") || lower.includes("check")) {
    return <ShieldCheck className="w-4 h-4 text-accent shrink-0 stroke-[2.2]" aria-hidden="true" />;
  }
  if (icon.includes("👑") || lower.includes("crown") || lower.includes("king")) {
    return <Crown className="w-4 h-4 text-accent shrink-0 stroke-[2.2]" aria-hidden="true" />;
  }
  if (icon.includes("👩") || icon.includes("🐾") || icon.includes("🌿") || lower.includes("safe") || lower.includes("pet") || lower.includes("leaf")) {
    return <Sparkles className="w-4 h-4 text-accent shrink-0 stroke-[2.2]" aria-hidden="true" />;
  }
  if (icon.includes("⭐") || lower.includes("star") || lower.includes("award") || lower.includes("trust")) {
    return <Award className="w-4 h-4 text-accent shrink-0 stroke-[2.2]" aria-hidden="true" />;
  }
  return (
    <span className="text-base" role="img" aria-hidden="true">
      {icon}
    </span>
  );
}

export function Hero({
  headlinePrefix = "WEAR",
  headlineHighlight = "THE CROWN",
  headlineSuffix = "OF A PEST FREE HOME",
  subBadges = [
    { icon: "🛡️", text: "State Licensed & Insured" },
    { icon: "👩‍👧", text: "Kid & Pet Safe" },
    { icon: "👑", text: "Family-Owned Since 1979" },
  ],
  ctaText = "Get Pest control Help",
  backgroundImageUrl = "/assets/hero-bg.jpg",
  showTrustBadges = true,
}: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden pt-12 pb-28 md:pt-16 md:pb-36 bg-brand text-brand-fg">
      {/* Background Image with Brand Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImageUrl}
          alt="Service fleet and technicians"
          fill
          className="object-cover object-center opacity-40 mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand/90 via-brand/75 to-brand" />
      </div>

      {/* Decorative Diagonal Accents at Bottom */}
      <div className="absolute bottom-0 left-0 w-36 sm:w-56 h-auto pointer-events-none z-10">
        <svg
          viewBox="0 0 215 325"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto text-accent"
          aria-hidden="true"
        >
          <polygon
            points="0,12 0,16 0,20 0,24 3,28 5,32 8,36 10,40 12,44 15,48 17,52 19,56 22,60 24,64 26,68 29,72 31,76 34,80 36,84 38,88 41,92 43,96 45,100 48,104 50,108 52,112 55,116 57,120 60,124 62,128 64,132 67,136 69,140 71,144 74,148 76,152 78,156 81,160 83,164 86,168 88,172 90,176 93,180 95,184 97,188 100,192 102,196 104,200 107,204 109,208 112,212 114,216 116,220 119,224 121,228 123,232 126,236 128,240 131,244 133,248 135,252 138,256 140,260 142,264 145,268 147,272 149,276 152,280 154,284 157,288 159,292 161,296 164,300 166,304 168,308 171,312 173,316 175,320 178,324 202,324 199,320 196,316 194,312 191,308 189,304 186,300 183,296 181,292 178,288 176,284 173,280 170,276 168,272 165,268 163,264 160,260 158,256 155,252 152,248 150,244 147,240 145,236 142,232 139,228 137,224 134,220 132,216 129,212 127,208 124,204 121,200 119,196 116,192 114,188 111,184 108,180 106,176 103,172 101,168 98,164 95,160 93,156 90,152 88,148 85,144 83,140 80,136 77,132 75,128 72,124 70,120 67,116 64,112 62,108 59,104 57,100 54,96 52,92 49,88 46,84 44,80 41,76 39,72 36,68 33,64 31,60 28,56 26,52 23,48 20,44 18,40 15,36 13,32 10,28 8,24 5,20 2,16 0,12"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-36 sm:w-56 h-auto pointer-events-none z-10">
        <svg
          viewBox="0 0 215 322"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto text-accent"
          aria-hidden="true"
        >
          <polygon
            points="214,12 211,16 209,20 206,24 204,28 201,32 198,36 196,40 193,44 191,48 188,52 185,56 183,60 180,64 178,68 175,72 172,76 170,80 167,84 164,88 162,92 159,96 157,100 154,104 151,108 149,112 146,116 144,120 141,124 138,128 136,132 133,136 131,140 128,144 125,148 123,152 120,156 118,160 115,164 112,168 110,172 107,176 104,180 102,184 99,188 97,192 94,196 91,200 89,204 86,208 84,212 81,216 78,220 76,224 73,228 71,232 68,236 65,240 63,244 60,248 57,252 55,256 52,260 50,264 47,268 44,272 42,276 39,280 37,284 34,288 31,292 29,296 26,300 24,304 21,308 18,312 16,316 13,320 37,320 39,316 42,312 44,308 46,304 49,300 51,296 53,292 56,288 58,284 61,280 63,276 65,272 68,268 70,264 73,260 75,256 77,252 80,248 82,244 85,240 87,236 89,232 92,228 94,224 96,220 99,216 101,212 104,208 106,204 108,200 111,196 113,192 116,188 118,184 120,180 123,176 125,172 127,168 130,164 132,160 135,156 137,152 139,148 142,144 144,140 147,136 149,132 151,128 154,124 156,120 159,116 161,112 163,108 166,104 168,100 170,96 173,92 175,88 178,84 180,80 182,76 185,72 187,68 190,64 192,60 194,56 197,52 199,48 202,44 204,40 206,36 209,32 211,28 213,24 214,20 214,16 214,12"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Trust Badges */}
        {showTrustBadges && (
          <div className="mb-6 h-12 w-80 sm:w-96 relative">
            <Image
              src="/assets/trust-badges.png"
              alt="Yelp 5 stars, Google 5 stars, BBB Accredited Business"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Big Bold Headline */}
        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-tight max-w-4xl text-brand-fg mb-8">
          {headlinePrefix}{" "}
          <span className="text-accent">{headlineHighlight}</span>{" "}
          {headlineSuffix}
        </h1>

        {/* Sub-Badges Pill Row (Stacks vertically on mobile matching mockup, horizontally on tablet/desktop) */}
        {subBadges.length > 0 && (
          <div className="mb-8 px-6 py-3.5 rounded-lg sm:rounded-md bg-brand/85 border border-border backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-8 text-xs sm:text-sm font-body text-brand-fg w-full sm:w-auto max-w-sm sm:max-w-none">
            {subBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                {renderSubBadgeIcon(badge.icon)}
                <span className="font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button — using PrimitiveButton */}
        <div className="relative inline-block">
          <PrimitiveButton
            href="#quote"
            variant="accent"
            showChevron
            className="px-7 py-3.5 shadow-[3px_3px_0px_var(--surface)]"
          >
            {ctaText}
          </PrimitiveButton>
        </div>
      </div>
    </section>
  );
}
