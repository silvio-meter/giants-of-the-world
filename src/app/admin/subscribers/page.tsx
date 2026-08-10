"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePlan } from "@/components/PlanProvider";

/**
 * Minimal One Seam admin: count + CSV export.
 * API enforces LIFETIME_GRANT_EMAILS; this page only hides the UI from others.
 */
export default function AdminSubscribersPage() {
  const { email, ready, userId } = usePlan();
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!userId) {
      setLoading(false);
      setError("Sign in required.");
      return;
    }

    let cancelled = false;
    fetch("/api/admin/subscribers", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 403) {
          throw new Error("This page is only for admin grant accounts.");
        }
        if (!res.ok) throw new Error("Could not load subscribers.");
        return res.json() as Promise<{ count: number }>;
      })
      .then((data) => {
        if (!cancelled) {
          setCount(data.count);
          setError("");
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, userId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
        Admin
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold">
        One Seam
      </h1>
      <p className="mt-3 text-sm text-text-muted">
        Confirmed, not unsubscribed. Weekly issues stay in the Resend dashboard
        for v1.
      </p>
      {email && (
        <p className="mt-2 text-xs text-text-muted/80">Signed in as {email}</p>
      )}

      {loading && (
        <p className="mt-8 text-sm text-text-muted" role="status">
          Loading…
        </p>
      )}
      {error && (
        <p className="mt-8 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && count !== null && (
        <div className="mt-8 space-y-4">
          <p className="font-[family-name:var(--font-cinzel)] text-4xl text-accent-gold">
            {count}
          </p>
          <p className="text-sm text-text-muted">active subscribers</p>
          <a
            href="/api/admin/subscribers?format=csv"
            className="inline-flex rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90"
          >
            Export CSV
          </a>
        </div>
      )}

      <p className="mt-10 text-sm text-text-muted">
        <Link href="/" className="text-accent-gold hover:underline">
          Home
        </Link>
      </p>
    </div>
  );
}
