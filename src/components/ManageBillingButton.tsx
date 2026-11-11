"use client";

import { useState } from "react";

/**
 * Opens the Stripe billing portal for an existing subscriber.
 *
 * Used to be a link to /pricing, which carried the portal button. /pricing
 * redirects while membership sales are closed (src/lib/membership.ts), so
 * existing members reach the portal from /account directly. Same call the
 * pricing page makes: POST /api/portal, which checks the session and the
 * Stripe customer on the server.
 */
export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openPortal() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error || "Could not open billing portal.");
        setLoading(false);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Could not open billing portal.");
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={() => void openPortal()}
        disabled={loading}
        className="text-left text-accent-gold hover:underline disabled:opacity-60"
      >
        {loading ? "Opening…" : "Manage billing →"}
      </button>
      {error ? (
        <span className="mt-1 text-xs text-rose-300" role="alert">
          {error}
        </span>
      ) : null}
    </span>
  );
}
