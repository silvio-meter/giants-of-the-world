import Link from "next/link";

interface Props {
  compact?: boolean;
  className?: string;
}

/**
 * Server component on purpose: /giants/random resolves the slug server-side,
 * so the catalog stays out of the browser bundle and the button works
 * without JavaScript.
 */
export function RandomGiantButton({ compact = false, className = "" }: Props) {
  if (compact) {
    return (
      <Link
        href="/giants/random"
        prefetch={false}
        className={`rounded border border-accent-gold/40 px-3 py-1.5 text-xs tracking-wide text-accent-gold transition hover:border-accent-gold hover:bg-accent-gold/10 ${className}`}
      >
        Random
      </Link>
    );
  }

  return (
    <Link
      href="/giants/random"
      prefetch={false}
      className={`inline-flex items-center justify-center rounded border border-accent-gold bg-accent-gold/10 px-6 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.15em] text-accent-gold transition hover:bg-accent-gold/20 ${className}`}
    >
      Random Giant
    </Link>
  );
}
