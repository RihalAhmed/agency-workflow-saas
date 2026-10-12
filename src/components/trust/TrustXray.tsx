"use client";

import React, { useState } from "react";
import { SearchX } from "lucide-react";
import type { Region, RegionMatch, RegionSlices, RowKey, SlotFinding, TrustSignals } from "@/lib/trust/types";
import { REGIONS } from "@/lib/trust/types";
import { SchematicLayer } from "./xray/SchematicLayer";

interface TrustXrayProps {
  signals: TrustSignals;
  signedRegionSlices?: RegionSlices | null;
  screenshotSource?: string | null;
  onSlotClick?: (slotName: string) => void;
  onUploadClick?: () => void;
  onJumpToRow?: (rowKey: string) => void;
}

const REGION_DISPLAY_NAMES: Record<Region, string> = {
  header: "1. Header",
  hero: "2. Hero + Form",
  reviews: "3. Social Proof",
  about: "4. About Us",
};

const MISSING_BAND_SUBTITLES: Record<Region, string> = {
  header: "No navigation header detected on page. Critical for visitor orientation and phone CTA.",
  hero: "No clear Hero & value proposition section above the fold. Prospects bounce without immediate proof.",
  reviews: "No reviews or social proof section detected. Winning pattern places trusted customer proof right below the hero.",
  about: "No About section on the homepage. Winning pattern puts one between hero and footer.",
};

const SLOT_TO_ROW_KEY: Record<string, RowKey> = {
  // Header
  logo_present: "trust_badges_reputation",
  phone_link: "trust_badges_reputation",
  nav_items_count: "trust_badges_reputation",
  cta_button_top_right: "trust_badges_reputation",

  // Hero
  h1_contains_town: "risk_reversal_usp",
  owner_face: "personality_face",
  branded_truck: "personality_face",
  credential_chips: "trust_badges_reputation",
  review_badges: "reviews_social_proof",
  quote_form_above_fold: "risk_reversal_usp",
  risk_reversal_phrase: "risk_reversal_usp",

  // Reviews
  platform_logo_on_cards: "reviews_social_proof",
  star_rating_shown: "reviews_social_proof",
  review_count_shown: "reviews_social_proof",
  link_back_to_source: "reviews_social_proof",
  card_count: "reviews_social_proof",
  position_above_fold: "reviews_social_proof",

  // About
  owner_photo: "personality_face",
  first_person_bio: "like_know_trust",
  signature_image: "emotional_backstory",
  company_logo_in_section: "like_know_trust",
  cta_button: "like_know_trust",
  on_homepage: "emotional_backstory",
};

/**
 * Standard schematic relative positions (in %) when slot bounding box is not emitted by backend.
 */
const DEFAULT_SLOT_COORDS: Record<Region, Record<string, { x: number; y: number }>> = {
  header: {
    logo_present: { x: 8, y: 50 },
    nav_items_count: { x: 44, y: 50 },
    phone_link: { x: 74, y: 50 },
    cta_button_top_right: { x: 92, y: 50 },
  },
  hero: {
    h1_contains_town: { x: 18, y: 22 },
    owner_face: { x: 50, y: 40 },
    branded_truck: { x: 58, y: 72 },
    credential_chips: { x: 22, y: 45 },
    review_badges: { x: 36, y: 45 },
    quote_form_above_fold: { x: 82, y: 48 },
    risk_reversal_phrase: { x: 22, y: 76 },
  },
  reviews: {
    position_above_fold: { x: 50, y: 15 },
    platform_logo_on_cards: { x: 18, y: 42 },
    star_rating_shown: { x: 22, y: 68 },
    review_count_shown: { x: 50, y: 42 },
    card_count: { x: 50, y: 68 },
    link_back_to_source: { x: 82, y: 55 },
  },
  about: {
    on_homepage: { x: 50, y: 15 },
    owner_photo: { x: 16, y: 50 },
    first_person_bio: { x: 60, y: 35 },
    company_logo_in_section: { x: 60, y: 62 },
    signature_image: { x: 62, y: 84 },
    cta_button: { x: 84, y: 84 },
  },
};

const ESTIMATED_REGION_HEIGHTS: Record<Region, number> = {
  header: 80,
  hero: 580,
  reviews: 320,
  about: 340,
};

