"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ComparePickerOption } from "@/lib/giants";

interface Props {
  options: ComparePickerOption[];
  /** Pre-filled when arriving from a giant's own page via its Compare button. */
  initialA?: string;
  initialB?: string;
}

function Slot({
  label,
  options,
  excludeSlug,
  value,
  onChange,
}: {
  label: string;
  options: ComparePickerOption[];
  excludeSlug?: string;
  value: string;
  onChange: (slug: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.slug === value);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return options
      .filter((o) => o.slug !== excludeSlug && o.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, options, excludeSlug]);

  return (
    <div className="relative flex-1">
      <label className="flex flex-col gap-1.5 text-xs tracking-wide text-text-muted">
        {label}
        <input
          type="text"
          value={selected ? selected.name : query}
          onChange={(e) => {
            onChange("");
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder="Search a giant…"
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
        />
      </label>
      {open && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
          {matches.map((o) => (
            <li key={o.slug}>
              <button
                type="button"
                // onMouseDown fires before the input's onBlur closes the list.
                onMouseDown={() => {
                  onChange(o.slug);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-background/60 hover:text-accent-gold"
              >
                {o.name}
                <span className="text-xs text-text-muted">{o.culture}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ComparePicker({ options, initialA, initialB }: Props) {
  const router = useRouter();
  const [a, setA] = useState(initialA ?? "");
  const [b, setB] = useState(initialB ?? "");

  function go() {
    if (!a || !b) return;
    router.push(`/compare?a=${a}&b=${b}`);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Slot label="First giant" options={options} excludeSlug={b} value={a} onChange={setA} />
        <span className="hidden pb-2 text-text-muted sm:block" aria-hidden>
          vs
        </span>
        <Slot label="Second giant" options={options} excludeSlug={a} value={b} onChange={setB} />
        <button
          type="button"
          onClick={go}
          disabled={!a || !b}
          className="rounded border border-accent-gold bg-accent-gold px-5 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Compare
        </button>
      </div>
    </div>
  );
}
