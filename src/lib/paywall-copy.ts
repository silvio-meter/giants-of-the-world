import { PLAN_PRICES } from "./plans";

/**
 * Paywall strings used on entry pages, PremiumLock, and related CTAs.
 * Keep every gated surface on this copy so pricing claims stay honest.
 *
 * Yearly is the lead ask (same as the pricing table "Best Value").
 * Lifetime stays available, never the first button.
 */
export const PAYWALL_COPY = {
  /** Two short lines under the lock heading. */
  shortLines: [
    "The first account is free.",
    "The seams, the sources, and your marks open with membership.",
  ] as const,
  /** Primary button: recurring best value. */
  buttonYearly: `Unlock with Yearly - ${PLAN_PRICES.yearly.price}`,
  /** Secondary line under the button. */
  secondary: `Or Lifetime - ${PLAN_PRICES.lifetime.price} · Monthly - ${PLAN_PRICES.monthly.price}`,
  /** Label on the faded story block. */
  continueEntry: "Continue the entry",
} as const;
