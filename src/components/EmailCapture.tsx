"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

interface Props {
  /** "footer" is a compact single row; "detail" / "journey" have more room;
   * "spotlight" matches Unlock visual weight for mid-page free-entry asks. */
  variant: "footer" | "detail" | "journey" | "spotlight";
  /** Recorded with the subscription - which surface it came from. */
  sourcePage: string;
}

const COPY = {
  footer: {
    heading: "One Seam - once a week.",
    prompt: "One place where a giant story splits.",
  },
  detail: {
    heading: "One Seam - once a week.",
    prompt: "One place where a giant story splits.",
  },
  journey: {
    heading: "One Seam - once a week.",
    prompt: "One place where a giant story splits.",
  },
  spotlight: {
    heading: "One Seam - once a week.",
    prompt: "One place where a giant story splits. Free. No membership required.",
  },
} as const;

const BUTTON = "Enter the ledger";
const PLACEHOLDER = "you@domain.com";
const MICRO =
  "A short welcome, then one seam a week. Unsubscribe anytime.";
/** After confirm they get the exact "on the list" line; pre-confirm stays honest. */
const SUCCESS =
  "You are on the list. A short welcome, then one seam a week.";
const SUCCESS_PENDING =
  "Check your email and open the link to confirm. Then you are on the list - a short welcome, then one seam a week.";

/**
 * One Seam signup. Footer is compact; detail/journey use a card layout.
 * Double opt-in: success after submit means "confirm pending", welcome mail
 * fires only after /subscribe/confirm.
 */
export function EmailCapture({ variant, sourcePage }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const { heading, prompt } = COPY[variant];

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
      const data = (await res.json()) as { error?: string; code?: string };
      if (!res.ok) {
        if (data.code === "invalid_email") {
          setError("That does not look like a valid email.");
        } else if (data.code === "already_subscribed") {
          setError("That address is already on One Seam.");
        } else {
          setError(data.error || "Could not subscribe. Try again.");
        }
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Could not subscribe. Try again.");
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
            : variant === "spotlight"
              ? "rounded-lg border border-accent-gold/35 bg-background/80 px-4 py-5 text-center text-sm text-accent-gold sm:px-5"
              : "rounded-lg border border-accent-gold/35 bg-background/60 px-4 py-4 text-center text-sm text-accent-gold"
        }
      >
        {/*
          Double opt-in: not on the list until the email link is opened.
          SUCCESS is the post-confirm promise; SUCCESS_PENDING is honest now.
        */}
        {SUCCESS_PENDING}
      </p>
    );
  }

  const isFooter = variant === "footer";
  const isSpotlight = variant === "spotlight";

  return (
    <form
      onSubmit={onSubmit}
      className={
        isFooter
          ? "flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
          : isSpotlight
            ? "rounded-lg border border-accent-gold/35 bg-background/80 px-4 py-5 text-center sm:px-5 sm:py-5"
            : "rounded-lg border border-border bg-surface p-4 sm:p-5"
      }
    >
      <div className={isFooter ? "shrink-0 sm:max-w-[240px]" : "mb-3"}>
        <p
          className={
            isFooter
              ? "font-[family-name:var(--font-cinzel)] text-sm tracking-wide text-accent-gold"
              : "mb-1.5 font-[family-name:var(--font-cinzel)] text-sm tracking-wide text-accent-gold"
          }
        >
          {heading}
        </p>
        <p
          className={
            isFooter
              ? "text-sm text-text-muted"
              : isSpotlight
                ? "text-sm leading-relaxed text-text-muted"
                : "text-sm leading-relaxed text-text-muted"
          }
        >
          {prompt}
        </p>
      </div>
      <div
        className={
          isFooter
            ? "flex min-w-0 flex-1 gap-2"
            : isSpotlight
              ? "mx-auto flex w-full max-w-md gap-2"
              : "flex gap-2"
        }
      >
        <label className="sr-only" htmlFor={`email-${variant}-${sourcePage}`}>
          Email address
        </label>
        <input
          id={`email-${variant}-${sourcePage}`}
          type="email"
          required
          autoComplete="email"
          placeholder={PLACEHOLDER}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`min-w-0 flex-1 rounded border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:outline-none ${
            isFooter ? "sm:w-48" : ""
          }`}
        />
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
          {status === "loading" ? "…" : BUTTON}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
      <p
        className={`text-xs text-text-muted/80 ${
          isFooter ? "mt-2" : isSpotlight ? "mt-3 text-center" : "mt-3"
        }`}
      >
        {MICRO} See our{" "}
        <Link href="/privacy" className="text-accent-gold hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
      {/* Screen readers / operators: post-confirm copy for reference. */}
      <span className="sr-only">{SUCCESS}</span>
    </form>
  );
}
