import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
        Lost in the fog
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl text-accent-gold">
        Entry not found
      </h1>
      <p className="mt-4 max-w-md text-sm text-text-muted">
        This page has sunk beneath the mist — or never existed in the codex.
      </p>
      <Link
        href="/giants"
        className="mt-8 text-sm text-accent-gold hover:underline"
      >
        Return to the catalogue
      </Link>
    </div>
  );
}
