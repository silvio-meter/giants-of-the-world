"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { canUseMapFilters } from "@/lib/access";
import { usePlan } from "./PlanProvider";
import { useFavourites } from "./FavouritesProvider";

interface Props {
  cultures: string[];
  types: string[];
  regions: string[];
  tags: string[];
}

export function MapFilters({ cultures, types, regions, tags }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const { plan, isPaid, userId, ready } = usePlan();
  const { count: favCount } = useFavourites();
  const allowed = canUseMapFilters(plan) && isPaid;

  const culture = params.get("culture") ?? "";
  const type = params.get("type") ?? "";
  const region = params.get("region") ?? "";
  const tag = params.get("tag") ?? "";
  const fav = params.get("fav") === "1";
  const focus = params.get("focus") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      if (!allowed) return;
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => {
        router.push(`/map?${next.toString()}`);
      });
    },
    [allowed, params, router]
  );

  const toggleFav = () => {
    if (!allowed) return;
    const next = new URLSearchParams(params.toString());
    if (fav) next.delete("fav");
    else next.set("fav", "1");
    startTransition(() => {
      router.push(`/map?${next.toString()}`);
    });
  };

  const clear = () => {
    if (!allowed) return;
    const next = new URLSearchParams();
    if (focus) next.set("focus", focus);
    startTransition(() => {
      router.push(next.toString() ? `/map?${next}` : "/map");
    });
  };

  const hasFilters = culture || type || region || tag || fav;

  if (!ready) {
    return (
      <div className="mb-6 h-24 animate-pulse rounded-lg border border-border bg-surface" />
    );
  }

  if (!userId || !allowed) {
    return (
      <div className="mb-6 rounded-lg border border-border bg-surface p-4 sm:p-5">
        <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
          Advanced map filters
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Filter pins by culture, type, region, tags, or favourites — a paid
          codex tool.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {!userId ? (
            <Link
              href={`/login?next=${encodeURIComponent("/map")}`}
              className="text-accent-gold hover:underline"
            >
              Sign in
            </Link>
          ) : null}
          <Link href="/pricing" className="text-accent-gold hover:underline">
            View pricing →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-6 space-y-3 rounded-lg border border-border bg-surface p-4 ${
        pending ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
          Advanced filters
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-text-muted hover:text-accent-gold"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[120px] flex-1 flex-col gap-1.5 text-xs text-text-muted">
          Culture
          <select
            value={culture}
            onChange={(e) => update("culture", e.target.value)}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
          >
            <option value="">All</option>
            {cultures.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[120px] flex-1 flex-col gap-1.5 text-xs text-text-muted">
          Type
          <select
            value={type}
            onChange={(e) => update("type", e.target.value)}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
          >
            <option value="">All</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[120px] flex-1 flex-col gap-1.5 text-xs text-text-muted">
          Region
          <select
            value={region}
            onChange={(e) => update("region", e.target.value)}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
          >
            <option value="">All</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[120px] flex-1 flex-col gap-1.5 text-xs text-text-muted">
          Tag
          <select
            value={tag}
            onChange={(e) => update("tag", e.target.value)}
            className="rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
          >
            <option value="">All</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={fav}
            onChange={toggleFav}
            className="rounded border-border accent-[#c9a227]"
          />
          Favourites only
          {favCount > 0 && (
            <span className="font-mono text-xs text-text-muted/80">
              ({favCount})
            </span>
          )}
        </label>
      </div>
    </div>
  );
}
