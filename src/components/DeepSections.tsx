import Link from "next/link";
import { splitParagraphs } from "@/lib/content";
import { getMotif, giantsSharingMotif } from "@/lib/motifs";
import type { GiantSections } from "@/lib/types";

function Prose({ text }: { text: string }) {
  return (
    <div className="mt-4 space-y-4 text-base leading-relaxed text-text-primary/90">
      {splitParagraphs(text).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
      {children}
    </h2>
  );
}

/**
 * The motif layer — the part a general encyclopedia has no place for, since it
 * files one article per figure and never reads across them.
 */
function Motifs({ keys, slug }: { keys: string[]; slug: string }) {
  const resolved = keys
    .map((k) => ({ motif: getMotif(k), others: giantsSharingMotif(k, slug) }))
    .filter((m): m is { motif: NonNullable<ReturnType<typeof getMotif>>; others: ReturnType<typeof giantsSharingMotif> } => m.motif !== null);

  if (resolved.length === 0) return null;

  return (
    <section className="mt-10">
      <Heading>Motifs</Heading>
      <ul className="mt-4 space-y-4">
        {resolved.map(({ motif, others }) => (
          <li
            key={motif.key}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <p className="font-[family-name:var(--font-cinzel)] text-sm text-accent-gold">
              {motif.name}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
              {motif.blurb}
            </p>
            {others.length > 0 && (
              <p className="mt-3 text-sm text-text-muted">
                <span className="text-text-muted/70">Also carried by: </span>
                {others.map((g, i) => (
                  <span key={g.slug}>
                    {i > 0 && ", "}
                    <Link
                      href={`/giants/${g.slug}`}
                      className="text-accent-gold hover:underline"
                    >
                      {g.name}
                    </Link>
                    <span className="text-text-muted/60"> ({g.culture})</span>
                  </span>
                ))}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DeepSections({
  sections,
  motifs,
  slug,
}: {
  sections: GiantSections;
  motifs?: string[];
  slug: string;
}) {
  return (
    <>
      <section>
        <Heading>The story</Heading>
        <Prose text={sections.story} />
      </section>

      <section className="mt-10">
        <Heading>Where it comes from</Heading>
        <Prose text={sections.origins} />
      </section>

      {motifs && motifs.length > 0 && <Motifs keys={motifs} slug={slug} />}

      <section className="mt-10">
        <Heading>What is disputed</Heading>
        <Prose text={sections.disputed} />
      </section>
    </>
  );
}
