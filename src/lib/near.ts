/**
 * Distance from a point to the catalogue, computed on the device.
 *
 * Deliberately free of any catalogue import. src/lib/giants.ts warns that
 * importing it pulls the whole JSON into whatever bundle references it, and
 * this module is meant for client components, so it takes its points as an
 * argument instead.
 *
 * The reader's position never leaves the browser: it is not sent to the
 * server, not put in the URL, and not recorded. That is why the arithmetic
 * lives here rather than in a route handler.
 */

/** The only fields /near needs. Anything more would ship the catalogue. */
export interface NearPoint {
  slug: string;
  name: string;
  culture: string;
  coordinates: [number, number];
  freeEntry: boolean;
  /** Carries `real-site-attached`: somewhere a reader could actually stand. */
  realSite: boolean;
}

export interface NearResult extends NearPoint {
  km: number;
}

export const RADII = [100, 300, 1000] as const;
export const DEFAULT_RADIUS = 300;

const EARTH_RADIUS_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function haversineKm(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number {
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Everything, nearest first. Filtering by radius is the caller's business. */
export function rankByDistance(
  origin: [number, number],
  points: NearPoint[]
): NearResult[] {
  return points
    .map((p) => ({ ...p, km: haversineKm(origin, p.coordinates) }))
    .sort((a, b) => a.km - b.km);
}

/**
 * Under 10 km a whole number reads as false precision for a tradition
 * attached to a hillside, so one decimal there and none above.
 */
export function formatKm(km: number): string {
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}

/** "Eleven traditions" reads better than "11 traditions" at small counts. */
const WORDS = [
  "No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve",
];
export function countWord(n: number): string {
  return n < WORDS.length ? WORDS[n] : String(n);
}
