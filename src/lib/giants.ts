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

export function filterGiants(opts: {
  culture?: string;
  type?: string;
  region?: string;
  search?: string;
  tag?: string;
  slugs?: string[] | null;
  requireCoordinates?: boolean;
}): GiantCardData[] {
  const q = opts.search?.toLowerCase().trim() ?? "";
  const slugSet =
    opts.slugs === undefined || opts.slugs === null
      ? null
      : new Set(opts.slugs);

  return giants.filter((g) => {
    if (slugSet && !slugSet.has(g.slug)) return false;
    if (opts.requireCoordinates && !g.coordinates) return false;
    if (opts.culture && g.culture !== opts.culture) return false;
    if (opts.type && g.type !== opts.type) return false;
    if (opts.region && g.region !== opts.region) return false;
    if (opts.tag && !g.tags.includes(opts.tag)) return false;
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
}

export function getFreeGiants(): GiantCardData[] {
  return giants.filter((g) => g.freeEntry);
}

export function getAllFindings(): Finding[] {
  return findings;
}
