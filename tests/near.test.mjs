/**
 * The arithmetic behind /near.
 *
 * Worth testing on its own because it runs in the browser, where nothing else
 * checks it, and because a distance that is quietly wrong looks exactly like a
 * distance that is right.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { haversineKm, rankByDistance, formatKm, countWord } from "../src/lib/near.ts";

const ZAGREB = [45.815, 15.982];
const KLEK = [45.43, 15.53];
const REYKJAVIK = [64.146, -21.94];

test("haversine agrees with known distances", () => {
  // Zagreb to Klek is about 55 km; allow a kilometre either way.
  assert.ok(Math.abs(haversineKm(ZAGREB, KLEK) - 55) < 2, `got ${haversineKm(ZAGREB, KLEK)}`);
  // Zagreb to Reykjavik is about 3000 km.
  const far = haversineKm(ZAGREB, REYKJAVIK);
  assert.ok(far > 2900 && far < 3150, `got ${far}`);
  assert.equal(haversineKm(ZAGREB, ZAGREB), 0);
});

test("distance is symmetric", () => {
  assert.equal(
    haversineKm(ZAGREB, REYKJAVIK).toFixed(6),
    haversineKm(REYKJAVIK, ZAGREB).toFixed(6)
  );
});

test("the antipodal case does not produce NaN", () => {
  // Math.sqrt of a value nudged above 1 by floating point would give NaN
  // without the clamp, and the bug would only ever show for one pair.
  const d = haversineKm([0, 0], [0, 180]);
  assert.ok(Number.isFinite(d), "distance is not finite");
  assert.ok(Math.abs(d - 20015) < 5, `got ${d}`);
});

test("ranking is nearest first and keeps every point", () => {
  const points = [
    { slug: "far", name: "Far", culture: "x", coordinates: REYKJAVIK, freeEntry: false, realSite: false },
    { slug: "near", name: "Near", culture: "y", coordinates: KLEK, freeEntry: true, realSite: true },
  ];
  const ranked = rankByDistance(ZAGREB, points);
  assert.deepEqual(ranked.map((r) => r.slug), ["near", "far"]);
  assert.equal(ranked.length, points.length, "ranking must not filter");
  assert.ok(ranked[0].realSite, "the carried fields must survive");
});

test("distances read at the precision they deserve", () => {
  assert.equal(formatKm(3.14159), "3.1 km");
  assert.equal(formatKm(84.4), "84 km");
  assert.equal(formatKm(1000), "1000 km");
});

test("small counts are words, large ones are numerals", () => {
  assert.equal(countWord(0), "No");
  assert.equal(countWord(11), "Eleven");
  assert.equal(countWord(40), "40");
});

test("next.config allows geolocation only on /near", () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const config = readFileSync(join(root, "next.config.ts"), "utf8");
  assert.ok(config.includes('source: "/near"'), "/near header source missing");
  assert.ok(
    config.includes("geolocation=(self)"),
    "/near must allow geolocation=(self)"
  );
  assert.ok(
    config.includes("camera=(), microphone=(), geolocation=(self), payment=()"),
    "camera/microphone/payment must stay disabled on /near"
  );
  assert.ok(
    config.includes("camera=(), microphone=(), geolocation=(), payment=()"),
    "everywhere else geolocation stays off"
  );
});
