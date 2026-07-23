import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Project statement, methodology, and disclaimer for Giants of the World.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          The project
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          About
        </h1>
      </header>

      <div className="space-y-8 text-base leading-relaxed text-text-primary/90">
        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.2em] text-accent-gold uppercase">
            Statement
          </h2>
          <p className="mt-3 text-text-muted">
            <em className="text-text-primary">Giants of the World</em> is a web
            codex of giants drawn from mythology, folklore, and modern legend.
            The tone is atmospheric rather than academic — closer to opening a
            forbidden book than querying a database — but the structure remains
            careful: classical myth, living folklore, and unverified modern
            accounts are kept distinct.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.2em] text-accent-gold uppercase">
            Methodology
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-text-muted">
            <li>
              Content lives in a single JSON data layer — pages never hard-code
              entries.
            </li>
            <li>
              Types separate primordial beings, races, individuals, folklore,
              tall tales, and modern legends.
            </li>
            <li>
              Sources are listed on each entry; they range from primary epics
              to oral tradition and secondary compilations.
            </li>
            <li>
              Coordinates are traditional or literary associations, not claims
              of excavated proof.
            </li>
            <li>
              Living indigenous traditions are summarized respectfully and
              without claiming secret or restricted knowledge.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-amber-800/40 bg-amber-950/20 p-5">
          <h2 className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.2em] text-amber-200 uppercase">
            Disclaimer — modern legends
          </h2>
          <p className="mt-3 text-sm text-amber-100/85">
            Modern military legends (including accounts associated with
            Kandahar, Kunar, and similar conflict-zone stories) are{" "}
            <strong className="font-medium text-amber-100">
              unverified oral accounts
            </strong>
            . They are included as contemporary folklore — the way giant stories
            continue to form in our own century — and{" "}
            <strong className="font-medium text-amber-100">
              must not be read as confirmed historical or scientific fact
            </strong>
            . No official records corroborate these reports. Language such as
            “Reports claim…”, “According to the circulating account…”, and “No
            official records corroborate…” is deliberate.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.2em] text-accent-gold uppercase">
            Images
          </h2>
          <p className="mt-3 text-text-muted">
            Final illustrations will be supplied separately into{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-accent-gold">
              /public/images/giants/
            </code>
            . Until then, every portrait is an intentional silhouette
            placeholder — mist, shadow, and form — so the catalogue never shows
            a broken image.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.2em] text-accent-gold uppercase">
            Explore
          </h2>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/giants" className="text-accent-gold hover:underline">
              Catalogue
            </Link>
            <Link href="/map" className="text-accent-gold hover:underline">
              Map
            </Link>
            <Link href="/findings" className="text-accent-gold hover:underline">
              Bones & Shadows
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
