import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars are missing");
  }
  return createBrowserClient(url, key);
}

/** Re-exported for convenience; import from ./config to avoid loading supabase-js. */
export { isBrowserSupabaseReady } from "./config";
