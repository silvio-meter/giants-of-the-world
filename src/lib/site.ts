/** Canonical origin, with no trailing slash. Single source for metadata, sitemap, robots and Stripe redirects. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.giantscodex.com";
