import Link from "next/link";
import { PAYWALL_COPY } from "@/lib/paywall-copy";

/**
 * A locked section, for content gated behind any paid plan.
 *
 * Visually matches the CTA box on giant pages (LockedLore). Shared copy lives
 * in paywall-copy so entry fades, scholarly locks, and tool locks stay aligned.
 */
export function PremiumLock({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-accent-gold/35 bg-background/60 px-4 py-4 text-center sm:px-5 sm:py-5 ${className}`}
    >
      <p className="font-[family-name:var(--font-cinzel)] text-sm tracking-wide text-accent-gold">
        {label}
      </p>
      {PAYWALL_COPY.shortLines.map((line) => (
        <p key={line} className="mt-1.5 text-sm text-text-muted first:mt-1.5">
          {line}
        </p>
      ))}
      <Link
        href="/pricing"
        className="mt-4 inline-flex w-full items-center justify-center rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 sm:w-auto sm:min-w-[280px]"
      >
        {PAYWALL_COPY.buttonLifetime}
      </Link>
      <p className="mt-2.5 text-xs text-text-muted">
        <Link href="/pricing" className="text-accent-gold hover:underline">
          {PAYWALL_COPY.secondary}
        </Link>
      </p>
    </div>
  );
}
