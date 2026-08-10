import { randomUUID } from "node:crypto";
import { NextResponse, after } from "next/server";
import { sendConfirmationEmail } from "@/lib/resend";
import {
  NEWSLETTER_CONSENT_TEXT,
  normalizeNewsletterSource,
} from "@/lib/newsletter";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: string;
    sourcePage?: string;
    company?: string;
  } | null;

  if (body?.company) {
    return NextResponse.json({ ok: true });
  }

  const email = body?.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      {
        error: "That does not look like a valid email.",
        code: "invalid_email",
      },
      { status: 400 }
    );
  }

  const source = normalizeNewsletterSource(body?.sourcePage);

  try {
    const admin = createServiceRoleClient();
    const token = randomUUID();

    // Existing confirmed subscriber: friendly, non-violent response.
    const { data: existing } = await admin
      .from("subscribers")
      .select("id, confirmed_at, unsubscribed_at, confirm_token")
      .eq("email", email)
      .maybeSingle();

    if (existing?.unsubscribed_at) {
      // Re-subscribe: clear unsub, require confirm again.
      const { error: reErr } = await admin
        .from("subscribers")
        .update({
          unsubscribed_at: null,
          confirmed_at: null,
          confirm_token: token,
          source_page: source,
          consent_text: NEWSLETTER_CONSENT_TEXT,
          subscribed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (reErr) throw reErr;

      after(() =>
        sendConfirmationEmail(email, token).catch((err) =>
          console.error("confirmation email", err)
        )
      );
      return NextResponse.json({ ok: true });
    }

    if (existing?.confirmed_at) {
      return NextResponse.json(
        {
          error: "That address is already on One Seam.",
          code: "already_subscribed",
        },
        { status: 409 }
      );
    }

    if (existing && !existing.confirmed_at) {
      // Pending: re-issue token and confirmation mail (same person retrying).
      const newToken = randomUUID();
      const { error: upErr } = await admin
        .from("subscribers")
        .update({
          confirm_token: newToken,
          source_page: source,
          consent_text: NEWSLETTER_CONSENT_TEXT,
        })
        .eq("id", existing.id);

      if (upErr) throw upErr;

      after(() =>
        sendConfirmationEmail(email, newToken).catch((err) =>
          console.error("confirmation email", err)
        )
      );
      return NextResponse.json({ ok: true });
    }

    const { error } = await admin.from("subscribers").insert({
      email,
      source_page: source,
      confirm_token: token,
      consent_text: NEWSLETTER_CONSENT_TEXT,
    });

    if (error && error.code === "23505") {
      // Race: treat as already / pending without leaking detail.
      return NextResponse.json({ ok: true });
    }
    if (error) throw error;

    after(() =>
      sendConfirmationEmail(email, token).catch((err) =>
        console.error("confirmation email", err)
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("subscribe", err);
    return NextResponse.json(
      { error: "Could not subscribe. Try again." },
      { status: 500 }
    );
  }
}
