/**
 * Data integrity guard. Runs in CI so a bad entry fails the build instead of
 * turning into a 404 (or a lore leak) in production.
 *
 * Run: npm test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { splitMaster } from "./build-data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const master = read("src/data/giants.json");
const publicEntries = read("src/data/giants.public.json");
const glossary = read("src/data/glossary.json");
const lore = read("src/data/giants.lore.json");
const findings = read("src/data/findings.json");

test("generated files are in sync with the master", () => {
  const { publicEntries: expectedPublic, lore: expectedLore } =
    splitMaster(master);
  assert.deepEqual(
    publicEntries,
    expectedPublic,
    "giants.public.json is stale — edit src/data/giants.json and run `npm run build:data`"
  );
  assert.deepEqual(
    lore,
    expectedLore,
    "giants.lore.json is stale — edit src/data/giants.json and run `npm run build:data`"
  );
});

test("public catalog carries no lore (paywall guard)", () => {
  for (const giant of publicEntries) {
    assert.ok(
      !("fullDescription" in giant),
      `${giant.slug} leaks fullDescription into the client catalog`
    );
    assert.ok(
      !("mysteryNote" in giant),
      `${giant.slug} leaks mysteryNote into the client catalog`
    );
    /**
     * The chain of custody. Only chainSummary, the claim and verdict, is
     * public; the rungs, the floor and every evidence URL are paid, and the
     * evidence addresses are our audit trail rather than anything a reader
     * should be handed.
     */
    assert.ok(
      !("chain" in giant),
      `${giant.slug} leaks the whole chain into the client catalog`
    );
  }

  /**
   * Belt and braces: no rung field may appear anywhere in the public file,
   * whatever shape a future change gives it.
   *
   * Matched as JSON keys, with the colon. An earlier version looked for the
   * bare words and failed on a verdict that says "The witnesses checked for
   * this ladder", which is prose a reader is meant to see.
   */
  const blob = JSON.stringify(publicEntries);
  for (const key of ['"sortYear":', '"witness":', '"reads":', '"evidence":', '"rungs":']) {
    assert.ok(
      !blob.includes(key),
      `the public catalog contains the key ${key}, which belongs to a chain rung`
    );
  }
});

test("every chain is ordered, closed-vocabulary, and keeps its evidence", () => {
  const KINDS = new Set([
    "manuscript", "printed", "fieldwork", "excavation", "scholarship", "press",
  ]);
  const chains = [
    ...master.filter((g) => g.chain).map((g) => [g.slug, g.chain]),
    ...findings.filter((f) => f.chain).map((f) => [f.id, f.chain]),
  ];
  assert.ok(chains.length > 0, "no chains found, so this test proves nothing");

  for (const [id, chain] of chains) {
    assert.ok(chain.claim?.trim(), `${id}: chain has no claim`);
    assert.ok(chain.verdict?.trim(), `${id}: chain has no verdict`);
    assert.ok(chain.floor?.trim(), `${id}: chain has no floor`);
    assert.ok(chain.rungs.length >= 2, `${id}: a chain of one is not a chain`);
    for (const r of chain.rungs) {
      assert.ok(KINDS.has(r.kind), `${id}: unknown rung kind "${r.kind}"`);
      assert.equal(typeof r.sortYear, "number", `${id}: rung has no sortYear`);
      assert.ok(r.witness?.trim() && r.reads?.trim(), `${id}: rung is incomplete`);
      // Kept in the master on purpose: it is how a rung was checked.
      assert.ok(r.evidence?.trim(), `${id}: rung "${r.witness}" has no evidence`);
    }
  }
});

test("every entry has lore and every lore entry has a page", () => {
  const slugs = publicEntries.map((g) => g.slug);
  for (const slug of slugs) {
    assert.ok(lore[slug], `${slug} has no lore — its page would 404`);
    assert.ok(
      lore[slug].fullDescription?.trim(),
      `${slug} has an empty fullDescription`
    );
  }
  for (const slug of Object.keys(lore)) {
    assert.ok(slugs.includes(slug), `lore for unknown slug: ${slug}`);
  }
});

test("ids and slugs are unique", () => {
  const ids = publicEntries.map((g) => g.id);
  const slugs = publicEntries.map((g) => g.slug);
  assert.equal(new Set(ids).size, ids.length, "duplicate id");
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
});

test("related references resolve", () => {
  const ids = new Set(publicEntries.map((g) => g.id));
  for (const giant of publicEntries) {
    for (const ref of giant.related) {
      assert.ok(ids.has(ref), `${giant.slug} points at unknown giant "${ref}"`);
    }
  }
});

test("images exist on disk", () => {
  for (const giant of publicEntries) {
    // An empty path is allowed and deliberate: ImagePlaceholder renders its
    // silhouette, which is the honest state for an entry awaiting art.
    if (giant.image) {
      assert.ok(
        existsSync(join(root, "public", giant.image)),
        `${giant.slug}: missing ${giant.image}`
      );
    }
    assert.ok(giant.imageAlt?.trim(), `${giant.slug} has no imageAlt`);
  }
});

