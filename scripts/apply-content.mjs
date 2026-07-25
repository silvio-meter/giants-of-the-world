/**
 * Applies a batch of deep-entry content to the master data file.
 *
 * Each batch module exports { slug: { motifs, open, story, origins, disputed,
 * sources } }. The `open` string replaces fullDescription — for deep entries
 * that field is only the free preview, and the rest of the old prose is
 * superseded by the sections.
 *
 * Usage: node scripts/apply-content.mjs greek norse …
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MASTER = join(root, "src/data/giants.json");

const batches = process.argv.slice(2);
if (batches.length === 0) {
  console.error("usage: node scripts/apply-content.mjs <batch> [batch…]");
  process.exit(1);
}

const master = JSON.parse(readFileSync(MASTER, "utf8"));
const bySlug = new Map(master.map((g) => [g.slug, g]));
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

let applied = 0;

for (const name of batches) {
  const { default: entries } = await import(`./content/${name}.mjs`);

  for (const [slug, c] of Object.entries(entries)) {
    const giant = bySlug.get(slug);
    if (!giant) throw new Error(`${name}: unknown slug "${slug}"`);

    giant.fullDescription = c.open.trim();
    giant.sections = {
      story: c.story.trim(),
      origins: c.origins.trim(),
      disputed: c.disputed.trim(),
    };
    giant.motifs = c.motifs;
    if (c.sources) giant.sources = c.sources;
    if (c.mysteryNote) giant.mysteryNote = c.mysteryNote;

    const paid = words(Object.values(giant.sections).join(" "));
    console.log(
      `  ${slug.padEnd(22)} preview ${String(words(giant.fullDescription)).padStart(3)}w  paid ${String(paid).padStart(4)}w  motifs ${c.motifs.length}`
    );
    applied++;
  }
}

writeFileSync(MASTER, JSON.stringify(master, null, 2) + "\n");
console.log(`\napplied ${applied} entries; ${master.filter((g) => g.sections).length}/${master.length} now deep`);
