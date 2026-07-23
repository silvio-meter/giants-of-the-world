"use client";

import Link from "next/link";
import { usePlan } from "./PlanProvider";
import { MysteryNote } from "./MysteryNote";

interface Props {
  fullDescription: string;
  mysteryNote: string;
}

function splitParagraphs(text: string): string[] {
  const byBreak = text
    .split(/\n\n+|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (byBreak.length >= 2) return byBreak;

  // Single block: split into ~2–3 sentence chunks so free users still get a real opening
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g);
  if (!sentences || sentences.length <= 2) return [text.trim()];

  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2).join("").trim());
  }
  return chunks.filter(Boolean);
}

export function FullDescription({ fullDescription, mysteryNote }: Props) {
  const { isPaid, ready } = usePlan();
  const paragraphs = splitParagraphs(fullDescription);

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

  const freePreview = paragraphs[0] ?? "";
  const lockedRest = paragraphs.slice(1);
  const hasMore = lockedRest.length > 0 || Boolean(mysteryNote);

  return (
    <div className="space-y-6">
      {/* Free opening - real value */}
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
          {/* Teaser of remaining text - soft, not unreadable */}
          {lockedRest.length > 0 && (
            <div className="pointer-events-none select-none px-5 pt-5 pb-2" aria-hidden>
              <p className="text-[10px] tracking-[0.2em] text-text-muted/60 uppercase">
                Continues…
              </p>
              <div className="mt-3 space-y-3">
                {lockedRest.slice(0, 2).map((para, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-text-muted/70"
                    style={{
                      maskImage:
                        i === Math.min(lockedRest.length, 2) - 1
                          ? "linear-gradient(to bottom, black 0%, transparent 100%)"
                          : undefined,
                      WebkitMaskImage:
                        i === Math.min(lockedRest.length, 2) - 1
                          ? "linear-gradient(to bottom, black 0%, transparent 100%)"
                          : undefined,
                    }}
                  >
                    {para.length > 280 ? `${para.slice(0, 280)}…` : para}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Compact upgrade band */}
          <div
            className={`relative px-5 pb-5 ${
              lockedRest.length > 0
                ? "bg-gradient-to-t from-surface via-surface to-transparent pt-8 -mt-10"
                : "pt-5"
            }`}
          >
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
              <p className="mt-2.5 text-xs text-text-muted">
                Or{" "}
                <Link
                  href="/pricing"
                  className="text-accent-gold hover:underline"
                >
                  Monthly ($4.99)
                </Link>
                {" · "}
                <Link
                  href="/pricing"
                  className="text-accent-gold hover:underline"
                >
                  Yearly ($39)
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
