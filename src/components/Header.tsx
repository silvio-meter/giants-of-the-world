"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RandomGiantButton } from "./RandomGiantButton";
import { UserMenu } from "./UserMenu";
import { formatPlanLabel } from "@/lib/access";
import { usePlan } from "./PlanProvider";

const nav = [
  { href: "/giants", label: "Catalogue" },
  { href: "/favourites", label: "Favourites" },
  { href: "/motifs", label: "Motifs" },
  { href: "/map", label: "Map" },
  { href: "/findings", label: "Bones & Shadows" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { userId, plan, isPaid, signOut, ready } = usePlan();

  return (
    <header className="sticky top-0 z-40 w-full max-w-[100vw] border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="min-w-0 shrink font-[family-name:var(--font-cinzel)] text-[11px] tracking-[0.12em] text-accent-gold sm:text-sm sm:tracking-[0.2em] md:text-base"
        >
          <span className="sm:hidden">GIANTS</span>
          <span className="hidden sm:inline">GIANTS OF THE WORLD</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  active
                    ? "text-accent-gold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <RandomGiantButton compact />
          {ready && userId ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="text-sm text-text-muted hover:text-accent-gold"
            >
              Sign in
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded border border-border text-text-muted md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-surface px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-1 text-text-primary"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2" onClick={() => setOpen(false)}>
              <RandomGiantButton />
            </li>
            {userId && (
              <li>
                <Link
                  href="/account"
                  className="block py-1 text-text-primary"
                  onClick={() => setOpen(false)}
                >
                  Account
                </Link>
              </li>
            )}
            <li>
              {userId ? (
                <button
                  type="button"
                  className="py-1 text-text-muted"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                >
                  Sign out
                  {isPaid ? ` (${formatPlanLabel(plan)})` : ""}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block py-1 text-text-muted"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
