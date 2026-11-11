import type { MetadataRoute } from "next";
import { getAllGiants, getShippedFindingSlugs } from "@/lib/giants";
import { siteUrl } from "@/lib/site";
import { HUBS, hubPath } from "@/lib/hubs";
import { isCatalogueHeld } from "@/lib/catalogue-hold";

/**
 * Auth and per-user pages are deliberately absent — they are noindex.
 * /pricing is absent while membership sales are closed (it redirects).
 * Entries on the Catalogue hold list (src/lib/catalogue-hold.ts) are absent
 * until Catalogue confirms them, slug by slug.
 *
 * lastModified is never the build time. Entries use their committed
 * `updatedAt` (see scripts/stamp-updated-at.mjs); static pages, hubs and
 * findings use STATIC_LAST_MODIFIED, bumped by hand when they change.
 */
export const STATIC_LAST_MODIFIED = "2026-11-11";
const staticRoutes: {
  path: string;
  priority: number;
  freq: "weekly" | "monthly";
}[] = [
  { path: "", priority: 1, freq: "weekly" },
  { path: "/giants", priority: 0.9, freq: "weekly" },
  { path: "/motifs", priority: 0.8, freq: "monthly" },
  { path: "/compare", priority: 0.6, freq: "monthly" },
  { path: "/map", priority: 0.7, freq: "monthly" },
  { path: "/near", priority: 0.7, freq: "monthly" },
  { path: "/findings", priority: 0.7, freq: "monthly" },
  { path: "/evidence", priority: 0.6, freq: "monthly" },
  { path: "/about", priority: 0.5, freq: "monthly" },
  { path: "/bestiary", priority: 0.6, freq: "monthly" },
  { path: "/bestiary/free-sample", priority: 0.6, freq: "monthly" },
  { path: "/terms", priority: 0.3, freq: "monthly" },
  { path: "/privacy", priority: 0.3, freq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = new Date(`${STATIC_LAST_MODIFIED}T00:00:00Z`);

  return [
    ...staticRoutes.map(({ path, priority, freq }) => ({
      url: `${siteUrl}${path || "/"}`,
      lastModified: fixed,
      changeFrequency: freq,
      priority,
    })),
    ...HUBS.map((h) => ({
      url: `${siteUrl}${hubPath(h)}`,
      lastModified: fixed,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...getAllGiants()
      .filter((g) => !isCatalogueHeld(g.slug))
      .map((g) => ({
        url: `${siteUrl}/giants/${g.slug}`,
        lastModified: new Date(`${g.updatedAt ?? STATIC_LAST_MODIFIED}T00:00:00Z`),
        changeFrequency: "monthly" as const,
        // Open entries are the ones that can actually rank — rate them higher.
        priority: g.freeEntry ? 0.9 : 0.7,
      })),
    ...getShippedFindingSlugs().map((slug) => ({
      url: `${siteUrl}/findings/${slug}`,
      lastModified: fixed,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
