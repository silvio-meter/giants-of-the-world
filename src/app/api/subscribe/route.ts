import { NextResponse, after } from "next/server";
import { sendWelcomeEmail } from "@/lib/resend";
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
    const { error } = await admin
      .from("subscribers")
      .insert({ email, source_page: sourcePage });

    // 23505 = unique violation — already on the list, which is success too.
    if (error && error.code !== "23505") {
      throw error;
    }

    // Best-effort: a signup is complete once the row exists. A Resend outage
    // should not turn into a user-facing failure for something that worked.
    //
    // Runs via after(), not a bare fire-and-forget call — a serverless
    // invocation can be frozen the instant the response below is sent, which
    // kills any unawaited promise mid-flight. That was the actual bug here:
    // the DB row landed every time, but the email's fetch to Resend never
    // got the chance to leave the function, so nothing ever reached Resend
    // at all (confirmed: zero sends in Resend's dashboard despite successful
    // signups in Supabase). after() extends the invocation until this
    // callback settles, without delaying the response the user gets.
    if (!error) {
      after(() =>
        sendWelcomeEmail(email).catch((err) =>
          console.error("welcome email", err)
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
