"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { usePlan } from "@/components/PlanProvider";
import type { PaidPlan, UserPlan } from "@/lib/access";
import { formatPlanLabel } from "@/lib/access";
import { PLAN_PRICES } from "@/lib/plans";

const plans: {
  id: PaidPlan;
  badge?: string;
  hero?: boolean;
}[] = [
  { id: "monthly" },
  { id: "yearly", badge: "Most Popular" },
  { id: "lifetime", badge: "Best Value", hero: true },
];

function PricingInner() {
  const { plan, isPaid, userId, ready, configured, refresh, signOut } =
    usePlan();
  const params = useSearchParams();
  const success = params.get("success") === "1";
  const canceled = params.get("canceled") === "1";

  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);
  const [error, setError] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  async function checkout(target: PaidPlan) {
    setError("");
    if (!configured) {
      setError(
        "Payments are not configured. Add Supabase + Stripe keys (see SETUP.md)."
      );
      return;
    }
    if (!userId) {
      window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
      return;
    }
    setLoadingPlan(target);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: target }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        redirect?: string;
      };
      if (res.status === 401 && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout failed.");
        setLoadingPlan(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout failed. Please try again.");
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setError("");
    setPortalLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Could not open billing portal.");
        setPortalLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not open billing portal.");
      setPortalLoading(false);
    }
  }

  // After Stripe success, refresh plan from Supabase (webhook may take a moment)
  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => void refresh(), 1200);
    const t2 = window.setTimeout(() => void refresh(), 4000);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [success, refresh]);

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
          Free readers get every giant&apos;s opening account. Members unlock
          the full history, mystery notes, and future premium tools.
        </p>
        {ready && isPaid && (
          <p className="mt-4 inline-block rounded border border-accent-gold/40 bg-accent-gold/10 px-3 py-1.5 text-xs text-accent-gold">
            Current plan: {formatPlanLabel(plan as UserPlan)}
          </p>
        )}
        {success && (
          <p className="mt-4 text-sm text-accent-gold" role="status">
            Payment received. Your access unlocks within a few seconds - refresh
            if needed.
          </p>
        )}
        {canceled && (
          <p className="mt-4 text-sm text-text-muted" role="status">
            Checkout canceled. The sealed pages wait when you are ready.
          </p>
        )}
      </header>

      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {plans.map((p) => {
          const meta = PLAN_PRICES[p.id];
          const isCurrent = plan === p.id;
          return (
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
                {meta.name}
              </h2>
              <p className="mt-3">
                <span className="font-[family-name:var(--font-cinzel)] text-3xl text-text-primary">
                  {meta.price}
                </span>
                <span className="text-sm text-text-muted">{meta.period}</span>
              </p>
              {p.hero && (
                <p className="mt-2 text-xs tracking-wide text-accent-gold">
                  Pay once, own forever
                </p>
              )}
              <p className="mt-3 flex-1 text-sm text-text-muted">{meta.blurb}</p>
              <button
                type="button"
                disabled={isCurrent || loadingPlan !== null}
                onClick={() => void checkout(p.id)}
                className={`mt-6 w-full rounded px-4 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] transition disabled:opacity-60 ${
                  p.hero
                    ? "border border-accent-gold bg-accent-gold text-background hover:bg-accent-gold/90"
                    : "border border-border text-text-primary hover:border-accent-gold/50 hover:text-accent-gold"
                }`}
              >
                {isCurrent
                  ? "Current plan"
                  : loadingPlan === p.id
                    ? "Redirecting…"
                    : `Choose ${meta.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mt-6 text-center text-sm text-rose-300/90" role="alert">
          {error}
        </p>
      )}

      <section className="mt-12 rounded-lg border border-border bg-surface p-6">
        <h3 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          What paid unlocks
        </h3>
        <ul className="mt-4 grid gap-2 text-sm text-text-muted sm:grid-cols-2">
          <li>- Full remaining account for every giant</li>
          <li>- Mystery notes (whispered asides)</li>
          <li>- Size comparison tool</li>
          <li>- Favourites & advanced map filters (coming)</li>
          <li>- Offline / PWA access (coming)</li>
          <li>- Ad-free experience (coming)</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-text-muted">
        <Link href="/giants" className="text-accent-gold hover:underline">
          Return to catalogue
        </Link>
        {userId ? (
          <>
            <button
              type="button"
              onClick={() => void openPortal()}
              disabled={portalLoading}
              className="hover:text-accent-gold disabled:opacity-60"
            >
              {portalLoading ? "Opening…" : "Manage billing"}
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="hover:text-accent-gold"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login?next=/pricing" className="hover:text-accent-gold">
              Sign in
            </Link>
            <Link
              href="/signup?next=/pricing"
              className="hover:text-accent-gold"
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-20 text-center text-text-muted">
          Loading pricing…
        </div>
      }
    >
      <PricingInner />
    </Suspense>
  );
}
