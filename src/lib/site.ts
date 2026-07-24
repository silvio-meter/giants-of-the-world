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
