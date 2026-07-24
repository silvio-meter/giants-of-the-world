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
      // Whether a Stripe customer exists at all. Comped and never-paid
      // accounts have none, and the billing portal cannot open without one.
      // Only the boolean is exposed — never the customer id.
      hasBilling: Boolean(profile?.stripe_customer_id),
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
