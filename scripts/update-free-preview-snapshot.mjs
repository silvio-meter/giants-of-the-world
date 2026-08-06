/**
 * Rewrites the free preview snapshot to match the catalog as it stands.
 *
 * Run this only after looking at what changed and deciding it is right. The
 * point of the snapshot is that the boundary between the free preview and the
 * paid text is invisible to whoever edits the prose: add half a sentence to an
 * entry and the cut moves silently. The test catches the move; a human decides
 * whether the new cut is a good place to stop.
 *
 * Regenerating without reading the diff turns the guard back off.
 *
 * Run: node scripts/update-free-preview-snapshot.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { buildFreePreviewSnapshot, SNAPSHOT_PATH } from "../tests/free-preview-snapshot.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, SNAPSHOT_PATH);

const before = (() => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
})();

const after = buildFreePreviewSnapshot();

const added = Object.keys(after).filter((s) => !(s in before));
const removed = Object.keys(before).filter((s) => !(s in after));
const changed = Object.keys(after).filter((s) => s in before && before[s] !== after[s]);

writeFileSync(path, JSON.stringify(after, null, 2) + "\n");

console.log(`snapshot written: ${Object.keys(after).length} paid entries`);
for (const s of added) console.log(`  added   ${s}`);
for (const s of removed) console.log(`  removed ${s}`);
for (const s of changed) {
  console.log(`  changed ${s}`);
  console.log(`     was: ${before[s]}`);
  console.log(`     now: ${after[s]}`);
}
if (!added.length && !removed.length && !changed.length) console.log("  no differences");
