"use client";

import { useEffect, useState } from "react";
import mammoth from "mammoth/mammoth.browser";
import { sanitizeHtml } from "@/lib/sop/sanitize";
import { SopSheet } from "./SopSheet";
import { Loader2, AlertCircle } from "lucide-react";

export default function DocxViewer({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    
    async function fetchAndRender() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to download document");
        
        const arrayBuffer = await res.arrayBuffer();
        if (aborted) return;
        
        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (aborted) return;
        
        const safeHtml = sanitizeHtml(result.value);
        setHtml(safeHtml);
      } catch (err: any) {
        if (!aborted) setError(err.message || "Failed to render document");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    
    fetchAndRender();
    return () => { aborted = true; };
  }, [url]);

  if (loading) {
    return (
      <SopSheet className="flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading DOCX...</p>
      </SopSheet>
    );
  }

  if (error) {
    return (
      <SopSheet className="flex flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="font-medium text-center">Failed to load document</p>
        <p className="text-sm opacity-80">{error}</p>
      </SopSheet>
    );
  }

  return (
    <SopSheet>
      <div 
        className="
          text-2xl sm:text-3xl
          [&_h1]:text-5xl sm:[&_h1]:text-6xl [&_h1]:font-bold [&_h1]:mb-6
          [&_h2]:text-4xl sm:[&_h2]:text-5xl [&_h2]:font-semibold [&_h2]:mb-4 [&_h2]:mt-8
          [&_h3]:text-3xl sm:[&_h3]:text-4xl [&_h3]:font-medium [&_h3]:mb-3 [&_h3]:mt-6
          [&_p]:mb-4 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-1
          [&_a]:text-blue-600 [&_a]:underline
          [&_table]:w-full [&_table]:mb-4 [&_table]:border-collapse
          [&_td]:border [&_td]:border-slate-300 [&_td]:p-3
          [&_th]:border [&_th]:border-slate-300 [&_th]:p-3 [&_th]:bg-slate-50
          [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4
        "
        dangerouslySetInnerHTML={{ __html: html || "" }} 
      />
    </SopSheet>
  );
}
