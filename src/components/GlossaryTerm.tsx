"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Props {
  term: string;
  definition: string;
  children: React.ReactNode;
}

/**
 * A term with a short inline definition. Dotted underline signals it's
 * interactive; hover reveals it on desktop, tap reveals it on touch (no
 * hover event exists there). Click always opens rather than toggling —
 * a toggle would fight with hover on desktop, since a real click is
 * preceded by a mouseenter that already set `open` true, and a browser's
 * synthesized touch-to-mouse-event sequence can do the same. Closing only
 * ever happens via the backdrop, an outside click, or Escape.
 *
 * Hover is bound to the wrapper, not the trigger button alone — otherwise
 * moving the cursor off the button and onto the tooltip itself (to read a
 * longer definition, or select its text) would fire mouseleave and close it
 * out from under the reader mid-hover.
 *
 * Below `sm`, the popover becomes a fixed bar pinned to the bottom of the
 * viewport instead of an anchored box under the word, so it can never
 * overflow the screen edge regardless of where the term sits on the page —
 * the "bottom sheet" the spec asked for, without floating-ui-style position
 * math for what's meant to be a cheap feature.
 */
export function GlossaryTerm({ term, definition, children }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <span
      ref={wrapperRef}
      className="relative inline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="border-b border-dotted border-accent-gold/60 text-[inherit] hover:border-accent-gold"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>

      {open && (
        <>
          {/* Mobile: dim + tap-to-dismiss backdrop. Desktop never shows this. */}
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            id={tooltipId}
            role="tooltip"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-lg border-t border-accent-gold/30 bg-surface p-4 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:left-1/2 sm:z-20 sm:mt-2 sm:w-72 sm:-translate-x-1/2 sm:rounded-lg sm:border sm:border-border sm:p-3 sm:pb-3 sm:shadow-xl"
          >
            <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.15em] text-accent-gold uppercase">
              {term}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-primary/90">
              {definition}
            </p>
          </div>
        </>
      )}
    </span>
  );
}
