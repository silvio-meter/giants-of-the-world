/**
 * Membership sales switch (owner decision, 11 November 2026).
 *
 * The catalogue is open and new memberships are no longer sold. With this
 * false:
 *   - /pricing redirects to /giants (temporary redirect in next.config.ts, so
 *     the page code stays in the repo and can be switched back on);
 *   - no Unlock / Choose plan button and no /pricing link is rendered in the
 *     nav, footer, entry walls, map, compare, near, favourites, journey,
 *     account or welcome surfaces;
 *   - the remaining member-only features (map lines and filters, compare
 *     depth, scholarly notes, chain rungs, synced journey, favourites, the
 *     full /near list, Session Prep encounter seeds) keep working for
 *     existing members and show a plain note, with no buy button, to
 *     everyone else.
 *
 * Accounts, sign-in, /api/checkout, /api/portal, the Stripe webhook and user
 * data are deliberately untouched, so every existing login and membership
 * keeps working. Plain data with no imports, so node --test can load it.
 */
export const MEMBERSHIP_SALES_OPEN = false as boolean;
