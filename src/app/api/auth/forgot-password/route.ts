import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/plans";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

/**
 * Sends a recovery link. Always answers the same way whether or not the
 * address exists, so this cannot be used to enumerate accounts.
 */
export async function POST(request: Request) {
  const generic = NextResponse.json({ ok: true });

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Auth is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });
    if (error) console.error("resetPasswordForEmail", error.message);
  } catch (err) {
    console.error("forgot-password", err);
  }

  return generic;
}
