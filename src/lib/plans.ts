import type { PaidPlan } from "./access";

export const PLAN_PRICES: Record<
  PaidPlan,
  { name: string; price: string; period: string; blurb: string }
> = {
  monthly: {
    name: "Monthly",
    price: "$4.99",
    period: "/ month",
    blurb: "Low-commitment entry. Cancel anytime.",
  },
  yearly: {
    name: "Yearly",
    price: "$39",
    period: "/ year",
    blurb: "Best recurring value - two months free vs monthly.",
  },
  lifetime: {
    name: "Lifetime",
    price: "$69",
    period: " once",
    blurb: "Pay once, own forever. The codex stays open.",
  },
};

/** Map Stripe Price ID → plan */
export function planFromPriceId(priceId: string | null | undefined): PaidPlan | null {
  if (!priceId) return null;
  const map: Record<string, PaidPlan> = {
    [process.env.STRIPE_PRICE_MONTHLY ?? ""]: "monthly",
    [process.env.STRIPE_PRICE_YEARLY ?? ""]: "yearly",
    [process.env.STRIPE_PRICE_LIFETIME ?? ""]: "lifetime",
  };
  delete map[""];
  return map[priceId] ?? null;
}

export function priceIdForPlan(plan: PaidPlan): string | null {
  const map: Record<PaidPlan, string | undefined> = {
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_YEARLY,
    lifetime: process.env.STRIPE_PRICE_LIFETIME,
  };
  return map[plan] || null;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_MONTHLY &&
      process.env.STRIPE_PRICE_YEARLY &&
      process.env.STRIPE_PRICE_LIFETIME
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
