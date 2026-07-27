"use client";

/**
 * One select, styled once.
 *
 * The catalogue and the map each had their own near-identical copy of this
 * markup, which is how they drifted apart. Both now render this.
 *
 * The list a mobile browser opens is an OS control and cannot be styled from
 * here — `color-scheme: dark` in globals.css is what makes it dark.
 */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
  format,
}: {
  label: string;
  value: string;
  /** Plain values, or {value,label} when the two differ. */
  options: (string | { value: string; label: string })[];
  onChange: (value: string) => void;
  /** Display transform for plain-string options, e.g. "modern-legend" → "Modern Legend". */
  format?: (value: string) => string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs tracking-wide text-text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full truncate rounded border border-border bg-background px-3 py-2 text-sm text-text-primary transition focus:border-accent-gold focus:outline-none"
      >
        <option value="">All</option>
        {options.map((o) => {
          const value = typeof o === "string" ? o : o.value;
          const text =
            typeof o === "string" ? (format ? format(o) : o) : o.label;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </label>
  );
}
