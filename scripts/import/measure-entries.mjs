/**
 * Measures the expansion entries against the live data contract.
 *
 * Written because the ispolini canary did not fit, and the question that
 * matters is whether that is one short entry or the whole format. It is the
 * whole format.
 *
 * The contract, in scripts/verify-data.test.mjs:
 *
 *   every entry, free or paid, carries sections story, origins and disputed,
 *   all three non-empty
 *   every paid entry has at least 80 words in each of the three
 *   every paid entry has at least 350 words across the three combined
 *
 * The expansion format has four headings, FREE, PREMIUM, WHAT IS DISPUTED and
 * SOURCES. There is no origins heading in it at all, and WHAT IS DISPUTED is
 * optional in practice. So the most an entry can put behind the paywall is
 * PREMIUM plus WHAT IS DISPUTED, which is what this counts.
 *
 * Read only. Writes nothing.
 *
 * Run: node scripts/import/measure-entries.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const SOURCES = [
  "docs/expansion/giants-europe-ISPRAVLJEN.md",
  "docs/expansion/giants-south-america-handoff.md",
];

const PAID_TOTAL_MIN = 350;
const PAID_SECTION_MIN = 80;

const missing = SOURCES.filter((p) => !existsSync(join(root, p)));
if (missing.length) {
  console.error(`Canonical source not in this working copy: ${missing.join(", ")}`);
  console.error("These files are intentionally uncommitted. Run from the main checkout.");
  process.exit(1);
}

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

const rows = [];
for (const file of SOURCES) {
  let slug = null;
  let heading = null;
  let buckets = {};

  const flush = () => {
    if (!slug) return;
    const prem = words((buckets.PREMIUM ?? []).join(" "));
    const disp = words((buckets["WHAT IS DISPUTED"] ?? []).join(" "));
    rows.push({ slug, prem, disp, total: prem + disp });
  };

  for (const line of readFileSync(join(root, file), "utf8").split("\n")) {
    const s = line.match(/\*\*slug:\*\*\s*`([a-z0-9-]+)`/);
    if (s) {
      flush();
      slug = s[1];
      heading = null;
      buckets = {};
      continue;
    }
    const h = line.match(/^\*\*(FREE|PREMIUM|WHAT IS DISPUTED|SOURCES)\*\*/);
    if (h) {
      heading = h[1];
      buckets[heading] = [];
      continue;
    }
    if (heading && line.trim()) buckets[heading].push(line.trim());
  }
  flush();
}

const w = Math.max(...rows.map((r) => r.slug.length));
console.log(
  `${"slug".padEnd(w)}  PREMIUM  DISPUTED  TOTAL  clears ${PAID_TOTAL_MIN}?`
);
for (const r of rows.sort((a, b) => a.total - b.total)) {
  console.log(
    `${r.slug.padEnd(w)}  ${String(r.prem).padStart(7)}  ${String(r.disp).padStart(8)}  ` +
      `${String(r.total).padStart(5)}  ${r.total >= PAID_TOTAL_MIN ? "yes" : "NO"}`
  );
}

const short = rows.filter((r) => r.total < PAID_TOTAL_MIN);
const noDisputed = rows.filter((r) => r.disp === 0);
const thinDisputed = rows.filter((r) => r.disp > 0 && r.disp < PAID_SECTION_MIN);

console.log(`
entries measured                          ${rows.length}
short of the ${PAID_TOTAL_MIN} word paywall floor       ${short.length}
with no WHAT IS DISPUTED at all           ${noDisputed.length}
with one under ${PAID_SECTION_MIN} words                   ${thinDisputed.length}
with an origins section                   0, the format has no such heading`);
