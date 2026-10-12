"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, FileText, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSops, Sop } from "./useSops";
import { SopUploadZone } from "./SopUploadZone";
import { SopList } from "./SopList";
import { SopViewer } from "./SopViewer";

interface SopPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SopPanel({ isOpen, onClose }: SopPanelProps) {
  const { sops, loading, error, uploadSop, activateSop, renameSop, deleteSop } = useSops();
  const panelRef = useRef<HTMLDivElement>(null);
  
  const [selectedSopId, setSelectedSopId] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(true);

  // Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (sops.length > 0 && !selectedSopId) {
      const active = sops.find(s => s.is_active);
      if (active) setSelectedSopId(active.id);
      else setSelectedSopId(sops[0].id);
    }
    if (selectedSopId && !sops.find(s => s.id === selectedSopId)) {
      setSelectedSopId(null);
    }
  }, [sops, selectedSopId]);

  const selectedSop = sops.find(s => s.id === selectedSopId) || null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/30 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <div 
        ref={panelRef}
        role="dialog"
        aria-modal={isOpen}
        aria-label="SOP Manager"
        tabIndex={-1}
        className={`fixed top-0 right-0 h-full w-full sm:w-[45vw] lg:w-[40vw] bg-slate-950 border-l border-white/10 shadow-2xl z-[101] flex flex-col outline-none transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}`}
      >
        {/* Left Sidebar (Overlapping outside to the left) */}
        <div 
          className={`absolute top-0 right-full h-full border-l border-white/10 bg-[#0A0A0A] shadow-2xl z-10 transition-all duration-300 ease-in-out overflow-hidden ${
            isListOpen ? "w-full sm:w-[280px] opacity-100 border-r" : "w-0 opacity-0 border-r-0"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0 whitespace-nowrap h-[73px]">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              SOP Documents
            </h2>
            <button 
              onClick={() => setIsListOpen(false)}
              className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-[calc(100%-73px)] overflow-y-auto p-4 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <>
                {sops.length === 0 ? (
                  <SopUploadZone onUpload={uploadSop} sops={sops} error={error} variant="large" />
                ) : (
                  <SopList 
                    sops={sops} 
                    onActivate={activateSop} 
                    onRename={renameSop} 
                    onDelete={deleteSop}
                    selectedSopId={selectedSopId}
                    onSelect={setSelectedSopId}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Pane (Viewer) */}
        <div className="flex-1 flex flex-col relative min-w-0 min-h-0 w-full">
          {/* Header toolbar */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <button 
              onClick={() => setIsListOpen(!isListOpen)}
              className="p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 backdrop-blur border border-white/10 rounded-full transition-all shadow-xl"
              aria-label="Toggle list"
            >
              {isListOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
          </div>

          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={onClose}
              className="p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 backdrop-blur border border-white/10 rounded-full transition-all shadow-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <SopViewer sop={selectedSop} />

          {/* Floating Action Button for Upload (when list has items) */}
          {sops.length > 0 && (
            <div className="absolute bottom-6 right-6 z-30">
              <SopUploadZone onUpload={uploadSop} sops={sops} error={error} variant="fab" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
