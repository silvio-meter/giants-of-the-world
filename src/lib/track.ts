"use client";

import { track as vaTrack } from "@vercel/analytics";

/**
 * `@vercel/analytics`'s own track() is a silent no-op until <Analytics/>'s
 * mount effect has run and defined window.va — there is no queue to fall
 * back on before that. Confirmed live: a fresh load of /compare dropped its
 * "Compare viewed" event this way, while the identical call fired correctly
 * on a client-side navigation to the same route (Analytics already
 * initialized by then).
 *
 * A fixed macrotask defer (setTimeout 0) isn't enough to close the gap: the
 * package's <Analytics/> wraps itself in <Suspense> because it reads
 * useSearchParams(), so on a fresh load it can hydrate in a materially later
 * commit than the rest of the page, not just later within the same one.
 * Polling for window.va to actually exist is what closes the gap regardless
 * of how long that takes; giving up after a few seconds keeps this
 * best-effort rather than a real wait, matching DiscoveryTracker's
 * fetch().catch() elsewhere.
 */
const MAX_WAIT_MS = 4000;
const POLL_INTERVAL_MS = 50;

export function track(
  name: string,
  properties?: Record<string, string | number | boolean | null>
): void {
  const start = Date.now();

  function attempt() {
    if (typeof window !== "undefined" && window.va) {
      vaTrack(name, properties);
      return;
    }
    if (Date.now() - start > MAX_WAIT_MS) return;
    setTimeout(attempt, POLL_INTERVAL_MS);
  }

  attempt();
}
