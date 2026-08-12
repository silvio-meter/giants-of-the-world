/**
 * Shared math behind every "how tall is that, really" visual on the site —
 * originally written once for the per-giant Scale feature (giant vs. an
 * average human), reused here for the Compare tool (giant vs. giant).
 *
 * Kept framework-free and side-effect-free so both a React component and the
 * export-to-image renderer can call it without pulling in JSX.
 */

export const HUMAN_HEIGHT_M = 1.75;

/**
 * Fallback axis when a caller does not pass the tallest figure in view.
 * Cosmic / mountain entries sit at or above this; shorter champions must
 * not be drawn against it or a 2.9 m figure becomes a stub.
 */
export const CHART_CAP_M = 12;

/**
 * Axis for the figures currently on the chart: the tallest positive
 * height. Each chart scales to its own pair so Goliath vs a human fills
 * the card, while Ymir vs a human still fills it from the other end.
 */
export function chartScaleToM(
  ...meters: Array<number | null | undefined>
): number {
  let tallest = 0;
  for (const value of meters) {
    if (typeof value === "number" && Number.isFinite(value) && value > tallest) {
      tallest = value;
    }
  }
  return tallest > 0 ? tallest : CHART_CAP_M;
}

/**
 * Proportional bar height in pixels for a given real height, within a chart
 * of `chartPx` tall. `scaleToM` is the height that should fill the chart
 * (usually `chartScaleToM(...)` of everyone drawn). Never below `minPx`,
 * so a short figure next to a cosmic one stays visible.
 */
export function barHeightPx(
  meters: number,
  chartPx: number,
  minPx = 28,
  scaleToM = CHART_CAP_M
): number {
  const cap = Math.max(scaleToM, Number.EPSILON);
  const used = Math.min(Math.max(meters, 0), cap);
  return Math.max(minPx, (used / cap) * chartPx);
}

/** "~12 m" for anything at or above 10 m, "~4.5 m" below. Matches how tradition-scale heights read. */
export function formatMeters(meters: number): string {
  return `~${meters >= 10 ? Math.round(meters) : meters.toFixed(1)} m`;
}
