import type { Metadata } from "next";
import Link from "next/link";
import { EmailCapture } from "@/components/EmailCapture";
import { getFreeGiants } from "@/lib/giants";

/**
 * Post-signup / post-checkout onboarding.
 * Noindex: a flow page, not a ranking target.
 */
export const metadata: Metadata = {
  title: "Welcome",
  alternates: { canonical: "/welcome" },
  robots: { index: false, follow: false },
};

const COMPARE_HREF = "/compare?a=ymir&b=surtr";

const unpaidSteps = [
  {
    n: "01",
    title: "Open a free entry",
    body: "Start with a full account that ships unlocked. Ymir, Goliath, Ravana and the rest of the free set open the story in full. Scholarly notes and extra sources come with membership.",
    href: "/giants/ymir",
    cta: "Read Ymir",
  },
  {
    n: "02",
    title: "Compare two giants",
    body: "Pick a pair and see shared motifs, scale and fate side by side. The free opening still works; paid data fills in when you unlock.",
    href: COMPARE_HREF,
    cta: "Open Compare",
  },
  {
    n: "03",
    title: "Open a sealed page",
    body: "Thrym's first paragraph is free. The rest of that story is the $4.99 month.",
    href: "/giants/thrym",
    cta: "Read Thrym",
  },
] as const;

const paidSteps = [
  {
    n: "01",
    title: "Open a sealed page",
    body: "The rest of the story is open now. Thrym is a good first sealed account to walk through in full.",
    href: "/giants/thrym",
    cta: "Read Thrym",
  },
  {
    n: "02",
    title: "Compare two giants",
    body: "Ymir and Surtr side by side: scale stays free, and membership now shows the fate of both and which traditions they share.",
    href: COMPARE_HREF,
    cta: "Open Compare",
  },
  {
    n: "03",
    title: "Draw the map",
    body: "Pins were always free. Membership draws the motif lines and the pin filters.",
    href: "/map",
    cta: "Open the map",
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
  const steps = justPaid ? paidSteps : unpaidSteps;

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
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={step.href}
                className="inline-flex text-sm text-accent-gold hover:underline"
              >
                {step.cta} →
              </Link>
              {!justPaid && step.n === "03" && (
                <Link
                  href="/signup?next=%2Fgiants%2Fthrym%3Fcheckout%3Dmonthly"
                  className="inline-flex text-sm text-text-muted hover:text-accent-gold hover:underline"
                >
                  Unlock · $4.99/month
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/*
        Mid-page One Seam with Unlock visual weight. Site footer band still
        shows on /welcome (not a giant entry path).
      */}
      <div className="mt-10">
        <EmailCapture
          variant="spotlight"
          sourcePage={justPaid ? "welcome-paid" : "welcome"}
        />
      </div>

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
