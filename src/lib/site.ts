/** Canonical origin, with no trailing slash. Single source for metadata, sitemap, robots and Stripe redirects. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.giantscodex.com";

/**
 * Public contact address. Shown on the site, quoted in Terms and Privacy, and
 * the address customers write to for refunds and data requests.
 */
export const supportEmail = "hello@giantscodex.com";

/**
 * The legal seller and data controller behind the Service. Named in Terms,
 * Privacy and the footer. Brand names stay Giants of the World / Giants Codex;
 * this is the business that sells and operates them. Never add bank details.
 */
export const operatorIdentity =
  "LOGOSOM, obrt za informatičke usluge, vl. Silvio Meter, Sunčana 28, 31221 Josipovac, Croatia. MB 99368145, OIB 06729873793.";

/**
 * Official contact for the seller and data controller. Used in Terms and
 * Privacy only (refunds, legal and data requests). Deliberately separate from
 * operatorIdentity so the footer, which renders the identity on every page,
 * does not show it. General support stays on supportEmail.
 */
export const operatorContactEmail = "meter257@gmail.com";

/**
 * VAT status of the seller, stated in Terms next to the identity.
 */
export const operatorVatNote =
  "LOGOSOM is not registered in the VAT system. VAT is not charged under Article 90(1) of the Croatian VAT Act.";

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

/** @deprecated Import from `@/lib/newsletter` - re-exported for older call sites. */
export { NEWSLETTER_CONSENT_TEXT } from "./newsletter";
