import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold">
            GIANTS OF THE WORLD
          </p>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            A codex of giants from mythology, folklore, and modern legend.
            Modern military accounts are unverified oral tradition - not fact.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-text-muted">
          <Link href="/giants" className="hover:text-accent-gold">
            Catalogue
          </Link>
          <Link href="/map" className="hover:text-accent-gold">
            Map
          </Link>
          <Link href="/findings" className="hover:text-accent-gold">
            Findings
          </Link>
          <Link href="/pricing" className="hover:text-accent-gold">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-accent-gold">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