function formatSlotLabel(slot: string): string {
  return slot
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TrustXray({
  signals,
  signedRegionSlices,
  onSlotClick,
  onJumpToRow,
}: TrustXrayProps) {
  const [showScrim, setShowScrim] = useState<boolean>(true);
  const [hideFoundPins, setHideFoundPins] = useState<boolean>(false);

  const handlePinClick = (slot: SlotFinding) => {
    onSlotClick?.(slot.slot);
    const rowKey = SLOT_TO_ROW_KEY[slot.slot];
    if (rowKey) {
      onJumpToRow?.(rowKey);
      const rowEl = document.getElementById(`row-${rowKey}`);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    const tableEl = document.getElementById("trust-row-table");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleViewFixes = (region: Region) => {
    const match = signals?.regions?.[region];
    const missingSlot = match?.slots.find(
      (s) => s.state === "missing" || s.state === "partial"
    );
    if (missingSlot) {
      handlePinClick(missingSlot);
    } else {
      const tableEl = document.getElementById("trust-row-table");
      if (tableEl) {
        tableEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="relative overflow-hidden rounded-xl border-[0.5px] border-tr-line bg-tr-surface">
      {/* CAD 24px Dot Grid Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25 z-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="tr-xray-dot-grid"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill="var(--tr-line-strong)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tr-xray-dot-grid)" />
      </svg>

      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b-[0.5px] border-tr-line relative z-10 bg-tr-surface">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-tr-text">
            Trust X-Ray · Visual Blueprint
          </span>
          <span className="h-6 rounded-full px-2.5 text-[11px] bg-tr-raised border-[0.5px] border-tr-line text-tr-text-dim inline-flex items-center">
            4 Stacked Bands
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Website Scrim Switch */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-tr-text-dim">Website Scrim</span>
            <button
              type="button"
              role="switch"
              aria-checked={showScrim}
              onClick={() => setShowScrim(!showScrim)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-[0.5px] border-tr-line transition-colors duration-200 ease-in-out focus:outline-none ${
                showScrim ? "bg-tr-brand" : "bg-tr-raised"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-tr-text transition duration-200 ease-in-out mt-[1px] ${
                  showScrim ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-[11px] font-mono text-tr-text-mute min-w-[36px]">
              {showScrim ? "Active" : "Off"}
            </span>
          </div>

          <div className="h-3.5 w-[0.5px] bg-tr-line" />

          <span className="text-xs text-tr-text-mute hidden sm:inline">
            Click any pin to inspect fix
          </span>
        </div>
      </div>

      {/* Band Container */}
      <div className="divide-y-[0.5px] divide-tr-line relative z-10">
        {REGIONS.map((region) => {
          const match: RegionMatch | undefined = signals?.regions?.[region];
          const isFound = match?.found ?? false;
          const slots: SlotFinding[] = match?.slots ?? [];
          const sliceUrl = signedRegionSlices?.[region];

          const isBelowFold =
            region !== "header" &&
            Boolean(
              (match?.scrollIndex && match.scrollIndex > 1) ||
                (match?.scrollDepth && match.scrollDepth > 1000) ||
                match?.isOffHomepage
            );

          const foundCount = isFound
            ? slots.filter((s) => s.state === "found").length
            : 0;
          const partialCount = isFound
            ? slots.filter((s) => s.state === "partial").length
            : 0;
          const missingCount = isFound
            ? slots.filter((s) => s.state === "missing").length
            : slots.length;

          // Missing slots with and without bbox
          const missingSlotsWithoutBbox = slots.filter(
            (s) => s.state === "missing" && !s.bbox
          );

          const estH = ESTIMATED_REGION_HEIGHTS[region] || 300;

          return (
            <div
              key={region}
              className="grid grid-cols-1 md:grid-cols-[140px_1fr_120px] gap-5 px-5 py-5 items-start"
            >
              {/* BAND LEFT COLUMN (140px) */}
              <div className="w-full md:w-[140px] shrink-0 flex flex-col gap-1">
                <span className="text-sm font-medium text-tr-text">
                  {REGION_DISPLAY_NAMES[region]}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`h-5 rounded-md px-2 text-[10px] uppercase tracking-wide font-mono inline-flex items-center border-[0.5px] ${
                      !isFound
                        ? "bg-tr-bad/15 text-tr-bad border-tr-bad/40"
                        : isBelowFold
                        ? "bg-tr-warn/15 text-tr-warn border-tr-warn/30"
                        : "bg-tr-ok/15 text-tr-ok border-tr-ok/30"
                    }`}
                  >
                    {!isFound
                      ? "MISSING"
                      : match?.isOffHomepage
                      ? "SUBPAGE"
                      : isBelowFold
                      ? `${match?.scrollDepth ?? 0}PX FOLD ${match?.scrollIndex ?? 2}`
                      : `${match?.scrollDepth ?? 0}PX`}
                  </span>
                </div>
                {!isFound && (
                  <span className="text-[11px] text-tr-text-mute italic mt-0.5">
                    Not detected on page
                  </span>
                )}
              </div>

              {/* BAND CENTER COLUMN — THE SCHEMATIC CANVAS */}
              <div className="w-full min-w-0">
                {!isFound ? (
                  /* MISSING BAND STATE */
                  <div className="rounded-lg border border-dashed border-tr-bad/50 bg-tr-bad/5 min-h-[120px] flex flex-col items-center justify-center gap-1.5 text-center px-4 py-6 w-full">
                    <SearchX className="w-5 h-5 text-tr-bad/80" />
                    <span className="text-sm font-medium text-tr-bad">
                      Section missing
                    </span>
                    <p className="text-xs text-tr-text-dim max-w-md">
                      {MISSING_BAND_SUBTITLES[region]}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`relative overflow-hidden rounded-lg border-[0.5px] border-tr-line-strong bg-tr-bg w-full ${
                      region === "header"
                        ? "max-h-[80px]"
                        : region === "hero"
                        ? "max-h-[320px]"
                        : region === "reviews"
                        ? "max-h-[220px]"
                        : "max-h-[260px]"
                    }`}
                  >
                    {/* Layer 1: Screenshot layer or Wireframe schematic */}
                    {showScrim && sliceUrl ? (
                      <div className="relative w-full">
                        <img
                          src={sliceUrl}
                          alt=""
                          className="block w-full h-auto object-cover object-top"
                          style={{
                            filter: "grayscale(1) brightness(0.72) contrast(0.95)",
                          }}
                        />
                        <div className="absolute inset-0 pointer-events-none bg-black/30" />
                      </div>
                    ) : (
                      <SchematicLayer region={region} />
                    )}

                    {/* Layer 2: Missing-slot ghost rectangles (with bbox) */}
                    {slots
                      .filter((s) => s.state === "missing" && s.bbox)
                      .map((slot) => {
                        const bbox = slot.bbox!;
                        const leftPct = Math.min(
                          92,
                          Math.max(4, (bbox.x / 1440) * 100)
                        );
                        const yOffset = Math.max(
                          0,
                          bbox.y - (match?.scrollDepth || 0)
                        );
                        const topPct = Math.min(
                          86,
                          Math.max(6, (yOffset / estH) * 100)
                        );
                        const widthPct = Math.min(
                          80,
                          Math.max(8, (bbox.w / 1440) * 100)
                        );
                        const heightPct = Math.min(
                          60,
                          Math.max(8, (bbox.h / estH) * 100)
                        );

                        return (
                          <div
                            key={`ghost-${slot.slot}`}
                            className="absolute border border-dashed border-tr-bad/70 rounded-md bg-tr-bad/5 flex items-center justify-center text-[10px] font-medium text-tr-bad/90 z-10 px-1 text-center"
                            style={{
                              left: `${leftPct}%`,
                              top: `${topPct}%`,
                              width: `${widthPct}%`,
                              height: `${heightPct}%`,
                            }}
                          >
                            {formatSlotLabel(slot.slot)}
                          </div>
                        );
                      })}

                    {/* Missing slots fallback chips stack (when bbox is missing) */}
                    {missingSlotsWithoutBbox.length > 0 && (
                      <div className="absolute bottom-2 right-2 flex flex-wrap justify-end gap-1.5 z-10 max-w-[80%] pointer-events-auto">
                        {missingSlotsWithoutBbox.map((slot) => (
                          <button
                            type="button"
                            key={`missing-chip-${slot.slot}`}
                            onClick={() => handlePinClick(slot)}
                            className="h-5 px-2 rounded border border-dashed border-tr-bad/70 bg-tr-bad/10 text-tr-bad text-[10px] font-medium flex items-center gap-1 cursor-pointer hover:bg-tr-bad/20 transition-colors"
                            title={`${formatSlotLabel(slot.slot)} · Missing. Click to inspect fix.`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-tr-bad shrink-0" />
                            <span className="truncate">
                              {formatSlotLabel(slot.slot)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Layer 3: Pins (1 per slot, per-band 1..N index) */}
                    {slots.map((slot, idx) => {
                      if (hideFoundPins && slot.state === "found") return null;

                      const pinIndex = idx + 1;
                      const hasBbox = Boolean(slot.bbox);

                      let leftPct: number;
                      let topPct: number;

                      if (hasBbox) {
                        const bbox = slot.bbox!;
                        leftPct = Math.min(
                          94,
                          Math.max(5, (bbox.x / 1440) * 100)
                        );
                        const yOffset = Math.max(
                          0,
                          bbox.y - (match?.scrollDepth || 0)
                        );
                        topPct = Math.min(
                          90,
                          Math.max(8, (yOffset / estH) * 100)
                        );
                      } else {
                        const fallbackCoords =
                          DEFAULT_SLOT_COORDS[region]?.[slot.slot] || {
                            x: 20 + idx * 12,
                            y: 50,
                          };
                        leftPct = fallbackCoords.x;
                        topPct = fallbackCoords.y;
                      }

                      return (
                        <button
                          type="button"
                          key={`pin-${slot.slot}`}
                          onClick={() => handlePinClick(slot)}
                          aria-label={`${formatSlotLabel(slot.slot)}: ${slot.state}. Jump to scorecard.`}
                          style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                          className={`group absolute -translate-x-1/2 -translate-y-1/2 h-6 w-6 rounded-full text-[11px] font-medium font-mono flex items-center justify-center ring-2 ring-tr-bg cursor-pointer hover:scale-110 transition focus:outline-2 focus:outline-tr-brand z-20 ${
                            slot.state === "found"
                              ? "bg-tr-ok text-tr-bg"
                              : slot.state === "partial"
                              ? "bg-tr-warn text-tr-bg"
                              : "bg-tr-bad text-white"
                          }`}
                        >
                          <span>{pinIndex}</span>

                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-tr-surface border-[0.5px] border-tr-line-strong text-tr-text px-2 py-0.5 rounded text-[10px] whitespace-nowrap z-30 flex items-center gap-1.5 shadow-none">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                slot.state === "found"
                                  ? "bg-tr-ok"
                                  : slot.state === "partial"
                                  ? "bg-tr-warn"
                                  : "bg-tr-bad"
                              }`}
                            />
                            <span className="font-medium text-tr-text">
                              {formatSlotLabel(slot.slot)}
                            </span>
                            <span className="text-tr-text-mute">·</span>
                            <span className="capitalize text-tr-text-dim">
                              {slot.state}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BAND RIGHT COLUMN (120px) — TALLY */}
              <div className="w-full md:w-[120px] shrink-0 flex flex-col gap-2 pt-1">
                {/* Found Row */}
                <div className="flex items-center gap-2 text-xs text-tr-text-dim">
                  <span className="w-2 h-2 rounded-full bg-tr-ok shrink-0" />
                  <span className="font-mono tabular-nums text-tr-text min-w-[1.5ch]">
                    {foundCount}
                  </span>
                  <span>Found</span>
                </div>

                {/* Partial Row */}
                <div className="flex items-center gap-2 text-xs text-tr-text-dim">
                  <span className="w-2 h-2 rounded-full bg-tr-warn shrink-0" />
                  <span className="font-mono tabular-nums text-tr-text min-w-[1.5ch]">
                    {partialCount}
                  </span>
                  <span>Partial</span>
                </div>

                {/* Missing Row */}
                <div className="flex items-center gap-2 text-xs text-tr-text-dim">
                  <span className="w-2 h-2 rounded-full bg-tr-bad shrink-0" />
                  <span className="font-mono tabular-nums text-tr-text min-w-[1.5ch]">
                    {missingCount}
                  </span>
                  <span>Missing</span>
                </div>

                {missingCount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleViewFixes(region)}
                    className="text-[11px] text-tr-brand hover:text-tr-text transition-colors mt-1 text-left cursor-pointer font-medium"
                  >
                    View fixes ↓
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3 border-t-[0.5px] border-tr-line text-[11px] text-tr-text-dim relative z-10 bg-tr-surface gap-3">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tr-ok shrink-0" />
            <span>Found / Strong</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tr-warn shrink-0" />
            <span>Partial / Below Fold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tr-bad shrink-0" />
            <span>Missing / Recommended</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-tr-text-mute font-mono text-[10px]">
            Scrim {showScrim ? "Active" : "Off"}
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideFoundPins}
              onChange={(e) => setHideFoundPins(e.target.checked)}
              className="rounded border-[0.5px] border-tr-line bg-tr-raised text-tr-brand focus:ring-0 cursor-pointer h-3.5 w-3.5"
            />
            <span className="text-tr-text-dim">Hide found pins</span>
          </label>
        </div>
      </div>
    </section>
  );
}