test("no two entries share the same image file", () => {
  const byHash = new Map();
  for (const giant of publicEntries) {
    if (!giant.image) continue;
    const hash = createHash("sha256")
      .update(readFileSync(join(root, "public", giant.image)))
      .digest("hex");
    (byHash.get(hash) ?? byHash.set(hash, []).get(hash)).push(giant.slug);
  }
  const shared = [...byHash.values()].filter((slugs) => slugs.length > 1);
  assert.deepEqual(
    shared,
    [],
    `these entries share identical artwork, so one of them is showing another giant's picture: ${shared
      .map((s) => s.join(" = "))
      .join("; ")}`
  );
});

test("coordinates are plausible", () => {
  for (const giant of publicEntries) {
    if (giant.coordinates === null) continue;
    const [lat, lon] = giant.coordinates;
    assert.ok(lat >= -90 && lat <= 90, `${giant.slug}: bad latitude ${lat}`);
    assert.ok(lon >= -180 && lon <= 180, `${giant.slug}: bad longitude ${lon}`);
  }
});

test("types are from the known set", () => {
  const known = new Set([
    "primordial",
    "race",
    "individual",
    "folklore",
    "modern-legend",
    "tall-tale",
  ]);
  for (const giant of publicEntries) {
    assert.ok(known.has(giant.type), `${giant.slug}: unknown type ${giant.type}`);
  }
});

test("free entries exist and are a minority", () => {
  const free = publicEntries.filter((g) => g.freeEntry);
  assert.ok(free.length > 0, "no free entries — nothing for search engines");
  assert.ok(
    free.length < publicEntries.length / 2,
    "more than half the codex is free — the paywall is not doing much"
  );
});

test("findings reference real giants", () => {
  const slugs = new Set(publicEntries.map((g) => g.slug));
  for (const finding of findings) {
    if (!finding.relatedGiantSlug) continue;
    assert.ok(
      slugs.has(finding.relatedGiantSlug),
      `finding "${finding.id}" points at unknown giant "${finding.relatedGiantSlug}"`
    );
  }
});

// ---------------------------------------------------------------------------
// Deep entries: the structured format piloted on a few slugs before rollout.
// ---------------------------------------------------------------------------

const motifVocabulary = read("src/data/motifs.json");
const deep = master.filter((g) => g.sections);
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * Both length guards below exist to stop a paywalled entry being thin, which
 * their own failure messages say outright. A free entry is not sold, so the
 * rationale does not reach it: si-te-cah closes on two short paragraphs
 * because that is where its argument ends, and there is nothing to pay for.
 *
 * Scoped to paid entries rather than deleted, so the protection still applies
 * everywhere money changes hands. Sections must still exist and be non-empty
 * on every entry, free or not, which the separate test below enforces.
 */
const paidDeep = deep.filter((g) => !g.restrained && !g.freeEntry);

test("paid entries carry all three sections, none of them token", () => {
  for (const giant of paidDeep) {
    for (const key of ["story", "origins", "disputed"]) {
      const text = giant.sections[key];
      assert.ok(text?.trim(), `${giant.slug}: section "${key}" is empty`);
      assert.ok(
        words(text) >= 80,
        `${giant.slug}: section "${key}" is only ${words(text)} words, too thin to be worth paying for`
      );
    }
  }
});

test("free entries still carry three non-empty sections", () => {
  for (const giant of deep.filter((g) => g.freeEntry)) {
    for (const key of ["story", "origins", "disputed"]) {
      assert.ok(
        giant.sections[key]?.trim(),
        `${giant.slug}: section "${key}" is empty`
      );
    }
  }
});

test("paid entries put real substance behind the paywall", () => {
  for (const giant of paidDeep) {
    const paid = words(Object.values(giant.sections).join(" "));
    assert.ok(
      paid >= 350,
      `${giant.slug}: only ${paid} words behind the paywall`
    );
  }
});

test("restrained entries are free, and say why they are short", () => {
  for (const giant of master.filter((g) => g.restrained)) {
    assert.ok(
      giant.freeEntry,
      `${giant.slug}: a restrained entry is behind the paywall — we would be charging for an admission`
    );
    assert.ok(
      giant.sections?.disputed,
      `${giant.slug}: restrained but gives no account of why`
    );
    assert.ok(
      /cannot|not able|unreliab|not identif|do not know/i.test(
        giant.sections.disputed
      ),
      `${giant.slug}: restrained entries must state the limitation plainly`
    );
  }
});

test("every entry still carries all three sections", () => {
  for (const giant of master) {
    assert.ok(giant.sections, `${giant.slug}: no sections`);
    for (const key of ["story", "origins", "disputed"]) {
      assert.ok(
        giant.sections[key]?.trim(),
        `${giant.slug}: section "${key}" is empty`
      );
    }
  }
});

test("motifs come from the controlled vocabulary", () => {
  for (const giant of master) {
    for (const key of giant.motifs ?? []) {
      assert.ok(
        motifVocabulary[key],
        `${giant.slug}: motif "${key}" is not in motifs.json`
      );
    }
  }
});

test("motif vocabulary has no duplicate names", () => {
  const names = Object.values(motifVocabulary).map((m) => m.name);
  assert.equal(
    new Set(names).size,
    names.length,
    "two motifs share a display name, which would read as a bug on the page"
  );
});

