/**
 * The motif decision, loaded for the importer.
 *
 * Source of truth: docs/expansion/ODLUKA-motivi.md, 5 August 2026. That file
 * is a decision, not a proposal. This is it in a form the importer can read.
 *
 * Nothing here mints, merges or writes anything. It classifies, and it stops
 * on anything it does not recognise.
 *
 * Note on the source file: docs/expansion/ is deliberately not committed. The
 * repository is public and those files carry the full premium copy of thirty
 * entries that have not shipped. So this module holds the decision, and the
 * validator below reads the entry metadata only when the working copy has it.
 */

/**
 * Six incoming slugs are aliases for motifs that already exist.
 * The live names do not change by a single byte. Nothing is created.
 */
export const MERGE_INTO_LIVE = {
  "those-who-came-before": "pre-people",
  "built-the-megaliths": "builder",
  "killed-by-cunning": "outwitted",
  "one-eye": "one-eye",
  "petrified-into-landscape": "petrified",
  "bones-read-as-giants": "bones-as-proof",
};

/**
 * Five are minted, once, on first encounter.
 *
 * The rule behind the list is that a motif needs at least two named cases.
 * One case is a label, not a motif. christian-ending-added passes only
 * because the South America brief requires retroactive tagging onto jentilak
 * and gargantua, which takes it from one to three.
 */
export const MINT_ONCE = [
  "real-site-attached",
  "ended-by-christianity",
  "shaped-the-land-while-living",
  "river-from-a-giant",
  "christian-ending-added",
];

/**
 * Six are written to staging as literal strings. Nothing is created.
 *
 * Not discarded: when a second case arrives they get minted then. Discarding
 * would lose the first case silently.
 *
 * buried-under-volcanoes is the trap in this list. The metadata shows two
 * cases, but one of them is cherufe, which is held back and does not ship, so
 * its real count on publication day is one.
 */
export const STAGE_AND_WAIT = [
  "buried-under-volcanoes",
  "named-for-the-dead",
  "giants-as-heroes",
  "raised-by-animals",
  "arrived-by-sea",
  "invulnerable-hide",
];

/** Held back, does not import, and must not contribute to any motif count. */
export const HELD_BACK = ["cherufe"];

/**
 * The importer calls this for every motif slug on every entry.
 * Anything unrecognised stops the run rather than being guessed at.
 */
export function classify(slug) {
  if (slug in MERGE_INTO_LIVE) {
    return { action: "merge", target: MERGE_INTO_LIVE[slug] };
  }
  if (MINT_ONCE.includes(slug)) return { action: "mint" };
  if (STAGE_AND_WAIT.includes(slug)) return { action: "stage" };
  throw new Error(
    `motif slug "${slug}" is in none of the three lists. Stop and report it. Do not guess.`
  );
}
