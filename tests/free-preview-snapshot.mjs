/**
 * Builds the free preview for every paid entry, exactly as the page serves it.
 *
 * Shared by the test and by the update script so the two cannot disagree about
 * what a snapshot is. It calls the real getFreePreview from src/lib/content.ts
 * rather than reimplementing the rule: a copy of that logic could drift and
 * then confidently record the wrong text.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { getFreePreview } from "../src/lib/content.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const SNAPSHOT_PATH = "tests/free-preview-snapshot.json";

export function buildFreePreviewSnapshot() {
  const publicEntries = JSON.parse(readFileSync(join(root, "src/data/giants.public.json"), "utf8"));
  const lore = JSON.parse(readFileSync(join(root, "src/data/giants.lore.json"), "utf8"));

  const snapshot = {};
  // Free entries render the whole account through FullDescription, so
  // getFreePreview never decides anything for them.
  for (const g of publicEntries.filter((e) => !e.freeEntry).sort((a, b) => a.slug.localeCompare(b.slug))) {
    snapshot[g.slug] = getFreePreview(lore[g.slug].fullDescription);
  }
  return snapshot;
}
