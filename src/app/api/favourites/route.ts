import { NextResponse } from "next/server";
import { canUseFavourites } from "@/lib/access";
import { getGiantBySlug } from "@/lib/giants";
import { isSupabaseConfigured } from "@/lib/plans";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

/**
 * Favourites over HTTP instead of the browser supabase client. Two reasons:
 * the client bundle drops supabase-js, and the paid check now runs on the
 * server — before it was UI-only, so a free account could write rows directly.
 */
export const dynamic = "force-dynamic";

async function requirePaidUser() {
  if (!isSupabaseConfigured()) {
    return { error: NextResponse.json({ error: "Not configured." }, { status: 503 }) };
  }
  const profile = await getProfile();
  if (!profile) {
    return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  }
  if (!canUseFavourites(profile.plan)) {
    return {
      error: NextResponse.json({ error: "Paid plan required." }, { status: 403 }),
    };
  }
  return { profile };
}

export async function GET() {
  const { profile, error } = await requirePaidUser();
  if (error) {
    // An unauthenticated or free visitor simply has no favourites.
    return NextResponse.json(
      { slugs: [] },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("favourites")
    .select("giant_slug")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (dbError) {
    console.error("favourites list", dbError.message);
    return NextResponse.json({ error: "Could not load favourites." }, { status: 500 });
  }

  return NextResponse.json(
    { slugs: (data ?? []).map((row) => row.giant_slug as string) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(request: Request) {
  const { profile, error } = await requirePaidUser();
  if (error) return error;

  const body = (await request.json().catch(() => null)) as { slug?: string } | null;
  const slug = body?.slug?.trim();
  if (!slug || !getGiantBySlug(slug)) {
    return NextResponse.json({ error: "Unknown giant." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error: dbError } = await supabase
    .from("favourites")
    .insert({ user_id: profile.id, giant_slug: slug });

  // 23505 = unique violation, i.e. already favourited
  if (dbError && dbError.code !== "23505") {
    console.error("favourites insert", dbError.message);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { profile, error } = await requirePaidUser();
  if (error) return error;

  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error: dbError } = await supabase
    .from("favourites")
    .delete()
    .eq("user_id", profile.id)
    .eq("giant_slug", slug);

  if (dbError) {
    console.error("favourites delete", dbError.message);
    return NextResponse.json({ error: "Could not remove." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
