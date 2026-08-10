import type { Metadata } from "next";
import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe from One Seam",
  robots: { index: false, follow: false },
};

type Outcome = "done" | "already" | "invalid";

async function unsubscribe(token: string | undefined): Promise<Outcome> {
  if (!token) return "invalid";

  const admin = createServiceRoleClient();
  const { data: row } = await admin
    .from("subscribers")
    .select("id, unsubscribed_at")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!row) return "invalid";
  if (row.unsubscribed_at) return "already";

  const { error } = await admin
    .from("subscribers")
    .update({
      unsubscribed_at: new Date().toISOString(),
      // Keep token so the same link shows "already" rather than invalid.
    })
    .eq("id", row.id);

  if (error) {
    console.error("unsubscribe", error);
    return "invalid";
  }

  return "done";
}

const COPY: Record<Outcome, { heading: string; body: string }> = {
  done: {
    heading: "You are off the list.",
    body: "You will not receive further One Seam emails. You can subscribe again from the site any time.",
  },
  already: {
    heading: "Already unsubscribed.",
    body: "This address is not on One Seam.",
  },
  invalid: {
    heading: "That link did not work.",
    body: "It may be incomplete. If you still get One Seam mail, reply to it or write to hello@giantscodex.com.",
  },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome = await unsubscribe(token);
  const { heading, body } = COPY[outcome];

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
        One Seam
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-2xl tracking-wide text-accent-gold sm:text-3xl">
        {heading}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-text-muted">{body}</p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm text-accent-gold hover:underline"
      >
        Back to Giants of the World
      </Link>
    </div>
  );
}
