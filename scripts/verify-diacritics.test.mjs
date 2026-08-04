/**
 * Diacritic guard, asserted by codepoint at four points along the pipeline.
 *
 * Three rows once shipped with their diacritics folded to ASCII: jentilak and
 * olentzero lost Barandiarán, rubezahl lost Musäus, Krakonoš, Krkonošské and
 * more. The cause was not an ingest path that folds. It was authoring: the
 * strings were typed without accents in scripts/content/europe.mjs, and the
 * pipeline carried them faithfully, which is exactly what it should do.
 *
 * That is why these assertions compare codepoints rather than eyeballing the
 * rendered text. A folded string looks like a spelling choice, not a fault,
 * and any tool that normalises on the way to a diff or a preview will hide it.
 *
 * Run: npm test            source and generated data
 *      BASE=... npm test   adds the API and rendered HTML checks
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

/** Slug is deliberately the ASCII fold; the display strings are not. */
const EXPECTED = {
  jentilak: ["Barandiarán", "José Miguel", "Resurrección María"],
  olentzero: ["Barandiarán"],
  rubezahl: ["Rübezahl", "Musäus", "Volksmärchen", "Krakonoš", "Krkonošské", "pohádky"],
};

/** If any of these come back, the fold has returned. */
const FOLDED = [
  "Barandiaran",
  "Jose Miguel",
  "Resurreccion Maria",
  "Musaus",
  "Volksmarchen",
  "Krakonos",
  "Krkonosske",
  "pohadky",
];

const master = read("src/data/giants.json");
const publicEntries = read("src/data/giants.public.json");
const lore = read("src/data/giants.lore.json");

const entryText = (e) => JSON.stringify(e);

// ---------------------------------------------------------------------------
// 1. Source file: src/data/giants.json, the hand-edited master.
// ---------------------------------------------------------------------------

test("source master carries the diacritics as codepoints", () => {
  for (const [slug, expected] of Object.entries(EXPECTED)) {
    const entry = master.find((g) => g.slug === slug);
    assert.ok(entry, `${slug} missing from the master`);
    const text = entryText(entry);
    for (const word of expected) {
      assert.ok(
        text.includes(word),
        `${slug}: "${word}" is missing from the master, diacritics may have been folded again`
      );
    }
    for (const folded of FOLDED) {
      assert.ok(
        !text.includes(folded),
        `${slug}: ASCII-folded "${folded}" is back in the master`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 2. Generated data: what the app actually reads at runtime.
// ---------------------------------------------------------------------------

test("generated public and lore data keep the diacritics", () => {
  for (const [slug, expected] of Object.entries(EXPECTED)) {
    const combined =
      entryText(publicEntries.find((g) => g.slug === slug) ?? {}) +
      entryText(lore[slug] ?? {});
    for (const word of expected) {
      assert.ok(
        combined.includes(word),
        `${slug}: "${word}" did not survive into the generated data`
      );
    }
    for (const folded of FOLDED) {
      assert.ok(
        !combined.includes(folded),
        `${slug}: ASCII-folded "${folded}" is in the generated data`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// The slug rule. An ASCII slug beside an accented display name is correct and
// must not be "tidied up" by a future pass over this data.
// ---------------------------------------------------------------------------

test("slug is the ASCII fold while the display name keeps its diacritics", () => {
  const rubezahl = master.find((g) => g.slug === "rubezahl");
  assert.equal(rubezahl.slug, "rubezahl", "slug must stay ASCII, it is a URL");
  assert.equal(rubezahl.name, "Rübezahl", "display name must keep its umlaut");
  assert.ok(
    !/[^ -~]/.test(rubezahl.slug),
    "slug contains a non-ASCII codepoint"
  );
  assert.ok(
    /[^ -~]/.test(rubezahl.name),
    "display name has lost its non-ASCII codepoints"
  );
});

// ---------------------------------------------------------------------------
// 3 and 4. API response and rendered HTML, against a running server.
// ---------------------------------------------------------------------------

const BASE = process.env.BASE;

test(
  "API response keeps the diacritics",
  { skip: BASE ? false : "BASE not set" },
  async () => {
    for (const [slug, expected] of Object.entries(EXPECTED)) {
      const res = await fetch(`${BASE}/api/lore/${slug}`);
      // Paywalled entries answer 402 here, which is fine: the point is that
      // whatever the API does return has not been folded.
      const body = await res.text();
      for (const folded of FOLDED) {
        assert.ok(
          !body.includes(folded),
          `${slug}: API returned ASCII-folded "${folded}"`
        );
      }
      if (res.ok) {
        for (const word of expected) {
          if (!body.includes(word)) continue;
          assert.ok(body.includes(word), `${slug}: API lost "${word}"`);
        }
      }
    }
  }
);

test(
  "rendered HTML keeps the diacritics",
  { skip: BASE ? false : "BASE not set" },
  async () => {
    for (const [slug, expected] of Object.entries(EXPECTED)) {
      const html = await (await fetch(`${BASE}/giants/${slug}`)).text();
      for (const word of expected) {
        assert.ok(
          html.includes(word),
          `${slug}: "${word}" is not in the rendered HTML`
        );
      }
      for (const folded of FOLDED) {
        assert.ok(
          !html.includes(folded),
          `${slug}: ASCII-folded "${folded}" is in the rendered HTML`
        );
      }
    }
  }
);
