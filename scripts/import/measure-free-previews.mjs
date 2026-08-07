/**
 * What every paid entry actually gives away, against what it means to.
 *
 * getFreePreview() returns splitParagraphs(fullDescription)[0]. When the text
 * has no blank line, splitParagraphs falls through to grouping sentences two
 * at a time, so a first paragraph of three or more sentences is cut and the
 * rest goes behind the paywall. That cut lands on the only screen where a
 * non-paying reader decides whether to pay.
 *
 * This imports the real getFreePreview from src/lib/content.ts rather than
 * reimplementing it. A copy of the logic could drift from the original and
 * then measure the wrong thing confidently.
 *
 * Read only. Changes nothing.
 *
 * Run: node scripts/import/measure-free-previews.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { getFreePreview } from "../../src/lib/content.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const publicEntries = read("src/data/giants.public.json");
const lore = read("src/data/giants.lore.json");

/** The same sentence split splitParagraphs uses, so the counts agree with it. */
const sentences = (t) => (t.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? []).map((s) => s.trim());
const paragraphs = (t) => t.split(/\n\n+|\n/).map((p) => p.trim()).filter(Boolean);

const whole = [];
const cut = [];
const thin = [];

// Only paid entries reach LockedLore. A free entry renders the whole account
// through FullDescription, so getFreePreview never decides anything for it.
const paid = publicEntries.filter((g) => !g.freeEntry);

for (const g of paid) {
  const full = lore[g.slug].fullDescription;
  const firstPara = paragraphs(full)[0] ?? "";
  const preview = getFreePreview(full);
  const seen = sentences(preview);

  // Order matters. A one-sentence preview that is the entire paragraph has
  // lost nothing, so it belongs with the intact ones and is only noted for
  // its length. Testing thinness first would file it as a fault it is not.
  if (preview.trim() === firstPara) {
    whole.push({ slug: g.slug, n: seen.length, preview });
    if (!preview.trim() || seen.length <= 1) thin.push({ slug: g.slug, preview, n: seen.length });
    continue;
  }

  const rest = firstPara.slice(preview.trim().length).trim();
  cut.push({
    slug: g.slug,
    total: sentences(firstPara).length,
    lastSeen: seen[seen.length - 1],
    firstUnseen: sentences(rest)[0] ?? rest,
    withheld: sentences(rest).length,
  });
}

console.log(`paid entries measured: ${paid.length}  (free entries never use the preview path)`);
console.log(`
  preview is the whole first paragraph, nothing withheld   ${whole.length}
  preview is cut short                                     ${cut.length}
  of the intact ones, previews only one sentence long      ${thin.length}
`);

if (thin.length) {
  console.log("ONE SENTENCE LONG, BUT NOTHING IS LOST: the whole paragraph is that sentence\n");
  for (const t of thin) console.log(`  ${t.slug}\n    ${t.preview}\n`);
}

if (cut.length) {
  console.log("CUT SHORT: the last sentence a reader sees, then the first they do not\n");
  for (const c of cut.sort((a, b) => a.slug.localeCompare(b.slug))) {
    console.log(`${c.slug}  (${c.total} sentences, ${c.withheld} withheld)`);
    console.log(`   sees : ${c.lastSeen}`);
    console.log(`   loses: ${c.firstUnseen}`);
    console.log();
  }
}
