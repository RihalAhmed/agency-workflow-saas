"use client";

import React, { useEffect, useState, useRef } from "react";
import { TRUST_BADGE_CATALOG } from "@/lib/trust/badge-catalog";

export interface PrimitiveTrustBadgeProps {
  /** Which trust platform ID */
  id: string;
  /** Optional custom label override */
  label?: string;
  /** Additional Tailwind classes */
  className?: string;
}

/**
 * Calculates relative luminance from an RGB string like "rgb(255, 255, 255)"
 * Returns true if dark, false if light.
 */
function isDarkBackground(rgbStr: string): boolean {
  const match = rgbStr.match(/\d+/g);
  if (!match || match.length < 3) return false;
  
  const [r, g, b] = match.map(Number);
  
  // sRGB luminance formula
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  return luminance < 0.5; // threshold for dark
}

/**
 * PrimitiveTrustBadge — renders a platform-specific trust indicator badge.
 * Uses the badge catalog to resolve actual SVG/PNG assets.
 */
export function PrimitiveTrustBadge({
  id,
  label,
  className = "",
}: PrimitiveTrustBadgeProps) {
  const badgeDef = TRUST_BADGE_CATALOG.find((b) => b.id === id);
  const containerRef = useRef<HTMLDivElement>(null);
  const [useMono, setUseMono] = useState(false);

  useEffect(() => {
    if (!badgeDef?.logoPathMono) return;
    
    // Check background luminance at runtime
    if (containerRef.current) {
      // Get the background color of the closest parent that has a background, 
      // or just check the computed style of this element's parent.
      let node: HTMLElement | null = containerRef.current.parentElement;
      let bgColor = "rgba(0, 0, 0, 0)";
      
      while (node) {
        const style = window.getComputedStyle(node);
        bgColor = style.backgroundColor;
        if (bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
          break;
        }
        node = node.parentElement;
      }
      
      if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
        setUseMono(isDarkBackground(bgColor));
      }
    }
  }, [badgeDef]);

  if (!badgeDef) {
    return null; // Don't render if badge ID is unknown
  }

  const displayLabel = label || badgeDef.label;
  const imageSrc = (useMono && badgeDef.logoPathMono) ? badgeDef.logoPathMono : badgeDef.logoPath;

  return (
    <div
      ref={containerRef}
      className={`w-40 h-14 sm:w-48 sm:h-16 flex items-center justify-center shrink-0 ${className}`}
    >
      <img 
        src={imageSrc} 
        alt={`${displayLabel} logo`} 
        className="w-full h-full object-contain drop-shadow-sm" 
      />
    </div>
  );
}
