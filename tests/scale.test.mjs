/**
 * Scale math for the per-entry chart and Compare. A 12 m cosmic cap used
 * as the axis made Goliath (2.9 m) and a human (1.75 m) into two stubs.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  CHART_CAP_M,
  HUMAN_HEIGHT_M,
  barHeightPx,
  chartScaleToM,
  formatMeters,
} from "../src/lib/scale.ts";

test("chartScaleToM uses the tallest figure on the chart", () => {
  assert.equal(chartScaleToM(2.9, HUMAN_HEIGHT_M), 2.9);
  assert.equal(chartScaleToM(30, HUMAN_HEIGHT_M), 30);
  assert.equal(chartScaleToM(2.9, 3), 3);
  assert.equal(chartScaleToM(null, undefined, 0, -1), CHART_CAP_M);
});

test("Goliath vs a human fills the card instead of sitting under a 12 m cap", () => {
  const chartPx = 168;
  const scaleTo = chartScaleToM(2.9, HUMAN_HEIGHT_M);
  const goliath = barHeightPx(2.9, chartPx, 20, scaleTo);
  const human = barHeightPx(HUMAN_HEIGHT_M, chartPx, 20, scaleTo);

  assert.equal(goliath, chartPx);
  assert.ok(
    human > chartPx * 0.55 && human < chartPx * 0.65,
    `human should be about 60% of Goliath, got ${human} of ${chartPx}`
  );
  assert.ok(
    goliath / human > 1.5,
    "the two bars must stay visually distinct, not two stubs of min-height"
  );
});

test("default barHeightPx still caps against 12 m for callers that omit scaleTo", () => {
  assert.equal(barHeightPx(12, 120), 120);
  assert.equal(barHeightPx(30, 120), 120);
  assert.equal(barHeightPx(6, 120), 60);
});

test("minPx keeps a short figure visible next to a cosmic one", () => {
  const chartPx = 160;
  const scaleTo = chartScaleToM(30, HUMAN_HEIGHT_M);
  const human = barHeightPx(HUMAN_HEIGHT_M, chartPx, 20, scaleTo);
  assert.equal(human, 20);
  assert.equal(barHeightPx(30, chartPx, 20, scaleTo), chartPx);
});

test("formatMeters keeps the one-decimal mythic read under 10 m", () => {
  assert.equal(formatMeters(2.9), "~2.9 m");
  assert.equal(formatMeters(1.75), "~1.8 m");
  assert.equal(formatMeters(12), "~12 m");
  assert.equal(formatMeters(30), "~30 m");
});
