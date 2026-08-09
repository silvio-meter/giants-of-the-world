"use client";

import { usePathname } from "next/navigation";
import { EmailCapture } from "./EmailCapture";

/**
 * Sitewide ledger form in the footer. Hidden on giant entry pages, which
 * already render the detail variant at the bottom of the article — stacking
 * both on mobile looked like a duplicate block.
 */
export function FooterEmailBand() {
  const pathname = usePathname() ?? "";
  // /giants/ymir yes; /giants and /giants/random no
  if (/^\/giants\/[^/]+\/?$/.test(pathname)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl border-b border-border/60 px-4 py-6 sm:px-6">
      <EmailCapture variant="footer" sourcePage="footer" />
    </div>
  );
}
