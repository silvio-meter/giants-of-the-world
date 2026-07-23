import { NextResponse } from "next/server";
import type { PaidPlan } from "@/lib/access";
import { priceIdForPlan, isStripeConfigured, isSupabaseConfigured } from "@/lib/plans";
import { getStripe, getSiteUrl } from "@/lib/stripe";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

const PAID: PaidPlan[] = ["monthly", "yearly", "lifetime"];

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Auth is not configured yet." },
        { status: 503 }
      );
    }
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Payments are not configured yet." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as { plan?: string };
    const plan = body.plan as PaidPlan;
    if (!PAID.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const priceId = priceIdForPlan(plan);
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for this plan." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sign in required.", redirect: "/login?next=/pricing" },
        { status: 401 }
      );
    }

    // Service role for billing fields (plan / customer id must not be client-writable)
    const admin = createServiceRoleClient();
    let { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, plan")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await admin.from("profiles").upsert({
        id: user.id,
        email: user.email,
        plan: "free",
      });
      profile = { stripe_customer_id: null, plan: "free" };
    }

    if (profile?.plan === plan) {
      return NextResponse.json(
        { error: "You already have this plan." },
        { status: 400 }
      );
    }
    if (profile?.plan === "lifetime") {
      return NextResponse.json(
        { error: "You already have Lifetime access." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const site = getSiteUrl();

    let customerId = profile?.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin
        .from("profiles")
        .update({
          stripe_customer_id: customerId,
          email: user.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    const mode = plan === "lifetime" ? "payment" : "subscription";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/pricing?success=1`,
      cancel_url: `${site}/pricing?canceled=1`,
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
      ...(mode === "subscription"
        ? {
            subscription_data: {
              metadata: {
                supabase_user_id: user.id,
                plan,
              },
            },
          }
        : {
            payment_intent_data: {
              metadata: {
                supabase_user_id: user.id,
                plan,
              },
            },
          }),
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}
