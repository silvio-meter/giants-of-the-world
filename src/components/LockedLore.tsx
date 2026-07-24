"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { splitParagraphs } from "@/lib/content";
import { refundDays } from "@/lib/site";
import { MysteryNote } from "./MysteryNote";
import { usePlan } from "./PlanProvider";

interface Props {
  slug: string;
  /** Opening paragraph — safe for everyone, baked into the static page. */
  freePreview: string;
  /** True when there is more text beyond the preview. */
  hasMore: boolean;
}

interface Lore {
  fullDescription: string;
  mysteryNote: string;
}

/**
 * The paywalled half of a giant page.
 *
 * The page itself is prerendered and CDN-cached, so it can only ever contain
 * the preview. Members fetch the rest from /api/lore/[slug], which re-checks
 * the plan server-side. Anonymous readers — the large majority — see the CTA
 * that is already in the static HTML, with no request and no layout shift.
 */
export function LockedLore({ slug, freePreview, hasMore }: Props) {
  const { isPaid, ready } = usePlan();
  const [lore, setLore] = useState<Lore | null>(null);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!ready || !isPaid || lore || attempted) return;

    let cancelled = false;

    fetch(`/api/lore/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Lore | null) => {
        if (!cancelled && data?.fullDescription) setLore(data);
      })
      .catch(() => {
        // Keep the CTA in place; a retry happens on the next visit.
      })
      .finally(() => {
        if (!cancelled) setAttempted(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, isPaid, slug, lore, attempted]);

  // Members briefly see the CTA that is baked into the static page, then the
  // real text swaps in. Derived rather than stored so the effect stays clean.
  const loading = ready && isPaid && !lore && !attempted;

  if (lore) {
    return (
      <>
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Full account
        </h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-text-primary/90">
          {splitParagraphs(lore.fullDescription).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        {lore.mysteryNote ? <MysteryNote note={lore.mysteryNote} /> : null}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Account
        </h2>
        <p className="mt-4 text-base leading-relaxed text-text-primary/90">
          {freePreview}
        </p>
      </div>

      {hasMore && (
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
          {/* Decorative fog lines — no real lore text in the DOM */}
          <div
            className="pointer-events-none select-none px-5 pt-5 pb-2"
            aria-hidden
          >
            <p className="text-[10px] tracking-[0.2em] text-text-muted/60 uppercase">
              Continues…
            </p>
            <div className="mt-3 space-y-3 opacity-40">
              <div className="h-3 w-full rounded bg-text-muted/20" />
              <div className="h-3 w-[92%] rounded bg-text-muted/15" />
              <div className="h-3 w-[88%] rounded bg-text-muted/15" />
              <div className="h-3 w-[70%] rounded bg-text-muted/10" />
            </div>
          </div>

          <div className="relative -mt-6 bg-gradient-to-t from-surface via-surface to-transparent px-5 pt-8 pb-5">
            {loading ? (
              <p
                className="py-6 text-center text-sm text-text-muted"
                role="status"
              >
                Unsealing the rest of the account…
              </p>
            ) : (
              <div className="rounded-lg border border-accent-gold/35 bg-background/80 px-4 py-4 text-center sm:px-5 sm:py-5">
                <p className="font-[family-name:var(--font-cinzel)] text-sm tracking-wide text-accent-gold">
                  Continue the account
                </p>
                <p className="mt-1.5 text-sm text-text-muted">
                  Free readers get the opening. Members unlock the rest of the
                  history and the mystery note.
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex w-full items-center justify-center rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 sm:w-auto sm:min-w-[280px]"
                >
                  Unlock forever with Lifetime - $69
                </Link>
                <p className="mt-2 text-xs text-accent-gold/80">
                  {refundDays}-day refund, no questions asked
                </p>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
