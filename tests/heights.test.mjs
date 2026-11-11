/**
 * Heights only from sources (Product spec "Dopuna 15:36", 11 Nov 2026).
 * The size chart gets a number only where a source states a measure in a
 * unit; descriptive labels, claims and unverified reports give no chart.
 * Served checks run when BASE is set.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { estimateMeters } from "../scripts/build-data.mjs";
import { NO_MEASURED_HEIGHT, toldIn } from "../src/lib/height.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const master = JSON.parse(read("src/data/giants.json"));
const publicEntries = JSON.parse(read("src/data/giants.public.json"));
const bySlug = new Map(publicEntries.map((g) => [g.slug, g]));
const masterBySlug = new Map(master.map((g) => [g.slug, g]));

const NUMBER = "(\\d+(?:\\.\\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)";
const NUMERIC_MEASURE = new RegExp(`\\b${NUMBER}\\s*(cubits?|feet|foot|ft|m|metres?|meters?)\\b`, "i");

test("no entry whose height text has no numeric measure has heightMeters", () => {
  for (const g of publicEntries) {
    if (!NUMERIC_MEASURE.test(g.height ?? "")) {
      assert.equal(g.heightMeters, null, `${g.slug} (“${g.height}”) has heightMeters ${g.heightMeters}`);
    }
  }
});

test("descriptive words are not measurements", () => {
  for (const label of [
    "Giant", "Jötunn", "Cosmic", "Titanic", "Vast", "Mountain-vast (illusion)",
    "Cyclopean", "Gigantic", "Colossal", "Grew to cosmic size", "the mountain",
    "Spirit-giant", "Ancestral / giant scale", "Fomorian giant",
  ]) {
    assert.equal(estimateMeters(label), null, label);
  }
});

test("stated measures convert; claims, unverified reports and object sizes do not", () => {
  assert.equal(estimateMeters("About 18 feet (folklore)"), 5.5);
  assert.equal(estimateMeters("12 cubits (Geoffrey of Monmouth)"), 5.4);
  assert.equal(estimateMeters("up to 3 metres"), 3);
  assert.equal(estimateMeters("Six cubits and a span"), 2.9);
  assert.equal(estimateMeters("Four cubits and a span"), 2);
  assert.equal(estimateMeters("Reports claim ~12–15 feet (unverified)"), null);
  assert.equal(estimateMeters("claimed 12 to 15 feet; measured 5 ft 9 in"), null);
  assert.equal(estimateMeters("Implied by iron bed: ~9 cubits long"), null);
});

test("Patagonian giants and the Giant of Kandahar get no chart", () => {
  assert.equal(bySlug.get("patagonian-giants").heightMeters, null);
  assert.equal(bySlug.get("giant-of-kandahar").heightMeters, null);
  assert.equal(bySlug.get("guanche-giants").heightMeters, null);
});

test("Goliath: both textual traditions, with the note", () => {
  const g = bySlug.get("goliath");
  assert.equal(g.heightMeters, 2.9);
  assert.equal(g.heightSource, "the Masoretic text");
  assert.equal(g.heightAlt.meters, 2);
  assert.equal(g.heightAlt.source, "the LXX and 4QSam(a)");
  assert.equal(
    g.heightAlt.note,
    "Two traditions: the Masoretic text gives six cubits and a span (≈2.9 m); the LXX and 4QSam(a) give four cubits and a span (≈2.0 m)."
  );
  // Every surface that draws the chart carries the note.
  for (const f of [
    "src/components/SizeComparison.tsx",
    "src/components/CompareResults.tsx",
    "src/components/CompareExportCard.tsx",
  ]) {
    assert.ok(read(f).includes("heightAlt") && read(f).includes(".note"), `${f} drops the Goliath note`);
  }
});

test("every figure on the chart says where it was told, from the entry's own sources", () => {
  const measured = publicEntries.filter((g) => g.heightMeters !== null);
  assert.deepEqual(
    measured.map((g) => g.slug).sort(),
    ["cormoran", "gogmagog", "goliath", "ispolini"]
  );
  const expected = {
    cormoran: "English Fairy Tales (1890)",
    gogmagog: "Historia Regum Britanniae I.16",
    ispolini: "Българска митология",
  };
  for (const [slug, needle] of Object.entries(expected)) {
    const g = masterBySlug.get(slug);
    assert.ok(g.heightSource?.includes(needle), `${slug} heightSource`);
    assert.ok(
      g.sources.some((s) => s.includes(needle)),
      `${slug}: heightSource is not one of the entry's own sources`
    );
  }
  for (const g of measured) assert.ok(g.heightSource, `${g.slug} has no heightSource`);
  assert.equal(toldIn("X"), "as told in X");
});

test("null heights show the sentence, never a chart or 'beyond measurement'", () => {
  assert.equal(NO_MEASURED_HEIGHT, "No measured height in the sources.");
  for (const f of [
    "src/components/SizeComparison.tsx",
    "src/components/CompareResults.tsx",
    "src/components/CompareExportCard.tsx",
  ]) {
    const src = read(f);
    assert.ok(src.includes("{NO_MEASURED_HEIGHT}"), `${f} does not show the sentence`);
    assert.ok(!src.includes("Scale beyond measurement"), f);
  }
  assert.ok(read("src/components/SizeComparison.tsx").includes("if (!meters) {"));
  // Compare OG counts the same field.
  assert.ok(read("src/app/compare/opengraph-image.tsx").includes("filter((g) => g.heightMeters)"));
});

const BASE = process.env.BASE;
const skip = BASE ? false : "BASE not set";
const page = async (p) => (await fetch(BASE + p, { cache: "no-store" })).text();

test("served: Ymir shows no chart, Goliath shows both traditions", { skip }, async () => {
  const ymir = await page("/giants/ymir");
  assert.ok(ymir.includes(NO_MEASURED_HEIGHT));
  const goliath = await page("/giants/goliath");
  assert.ok(goliath.includes("as told in the Masoretic text"));
  assert.ok(goliath.includes("as told in the LXX and 4QSam(a)"));
  assert.ok(goliath.includes("Two traditions: the Masoretic text gives six cubits and a span"));
  const cormoran = await page("/giants/cormoran");
  assert.ok(cormoran.includes("as told in Joseph Jacobs, English Fairy Tales (1890)"));
});

test("served: compare follows the same rule", { skip }, async () => {
  const html = await page("/compare?a=ymir&b=goliath");
  assert.ok(html.includes(NO_MEASURED_HEIGHT));
  assert.ok(html.includes("as told in the Masoretic text"));
});
