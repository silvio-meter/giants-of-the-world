"use client";

import { useEffect } from "react";
import { umamiEvent } from "@/lib/umami";
import { usePlan } from "./PlanProvider";

/**
 * Fires the Umami `lock_view` event once per mount of a wall (PremiumLock
 * entry / compare / map, never the quiet "later" notes), and only for readers
 * who are not paying members. Props are enums and a catalogue slug only: no
 * email, user id, location or free text.
 */
export function LockViewEvent({
  surface,
  slug,
}: {
  surface: "entry" | "compare" | "map";
  slug?: string;
}) {
  const { isPaid, ready } = usePlan();

  useEffect(() => {
    if (!ready || isPaid) return;
    umamiEvent("lock_view", slug ? { surface, slug } : { surface });
  }, [ready, isPaid, surface, slug]);

  return null;
}
