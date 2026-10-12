"use client";

import { useEffect, useState, useRef } from "react";
import { Sop } from "./useSops";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });
import DocxViewer from "./DocxViewer";
import TextViewer from "./TextViewer";
import { Loader2, AlertCircle } from "lucide-react";

export function SopViewer({ sop }: { sop: Sop | null }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let aborted = false;

    async function fetchSignedUrl() {
      if (!sop) {
        setUrl(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        setUrl(null);

        const res = await fetch(`/api/sop/${sop.id}/file`);
        if (!res.ok) {
          throw new Error("Failed to get document access");
        }
        
        const data = await res.json();
        if (aborted) return;

        setUrl(data.url);
      } catch (err: any) {
        if (!aborted) setError(err.message || "Failed to load document");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    fetchSignedUrl();
    return () => { aborted = true; };
  }, [sop]);

  if (!sop) {
    return (
      <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
        <p>Select a document to view</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full flex-1 min-h-0 flex items-center justify-center bg-slate-100 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center bg-slate-100 text-red-400">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  if (!url) return null;

  return (
    <div className="w-full flex-1 min-h-0 overflow-y-auto bg-slate-100 p-4 sm:p-8 relative">
      {sop.mime_type === "application/pdf" && <PdfViewer url={url} />}
      {sop.mime_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && <DocxViewer url={url} />}
      {sop.mime_type === "text/plain" && <TextViewer url={url} />}
      {!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"].includes(sop.mime_type) && (
        <div className="flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
          <p>Unsupported document format</p>
        </div>
      )}
    </div>
  );
}
