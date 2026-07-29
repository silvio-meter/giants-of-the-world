/**
 * Pure geometry helpers for the map's motif-connection lines and density
 * overlay. Take plain point/giant arrays rather than importing the catalog,
 * so these stay callable from a client component (GiantsMap.tsx) without
 * pulling `@/lib/giants` — or anything that transitively imports it, like
 * `@/lib/motifs` — into the browser bundle.
 */

export interface MotifChain {
  key: string;
  points: [number, number][];
}

/**
 * For each motif carried by two or more of the given (located) giants, a
 * chain connecting them in the order given — not every pairwise edge, which
 * would turn a five-giant motif into ten crossing lines instead of four.
 */
export function motifChains(
  giants: { motifs?: string[]; coordinates: [number, number] | null }[]
): MotifChain[] {
  const byMotif = new Map<string, [number, number][]>();
  for (const g of giants) {
    if (!g.coordinates) continue;
    for (const key of g.motifs ?? []) {
      const points = byMotif.get(key) ?? [];
      points.push(g.coordinates);
      byMotif.set(key, points);
    }
  }
  return [...byMotif.entries()]
    .filter(([, points]) => points.length >= 2)
    .map(([key, points]) => ({ key, points }));
}

export interface DensityCell {
  center: [number, number];
  count: number;
}

/**
 * Bins points into coarse lat/lng cells and returns each cell's centroid and
 * count — a cheap stand-in for a real heatmap library, rendered as soft
 * glowing circles rather than a legend-driven dashboard.
 */
export function densityCells(
  points: [number, number][],
  cellDeg = 12
): DensityCell[] {
  const buckets = new Map<string, { sum: [number, number]; count: number }>();
  for (const [lat, lng] of points) {
    const key = `${Math.floor(lat / cellDeg)}:${Math.floor(lng / cellDeg)}`;
    const bucket = buckets.get(key) ?? { sum: [0, 0], count: 0 };
    bucket.sum = [bucket.sum[0] + lat, bucket.sum[1] + lng];
    bucket.count += 1;
    buckets.set(key, bucket);
  }
  return [...buckets.values()].map((b) => ({
    center: [b.sum[0] / b.count, b.sum[1] / b.count],
    count: b.count,
  }));
}
