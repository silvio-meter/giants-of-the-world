// Compare suggestions never feature a held or never-open entry (dzunukwa).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATALOGUE_HOLD_SLUGS,
  NEVER_OPEN_SLUGS,
  isNeverOpen,
  isSuggestableCompareTarget,
} from "../src/lib/catalogue-hold.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

test("never-open and held slugs are not suggestable compare targets", () => {
  assert.ok(isNeverOpen("dzunukwa"));
  for (const s of [...NEVER_OPEN_SLUGS, ...CATALOGUE_HOLD_SLUGS]) {
    assert.equal(isSuggestableCompareTarget(s), false, s);
  }
  assert.equal(isSuggestableCompareTarget("si-te-cah"), true);
  assert.equal(isSuggestableCompareTarget("ymir"), true);
});

test("Session Prep pair, giant-page vs list, picker and /compare all filter", () => {
  const prep = read("src/lib/session-prep.ts");
  assert.match(prep, /preferred && isSuggestableCompareTarget\(preferred\)/);
  assert.match(prep, /related\.find\(\(r\) => isSuggestableCompareTarget\(r\.slug\)/);
  const page = read("src/app/giants/[slug]/page.tsx");
  assert.ok(page.includes("related.filter((r) => isSuggestableCompareTarget(r.slug))"));
  assert.ok(page.includes("compareTargets.slice(0, 4).map("));
  assert.ok(!page.includes("related.slice(0, 4).map("));
  assert.ok(read("src/lib/giants.ts").includes(".filter((g) => !isNeverOpen(g.slug))"));
  const cmp = read("src/app/compare/page.tsx");
  assert.ok(cmp.includes("sp.a && !isNeverOpen(sp.a)"));
  assert.ok(cmp.includes("sp.b && !isNeverOpen(sp.b)"));
});

test("dzunukwa: noindex, no image, not in the sitemap", () => {
  const page = read("src/app/giants/[slug]/page.tsx");
  assert.ok(page.includes("...(isNeverOpen(giant.slug) ? { robots: { index: false, follow: false } } : {}),"));
  for (const p of ["src/data/giants.json", "src/data/giants.public.json"]) {
    const dz = JSON.parse(read(p)).find((g) => g.slug === "dzunukwa");
    assert.ok(dz, p);
    assert.ok(!("image" in dz) && !("imageAlt" in dz), `${p}: dzunukwa still has an image`);
  }
  assert.ok(read("src/app/sitemap.ts").includes(".filter((g) => !isCatalogueHeld(g.slug))"));
});

test("dzunukwa share card is the generic site card", () => {
  const og = read("src/app/giants/[slug]/opengraph-image.tsx");
  assert.equal((og.match(/isNeverOpen\(slug\) \? undefined : getGiantBySlug\(slug\)/g) ?? []).length, 2);
});
