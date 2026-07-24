import { NextResponse } from "next/server";
import { isStripeConfigured, isSupabaseConfigured } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Deletes the signed-in user's account.
 *
 * Irreversible, so the caller must echo back their own email address. Any
 * running subscription is cancelled first — losing the account while Stripe
 * keeps charging would be the worst possible outcome.
 *
 * The Stripe customer itself is kept: payment history is an accounting record,
 * which is what the privacy policy says.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    confirmEmail?: string;
  } | null;
  const confirmEmail = body?.confirmEmail?.trim().toLowerCase();

  if (!confirmEmail || confirmEmail !== user.email?.trim().toLowerCase()) {
    return NextResponse.json(
      { error: "Type your email address exactly to confirm." },
      { status: 400 }
    );
  }

  const admin = createServiceRoleClient();

  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    // 1. Stop any future billing before the account disappears.
    if (profile?.stripe_customer_id && isStripeConfigured()) {
      const stripe = getStripe();
      const subs = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
        limit: 20,
      });
      for (const sub of subs.data) {
        await stripe.subscriptions.cancel(sub.id);
      }
    }
  } catch (err) {
    // Refuse to delete rather than orphan a live subscription.
    console.error("account delete: could not cancel subscriptions", err);
    return NextResponse.json(
      {
        error:
          "Could not cancel your subscription, so nothing was deleted. Please contact support.",
      },
      { status: 500 }
    );
  }

  try {
    // 2. Application rows. Both cascade from auth.users, but be explicit so a
    //    schema change cannot silently leave data behind.
    await admin.from("favourites").delete().eq("user_id", user.id);
    await admin.from("profiles").delete().eq("id", user.id);

    // 3. The login itself.
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (err) {
    console.error("account delete", err);
    return NextResponse.json(
      { error: "Could not delete the account. Please contact support." },
      { status: 500 }
    );
  }

  // 4. Drop the now-dangling session cookies.
  try {
    await supabase.auth.signOut();
  } catch {
    // The user is gone either way.
  }

  return NextResponse.json({ ok: true });
}
