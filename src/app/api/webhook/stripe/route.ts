import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { UserPlan, PaidPlan } from "@/lib/access";
import { planFromPriceId } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Admin = ReturnType<typeof createServiceRoleClient>;

/** Current plan, so a downgrade can tell a real cancellation from a stale one. */
async function currentPlan(
  admin: Admin,
  opts: { userId?: string | null; customerId?: string | null }
): Promise<UserPlan | null> {
  const query = admin.from("profiles").select("plan");
  const { data } = opts.userId
    ? await query.eq("id", opts.userId).maybeSingle()
    : opts.customerId
      ? await query.eq("stripe_customer_id", opts.customerId).maybeSingle()
      : { data: null };
  return (data?.plan as UserPlan) ?? null;
}

async function setUserPlan(opts: {
  userId?: string | null;
  customerId?: string | null;
  email?: string | null;
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
    // Upsert, not update: a plain update against a missing row reports success
    // while changing nothing, which would leave a paying customer on free.
    const { error } = await admin.from("profiles").upsert(
      {
        id: opts.userId,
        ...(opts.email ? { email: opts.email } : {}),
        ...payload,
      },
      { onConflict: "id" }
    );
    if (error) throw error;
    return;
  }

  if (opts.customerId) {
    const { data, error } = await admin
      .from("profiles")
      .update(payload)
      .eq("stripe_customer_id", opts.customerId)
      .select("id");
    if (error) throw error;
    if (!data || data.length === 0) {
      // No user to credit. Loud, because someone has paid for nothing.
      throw new Error(
        `No profile matches stripe_customer_id ${opts.customerId} — plan "${opts.plan}" not applied`
      );
    }
  }
}

/**
 * Lifetime is a one-time purchase and outlives any subscription.
 *
 * Without this guard, a member who bought Lifetime while a Monthly plan was
 * still running loses everything the moment that old subscription is
 * cancelled — Stripe sends subscription.deleted and we would write "free".
 */
async function downgradeToFree(opts: {
  userId?: string | null;
  customerId?: string | null;
}) {
  const admin = createServiceRoleClient();
  const plan = await currentPlan(admin, opts);

  if (plan === "lifetime") {
    console.info(
      "Skipping downgrade: account holds lifetime access",
      opts.userId ?? opts.customerId
    );
    return;
  }

  await setUserPlan({ ...opts, plan: "free", subscriptionId: null });
}

/** Retires any live subscription for a customer who has just bought Lifetime. */
async function cancelActiveSubscriptions(
  stripe: Stripe,
  customerId: string
): Promise<void> {
  try {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 10,
    });
    for (const sub of subs.data) {
      await stripe.subscriptions.cancel(sub.id, { prorate: true });
      console.info("Cancelled subscription after lifetime upgrade", sub.id);
    }
  } catch (err) {
    // Never fail the webhook over this — the plan is already granted, and a
    // stray subscription is a billing cleanup, not an access problem.
    console.error("Could not cancel subscriptions after lifetime upgrade", err);
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
          email: session.customer_details?.email,
          plan,
          subscriptionId: subscriptionId ?? null,
        });

        // Buying Lifetime while a subscription is running would otherwise keep
        // charging monthly forever. Retire it as part of the upgrade.
        if (plan === "lifetime" && customerId) {
          await cancelActiveSubscriptions(stripe, customerId);
        }
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
          await downgradeToFree({ userId, customerId });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const userId = sub.metadata?.supabase_user_id;
        await downgradeToFree({ userId, customerId });
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
