/**
 * Giants Bestiary Vol. 1 itch.io buy links (18 Nov 2026).
 * The 12 slugs must resolve in the catalogue and must not be held.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CATALOGUE_HOLD_SLUGS,
  NEVER_OPEN_SLUGS,
  isCatalogueHeld,
  isNeverOpen,
} from "../src/lib/catalogue-hold.ts";
import {
  ITCH_BUY_LABEL,
  ITCH_HERO_BUY_LABEL,
  ITCH_URL,
  VOL1_ENTRY_LINK_LABEL,
  VOL1_SLUGS,
  isInBestiaryVol1,
} from "../src/lib/bestiary.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const master = JSON.parse(read("src/data/giants.json"));
const bySlug = new Map(master.map((g) => [g.slug, g]));

test("Vol. 1 itch URL and buy-link copy are exact", () => {
  assert.equal(ITCH_URL, "https://logosom.itch.io/giants-bestiary-vol-1");
  assert.equal(ITCH_BUY_LABEL, "Giants Bestiary Vol. 1 ($6 on itch.io)");
  assert.equal(ITCH_HERO_BUY_LABEL, "Giants Bestiary Vol. 1 · $6 on itch.io");
  assert.equal(VOL1_ENTRY_LINK_LABEL, "In the Giants Bestiary Vol. 1");
  assert.ok(!/playtest/i.test(read("src/lib/bestiary.ts")));
});

test("Vol. 1 has twelve catalogue slugs, none held or never-open", () => {
  assert.equal(VOL1_SLUGS.length, 12);
  assert.equal(new Set(VOL1_SLUGS).size, 12);
  for (const slug of VOL1_SLUGS) {
    const entry = bySlug.get(slug);
    assert.ok(entry, `missing catalogue entry for slug ${slug}`);
    assert.equal(isCatalogueHeld(slug), false, `${slug} is on the hold list`);
    assert.equal(isNeverOpen(slug), false, `${slug} is never-open`);
    assert.equal(isInBestiaryVol1(slug), true);
    assert.ok(!CATALOGUE_HOLD_SLUGS.includes(slug), `${slug} in CATALOGUE_HOLD_SLUGS`);
    assert.ok(!NEVER_OPEN_SLUGS.includes(slug), `${slug} in NEVER_OPEN_SLUGS`);
  }
  assert.equal(isInBestiaryVol1("ymir"), false);
  assert.equal(isInBestiaryVol1("polyphemus"), false);
});

test("entry pages and sample spots use the central URL and slug list", () => {
  const entryPage = read("src/app/giants/[slug]/page.tsx");
  assert.ok(entryPage.includes("BestiaryVol1EntryLink"));
  assert.ok(entryPage.includes("<BestiaryVol1EntryLink slug={giant.slug} />"));

  const parts = read("src/components/BestiaryParts.tsx");
  assert.ok(parts.includes("href={ITCH_URL}"));
  assert.ok(parts.includes("{VOL1_ENTRY_LINK_LABEL}"));
  assert.ok(parts.includes("isInBestiaryVol1(slug)"));
  assert.ok(parts.includes('rel="noopener"'));
  assert.ok(parts.includes('target="_blank"'));
  assert.ok(!/playtest/i.test(parts));

  const bestiaryPage = read("src/app/bestiary/page.tsx");
  assert.ok(bestiaryPage.includes("href={ITCH_URL}"));
  assert.ok(bestiaryPage.includes("{ITCH_BUY_LABEL}"));
  assert.ok(bestiaryPage.includes('rel="noopener"'));
  assert.ok(bestiaryPage.includes('target="_blank"'));

  const sample = read("src/app/bestiary/free-sample/page.tsx");
  assert.ok(sample.includes("href={SAMPLE_ITCH_URL}"));
  assert.ok(sample.includes("href={ITCH_URL}"));
  assert.ok(sample.includes("{ITCH_BUY_LABEL}"));

  const home = read("src/app/page.tsx");
  assert.ok(home.includes("/bestiary/free-sample"));
  assert.ok(home.includes("href={ITCH_URL}"));
  assert.ok(home.includes("{ITCH_BUY_LABEL}"));
  assert.ok(home.includes("{ITCH_HERO_BUY_LABEL}"));
  assert.ok(home.includes('rel="noopener"'));
  assert.ok(home.includes('target="_blank"'));
  const heroIdx = home.indexOf("{ITCH_HERO_BUY_LABEL}");
  const toolsIdx = home.indexOf("{ITCH_BUY_LABEL}");
  const catalogueIdx = home.indexOf("Enter the Catalogue");
  assert.ok(catalogueIdx !== -1 && heroIdx !== -1 && toolsIdx !== -1);
  assert.ok(catalogueIdx < heroIdx, "hero button sits below the main CTA");
  assert.ok(heroIdx < toolsIdx, "Tools strip link is kept in addition to the hero button");
});
