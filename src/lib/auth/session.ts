import { createAuthClient } from "./supabase-server";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createAuthClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { errorResponse: new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } }), user: null };
  }
  return { errorResponse: null, user };
}
