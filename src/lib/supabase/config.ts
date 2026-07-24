/**
 * Env check with no dependency on supabase-js, so components can ask whether
 * auth is configured without pulling the library into their bundle.
 */
export function isBrowserSupabaseReady(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
