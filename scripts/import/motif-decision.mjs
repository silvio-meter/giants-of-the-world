/**
 * The motif decision, loaded for the importer.
 *
 * Source of truth: docs/expansion/ODLUKA-motivi.md as revised on 5 August
 * 2026, the revision that changed the minting rule from two bearers to two
 * cultures. That file is a decision, not a proposal. This is it in a form the
 * importer can read.
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
 * Three are minted, once, on first encounter.
 *
 * The rule is at least two distinct cultures, not at least two bearers. That
 * is the rule crossCulturalMotifs() in src/lib/motifs.ts already enforces, on
 * the grounds the motifs page itself gives: two cases from one tradition are
 * one tradition twice, not recurrence across cultures.
 */
export const MINT_ONCE = [
  "real-site-attached",
  "ended-by-christianity",
  "shaped-the-land-while-living",
];

/**
 * Eight are written to staging as literal strings. Nothing is created.
 *
 * Not discarded: when a case from another culture arrives they get minted
 * then. Discarding would lose the first case silently.
 *
 * Three of these are here for reasons worth keeping written down.
 *
 * river-from-a-giant has two bearers, dragonja and klek, but both are
 * Croatian, so it has one culture and waits.
 *
 * buried-under-volcanoes looks like two cases, but one is cherufe, which is
 * held back, so its real count on publication day is one.
 *
 * christian-ending-added has one bearer in the series, santa-elena-giants. Its
 * other two, jentilak and gargantua, exist only if the retroactive tagging in
 * the South America brief is carried out, and that edits live entries in
 * src/data. Minting it before then would create a motif with one bearer and
 * one culture, which is the exact fault that stopped buried-under-volcanoes.
 * It mints when the retroactive tagging is actually done, not before.
 */
export const STAGE_AND_WAIT = [
  "river-from-a-giant",
  "buried-under-volcanoes",
  "christian-ending-added",
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
