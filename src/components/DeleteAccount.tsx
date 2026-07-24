"use client";

import { useState } from "react";
import { supportEmail } from "@/lib/site";

/**
 * Irreversible, so it stays collapsed until asked for and then requires the
 * user to type their own address — a lone "are you sure?" is too easy to click
 * past.
 */
export function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase();

  async function remove() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: typed.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not delete the account.");
        setBusy(false);
        return;
      }
      window.location.assign("/?deleted=1");
    } catch {
      setError("Could not delete the account.");
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-rose-900/50 bg-rose-950/10 p-5">
      <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-rose-300/90 uppercase">
        Delete account
      </h2>

      {!open ? (
        <>
          <p className="mt-2 text-sm text-text-muted">
            Removes your profile, your favourites, and your login. Any running
            subscription is cancelled first. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 rounded border border-rose-800/60 px-4 py-2 text-sm text-rose-200/90 transition hover:border-rose-500 hover:bg-rose-950/40"
          >
            Delete my account
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-text-muted">
            This is permanent. Type{" "}
            <span className="font-mono text-text-primary">{email}</span> to
            confirm.
          </p>
          <label className="mt-3 block text-xs text-text-muted">
            <span className="sr-only">Confirm your email address</span>
            <input
              type="email"
              autoComplete="off"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={email}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-rose-500 focus:outline-none"
            />
          </label>

          {error && (
            <p className="mt-3 text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!matches || busy}
              onClick={() => void remove()}
              className="rounded border border-rose-600 bg-rose-900/40 px-4 py-2 text-sm text-rose-100 transition hover:bg-rose-900/70 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Deleting…" : "Permanently delete"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTyped("");
                setError("");
              }}
              className="rounded border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
          </div>

          <p className="mt-4 text-xs text-text-muted/80">
            Prefer we do it? Email{" "}
            <a
              href={`mailto:${supportEmail}?subject=Delete%20my%20account`}
              className="text-accent-gold hover:underline"
            >
              {supportEmail}
            </a>
            .
          </p>
        </>
      )}
    </section>
  );
}
