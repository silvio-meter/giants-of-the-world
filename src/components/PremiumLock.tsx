import Link from "next/link";

/**
 * A locked section, for content gated behind any paid plan.
 *
 * Visually matches the CTA box on giant pages (LockedLore), but that
 * component is a single-purpose client component tied to fetching one
 * giant's lore — not worth entangling with a second, unrelated caller for
 * the sake of sharing markup. This is the presentational half, reusable
 * wherever a section needs to say "unlock this" without needing its own
 * fetch logic.
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
      <Link
        href="/pricing"
        className="mt-4 inline-flex w-full items-center justify-center rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 sm:w-auto sm:min-w-[280px]"
      >
        Unlock forever with Lifetime: $69
      </Link>
      <p className="mt-2.5 text-xs text-text-muted">
        Or{" "}
        <Link href="/pricing" className="text-accent-gold hover:underline">
          Monthly ($4.99)
        </Link>
        {" · "}
        <Link href="/pricing" className="text-accent-gold hover:underline">
          Yearly ($39)
        </Link>
      </p>
    </div>
  );
}
