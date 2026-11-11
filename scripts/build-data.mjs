/**
 * Generates the two runtime data files from the single master file.
 *
 *   src/data/giants.json          (master — edit this one)
 *     ├─> src/data/giants.public.json   catalog, safe for the client bundle
 *     └─> src/data/giants.lore.json     paid lore, server-only
 *
 * Lore is stripped from the public file for every entry. The `freeEntry` flag
 * only travels to the client so the UI knows an entry is open; the decision to
 * render lore without an auth check is made server-side in the page.
 *
 * Run: npm run build:data   (also runs as part of `npm run verify`)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MASTER = join(root, "src/data/giants.json");
const PUBLIC_OUT = join(root, "src/data/giants.public.json");
const LORE_OUT = join(root, "src/data/giants.lore.json");

const LORE_FIELDS = [
  "fullDescription",
  "mysteryNote",
  "sections",
  "fate",
  "scholarlyNotes",
  "scholarlySources",
  // The chain of custody. Its claim and verdict are free and travel as a
  // derived summary below; the rungs, the floor and every evidence URL are
  // paid and must never reach giants.public.json.
  "chain",
  // Editorial / legal handling notes (publishable, living culture, etc.).
  // Internal only — never the client catalogue bundle.
  "handling",
  // Curated Session Prep seeds (pilots). Same strip path as fullDescription.
  "sessionPrep",
];

/**
 * Metres for the size chart, derived once here from the free-text `height`
 * field. A number comes back ONLY for a measure the source actually states
 * in a unit: feet/foot/ft, metres/meters/m, or cubits (with "and a span").
 * Descriptive words (Giant, Jötunn, Cosmic, Titanic, Vast, Mountain,
 * Cyclopean, Gigantic, Colossal...) are not measurements and return null;
 * the chart then says "No measured height in the sources."
 *
 * Also null:
 * - a claim or an unverified report ("claimed 12 to 15 feet", "Reports claim
 *   ~12-15 feet (unverified)"): the chart must not draw a rumour as a size,
 *   nor pick between a claim and a later measurement (Patagonian giants,
 *   Kandahar, Guanche);
 * - a dimension of an object rather than a body ("iron bed: ~9 cubits long").
 *
 * Cubit: 0.45 m, span: half a cubit, so Goliath's six cubits and a span is
 * about 2.9 m and four cubits and a span about 2.0 m.
 */
const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20,
};
const NUM = `(\\d+(?:\\.\\d+)?|${Object.keys(NUMBER_WORDS).join("|")})`;
const CUBIT_M = 0.45;
const FOOT_M = 0.3048;

function toNumber(s) {
  return NUMBER_WORDS[s] ?? parseFloat(s);
}

export function estimateMeters(height) {
  if (!height) return null;
  const l = height.toLowerCase();
  if (/\bclaim|\bunverified\b|\breports?\b|\brumou?r/.test(l)) return null;
  if (/\blong\b|\bwide\b|\bbroad\b/.test(l)) return null;
  const round = (m) => Number(m.toFixed(1));
  const cubits = l.match(new RegExp(`\\b${NUM}\\s*cubits?(\\s+and\\s+a\\s+span)?`));
  if (cubits) {
    return round((toNumber(cubits[1]) + (cubits[2] ? 0.5 : 0)) * CUBIT_M);
  }
  const feet = l.match(new RegExp(`\\b${NUM}\\s*(?:feet|foot|ft)\\b`));
  if (feet) return round(toNumber(feet[1]) * FOOT_M);
  // Both spellings: the catalogue writes "metres".
  const metres = l.match(new RegExp(`\\b${NUM}\\s*(?:m|metres?|meters?)\\b`));
  if (metres) return round(toNumber(metres[1]));
  return null;
}

export function splitMaster(master) {
  const publicEntries = [];
  const lore = {};

  for (const giant of master) {
    const entry = {};
    for (const [key, value] of Object.entries(giant)) {
      if (!LORE_FIELDS.includes(key)) entry[key] = value;
    }
    entry.freeEntry = giant.freeEntry === true;
    entry.heightMeters = estimateMeters(giant.height);
    // A second textual tradition (Goliath): the chart shows both or none.
    if (giant.heightAlt) {
      entry.heightAlt = {
        ...giant.heightAlt,
        meters: estimateMeters(giant.heightAlt.height),
      };
    }
    entry.hasScholarlyNotes = Boolean(giant.scholarlyNotes?.length);
    /**
     * The free half of the chain: the claim, and the one sentence of verdict.
     * A completed thought that opens a question, with the answer behind the
     * wall. Deliberately not the whole `chain` object, so no rung, no floor
     * and no evidence URL can ride along.
     */
    if (giant.chain) {
      entry.chainSummary = {
        claim: giant.chain.claim,
        verdict: giant.chain.verdict,
        rungCount: giant.chain.rungs?.length ?? 0,
      };
    }
    publicEntries.push(entry);

    lore[giant.slug] = {
      fullDescription: giant.fullDescription,
      mysteryNote: giant.mysteryNote,
      fate: giant.fate,
      ...(giant.sections ? { sections: giant.sections } : {}),
      ...(giant.chain ? { chain: giant.chain } : {}),
      ...(giant.scholarlyNotes
        ? {
            scholarlyNotes: giant.scholarlyNotes,
            scholarlySources: giant.scholarlySources ?? [],
          }
        : {}),
      ...(giant.handling ? { handling: giant.handling } : {}),
      ...(giant.sessionPrep ? { sessionPrep: giant.sessionPrep } : {}),
    };
  }

  return { publicEntries, lore };
}

function main() {
  const master = JSON.parse(readFileSync(MASTER, "utf8"));
  const { publicEntries, lore } = splitMaster(master);

  writeFileSync(PUBLIC_OUT, JSON.stringify(publicEntries, null, 2) + "\n");
  writeFileSync(LORE_OUT, JSON.stringify(lore, null, 2) + "\n");

  const free = publicEntries.filter((g) => g.freeEntry).length;
  console.log(
    `build-data: ${publicEntries.length} entries (${free} free) → giants.public.json + giants.lore.json`
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
