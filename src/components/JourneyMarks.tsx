"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  JOURNEY_MARK_META,
  JOURNEY_MARK_TYPES,
  JOURNEY_NOTE_MAX,
  clampNote,
  fetchSyncedMarksForSlug,
  getSessionMarks,
  saveSyncedMarks,
  setSessionMarks,
  type EntryMarks,
  type JourneyMarkType,
} from "@/lib/journey-marks";
import { usePlan } from "./PlanProvider";

/**
 * Three private marks at the bottom of a giant entry.
 * Free: session only. Paid: synced to the account.
 */
export function JourneyMarks({
  slug,
  allowCheckout = false,
}: {
  slug: string;
  /** Paid sealed entries may point at monthly checkout. Free-16 and folklore must not. */
  allowCheckout?: boolean;
}) {
  const { isPaid, ready, userId } = usePlan();
  const [marks, setMarks] = useState<JourneyMarkType[]>([]);
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!ready) return;

      if (isPaid && userId) {
        const remote = await fetchSyncedMarksForSlug(slug);
        if (cancelled) return;
        if (remote) {
          setMarks(remote.marks);
          setNote(remote.note);
        } else {
          // Promote any session marks after upgrade.
          const local = getSessionMarks(slug);
          if (local && local.marks.length > 0) {
            setMarks(local.marks);
            setNote(local.note);
            void saveSyncedMarks({
              slug,
              marks: local.marks,
              note: local.note,
            });
          }
        }
      } else {
        const local = getSessionMarks(slug);
        if (local) {
          setMarks(local.marks);
          setNote("");
        }
      }
      if (!cancelled) setLoaded(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [ready, isPaid, userId, slug]);

  const persist = useCallback(
    async (nextMarks: JourneyMarkType[], nextNote: string) => {
      setError("");
      const updatedAt = new Date().toISOString();
      const entry: EntryMarks = {
        slug,
        marks: nextMarks,
        note: isPaid ? clampNote(nextNote) : "",
        updatedAt,
      };

      if (isPaid && userId) {
        setSaving(true);
        const result = await saveSyncedMarks(entry);
        setSaving(false);
        if (!result.ok) {
          setError(result.error ?? "Could not save.");
          return;
        }
        if (result.entry) {
          setMarks(result.entry.marks);
          setNote(result.entry.note);
        }
        setHint("");
        return;
      }

      setSessionMarks(entry);
      setHint("Sign in to keep your marks.");
    },
    [isPaid, userId, slug]
  );

  function toggle(type: JourneyMarkType) {
    if (!loaded) return;
    const next = marks.includes(type)
      ? marks.filter((m) => m !== type)
      : [...marks, type];
    setMarks(next);
    void persist(next, note);
  }

  function onNoteBlur() {
    if (!isPaid || !userId) return;
    void persist(marks, note);
  }

  return (
    <section className="mt-14 border-t border-border pt-10">
      <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
        Mark for My Journey
      </h2>
      <p className="mt-2 max-w-xl text-sm text-text-muted">
        Private marks. They are not a collection score.
      </p>

      <ul className="mt-5 space-y-3">
        {JOURNEY_MARK_TYPES.map((type) => {
          const meta = JOURNEY_MARK_META[type];
          const on = marks.includes(type);
          return (
            <li key={type}>
              <button
                type="button"
                onClick={() => toggle(type)}
                disabled={!loaded}
                aria-pressed={on}
                className={`flex w-full flex-col rounded-lg border px-4 py-3 text-left transition disabled:opacity-50 ${
                  on
                    ? "border-accent-gold/60 bg-accent-gold/10"
                    : "border-border bg-surface hover:border-accent-gold/35"
                }`}
              >
                <span
                  className={`font-[family-name:var(--font-cinzel)] text-sm tracking-wide ${
                    on ? "text-accent-gold" : "text-text-primary"
                  }`}
                >
                  {meta.label}
                </span>
                <span className="mt-1 text-xs text-text-muted">{meta.helper}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {isPaid && userId ? (
        <div className="mt-5">
          <label
            htmlFor={`journey-note-${slug}`}
            className="text-xs tracking-wide text-text-muted uppercase"
          >
            Private note (optional)
          </label>
          <textarea
            id={`journey-note-${slug}`}
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, JOURNEY_NOTE_MAX))}
            onBlur={onNoteBlur}
            maxLength={JOURNEY_NOTE_MAX}
            rows={3}
            placeholder="Only you can see this."
            className="mt-2 w-full resize-y rounded border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent-gold/50 focus:outline-none"
          />
          <p className="mt-1 text-xs text-text-muted">
            {note.length}/{JOURNEY_NOTE_MAX}
            {saving ? " · Saving…" : ""}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-text-muted">
          {hint || "Marks stay on this device for this session."}{" "}
          <Link
            href={`/login?next=${encodeURIComponent(`/giants/${slug}`)}`}
            className="text-accent-gold hover:underline"
          >
            Sign in to keep your marks
          </Link>
          {allowCheckout ? (
            <>
              {" · "}
              <Link
                href={
                  userId
                    ? `/giants/${slug}?checkout=monthly`
                    : `/login?next=${encodeURIComponent(`/giants/${slug}?checkout=monthly`)}`
                }
                className="text-accent-gold hover:underline"
              >
                Membership syncs them
              </Link>
            </>
          ) : null}
          .
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      <p className="mt-4 text-xs text-text-muted">
        <Link href="/journey" className="text-accent-gold hover:underline">
          Open My Journey
        </Link>
      </p>
    </section>
  );
}
