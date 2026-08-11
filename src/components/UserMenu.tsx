"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPlanLabel } from "@/lib/access";
import { usePlan } from "./PlanProvider";

/**
 * Account control for the desktop bar: plan badge + links that used to
 * crowd the primary nav (Journey, Favourites, My Codex).
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

  const itemClass =
    "block px-4 py-2 text-sm text-text-primary hover:bg-background/60 hover:text-accent-gold";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 whitespace-nowrap rounded border border-border px-2.5 py-1 text-sm text-text-muted transition hover:border-accent-gold/40 hover:text-accent-gold"
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
          className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-surface py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        >
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            Account
          </Link>
          <Link
            href="/journey"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            My Journey
          </Link>
          <Link
            href="/favourites"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            Favourites
          </Link>
          <Link
            href="/my-codex"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            My Codex
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
