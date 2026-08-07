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
  // Volksmährchen keeps the h: that is the spelling of the 1783 title, and the
  // entry now cites the volume and year rather than the run of the series.
  rubezahl: ["Rübezahl", "Musäus", "Volksmährchen", "Krakonoš", "Krkonošské", "pohádky"],
};

/** If any of these come back, the fold has returned. */
const FOLDED = [
  "Barandiaran",
  "Jose Miguel",
  "Resurreccion Maria",
  "Musaus",
  "Volksmarchen",
  "Volksmahrchen",
  "Krakonos",
  "Krkonos",
  "Krkonosske",
  "pohadky",
];

/**
 * Swept across every entry, not just the three that were once damaged.
 *
 * "Krkonose" survived the first pass because that pass matched on
 * "Krkonosske" and this is the shorter stem, in a different field of the same
 * row. Checking the whole corpus for the folded spelling costs nothing and
 * does not depend on anyone naming the right row in advance.
 *
 * Only forms that are genuinely wrong belong here. A name that simply does
 * not appear in the corpus is not a defect, and adding it would make this
 * list read as though it were.
 */
const FOLDED_ANYWHERE = [
  "Barandiaran",
  "Musaus",
  "Volksmarchen",
  "Volksmahrchen",
  "Krakonos",
  "Krkonos",
  "pohadky",
  "Ojancanu",
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

// ---------------------------------------------------------------------------
// Corpus-wide sweeps. The named-row checks above only protect rows someone
// already knew about.
// ---------------------------------------------------------------------------

test("no ASCII-folded name anywhere in the catalogue", () => {
  for (const giant of master) {
    // slug and id are deliberately ASCII: they are URLs.
    const { slug, id, image, ...rest } = giant;
    void slug;
    void id;
    void image;
    const text = JSON.stringify(rest);
    for (const folded of FOLDED_ANYWHERE) {
      assert.ok(
        !text.includes(folded),
        `${giant.slug}: ASCII-folded "${folded}" in entry text`
      );
    }
  }
});

/**
 * Entry data only. Kept because it runs without a server and fails fast in
 * CI, but it is not the real guard: it cannot see copy that lives outside
 * giants.json. The rendered sweep below is the one that matters.
 */
test("no em dash in any entry's data", () => {
  for (const giant of master) {
    const text = JSON.stringify(giant);
    assert.ok(
      !text.includes("—"),
      `${giant.slug}: em dash in entry text, use a comma, colon or full stop`
    );
  }
});

/**
 * The real guard: every route's rendered HTML.
 *
 * A source-file check is the wrong shape for this. Two defects proved it.
 * The glossary shipped five em dashes in definitions that no entry-level
 * check could ever see, and /map carried one in a component prop rather
 * than in any data file at all. Both were live and indexed.
 *
 * Scanning the served HTML catches copy wherever it comes from: entry data,
 * glossary, motifs, findings, plan blurbs, or a string typed directly into
 * JSX. Scripts are deliberately not stripped, because props passed to client
 * components live in the RSC payload inside a script tag, which is exactly
 * where the glossary definitions were hiding.
 */
test(
  "no em dash in the rendered HTML of any route",
  { skip: BASE ? false : "BASE not set" },
  async () => {
    const routes = [
      "/",
      "/giants",
      "/motifs",
      "/map",
      "/findings",
      "/evidence",
      "/about",
      "/pricing",
      "/compare",
      "/privacy",
      "/terms",
      "/login",
      "/signup",
      ...master.map((g) => `/giants/${g.slug}`),
    ];

    const offenders = [];
    for (const route of routes) {
      const html = await (await fetch(`${BASE}${route}`)).text();
      const at = html.indexOf("—");
      if (at !== -1) {
        offenders.push(
          `${route}: ...${html.slice(Math.max(0, at - 70), at + 70).replace(/\s+/g, " ")}...`
        );
      }
    }

    assert.deepEqual(
      offenders,
      [],
      `em dash in rendered output, use a comma, colon or full stop:\n${offenders.join("\n")}`
    );
  }
);

test("the removal offer is one string, byte identical on every entry that carries it", () => {
  const notes = master
    .filter((g) => g.communityNote)
    .map((g) => g.communityNote);

  // murkupang carries it inside its disputed section rather than the field.
  const murkupang = master.find((g) => g.slug === "murkupang");
  const start = murkupang.sections.disputed.indexOf("Whether this material");
  assert.ok(start !== -1, "murkupang no longer carries the removal offer");
  notes.push(murkupang.sections.disputed.slice(start));

  assert.equal(notes.length, 5, "expected the offer on exactly five entries");
  assert.equal(
    new Set(notes).size,
    1,
    "the removal offer has drifted apart between entries"
  );
  assert.ok(
    notes[0].endsWith("Requests can be sent to hello@giantscodex.com."),
    "the offer must say where a request can actually be sent"
  );
});
