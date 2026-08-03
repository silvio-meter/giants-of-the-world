import { randomUUID } from "node:crypto";
import { NextResponse, after } from "next/server";
import { sendConfirmationEmail } from "@/lib/resend";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/site";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Deliberately simple: reject the obviously malformed rather than attempt to
// validate every RFC 5322 edge case server-side.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    sourcePage?: string;
    /** Hidden field. A bot that fills every input trips this; humans never see it. */
    company?: string;
  } | null;

  // Bots that fill every field get a fake success, not a hint they were caught.
  if (body?.company) {
    return NextResponse.json({ ok: true });
  }

  const email = body?.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "The ledger did not take that. Check the address and try again." },
      { status: 400 }
    );
  }

  const sourcePage = body?.sourcePage?.slice(0, 200) || null;

  try {
    const admin = createServiceRoleClient();

    // Single-use: the confirm route clears this the moment it is redeemed, so
    // the same link cannot confirm twice.
    const token = randomUUID();

    const { error } = await admin.from("subscribers").insert({
      email,
      source_page: sourcePage,
      confirm_token: token,
      // The exact wording on screen when they submitted, stored per row so a
      // later copy change cannot rewrite what someone actually agreed to.
      consent_text: NEWSLETTER_CONSENT_TEXT,
    });

    // 23505 = unique violation, the address is already on the list.
    //
    // Resending the confirmation link to an address that already exists would
    // let anyone use this form to mail a stranger repeatedly, so a duplicate
    // quietly returns success and sends nothing. The reader sees the same
    // confirmation either way, which is also the right answer for privacy:
    // the form must not reveal who is already subscribed.
    if (error && error.code !== "23505") {
      throw error;
    }

    // Runs via after(), not a bare fire-and-forget call. A serverless
    // invocation can be frozen the instant the response below is sent, which
    // kills any unawaited promise mid-flight. That was a real bug here once:
    // the DB row landed every time, but the fetch to Resend never got the
    // chance to leave the function, so nothing reached Resend at all.
    // after() extends the invocation until this callback settles, without
    // delaying the response the reader gets.
    //
    // Under double opt-in this email matters more than the old welcome note
    // did: if it never arrives, the person never becomes a subscriber.
    if (!error) {
      after(() =>
        sendConfirmationEmail(email, token).catch((err) =>
          console.error("confirmation email", err)
        )
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("subscribe", err);
    return NextResponse.json(
      { error: "The ledger did not take that. Try again." },
      { status: 500 }
    );
  }
}
