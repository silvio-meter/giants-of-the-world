import { NextResponse } from "next/server";
import { getGiantBySlug } from "@/lib/giants";
import { isSupabaseConfigured } from "@/lib/plans";
import { getSessionUser } from "@/lib/profile";
import { recordDiscovery } from "@/lib/discovery";

/**
 * Marks a giant as discovered for Codex Completion tracking. Called
 * client-side on mount from the (statically prerendered) giant detail page.
 *
 * Free feature — any signed-in user, not just paid plans, since the free
 * tier of Codex Completion is the overall percentage.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const user = await getSessionUser();
  if (!user) {
    // Anonymous visitors have nothing to track; not an error.
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json().catch(() => null)) as { slug?: string } | null;
  const slug = body?.slug?.trim();
  if (!slug || !getGiantBySlug(slug)) {
    return NextResponse.json({ error: "Unknown giant." }, { status: 400 });
  }

  try {
    await recordDiscovery(user.id, slug);
  } catch (err) {
    console.error("discover", err);
    return NextResponse.json({ error: "Could not record." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
