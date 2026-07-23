"use client";

import Link from "next/link";
import { usePlan } from "./PlanProvider";
import { MysteryNote } from "./MysteryNote";

interface Props {
  fullDescription: string;
  mysteryNote: string;
}

export function FullDescription({ fullDescription, mysteryNote }: Props) {
  const { isPaid, ready } = usePlan();

  const paragraphs = fullDescription
    .split(/\n\n+|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!ready) {
    return <div className="mt-4 h-40 animate-pulse rounded-lg bg-surface" />;
  }

  if (isPaid) {
    return (
      <>
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Full account
        </h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-text-primary/90">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <MysteryNote note={mysteryNote} />
      </>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
      <div
        className="pointer-events-none select-none px-5 pt-5 pb-28"
        aria-hidden
      >
        <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold/50 uppercase">
          Full account
        </p>
        <div className="mt-3 space-y-3 blur-[3px] opacity-40">
          {paragraphs.slice(0, 2).map((para, i) => (
            <p key={i} className="text-sm leading-relaxed text-text-muted">
              {para}
            </p>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-background via-background/95 to-transparent p-6">
        <div className="w-full max-w-md rounded-lg border border-accent-gold/40 bg-surface/95 p-5 text-center shadow-[0_0_40px_rgba(201,162,39,0.08)] backdrop-blur-sm">
          <p className="font-[family-name:var(--font-cinzel)] text-sm tracking-wide text-accent-gold">
            The deeper pages are sealed
          </p>
          <p className="mt-2 text-sm text-text-muted">
            You have the basic account above. Unlock the full history and
            mystery notes with any plan.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-flex w-full items-center justify-center rounded border border-accent-gold bg-accent-gold px-4 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.12em] text-background transition hover:bg-accent-gold/90"
          >
            Unlock forever with Lifetime — $69
          </Link>
          <p className="mt-3 text-xs text-text-muted">
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
      </div>
    </div>
  );
}
