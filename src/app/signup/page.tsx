import { AuthForm } from "@/components/auth/AuthForm";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Sign Up | Prosflow",
  description: "Create a new account.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] mix-blend-screen" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] mix-blend-screen" />
      
      <div className="w-full z-10 relative">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/40" /></div>}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
