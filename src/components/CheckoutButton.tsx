"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { PaidPlan } from "@/lib/access";
import { IN_CONTENT_CHECKOUT_PLAN } from "@/lib/paywall-copy";
import { umamiEvent } from "@/lib/umami";
import { usePlan } from "./PlanProvider";

const paymentsMode =
  (process.env.NEXT_PUBLIC_PAYMENTS_MODE as "demo" | "test" | "live") || "demo";

const GOLD_BUTTON =
  "inline-flex w-full items-center justify-center rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 disabled:opacity-60 sm:w-auto sm:min-w-[280px]";

/**
 * Starts Stripe checkout for a plan. In-content locks pass monthly, which
 * maps to STRIPE_PRICE_MONTHLY (price_1TwPRNLVS7bQbGBigBO0l4WT in live).
 * Never send a price id from the browser.
 */
export function CheckoutButton({
  plan = IN_CONTENT_CHECKOUT_PLAN,
  next,
  children,
  className = "",
}: {
  plan?: PaidPlan;
  /** Return path after login. Defaults to the current pathname. */
  next?: string;
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const { userId, configured } = usePlan();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const returnTo = next ?? pathname ?? "/pricing";

  async function start() {
    setError("");
    if (paymentsMode === "demo") {
      setError("Safe demo mode is on. Use Demo unlock on the pricing page.");
      return;
    }
    if (!configured) {
      setError("Payments are not configured yet.");
      return;
    }
    if (!userId) {
      window.location.assign(
        `/login?next=${encodeURIComponent(returnTo)}`
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, next: returnTo }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        redirect?: string;
      };
      if (res.status === 401 && data.redirect) {
        window.location.assign(data.redirect);
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error || "Checkout failed.");
        setLoading(false);
        return;
      }
      umamiEvent("checkout_start", { plan, source: "in-content" });
      window.location.assign(data.url);
    } catch {
      setError("Checkout failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void start()}
        disabled={loading}
        className={GOLD_BUTTON}
      >
        {loading ? "Redirecting…" : children}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-rose-300/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
