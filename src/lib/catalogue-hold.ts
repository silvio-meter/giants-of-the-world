/**
 * Catalogue hold list (owner decision, 11 November 2026).
 *
 * The catalogue is open: every entry renders its full account in the static
 * HTML, except the slugs below. These are the entries Catalogue marked (a)
 * living Indigenous or community traditions and (b) modern military legends
 * in the open-92 checklist. Until Catalogue confirms a slug, entry by entry:
 *
 *   - the entry stays exactly as it was before the opening (same text, same
 *     title and meta, same access: a held entry that was already free stays
 *     free, a held entry that was locked stays locked);
 *   - it is left out of /sitemap.xml;
 *   - it gets no new ENTRY_SEO record (titles, metas and FAQ sets).
 *
 * dzunukwa is on the list and also has handling.publishable = false. It stays
 * closed regardless of Catalogue confirmation until the owner decides.
 *
 * To release a slug: remove it here, set freeEntry in src/data/giants.json,
 * run `npm run build:data` and `node scripts/update-free-preview-snapshot.mjs`,
 * and update tests/catalogue-hold.test.mjs.
 *
 * Plain data with no imports, so node --test can load it directly.
 */

/** (a) Living Indigenous traditions and living communities. */
export const HOLD_LIVING_TRADITIONS = [
  "dzunukwa",
  "tsul-kalu",
  "kee-wakw",
  "gaoh",
  "budj-bim",
  "papinijuwari",
  "murkupang",
  "thardid-jimbo",
  "chinny-kinik",
  "kahui-tipua",
  "nawao",
  "amazimu",
  "giant-of-the-forest",
  "stallo",
  "patagonian-giants",
  "mapinguari",
  "pangu",
  "guanche-giants",
] as const;

/** (b) Modern military legends, labelled as unverified contemporary folklore. */
export const HOLD_MODERN_MILITARY = [
  "giant-of-kandahar",
  "giant-of-kunar",
] as const;

export const CATALOGUE_HOLD_SLUGS: readonly string[] = [
  ...HOLD_LIVING_TRADITIONS,
  ...HOLD_MODERN_MILITARY,
];

/** Never opened by this change, whatever Catalogue confirms (publishable: false). */
export const NEVER_OPEN_SLUGS: readonly string[] = ["dzunukwa"];

const HOLD = new Set(CATALOGUE_HOLD_SLUGS);

export function isCatalogueHeld(slug: string): boolean {
  return HOLD.has(slug);
}

const NEVER_OPEN = new Set(NEVER_OPEN_SLUGS);

/** publishable: false entries. No public surface features or links them. */
export function isNeverOpen(slug: string): boolean {
  return NEVER_OPEN.has(slug);
}

/**
 * May this slug be suggested as the other half of a Compare link
 * (Session Prep pair, the giant page's "vs" list)? Held and never-open
 * entries are never suggested.
 */
export function isSuggestableCompareTarget(slug: string): boolean {
  return !HOLD.has(slug) && !NEVER_OPEN.has(slug);
}
