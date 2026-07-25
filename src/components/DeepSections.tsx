import Link from "next/link";
import { splitParagraphs } from "@/lib/content";
import type { ResolvedMotif } from "@/lib/motif-view";
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
 *
 * Takes already-resolved data: this component is rendered inside a client
 * boundary, and reaching into the catalog from here would ship it to the
 * browser.
 */
function Motifs({ motifs }: { motifs: ResolvedMotif[] }) {
  if (motifs.length === 0) return null;

  return (
    <section className="mt-10">
      <Heading>Motifs</Heading>
      <ul className="mt-4 space-y-4">
        {motifs.map((motif) => (
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
            {motif.others.length > 0 && (
              <p className="mt-3 text-sm text-text-muted">
                <span className="text-text-muted/80">Also carried by: </span>
                {motif.others.map((g, i) => (
                  <span key={g.slug}>
                    {i > 0 && ", "}
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
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DeepSections({
  sections,
  motifs = [],
  restrained = false,
}: {
  sections: GiantSections;
  /** Resolved server-side; see lib/motifs.resolveMotifs. */
  motifs?: ResolvedMotif[];
  /** Short on purpose: the record is thin or could not be attributed. */
  restrained?: boolean;
}) {
  return (
    <>
      {restrained && (
        <div
          className="mb-8 rounded border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/90"
          role="note"
        >
          <strong className="font-medium text-amber-200">
            A deliberately short entry.
          </strong>{" "}
          We could not attribute this tradition to a specific community from
          the sources available, so we have not written a fuller account rather
          than invent one. This entry is free to read.
        </div>
      )}
      <section>
        <Heading>The story</Heading>
        <Prose text={sections.story} />
      </section>

      <section className="mt-10">
        <Heading>Where it comes from</Heading>
        <Prose text={sections.origins} />
      </section>

      <Motifs motifs={motifs} />

      <section className="mt-10">
        <Heading>What is disputed</Heading>
        <Prose text={sections.disputed} />
      </section>
    </>
  );
}
