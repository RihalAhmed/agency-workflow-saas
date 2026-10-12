"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, FileUp } from "lucide-react";
import { MAX_FILE_BYTES, MAX_SOPS, EXTENSION_MIME_MAP } from "@/lib/sop/constants";
import { Sop } from "./useSops";

interface SopUploadZoneProps {
  onUpload: (file: File) => Promise<void>;
  sops: Sop[];
  error: string | null;
  variant?: "large" | "fab";
}

export function SopUploadZone({ onUpload, sops, error, variant = "large" }: SopUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limitReached = sops.length >= MAX_SOPS;

  const handleFile = async (file: File) => {
    if (limitReached) return;
    
    if (file.size > MAX_FILE_BYTES) {
      alert("File exceeds 5MB limit.");
      return;
    }
    const extMatch = file.name.match(/\.[^.]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : "";
    if (!EXTENSION_MIME_MAP[ext]) {
      alert(`Unsupported file type: ${ext}. Please use PDF, DOCX, DOC, or TXT.`);
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      // Error is handled by the hook and passed back as a prop
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTrigger = () => {
    if (!isUploading && !limitReached) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={variant === "large" ? "w-full" : "relative"}>
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        accept=".pdf,.docx,.doc,.txt"
        disabled={isUploading || limitReached}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      
      {variant === "large" ? (
        <>
          <div 
            onClick={handleTrigger}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`w-full aspect-[4/3] max-h-[300px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer ${
              limitReached 
                ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed" 
                : isDragging 
                  ? "border-blue-500 bg-blue-500/10" 
                  : "border-white/20 bg-white/5 hover:bg-white/10"
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-4 text-blue-400">
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="font-medium text-white/90">Uploading...</span>
              </div>
            ) : limitReached ? (
              <div className="flex flex-col items-center gap-4 text-white/40">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Upload className="w-8 h-8 opacity-50" />
                </div>
                <div className="font-medium">Limit Reached</div>
                <div className="text-sm">Delete an SOP to upload more</div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="w-8 h-8 text-white/80" />
                </div>
                <div className="font-medium text-white/90 text-lg">Upload SOP</div>
                <div className="text-sm text-white/50">
                  PDF, DOCX, DOC or TXT &middot; max 5 MB<br />
                  {sops.length} of {MAX_SOPS} used
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
        </>
      ) : (
        <button
          onClick={handleTrigger}
          disabled={limitReached || isUploading}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all ${
            limitReached
              ? "bg-white/10 text-white/40 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95"
          }`}
          aria-label="Upload new SOP"
        >
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
        </button>
      )}
    </div>
  );
}
