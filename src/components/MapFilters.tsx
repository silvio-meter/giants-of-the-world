"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { canUseMapFilters } from "@/lib/access";
import { usePlan } from "./PlanProvider";
import { useFavourites } from "./FavouritesProvider";
import { FilterSelect } from "./FilterSelect";
import { formatType } from "@/lib/format";
import type { GiantType } from "@/lib/types";

interface Props {
  cultures: string[];
  types: string[];
  regions: string[];
  /** Curated cross-cultural motifs, with entry counts, replacing the old tag list. */
  motifs: { key: string; label: string }[];
}

export function MapFilters({ cultures, types, regions, motifs }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const { plan, isPaid, userId, ready } = usePlan();
  const { count: favCount } = useFavourites();
  const allowed = canUseMapFilters(plan) && isPaid;

  const culture = params.get("culture") ?? "";
  const type = params.get("type") ?? "";
  const region = params.get("region") ?? "";
  const motif = params.get("motif") ?? "";
  const fav = params.get("fav") === "1";
  const lines = params.get("lines") === "1";
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
    [allowed, params, router],
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

  const toggleLines = () => {
    if (!allowed) return;
    const next = new URLSearchParams(params.toString());
    if (lines) next.delete("lines");
    else next.set("lines", "1");
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

  const hasFilters = culture || type || region || motif || fav || lines;

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
          Filter pins by culture, type, region, motif, or favourites: a paid
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
        <div className="flex items-center gap-3">
          <Link
            href="/motifs"
            className="text-xs text-text-muted hover:text-accent-gold"
          >
            What are motifs?
          </Link>
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
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FilterSelect
          label="Culture"
          value={culture}
          options={cultures}
          onChange={(v) => update("culture", v)}
        />
        <FilterSelect
          label="Type"
          value={type}
          options={types}
          onChange={(v) => update("type", v)}
          format={(v) => formatType(v as GiantType)}
        />
        <FilterSelect
          label="Region"
          value={region}
          options={regions}
          onChange={(v) => update("region", v)}
        />
        <FilterSelect
          label="Motif"
          value={motif}
          options={motifs.map((m) => ({ value: m.key, label: m.label }))}
          onChange={(v) => update("motif", v)}
        />
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
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={lines}
            onChange={toggleLines}
            className="rounded border-border accent-[#c9a227]"
          />
          Show motif connections
        </label>
      </div>
    </div>
  );
}
