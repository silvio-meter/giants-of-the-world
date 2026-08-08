import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { crossCulturalMotifs, getAllMotifs } from "@/lib/motifs";
import { giants } from "@/lib/giants";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Motifs",
  description:
    "The same giant-motifs appearing in unconnected traditions: one eye, a world built from a body, survivors of the flood, the people who came before.",
  alternates: { canonical: "/motifs" },
};

/**
 * The cross-cultural view. A general encyclopedia files one article per figure
 * and has nowhere to ask which unconnected traditions arrived at the same
 * shape, which is the whole reason this page exists.
 */
export default function MotifsPage() {
  const cross = crossCulturalMotifs();
  const single = getAllMotifs().filter(
    (m) => !cross.some((c) => c.motif.key === m.key)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Motifs · Giants of the World",
    description:
      "Recurring motifs in giant traditions, grouped across cultures.",
    url: `${siteUrl}/motifs`,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mb-10">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
          Read across the codex
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Motifs
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          An encyclopedia gives each giant its own page and stops there. These
          are the shapes that recur: a single eye, a world built from a body,
          the people who came before, in traditions with no route between
          them. Recurrence is not evidence of contact. It is the interesting
          part regardless.
        </p>
      </header>

      <section>
        <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Crossing cultures
        </h2>
        <ul className="mt-5 space-y-5">
          {cross.map(({ motif, cultures }) => {
            const carriers = giants.filter((g) =>
              g.motifs?.includes(motif.key)
            );
            return (
              <li
                key={motif.key}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-[family-name:var(--font-cinzel)] text-lg text-accent-gold">
                    {motif.name}
                  </h3>
                  <span className="font-mono text-xs text-text-muted">
                    {cultures.length} cultures · {carriers.length} entries
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {motif.blurb}
                </p>
                {carriers.some((g) => g.image) && (
                  <ul className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {carriers
                      .filter((g) => g.image)
                      .slice(0, 8)
                      .map((g) => (
                        <li key={g.slug} className="shrink-0">
                          <Link
                            href={`/giants/${g.slug}`}
                            className="group block w-16 overflow-hidden rounded border border-border transition hover:border-accent-gold/50"
                            title={g.name}
                          >
                            <span className="relative block aspect-square bg-[#0a0e14]">
                              <Image
                                src={g.image}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover opacity-90 transition group-hover:opacity-100"
                              />
                            </span>
                            <span className="block truncate px-1 py-0.5 text-center font-mono text-[9px] text-text-muted group-hover:text-accent-gold">
                              {g.name}
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
                <p className="mt-3 text-sm">
                  {carriers.map((g, i) => (
                    <span key={g.slug}>
                      {i > 0 && (
                        <span className="text-text-muted/40"> · </span>
                      )}
                      <Link
                        href={`/giants/${g.slug}`}
                        className="text-accent-gold hover:underline"
                      >
                        {g.name}
                      </Link>
                      <span className="text-text-muted"> ({g.culture})</span>
                    </span>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {single.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
            Found in one tradition so far
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {single.map((m) => (
              <li
                key={m.key}
                className="rounded border border-border bg-surface px-4 py-3"
              >
                <p className="text-sm text-text-primary">{m.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  {m.blurb}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
