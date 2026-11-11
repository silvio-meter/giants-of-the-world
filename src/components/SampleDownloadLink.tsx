"use client";

import { umamiEvent } from "@/lib/umami";

/**
 * The free bestiary sample download. No account and no email: a plain link to
 * the public file. Fires pdf_sample_download on click (not on page view), with
 * the sku as the only prop.
 */
export function SampleDownloadLink({
  href,
  sku,
  available,
}: {
  href: string;
  sku: string;
  /** False while the PDF is not in public/downloads yet: no dead link. */
  available: boolean;
}) {
  const className =
    "inline-flex items-center justify-center rounded border border-accent-gold/60 bg-accent-gold/10 px-5 py-2.5 text-sm font-medium tracking-wide text-accent-gold transition hover:border-accent-gold hover:bg-accent-gold/20";

  if (!available) {
    return (
      <span
        aria-disabled="true"
        className={`${className} cursor-not-allowed opacity-50`}
      >
        Download the free sample (PDF not yet available)
      </span>
    );
  }

  return (
    <a
      href={href}
      download
      className={className}
      onClick={() => umamiEvent("pdf_sample_download", { sku })}
    >
      Download the free sample (PDF)
    </a>
  );
}
