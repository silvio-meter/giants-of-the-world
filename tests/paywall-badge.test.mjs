/**
 * The Free badge on the catalogue and the paywall on the entry page must agree.
 *
 * A badge is a promise. Someone who clicks Free and lands on a price does not
 * think "bug", they think they were misled, and if the click came from a paid
 * campaign the money is spent before anyone notices.
 *
 * Both sides read `freeEntry` today: GiantCard renders the badge on
 * `giant.freeEntry`, and the entry page picks FullDescription or LockedLore on
 * the same field. So they cannot currently disagree. This test exists so that
 * stays true, because the two are in different files and nothing else ties
 * them together.
 *
 * Asserted against served HTML rather than the data, because the data has
 * twice been right while the page was wrong.
 *
 * Run: npm run build && PORT=3114 npm start
 *      BASE=http://localhost:3114 npm test
 * Against production: BASE=https://www.giantscodex.com npm test
 */

import test from "node:test";
import assert from "node:assert/strict";

const BASE = process.env.BASE;
const skip = BASE ? false : "BASE not set";

/** Markers that the entry is not fully open to a logged-out reader. */
const LOCKED_MARKERS = [
  "Continue this account.",
  "unverified folklore, not a membership gate",
];

const get = (path) =>
  fetch(BASE + path, { credentials: "omit", cache: "no-store" }).then((r) => r.text());

/**
 * The badge text is uppercased by CSS, so the rendered text reads FREE while
 * the markup says Free. Matching case-sensitively finds nothing and reports a
 * catalogue with no free entries at all, which is why this is case-insensitive.
 */
const FREE_BADGE = />\s*Free\s*</i;

async function survey() {
  const list = await get("/giants");
  const cards = [
    ...list.matchAll(/<a[^>]+href="\/giants\/([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/g),
  ]
    .filter(([, slug]) => slug !== "random")
    .map(([, slug, inner]) => ({ slug, badge: FREE_BADGE.test(inner) }));

  const unique = [...new Map(cards.map((c) => [c.slug, c])).values()];

  const rows = [];
  for (let i = 0; i < unique.length; i += 6) {
    const batch = await Promise.all(
      unique.slice(i, i + 6).map(async (c) => {
        const html = await get(`/giants/${c.slug}`);
        return {
          ...c,
          locked: LOCKED_MARKERS.some((m) => html.includes(m)),
        };
      })
    );
    rows.push(...batch);
  }
  return rows;
}

const rows = BASE ? await survey() : [];

test("the survey saw both states, so a clean result means something", { skip }, () => {
  assert.ok(rows.length > 0, "no entry cards were found on /giants, so this survey is broken");
  assert.ok(
    rows.some((r) => r.badge),
    "no card carries a Free badge, which means the badge is not being detected rather than absent"
  );
  assert.ok(
    rows.some((r) => r.locked),
    "no entry page shows the paywall, which means the marker is not being detected rather than absent"
  );
});

/**
 * /findings links to entries too, and now badges them. The map popup does as
 * well, but Leaflet builds popups on click, so no fetch of the served HTML can
 * see one. That surface is checked by hand in a browser.
 */
test("the badges on /findings agree with the entry pages", { skip }, async () => {
  const html = await get("/findings");
  const locked = new Map(rows.map((r) => [r.slug, r.locked]));

  const wrong = [];
  for (const m of html.matchAll(/href="\/giants\/([a-z0-9-]+)"([\s\S]{0,400})/g)) {
    const [, slug, after] = m;
    if (slug === "random" || !locked.has(slug)) continue;
    // The badge sits in the same row as the link, right after it. Bound the
    // window at the next row rather than at a closing tag: splitting on
    // </span></span> ate the badge's own closing tag, and FREE_BADGE needs the
    // < after the word, so a rendered badge read as absent.
    const badged = FREE_BADGE.test(after.split(/<\/li>|<li\b/)[0] ?? "");
    if (badged === locked.get(slug)) {
      wrong.push(
        badged
          ? `${slug}: badged Free on /findings but the entry is behind the paywall`
          : `${slug}: open to everyone but /findings does not say so`
      );
    }
  }

  assert.deepEqual(wrong, [], `/findings disagrees with the entry pages:\n  ${wrong.join("\n  ")}`);
});

test("every Free badge leads to an open page, and every locked page has no badge", { skip }, () => {
  const wrong = rows
    .filter((r) => r.badge === r.locked)
    .map((r) =>
      r.badge
        ? `${r.slug}: badged Free but the page is behind the paywall`
        : `${r.slug}: open to everyone but carries no Free badge`
    );

  assert.deepEqual(
    wrong,
    [],
    `the catalogue and the entry pages disagree on ${wrong.length} entr${wrong.length === 1 ? "y" : "ies"}:\n  ${wrong.join("\n  ")}`
  );
});
