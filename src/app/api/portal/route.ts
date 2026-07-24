import { NextResponse } from "next/server";
import { isStripeConfigured, isSupabaseConfigured } from "@/lib/plans";
import { getStripe, getSiteUrl } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    if (!isSupabaseConfigured() || !isStripeConfigured()) {
      return NextResponse.json(
        { error: "Billing is not configured." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      // Reached by comped accounts and by anyone who never checked out. The UI
      // hides the button in both cases; this is the direct-request fallback.
      return NextResponse.json(
        {
          error:
            "There is no billing account on this profile — nothing has been charged, so there is nothing to manage.",
        },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${getSiteUrl()}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("portal error", err);
    return NextResponse.json(
      { error: "Could not open billing portal." },
      { status: 500 }
    );
  }
}
