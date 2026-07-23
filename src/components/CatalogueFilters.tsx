"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

interface Props {
  cultures: string[];
  types: string[];
  regions: string[];
}

export function CatalogueFilters({ cultures, types, regions }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const culture = params.get("culture") ?? "";
  const type = params.get("type") ?? "";
  const region = params.get("region") ?? "";
  const search = params.get("q") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => {
        router.push(`/giants?${next.toString()}`);
      });
    },
    [params, router]
  );

  const clear = () => {
    startTransition(() => router.push("/giants"));
  };

  const hasFilters = culture || type || region || search;

  return (
    <div
      className={`space-y-4 rounded-lg border border-border bg-surface p-4 ${
        pending ? "opacity-70" : ""
      }`}
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[140px] flex-1 flex-col gap-1.5 text-xs text-text-muted">
          Search
          <input
            type="search"
            defaultValue={search}
            placeholder="Name, culture, tag…"
            className="rounded border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent-gold focus:outline-none"
            onChange={(e) => {
              const v = e.target.value;
              // Debounce lightly via timeout on each keystroke group
              window.clearTimeout((window as unknown as { __gq?: number }).__gq);
              (window as unknown as { __gq?: number }).__gq = window.setTimeout(
                () => update("q", v),
                250
              );
            }}
          />
        </label>

        <label className="flex min-w-[120px] flex-col gap-1.5 text-xs text-text-muted">
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

        <label className="flex min-w-[120px] flex-col gap-1.5 text-xs text-text-muted">
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

        <label className="flex min-w-[120px] flex-col gap-1.5 text-xs text-text-muted">
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

        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="rounded border border-border px-3 py-2 text-sm text-text-muted hover:border-accent-gold/40 hover:text-accent-gold"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
