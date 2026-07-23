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

const paymentsMode =
  (process.env.NEXT_PUBLIC_PAYMENTS_MODE as "demo" | "test" | "live") || "demo";

function PricingInner() {
  const { plan, isPaid, userId, ready, configured, refresh, signOut } =
    usePlan();
  const params = useSearchParams();
  const success = params.get("success") === "1";
  const canceled = params.get("canceled") === "1";

  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  async function checkout(target: PaidPlan) {
    setError("");
    if (paymentsMode === "demo") {
      setError(
        "Safe demo mode is on — real charges are disabled. Use Demo unlock below."
      );
      return;
    }
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

  async function demoUnlock() {
    setError("");
    if (!userId) {
      window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
      return;
    }
    setDemoLoading(true);
    try {
      const res = await fetch("/api/demo/unlock", { method: "POST" });
      const data = (await res.json()) as { error?: string; redirect?: string };
      if (res.status === 401 && data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      if (!res.ok) {
        setError(data.error || "Demo unlock failed.");
        setDemoLoading(false);
        return;
      }
      await refresh();
      setDemoLoading(false);
    } catch {
      setError("Demo unlock failed.");
      setDemoLoading(false);
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

        {paymentsMode === "demo" && (
          <div className="mx-auto mt-5 max-w-xl rounded-lg border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/90">
            <strong className="font-medium text-amber-200">
              Safe demo mode
            </strong>
            {" — "}
            no real charges. Sign in and use{" "}
            <em>Demo unlock</em> to preview paid access for the show.
          </div>
        )}
        {paymentsMode === "test" && (
          <div className="mx-auto mt-5 max-w-xl rounded-lg border border-sky-800/50 bg-sky-950/30 px-4 py-3 text-sm text-sky-100/90">
            <strong className="font-medium text-sky-200">Stripe test mode</strong>
            {" — "}
            use card <code className="text-xs">4242 4242 4242 4242</code>, any
            future expiry, any CVC.
          </div>
        )}

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
                disabled={
                  isCurrent ||
                  loadingPlan !== null ||
                  paymentsMode === "demo"
                }
                onClick={() => void checkout(p.id)}
                className={`mt-6 w-full rounded px-4 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] transition disabled:opacity-60 ${
                  p.hero
                    ? "border border-accent-gold bg-accent-gold text-background hover:bg-accent-gold/90"
                    : "border border-border text-text-primary hover:border-accent-gold/50 hover:text-accent-gold"
                }`}
              >
                {isCurrent
                  ? "Current plan"
                  : paymentsMode === "demo"
                    ? "See demo unlock below"
                    : loadingPlan === p.id
                      ? "Redirecting…"
                      : `Choose ${meta.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {paymentsMode === "demo" && (
        <div className="mt-8 rounded-lg border border-accent-gold/40 bg-surface p-6 text-center">
          <p className="font-[family-name:var(--font-cinzel)] text-sm tracking-wide text-accent-gold">
            Demo unlock (no charge)
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
            Sign in, then unlock Lifetime access for this browser session&apos;s
            account — for demos only.
          </p>
          <button
            type="button"
            disabled={demoLoading || isPaid}
            onClick={() => void demoUnlock()}
            className="mt-4 inline-flex min-w-[220px] items-center justify-center rounded border border-accent-gold bg-accent-gold px-5 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 disabled:opacity-60"
          >
            {isPaid
              ? "Already unlocked"
              : demoLoading
                ? "Unlocking…"
                : "Unlock full codex (demo)"}
          </button>
        </div>
      )}

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
        <p className="mt-4 text-xs text-text-muted/80">
          By purchasing you agree to our{" "}
          <Link href="/terms" className="text-accent-gold hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-accent-gold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-text-muted">
        <Link href="/giants" className="text-accent-gold hover:underline">
          Return to catalogue
        </Link>
        {userId ? (
          <>
            {paymentsMode !== "demo" && (
              <button
                type="button"
                onClick={() => void openPortal()}
                disabled={portalLoading}
                className="hover:text-accent-gold disabled:opacity-60"
              >
                {portalLoading ? "Opening…" : "Manage billing"}
              </button>
            )}
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
