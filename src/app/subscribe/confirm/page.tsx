import type { Metadata } from "next";
import Link from "next/link";
import { after } from "next/server";
import { randomUUID } from "node:crypto";
import { sendWelcomeEmail } from "@/lib/resend";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { ConfirmedEvent } from "./ConfirmedEvent";

/**
 * Second half of double opt-in for One Seam.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm One Seam",
  robots: { index: false, follow: false },
};

type Outcome = "confirmed" | "already" | "invalid";

async function redeem(token: string | undefined): Promise<Outcome> {
  if (!token) return "invalid";

  const admin = createServiceRoleClient();

  const { data: row } = await admin
    .from("subscribers")
    .select("id, email, confirmed_at, unsubscribed_at")
    .eq("confirm_token", token)
    .maybeSingle();

  if (!row) return "invalid";
  if (row.unsubscribed_at) return "invalid";
  if (row.confirmed_at) return "already";

  const unsubscribeToken = randomUUID();

  const { error } = await admin
    .from("subscribers")
    .update({
      confirmed_at: new Date().toISOString(),
      confirm_token: null,
      unsubscribe_token: unsubscribeToken,
      unsubscribed_at: null,
    })
    .eq("id", row.id);

  if (error) {
    console.error("confirm subscription", error);
    return "invalid";
  }

  if (row.email) {
    after(() =>
      sendWelcomeEmail(row.email, unsubscribeToken).catch((err) =>
        console.error("welcome email", err)
      )
    );
  }

  return "confirmed";
}

const COPY: Record<Outcome, { heading: string; body: string }> = {
  confirmed: {
    heading: "You are on the list.",
    body: "The first seam arrives next week. One crack in a giant story, once a week.",
  },
  already: {
    heading: "Already on One Seam.",
    body: "This address was confirmed earlier. There is nothing else to do.",
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
        One Seam
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl tracking-wide text-accent-gold sm:text-3xl">
        {heading}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-text-muted">{body}</p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/giants"
          className="inline-flex items-center justify-center rounded border border-accent-gold bg-accent-gold/10 px-6 py-3 font-[family-name:var(--font-cinzel)] text-sm tracking-[0.15em] text-accent-gold transition hover:bg-accent-gold/20"
        >
          Catalogue
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-3 text-sm text-text-muted hover:text-accent-gold"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
