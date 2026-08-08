import { NextResponse } from "next/server";
import { canViewChain } from "@/lib/access";
import { getAllFindings } from "@/lib/giants";
import { getUserPlan } from "@/lib/profile";

/**
 * A finding's chain of custody, for the two items in Bones & Shadows that are
 * findings rather than entries: cardiff-giant and anasazi-giants.
 *
 * Entries serve theirs from /api/lore/[slug], where the chain rides in the lore
 * file. Findings have no lore file, so they get their own route with the same
 * server-side plan check, which is what keeps the rungs out of reach of a
 * hand-written URL.
 *
 * `evidence` is stripped here rather than merely left unrendered: it is our
 * audit trail, some of those addresses are temporary, and a field the client
 * never receives cannot be printed by accident.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const finding = getAllFindings().find((f) => f.id === id);
  if (!finding?.chain) {
    return NextResponse.json({ error: "No chain." }, { status: 404 });
  }

  if (!canViewChain(await getUserPlan())) {
    return NextResponse.json(
      { error: "Paid plan required.", locked: true },
      { status: 402, headers: { "Cache-Control": "private, no-store" } }
    );
  }

  return NextResponse.json(
    {
      chain: {
        floor: finding.chain.floor,
        rungs: finding.chain.rungs.map(
          ({ evidence, ...rung }: { evidence?: string }) => {
            void evidence;
            return rung;
          }
        ),
      },
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
