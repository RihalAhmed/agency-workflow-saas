"use client";

import { useState, useTransition, Suspense, useEffect } from "react";
import { MailCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ConfirmPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = () => {
    if (!email || countdown > 0) return;
    startTransition(async () => {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Verification email resent successfully!");
        setCountdown(60);
      } else {
        setMessage(`⚠️ ${data.error || "Failed to resend email."}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[128px] mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <MailCheck className="w-8 h-8 text-green-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Check your email</h1>
        <p className="text-white/60 mb-6">
          We've sent a confirmation link to <br/>
          <strong className="text-white">{email || "your email address"}</strong>.<br/>
          Please click the link to verify your account.
        </p>

        {message && (
          <div className="mb-6 p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white/90">
            {message}
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <Link 
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-colors"
          >
            Return to login
          </Link>

          {email && (
            <button 
              onClick={handleResend}
              disabled={isPending || countdown > 0}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend verification email"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <ConfirmPageContent />
    </Suspense>
  );
}
