import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { UserPlan, PaidPlan } from "@/lib/access";
import { planFromPriceId } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function setUserPlan(opts: {
  userId?: string | null;
  customerId?: string | null;
  plan: UserPlan;
  subscriptionId?: string | null;
}) {
  const admin = createServiceRoleClient();
  const payload: Record<string, unknown> = {
    plan: opts.plan,
    updated_at: new Date().toISOString(),
  };
  if (opts.subscriptionId !== undefined) {
    payload.stripe_subscription_id = opts.subscriptionId;
  }
  if (opts.customerId) {
    payload.stripe_customer_id = opts.customerId;
  }

  if (opts.userId) {
    const { error } = await admin
      .from("profiles")
      .update(payload)
      .eq("id", opts.userId);
    if (error) throw error;
    return;
  }

  if (opts.customerId) {
    const { error } = await admin
      .from("profiles")
      .update(payload)
      .eq("stripe_customer_id", opts.customerId);
    if (error) throw error;
  }
}

function planFromSession(session: Stripe.Checkout.Session): PaidPlan | null {
  const meta = session.metadata?.plan;
  if (meta === "monthly" || meta === "yearly" || meta === "lifetime") {
    return meta;
  }
  return null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Webhook signature failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.metadata?.supabase_user_id || session.client_reference_id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        let plan = planFromSession(session);

        if (!plan && session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0]?.price.id;
          plan = planFromPriceId(priceId);
        }

        if (!plan && session.mode === "payment") {
          // Lifetime one-time
          const lineItems = await stripe.checkout.sessions.listLineItems(
            session.id,
            { limit: 1 }
          );
          const priceId = lineItems.data[0]?.price?.id;
          plan = planFromPriceId(priceId) ?? "lifetime";
        }

        if (!plan) {
          console.error("Could not resolve plan for session", session.id);
          break;
        }

        const subscriptionId =
          session.mode === "subscription"
            ? typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id
            : null;

        await setUserPlan({
          userId,
          customerId,
          plan,
          subscriptionId: subscriptionId ?? null,
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id;
        const plan = planFromPriceId(priceId);
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const userId = sub.metadata?.supabase_user_id;

        if (sub.status === "active" || sub.status === "trialing") {
          if (plan) {
            await setUserPlan({
              userId,
              customerId,
              plan,
              subscriptionId: sub.id,
            });
          }
        } else if (
          sub.status === "canceled" ||
          sub.status === "unpaid" ||
          sub.status === "incomplete_expired"
        ) {
          await setUserPlan({
            userId,
            customerId,
            plan: "free",
            subscriptionId: null,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const userId = sub.metadata?.supabase_user_id;
        await setUserPlan({
          userId,
          customerId,
          plan: "free",
          subscriptionId: null,
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
