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
 * Acquisition and conversion events only:
 *   email_submit_pending  form accepted; confirm still pending. { source }
 *                         is the normalised One Seam source tag.
 *   email_signup          confirm link redeemed (true subscriber)
 *   checkout_start        a visitor reached Stripe checkout (not conversion)
 *   purchase              paid=1 return from Stripe (conversion; de-duped)
 *   lock_view             a wall was shown to a non-member (PremiumLock
 *                         entry / compare / map). { surface, slug? }
 *   pdf_sample_download   click on the free bestiary sample download.
 *                         { sku: "sample-3-giants" }
 *
 * Props are enums and catalogue slugs only. Never an email, name, user id,
 * Stripe id, IP, location or free text from a form. With membership sales
 * closed (11 Nov 2026) there is no Unlock button, so unlock_click and
 * pricing_view from the 11 Nov spec are not wired; checkout_start and
 * purchase stay for existing flows.
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
