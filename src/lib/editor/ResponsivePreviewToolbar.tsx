"use client";

import React from "react";
import { Monitor, Laptop, Tablet, Smartphone } from "lucide-react";

export type ViewportMode = "desktop" | "laptop" | "tablet" | "mobile-landscape" | "mobile-portrait";

export interface ResponsivePreviewToolbarProps {
  currentMode: ViewportMode;
  onChange: (mode: ViewportMode) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

const VIEWPORTS = [
  { id: "desktop", label: "Desktop", width: "100%", icon: <Monitor className="w-4 h-4" /> },
  { id: "laptop", label: "Laptop", width: "1366px", icon: <Laptop className="w-4 h-4" /> },
  { id: "tablet", label: "Tablet", width: "768px", icon: <Tablet className="w-4 h-4" /> },
  { id: "mobile-landscape", label: "Mobile (Landscape)", width: "667px", icon: <Smartphone className="w-4 h-4 rotate-90" /> },
  { id: "mobile-portrait", label: "Mobile (Portrait)", width: "375px", icon: <Smartphone className="w-4 h-4" /> },
] as const;

export function ResponsivePreviewToolbar({
  currentMode,
  onChange,
  isEditMode,
  onToggleEditMode,
}: ResponsivePreviewToolbarProps) {
  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-between shadow-sm z-50">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 hidden sm:inline-block">
          Preview Mode
        </span>
        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
          {VIEWPORTS.map((vp) => (
            <button
              key={vp.id}
              onClick={() => onChange(vp.id as ViewportMode)}
              title={`${vp.label} (${vp.width})`}
              className={`p-2 rounded-md transition-colors flex items-center justify-center ${
                currentMode === vp.id
                  ? "bg-slate-800 text-amber-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
              }`}
            >
              {vp.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 px-3">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className={`relative w-10 h-5 rounded-full transition-colors ${isEditMode ? "bg-amber-400" : "bg-slate-700"}`}>
            <div className={`absolute top-1 left-1 w-3 h-3 bg-slate-900 rounded-full transition-transform ${isEditMode ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <span className={`text-xs font-semibold ${isEditMode ? "text-amber-400" : "text-slate-400 group-hover:text-slate-300"}`}>
            Edit Mode
          </span>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={isEditMode} 
            onChange={onToggleEditMode} 
          />
        </label>
      </div>
    </div>
  );
}
