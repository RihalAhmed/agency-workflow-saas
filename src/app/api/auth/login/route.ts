import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/auth/supabase-server";
import { LoginSchema } from "@/lib/auth/schemas";
import { getSafeRedirect } from "@/lib/auth/safe-redirect";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { next, ...loginData } = body;
    
    const result = LoginSchema.safeParse(loginData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.trim().toLowerCase();
    const supabase = await createAuthClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      console.error("[Login] Supabase auth error:", {
        message: error.message,
        status: error.status,
        code: (error as any).code,
      });

      // Check if user exists in the system
      const { findUserByEmail } = await import("@/lib/auth/supabase-server");
      const existingUser = await findUserByEmail(normalizedEmail);

      if (!existingUser) {
        return NextResponse.json(
          {
            error: "No account found with this email. Please create an account first.",
            notFound: true,
          },
          { status: 400 }
        );
      }

      if (error.message?.toLowerCase().includes("email not confirmed")) {
        return NextResponse.json(
          {
            error: "Please confirm your email address before logging in.",
          },
          { status: 400 }
        );
      }

      if (error.status === 429) {
        return NextResponse.json(
          {
            error: "Too many login attempts. Please wait a few moments and try again.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: "Incorrect password. Please try again or use Forgot Password to reset it.",
          invalidPassword: true,
        },
        { status: 400 }
      );
    }

    const safeRedirectPath = getSafeRedirect(next, "/audit");

    return NextResponse.json({ url: safeRedirectPath }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
