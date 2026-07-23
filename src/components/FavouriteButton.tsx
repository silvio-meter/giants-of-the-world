"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { canUseFavourites } from "@/lib/access";
import { useFavourites } from "./FavouritesProvider";
import { usePlan } from "./PlanProvider";

interface Props {
  slug: string;
  name?: string;
  /** card = corner overlay; detail = larger inline */
  variant?: "card" | "detail";
  className?: string;
}

export function FavouriteButton({
  slug,
  name,
  variant = "detail",
  className = "",
}: Props) {
  const pathname = usePathname();
  const { isPaid, userId, plan, ready: planReady } = usePlan();
  const { isFavourite, toggle, ready: favReady } = useFavourites();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const active = isFavourite(slug);
  const allowed = canUseFavourites(plan) && isPaid;

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setMsg("");

    if (!planReady) return;

    if (!userId) {
      window.location.href = `/login?next=${encodeURIComponent(pathname || `/giants/${slug}`)}`;
      return;
    }
    if (!allowed) {
      window.location.href = "/pricing";
      return;
    }

    setBusy(true);
    const res = await toggle(slug);
    setBusy(false);
    if (!res.ok && res.error && res.error !== "paid_required") {
      setMsg(res.error);
    }
  }

  const label = !userId
    ? "Sign in to save favourites"
    : !allowed
      ? "Favourites unlock with any paid plan"
      : active
        ? `Remove ${name ?? "giant"} from favourites`
        : `Save ${name ?? "giant"} to favourites`;

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy || !planReady || !favReady}
        title={label}
        aria-label={label}
        aria-pressed={active}
        className={`absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background/80 text-lg backdrop-blur-sm transition hover:border-accent-gold/50 disabled:opacity-50 ${
          active ? "text-accent-gold" : "text-text-muted"
        } ${className}`}
      >
        {active ? "★" : "☆"}
      </button>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy || !planReady}
        aria-label={label}
        aria-pressed={active}
        className={`inline-flex items-center gap-2 rounded border px-3 py-1.5 text-xs tracking-wide transition disabled:opacity-50 ${
          active
            ? "border-accent-gold/50 bg-accent-gold/10 text-accent-gold"
            : "border-border text-text-muted hover:border-accent-gold/40 hover:text-accent-gold"
        }`}
      >
        <span className="text-base leading-none" aria-hidden>
          {active ? "★" : "☆"}
        </span>
        {active ? "Favourited" : "Add to favourites"}
      </button>
      {!allowed && userId && (
        <Link href="/pricing" className="text-[10px] text-text-muted hover:text-accent-gold">
          Paid feature — view pricing
        </Link>
      )}
      {!userId && planReady && (
        <span className="text-[10px] text-text-muted">Sign in required</span>
      )}
      {msg && (
        <span className="text-[10px] text-rose-300/90" role="alert">
          {msg}
        </span>
      )}
    </div>
  );
}
