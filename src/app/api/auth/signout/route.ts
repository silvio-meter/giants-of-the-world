import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";

/** Server-side sign-out so the browser bundle stays free of supabase-js. */
export async function POST() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true });
  }
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("signout", err);
    return NextResponse.json({ error: "Sign out failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
