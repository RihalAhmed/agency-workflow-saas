"use client";

import { useEffect, useState } from "react";
import { SopSheet } from "./SopSheet";
import { Loader2, AlertCircle } from "lucide-react";

export default function TextViewer({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aborted = false;
    
    async function fetchText() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to download document");
        
        const content = await res.text();
        if (aborted) return;
        
        setText(content);
      } catch (err: any) {
        if (!aborted) setError(err.message || "Failed to read text file");
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    
    fetchText();
    return () => { aborted = true; };
  }, [url]);

  if (loading) {
    return (
      <SopSheet className="flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Text...</p>
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
      <pre className="whitespace-pre-wrap font-sans text-lg sm:text-xl leading-relaxed max-w-none">
        {text}
      </pre>
    </SopSheet>
  );
}
