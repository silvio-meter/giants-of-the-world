/**
 * Freezes the line between the free preview and the paid text.
 *
 * getFreePreview returns the first chunk of fullDescription, and when that
 * text has no blank line the chunk is the first two sentences. So the boundary
 * is decided by sentence count, and it is invisible to whoever is editing the
 * prose. Add half a sentence to an entry and the cut moves, quietly, on the
 * one screen where a non-paying reader decides whether to pay.
 *
 * This does not judge whether a preview is any good, which a machine cannot
 * do. It asserts only that no preview changed without someone looking. When it
 * fails, read the diff, decide whether the new cut is a place worth stopping,
 * then run:
 *
 *   node scripts/update-free-preview-snapshot.mjs
 *
 * Same principle as the em dash guards: it does not prevent a decision, it
 * prevents a decision happening by accident.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { buildFreePreviewSnapshot, SNAPSHOT_PATH } from "./free-preview-snapshot.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const recorded = JSON.parse(readFileSync(join(root, SNAPSHOT_PATH), "utf8"));
const current = buildFreePreviewSnapshot();

const REGENERATE = "Read the change, then run: node scripts/update-free-preview-snapshot.mjs";

test("no paid entry's free preview changed", () => {
  const moved = Object.keys(current)
    .filter((slug) => slug in recorded && recorded[slug] !== current[slug])
    .map(
      (slug) =>
        `${slug}\n  was: ${JSON.stringify(recorded[slug])}\n  now: ${JSON.stringify(current[slug])}`
    );

  assert.deepEqual(
    moved,
    [],
    `the free preview moved on ${moved.length} entr${moved.length === 1 ? "y" : "ies"}, ` +
      `so the paywall boundary is not where it was:\n\n${moved.join("\n\n")}\n\n${REGENERATE}`
  );
});

test("every paid entry has a recorded preview", () => {
  // A new paid entry has a preview nobody has read yet, which is the state
  // this guard exists to catch, so it fails until someone records it.
  const unrecorded = Object.keys(current).filter((slug) => !(slug in recorded));
  assert.deepEqual(
    unrecorded,
    [],
    `these paid entries have no recorded free preview, so nobody has looked at where they cut:\n  ` +
      unrecorded.map((s) => `${s}: ${JSON.stringify(current[s])}`).join("\n  ") +
      `\n\n${REGENERATE}`
  );
});

test("the snapshot holds no entry that is gone or now free", () => {
  const stale = Object.keys(recorded).filter((slug) => !(slug in current));
  assert.deepEqual(
    stale,
    [],
    `the snapshot records entries that are no longer paid, so it is stale:\n  ${stale.join("\n  ")}` +
      `\n\n${REGENERATE}`
  );
});
