import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/auth/supabase-server";
import { ForgotPasswordSchema } from "@/lib/auth/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = ForgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check if an account actually exists for this email
    const { findUserByEmail } = await import("@/lib/auth/supabase-server");
    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "No account found with this email address. Please create an account first.",
          notFound: true,
        },
        { status: 404 }
      );
    }

    const supabase = await createAuthClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/reset-password`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Check your email for the password reset link." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
