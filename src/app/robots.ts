import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Two different tools for two different jobs, and mixing them up is a known
 * way to confuse Search Console.
 *
 * Pages we want OUT of the index carry `noindex` and must stay crawlable —
 * a disallowed page is never fetched, so the tag is never read, and Google
 * reports "Indexed, though blocked by robots.txt" instead of dropping it.
 *
 * Only paths with nothing to index at all belong here: JSON APIs, auth
 * callbacks, and routes that only ever redirect.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          // Redirect-only for a crawler: no HTML, so noindex is not an option.
          "/account",
          "/giants/random",
          // Social bio short links. Same situation: they only ever redirect,
          // and the thing they redirect to is the homepage carrying campaign
          // parameters, which is not a page anyone should land on from search.
          "/x",
          "/instagram",
          "/youtube",
          "/pinterest",
          // The confirmation link is noindex in its own metadata, but it is
          // also pointless to crawl and carries a token.
          "/subscribe/confirm",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
