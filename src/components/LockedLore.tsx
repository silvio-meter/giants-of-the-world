"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { splitParagraphs } from "@/lib/content";
import { refundDays } from "@/lib/site";
import { PAYWALL_COPY } from "@/lib/paywall-copy";
import { MysteryNote } from "./MysteryNote";
import { DeepSections } from "./DeepSections";
import { GlossaryText } from "./GlossaryText";
import { usePlan } from "./PlanProvider";
import type { GiantSections } from "@/lib/types";
import type { ResolvedMotif } from "@/lib/motif-view";

interface Props {
  slug: string;
  /** Full motif graph — only used after paid unlock. */
  motifs?: ResolvedMotif[];
  /** Free: names only, no blurbs or links. */
  motifNames?: string[];
  /** First sentence of disputed, baked on the server for free readers. */
  disputedTeaser?: string;
  /** Opening paragraph — safe for everyone, baked into the static page. */
  freePreview: string;
  /** True when there is more text beyond the preview. */
  hasMore: boolean;
}

interface Lore {
  fullDescription: string;
  mysteryNote: string;
  sections?: GiantSections;
}

/**
 * The paywalled half of a giant page.
 *
 * Free readers see: opening account, motif names, one-line disputed teaser,
 * and the membership CTA. Members fetch the rest from /api/lore/[slug].
 */
export function LockedLore({
  slug,
  motifs,
  motifNames = [],
  disputedTeaser = "",
  freePreview,
  hasMore,
}: Props) {
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

  const loading = ready && isPaid && !lore && !attempted;

  if (lore) {
    return (
      <>
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Full account
        </h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-text-primary/90">
          {splitParagraphs(lore.fullDescription).map((para, i) => (
            <p key={i}>
              <GlossaryText text={para} />
            </p>
          ))}
        </div>
        {lore.sections && (
          <div className="mt-10">
            <DeepSections sections={lore.sections} motifs={motifs} />
          </div>
        )}
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
          <GlossaryText text={freePreview} />
        </p>
      </div>

      {motifNames.length > 0 && (
        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
            Motifs
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {motifNames.map((name) => (
              <li
                key={name}
                className="rounded border border-border bg-surface px-2.5 py-1 text-sm text-text-muted"
              >
                {name}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-text-muted/80">
            Names only. Connections open with membership.
          </p>
        </section>
      )}

      {disputedTeaser && (
        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
            What is disputed
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {disputedTeaser}
          </p>
        </section>
      )}

      {hasMore && (
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
          <div
            className="pointer-events-none select-none px-5 pt-5 pb-2"
            aria-hidden
          >
            <p className="text-[10px] tracking-[0.2em] text-text-muted uppercase">
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
                  {PAYWALL_COPY.continueEntry}
                </p>
                {PAYWALL_COPY.shortLines.map((line) => (
                  <p key={line} className="mt-1.5 text-sm text-text-muted">
                    {line}
                  </p>
                ))}
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex w-full items-center justify-center rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 sm:w-auto sm:min-w-[280px]"
                >
                  {PAYWALL_COPY.buttonLifetime}
                </Link>
                <p className="mt-2 text-xs text-accent-gold/80">
                  {refundDays}-day refund, no questions asked
                </p>
                <p className="mt-2.5 text-xs text-text-muted">
                  <Link
                    href="/pricing"
                    className="text-accent-gold hover:underline"
                  >
                    {PAYWALL_COPY.secondary}
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
