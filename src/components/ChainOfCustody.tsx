"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlan } from "./PlanProvider";

export interface ChainRung {
  witness: string;
  date: string;
  sortYear: number;
  reads: string;
  kind: "manuscript" | "printed" | "fieldwork" | "excavation" | "scholarship" | "press";
  note?: string;
}

export interface ChainSummary {
  claim: string;
  verdict: string;
  rungCount: number;
}

const KIND_LABEL: Record<ChainRung["kind"], string> = {
  manuscript: "Manuscript",
  printed: "In print",
  fieldwork: "Fieldwork",
  excavation: "Excavation",
  scholarship: "Scholarship",
  press: "Press",
};

/**
 * The ladder of surviving witnesses behind one claim.
 *
 * Claim and verdict come from the catalog and are free: a completed thought
 * that opens the question. The rungs and the floor come from
 * /api/lore/[slug], which checks the plan on the server, so the list is not
 * reachable by hand-writing a URL.
 *
 * `evidence` is never rendered, and the endpoint does not even send it.
 *
 * Oldest at the bottom, always. The reader descends towards the foundation,
 * which is the whole point of the object: sorted by sortYear and then laid out
 * newest first, so the deepest witness sits at the floor.
 *
 * Distinct from "What is disputed" by design: that section is the argument
 * between scholars, this one is the inventory of documents and what each says.
 */
export function ChainOfCustody({
  slug,
  summary,
  endpoint = "/api/lore",
}: {
  slug: string;
  summary: ChainSummary;
  /** Findings serve their chain from a different route. */
  endpoint?: string;
}) {
  const { isPaid, ready } = usePlan();
  const [rungs, setRungs] = useState<ChainRung[] | null>(null);
  const [floor, setFloor] = useState<string>("");
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!ready || !isPaid || rungs || attempted) return;
    let cancelled = false;

    fetch(`${endpoint}/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { chain?: { rungs: ChainRung[]; floor: string } } | null) => {
        if (!cancelled && data?.chain) {
          setRungs(data.chain.rungs);
          setFloor(data.chain.floor);
        }
      })
      .catch(() => {
        // Leave the call to action in place; the next visit retries.
      })
      .finally(() => {
        if (!cancelled) setAttempted(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, isPaid, rungs, attempted, slug, endpoint]);

  const ordered = rungs
    ? [...rungs].sort((a, b) => b.sortYear - a.sortYear)
    : [];

  return (
    <section className="mt-8">
      <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        Chain of custody
      </h2>

      <p className="mt-3 text-base leading-relaxed text-text-primary/90">
        {summary.claim}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        {summary.verdict}
      </p>

      {ordered.length > 0 ? (
        <>
          <ol className="mt-6 border-l border-border pl-5">
            {ordered.map((r) => (
              <li key={`${r.sortYear}-${r.witness}`} className="relative pb-6">
                <span
                  className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-accent-gold"
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-xs text-accent-gold">
                    {r.date}
                  </span>
                  <span className="text-[10px] tracking-wider text-text-muted uppercase">
                    {KIND_LABEL[r.kind]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-primary">{r.witness}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  {r.reads}
                </p>
                {r.note && (
                  <p className="mt-1 text-xs leading-relaxed text-text-muted/80">
                    {r.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
          {floor && (
            <p className="mt-2 rounded border border-accent-gold/30 bg-accent-gold/5 p-4 text-sm leading-relaxed text-text-primary">
              {floor}
            </p>
          )}
        </>
      ) : (
        !isPaid &&
        ready && (
          <div className="mt-5 rounded border border-border p-4">
            <p className="text-sm text-text-primary">
              {summary.rungCount} surviving witnesses stand behind that verdict,
              oldest at the bottom, each with what it actually says.
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-block text-sm text-accent-gold hover:underline"
            >
              View pricing →
            </Link>
          </div>
        )
      )}
    </section>
  );
}
