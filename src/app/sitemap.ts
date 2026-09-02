import type { MetadataRoute } from "next";
import { getAllGiants, getShippedFindingSlugs } from "@/lib/giants";
import { siteUrl } from "@/lib/site";

/** Auth and per-user pages are deliberately absent — they are noindex. */
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
  { path: "/pricing", priority: 0.6, freq: "monthly" },
  { path: "/terms", priority: 0.3, freq: "monthly" },
  { path: "/privacy", priority: 0.3, freq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticRoutes.map(({ path, priority, freq }) => ({
      url: `${siteUrl}${path || "/"}`,
      lastModified: now,
      changeFrequency: freq,
      priority,
    })),
    ...getAllGiants().map((g) => ({
      url: `${siteUrl}/giants/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      // Open entries are the ones that can actually rank — rate them higher.
      priority: g.freeEntry ? 0.9 : 0.7,
    })),
    ...getShippedFindingSlugs().map((slug) => ({
      url: `${siteUrl}/findings/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
