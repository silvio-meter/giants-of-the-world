"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { FilterSelect } from "./FilterSelect";
import { formatType } from "@/lib/format";
import type { GiantType } from "@/lib/types";

interface Props {
  cultures: string[];
  types: string[];
  regions: string[];
}

const SORT_OPTIONS = [
  { value: "name", label: "Name A–Z" },
  { value: "culture", label: "Culture" },
  { value: "free-first", label: "Free first" },
  { value: "scholarly-first", label: "Scholarly first" },
] as const;

export function CatalogueFilters({ cultures, types, regions }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const culture = params.get("culture") ?? "";
  const type = params.get("type") ?? "";
  const region = params.get("region") ?? "";
  const search = params.get("q") ?? "";
  const free = params.get("free") === "1";
  const scholarly = params.get("scholarly") === "1";
  const chain = params.get("chain") === "1";
  const sort = params.get("sort") ?? "name";
  const [typed, setTyped] = useState(search);
  const debounce = useRef<number | undefined>(undefined);

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => {
        router.replace(`/giants?${next.toString()}`);
      });
    },
    [params, router],
  );

  const toggle = useCallback(
    (key: string, on: boolean) => {
      update(key, on ? "1" : "");
    },
    [update],
  );

  useEffect(() => {
    if (typed === search) return;
    debounce.current = window.setTimeout(() => update("q", typed), 250);
    return () => window.clearTimeout(debounce.current);
  }, [typed, search, update]);

  const clear = () => {
    setTyped("");
    startTransition(() => router.replace("/giants"));
  };

  const hasFilters =
    culture || type || region || search || free || scholarly || chain || sort !== "name";

  return (
    <div
      className={`space-y-4 rounded-lg border border-border bg-surface p-4 ${
        pending ? "opacity-70" : ""
      }`}
    >
      <label className="flex flex-col gap-1.5 text-xs tracking-wide text-text-muted">
        Search
        <input
          type="search"
          value={typed}
          placeholder="Name, culture, tag…"
          className="rounded border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none"
          onChange={(e) => setTyped(e.target.value)}
        />
      </label>

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
          label="Sort"
          value={sort}
          options={SORT_OPTIONS.map((o) => o.value)}
          onChange={(v) => update("sort", v === "name" ? "" : v)}
          format={(v) =>
            SORT_OPTIONS.find((o) => o.value === v)?.label ?? v
          }
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] tracking-wider text-text-muted uppercase">
          Layers
        </span>
        <ToggleChip
          label="Free"
          on={free}
          onChange={(v) => toggle("free", v)}
        />
        <ToggleChip
          label="Scholarly notes"
          on={scholarly}
          onChange={(v) => toggle("scholarly", v)}
        />
        <ToggleChip
          label="Chain of custody"
          on={chain}
          onChange={(v) => toggle("chain", v)}
        />
      </div>

      <div className="flex justify-end">
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="rounded border border-border px-3 py-2 text-sm text-text-muted hover:border-accent-gold/40 hover:text-accent-gold"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function ToggleChip({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={`rounded-full border px-3 py-1 text-xs tracking-wide transition ${
        on
          ? "border-accent-gold/60 bg-accent-gold/10 text-accent-gold"
          : "border-border text-text-muted hover:border-accent-gold/30 hover:text-text-primary"
      }`}
    >
      {label}
    </button>
  );
}
