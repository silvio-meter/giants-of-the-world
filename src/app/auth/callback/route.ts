import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/plans";
import { siteUrl } from "@/lib/site";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Redirect against the configured origin, not the request Host header.
  const origin = siteUrl;
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/";
  // Prevent open redirects
  const next =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  if (code && isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.user) {
        // Ensure profile row exists (OAuth users)
        try {
          const admin = createServiceRoleClient();
          await admin.from("profiles").upsert(
            {
              id: data.user.id,
              email: data.user.email,
              plan: "free",
            },
            { onConflict: "id", ignoreDuplicates: true }
          );
        } catch {
          // Profile may already exist or service role missing in local
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // fall through
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
