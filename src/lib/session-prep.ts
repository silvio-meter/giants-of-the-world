import "server-only";

import { getGiantBySlug, getRelatedGiants } from "@/lib/giants";
import type { GiantCardData } from "@/lib/format";
import type { SessionPrep, SessionPrepCardData } from "@/lib/types";

const PACK_TEASER =
  "Full prep pack unlocks with membership: encounter seeds, a source shelf, and a Compare pair ready for the table.";

/**
 * Build the Session Prep card for a paid giant page.
 * Seeds come only from curated lore sessionPrep (pilots).
 * Source shelf and compare pair are derived from public catalogue fields.
 */
export function getSessionPrepCard(
  giant: GiantCardData,
  sessionPrep?: SessionPrep | null
): SessionPrepCardData {
  const sourceShelf = giant.sources.slice(0, 5);

  let comparePair: SessionPrepCardData["comparePair"] = null;
  const preferred = sessionPrep?.compareSlug;
  const related = getRelatedGiants(giant);

  const pickSlug =
    preferred && getGiantBySlug(preferred)
      ? preferred
      : related.find((r) => getGiantBySlug(r.slug))?.slug;

  if (pickSlug) {
    const other = getGiantBySlug(pickSlug);
    if (other) {
      comparePair = {
        a: giant.slug,
        b: other.slug,
        aName: giant.name,
        bName: other.name,
      };
    }
  }

  const seeds = sessionPrep?.encounterSeeds;
  const hasSeeds =
    Array.isArray(seeds) &&
    seeds.length === 3 &&
    seeds.every((s) => typeof s === "string" && s.trim().length > 0);

  return {
    ...(hasSeeds ? { seeds } : {}),
    sourceShelf,
    comparePair,
    packTeaser: PACK_TEASER,
  };
}
