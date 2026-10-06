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
    const supabase = await createAuthClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
