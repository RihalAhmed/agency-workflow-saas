"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Edit2, Loader2, Trash2, X } from "lucide-react";
import { Sop } from "./useSops";

interface SopTitleRowProps {
  sop: Sop;
  onActivate: (id: string) => Promise<void>;
  onRename: (id: string, newTitle: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  processingId: string | null;
  setProcessingId: (id: string | null) => void;
}

export function SopTitleRow({ sop, onActivate, onRename, onDelete, processingId, setProcessingId }: SopTitleRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(sop.title);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAction = async (action: () => Promise<void>, id: string) => {
    if (processingId) return;
    setProcessingId(id);
    try {
      await action();
    } finally {
      setProcessingId(null);
    }
  };

  const submitEdit = async () => {
    const newTitle = editValue.trim();
    if (!newTitle) {
      setError("Title cannot be empty");
      return;
    }
    if (newTitle === sop.title) {
      setIsEditing(false);
      return;
    }
    setError(null);
    setIsEditing(false);
    await handleAction(() => onRename(sop.id, newTitle), sop.id);
  };

  const cancelEdit = () => {
    setEditValue(sop.title);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submitEdit();
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className="relative group flex items-center gap-3 p-4 transition-all">
      <div className="flex-1 min-w-0 flex flex-col">
        {isEditing ? (
          <div className="flex flex-col gap-1">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                if (e.target.value.trim().length > 0) setError(null);
              }}
              onKeyDown={handleKeyDown}
              onBlur={submitEdit}
              maxLength={120}
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            {error && <span className="text-red-400 text-xs">{error}</span>}
            <span className="text-white/40 text-[10px] self-end">{editValue.length}/120</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span 
              className="text-white/90 font-medium truncate text-base cursor-pointer"
              onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              title="Double-click to rename"
            >
              {sop.title}
            </span>
          </div>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); handleAction(() => onDelete(sop.id), sop.id); }}
            disabled={!!processingId}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 hover:bg-red-400/10`}
            aria-label="Delete SOP"
          >
            {processingId === sop.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
