import { NextResponse } from "next/server";
import { getProfile } from "@/lib/profile";

/**
 * Session + plan for the browser.
 *
 * Exists so the client never has to load supabase-js just to find out who is
 * signed in — that library was the single largest chunk on every page.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getProfile();

  return NextResponse.json(
    {
      userId: profile?.id ?? null,
      email: profile?.email ?? null,
      plan: profile?.plan ?? "free",
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
