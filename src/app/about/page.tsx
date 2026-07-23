import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Giants of the World — a codex of mythology, folklore, and modern legend.",
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
          <p className="text-text-muted">
            <em className="text-text-primary">Giants of the World</em> is a
            codex of giants drawn from mythology, folklore, and modern legend.
            The tone is atmospheric rather than academic — closer to opening a
            forbidden book than browsing a database. Classical myth, living
            folklore, and unverified modern accounts are kept distinct, and
            cultural sources are treated with care.
          </p>
          <p className="mt-4 text-text-muted">
            Each entry lists its sources. Locations on the map mark traditional
            or literary associations, not proof of excavated remains.
          </p>
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
            . No official records corroborate these reports.
          </p>
        </section>

        <section>
          <div className="flex flex-wrap gap-4 text-sm">
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
