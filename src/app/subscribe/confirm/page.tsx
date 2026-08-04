import type { Metadata } from "next";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ConfirmedEvent } from "./ConfirmedEvent";

/**
 * The second half of double opt-in: the link in the confirmation email lands
 * here, and only reaching this page turns a pending row into a subscriber.
 *
 * Dynamic because it both reads a token and writes to the database. Noindex
 * because a tokenised URL has nothing to offer a search engine, and indexing
 * one would be a small privacy leak besides.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm your subscription",
  robots: { index: false, follow: false },
};

type Outcome = "confirmed" | "already" | "invalid";

async function redeem(token: string | undefined): Promise<Outcome> {
  if (!token) return "invalid";

  const admin = createServiceRoleClient();

  const { data: row } = await admin
    .from("subscribers")
    .select("id, confirmed_at")
    .eq("confirm_token", token)
    .maybeSingle();

  if (!row) {
    // Either the token never existed, or it was already redeemed and cleared.
    // Both look the same from here, and both should say the same thing.
    return "invalid";
  }
  if (row.confirmed_at) return "already";

  // Clearing the token in the same write is what makes the link single use.
  const { error } = await admin
    .from("subscribers")
    .update({ confirmed_at: new Date().toISOString(), confirm_token: null })
    .eq("id", row.id);

  if (error) {
    console.error("confirm subscription", error);
    return "invalid";
  }
  return "confirmed";
}

const COPY: Record<Outcome, { heading: string; body: string }> = {
  confirmed: {
    heading: "You are now marked in the codex.",
    body: "New giants surface without warning. When they do, you will hear about it first.",
  },
  already: {
    heading: "Already confirmed.",
    body: "This subscription was confirmed earlier. There is nothing else to do.",
  },
  invalid: {
    heading: "That link did not work.",
    body: "It may have already been used, or it may have been copied incompletely. Enter your address again and a fresh link will follow.",
  },
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome = await redeem(token);
  const { heading, body } = COPY[outcome];

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6 sm:py-24">
      {outcome === "confirmed" && <ConfirmedEvent />}
      <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
        The ledger
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl tracking-wide text-accent-gold sm:text-3xl">
        {heading}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-text-muted">{body}</p>
      <Link
        href="/giants"
        className="mt-8 inline-flex items-center justify-center rounded border border-accent-gold bg-accent-gold/10 px-6 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.15em] text-accent-gold transition hover:bg-accent-gold/20"
      >
        Return to the catalogue
      </Link>
    </div>
  );
}
