/**
 * Shared math behind every "how tall is that, really" visual on the site —
 * originally written once for the per-giant Scale feature (giant vs. an
 * average human), reused here for the Compare tool (giant vs. giant).
 *
 * Kept framework-free and side-effect-free so both a React component and the
 * export-to-image renderer can call it without pulling in JSX.
 */

export const HUMAN_HEIGHT_M = 1.75;

/** Above this, further height stops being visually meaningful — mythic scale compresses. */
const CHART_CAP_M = 12;

/**
 * Proportional bar height in pixels for a given real height, within a chart
 * of `chartPx` tall. Never below `minPx`, so short entries stay visible
 * rather than collapsing to a sliver.
 */
export function barHeightPx(
  meters: number,
  chartPx: number,
  minPx = 28
): number {
  const capped = Math.min(meters, CHART_CAP_M);
  return Math.max(minPx, (capped / CHART_CAP_M) * chartPx);
}

/** "~12 m" for anything at or above 10 m, "~4.5 m" below — matches how tradition-scale heights read. */
export function formatMeters(meters: number): string {
  return `~${meters >= 10 ? Math.round(meters) : meters.toFixed(1)} m`;
}
