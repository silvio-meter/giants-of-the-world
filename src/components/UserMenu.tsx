"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPlanLabel } from "@/lib/access";
import { usePlan } from "./PlanProvider";

/**
 * Collapses "Account" + the plan badge + "Sign out" into one control.
 *
 * The desktop nav previously laid all three out as separate items alongside
 * seven page links and Random, which was eleven things across the bar and
 * wrapped ("Bones &" / "Shadows" on two lines) on ordinary desktop widths.
 * One trigger, one dropdown, in the site's own dark/gold palette rather than
 * a native menu.
 */
export function UserMenu() {
  const { plan, isPaid, signOut } = usePlan();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-sm text-text-muted transition hover:border-accent-gold/40 hover:text-accent-gold"
      >
        {isPaid ? (
          <span className="text-[10px] tracking-wide text-accent-gold uppercase">
            {formatPlanLabel(plan)}
          </span>
        ) : (
          "Account"
        )}
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M1 1.5 6 6.5l5-5" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-border bg-surface py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        >
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-text-primary hover:bg-background/60 hover:text-accent-gold"
          >
            Account
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="block w-full px-4 py-2 text-left text-sm text-text-muted hover:bg-background/60 hover:text-accent-gold"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
