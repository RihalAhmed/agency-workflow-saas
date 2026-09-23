"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ResponsivePreviewToolbar, ViewportMode } from "@/lib/editor/ResponsivePreviewToolbar";

export default function PreviewShell({ params }: { params: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = React.use(params).slug;
  
  const initialEditMode = searchParams?.get("edit") === "true";
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [mode, setMode] = useState<ViewportMode>("desktop");
  
  // Update URL state when toggling edit mode
  const handleToggleEditMode = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    
    // Update the shell's URL without reloading
    const newParams = new URLSearchParams(searchParams?.toString() || "");
    if (newEditMode) {
      newParams.set("edit", "true");
    } else {
      newParams.delete("edit");
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const getWidth = () => {
    switch (mode) {
      case "desktop": return "100%";
      case "laptop": return "1366px";
      case "tablet": return "768px";
      case "mobile-landscape": return "667px";
      case "mobile-portrait": return "375px";
      default: return "100%";
    }
  };

  const iframeSrc = `/preview/${slug}/view${isEditMode ? "?edit=true" : ""}`;

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 overflow-hidden font-body">
      <ResponsivePreviewToolbar 
        currentMode={mode}
        onChange={setMode}
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
      />
      
      <div className="flex-1 w-full bg-slate-900/50 flex justify-center items-start overflow-y-auto overflow-x-hidden p-4 sm:p-8">
        <div 
          className="transition-all duration-300 ease-in-out h-full min-h-[800px]"
          style={{ width: getWidth() }}
        >
          <iframe 
            src={iframeSrc}
            className={`w-full h-full bg-white border-0 ${
              mode !== "desktop" 
                ? "shadow-2xl shadow-black/50 rounded-lg ring-1 ring-slate-800" 
                : ""
            }`}
            title="Website Preview"
          />
        </div>
      </div>
    </div>
  );
}
