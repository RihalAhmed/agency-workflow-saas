import { createClient } from "@supabase/supabase-js";

// This client uses the public anon key. It is safe to use in the browser.
export const createBrowserClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
