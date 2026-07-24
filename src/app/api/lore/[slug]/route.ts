import { NextResponse } from "next/server";
import { canViewFullDescription } from "@/lib/access";
import { getGiantBySlug } from "@/lib/giants";
import { getGiantLore } from "@/lib/giants-lore";
import { getUserPlan } from "@/lib/profile";

/**
 * Paid lore, fetched by the client after the static page has rendered.
 *
 * This is what lets /giants/[slug] be prerendered and CDN-cached: the page
 * itself carries no per-user content, and the plan check still runs on the
 * server here — the lore file is never imported into a client bundle.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const giant = getGiantBySlug(slug);
  if (!giant) {
    return NextResponse.json({ error: "Unknown giant." }, { status: 404 });
  }

  const lore = getGiantLore(slug);
  if (!lore) {
    return NextResponse.json({ error: "No lore." }, { status: 404 });
  }

  const plan = await getUserPlan();
  const allowed = giant.freeEntry || canViewFullDescription(plan);

  if (!allowed) {
    return NextResponse.json(
      { error: "Paid plan required.", locked: true },
      { status: 402, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  return NextResponse.json(
    {
      fullDescription: lore.fullDescription,
      mysteryNote: lore.mysteryNote,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
