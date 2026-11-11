/**
 * Height display rules, shared by the entry page, the size chart and Compare.
 * No imports, so node --test can load it directly.
 *
 * heightMeters is set only where a source states a measure in a unit (see
 * estimateMeters in scripts/build-data.mjs). Everything else shows
 * NO_MEASURED_HEIGHT instead of a chart. A figure from a tale is labelled
 * "as told in [source]"; it is a story's number, not a measurement.
 */
export const NO_MEASURED_HEIGHT = "No measured height in the sources.";

export type HeightAlt = {
  /** The other tradition's wording, e.g. "Four cubits and a span". */
  height: string;
  /** Where that reading comes from, e.g. "the LXX and 4QSam(a)". */
  source: string;
  /** Both readings with their sources, shown wherever the chart is. */
  note: string;
  meters: number | null;
};

export function toldIn(source: string | null | undefined): string | null {
  return source ? `as told in ${source}` : null;
}

