"use client";

import React, { useState } from "react";
import { X, Save } from "lucide-react";

export interface PencilEditorProps {
  sectionId: string;
  sectionType: string;
  content: Record<string, unknown>;
  onSave: (content: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export function PencilEditor({ sectionType, content, onSave, onClose }: PencilEditorProps) {
  const [draft, setDraft] = useState<Record<string, unknown>>(content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(draft);
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <h3 className="text-lg font-bold text-white capitalize">
            Edit <span className="text-amber-400">{sectionType}</span> Section
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Form) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {Object.entries(draft).map(([key, value]) => {
            // Ignore non-string/non-array content for this simple demo editor
            if (typeof value === "string") {
              return (
                <div key={key}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  {value.length > 60 ? (
                    <textarea
                      value={value}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  )}
                </div>
              );
            }
            if (Array.isArray(value) && typeof value[0] === "string") {
              return (
                <div key={key} className="space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  {value.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-xs text-slate-500 mt-3">{idx + 1}.</span>
                      <textarea
                        value={item}
                        onChange={(e) => {
                          const newArr = [...value];
                          newArr[idx] = e.target.value;
                          setDraft({ ...draft, [key]: newArr });
                        }}
                        rows={2}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>
              );
            }
            return null; // Skip complex objects like subBadges for now
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-950/50 border-y border-red-900/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-sm font-bold rounded-lg shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
