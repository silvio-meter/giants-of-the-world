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
];

/**
 * Rough metres for the size chart, derived once here from the free-text
 * `height` field rather than re-guessed in the browser on every render.
 * Returns null when the tradition gives nothing usable — Paul Bunyan is "as
 * tall as the tale requires", which is not a measurement.
 */
export function estimateMeters(height) {
  if (!height) return null;
  const l = height.toLowerCase();
  if (/cosmic|titanic|vast/.test(l)) return 30;
  if (l.includes("mountain")) return 25;
  if (/cyclopean|gigantic|colossal/.test(l)) return 12;
  if (/18 (feet|ft)|12 cubit/.test(l)) return 5.5;
  if (/15 feet|12[–-]15/.test(l)) return 4;
  if (/10-foot|ten-foot/.test(l)) return 3;
  if (l.includes("six cubits")) return 2.9;
  if (l.includes("four cubits")) return 1.8;
  const feet = l.match(/(\d+(?:\.\d+)?)\s*(?:feet|ft)/);
  if (feet) return Number((parseFloat(feet[1]) * 0.3048).toFixed(2));
  const metres = l.match(/(\d+(?:\.\d+)?)\s*m(?:eter)?s?\b/);
  if (metres) return parseFloat(metres[1]);
  if (/giant|j\u00f6tunn|jotunn/.test(l)) return 4.5;
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
    entry.hasScholarlyNotes = Boolean(giant.scholarlyNotes?.length);
    publicEntries.push(entry);

    lore[giant.slug] = {
      fullDescription: giant.fullDescription,
      mysteryNote: giant.mysteryNote,
      fate: giant.fate,
      ...(giant.sections ? { sections: giant.sections } : {}),
      ...(giant.scholarlyNotes
        ? {
            scholarlyNotes: giant.scholarlyNotes,
            scholarlySources: giant.scholarlySources ?? [],
          }
        : {}),
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
