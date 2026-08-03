"use client";

import Link from "next/link";
import { gaEvent } from "@/lib/ga";

interface Props {
  compact?: boolean;
  className?: string;
}

/**
 * Still a real <Link href> — /giants/random resolves the slug server-side,
 * and navigation works with no JavaScript at all, same as before. The only
 * thing client-side JS adds is the click event firing; it never intercepts
 * or delays the navigation itself (no preventDefault).
 */
export function RandomGiantButton({ compact = false, className = "" }: Props) {
  if (compact) {
    return (
      <Link
        href="/giants/random"
        prefetch={false}
        onClick={() => gaEvent("random_giant")}
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
      onClick={() => gaEvent("random_giant")}
      className={`inline-flex items-center justify-center rounded border border-accent-gold bg-accent-gold/10 px-6 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.15em] text-accent-gold transition hover:bg-accent-gold/20 ${className}`}
    >
      Random Giant
    </Link>
  );
}
