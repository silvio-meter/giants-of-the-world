"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  JOURNEY_MARK_META,
  JOURNEY_MARK_TYPES,
  fetchSyncedMarks,
  listSessionMarks,
  type EntryMarks,
  type JourneyMarkType,
} from "@/lib/journey-marks";
import { usePlan } from "./PlanProvider";
import { PremiumLock } from "./PremiumLock";
import { EmailCapture } from "./EmailCapture";

export interface JourneyGiantMeta {
  slug: string;
  name: string;
  culture: string;
  coordinates: [number, number] | null;
}

const EMPTY_COPY = {
  title: "You have not marked any entry yet.",
  lines: [
    "Marks are private.",
    "They are not a collection score.",
    "They are a record of what held weight.",
  ],
} as const;

/** Equirectangular pins on a dark panel (same spirit as MyJourneyCard). */
function MarksMap({
  stops,
}: {
  stops: { slug: string; coordinates: [number, number]; name: string }[];
}) {
  const w = 640;
  const h = 320;
  const points = stops.map((s) => {
    const [lat, lng] = s.coordinates;
    return {
      slug: s.slug,
      name: s.name,
      x: ((lng + 180) / 360) * w,
      y: ((90 - lat) / 180) * h,
    };
  });

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label="Map of marked entries"
      >
        <rect width={w} height={h} fill="#0d1117" />
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={`v${f}`}
            x1={w * f}
            y1={0}
            x2={w * f}
            y2={h}
            stroke="rgba(201,162,39,0.12)"
            strokeWidth={1}
          />
        ))}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={`h${f}`}
            x1={0}
            y1={h * f}
            x2={w}
            y2={h * f}
            stroke="rgba(201,162,39,0.12)"
            strokeWidth={1}
          />
        ))}
        {points.map((p) => (
          <circle
            key={p.slug}
            cx={p.x}
            cy={p.y}
            r={5}
            fill="#c9a227"
            opacity={0.9}
          >
            <title>{p.name}</title>
          </circle>
        ))}
      </svg>
      <p className="border-t border-border px-3 py-2 text-xs text-text-muted">
        Pins mark entries you marked, not proof of place.
      </p>
    </div>
  );
}

