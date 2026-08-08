import { NextResponse } from "next/server";
import {
  canViewChain,
  canViewFullDescription,
  canViewScholarlyNotes,
} from "@/lib/access";
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
  // Independent of `allowed` — Scholarly Notes stays locked even when the
  // entry's own account text is open (freeEntry gives that a free pass;
  // scholarly notes never gets one).
  const scholarlyAllowed = canViewScholarlyNotes(plan);
  // Same reasoning as scholarly notes: a chain's rungs stay locked even on an
  // entry whose account text is open. The claim and the verdict are already
  // public, carried as chainSummary on the catalog entry.
  const chainAllowed = canViewChain(plan);

  if (!allowed && !scholarlyAllowed && !chainAllowed) {
    return NextResponse.json(
      { error: "Paid plan required.", locked: true },
      { status: 402, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  return NextResponse.json(
    {
      ...(allowed
        ? {
            fullDescription: lore.fullDescription,
            mysteryNote: lore.mysteryNote,
            ...(lore.sections ? { sections: lore.sections } : {}),
          }
        : {}),
      /**
       * Rungs and floor, with `evidence` stripped here rather than merely left
       * unrendered. It is our audit trail, some of those addresses are
       * temporary, and a field the client never receives is one the interface
       * cannot print by accident.
       */
      ...(chainAllowed && lore.chain
        ? {
            chain: {
              floor: lore.chain.floor,
              rungs: lore.chain.rungs.map(
                ({ evidence, ...rung }: { evidence?: string }) => {
                  void evidence;
                  return rung;
                }
              ),
            },
          }
        : {}),
      ...(scholarlyAllowed && lore.scholarlyNotes
        ? {
            scholarlyNotes: lore.scholarlyNotes,
            scholarlySources: lore.scholarlySources ?? [],
          }
        : {}),
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
