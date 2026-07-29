"use client";

import { useEffect } from "react";

/**
 * Fires a best-effort "you opened this page" ping for Codex Completion.
 * Renders nothing — no visible feedback on first view, matching the site's
 * "no manipulative notifications" rule for the gamification feature set.
 */
export function DiscoveryTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch("/api/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {
      // Best-effort; a missed ping just means a slightly stale completion count.
    });
  }, [slug]);

  return null;
}
