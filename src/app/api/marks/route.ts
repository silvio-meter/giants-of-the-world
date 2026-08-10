import { NextResponse } from "next/server";
import { canSyncJourneyMarks } from "@/lib/access";
import { getGiantBySlug } from "@/lib/giants";
import {
  clampNote,
  normalizeMarks,
  type EntryMarks,
} from "@/lib/journey-marks";
import { isSupabaseConfigured } from "@/lib/plans";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

/**
 * My Journey marks for paid accounts.
 * Free clients never hit this route for persistence — they use sessionStorage.
 */
export const dynamic = "force-dynamic";

async function requirePaidUser() {
  if (!isSupabaseConfigured()) {
    return {
      error: NextResponse.json({ error: "Not configured." }, { status: 503 }),
    };
  }
  const profile = await getProfile();
  if (!profile) {
    return {
      error: NextResponse.json({ error: "Sign in required." }, { status: 401 }),
    };
  }
  if (!canSyncJourneyMarks(profile.plan)) {
    return {
      error: NextResponse.json(
        { error: "Paid plan required." },
        { status: 403 }
      ),
    };
  }
  return { profile };
}

function rowToEntry(row: {
  giant_slug: string;
  marks: string[] | null;
  note: string | null;
  updated_at: string;
}): EntryMarks {
  return {
    slug: row.giant_slug,
    marks: normalizeMarks(row.marks),
    note: clampNote(row.note),
    updatedAt: row.updated_at,
  };
}

export async function GET(request: Request) {
  const { profile, error } = await requirePaidUser();
  if (error) {
    // Free / anonymous: empty list (client may still hold session marks).
    return NextResponse.json(
      { entries: [] },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  const supabase = await createClient();

  if (slug) {
    const { data, error: dbError } = await supabase
      .from("journey_marks")
      .select("giant_slug, marks, note, updated_at")
      .eq("user_id", profile.id)
      .eq("giant_slug", slug)
      .maybeSingle();

    if (dbError) {
      console.error("marks get", dbError.message);
      return NextResponse.json(
        { error: "Could not load marks." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { entry: data ? rowToEntry(data) : null },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  }

  const { data, error: dbError } = await supabase
    .from("journey_marks")
    .select("giant_slug, marks, note, updated_at")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  if (dbError) {
    console.error("marks list", dbError.message);
    return NextResponse.json(
      { error: "Could not load marks." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { entries: (data ?? []).map(rowToEntry) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function POST(request: Request) {
  const { profile, error } = await requirePaidUser();
  if (error) return error;

  const body = (await request.json().catch(() => null)) as {
    slug?: string;
    marks?: unknown;
    note?: unknown;
  } | null;

  const slug = body?.slug?.trim();
  if (!slug || !getGiantBySlug(slug)) {
    return NextResponse.json({ error: "Unknown giant." }, { status: 400 });
  }

  const marks = normalizeMarks(body?.marks);
  const note = clampNote(body?.note);
  const updatedAt = new Date().toISOString();

  const supabase = await createClient();

  if (marks.length === 0 && !note) {
    const { error: delError } = await supabase
      .from("journey_marks")
      .delete()
      .eq("user_id", profile.id)
      .eq("giant_slug", slug);

    if (delError) {
      console.error("marks delete empty", delError.message);
      return NextResponse.json(
        { error: "Could not save." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      entry: { slug, marks: [], note: "", updatedAt },
    });
  }

  const { data, error: dbError } = await supabase
    .from("journey_marks")
    .upsert(
      {
        user_id: profile.id,
        giant_slug: slug,
        marks,
        note,
        updated_at: updatedAt,
      },
      { onConflict: "user_id,giant_slug" }
    )
    .select("giant_slug, marks, note, updated_at")
    .single();

  if (dbError) {
    console.error("marks upsert", dbError.message);
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }

  return NextResponse.json({ entry: rowToEntry(data) });
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
    .from("journey_marks")
    .delete()
    .eq("user_id", profile.id)
    .eq("giant_slug", slug);

  if (dbError) {
    console.error("marks delete", dbError.message);
    return NextResponse.json(
      { error: "Could not remove." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
