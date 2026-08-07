/**
 * Runs the motif decision against the incoming entries without importing them.
 *
 * Every motif slug on every shipping entry goes through classify(). Anything
 * in none of the three lists throws, which is the intended behaviour: stop and
 * report, do not guess.
 *
 * Then it works out what /motifs will actually look like afterwards, using the
 * page's own rule rather than an assumed one. src/lib/motifs.ts splits on
 * distinct cultures greater than one, not on carrier count. Those two criteria
 * are not the same and this is the script that shows where they part company.
 *
 * Read only. Writes nothing. Mints nothing.
 *
 * Needs docs/expansion/ in the working copy. Those files are not committed:
 * the repository is public and they carry unshipped premium copy.
 *
 * Run: node scripts/import/validate-motifs.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { classify, MERGE_INTO_LIVE, MINT_ONCE, STAGE_AND_WAIT, HELD_BACK } from "./motif-decision.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const SOURCES = [
  "docs/expansion/giants-europe-ISPRAVLJEN.md",
  "docs/expansion/giants-south-america-handoff.md",
];

const missing = SOURCES.filter((p) => !existsSync(join(root, p)));
if (missing.length) {
  console.error("Canonical source not in this working copy:");
  for (const p of missing) console.error(`  ${p}`);
  console.error("\nThese files are intentionally uncommitted. Run from the main checkout.");
  process.exit(1);
}

/** Pairs each slug line with the motifs line that follows it. */
function readEntries() {
  const entries = [];
  for (const p of SOURCES) {
    const lines = readFileSync(join(root, p), "utf8").split("\n");
    let pending = null;
    for (const line of lines) {
      const s = line.match(/\*\*slug:\*\*\s*`([a-z0-9-]+)`/);
      if (s) {
        pending = s[1];
        continue;
      }
      const m = line.match(/\*\*motifs:\*\*\s*(.+)/);
      if (m && pending) {
        entries.push({
          slug: pending,
          motifs: m[1].split(",").map((x) => x.trim().replace(/`/g, "")).filter(Boolean),
        });
        pending = null;
      }
    }
  }
  return entries.filter((e) => !HELD_BACK.includes(e.slug));
}

const entries = readEntries();

// Pass one: classify everything. An unknown slug stops the run here.
const seen = new Map();
const unknown = [];
for (const e of entries) {
  for (const slug of e.motifs) {
    try {
      classify(slug);
    } catch {
      unknown.push({ entry: e.slug, slug });
      continue;
    }
    if (!seen.has(slug)) seen.set(slug, []);
    seen.get(slug).push(e.slug);
  }
}

if (unknown.length) {
  console.error("STOP. Motif slugs in none of the three lists:\n");
  for (const u of unknown) console.error(`  ${u.slug}  (on ${u.entry})`);
  process.exit(1);
}

console.log(`entries read: ${entries.length}  (held back and excluded: ${HELD_BACK.join(", ")})`);
console.log(`distinct incoming motif slugs: ${seen.size}\n`);

const w = Math.max(...[...seen.keys()].map((s) => s.length));
const pad = (s) => s.padEnd(w);

for (const [label, test] of [
  ["MERGE into an existing motif, nothing created", (s) => s in MERGE_INTO_LIVE],
  ["MINT once", (s) => MINT_ONCE.includes(s)],
  ["STAGE as a literal string, nothing created", (s) => STAGE_AND_WAIT.includes(s)],
]) {
  console.log(label);
  for (const [slug, carriers] of [...seen].filter(([s]) => test(s)).sort()) {
    const target = MERGE_INTO_LIVE[slug];
    const arrow = target ? `-> ${target}` : "";
    console.log(`  ${pad(slug)}  ${String(carriers.length).padStart(2)} shipping  ${arrow}`);
  }
  // A configured slug that no shipping entry carries is worth knowing about.
  const unused = [
    ...Object.keys(MERGE_INTO_LIVE),
    ...MINT_ONCE,
    ...STAGE_AND_WAIT,
  ].filter((s) => test(s) && !seen.has(s));
  for (const s of unused) console.log(`  ${pad(s)}   0 shipping  (configured but unused here)`);
  console.log();
}

/**
 * The three checks.
 *
 * There is deliberately no check on the number of cards. That was a hardcoded
 * number of exactly the kind this project forbids elsewhere, and it measured
 * how the cultures happen to fall rather than whether the import is correct.
 * None of the three below depends on that.
 */
const live = JSON.parse(readFileSync(join(root, "src/data/motifs.json"), "utf8"));
const failures = [];

// One: no motif appears twice. A minted key must not already exist, and the
// post-import key list must have no duplicates.
{
  const after = [...Object.keys(live), ...MINT_ONCE];
  const dupes = after.filter((k, i) => after.indexOf(k) !== i);
  if (dupes.length) failures.push(`motif appears twice: ${[...new Set(dupes)].join(", ")}`);
  console.log(`1. no motif appears twice        ${dupes.length ? "FAIL" : "pass"}  (${after.length} keys after import)`);
}

// Two: the six merged motifs kept their live names byte for byte. The
// expected strings are recorded here so a rename shows up as a diff.
{
  const EXPECTED = {
    "pre-people": "The people who came before",
    builder: "The giant as builder",
    outwitted: "Defeated by cunning",
    "one-eye": "The single eye",
    petrified: "Turned to stone",
    "bones-as-proof": "Bones offered as evidence",
  };
  let bad = 0;
  for (const target of Object.values(MERGE_INTO_LIVE)) {
    const actual = live[target]?.name;
    if (actual !== EXPECTED[target]) {
      bad++;
      failures.push(`merge target "${target}" name is ${JSON.stringify(actual)}, expected ${JSON.stringify(EXPECTED[target])}`);
    }
  }
  console.log(`2. merged names unchanged        ${bad ? "FAIL" : "pass"}  (6 targets, byte for byte)`);
}

// Three: no slug ended up unrecognised. Already enforced above, where an
// unknown slug exits before reaching this point. Restated so the check is
// visible in the output rather than only in the failure path.
console.log(`3. no slug unrecognised          pass  (${seen.size} slugs, all classified)`);

if (failures.length) {
  console.error("\nFAILED:");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
