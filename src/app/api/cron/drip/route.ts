import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { isLifetimeGrantEmail } from "@/lib/access";
import {
  isDripDue,
  isPaidPlanName,
  nextDripStep,
  type DripStepId,
} from "@/lib/one-seam/drip";
import { sendDripEmail } from "@/lib/resend";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Daily One Seam drip: emails 2-4 when due (Europe/Zagreb calendar offsets).
 * Email 1 is sent on confirm. Protect with CRON_SECRET (Vercel Bearer).
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const runtime = "nodejs";

function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const got = Buffer.from(header.slice(prefix.length));
  const want = Buffer.from(secret);
  if (got.length !== want.length) return false;
  return timingSafeEqual(got, want);
}

async function paidEmailSet(
  admin: ReturnType<typeof createServiceRoleClient>
): Promise<Set<string>> {
  const { data, error } = await admin
    .from("profiles")
    .select("email, plan")
    .in("plan", ["monthly", "yearly", "lifetime"]);

  if (error) {
    console.error("drip paid profiles", error.message);
    throw new Error("Could not load paid profiles.");
  }

  const set = new Set<string>();
  for (const row of data ?? []) {
    const email = typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
    if (email && isPaidPlanName(row.plan)) set.add(email);
  }
  return set;
}

async function runDrip(): Promise<{
  scanned: number;
  sent: number;
  skippedPaid: number;
  failed: number;
  errors: string[];
}> {
  const admin = createServiceRoleClient();
  const paid = await paidEmailSet(admin);

  const { data, error } = await admin
    .from("subscribers")
    .select("id, email, unsubscribe_token, drip_step, drip_opt_in_at")
    .not("drip_opt_in_at", "is", null)
    .is("unsubscribed_at", null)
    .in("drip_step", [1, 2, 3]);

  if (error) {
    console.error("drip list", error.message);
    throw new Error("Could not load drip recipients.");
  }

  const rows = data ?? [];
  const now = new Date();
  let sent = 0;
  let skippedPaid = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const email = typeof row.email === "string" ? row.email.trim().toLowerCase() : "";
    if (!email) continue;

    if (paid.has(email) || isLifetimeGrantEmail(email)) {
      const { error: skipErr } = await admin
        .from("subscribers")
        .update({ drip_step: 4 })
        .eq("id", row.id);
      if (skipErr) {
        failed += 1;
        errors.push(`${email}: paid skip update failed`);
      } else {
        skippedPaid += 1;
      }
      continue;
    }

    const step = nextDripStep(row.drip_step);
    if (!step) continue;

    const optIn = row.drip_opt_in_at ? new Date(row.drip_opt_in_at) : null;
    if (!optIn || Number.isNaN(optIn.getTime())) continue;
    if (!isDripDue(step, optIn, now)) continue;

    const token =
      typeof row.unsubscribe_token === "string" && row.unsubscribe_token
        ? row.unsubscribe_token
        : null;
    if (!token) {
      failed += 1;
      errors.push(`${email}: missing unsubscribe token`);
      continue;
    }

    const result = await sendDripEmail(email, token, step as DripStepId);
    if (!result.ok) {
      failed += 1;
      errors.push(`${email}: ${result.error}`);
      continue;
    }

    const { error: upErr } = await admin
      .from("subscribers")
      .update({ drip_step: step })
      .eq("id", row.id);
    if (upErr) {
      failed += 1;
      errors.push(`${email}: sent but step update failed`);
      continue;
    }
    sent += 1;
  }

  return {
    scanned: rows.length,
    sent,
    skippedPaid,
    failed,
    errors: errors.slice(0, 20),
  };
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "CRON_SECRET is not set." },
      { status: 401 }
    );
  }
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await runDrip();
    return NextResponse.json(
      { ok: true, ...result },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (err) {
    console.error("drip cron", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Drip failed." },
      { status: 500 }
    );
  }
}
