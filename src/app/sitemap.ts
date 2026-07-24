import type { MetadataRoute } from "next";
import { getAllGiants } from "@/lib/giants";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.giantscodex.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/giants",
    "/map",
    "/findings",
    "/about",
    "/pricing",
    "/favourites",
    "/terms",
    "/privacy",
    "/login",
    "/signup",
  ].map((path) => ({
    url: `${siteUrl}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/giants" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/giants" ? 0.9 : 0.6,
  }));

  const giantRoutes: MetadataRoute.Sitemap = getAllGiants().map((g) => ({
    url: `${siteUrl}/giants/${g.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...giantRoutes];
}
