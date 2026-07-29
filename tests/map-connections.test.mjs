import test from "node:test";
import assert from "node:assert/strict";

import { motifChains, densityCells } from "../src/lib/map-connections.ts";

test("motifChains only includes motifs carried by two or more located giants", () => {
  const giants = [
    { motifs: ["flood-survivor"], coordinates: [10, 10] },
    { motifs: ["flood-survivor"], coordinates: [20, 20] },
    { motifs: ["giant-slayer"], coordinates: [30, 30] },
  ];
  const chains = motifChains(giants);
  assert.equal(chains.length, 1);
  assert.equal(chains[0].key, "flood-survivor");
  assert.deepEqual(chains[0].points, [
    [10, 10],
    [20, 20],
  ]);
});

test("motifChains ignores giants without coordinates", () => {
  const giants = [
    { motifs: ["flood-survivor"], coordinates: [10, 10] },
    { motifs: ["flood-survivor"], coordinates: null },
  ];
  assert.deepEqual(motifChains(giants), []);
});

test("motifChains handles giants with no motifs field", () => {
  const giants = [{ coordinates: [10, 10] }, { coordinates: [20, 20] }];
  assert.deepEqual(motifChains(giants), []);
});

test("densityCells groups nearby points into one cell", () => {
  const cells = densityCells(
    [
      [10, 10],
      [11, 11],
      [50, 50],
    ],
    12
  );
  assert.equal(cells.length, 2);
  const populous = cells.find((c) => c.count === 2);
  assert.ok(populous);
  assert.equal(populous.center[0], 10.5);
  assert.equal(populous.center[1], 10.5);
});

test("densityCells returns nothing for an empty input", () => {
  assert.deepEqual(densityCells([], 12), []);
});
