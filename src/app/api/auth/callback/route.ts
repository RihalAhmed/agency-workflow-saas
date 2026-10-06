import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/auth/supabase-server";
import { getSafeRedirect } from "@/lib/auth/safe-redirect";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/audit";
  
  if (code) {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Successful auth, redirect to the intended destination
      const redirectUrl = new URL(getSafeRedirect(next), request.url);
      
      const forwardedHost = request.headers.get("x-forwarded-host");
      if (forwardedHost) {
        redirectUrl.host = forwardedHost;
        const forwardedProto = request.headers.get("x-forwarded-proto");
        if (forwardedProto) {
          redirectUrl.protocol = `${forwardedProto}:`;
        } else if (!forwardedHost.includes("localhost")) {
          redirectUrl.protocol = "https:";
        }
      }
      
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If there's an error or no code, redirect to login with an error
  const errorUrl = new URL("/login?error=Invalid+or+expired+link", request.url);
  return NextResponse.redirect(errorUrl);
}
