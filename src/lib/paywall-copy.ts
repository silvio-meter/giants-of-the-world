import { PLAN_PRICES } from "./plans";

/**
 * Paywall strings used on entry pages, PremiumLock, and related CTAs.
 * Keep every gated surface on this copy so pricing claims stay honest.
 */
export const PAYWALL_COPY = {
  /** Two short lines under the lock heading. */
  shortLines: [
    "The first account is free.",
    "The seams, the sources, and your marks open with membership.",
  ] as const,
  /** Primary button label (Lifetime is the hero ask). */
  buttonLifetime: `Unlock with Lifetime — ${PLAN_PRICES.lifetime.price}`,
  /** Secondary link to the full pricing table. */
  secondary: "See monthly & yearly",
  /** Label on the faded story block. */
  continueEntry: "Continue the entry",
} as const;
