/**
 * Plain, already-resolved motif data.
 *
 * Lives apart from lib/motifs because that module imports the catalog. A
 * client component that touches it drags 55 KB of JSON into the browser —
 * which is exactly the regression this type exists to prevent.
 */
export interface ResolvedMotif {
  key: string;
  name: string;
  blurb: string;
  /** Other giants carrying this motif, cross-culture first. */
  others: { slug: string; name: string; culture: string }[];
}
