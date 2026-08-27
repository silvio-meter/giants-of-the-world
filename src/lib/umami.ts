"use client";

declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Umami is cookieless, which is the whole reason it replaced GA4 here: no
 * consent banner is required, so none exists.
 *
 * Deliberately three events, acquisition and conversion:
 *   email_signup    a newsletter subscription succeeded
 *   checkout_start  a visitor reached Stripe checkout (not conversion)
 *   purchase        paid=1 return from Stripe (conversion; de-duped)
 *
 * Product usage events (Compare, Map, My Journey) stay on Vercel Analytics
 * and are not duplicated here. At current traffic a wider Umami dashboard
 * would mostly show zeroes.
 *
 * The poll mirrors src/lib/track.ts and the GA wrapper it replaces: a
 * third-party analytics script loaded with defer may not have defined its
 * global yet when a mount effect or click handler fires, and every one of
 * these libraries drops the call silently rather than queueing it. This was
 * a real dropped-event bug twice already in this codebase, so the same
 * proven guard is applied rather than assuming Umami is immune.
 */
const MAX_WAIT_MS = 4000;
const POLL_INTERVAL_MS = 50;

export function umamiEvent(
  name: string,
  data?: Record<string, unknown>
): void {
  const start = Date.now();

  function attempt() {
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track(name, data);
      return;
    }
    if (Date.now() - start > MAX_WAIT_MS) return;
    setTimeout(attempt, POLL_INTERVAL_MS);
  }

  attempt();
}
