import type { Metadata } from "next";
import Link from "next/link";
import { getAllFindings } from "@/lib/giants";
import type { FindingCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Bones & Shadows",
  description:
    "Archaeological claims, hoaxes, and modern legends — clearly labelled.",
};

const categoryStyle: Record<
  FindingCategory,
  { label: string; className: string }
> = {
  archaeological: {
    label: "Archaeological context",
    className: "border-sky-800/60 bg-sky-950/40 text-sky-200",
  },
  claim: {
    label: "Unverified claim",
    className: "border-amber-800/60 bg-amber-950/40 text-amber-200",
  },
  hoax: {
    label: "Hoax / fraud",
    className: "border-rose-800/60 bg-rose-950/40 text-rose-200",
  },
  "modern-legend": {
    label: "Modern legend",
    className: "border-violet-800/60 bg-violet-950/40 text-violet-200",
  },
};

export default function FindingsPage() {
  const findings = getAllFindings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Evidence & rumor
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Bones & Shadows
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-muted sm:text-base">
          Claims, hoaxes, and modern military legends live here under clear
          labels. Mystery is welcome; misrepresentation is not. Verified hoaxes
          are marked as such. Unverified stories stay unverified.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2 text-[10px] tracking-wide uppercase">
        {Object.values(categoryStyle).map((c) => (
          <span
            key={c.label}
            className={`rounded border px-2 py-1 ${c.className}`}
          >
            {c.label}
          </span>
        ))}
      </div>

      <ul className="space-y-6">
        {findings.map((f) => {
          const cat = categoryStyle[f.category];
          return (
            <li
              key={f.id}
              className="rounded-lg border border-border bg-surface p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] tracking-wide uppercase ${cat.className}`}
                >
                  {cat.label}
                </span>
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] tracking-wide uppercase ${
                    f.verified
                      ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-200"
                      : "border-border text-text-muted"
                  }`}
                >
                  {f.verified ? "Status known" : "Unverified"}
                </span>
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-cinzel)] text-xl tracking-wide text-text-primary">
                {f.title}
              </h2>
              {(f.year || f.location) && (
                <p className="mt-1 font-mono text-xs text-text-muted">
                  {[f.year, f.location].filter(Boolean).join(" · ")}
                </p>
              )}
              <p className="mt-3 text-sm font-medium text-text-primary/90">
                {f.summary}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {f.detail}
              </p>
              {f.sources.length > 0 && (
                <p className="mt-4 font-mono text-[11px] text-text-muted/80">
                  Sources: {f.sources.join("; ")}
                </p>
              )}
              {f.relatedGiantSlug && (
                <Link
                  href={`/giants/${f.relatedGiantSlug}`}
                  className="mt-4 inline-block text-sm text-accent-gold hover:underline"
                >
                  Related giant entry →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