test("deep entries do not echo the mystery note back at the reader", () => {
  const norm = (s) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  for (const giant of deep) {
    const body = norm(
      giant.fullDescription + " " + Object.values(giant.sections).join(" ")
    );
    const opening = norm(giant.mysteryNote).split(" ").slice(0, 6).join(" ");
    if (opening.length <= 15) continue;
    assert.ok(
      !body.includes(opening),
      `${giant.slug}: the mystery note repeats text already in the entry`
    );
  }
});

test("editorial notes never reach published prose", () => {
  for (const giant of deep) {
    const all = giant.fullDescription + " " + Object.values(giant.sections).join(" ");
    assert.ok(
      !/\bThis entry (refuses|keeps|treats|presents)\b/.test(all),
      `${giant.slug}: authoring commentary leaked into the entry`
    );
  }
});

test("deep entries cite something specific", () => {
  const vague =
    /^(.*\btradition\b.*|Historical compilations|Folklore|Local legend|Various|Regional folklore)$/i;
  for (const giant of deep) {
    const specific = giant.sources.filter((s) => !vague.test(s.trim()));
    assert.ok(
      specific.length >= 1,
      `${giant.slug}: every source is a vague category, none is a citation`
    );
  }
});

test("lore file carries sections; the public catalog never does", () => {
  for (const giant of deep) {
    assert.ok(
      lore[giant.slug].sections,
      `${giant.slug}: sections missing from the lore file`
    );
  }
  for (const entry of publicEntries) {
    assert.ok(
      !("sections" in entry),
      `${entry.slug}: sections leaked into the client catalog`
    );
  }
});

test("heightMeters is generated and plausible where set", () => {
  for (const giant of publicEntries) {
    assert.ok(
      "heightMeters" in giant,
      `${giant.slug}: heightMeters missing — run \`npm run build:data\``
    );
    const m = giant.heightMeters;
    if (m === null) continue;
    assert.ok(
      typeof m === "number" && m > 0.5 && m <= 100,
      `${giant.slug}: implausible heightMeters ${m}`
    );
  }
});

test("every entry has a fate line, and it stays out of the public catalog", () => {
  for (const giant of master) {
    assert.ok(giant.fate?.trim(), `${giant.slug}: fate is missing or empty`);
  }
  for (const entry of publicEntries) {
    assert.ok(
      !("fate" in entry),
      `${entry.slug}: fate leaked into the client catalog`
    );
  }
  for (const slug of Object.keys(lore)) {
    assert.ok(lore[slug].fate?.trim(), `${slug}: fate missing from lore file`);
  }
});

const withScholarlyNotes = master.filter((g) => g.scholarlyNotes);

test("scholarlyNotes stays out of the public catalog; only the boolean flag ships", () => {
  for (const entry of publicEntries) {
    assert.ok(
      !("scholarlyNotes" in entry) && !("scholarlySources" in entry),
      `${entry.slug}: scholarlyNotes leaked into the client catalog`
    );
  }
  for (const giant of master) {
    assert.equal(
      publicEntries.find((e) => e.slug === giant.slug).hasScholarlyNotes,
      Boolean(giant.scholarlyNotes?.length),
      `${giant.slug}: hasScholarlyNotes flag doesn't match whether scholarlyNotes is actually set`
    );
  }
});

test("scholarlyNotes entries carry a heading and a substantial body", () => {
  for (const giant of withScholarlyNotes) {
    assert.ok(
      giant.scholarlyNotes.length > 0,
      `${giant.slug}: scholarlyNotes is present but empty`
    );
    for (const note of giant.scholarlyNotes) {
      assert.ok(note.heading?.trim(), `${giant.slug}: a scholarly note has no heading`);
      assert.ok(
        words(note.body) >= 20,
        `${giant.slug}: scholarly note "${note.heading}" is only ${words(note.body)} words`
      );
    }
    assert.ok(
      lore[giant.slug].scholarlyNotes,
      `${giant.slug}: scholarlyNotes missing from the lore file`
    );
  }
});

test("glossary entries are short by design and well-formed", () => {
  const seenAliases = new Map();
  for (const [key, entry] of Object.entries(glossary)) {
    assert.ok(entry.term?.trim(), `glossary["${key}"]: no display term`);
    assert.ok(
      Array.isArray(entry.aliases) && entry.aliases.length > 0,
      `glossary["${key}"]: no aliases to match against`
    );
    assert.ok(
      words(entry.definition) <= 60,
      `glossary["${key}"]: definition is ${words(entry.definition)} words — tooltips are meant to be 2-3 sentences, not an essay`
    );
    for (const alias of entry.aliases) {
      const lower = alias.toLowerCase();
      assert.equal(alias, lower, `glossary["${key}"]: alias "${alias}" should be lowercase`);
      const owner = seenAliases.get(lower);
      assert.ok(
        !owner || owner === key,
        `glossary["${key}"]: alias "${alias}" already belongs to "${owner}" — an ambiguous match`
      );
      seenAliases.set(lower, key);
    }
  }
});
