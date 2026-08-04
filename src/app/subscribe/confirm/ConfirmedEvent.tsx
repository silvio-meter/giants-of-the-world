"use client";

import { useEffect } from "react";
import { umamiEvent } from "@/lib/umami";

/**
 * email_signup fires here, on confirmation, not on submission.
 *
 * A form submission that never gets confirmed is not a subscriber, and
 * counting it would inflate the only acquisition number this site has.
 * Rendered by the confirm page only on the "confirmed" outcome, so a repeat
 * visit to an already-redeemed link cannot fire it a second time.
 */
export function ConfirmedEvent() {
  useEffect(() => {
    umamiEvent("email_signup");
  }, []);

  return null;
}
