"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Pencil, CheckCircle2 } from "lucide-react";
import { PencilEditor } from "./PencilEditor";

export interface EditableWrapperProps {
  slug: string;
  sectionId: string;
  sectionType: string;
  initialContent: Record<string, unknown>;
  children: React.ReactNode;
}

export function EditableWrapper({
  slug,
  sectionId,
  sectionType,
  initialContent,
  children,
}: EditableWrapperProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isEditing = searchParams?.get("edit") === "true";
  const [isHovered, setIsHovered] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // If not in edit mode, just render children directly.
  // Note: For a fully functional editor we'd pass the overridden `content` down to the children.
  // In this demo, we wrap the section component, but the section component is already rendered by the page.
  // To truly hot-swap content, the page needs to use EditableWrapper and pass the data down.
  // For V1.1, we just render the wrapper and log saves to demonstrate the UI.
  if (!isEditing) {
    return <>{children}</>;
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* The Section Component */}
      <div className={`transition-all duration-300 ${isHovered && !isEditorOpen ? "ring-2 ring-amber-400 opacity-90" : ""}`}>
        {children}
      </div>

      {/* Pencil Icon (Top Right of Section) */}
      {isHovered && !isEditorOpen && (
        <button
          onClick={() => setIsEditorOpen(true)}
          className="absolute top-4 right-4 z-50 bg-amber-400 hover:bg-amber-500 text-slate-900 p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
          title={`Edit ${sectionType}`}
        >
          <Pencil className="w-5 h-5" />
        </button>
      )}

      {/* Inline Editor Overlay */}
      {isEditorOpen && (
        <PencilEditor
          sectionId={sectionId}
          sectionType={sectionType}
          content={content}
          onSave={async (newContent) => {
            const res = await fetch("/api/update-section", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug, sectionId, content: newContent }),
            });
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.error || "Failed to update section.");
            }
            setContent(newContent);
            setIsEditorOpen(false);
            
            setShowSuccessToast(true);
            setTimeout(() => setShowSuccessToast(false), 3000);
            
            router.refresh();
          }}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">Changes saved!</span>
        </div>
      )}
    </div>
  );
}
