"use client";

import { sendGAEvent } from "@next/third-parties/google";

// window.dataLayer is already declared globally by @next/third-parties
// (as Object[] | undefined) — no need to redeclare it here.

/**
 * @next/third-parties's sendGAEvent silently drops the event (a console.warn,
 * nothing more) if window.dataLayer doesn't exist yet — the inline script
 * that creates it loads with Next's default `afterInteractive` strategy, so
 * it can still be pending when a descendant's own mount effect fires first.
 * Same class of race as src/lib/track.ts's Vercel Analytics fix, confirmed
 * there against a real production build; applying the same short-poll
 * rather than assuming this package is immune to it.
 */
const MAX_WAIT_MS = 4000;
const POLL_INTERVAL_MS = 50;

export function gaEvent(name: string, params?: Record<string, unknown>): void {
  const start = Date.now();

  function attempt() {
    if (typeof window !== "undefined" && window.dataLayer) {
      sendGAEvent("event", name, params ?? {});
      return;
    }
    if (Date.now() - start > MAX_WAIT_MS) return;
    setTimeout(attempt, POLL_INTERVAL_MS);
  }

  attempt();
}
