/**
 * Collision run, second pass, with the third key complete.
 *
 * The first pass had slugs only, so the third key ran on half its inputs: the
 * name half against live name and alsoKnownAs, with no culture at all. This
 * pass reads culture and display name for all 32 from
 * docs/expansion/kljuc3-kultura-imena.md, so the third key runs whole.
 *
 * Read only. Changes nothing. Not wired into CI.
 *
 * No expected total is written anywhere in this file. A detector told how many
 * things to find is a detector that will find them. Judge it by whether the
 * hits you already expect appear inside the output.
 *
 * Known blind spot, stated rather than papered over. The first pass caught
 * stallu against live stallo only because the live entry carries Stállu in
 * alsoKnownAs. The incoming set has no alias field, so the same mechanism
 * cannot fire in the other direction. If an incoming entry carries a variant
 * spelling inside its own prose rather than its metadata, nothing here can
 * see it.
 *
 * Run: node fixtures/baseline-2026-08-05/collision-rerun-key3.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const live = JSON.parse(readFileSync(join(root, "src/data/giants.json"), "utf8"));

/** Parsed from the canonical table, not retyped, so the two cannot drift. */
function readIncoming() {
  const md = readFileSync(
    join(root, "docs/expansion/kljuc3-kultura-imena.md"),
    "utf8"
  );
  const rows = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^\|\s*(~~)?`([a-z0-9-]+)`/);
    if (!m) continue;
    // A struck-through slug is held back and does not import.
    if (m[1]) continue;
    const cells = line.split("|").map((c) => c.trim());
    rows.push({ slug: m[2], culture: cells[2], region: cells[3], name: cells[4] });
  }
  return rows;
}

const incoming = readIncoming();

/** Relationships rather than collisions. Each needs a human decision. */
const DECLARED = {
  gigantes: {
    live: ["alcyoneus", "porphyrion", "polybotes", "enceladus"],
    reason: "handoff calls this a parent entry over live individual Gigantes",
  },
  "troll-iceland": {
    live: ["thrym", "skrymir", "hrungnir"],
    reason: "collective Norse entry overlapping live individual jotnar",
  },
  fomorians: { live: ["balor"], reason: "collective entry over a live individual member" },
  "te-kahui-tipua": { live: ["maero"], reason: "its own copy names maero" },
  jentilak: {
    live: ["jentilak", "olentzero"],
    reason: "two separate live pages that may both be in scope",
  },
};

const fold = (s) =>
  (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/** Culture strings are lists, so compare the parts, not the whole string. */
const cultureParts = (s) =>
  (s ?? "")
    .split(/[,/]| and /)
    .map((x) => fold(x))
    .filter((x) => x.length > 2);

const rows = [];
const add = (a, b, key, reason) => {
  if (rows.some((r) => r[0] === a && r[1] === b && r[2] === key)) return;
  rows.push([a, b, key, reason]);
};

for (const inc of incoming) {
  const incSlugFold = fold(inc.slug);
  const incNameFold = fold(inc.name);
  const incCultures = cultureParts(inc.culture);

  for (const g of live) {
    // Key 1: exact slug.
    if (inc.slug === g.slug) {
      add(inc.slug, g.slug, "exact slug", "identical slug, the same page would be written twice");
      continue;
    }

    // Key 2: ASCII folded slug.
    if (incSlugFold === fold(g.slug)) {
      add(inc.slug, g.slug, "folded slug", "slugs differ only by accents or punctuation");
      continue;
    }

    // Key 3, now whole: culture plus display name.
    const liveNames = [g.name, ...(g.alsoKnownAs ?? [])];
    const sharedCulture = cultureParts(g.culture).some((c) => incCultures.includes(c));

    for (const raw of liveNames) {
      const n = fold(raw);
      if (!n) continue;
      const which = raw === g.name ? "name" : `alias "${raw}"`;

      if (incNameFold === n) {
        add(
          inc.slug,
          g.slug,
          sharedCulture ? "culture + name" : "name only",
          sharedCulture
            ? `same culture and display name equals live ${which}`
            : `display name equals live ${which}, but cultures differ, so possibly two different beings`
        );
      } else if (
        n.length >= 4 &&
        incNameFold.length >= 4 &&
        (n.includes(incNameFold) || incNameFold.includes(n))
      ) {
        add(
          inc.slug,
          g.slug,
          sharedCulture ? "culture + name (weak)" : "name (weak)",
          `one of the display names contains the other${sharedCulture ? ", and the cultures overlap" : ""}`
        );
      }
    }

    // Weak: same culture and a shared distinctive word between the slugs.
    if (sharedCulture) {
      for (const t of inc.slug.split("-").filter((t) => t.length >= 5)) {
        if (g.slug.split("-").some((u) => fold(u) === fold(t))) {
          add(inc.slug, g.slug, "culture + slug word (weak)", `same culture and both slugs contain "${t}"`);
        }
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
const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
const line = (c) => c.map((x, i) => String(x).padEnd(w[i])).join("  ").trimEnd();

console.log(line(head));
console.log(w.map((x) => "-".repeat(x)).join("  "));
for (const r of rows) console.log(line(r));
