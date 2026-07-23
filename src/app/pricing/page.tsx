"use client";

import Link from "next/link";
import { usePlan } from "@/components/PlanProvider";
import type { UserPlan } from "@/lib/access";

const plans: {
  id: UserPlan;
  name: string;
  price: string;
  period: string;
  blurb: string;
  badge?: string;
  hero?: boolean;
}[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$4.99",
    period: "/ month",
    blurb: "Low-commitment entry. Cancel anytime.",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "$39",
    period: "/ year",
    blurb: "Best recurring value — two months free vs monthly.",
    badge: "Most Popular",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$69",
    period: " once",
    blurb: "Pay once, own forever. The codex stays open.",
    badge: "Best Value",
    hero: true,
  },
];

export default function PricingPage() {
  const { plan, setPlan, isPaid } = usePlan();

  function selectPlan(id: UserPlan) {
    // Stripe Checkout will replace this. For now, unlock locally so we can test UX.
    setPlan(id);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 text-center">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Open the sealed pages
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Pricing
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted sm:text-base">
          Free readers see every giant&apos;s basic account. Full histories,
          mystery notes, and future premium tools unlock with any paid plan.
        </p>
        {isPaid && (
          <p className="mt-4 inline-block rounded border border-accent-gold/40 bg-accent-gold/10 px-3 py-1.5 text-xs text-accent-gold">
            Current plan: {plan}
          </p>
        )}
      </header>

      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-lg border p-6 transition ${
              p.hero
                ? "border-accent-gold bg-accent-gold/10 shadow-[0_0_40px_rgba(201,162,39,0.12)] md:scale-105 md:py-8"
                : "border-border bg-surface"
            }`}
          >
            {p.badge && (
              <span
                className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] tracking-wider uppercase ${
                  p.hero
                    ? "bg-accent-gold text-background"
                    : "border border-border bg-background text-text-muted"
                }`}
              >
                {p.badge}
              </span>
            )}
            <h2
              className={`font-[family-name:var(--font-cinzel)] text-lg tracking-wide ${
                p.hero ? "text-accent-gold" : "text-text-primary"
              }`}
            >
              {p.name}
            </h2>
            <p className="mt-3">
              <span className="font-[family-name:var(--font-cinzel)] text-3xl text-text-primary">
                {p.price}
              </span>
              <span className="text-sm text-text-muted">{p.period}</span>
            </p>
            {p.hero && (
              <p className="mt-2 text-xs tracking-wide text-accent-gold">
                Pay once, own forever
              </p>
            )}
            <p className="mt-3 flex-1 text-sm text-text-muted">{p.blurb}</p>
            <button
              type="button"
              onClick={() => selectPlan(p.id)}
              className={`mt-6 w-full rounded px-4 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] transition ${
                p.hero
                  ? "border border-accent-gold bg-accent-gold text-background hover:bg-accent-gold/90"
                  : "border border-border text-text-primary hover:border-accent-gold/50 hover:text-accent-gold"
              }`}
            >
              {plan === p.id ? "Current plan" : `Choose ${p.name}`}
            </button>
          </div>
        ))}
      </div>

      <section className="mt-12 rounded-lg border border-border bg-surface p-6">
        <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          What paid unlocks
        </h3>
        <ul className="mt-4 grid gap-2 text-sm text-text-muted sm:grid-cols-2">
          <li>— Full detailed accounts for every giant</li>
          <li>— Mystery notes (whispered asides)</li>
          <li>— Size comparison tool (coming)</li>
          <li>— Favourites & advanced map filters (coming)</li>
          <li>— Offline / PWA access (coming)</li>
          <li>— Ad-free experience (coming)</li>
        </ul>
        <p className="mt-4 text-xs text-text-muted/80">
          Stripe checkout is not connected yet. Choosing a plan unlocks content
          in this browser for testing. Real payments will replace this shortly.
        </p>
      </section>

      <p className="mt-8 text-center text-sm text-text-muted">
        <Link href="/giants" className="text-accent-gold hover:underline">
          Return to catalogue
        </Link>
        {" · "}
        <button
          type="button"
          onClick={() => setPlan("free")}
          className="text-text-muted hover:text-accent-gold"
        >
          Reset to free
        </button>
      </p>
    </div>
  );
}
