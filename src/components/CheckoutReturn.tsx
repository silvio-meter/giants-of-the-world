"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CHECKOUT_MONTHLY,
  CHECKOUT_QUERY,
  contentPathFrom,
  isFolkloreCheckoutPath,
} from "@/lib/checkout-path";
import { umamiEvent } from "@/lib/umami";
import { usePlan } from "./PlanProvider";

const publicPaymentsMode = process.env.NEXT_PUBLIC_PAYMENTS_MODE;

function pathWithSearch(pathname: string, search: URLSearchParams): string {
  const q = search.toString();
  return q ? `${pathname}?${q}` : pathname;
}

/**
 * Handles the three checkout return states on giant / compare / map (and any
 * other page that lands with the same query):
 *   ?checkout=monthly  authenticated resume after login (once)
 *   ?paid=1            purchase event + short webhook wait
 *   ?canceled=1        a quiet status line
 *
 * Kandahar / Kunar never auto-checkout.
 */
export function CheckoutReturn() {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, ready, configured, isPaid, refresh, plan } = usePlan();
  const [error, setError] = useState("");
  const resumeStarted = useRef(false);
  const purchaseStarted = useRef(false);

  const checkoutPlan = searchParams.get(CHECKOUT_QUERY);
  const paid = searchParams.get("paid") === "1";
  const canceled = searchParams.get("canceled") === "1";
  const sessionId = searchParams.get("session_id");
  const planFromUrl = searchParams.get("plan");
  const here = pathWithSearch(pathname, searchParams);
  const folklore = isFolkloreCheckoutPath(here);

  useEffect(() => {
    if (!paid || purchaseStarted.current) return;
    purchaseStarted.current = true;

    const key = `umami-purchase:${sessionId || here}`;
    try {
      if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        umamiEvent("purchase", { plan: planFromUrl || plan || "monthly" });
      }
    } catch {
      umamiEvent("purchase", { plan: planFromUrl || plan || "monthly" });
    }

    const t1 = window.setTimeout(() => {
      void refresh();
      router.refresh();
    }, 1200);
    const t2 = window.setTimeout(() => {
      void refresh();
      router.refresh();
    }, 4000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [paid, sessionId, here, planFromUrl, plan, refresh, router]);

  useEffect(() => {
    if (!ready) return;
    if (checkoutPlan !== CHECKOUT_MONTHLY) return;
    if (paid) return;

    const content = contentPathFrom(here);

    if (folklore || isPaid) {
      if (here !== content) router.replace(content, { scroll: false });
      return;
    }

    if (!userId || !configured) return;
    if (publicPaymentsMode === "demo") return;
    if (resumeStarted.current) return;
    resumeStarted.current = true;

    const controller = new AbortController();

    void (async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: CHECKOUT_MONTHLY, next: content }),
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          url?: string;
          error?: string;
          redirect?: string;
        };
        if (controller.signal.aborted) return;
        if (res.status === 401 && data.redirect) {
          window.location.assign(data.redirect);
          return;
        }
        if (!res.ok || !data.url) {
          setError(data.error || "Checkout failed.");
          resumeStarted.current = false;
          if (here !== content) router.replace(content, { scroll: false });
          return;
        }
        umamiEvent("checkout_start", {
          plan: CHECKOUT_MONTHLY,
          source: "in-content-resume",
        });
        window.location.assign(data.url);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError("Checkout failed. Please try again.");
        resumeStarted.current = false;
        if (here !== content) router.replace(content, { scroll: false });
      }
    })();

    return () => {
      controller.abort();
      resumeStarted.current = false;
    };
  }, [
    ready,
    checkoutPlan,
    paid,
    folklore,
    isPaid,
    userId,
    configured,
    here,
    router,
  ]);

  const banner: "paid" | "canceled" | "error" | null = error
    ? "error"
    : paid
      ? "paid"
      : canceled
        ? "canceled"
        : null;

  if (!banner) return null;
  // Pricing has its own CheckoutStatus copy for paid/canceled.
  if (pathname === "/pricing") return null;

  if (banner === "paid") {
    return (
      <p
        className="mx-auto max-w-6xl px-4 pt-4 text-center text-sm text-accent-gold sm:px-6"
        role="status"
      >
        Payment received. Your access unlocks within a few seconds.
      </p>
    );
  }
  if (banner === "canceled") {
    return (
      <p
        className="mx-auto max-w-6xl px-4 pt-4 text-center text-sm text-text-muted sm:px-6"
        role="status"
      >
        Checkout canceled. The sealed pages wait when you are ready.
      </p>
    );
  }
  return (
    <p
      className="mx-auto max-w-6xl px-4 pt-4 text-center text-sm text-rose-300/90 sm:px-6"
      role="alert"
    >
      {error}
    </p>
  );
}
