/**
 * Unit tests for Codex Completion's pure logic. Takes giants/cultures as
 * parameters rather than importing the catalog directly, same reasoning as
 * verify-data.test.mjs reading JSON via fs instead of src/lib/giants.ts:
 * that module resolves "@/data/..." through Next's bundler, which plain
 * `node --test` cannot follow.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { fogBand, overallCompletion, completionByCulture } from "../src/lib/codex.ts";

const giants = [
  { slug: "a", culture: "Norse" },
  { slug: "b", culture: "Norse" },
  { slug: "c", culture: "Greek" },
  { slug: "d", culture: "Greek" },
];
const cultures = ["Norse", "Greek"];

test("fogBand picks the highest threshold cleared", () => {
  assert.equal(fogBand(0).label, "Unopened");
  assert.equal(fogBand(1).label, "Mist");
  assert.equal(fogBand(24).label, "Mist");
  assert.equal(fogBand(25).label, "Fog thinning");
  assert.equal(fogBand(50).label, "Half-lit");
  assert.equal(fogBand(75).label, "Nearly clear");
  assert.equal(fogBand(99).label, "Nearly clear");
  assert.equal(fogBand(100).label, "Fully revealed");
});

test("overallCompletion counts discovered giants against the full catalog", () => {
  assert.deepEqual(overallCompletion(giants, new Set()), {
    discovered: 0,
    total: 4,
    percent: 0,
  });
  assert.deepEqual(overallCompletion(giants, new Set(["a", "c"])), {
    discovered: 2,
    total: 4,
    percent: 50,
  });
  assert.deepEqual(
    overallCompletion(giants, new Set(["a", "b", "c", "d"])),
    { discovered: 4, total: 4, percent: 100 }
  );
});

test("overallCompletion ignores slugs outside the catalog", () => {
  const result = overallCompletion(giants, new Set(["a", "not-a-real-giant"]));
  assert.equal(result.discovered, 1);
});

test("overallCompletion handles an empty catalog without dividing by zero", () => {
  assert.deepEqual(overallCompletion([], new Set()), {
    discovered: 0,
    total: 0,
    percent: 0,
  });
});

test("completionByCulture buckets correctly and includes cultures with zero discoveries", () => {
  const result = completionByCulture(giants, cultures, new Set(["a"]));
  assert.deepEqual(result, [
    { culture: "Norse", discovered: 1, total: 2 },
    { culture: "Greek", discovered: 0, total: 2 },
  ]);
});
