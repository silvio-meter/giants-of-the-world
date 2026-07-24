"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not send the link.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Could not send the link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <header className="mb-8 text-center">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Lost the key
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold">
          Reset password
        </h1>
      </header>

      <div className="rounded-lg border border-border bg-surface p-6">
        {sent ? (
          <p className="text-sm text-text-muted" role="status">
            If an account exists for{" "}
            <span className="text-text-primary">{email}</span>, a recovery link
            is on its way. The link opens a page where you can set a new
            password.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-text-muted">
              Enter the address you signed up with and we will send a recovery
              link.
            </p>
            <label className="block text-xs text-text-muted">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent-gold focus:outline-none"
              />
            </label>

            {error && (
              <p className="text-sm text-rose-300/90" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded border border-accent-gold bg-accent-gold px-4 py-2.5 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.1em] text-background transition hover:bg-accent-gold/90 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send recovery link"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        <Link href="/login" className="text-accent-gold hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