export function JourneyPageClient({
  giants,
}: {
  giants: Record<string, JourneyGiantMeta>;
}) {
  const { isPaid, ready, userId } = usePlan();
  const [entries, setEntries] = useState<EntryMarks[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!ready) return;
      if (isPaid && userId) {
        const remote = await fetchSyncedMarks();
        if (!cancelled) {
          setEntries(remote.filter((e) => e.marks.length > 0 || e.note));
          setLoaded(true);
        }
        return;
      }
      const local = listSessionMarks().filter(
        (e) => e.marks.length > 0 || e.note
      );
      if (!cancelled) {
        setEntries(local);
        setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [ready, isPaid, userId]);

  const byType = useMemo(() => {
    const groups: Record<JourneyMarkType, EntryMarks[]> = {
      unsettled: [],
      "another-version": [],
      "keep-a-rule": [],
    };
    for (const entry of entries) {
      for (const m of entry.marks) {
        groups[m].push(entry);
      }
    }
    return groups;
  }, [entries]);

  const mapStops = useMemo(() => {
    const seen = new Set<string>();
    const stops: { slug: string; coordinates: [number, number]; name: string }[] =
      [];
    for (const entry of entries) {
      if (seen.has(entry.slug)) continue;
      const g = giants[entry.slug];
      if (!g?.coordinates) continue;
      seen.add(entry.slug);
      stops.push({
        slug: g.slug,
        name: g.name,
        coordinates: g.coordinates,
      });
    }
    return stops;
  }, [entries, giants]);

  const exportData = useCallback(
    (format: "json" | "csv") => {
      const rows = entries.flatMap((e) => {
        const g = giants[e.slug];
        return e.marks.map((mark) => ({
          slug: e.slug,
          name: g?.name ?? e.slug,
          mark,
          markLabel: JOURNEY_MARK_META[mark].label,
          note: e.note,
          date: e.updatedAt,
        }));
      });

      if (format === "json") {
        const blob = new Blob([JSON.stringify(rows, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "giants-codex-journey-marks.json";
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const header = "slug,name,mark,mark_label,note,date";
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const lines = rows.map((r) =>
        [
          r.slug,
          r.name,
          r.mark,
          r.markLabel,
          r.note,
          r.date,
        ]
          .map((c) => escape(String(c ?? "")))
          .join(",")
      );
      const blob = new Blob([[header, ...lines].join("\n")], {
        type: "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "giants-codex-journey-marks.csv";
      a.click();
      URL.revokeObjectURL(url);
    },
    [entries, giants]
  );

  if (!ready || !loaded) {
    return (
      <p className="text-sm text-text-muted" role="status">
        Loading marks…
      </p>
    );
  }

  const empty = entries.length === 0;

  return (
    <div className="space-y-10">
      {!isPaid && (
        <p className="rounded border border-border bg-surface/60 px-4 py-3 text-sm text-text-muted">
          {userId
            ? "These marks are only on this device until you unlock membership."
            : "Session marks only. "}
          {!userId && (
            <Link
              href="/login?next=/journey"
              className="text-accent-gold hover:underline"
            >
              Sign in to keep your marks
            </Link>
          )}
          {userId && (
            <Link href="/pricing" className="text-accent-gold hover:underline">
              Unlock sync and export
            </Link>
          )}
          .
        </p>
      )}

      {empty ? (
        <div className="space-y-8">
          <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
            <p className="font-[family-name:var(--font-cinzel)] text-lg text-accent-gold">
              {EMPTY_COPY.title}
            </p>
            <div className="mx-auto mt-4 max-w-md space-y-1 text-sm text-text-muted">
              {EMPTY_COPY.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <Link
              href="/giants"
              className="mt-6 inline-block text-sm text-accent-gold hover:underline"
            >
              Browse the catalogue
            </Link>
          </div>
          <EmailCapture variant="journey" sourcePage="journey" />
        </div>
      ) : (
        <>
          {mapStops.length > 0 && (
            <section>
              <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
                On the map
              </h2>
              <div className="mt-4">
                <MarksMap stops={mapStops} />
              </div>
            </section>
          )}

          {JOURNEY_MARK_TYPES.map((type) => {
            const group = byType[type];
            if (group.length === 0) return null;
            const meta = JOURNEY_MARK_META[type];
            return (
              <section key={type}>
                <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
                  {meta.label}
                </h2>
                <p className="mt-1 text-sm text-text-muted">{meta.helper}</p>
                <ul className="mt-4 space-y-2">
                  {group.map((entry) => {
                    const g = giants[entry.slug];
                    return (
                      <li key={`${type}-${entry.slug}`}>
                        <Link
                          href={`/giants/${entry.slug}`}
                          className="flex flex-col rounded-lg border border-border bg-surface px-4 py-3 transition hover:border-accent-gold/40"
                        >
                          <span className="font-[family-name:var(--font-cinzel)] text-accent-gold">
                            {g?.name ?? entry.slug}
                          </span>
                          <span className="mt-0.5 text-xs text-text-muted">
                            {g?.culture ?? ""}
                          </span>
                          {isPaid && entry.note ? (
                            <span className="mt-2 text-sm text-text-primary/80">
                              {entry.note}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          <section className="border-t border-border pt-8">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
              Export
            </h2>
            {isPaid && userId ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => exportData("json")}
                  className="rounded border border-border px-4 py-2 text-sm text-text-muted transition hover:border-accent-gold/40 hover:text-accent-gold"
                >
                  Download JSON
                </button>
                <button
                  type="button"
                  onClick={() => exportData("csv")}
                  className="rounded border border-border px-4 py-2 text-sm text-text-muted transition hover:border-accent-gold/40 hover:text-accent-gold"
                >
                  Download CSV
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <PremiumLock label="Export your marks with membership" />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
