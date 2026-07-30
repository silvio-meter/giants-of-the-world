"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * Records that a comparison result was actually shown — CompareResults is a
 * Server Component, so this is the client-side sliver that can call
 * track(). Renders nothing.
 */
export function CompareViewTracker({
  a,
  b,
  unlocked,
}: {
  a: string;
  b: string;
  unlocked: boolean;
}) {
  useEffect(() => {
    track("Compare viewed", { unlocked });
  }, [a, b, unlocked]);

  return null;
}
