import { PLAN_PRICES } from "./plans";
import { refundDays } from "./site";
import type { PaidPlan } from "./access";

/**
 * Paywall strings used on entry pages, PremiumLock, and related CTAs.
 * Keep every gated surface on this copy so pricing claims stay honest.
 *
 * In-content locks lead with Monthly (existing STRIPE_PRICE_MONTHLY).
 * /pricing still marks Yearly as Best Value. Do not change those prices.
 */
export const IN_CONTENT_CHECKOUT_PLAN: PaidPlan = "monthly";

/** Modern-legend slugs that must never show a checkout CTA. */
export const FOLKLORE_NO_CHECKOUT_SLUGS = [
  "giant-of-kandahar",
  "giant-of-kunar",
] as const;

export function isFolkloreNoCheckout(slug: string): boolean {
  return (FOLKLORE_NO_CHECKOUT_SLUGS as readonly string[]).includes(slug);
}

const monthly = PLAN_PRICES.monthly.price;
const yearly = PLAN_PRICES.yearly.price;
const lifetime = PLAN_PRICES.lifetime.price;
const refund = `${refundDays}-day refund, no questions`;

export const PAYWALL_COPY = {
  entry: {
    headline: "Continue this account.",
    body: `You have the opening. Membership opens the rest of this story, the sources behind it, and the other giants that share its motifs. ${monthly} a month. ${refund}.`,
    button: `Unlock this entry · ${monthly}/month`,
  },
  compare: {
    headline: "Unlock what they share.",
    body: `Scale, culture and region stay free. Membership shows the fate of both, and which traditions this pair actually shares. ${monthly} a month. ${refund}.`,
    button: `Unlock this comparison · ${monthly}/month`,
  },
  /** Secondary text under the one gold-wall button. Not a second CTA. */
  secondary: `Yearly ${yearly} · Lifetime ${lifetime} · ${refund}`,
  /** Later locks (sources, scholarly): no button, no prices. */
  later: "Sources and scholarly notes come with the same membership.",
  compareLater: "The rest of this comparison comes with the same membership.",
  scaleLater: "Scale comes with the same membership.",
  folkloreHeadline: "This is unverified folklore, not a membership gate.",
  folkloreBody: "See how this archive treats evidence.",
} as const;
