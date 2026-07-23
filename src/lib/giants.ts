import giantsData from "@/data/giants.json";
import findingsData from "@/data/findings.json";
import type { Giant, Finding, GiantType } from "./types";

export const giants = giantsData as Giant[];
export const findings = findingsData as Finding[];

export function getAllGiants(): Giant[] {
  return giants;
}

export function getGiantBySlug(slug: string): Giant | undefined {
  return giants.find((g) => g.slug === slug);
}

export function getGiantById(id: string): Giant | undefined {
  return giants.find((g) => g.id === id);
}

export function getRelatedGiants(giant: Giant): Giant[] {
  return giant.related
    .map((id) => getGiantById(id))
    .filter((g): g is Giant => g !== undefined);
}

export function getRandomGiant(): Giant {
  return giants[Math.floor(Math.random() * giants.length)];
}

export function getGiantsWithCoordinates(): Giant[] {
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

export function filterGiants(opts: {
  culture?: string;
  type?: string;
  region?: string;
  search?: string;
}): Giant[] {
  const q = opts.search?.toLowerCase().trim() ?? "";
  return giants.filter((g) => {
    if (opts.culture && g.culture !== opts.culture) return false;
    if (opts.type && g.type !== opts.type) return false;
    if (opts.region && g.region !== opts.region) return false;
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

export function formatType(type: GiantType): string {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getAllFindings(): Finding[] {
  return findings;
}
