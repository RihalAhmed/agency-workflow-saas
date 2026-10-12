"use client";

import "@/styles/trust-tokens.css";
import React, { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, AlertCircle, ShieldCheck, Sparkles, BookmarkCheck, ArrowLeft, ArrowRight } from "lucide-react";
import type { RowKey, TrustAuditRow } from "@/lib/trust/types";
import { VerdictStrip } from "./VerdictStrip";
import { TrustXray } from "./TrustXray";
import { TrustRowTable, type PinnedPieceSummary } from "./TrustRowTable";
import { PortfolioPickDrawer, type PortfolioPieceItem } from "./PortfolioPickDrawer";

interface TrustSegmentProps {
  auditId: string;
  url?: string;
  isActive?: boolean;
  onNavigateTab?: (tab: string) => void;
}

export function TrustSegment({
  auditId,
  url,
  isActive = true,
  onNavigateTab,
}: TrustSegmentProps) {
  const [data, setData] = useState<TrustAuditRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [computing, setComputing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [rescoring, setRescoring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeBlueprint, setActiveBlueprint] = useState<{ id: string; niche: string; title: string } | null>(null);
  const [pins, setPins] = useState<Record<string, PinnedPieceSummary>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // UX static loading timer state (1.8s)
  const [minDelayPassed, setMinDelayPassed] = useState<boolean>(false);
  const [hasShownLoading, setHasShownLoading] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<number>(0);

  // Portfolio Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRowKey, setDrawerRowKey] = useState<RowKey | null>(null);

  useEffect(() => {
    if (isActive && !hasShownLoading) {
      setProgressStep(0);
      const step1 = setTimeout(() => setProgressStep(1), 600);
      const step2 = setTimeout(() => setProgressStep(2), 1200);
      const finish = setTimeout(() => {
        setMinDelayPassed(true);
        setHasShownLoading(true);
      }, 1800);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(finish);
      };
    }
  }, [isActive, hasShownLoading]);

  const loadOrCompute = async (force = false) => {
    try {
      setError(null);
      if (force) {
        setComputing(true);
        setMinDelayPassed(false);
        setHasShownLoading(false);
        setProgressStep(0);
      } else {
        setLoading(true);
      }

      // 1. Try reading cached trust audit first
      if (!force) {
        const getRes = await fetch(`/api/trust/${auditId}`);
        if (getRes.ok) {
          const resJson = await getRes.json();
          if (resJson.trustAudit) {
            setData(resJson.trustAudit);
            if (resJson.activeBlueprint) setActiveBlueprint(resJson.activeBlueprint);
            if (resJson.pins) {
              const pinMap: Record<string, PinnedPieceSummary> = {};
              for (const p of resJson.pins) {
                if (p.row_key && p.portfolio_piece) {
                  pinMap[p.row_key] = p.portfolio_piece;
                }
              }
              setPins(pinMap);
            }
            setLoading(false);
            return;
          }
        }
      }

      // 2. Trigger compute if not yet cached or force requested
      setComputing(true);
      const postRes = await fetch("/api/trust/compute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, force }),
      });

      const postJson = await postRes.json();
      if (!postRes.ok || !postJson.trustAudit) {
        throw new Error(postJson.error || "Failed to compute trust audit");
      }

      // Refresh signed URLs & pins
      const getRes = await fetch(`/api/trust/${auditId}`);
      if (getRes.ok) {
        const resJson = await getRes.json();
        setData(resJson.trustAudit || postJson.trustAudit);
        if (resJson.activeBlueprint) setActiveBlueprint(resJson.activeBlueprint);
        if (resJson.pins) {
          const pinMap: Record<string, PinnedPieceSummary> = {};
          for (const p of resJson.pins) {
            if (p.row_key && p.portfolio_piece) {
              pinMap[p.row_key] = p.portfolio_piece;
            }
          }
          setPins(pinMap);
        }
      } else {
        setData(postJson.trustAudit);
      }
    } catch (err: any) {
      console.error("[TrustSegment] Load error:", err);
      setError(err?.message || "Failed to load trust audit");
    } finally {
      setLoading(false);
      setComputing(false);
    }
  };

  useEffect(() => {
    if (auditId) {
      loadOrCompute(false);
    }
  }, [auditId]);

  const handleManualOverride = async (rowKey: RowKey, newScore: number) => {
    if (!data) return;
    const updatedScores = data.scores.map((r) =>
      r.key === rowKey ? { ...r, score: newScore, manuallyOverridden: true } : r
    );
    const sum = updatedScores.reduce((acc, curr) => acc + curr.score, 0);
    const updatedOverall = Math.round((sum / (updatedScores.length * 10)) * 100);

    // Optimistic UI update
    setData({
      ...data,
      scores: updatedScores,
      overall_score: updatedOverall,
    });

    try {
      await fetch("/api/trust/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trustAuditId: data.id,
          rowKey,
          score: newScore,
        }),
      });
    } catch (err) {
      console.error("[TrustSegment] Override persist failed:", err);
    }
  };

  const handleRescore = async () => {
    if (!data) return;
    try {
      setRescoring(true);
      const res = await fetch("/api/trust/rescore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trustAuditId: data.id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to rescore audit");

      // Reload fresh audit details with currentBlueprintTitle
      const getRes = await fetch(`/api/trust/${auditId}`);
      if (getRes.ok) {
        const resJson = await getRes.json();
        setData(resJson.trustAudit);
        if (resJson.activeBlueprint) setActiveBlueprint(resJson.activeBlueprint);
      }
    } catch (err: any) {
      alert(`Rescore failed: ${err.message}`);
    } finally {
      setRescoring(false);
    }
  };

  const handleSlotClick = (slotName: string) => {
    const tableEl = document.getElementById("trust-row-table");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("trustAuditId", data.id);
      fd.append("file", file);

      const res = await fetch("/api/trust/screenshot/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to upload screenshot");
      }

      // Reload data to pull fresh signed slice URLs
      const getRes = await fetch(`/api/trust/${auditId}`);
      if (getRes.ok) {
        const resJson = await getRes.json();
        setData(resJson.trustAudit);
      }
    } catch (err: any) {
      alert(`Screenshot upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleOpenDrawer = (rowKey: RowKey) => {
    setDrawerRowKey(rowKey);
    setDrawerOpen(true);
  };

  const handlePinSaved = (rowKey: RowKey, piece: PortfolioPieceItem) => {
    setPins((prev) => ({
      ...prev,
      [rowKey]: {
        id: piece.id,
        title: piece.title,
        source_url: piece.source_url,
        niche: piece.niche,
        signedScreenshotUrl: piece.signedScreenshotUrl,
      },
    }));
  };

  const handlePinRemoved = (rowKey: RowKey) => {
    setPins((prev) => {
      const next = { ...prev };
      delete next[rowKey];
      return next;
    });
  };

  const handleBlueprintActivated = (niche: string, blueprintId: string) => {
    setActiveBlueprint({
      id: blueprintId,
      niche,
      title: "Newly Activated Blueprint",
    });
  };

  // Loading state (shows when computing/fetching OR during the 1.8s UX simulated scan)
  const isWaiting = loading || computing || (isActive && !minDelayPassed && !hasShownLoading);

  if (isWaiting) {
    const loadingTitles = [
      "Analyzing Trust Signals & Layout...",
      "Evaluating Human Presence & Proof...",
      "Compiling 6-Point Trust Scorecard...",
    ];
    const loadingSubtitles = [
      "Running Playwright viewport inspection, analyzing human face presence, credential chips, and review platforms...",
      "Cross-referencing credential badges, security seals, and social authority markers...",
      "Calculating overall trust rating and generating actionable credibility insights...",
    ];

    const currentTitle = computing
      ? "Analyzing Trust Signals & Layout..."
      : loadingTitles[progressStep] || loadingTitles[0];
    const currentSubtitle = computing
      ? "Running Playwright viewport inspection, analyzing human face presence, credential chips, and review platforms..."
      : loadingSubtitles[progressStep] || loadingSubtitles[0];

    return (
      <div className="w-full flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-[#12131A] rounded-[24px] border border-gray-200/60 dark:border-white/[0.08] text-center shadow-sm relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center animate-pulse border border-blue-500/20">
            <ShieldCheck size={34} className="text-blue-600 dark:text-blue-400" />
          </div>
          <Loader2 size={54} className="absolute text-blue-600 animate-spin opacity-40" />
        </div>

        <h3 className="text-[18px] font-bold text-gray-900 dark:text-white transition-all duration-300">
          {currentTitle}
        </h3>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[440px] mt-2 leading-relaxed transition-all duration-300">
          {currentSubtitle}
        </p>

        {/* 1.8s UX Progress Bar */}
        <div className="w-64 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-700 ease-out"
            style={{
              width: progressStep === 0 ? "35%" : progressStep === 1 ? "75%" : "100%",
            }}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="w-full p-8 bg-red-500/5 rounded-[16px] border border-red-500/20 text-center">
        <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
        <h3 className="text-[16px] font-bold text-red-700 dark:text-red-400">
          Unable to run Trust Audit
        </h3>
        <p className="text-[13px] text-red-600/80 dark:text-red-400/80 max-w-md mx-auto mt-1 mb-4">
          {error || "An error occurred while evaluating trust signals."}
        </p>
        <button
          onClick={() => loadOrCompute(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-red-600 text-white font-semibold text-[13px] hover:bg-red-700 transition-all cursor-pointer"
        >
          <RefreshCw size={14} />
          Retry Trust Scan
        </button>
      </div>
    );
  }

  const activeRowObj = data.scores.find((r) => r.key === drawerRowKey);

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Hidden file input for screenshot fallback upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight">
          Trust & Conversion Diagnostic
        </h2>
      </div>

      {/* 1. Verdict Strip (Score, Coverage, Angle) */}
      <VerdictStrip trustAudit={data} />

      {/* 2. Trust X-ray (Live Screenshot Slices + Schematic Overlay) */}
      <TrustXray
        signals={data.signals}
        signedRegionSlices={data.signedRegionSlices}
        screenshotSource={data.screenshot_source}
        onSlotClick={handleSlotClick}
        onUploadClick={() => fileInputRef.current?.click()}
      />

      {/* 3. 6-Point Scorecard & Talking Points */}
      <div id="trust-row-table">
        <TrustRowTable
          rows={data.scores}
          pins={pins}
          onOverrideScore={handleManualOverride}
          onOpenPortfolioDrawer={handleOpenDrawer}
        />
      </div>

      {/* 4. Portfolio Pinning Drawer */}
      <PortfolioPickDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        trustAuditId={data.id}
        rowKey={drawerRowKey}
        rowLabel={activeRowObj?.label}
        currentNiche={data.niche || undefined}
        pinnedPieceId={drawerRowKey ? pins[drawerRowKey]?.id : null}
        onPinSaved={handlePinSaved}
        onPinRemoved={handlePinRemoved}
        onBlueprintActivated={handleBlueprintActivated}
      />

      {/* Trust Audit Configuration & Rescan Controls (Relocated to bottom) */}
      <div className="flex flex-col gap-4 pt-6 border-t border-gray-200 dark:border-white/10 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            Automated analysis of social proof, risk reversal, personality, and visual anchors.
          </p>
          <div className="flex items-center gap-2">
            {uploading ? (
              <span className="flex items-center gap-1.5 text-[12px] text-blue-600 font-semibold px-2 py-1">
                <Loader2 size={13} className="animate-spin" />
                Slicing screenshot...
              </span>
            ) : null}

            <button
              onClick={() => loadOrCompute(true)}
              disabled={computing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white dark:bg-[#1A1C28] border border-gray-200/80 dark:border-white/10 text-[12px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw size={13} className={computing ? "animate-spin" : ""} />
              Re-scan Trust
            </button>
          </div>
        </div>

        {/* Blueprint Benchmark & Rescore Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[12px] bg-gradient-to-r from-blue-500/[0.06] via-indigo-500/[0.04] to-transparent border border-blue-500/20 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-bold text-gray-900 dark:text-white">
                  Scoring Standard:
                </span>
                {data.active_blueprint_id ? (
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-[4px] border border-indigo-500/20">
                    Blueprint: {(data as any).currentBlueprintTitle || "Custom Agency Portfolio"}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-[4px]">
                    SOP Baseline Heuristics
                  </span>
                )}
                {activeBlueprint && !data.active_blueprint_id && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Active BP Available
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {data.active_blueprint_id
                  ? "Calibrated directly against your agency's best-in-class portfolio reference."
                  : activeBlueprint
                  ? `An active Blueprint is ready for this niche (${activeBlueprint.title}). Rescore to apply custom weights.`
                  : "Deterministic 0–10 scoring based on Dean's standard conversion heuristics."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRescore}
              disabled={rescoring}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-blue-600 text-white font-bold text-[12px] hover:bg-blue-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={rescoring ? "animate-spin" : ""} />
              <span>{rescoring ? "Rescoring..." : "Rescore Audit"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Navigation Footer */}
      <div className="w-full flex items-center justify-between pt-8 pb-4 border-t border-gray-200 dark:border-white/10 mt-12">
        <button
          onClick={() => {
            onNavigateTab?.("SEO Audit");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-[13px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft size={15} />
          <span>Back to SEO Audit</span>
        </button>

        <button
          onClick={() => {
            onNavigateTab?.("Conversion");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[13px] font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer shadow-md shadow-blue-500/20"
        >
          <span>Next: Conversion Segment</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
