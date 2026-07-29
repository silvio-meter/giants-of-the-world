import motifData from "@/data/motifs.json";
import { giants } from "./giants";
import type { GiantCardData } from "./format";
import type { ResolvedMotif } from "./motif-view";

export interface Motif {
  key: string;
  name: string;
  blurb: string;
}

const motifs = motifData as Record<string, { name: string; blurb: string }>;

export function getMotif(key: string): Motif | null {
  const m = motifs[key];
  return m ? { key, ...m } : null;
}

export function getAllMotifs(): Motif[] {
  return Object.entries(motifs).map(([key, m]) => ({ key, ...m }));
}

/**
 * Other giants carrying the same motif.
 *
 * This is the view Wikipedia has no place for: one article per giant, and
 * nothing that reads across them. Cross-culture matches are surfaced first,
 * since those are the ones worth the reader's attention.
 */
export function giantsSharingMotif(
  key: string,
  excludeSlug?: string
): GiantCardData[] {
  const self = excludeSlug
    ? giants.find((g) => g.slug === excludeSlug)
    : undefined;

  return giants
    .filter((g) => g.slug !== excludeSlug && g.motifs?.includes(key))
    .sort((a, b) => {
      if (!self) return a.name.localeCompare(b.name);
      const aCross = a.culture !== self.culture ? 0 : 1;
      const bCross = b.culture !== self.culture ? 0 : 1;
      return aCross - bCross || a.name.localeCompare(b.name);
    });
}

/** Motifs that appear in more than one culture — the ones that carry weight. */
export function crossCulturalMotifs(): { motif: Motif; cultures: string[] }[] {
  return getAllMotifs()
    .map((motif) => ({
      motif,
      cultures: [
        ...new Set(
          giants.filter((g) => g.motifs?.includes(motif.key)).map((g) => g.culture)
        ),
      ],
    }))
    .filter((m) => m.cultures.length > 1)
    .sort((a, b) => b.cultures.length - a.cultures.length);
}

/**
 * Resolves motifs to plain data on the server.
 *
 * Client components must receive the result of this rather than calling into
 * this module, which imports the whole catalog.
 */
export function resolveMotifs(
  keys: string[] | undefined,
  slug: string
): ResolvedMotif[] {
  if (!keys?.length) return [];
  return keys.flatMap((key) => {
    const motif = getMotif(key);
    if (!motif) return [];
    return [
      {
        ...motif,
        others: giantsSharingMotif(key, slug).map((g) => ({
          slug: g.slug,
          name: g.name,
          culture: g.culture,
        })),
      },
    ];
  });
}

/**
 * Motifs two specific giants both carry — the Compare tool's "Shared
 * Threads" section. Reads the same motifs field every other feature does;
 * no separate tagging system for this.
 */
export function sharedMotifs(slugA: string, slugB: string): Motif[] {
  const a = giants.find((g) => g.slug === slugA);
  const b = giants.find((g) => g.slug === slugB);
  if (!a || !b) return [];
  const bKeys = new Set(b.motifs ?? []);
  return (a.motifs ?? [])
    .filter((key) => bKeys.has(key))
    .map((key) => getMotif(key))
    .filter((m): m is Motif => m !== null);
}

/**
 * Motif keys for the map filter, most-used first, each with how many entries
 * it would show. The tag list this replaced had 172 options, 140 of which
 * matched a single giant.
 */
export function motifFilterOptions(): { key: string; label: string }[] {
  return getAllMotifs()
    .map((m) => ({
      key: m.key,
      name: m.name,
      count: giants.filter((g) => g.motifs?.includes(m.key)).length,
    }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .map((m) => ({ key: m.key, label: `${m.name} (${m.count})` }));
}
