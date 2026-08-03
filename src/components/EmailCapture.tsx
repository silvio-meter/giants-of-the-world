"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

interface Props {
  /** "footer" is a compact single row; "detail" has room for the fuller line. */
  variant: "footer" | "detail";
  /** Recorded with the subscription — which surface it came from. */
  sourcePage: string;
}

const COPY = {
  footer: {
    heading: null,
    prompt: "Enter your name in the ledger. New giants surface without warning.",
    button: "Enter the ledger",
  },
  detail: {
    heading: "New giants surface without warning.",
    prompt:
      "Get told when an entry goes up, and when a new motif connects giants who never met.",
    button: "Enter the ledger",
  },
};

/**
 * Renders identically apart from layout — the footer needs a single row that
 * survives being squeezed next to nav links, the detail placement has a full
 * card's width to itself.
 */
export function EmailCapture({ variant, sourcePage }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const { heading, prompt, button } = COPY[variant];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sourcePage, company }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "The ledger did not take that. Try again.");
        setStatus("error");
        return;
      }
      // No event here on purpose. email_signup fires on the confirm page,
      // once the link in the confirmation email is actually opened, so a
      // submission that never confirms does not count as a subscriber.
      setStatus("done");
    } catch {
      setError("The ledger did not take that. Try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p
        role="status"
        className={
          variant === "footer"
            ? "text-sm text-accent-gold"
            : "rounded-lg border border-accent-gold/35 bg-background/60 px-4 py-4 text-center text-sm text-accent-gold"
        }
      >
        {/*
          Under double opt-in this cannot say "you are now marked in the
          codex", because at this point they are not. The row exists but is
          unconfirmed, and stays that way until the emailed link is opened.
        */}
        Check your email and open the link to confirm. Nothing is recorded
        until you do.
      </p>
    );
  }

  const isFooter = variant === "footer";

  return (
    <form
      onSubmit={onSubmit}
      className={
        isFooter
          ? "flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
          : "rounded-lg border border-border bg-surface p-4 sm:p-5"
      }
    >
      {heading && (
        <p className="mb-1.5 font-[family-name:var(--font-cinzel)] text-sm tracking-wide text-accent-gold">
          {heading}
        </p>
      )}
      <p
        className={
          isFooter
            ? "shrink-0 text-sm text-text-muted sm:max-w-[220px]"
            : "mb-3 text-sm leading-relaxed text-text-muted"
        }
      >
        {prompt}
      </p>
      <div className={isFooter ? "flex min-w-0 flex-1 gap-2" : "flex gap-2"}>
        <label className="sr-only" htmlFor={`email-${variant}`}>
          Email address
        </label>
        <input
          id={`email-${variant}`}
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`min-w-0 flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none ${
            isFooter ? "sm:w-48" : ""
          }`}
        />
        {/* Hidden from sighted and screen-reader users; a filled value means a bot. */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded border border-accent-gold bg-accent-gold px-4 py-2 font-[family-name:var(--font-cinzel)] text-xs tracking-[0.1em] text-background transition hover:bg-accent-gold/90 disabled:opacity-60"
        >
          {status === "loading" ? "…" : button}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
      {/*
        Submitting is the consent action, so there is no pre-ticked box and no
        box at all: an unticked checkbox nobody ticks would just block signups
        without adding consent that pressing the button does not already give.
      */}
      <p className={`text-xs text-text-muted/80 ${isFooter ? "mt-2" : "mt-3"}`}>
        Confirmation required. Unsubscribe any time. See our{" "}
        <Link href="/privacy" className="text-accent-gold hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
