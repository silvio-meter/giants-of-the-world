"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

/**
 * One dropdown, styled once — and rendered in the DOM rather than as a native
 * <select>.
 *
 * This used to be a real <select>. Every documented way to darken the list it
 * opens is already in place (color-scheme on :root and on the control, the
 * <meta name="color-scheme"> tag, an explicit `select option` background) and
 * none of them work on Chrome for Android: there the list is a native Android
 * dialog themed by the OS, so on a phone in light mode it opened as a white
 * sheet over the black codex. The list has to be ours to be dark, so it is.
 *
 * Focus stays on the trigger while the list is open and the active option is
 * tracked with aria-activedescendant — a listbox stays accessible that way
 * without the focus-trap machinery that moving focus into the list would need.
 */

interface Option {
  value: string;
  label: string;
}

/** How long a typeahead buffer survives between keystrokes, matching the native control. */
const TYPEAHEAD_RESET_MS = 700;

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
  const id = useId();
  const listId = `${id}-list`;
  const labelId = `${id}-label`;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeahead = useRef({ buffer: "", at: 0 });

  // "All" is the cleared state, carrying the same empty value the old
  // <option value=""> did, so callers keep receiving "" to mean "no filter".
  const items: Option[] = useMemo(
    () => [
      { value: "", label: "All" },
      ...options.map((o) =>
        typeof o === "string"
          ? { value: o, label: format ? format(o) : o }
          : { value: o.value, label: o.label }
      ),
    ],
    [options, format]
  );

  const selectedIndex = Math.max(
    0,
    items.findIndex((o) => o.value === value)
  );
  const selected = items[selectedIndex];

  const openList = useCallback(() => {
    setActive(selectedIndex);
    setOpen(true);
  }, [selectedIndex]);

  const commit = useCallback(
    (index: number) => {
      const option = items[index];
      if (option) onChange(option.value);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [items, onChange]
  );

  // Close on an outside press. Mousedown rather than click, so the list is
  // gone before a press on the page behind it resolves.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  // Keep the active option in view when arrowing past the scroll edge.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setActive((i) => Math.min(i + 1, items.length - 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openList();
        else setActive((i) => Math.max(i - 1, 0));
        return;
      case "Home":
        if (!open) return;
        e.preventDefault();
        setActive(0);
        return;
      case "End":
        if (!open) return;
        e.preventDefault();
        setActive(items.length - 1);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) commit(active);
        else openList();
        return;
      case "Escape":
        if (!open) return;
        e.preventDefault();
        setOpen(false);
        return;
      case "Tab":
        setOpen(false);
        return;
    }

    // Typeahead: a native select jumps to the first match as you type, and
    // losing that on a 30-entry culture list would be a real regression.
    if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
    const now = Date.now();
    const buffer =
      (now - typeahead.current.at > TYPEAHEAD_RESET_MS
        ? ""
        : typeahead.current.buffer) + e.key.toLowerCase();
    typeahead.current = { buffer, at: now };

    const match = items.findIndex((o) => o.label.toLowerCase().startsWith(buffer));
    if (match === -1) return;
    e.preventDefault();
    if (open) setActive(match);
    else onChange(items[match].value);
  }

  return (
    <div ref={wrapperRef} className="relative flex min-w-0 flex-col gap-1.5">
      <span id={labelId} className="text-xs tracking-wide text-text-muted">
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${id}-value`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className="flex w-full items-center justify-between gap-2 rounded border border-border bg-background px-3 py-2 text-left text-sm text-text-primary transition hover:border-accent-gold/45 focus:border-accent-gold focus:outline-none"
      >
        <span id={`${id}-value`} className="truncate">
          {selected?.label ?? "All"}
        </span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          stroke="#c9a227"
          strokeWidth="1.5"
          aria-hidden
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1.5 6 6.5l5-5" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute top-full left-0 z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-surface py-1 shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
        >
          {items.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li
                key={o.value || "__all"}
                id={`${id}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={isSelected}
                // Mousedown, not click: it lands before the outside-press
                // listener above would otherwise close the list under it.
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(i);
                }}
                // mousemove, not mouseenter: arrowing through the list scrolls
                // it, which slides options under a resting cursor and fires
                // mouseenter on them — that would drag the active row back to
                // wherever the pointer happens to sit mid-keystroke. mousemove
                // only fires when the pointer itself actually moves.
                onMouseMove={() => setActive(i)}
                // Active (keyboard cursor) and selected (current value) are
                // separate states, so they get separate signals: a wash for
                // the cursor, gold text for the value.
                className={`cursor-pointer px-3 py-2.5 text-sm sm:py-2 ${
                  i === active ? "bg-accent-gold/10" : ""
                } ${isSelected ? "text-accent-gold" : "text-text-primary"}`}
              >
                {o.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
