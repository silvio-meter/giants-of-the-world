/**
 * Collision dry run, read only.
 *
 * Compares the 32 incoming slugs against the live catalogue on three keys and
 * prints one table. It changes nothing. It is kept beside the baseline freeze
 * because it is evidence from the same moment, not a test, and it is not
 * wired into CI.
 *
 * There is deliberately no expected total anywhere in this file. A detector
 * told how many things to find is a detector that will find them. Judge the
 * output by whether the hits you already expect appear inside it.
 *
 * Weak candidates are printed rather than filtered. A false positive costs
 * one line of reading. A false negative costs a duplicate page in a catalogue
 * whose whole claim is care.
 *
 * Run: node fixtures/baseline-2026-08-05/collision-dry-run.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const live = JSON.parse(readFileSync(join(root, "src/data/giants.json"), "utf8"));

const INCOMING = `
jentilak gargantua mouros dragonja daidarabotchi baqbaq-devi
rubezahl gigantes patagonian-giants katallani waligora-wyrwidab
milzinai ispolini stallu troll-iceland kalev-kalevipoeg suur-toll
fomorians gogmagog bendigeidfran ysbaddaden cormoran
tombe-dei-giganti nemri klek te-kahui-tipua uriasi
croatian-giants-lesser british-giants-lesser koljo
santa-elena-giants mapinguari
`.trim().split(/\s+/);

/**
 * Relationships rather than collisions, carried in explicitly because a
 * string comparison cannot see them. Each needs a human decision.
 */
const DECLARED = {
  gigantes: {
    live: ["alcyoneus", "porphyrion", "polybotes", "enceladus"],
    reason: "handoff calls this a parent entry over live individual Gigantes",
  },
  "troll-iceland": {
    live: ["thrym", "skrymir", "hrungnir"],
    reason: "collective Norse entry overlapping live individual jotnar",
  },
  fomorians: {
    live: ["balor"],
    reason: "collective entry over a live individual member",
  },
  "te-kahui-tipua": {
    live: ["maero"],
    reason: "its own copy names maero",
  },
  jentilak: {
    live: ["jentilak", "olentzero"],
    reason: "two separate live pages that may both be in scope",
  },
};

/** Strip diacritics and punctuation so accented or transliterated variants meet. */
const fold = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/** Slug to the words a display name would plausibly be built from. */
const tokens = (s) => s.split("-").filter((t) => t.length > 2);

const rows = [];
const add = (incoming, matched, key, reason) => {
  if (rows.some((r) => r[0] === incoming && r[1] === matched && r[2] === key)) return;
  rows.push([incoming, matched, key, reason]);
};

for (const inc of INCOMING) {
  const incFolded = fold(inc);
  const incTokens = tokens(inc);

  for (const g of live) {
    // Key 1: exact slug.
    if (inc === g.slug) {
      add(inc, g.slug, "exact slug", "identical slug, same page would be written twice");
      continue;
    }

    // Key 2: ASCII folded slug.
    if (incFolded === fold(g.slug)) {
      add(inc, g.slug, "folded slug", "slugs differ only by accents or punctuation");
      continue;
    }

    // Key 3: culture plus display name.
    //
    // The incoming set is slugs only, with no culture and no display name
    // supplied, so the culture half of this key cannot be applied at all.
    // What runs here is the name half: the incoming slug's words against the
    // live display name and its alsoKnownAs variants, folded. That still
    // catches the same being filed under two spellings, which is the case
    // this key exists for, but it cannot catch two different beings that
    // share a name and are told apart only by culture.
    const liveNames = [g.name, ...(g.alsoKnownAs ?? [])];
    for (const nameRaw of liveNames) {
      const name = fold(nameRaw);
      if (!name) continue;
      const which = nameRaw === g.name ? "name" : `alias "${nameRaw}"`;

      if (incFolded === name) {
        add(inc, g.slug, "name", `incoming slug equals live ${which}`);
      } else if (
        incTokens.length > 0 &&
        incTokens.every((t) => name.includes(fold(t)))
      ) {
        add(inc, g.slug, "name", `every word of the incoming slug appears in live ${which}`);
      } else if (
        incFolded.length >= 5 &&
        (name.includes(incFolded) || incFolded.includes(name)) &&
        name.length >= 4
      ) {
        add(inc, g.slug, "name (weak)", `one of incoming slug and live ${which} contains the other`);
      }
    }

    // Weak: a shared distinctive word between the two slugs.
    for (const t of incTokens) {
      if (t.length >= 5 && tokens(g.slug).some((u) => fold(u) === fold(t))) {
        add(inc, g.slug, "slug word (weak)", `both slugs contain "${t}"`);
      }
    }
  }
}

for (const [inc, { live: targets, reason }] of Object.entries(DECLARED)) {
  for (const t of targets) {
    const exists = live.some((g) => g.slug === t);
    add(inc, t, "declared", exists ? reason : `${reason} (no live entry with this slug)`);
  }
}

rows.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));

const head = ["incoming", "live", "key", "reason"];
const width = head.map((h, i) =>
  Math.max(h.length, ...rows.map((r) => String(r[i]).length))
);
const line = (cells) =>
  cells.map((c, i) => String(c).padEnd(width[i])).join("  ").trimEnd();

console.log(line(head));
console.log(width.map((w) => "-".repeat(w)).join("  "));
for (const r of rows) console.log(line(r));
