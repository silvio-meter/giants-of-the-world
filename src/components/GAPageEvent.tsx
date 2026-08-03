"use client";

import { useEffect } from "react";
import { gaEvent } from "@/lib/ga";

/**
 * Fires a GA4 event once on mount. Renders nothing — for pages that just
 * need to record "this page loaded" (pricing_view, map_open) without any
 * other tracking logic attached, so a one-off component per page isn't
 * worth it.
 */
export function GAPageEvent({
  name,
  params,
}: {
  name: string;
  params?: Record<string, unknown>;
}) {
  useEffect(() => {
    gaEvent(name, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per mount, not on every params identity change
  }, [name]);

  return null;
}
