import giantsData from "@/data/giants.public.json";
import findingsData from "@/data/findings.json";
import type { Finding, GiantType } from "./types";
import { formatType, type GiantCardData } from "./format";

/**
 * Importing this module pulls the whole catalog JSON into whatever bundle
 * references it. Keep it out of client components — use `@/lib/format` there.
 */
export type { GiantCardData };
export { formatType };

export const giants = giantsData as unknown as GiantCardData[];
export const findings = findingsData as Finding[];

export function getAllGiants(): GiantCardData[] {
  return giants;
}

export function getGiantBySlug(slug: string): GiantCardData | undefined {
  return giants.find((g) => g.slug === slug);
}

export function getGiantById(id: string): GiantCardData | undefined {
  return giants.find((g) => g.id === id);
}

export function getRelatedGiants(giant: GiantCardData): GiantCardData[] {
  return giant.related
    .map((id) => getGiantById(id))
    .filter((g): g is GiantCardData => g !== undefined);
}

export function getRandomGiant(): GiantCardData {
  return giants[Math.floor(Math.random() * giants.length)];
}

export function getGiantsWithCoordinates(): GiantCardData[] {
  return giants.filter((g) => g.coordinates !== null);
}

export function getCultures(): string[] {
  return [...new Set(giants.map((g) => g.culture))].sort();
}

export function getRegions(): string[] {
  return [...new Set(giants.map((g) => g.region))].sort();
}

export function getTypes(): GiantType[] {
  return [...new Set(giants.map((g) => g.type))] as GiantType[];
}

export function getTags(): string[] {
  return [...new Set(giants.flatMap((g) => g.tags))].sort();
}

export type GiantSort =
  | "name"
  | "culture"
  | "free-first"
  | "scholarly-first";

export function filterGiants(opts: {
  culture?: string;
  type?: string;
  region?: string;
  search?: string;
  tag?: string;
  motif?: string;
  /** "1" style: only free / only scholarly / only chain. */
  free?: boolean;
  scholarly?: boolean;
  chain?: boolean;
  slugs?: string[] | null;
  requireCoordinates?: boolean;
  sort?: GiantSort;
}): GiantCardData[] {
  const q = opts.search?.toLowerCase().trim() ?? "";
  const slugSet =
    opts.slugs === undefined || opts.slugs === null
      ? null
      : new Set(opts.slugs);

  const out = giants.filter((g) => {
    if (slugSet && !slugSet.has(g.slug)) return false;
    if (opts.requireCoordinates && !g.coordinates) return false;
    if (opts.culture && g.culture !== opts.culture) return false;
    if (opts.type && g.type !== opts.type) return false;
    if (opts.region && g.region !== opts.region) return false;
    if (opts.tag && !g.tags.includes(opts.tag)) return false;
    if (opts.motif && !g.motifs?.includes(opts.motif)) return false;
    if (opts.free && !g.freeEntry) return false;
    if (opts.scholarly && !g.hasScholarlyNotes) return false;
    if (opts.chain && !g.chainSummary) return false;
    if (q) {
      const hay = [
        g.name,
        g.shortDescription,
        g.culture,
        g.region,
        ...g.alsoKnownAs,
        ...g.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sort = opts.sort ?? "name";
  return out.slice().sort((a, b) => {
    if (sort === "culture") {
      return (
        a.culture.localeCompare(b.culture) || a.name.localeCompare(b.name)
      );
    }
    if (sort === "free-first") {
      if (a.freeEntry !== b.freeEntry) return a.freeEntry ? -1 : 1;
      return a.name.localeCompare(b.name);
    }
    if (sort === "scholarly-first") {
      const as = Boolean(a.hasScholarlyNotes);
      const bs = Boolean(b.hasScholarlyNotes);
      if (as !== bs) return as ? -1 : 1;
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });
}

export function getFreeGiants(): GiantCardData[] {
  return giants.filter((g) => g.freeEntry);
}

export interface ComparePickerOption {
  slug: string;
  name: string;
  culture: string;
  image: string;
}

/**
 * Slim projection for the Compare tool's autocomplete pickers.
 *
 * The full catalog is ~55 KB; a client component that imported it directly
 * would ship that to every visitor who loads /compare. This is name, slug,
 * culture and image only — under 6 KB for all 57 entries — computed here on
 * the server and passed down as plain props.
 */
export function getComparePickerOptions(): ComparePickerOption[] {
  return giants
    .map((g) => ({ slug: g.slug, name: g.name, culture: g.culture, image: g.image }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAllFindings(): Finding[] {
  return findings;
}

/** PR1 Finding permalinks under /findings/{slug}. Only these generateStaticParams + sitemap. */
export const FIRST_FINDING_PERMALINKS = [
  "cardiff-giant",
  "goliath-height-manuscripts",
  "og-iron-bed",
  "lovelock-si-te-cah-remains",
  "solid-muldoon",
] as const;

export type FindingPermalinkSlug = (typeof FIRST_FINDING_PERMALINKS)[number];

const shippedFindingSlugSet = new Set<string>(FIRST_FINDING_PERMALINKS);

/** Free-door Finding cross-links for PR1 (giant slug -> finding permalink slug). */
export const RELATED_FINDING_BY_GIANT: Partial<
  Record<string, FindingPermalinkSlug>
> = {
  goliath: "goliath-height-manuscripts",
  "og-of-bashan": "og-iron-bed",
  "si-te-cah": "lovelock-si-te-cah-remains",
};

/** Resolve the URL slug for a finding (explicit slug, else id). */
export function findingUrlSlug(f: Finding): string {
  return f.slug ?? f.id;
}

export function getFindingBySlug(slug: string): Finding | undefined {
  return findings.find((f) => findingUrlSlug(f) === slug);
}

export function getShippedFindingSlugs(): readonly FindingPermalinkSlug[] {
  return FIRST_FINDING_PERMALINKS;
}

export function isShippedFindingSlug(slug: string): boolean {
  return shippedFindingSlugSet.has(slug);
}

export function getRelatedFindingSlug(
  giantSlug: string
): FindingPermalinkSlug | undefined {
  return RELATED_FINDING_BY_GIANT[giantSlug];
}

