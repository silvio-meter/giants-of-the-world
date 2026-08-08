import type { Metadata } from "next";
import Link from "next/link";
import { getFreeGiants } from "@/lib/giants";

/**
 * Post-signup / post-checkout onboarding.
 * Noindex: a flow page, not a ranking target.
 */
export const metadata: Metadata = {
  title: "Welcome",
  robots: { index: false, follow: false },
};

const steps = [
  {
    n: "01",
    title: "Open a free entry",
    body: "Start with a full account that ships unlocked. Ymir, Goliath, Ravana and the rest of the free set are complete pages, not teasers.",
    href: "/giants/ymir",
    cta: "Read Ymir",
  },
  {
    n: "02",
    title: "Compare two giants",
    body: "Pick a pair and see shared motifs, scale and fate side by side. The free opening still works; paid data fills in when you unlock.",
    href: "/compare",
    cta: "Open Compare",
  },
  {
    n: "03",
    title: "Save one for later",
    body: "Favourites sync when you are on a paid plan. Until then, use the catalogue and My Codex once you have opened a few pages.",
    href: "/giants",
    cta: "Browse the catalogue",
  },
] as const;

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string }>;
}) {
  const { paid } = await searchParams;
  const justPaid = paid === "1";
  const freeCount = getFreeGiants().length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="text-center">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
          {justPaid ? "The seal is open" : "You are in"}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          {justPaid ? "Welcome to the full codex" : "Three steps into the mist"}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-text-muted sm:text-base">
          {justPaid
            ? "Payment is through. Use the three steps below so the codex is a place you know, not a tab you lose."
            : `Free to browse. ${freeCount} entries open in full. Membership unlocks the sealed layers when you are ready.`}
        </p>
      </header>

      <ol className="mt-12 space-y-5">
        {steps.map((step) => (
          <li
            key={step.n}
            className="rounded-lg border border-border bg-surface p-5 sm:p-6"
          >
            <p className="font-mono text-[10px] tracking-[0.25em] text-accent-gold/70">
              {step.n}
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-cinzel)] text-lg tracking-wide text-text-primary">
              {step.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              {step.body}
            </p>
            <Link
              href={step.href}
              className="mt-4 inline-flex text-sm text-accent-gold hover:underline"
            >
              {step.cta} →
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-col items-center gap-3 text-sm text-text-muted sm:flex-row sm:justify-center sm:gap-6">
        <Link href="/evidence" className="text-accent-gold hover:underline">
          How we treat sources
        </Link>
        <Link href="/near" className="text-accent-gold hover:underline">
          Giants near you
        </Link>
        {!justPaid && (
          <Link href="/pricing" className="text-accent-gold hover:underline">
            See membership
          </Link>
        )}
        {justPaid && (
          <Link href="/my-codex" className="text-accent-gold hover:underline">
            Open My Codex
          </Link>
        )}
      </div>
    </div>
  );
}
