"use client";

import Link from "next/link";
import { usePlan } from "./PlanProvider";
import type { SessionPrepCardData } from "@/lib/types";

/**
 * Session Prep block on paid giant pages only (caller skips freeEntry).
 *
 * Members see seeds (when curated), source shelf, and Compare link.
 * Free visitors see locked chrome and the pack teaser. No second CheckoutButton:
 * PremiumLock / LockedLore already own the gold wall on this page.
 */
export function SessionPrepCard({ card }: { card: SessionPrepCardData }) {
  const { isPaid, ready } = usePlan();
  const unlocked = ready && isPaid;

  return (
    <section className="mt-8 rounded-lg border border-accent-gold/30 bg-surface/80 p-4 sm:p-5">
      <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        Session Prep
      </h2>

      {!ready ? (
        <p className="mt-3 text-sm text-text-muted" role="status">
          Checking membership…
        </p>
      ) : unlocked ? (
        <div className="mt-4 space-y-5">
          {card.seeds ? (
            <div>
              <h3 className="text-[10px] tracking-[0.2em] text-text-muted uppercase">
                Encounter seeds
              </h3>
              <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm leading-relaxed text-text-primary/90">
                {card.seeds.map((seed) => (
                  <li key={seed}>{seed}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {card.sourceShelf.length > 0 ? (
            <div>
              <h3 className="text-[10px] tracking-[0.2em] text-text-muted uppercase">
                Source shelf
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 font-mono text-xs text-text-muted marker:text-accent-gold/60">
                {card.sourceShelf.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {card.comparePair ? (
            <div>
              <h3 className="text-[10px] tracking-[0.2em] text-text-muted uppercase">
                Compare
              </h3>
              <p className="mt-2 text-sm text-text-muted">
                <Link
                  href={`/compare?a=${encodeURIComponent(card.comparePair.a)}&b=${encodeURIComponent(card.comparePair.b)}`}
                  className="text-accent-gold hover:underline"
                >
                  {card.comparePair.aName} vs {card.comparePair.bName}
                </Link>
              </p>
            </div>
          ) : null}

          <p className="border-t border-border pt-3 text-xs text-text-muted/80">
            {card.packTeaser}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div
            className="rounded border border-border/80 bg-background/40 px-3 py-4 opacity-60"
            aria-hidden
          >
            <div className="h-2 w-24 rounded bg-text-muted/20" />
            <div className="mt-3 space-y-2">
              <div className="h-2 w-full rounded bg-text-muted/15" />
              <div className="h-2 w-11/12 rounded bg-text-muted/15" />
              <div className="h-2 w-10/12 rounded bg-text-muted/15" />
            </div>
          </div>
          <p className="text-center text-sm text-text-muted">
            Full prep pack unlocks with membership
          </p>
        </div>
      )}
    </section>
  );
}
