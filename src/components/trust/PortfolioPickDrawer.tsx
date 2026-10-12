"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Plus,
  ExternalLink,
  Check,
  Loader2,
  BookmarkCheck,
  Sparkles,
  Upload,
  Globe,
  Trash2,
  Filter,
} from "lucide-react";
import type { Niche, RowKey } from "@/lib/trust/types";
import { NICHES } from "@/lib/trust/types";

export interface PortfolioPieceItem {
  id: string;
  title: string;
  source_url: string | null;
  niche: Niche;
  screenshot_url: string;
  slot_tags: string[];
  blueprint_id: string | null;
  signedScreenshotUrl?: string | null;
  isActiveBlueprint?: boolean;
}

interface PortfolioPickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trustAuditId: string;
  rowKey: RowKey | null;
  rowLabel?: string;
  currentNiche?: string;
  pinnedPieceId?: string | null;
  onPinSaved: (rowKey: RowKey, piece: PortfolioPieceItem) => void;
  onPinRemoved: (rowKey: RowKey) => void;
  onBlueprintActivated?: (niche: string, blueprintId: string) => void;
}

export function PortfolioPickDrawer({
  isOpen,
  onClose,
  trustAuditId,
  rowKey,
  rowLabel,
  currentNiche,
  pinnedPieceId,
  onPinSaved,
  onPinRemoved,
  onBlueprintActivated,
}: PortfolioPickDrawerProps) {
  const [pieces, setPieces] = useState<PortfolioPieceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<string>(currentNiche || "all");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New piece form state
  const [newTitle, setNewTitle] = useState("");
  const [newNiche, setNewNiche] = useState<Niche>((currentNiche as Niche) || "roofing");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchPieces = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/portfolio/list");
      if (res.ok) {
        const json = await res.json();
        setPieces(json.items || []);
      }
    } catch (err) {
      console.error("[PortfolioPickDrawer] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPieces();
      setShowAddForm(false);
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen || !rowKey) return null;

  const filteredPieces = pieces.filter((p) => {
    if (selectedNiche === "all") return true;
    return p.niche === selectedNiche;
  });

  const handlePin = async (piece: PortfolioPieceItem) => {
    try {
      setActionLoading(`pin-${piece.id}`);
      const res = await fetch("/api/trust/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trustAuditId,
          rowKey,
          portfolioPieceId: piece.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to pin piece");

      onPinSaved(rowKey, piece);
      onClose();
    } catch (err: any) {
      alert(`Pin failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpin = async () => {
    try {
      setActionLoading("unpin");
      const res = await fetch("/api/trust/pin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trustAuditId,
          rowKey,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to unpin piece");

      onPinRemoved(rowKey);
      onClose();
    } catch (err: any) {
      alert(`Unpin failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateBlueprint = async (piece: PortfolioPieceItem) => {
    if (!piece.blueprint_id) return;
    try {
      setActionLoading(`bp-${piece.id}`);
      const res = await fetch("/api/blueprints/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: piece.niche,
          blueprintId: piece.blueprint_id,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to activate blueprint");

      // Update state locally
      setPieces((prev) =>
        prev.map((p) => ({
          ...p,
          isActiveBlueprint: p.niche === piece.niche ? p.id === piece.id : p.isActiveBlueprint,
        }))
      );

      onBlueprintActivated?.(piece.niche, piece.blueprint_id);
    } catch (err: any) {
      alert(`Blueprint activation failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePiece = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError("Title is required");
      return;
    }
    if (uploadMode === "url" && !newSourceUrl.trim()) {
      setFormError("Website URL is required");
      return;
    }
    if (uploadMode === "file" && !uploadFile) {
      setFormError("Please select a screenshot image");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const fd = new FormData();
      fd.append("title", newTitle.trim());
      fd.append("niche", newNiche);
      if (uploadMode === "url") {
        fd.append("sourceUrl", newSourceUrl.trim());
      } else if (uploadFile) {
        fd.append("file", uploadFile);
      }

      const res = await fetch("/api/portfolio/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      // Reset form
      setNewTitle("");
      setNewSourceUrl("");
      setUploadFile(null);
      setShowAddForm(false);

      // Re-fetch pieces list
      await fetchPieces();

      // Automatically pin newly created piece
      if (json.portfolioPiece) {
        await handlePin(json.portfolioPiece);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to create portfolio piece");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Drawer Container */}
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-[#12131A] shadow-2xl flex flex-col border-l border-gray-200/80 dark:border-white/10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Pin Portfolio Proof
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="text-[12px] font-semibold text-gray-500 dark:text-gray-400">
                {rowLabel || rowKey}
              </span>
            </div>
            <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mt-0.5">
              Select Agency Reference Work
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Action / Filter Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/5 gap-3 bg-gray-50/20 dark:bg-transparent">
          {/* Niche Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            <button
              onClick={() => setSelectedNiche("all")}
              className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedNiche === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              All Niches
            </button>
            {NICHES.map((n) => (
              <button
                key={n}
                onClick={() => setSelectedNiche(n)}
                className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold capitalize whitespace-nowrap transition-all ${
                  selectedNiche === n
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                }`}
              >
                {n.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* New Piece Toggle */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 text-[11px] font-bold hover:bg-blue-100 transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Work</span>
          </button>
        </div>

        {/* Add Work Slide-down form */}
        {showAddForm && (
          <div className="p-4 border-b border-gray-200/80 dark:border-white/10 bg-blue-50/30 dark:bg-blue-950/20">
            <h4 className="text-[13px] font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-600" />
              Upload Portfolio Piece & Extract Blueprint
            </h4>
            <form onSubmit={handleCreatePiece} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Project / Client Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Roofing - Hero Proof"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="mt-1 w-full px-2.5 py-1.5 rounded-[6px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1C28] text-[12px] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                    Niche
                  </label>
                  <select
                    value={newNiche}
                    onChange={(e) => setNewNiche(e.target.value as Niche)}
                    className="mt-1 w-full px-2.5 py-1.5 rounded-[6px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1C28] text-[12px] text-gray-900 dark:text-white capitalize focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {NICHES.map((n) => (
                      <option key={n} value={n}>
                        {n.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source Type Toggle */}
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMode"
                    checked={uploadMode === "url"}
                    onChange={() => setUploadMode("url")}
                  />
                  <span>Live Website URL</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadMode"
                    checked={uploadMode === "file"}
                    onChange={() => setUploadMode("file")}
                  />
                  <span>Image Screenshot Upload</span>
                </label>
              </div>

              {uploadMode === "url" ? (
                <div>
                  <input
                    type="url"
                    placeholder="https://apexroofing.com"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-[6px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1C28] text-[12px] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Playwright will render the site, run face detection, and capture a 1440px desktop snapshot.
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-[6px] file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}

              {formError && (
                <p className="text-[11px] text-red-500 font-semibold">{formError}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 rounded-[6px] text-[11px] font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Crawling & Extracting...
                    </>
                  ) : (
                    "Save & Pin Piece"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Portfolio Piece List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 size={24} className="animate-spin mb-2 text-blue-600" />
              <span className="text-[12px] font-semibold">Loading portfolio library...</span>
            </div>
          ) : filteredPieces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4 rounded-[12px] border border-dashed border-gray-200 dark:border-white/10">
              <BookmarkCheck size={36} className="text-gray-300 dark:text-gray-600 mb-2" />
              <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-200">
                No portfolio pieces found
              </h4>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 max-w-sm mt-1 mb-4">
                Add an agency project URL or screenshot above to extract its Trust Blueprint and pin it to this audit row.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3.5 py-1.5 rounded-[8px] bg-blue-600 text-white font-bold text-[12px] hover:bg-blue-700 transition-all cursor-pointer"
              >
                Add Your First Portfolio Piece
              </button>
            </div>
          ) : (
            filteredPieces.map((piece) => {
              const isCurrentlyPinned = piece.id === pinnedPieceId;
              const isPinning = actionLoading === `pin-${piece.id}`;
              const isActivatingBp = actionLoading === `bp-${piece.id}`;

              return (
                <div
                  key={piece.id}
                  className={`rounded-[12px] border transition-all overflow-hidden bg-white dark:bg-[#161822] ${
                    isCurrentlyPinned
                      ? "border-emerald-500/50 ring-1 ring-emerald-500/30"
                      : "border-gray-200/70 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-[140px] h-[95px] shrink-0 rounded-[8px] overflow-hidden bg-gray-100 dark:bg-black/30 border border-gray-200/50 dark:border-white/5 relative">
                      {piece.signedScreenshotUrl ? (
                        <img
                          src={piece.signedScreenshotUrl}
                          alt={piece.title}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[11px]">
                          No Preview
                        </div>
                      )}
                      {piece.isActiveBlueprint && (
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                          <Sparkles size={9} />
                          Active BP
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                            {piece.title}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 capitalize shrink-0">
                            {piece.niche.replace("_", " ")}
                          </span>
                        </div>

                        {piece.source_url && (
                          <a
                            href={piece.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline mt-0.5 truncate max-w-full"
                          >
                            <Globe size={11} />
                            <span className="truncate">{piece.source_url}</span>
                            <ExternalLink size={10} className="shrink-0" />
                          </a>
                        )}

                        {/* Slot tags */}
                        {piece.slot_tags && piece.slot_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {piece.slot_tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              >
                                {tag.replace("_", " ")}
                              </span>
                            ))}
                            {piece.slot_tags.length > 4 && (
                              <span className="text-[9px] text-gray-400 px-1">
                                +{piece.slot_tags.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 dark:border-white/5 gap-2">
                        {/* Blueprint activation */}
                        {piece.blueprint_id ? (
                          <button
                            onClick={() => handleActivateBlueprint(piece)}
                            disabled={piece.isActiveBlueprint || isActivatingBp}
                            className={`text-[10px] font-semibold px-2 py-1 rounded-[5px] transition-all flex items-center gap-1 ${
                              piece.isActiveBlueprint
                                ? "text-blue-600 dark:text-blue-400 cursor-default"
                                : "text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                            }`}
                          >
                            {isActivatingBp ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Sparkles size={11} />
                            )}
                            <span>
                              {piece.isActiveBlueprint ? "Active Standard" : "Set as Blueprint"}
                            </span>
                          </button>
                        ) : (
                          <div />
                        )}

                        {/* Pin / Unpin button */}
                        {isCurrentlyPinned ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-[6px]">
                              <Check size={12} />
                              Pinned
                            </span>
                            <button
                              onClick={handleUnpin}
                              disabled={actionLoading === "unpin"}
                              className="text-[11px] font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded-[6px] hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              {actionLoading === "unpin" ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : (
                                <Trash2 size={11} />
                              )}
                              Unpin
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePin(piece)}
                            disabled={isPinning}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {isPinning ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <BookmarkCheck size={12} />
                            )}
                            Pin to Row
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
