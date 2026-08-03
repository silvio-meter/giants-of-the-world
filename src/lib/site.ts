/** Canonical origin, with no trailing slash. Single source for metadata, sitemap, robots and Stripe redirects. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.giantscodex.com";

/**
 * Public contact address. Shown on the site, quoted in Terms and Privacy, and
 * the address customers write to for refunds and data requests.
 */
export const supportEmail = "hello@giantscodex.com";

/** Days a customer has to ask for a full refund, no questions asked. */
export const refundDays = 14;

/** Social accounts linked from the footer. */
export const socialLinks: { platform: string; handle: string; url: string }[] = [
  { platform: "X", handle: "@TheGiantsCodex", url: "https://x.com/TheGiantsCodex" },
  {
    platform: "Instagram",
    handle: "@giantscodex",
    url: "https://www.instagram.com/giantscodex/",
  },
  {
    platform: "YouTube",
    handle: "@GiantsCodex",
    url: "https://www.youtube.com/@GiantsCodex",
  },
  {
    platform: "TikTok",
    handle: "@giantscodex",
    url: "https://www.tiktok.com/@giantscodex",
  },
  {
    platform: "Pinterest",
    handle: "giantsoftheworld",
    url: "https://www.pinterest.com/giantsoftheworld/",
  },
];

/**
 * Umami Cloud's tracker. The origin here must stay in step with the
 * script-src and connect-src entries in next.config.ts, or the browser's own
 * CSP will block analytics exactly the way it silently blocked GA4 before
 * that policy was widened.
 */
export const UMAMI_SCRIPT_SRC = "https://cloud.umami.is/script.js";
