export interface FogBand {
  label: string;
  description: string;
}

export interface CultureCompletion {
  culture: string;
  discovered: number;
  total: number;
}

/** The subset of a giant this module needs — kept slim so it stays testable without the catalog import. */
export interface CompletableGiant {
  slug: string;
  culture: string;
}

/**
 * Atmospheric completion bands, not levels or badges — a fog metaphor for
 * how much of the codex a reader has uncovered. Ordered low to high; the
 * highest band whose threshold the percent clears wins.
 */
const FOG_BANDS: { min: number; label: string; description: string }[] = [
  { min: 0, label: "Unopened", description: "The codex is closed. Nothing uncovered yet." },
  { min: 1, label: "Mist", description: "A few entries glimpsed through the fog." },
  { min: 25, label: "Fog thinning", description: "A quarter of the record uncovered." },
  { min: 50, label: "Half-lit", description: "More is known than unknown, now." },
  { min: 75, label: "Nearly clear", description: "The fog is mostly gone." },
  { min: 100, label: "Fully revealed", description: "Every giant in the codex, discovered." },
];

export function fogBand(percent: number): FogBand {
  const band = [...FOG_BANDS].reverse().find((b) => percent >= b.min) ?? FOG_BANDS[0];
  return { label: band.label, description: band.description };
}

export function overallCompletion(
  giants: CompletableGiant[],
  discoveredSlugs: Set<string>
): { discovered: number; total: number; percent: number } {
  const discovered = giants.filter((g) => discoveredSlugs.has(g.slug)).length;
  const total = giants.length;
  const percent = total === 0 ? 0 : Math.round((discovered / total) * 100);
  return { discovered, total, percent };
}

export function completionByCulture(
  giants: CompletableGiant[],
  cultures: string[],
  discoveredSlugs: Set<string>
): CultureCompletion[] {
  return cultures.map((culture) => {
    const inCulture = giants.filter((g) => g.culture === culture);
    return {
      culture,
      discovered: inCulture.filter((g) => discoveredSlugs.has(g.slug)).length,
      total: inCulture.length,
    };
  });
}
