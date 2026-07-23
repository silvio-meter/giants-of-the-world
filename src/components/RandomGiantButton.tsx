"use client";

import { useRouter } from "next/navigation";
import { getAllGiants } from "@/lib/giants";

interface Props {
  compact?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function RandomGiantButton({
  compact = false,
  onNavigate,
  className = "",
}: Props) {
  const router = useRouter();

  function handleClick() {
    const list = getAllGiants();
    const giant = list[Math.floor(Math.random() * list.length)];
    onNavigate?.();
    router.push(`/giants/${giant.slug}`);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`rounded border border-accent-gold/40 px-3 py-1.5 text-xs tracking-wide text-accent-gold transition hover:border-accent-gold hover:bg-accent-gold/10 ${className}`}
      >
        Random
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded border border-accent-gold bg-accent-gold/10 px-6 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.15em] text-accent-gold transition hover:bg-accent-gold/20 ${className}`}
    >
      Random Giant
    </button>
  );
}
