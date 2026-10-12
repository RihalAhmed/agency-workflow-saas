"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2
} from "lucide-react";
import { 
  IconCameraStar, 
  IconClipboardCheck, 
  IconCalendar, 
  IconChevronBlack, 
  IconChevronWhite, 
  IconSopStar, 
  IconWindowBrowser 
} from "@/components/icons/AuditIcons";
import { AuditHeader } from "@/components/audit/AuditHeader";

const SEGMENT_TABS = ["SEO Audit", "Trust", "Conversion"] as const;

const TYPING_PLACEHOLDERS = [
  "bestofroofing.com.uk",
  "plumbersexpert.com",
  "ourpestcontrol.com",
  "remodelhousedealers.com"
];

function TypingInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typeSpeed = 70;
    const deleteSpeed = 40;
    const delayBeforeDelete = 1500;

    const text = TYPING_PLACEHOLDERS[placeholderIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && currentText === text) {
      timer = setTimeout(() => setIsDeleting(true), delayBeforeDelete);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % TYPING_PLACEHOLDERS.length);
    } else {
      timer = setTimeout(() => {
        setCurrentText(
          isDeleting
            ? text.substring(0, currentText.length - 1)
            : text.substring(0, currentText.length + 1)
        );
      }, isDeleting ? deleteSpeed : typeSpeed);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, placeholderIndex]);

  return (
    <input
      type="text"
      placeholder={currentText || "|"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full h-full bg-transparent outline-none text-[#e5e5e5]/70 text-[16px] font-normal placeholder:text-[#e5e5e5]/70"
    />
  );
}


export default function AuditDashboard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab] = useState<string>("SEO Audit");

  const router = useRouter();

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
        }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/audit/${data.slug}`);
      } else {
        alert("Error: " + data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start audit.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-[#000000] via-[#533afd] to-[#000000] rounded-[25px] overflow-hidden">
      <AuditHeader activeTab={activeTab} />

      <main className="flex-1 flex flex-col bg-white rounded-[30px] mx-1 mb-1 relative overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="w-full h-full min-h-full flex flex-col items-center justify-center -mt-32">
          
          <h2 className="text-[24px] font-bold text-black mb-4 -mt-[60px]">
            Run a Website Audit
          </h2>
          
          <p className="text-[16px] text-black max-w-[712px] text-center mb-8">
            Enter a prospect's website to get an instant grade across SEO, usability, GEO, and performance, with prioritized fixes you can act on right away.
          </p>

          <form onSubmit={handleRunAudit} className="flex flex-col items-center w-full">
              <div className="w-full max-w-[680px] h-[52px] bg-[#221e34] rounded-[99px] flex items-center justify-between p-1.5 shadow-lg relative z-10">
              <div className="flex items-center flex-1 h-full pl-5">
                <IconWindowBrowser className="mr-3 shrink-0" />
                <TypingInput value={url} onChange={setUrl} />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-full bg-white hover:bg-gray-100 text-black font-semibold text-[13px] rounded-[99px] px-6 flex items-center justify-center transition-all disabled:opacity-50 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                Start the audit
              </button>
            </div>
            
            <p className="text-[12px] text-[#8d8d8d] mt-4 text-center w-full">
              We only read what's visible to any visitor.
            </p>
          </form>
          
        </div>
        </div>
      </main>
    </div>
  );
}
