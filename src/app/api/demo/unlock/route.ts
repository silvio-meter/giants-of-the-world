import { NextResponse } from "next/server";
import { getPaymentsMode } from "@/lib/payments-mode";
import { isSupabaseConfigured } from "@/lib/plans";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Safe show unlock: only when NEXT_PUBLIC_PAYMENTS_MODE=demo.
 * Sets the signed-in user's plan to lifetime without Stripe.
 */
export async function POST() {
  if (getPaymentsMode() !== "demo") {
    return NextResponse.json(
      { error: "Demo unlock is disabled outside demo mode." },
      { status: 403 }
    );
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Auth not configured." }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in required.", redirect: "/login?next=/pricing" },
        { status: 401 }
      );
    }

    const admin = createServiceRoleClient();
    await admin.from("profiles").upsert({
      id: user.id,
      email: user.email,
      plan: "lifetime",
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, plan: "lifetime" });
  } catch (err) {
    console.error("demo unlock", err);
    return NextResponse.json({ error: "Unlock failed." }, { status: 500 });
  }
}
