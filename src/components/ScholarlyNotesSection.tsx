"use client";

import { useEffect, useState } from "react";
import { splitParagraphs } from "@/lib/content";
import { usePlan } from "./PlanProvider";
import { PremiumLock } from "./PremiumLock";

interface ScholarlyNote {
  heading: string;
  body: string;
}

/**
 * Etymology, comparative-myth, and disputed-reading commentary — a second
 * premium layer, gated independently of the entry's own freeEntry status via
 * the /api/lore/[slug] endpoint's separate scholarlyAllowed check.
 *
 * Rendered unconditionally by any page with hasScholarlyNotes, free or paid
 * alike, so it can't reuse LockedLore's fetch (which never fires for free
 * entries — nothing there is gated). Standalone rather than layered onto
 * LockedLore for the same reason PremiumLock is standalone: that component
 * is shipped and revenue-critical, not worth entangling with a second,
 * differently-gated concern.
 */
export function ScholarlyNotesSection({ slug }: { slug: string }) {
  const { isPaid, ready } = usePlan();
  const [notes, setNotes] = useState<ScholarlyNote[] | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!ready || !isPaid || notes || attempted) return;

    let cancelled = false;

    fetch(`/api/lore/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { scholarlyNotes?: ScholarlyNote[]; scholarlySources?: string[] } | null) => {
        if (!cancelled && data?.scholarlyNotes) {
          setNotes(data.scholarlyNotes);
          setSources(data.scholarlySources ?? []);
        }
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
  }, [ready, isPaid, slug, notes, attempted]);

  const loading = ready && isPaid && !notes && !attempted;

  return (
    <section className="mt-14 border-t border-border pt-10">
      <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        Scholarly notes
      </h2>

      {notes ? (
        <div className="mt-6 space-y-6">
          {notes.map((note) => (
            <div key={note.heading}>
              <h3 className="font-[family-name:var(--font-cinzel)] text-sm text-accent-gold">
                {note.heading}
              </h3>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-text-primary/90">
                {splitParagraphs(note.body).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          ))}
          {sources.length > 0 && (
            <p className="border-t border-border pt-4 font-mono text-xs text-text-muted">
              <span className="text-text-muted/70">Sources: </span>
              {sources.join("; ")}
            </p>
          )}
        </div>
      ) : loading ? (
        <p className="mt-4 text-sm text-text-muted" role="status">
          Unsealing the scholarly notes…
        </p>
      ) : (
        <div className="mt-4">
          <PremiumLock variant="later" />
        </div>
      )}
    </section>
  );
}
