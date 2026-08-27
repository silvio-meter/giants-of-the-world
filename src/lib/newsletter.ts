/**
 * One Seam newsletter - list identity, consent, and source tags.
 * Promise: a short welcome, then one seam a week. No digests. No product spam.
 */

export const ONE_SEAM = {
  listName: "One Seam",
  fromName: "Giants Codex",
  /**
   * Prefer seam@ when DNS is authenticated in Resend.
   * Override with NEWSLETTER_FROM=Giants Codex <hello@giantscodex.com> if needed.
   */
  fromDefault: "Giants Codex <seam@giantscodex.com>",
  promise: "A short welcome, then one seam a week. No digests. No feature spam.",
} as const;

/**
 * Consent wording stored on each row at submit time.
 * Change carefully: older rows keep the text they actually agreed to.
 */
export const NEWSLETTER_CONSENT_TEXT =
  "One Seam: a short welcome, then one seam a week. One place where a giant story splits. No digests. No product spam. You can unsubscribe at any time.";

export type NewsletterSource = "footer" | "entry" | "journey";

/** Map UI sourcePage into the three allowed source tags. */
export function normalizeNewsletterSource(
  sourcePage: string | null | undefined
): NewsletterSource {
  const raw = (sourcePage ?? "").trim().toLowerCase();
  if (raw === "journey") return "journey";
  if (raw === "footer" || raw === "") return "footer";
  if (raw === "entry" || raw.startsWith("/giants/") || raw.startsWith("giants/")) {
    return "entry";
  }
  // Unknown surfaces count as footer (global band) rather than inventing tags.
  return "footer";
}

/** Resend From header: NEWSLETTER_FROM or site default (hello@ until seam@ is live). */
export function newsletterFromAddress(): string {
  const env = process.env.NEWSLETTER_FROM?.trim();
  if (env) return env;
  // Prefer seam@ when the operator sets nothing but wants the brand default
  // once DNS is ready: set NEWSLETTER_FROM=Giants Codex <seam@giantscodex.com>
  return ONE_SEAM.fromDefault;
}
