"use client";

import React from "react";
import { TRUST_BADGE_CATALOG } from "@/lib/trust/badge-catalog";

export interface TrustBadgeSelectorProps {
  /** The currently selected platforms */
  selected: string[];
  /** Callback when selection changes */
  onChange: (platforms: string[]) => void;
  /** Whether a scan is currently in progress */
  isScanning?: boolean;
  /** Current niche for filtering badges */
  niche: string;
}

/**
 * TrustBadgeSelector — manual checkbox UI for selecting trust badges.
 * Provides a grid of checkboxes dynamically sourced from the badge catalog.
 */
export function TrustBadgeSelector({
  selected,
  onChange,
  isScanning = false,
  niche,
}: TrustBadgeSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const availableBadges = TRUST_BADGE_CATALOG.filter(
    (b) => b.scope === "all" || b.scope.includes(niche)
  );

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-slate-700">Trust Badges & Certifications</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableBadges.map((platform) => {
          const isSelected = selected.includes(platform.id);
          return (
            <label
              key={platform.id}
              className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              } ${isScanning ? "opacity-50 pointer-events-none" : ""}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(platform.id)}
                disabled={isScanning}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{platform.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
