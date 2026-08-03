"use client";

import { useState, type FormEvent } from "react";
import { umamiEvent } from "@/lib/umami";

interface Props {
  /** "footer" is a compact single row; "detail" has room for the fuller line. */
  variant: "footer" | "detail";
  /** Recorded with the subscription — which surface it came from. */
  sourcePage: string;
}

const COPY = {
  footer: {
    prompt: "Enter your name in the ledger. New giants surface without warning.",
    button: "Enter the ledger",
  },
  detail: {
    prompt:
      "The fog does not announce itself. Leave your email and it will find you first.",
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
  const { prompt, button } = COPY[variant];

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
      setStatus("done");
      umamiEvent("email_signup", { source_page: sourcePage, variant });
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
        You are now marked in the codex.
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
    </form>
  );
}
