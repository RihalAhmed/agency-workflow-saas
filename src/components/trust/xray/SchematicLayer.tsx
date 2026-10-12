"use client";

import React from "react";
import type { Region } from "@/lib/trust/types";
import { User } from "lucide-react";

interface SchematicLayerProps {
  region: Region;
}

export function SchematicLayer({ region }: SchematicLayerProps) {
  if (region === "header") {
    return (
      <div className="w-full h-[76px] bg-tr-bg flex items-center justify-between px-6 border-b-[0.5px] border-tr-line-strong select-none">
        {/* Left: Brand Logo Wireframe */}
        <div className="h-7 w-28 rounded bg-tr-raised border-[0.5px] border-tr-line-strong flex items-center px-2.5 gap-2">
          <div className="w-3.5 h-3.5 rounded bg-tr-brand/30 shrink-0" />
          <div className="h-1.5 w-14 rounded bg-tr-line-strong/80" />
        </div>

        {/* Center: Nav links wireframe */}
        <div className="hidden md:flex items-center gap-6">
          <div className="h-2 w-12 rounded bg-tr-line-strong/60" />
          <div className="h-2 w-14 rounded bg-tr-line-strong/60" />
          <div className="h-2 w-10 rounded bg-tr-line-strong/60" />
          <div className="h-2 w-16 rounded bg-tr-line-strong/60" />
        </div>

        {/* Right: Phone pill + CTA button wireframe */}
        <div className="flex items-center gap-3">
          <div className="h-6 px-2.5 rounded bg-tr-raised border-[0.5px] border-tr-line-strong flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-tr-line-strong shrink-0" />
            <div className="h-1.5 w-16 rounded bg-tr-line-strong/80" />
          </div>
          <div className="h-7 px-3.5 rounded-full bg-tr-brand/20 border-[0.5px] border-tr-brand/40 text-[10px] font-mono font-medium text-tr-brand flex items-center">
            GET ESTIMATE
          </div>
        </div>
      </div>
    );
  }

  if (region === "hero") {
    return (
      <div className="w-full min-h-[260px] bg-tr-bg flex flex-col md:flex-row items-center justify-between p-6 gap-6 select-none">
        {/* Left: Headline + Badges + Button */}
        <div className="flex-1 max-w-xl flex flex-col gap-3.5 w-full">
          <div className="h-4 w-28 rounded-full bg-tr-raised border-[0.5px] border-tr-line-strong flex items-center px-2 text-[9px] text-tr-text-mute font-mono uppercase">
            LOCAL VERIFIED
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-6 w-4/5 rounded bg-tr-line-strong/90" />
            <div className="h-6 w-3/5 rounded bg-tr-line-strong/70" />
          </div>

          <div className="flex flex-col gap-1.5 pt-1">
            <div className="h-2 w-5/6 rounded bg-tr-line-strong/40" />
            <div className="h-2 w-2/3 rounded bg-tr-line-strong/30" />
          </div>

          {/* Credential chips row */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <div className="h-5 px-2.5 rounded bg-tr-raised border-[0.5px] border-tr-line-strong flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tr-ok/60 shrink-0" />
              <div className="h-1.5 w-12 rounded bg-tr-line-strong" />
            </div>
            <div className="h-5 px-2.5 rounded bg-tr-raised border-[0.5px] border-tr-line-strong flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tr-ok/60 shrink-0" />
              <div className="h-1.5 w-14 rounded bg-tr-line-strong" />
            </div>
            <div className="h-5 px-2.5 rounded bg-tr-raised border-[0.5px] border-tr-line-strong flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tr-ok/60 shrink-0" />
              <div className="h-1.5 w-10 rounded bg-tr-line-strong" />
            </div>
          </div>

          {/* CTA Button + Risk Reversal */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-9 px-5 rounded-lg bg-tr-brand/25 border-[0.5px] border-tr-brand/50 flex items-center justify-center text-[11px] font-mono font-medium text-tr-text">
              FREE INSPECTION
            </div>
            <div className="h-2 w-32 rounded bg-tr-line-strong/40" />
          </div>
        </div>

        {/* Right: Form schematic + imagery wireframe */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-56 rounded-lg border-[0.5px] border-tr-line-strong bg-tr-raised/80 p-3.5 flex flex-col gap-2.5">
            <div className="h-2.5 w-24 rounded bg-tr-line-strong" />
            <div className="h-6 rounded bg-tr-bg border-[0.5px] border-tr-line-strong px-2 flex items-center">
              <div className="h-1.5 w-16 rounded bg-tr-line-strong/40" />
            </div>
            <div className="h-6 rounded bg-tr-bg border-[0.5px] border-tr-line-strong px-2 flex items-center">
              <div className="h-1.5 w-20 rounded bg-tr-line-strong/40" />
            </div>
            <div className="h-7 rounded bg-tr-brand/30 border-[0.5px] border-tr-brand/50 text-[10px] text-tr-brand font-mono font-medium flex items-center justify-center">
              GET FAST QUOTE
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (region === "reviews") {
    return (
      <div className="w-full min-h-[180px] bg-tr-bg flex flex-col justify-between p-5 gap-3.5 select-none">
        <div className="flex items-center justify-between border-b-[0.5px] border-tr-line pb-2">
          <div className="h-3 w-36 rounded bg-tr-line-strong" />
          <div className="h-5 px-2 rounded bg-tr-raised border-[0.5px] border-tr-line-strong flex items-center gap-1.5 text-[10px] font-mono text-tr-warn">
            <span>★★★★★</span>
            <span className="text-tr-text-dim">4.9 (120+)</span>
          </div>
        </div>

        {/* 3 Review card placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="rounded-lg border-[0.5px] border-tr-line-strong bg-tr-raised/60 p-3 flex flex-col justify-between h-[104px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-[9px] text-tr-warn">★★★★★</div>
                <div className="h-2 w-10 rounded bg-tr-line-strong/60" />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 w-full rounded bg-tr-line-strong/50" />
                <div className="h-1.5 w-4/5 rounded bg-tr-line-strong/40" />
              </div>
              <div className="flex items-center gap-2 pt-1 border-t-[0.5px] border-tr-line/60">
                <div className="w-3.5 h-3.5 rounded-full bg-tr-line-strong shrink-0" />
                <div className="h-1.5 w-14 rounded bg-tr-line-strong/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // About us region
  return (
    <div className="w-full min-h-[210px] bg-tr-bg flex items-center justify-between p-6 gap-6 select-none">
      {/* Photo frame */}
      <div className="w-32 h-40 rounded-lg border-[0.5px] border-dashed border-tr-line-strong bg-tr-raised/60 flex flex-col items-center justify-center gap-2 shrink-0 text-tr-text-mute">
        <User size={22} className="opacity-60" />
        <span className="text-[9px] font-mono tracking-wider">OWNER PHOTO</span>
      </div>

      {/* Story text and signature */}
      <div className="flex-1 flex flex-col justify-center gap-3">
        <div className="h-2.5 w-20 rounded bg-tr-raised border-[0.5px] border-tr-line-strong" />
        <div className="h-5 w-48 rounded bg-tr-line-strong/90" />
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="h-1.5 w-full rounded bg-tr-line-strong/60" />
          <div className="h-1.5 w-11/12 rounded bg-tr-line-strong/50" />
          <div className="h-1.5 w-3/4 rounded bg-tr-line-strong/40" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t-[0.5px] border-tr-line/60">
          <div className="h-5 w-24 rounded border-[0.5px] border-dashed border-tr-line-strong flex items-center justify-center text-[8px] font-mono text-tr-text-mute">
            SIGNATURE
          </div>
          <div className="h-6 px-3 rounded bg-tr-raised border-[0.5px] border-tr-line-strong text-[9px] font-mono text-tr-text-dim flex items-center">
            LEARN MORE
          </div>
        </div>
      </div>
    </div>
  );
}
