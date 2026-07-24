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

const LORE_FIELDS = ["fullDescription", "mysteryNote"];

export function splitMaster(master) {
  const publicEntries = [];
  const lore = {};

  for (const giant of master) {
    const entry = {};
    for (const [key, value] of Object.entries(giant)) {
      if (!LORE_FIELDS.includes(key)) entry[key] = value;
    }
    entry.freeEntry = giant.freeEntry === true;
    publicEntries.push(entry);

    lore[giant.slug] = {
      fullDescription: giant.fullDescription,
      mysteryNote: giant.mysteryNote,
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
