"use client";

import Link from "next/link";
import { usePlan } from "./PlanProvider";
import { PAYWALL_COPY } from "@/lib/paywall-copy";

/**
 * Sources list on an entry page.
 *
 * Showcase freeEntry: full list always.
 * Other entries: free readers see the first title + lock; paid see all.
 * Source strings are already public catalogue data — this is UI alignment
 * with the paywall, not a security boundary for the strings themselves.
 */
export function SourcesSection({
  sources,
  freeEntry,
}: {
  sources: string[];
  freeEntry: boolean;
}) {
  const { isPaid, ready } = usePlan();

  if (sources.length === 0) return null;

  const showAll = freeEntry || (ready && isPaid);
  const visible = showAll ? sources : sources.slice(0, 1);
  const lockedCount = showAll ? 0 : Math.max(0, sources.length - 1);

  return (
    <section className="mt-8">
      <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        Sources
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-4 font-mono text-xs text-text-muted marker:text-accent-gold/60">
        {visible.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      {lockedCount > 0 && (
        <div className="mt-4 rounded-lg border border-accent-gold/25 bg-background/50 px-4 py-3 text-center">
          <p className="text-sm text-text-muted">
            {lockedCount} more source{lockedCount === 1 ? "" : "s"} open with
            membership.
          </p>
          <p className="mt-1 text-xs text-text-muted/80">
            {PAYWALL_COPY.shortLines[1]}
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-block text-sm text-accent-gold hover:underline"
          >
            {PAYWALL_COPY.buttonLifetime}
          </Link>
          <p className="mt-1.5 text-xs text-text-muted">
            <Link href="/pricing" className="hover:text-accent-gold">
              {PAYWALL_COPY.secondary}
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}
