/**
 * Data integrity guard. Runs in CI so a bad entry fails the build instead of
 * turning into a 404 (or a lore leak) in production.
 *
 * Run: npm test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { splitMaster } from "./build-data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));

const master = read("src/data/giants.json");
const publicEntries = read("src/data/giants.public.json");
const lore = read("src/data/giants.lore.json");
const findings = read("src/data/findings.json");

test("generated files are in sync with the master", () => {
  const { publicEntries: expectedPublic, lore: expectedLore } =
    splitMaster(master);
  assert.deepEqual(
    publicEntries,
    expectedPublic,
    "giants.public.json is stale — edit src/data/giants.json and run `npm run build:data`"
  );
  assert.deepEqual(
    lore,
    expectedLore,
    "giants.lore.json is stale — edit src/data/giants.json and run `npm run build:data`"
  );
});

test("public catalog carries no lore (paywall guard)", () => {
  for (const giant of publicEntries) {
    assert.ok(
      !("fullDescription" in giant),
      `${giant.slug} leaks fullDescription into the client catalog`
    );
    assert.ok(
      !("mysteryNote" in giant),
      `${giant.slug} leaks mysteryNote into the client catalog`
    );
  }
});

test("every entry has lore and every lore entry has a page", () => {
  const slugs = publicEntries.map((g) => g.slug);
  for (const slug of slugs) {
    assert.ok(lore[slug], `${slug} has no lore — its page would 404`);
    assert.ok(
      lore[slug].fullDescription?.trim(),
      `${slug} has an empty fullDescription`
    );
  }
  for (const slug of Object.keys(lore)) {
    assert.ok(slugs.includes(slug), `lore for unknown slug: ${slug}`);
  }
});

test("ids and slugs are unique", () => {
  const ids = publicEntries.map((g) => g.id);
  const slugs = publicEntries.map((g) => g.slug);
  assert.equal(new Set(ids).size, ids.length, "duplicate id");
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
});

test("related references resolve", () => {
  const ids = new Set(publicEntries.map((g) => g.id));
  for (const giant of publicEntries) {
    for (const ref of giant.related) {
      assert.ok(ids.has(ref), `${giant.slug} points at unknown giant "${ref}"`);
    }
  }
});

test("images exist on disk", () => {
  for (const giant of publicEntries) {
    assert.ok(giant.image, `${giant.slug} has no image path`);
    assert.ok(
      existsSync(join(root, "public", giant.image)),
      `${giant.slug}: missing ${giant.image}`
    );
    assert.ok(giant.imageAlt?.trim(), `${giant.slug} has no imageAlt`);
  }
});

test("coordinates are plausible", () => {
  for (const giant of publicEntries) {
    if (giant.coordinates === null) continue;
    const [lat, lon] = giant.coordinates;
    assert.ok(lat >= -90 && lat <= 90, `${giant.slug}: bad latitude ${lat}`);
    assert.ok(lon >= -180 && lon <= 180, `${giant.slug}: bad longitude ${lon}`);
  }
});

test("types are from the known set", () => {
  const known = new Set([
    "primordial",
    "race",
    "individual",
    "folklore",
    "modern-legend",
    "tall-tale",
  ]);
  for (const giant of publicEntries) {
    assert.ok(known.has(giant.type), `${giant.slug}: unknown type ${giant.type}`);
  }
});

test("free entries exist and are a minority", () => {
  const free = publicEntries.filter((g) => g.freeEntry);
  assert.ok(free.length > 0, "no free entries — nothing for search engines");
  assert.ok(
    free.length < publicEntries.length / 2,
    "more than half the codex is free — the paywall is not doing much"
  );
});

test("findings reference real giants", () => {
  const slugs = new Set(publicEntries.map((g) => g.slug));
  for (const finding of findings) {
    if (!finding.relatedGiantSlug) continue;
    assert.ok(
      slugs.has(finding.relatedGiantSlug),
      `finding "${finding.id}" points at unknown giant "${finding.relatedGiantSlug}"`
    );
  }
});
